import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen

from server import ROOT, load_dataset, make_handler


class StarterTests(unittest.TestCase):
    def test_sample_datasets_keep_input_order(self):
        for filename, first, last, count in (
            ("sample.json", "REQ-01", "REQ-02", 2),
            ("release-qa.json", "R-001", "R-006", 6),
            ("event-checkin.json", "L-001", "L-006", 6),
        ):
            with self.subTest(filename=filename):
                records = load_dataset(ROOT / "data" / filename)["records"]
                self.assertEqual((records[0]["id"], records[-1]["id"], len(records)), (first, last, count))

    def test_rejects_duplicate_record_ids(self):
        row = {"id": "1", "label": "요청", "detail": "샘플"}
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "bad.json"
            path.write_text(json.dumps({"title": "샘플", "records": [row, row]}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "Duplicate record id"):
                load_dataset(path)

    def test_http_page_and_sample_api(self):
        with ThreadingHTTPServer(("127.0.0.1", 0), make_handler(ROOT / "data" / "sample.json")) as server:
            thread = threading.Thread(target=server.serve_forever)
            thread.start()
            origin = f"http://127.0.0.1:{server.server_port}"
            try:
                with urlopen(origin + "/", timeout=3) as response:
                    self.assertIn(b"/api/records", response.read())
                with urlopen(origin + "/api/records", timeout=3) as response:
                    self.assertEqual(json.load(response)["records"][0]["id"], "REQ-01")
                with self.assertRaises(HTTPError) as missing:
                    urlopen(origin + "/missing", timeout=3)
                self.assertEqual(missing.exception.code, 404)
                missing.exception.close()
            finally:
                server.shutdown()
                thread.join()


if __name__ == "__main__":
    unittest.main()
