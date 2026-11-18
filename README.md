# COFA 실전 연습실

KRAFTON COFA 대비를 위한 비공식 개발 과제입니다. [Cofa Probe의 공개 소개](https://www.getcofa.com/ko/probe)를 참고해 문제를 정의하고, AI와 협업해 구현하고, 테스트로 검증한 뒤 판단 근거를 설명하는 흐름을 연습하도록 구성했습니다.

## 시작하기

[연습실 열기](https://jaerrylee.github.io/krafton-cofa/)

VS Code와 Python 3.9 이상이 설치된 환경에서 저장소를 복제하세요.

```sh
git clone https://github.com/JaerryLee/krafton-cofa.git
cd krafton-cofa
pwd
```

1. 연습실의 **워크스페이스 설정**에 복제한 폴더의 절대 경로를 저장하세요. 위 예시에서는 `pwd`의 출력값을 입력하면 됩니다. Windows에서는 저장소 폴더의 경로를 입력하세요.
2. 과제를 선택하고 타이머를 시작한 뒤 **VS Code에서 열기**를 누르세요. 브라우저에서 외부 앱을 열기 위한 확인창이 뜨면 VS Code 열기를 승인하세요. 폴더를 직접 열려면 저장소 루트에서 `code exercises/match-leaderboard`처럼 실행하세요.
3. 열린 과제 폴더에서 `solution.py`를 구현하세요. VS Code에서 기존에 쓰던 AI 도구를 사용할 수 있습니다.
4. 명령 팔레트에서 **Tasks: Run Test Task**를 실행하거나, 과제 폴더의 터미널에서 `python3 -m unittest -v`를 실행하세요. Windows에서는 `py -3 -m unittest -v`를 사용할 수 있습니다. 첫 실행은 미구현 상태라 실패하는 것이 정상입니다.
5. 풀이 회고에 AI에게 맡긴 작업과 직접 수행한 검증을 적고, 완료로 표시하세요.

과제별 타이머, 완료 표시, 회고 메모, 워크스페이스 경로는 사용 중인 브라우저의 로컬 저장소에 보관합니다.

| 과제 | 권장 시간 | 공개 테스트 |
| --- | --- | --- |
| [게임 전적 집계](https://jaerrylee.github.io/krafton-cofa/#match-leaderboard) | 35분 | 8개 |
| [재고 예약](https://jaerrylee.github.io/krafton-cofa/#inventory-reservations) | 45분 | 8개 |

## 로컬에서 웹 실행

저장소 루트에서 아래 명령을 실행한 뒤 [http://127.0.0.1:8080](http://127.0.0.1:8080)을 여세요. 정적 파일은 `docs/`에 있으며 이 폴더를 다른 정적 웹 서버에 올려도 됩니다.

```sh
python3 -m http.server 8080 --directory docs --bind 127.0.0.1
```

## 과제 추가

`docs/exercises.json`에 기존 항목과 같은 형식으로 과제를 등록하세요. 같은 ID로 `exercises/<id>/`를 만들고 `solution.py`, `test_solution.py`, `.vscode/tasks.json`을 추가하면 됩니다. GitHub Pages는 `main` 브랜치의 `docs/`를 게시합니다.
