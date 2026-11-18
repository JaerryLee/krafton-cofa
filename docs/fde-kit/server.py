"""Run the local FDE starter with an interchangeable JSON dataset."""

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent


def load_dataset(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or not isinstance(payload.get("records"), list):
        raise ValueError("Expected an object with a records array")

    title = payload.get("title")
    context = payload.get("context", {})
    if not isinstance(title, str) or not title.strip() or not isinstance(context, dict):
        raise ValueError("Expected a non-empty title and an optional context object")

    seen_ids = set()
    for record in payload["records"]:
        if not isinstance(record, dict):
            raise ValueError("Every record must be an object")
        for field in ("id", "label", "detail"):
            value = record.get(field)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"Every record needs a non-empty string field: {field}")
        if record["id"] in seen_ids:
            raise ValueError(f'Duplicate record id: {record["id"]}')
        seen_ids.add(record["id"])
    return payload


def make_handler(data_path):
    class StarterHandler(BaseHTTPRequestHandler):
        def send_content(self, status, content, content_type):
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(content)

        def send_json(self, status, value):
            self.send_content(
                status,
                json.dumps(value, ensure_ascii=False).encode("utf-8"),
                "application/json; charset=utf-8",
            )

        def do_GET(self):
            route = urlsplit(self.path).path
            if route == "/":
                self.send_content(200, (ROOT / "dashboard.html").read_bytes(), "text/html; charset=utf-8")
            elif route == "/api/records":
                try:
                    dataset = load_dataset(data_path)
                except (OSError, ValueError) as error:
                    self.log_error("Could not load dataset: %s", error)
                    self.send_json(500, {"error": "샘플 데이터를 읽을 수 없습니다. 터미널의 로그를 확인하세요."})
                    return
                self.send_json(200, dataset)
            else:
                self.send_json(404, {"error": "경로를 찾을 수 없습니다."})

    return StarterHandler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, default=ROOT / "data" / "sample.json")
    parser.add_argument("--port", type=int, default=8090)
    args = parser.parse_args()
    try:
        load_dataset(args.data)
    except (OSError, ValueError) as error:
        parser.error(str(error))

    with ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(args.data)) as server:
        print(f"Open http://127.0.0.1:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
