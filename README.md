# 테트리스 (교육용)

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 게임입니다.  
빌드 도구·번들러·외부 라이브러리 없이 **정적 파일 3개**로 동작하며, GitHub Pages에 바로 배포할 수 있습니다.

## 프로젝트 소개

| 항목 | 내용 |
|---|---|
| 목적 | 프론트엔드 입문자를 위한 순수 JS 게임 실습 |
| 기술 스택 | HTML5, CSS3 (Grid), Vanilla JavaScript |
| 보드 크기 | 10열 × 20행 (표준 테트리스) |
| 블록 종류 | I, O, T, S, Z, J, L (7종) |
| 의존성 | 없음 |

### 파일 구조

```
tetris-cursor/
├── index.html    # 페이지 구조
├── style.css     # 레이아웃·블록 색상
├── script.js     # 게임 로직
└── README.md     # 프로젝트 문서
```

## 실행 방법

### 로컬 실행

**방법 A — 파일 더블클릭**

1. `index.html`을 더블클릭합니다.
2. Chrome, Edge, Firefox 등에서 게임 화면이 열립니다.

**방법 B — 브라우저에서 직접 열기**

1. 브라우저에서 `Ctrl +  O` (Mac: `Cmd + O`)를 누릅니다.
2. `index.html`을 선택합니다.

**방법 C — Live Server (선택)**

VS Code / Cursor의 Live Server 확장으로 `index.html`을 열면 파일 저장 시 자동 새로고침됩니다.

### 온라인 실행 (GitHub Pages)

배포 후 아래 주소 형식으로 접속합니다.

```
https://<GitHub-사용자명>.github.io/<저장소-이름>/
```

## 조작법

**시작** 또는 **재시작** 버튼을 누른 뒤 키보드로 조작합니다.

| 키 | 동작 |
|---|---|
| `ArrowLeft` (←) | 왼쪽 이동 |
| `ArrowRight` (→) | 오른쪽 이동 |
| `ArrowDown` (↓) | 한 칸 빠르게 내리기 (soft drop) |
| `ArrowUp` (↑) | 블록 회전 (충돌 시 취소) |
| `Space` | 즉시 낙하 (hard drop) |

모든 조작은 `canMove()` 충돌 판정을 통과할 때만 적용됩니다.

## 구현 기능

- [x] 10×20 CSS Grid 게임 보드
- [x] 7종 테트로미노 블록 렌더링 (`createPiece`, `drawPiece`, `renderBoard`)
- [x] 자동 낙하 (800ms 간격, `setInterval` 중복 방지)
- [x] 충돌 판정 (`canMove`) — 벽·고정 블록·보드 밖 이동 차단
- [x] 키보드 조작 — 이동, 회전, soft/hard drop
- [x] 줄 삭제 — 가득 찬 가로 줄 제거 후 위 블록 하강
- [x] 점수 — 삭제 줄 수에 따라 가산 (아래 표 참고)
- [x] 게임 오버 — 새 블록 스폰 불가 시 종료, UI 메시지 표시
- [x] 재시작 — 보드·점수·타이머·상태 일괄 초기화

### 점수 규칙

| 삭제 줄 수 | 획득 점수 |
|---|---|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

### 게임 오버

블록을 고정한 뒤 새 블록을 스폰할 공간이 없으면 게임 오버입니다.  
**재시작** 또는 **시작** 버튼으로 다시 플레이할 수 있습니다.

## 품질 점검 방법

배포 전 아래 항목을 순서대로 확인합니다.

### 1. 리소스 로드 확인

1. 브라우저에서 게임을 엽니다.
2. `F12` → **Network** 탭 → 새로고침 (`F5`).
3. `index.html`, `style.css`, `script.js`가 **200** 상태로 로드되는지 확인합니다.

### 2. 콘솔 에러 확인

1. `F12` → **Console** 탭.
2. 페이지 로드 직후 빨간 에러가 없는지 확인합니다.
3. **시작** 클릭 → 키 조작 → **재시작** → 줄 삭제까지 진행하며 에러가 없는지 확인합니다.

### 3. 기능 체크리스트

| ID | 확인 항목 | 기대 결과 |
|---|---|---|
| Q-01 | 페이지 로드 | 10×20 빈 보드 + 위쪽 블록 1개 표시 |
| Q-02 | 시작 버튼 | 자동 낙하 시작 |
| Q-03 | ← → ↑ ↓ Space | 충돌 시에만 이동·회전·낙하 |
| Q-04 | 줄 삭제 | 가득 찬 줄 제거, 점수 증가 |
| Q-05 | 게임 오버 | 스폰 불가 시 "게임 오버" 표시, 조작·낙하 중지 |
| Q-06 | 재시작 | 보드·점수·상태 초기화, 낙하 재시작 |
| Q-07 | 타이머 중복 | 재시작 반복 시 낙하 속도 정상 유지 |

### 4. GitHub Pages 배포 후 확인

1. 배포 URL 접속.
2. Q-01 ~ Q-07을 동일하게 재검증합니다.
3. CSS·JS가 깨지지 않았는지(스타일·블록 색상·동작) 확인합니다.

## GitHub Pages 배포 방법

### 사전 조건

- GitHub 계정
- `index.html`, `style.css`, `script.js`가 **저장소 루트(최상위)** 에 있어야 합니다.
- `style.css`, `script.js`는 `index.html`과 **같은 폴더**에 두세요. (현재 상대 경로 연결)

> **주의:** 상위 폴더(`C:/DEV` 등) 전체를 하나의 저장소로 쓰는 경우, GitHub Pages는 기본적으로 **저장소 루트의 `index.html`** 만 제공합니다.  
> 이 프로젝트만 배포하려면 **별도 저장소**를 만들거나, 루트에 게임 파일을 두는 방식을 권장합니다.

### 배포 절차

**1. GitHub 저장소 생성**

1. GitHub에서 새 저장소(예: `tetris-cursor`)를 만듭니다.
2. Public으로 설정합니다. (Private도 Pages 가능하나 Free 플랜은 Public 권장)

**2. 파일 푸시**

```bash
git init
git add index.html style.css script.js README.md
git commit -m "feat: 테트리스 게임 초기 배포"
git branch -M main
git remote add origin https://github.com/<사용자명>/tetris-cursor.git
git push -u origin main
```

**3. GitHub Pages 활성화**

1. 저장소 → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **main**, Folder: **/ (root)** → **Save**
4. 1~2분 후 `https://<사용자명>.github.io/tetris-cursor/` 에서 확인

### 배포 시 포함·제외 파일

| 포함 (커밋) | 제외 (커밋하지 않음) |
|---|---|
| `index.html` | `.cursor/` (Cursor 에이전트·명령 설정) |
| `style.css` | `.vscode/` (에디터 개인 설정) |
| `script.js` | `node_modules/` (현재 미사용) |
| `README.md` | `.env`, API 키·비밀 파일 |
| `.gitignore` (선택, 권장) | OS 임시 파일 (`.DS_Store`, `Thumbs.db`) |

`.gitignore` 예시:

```gitignore
.cursor/
.vscode/
.DS_Store
Thumbs.db
```

## 라이선스

교육용 프로젝트입니다. 자유롭게 학습·수정·배포할 수 있습니다.
