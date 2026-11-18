# FDE 준비 키트

코파톤과 유사한 실무형 평가를 대비하는 로컬 연습 자료입니다. [FDE 모의시험](https://jaerrylee.github.io/krafton-cofa/fde.html)에서 실무자 답변을 확인하고, 이 폴더에서 범위를 합의한 후 구현하세요.

## 3분 시작

Python 3.9 이상과 VS Code를 준비하세요. 저장소를 이미 복제했다면 저장소 루트에서 `code docs/fde-kit`으로 열 수 있습니다. ZIP을 받았다면 압축을 풀고 `fde-kit` 폴더를 VS Code에서 여세요.

```sh
python3 -m unittest -v
python3 server.py
```

[http://127.0.0.1:8090](http://127.0.0.1:8090)에서 샘플 두 건을 보고 검색해 보세요. 포트를 바꿔야 하면 `python3 server.py --port 8091`을 실행하세요. 서버를 내릴 때는 실행한 터미널에서 Ctrl+C를 누르세요.

| 연습 | 키트 폴더에서 실행 |
| --- | --- |
| 게임 빌드 릴리스 점검 | `python3 server.py --data data/release-qa.json` |
| 팝업 행사 입장 대기열 | `python3 server.py --data data/event-checkin.json` |

서버 실행 후 환경 확인 명령은 `curl -f http://127.0.0.1:8090/api/records`입니다. Windows에서 Python 실행기가 `py`라면 `python3` 자리에 `py -3`를 사용하세요.

## 파일과 확장 방법

| 파일 | 용도 |
| --- | --- |
| `server.py` · `dashboard.html` | Python 표준 라이브러리 HTTP 서버와 검색 화면. 데이터 파일 하나를 브라우저까지 보내는 경로가 준비되어 있습니다. |
| `data/*.json` | 가상 입력. `context`는 공통 설정이고, `records`의 `id`는 표시용 행 ID입니다. 도메인의 중복 키는 과제의 규칙으로 정하세요. |
| `test_starter.py` | 데이터 읽기, 입력 순서, HTTP 진입점을 확인하는 시작 테스트 |
| [PLAYBOOK.md](PLAYBOOK.md) | 11월 21일까지 두 번의 리허설, 시간 배분, 낯선 IDE 환경 점검 |
| [WORKSHEET.md](WORKSHEET.md) | 합의문, 검증표, 변경 결정, 인수인계, 제출 및 사후 확인 양식 |
| [PROMPTS.md](PROMPTS.md) | 실무자 인터뷰부터 후속 세션까지 복사할 프롬프트 |
| [STARTERS.md](STARTERS.md) | 과제 조건에 맞춰 검토할 오픈소스와 도입 기준 |
| [REFERENCES.md](REFERENCES.md) | 후기와 공개 평가 자료에서 연습에 적용한 항목 |
| [AGENTS.md](AGENTS.md) | 새 AI 세션에 공통으로 줄 작업 지침 |

첫 변경의 단위는 **샘플 입력 하나 → 판정과 이유 → 화면에 근거 ID 표시**가 좋습니다. 승인한 도메인 규칙은 순수 함수로 만들고, 테스트에서 입력과 기대값을 고정하세요. 서버와 화면은 그 결과를 전달하는 좁은 인터페이스를 갖도록 설계하세요. 도메인 판정과 쓰기 작업은 과제에서 정의하고 구현할 부분입니다.

로컬 연습은 샘플에 들어 있는 가상 데이터로 진행하세요. 실제 시험에서 가져갈 수 있는 파일, AI 도구, 네트워크, 외부 코드는 시험 안내에 따르세요.
