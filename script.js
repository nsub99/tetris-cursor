// 테트리스 보드 크기 (표준: 가로 10칸, 세로 20칸)
const COLS = 10;
const ROWS = 20;
const DROP_INTERVAL = 800;

// 삭제된 줄 수에 따른 점수 (1~4줄)
const LINE_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

// 테트로미노 블록 정의 (shape: 2차원 배열, 1 = 블록 칸)
const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "piece-i",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "piece-o",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "piece-t",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "piece-s",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "piece-z",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "piece-j",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "piece-l",
  },
};

// DOM 요소
const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const gameStatusElement = document.getElementById("game-status");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

// 게임 상태
let score = 0;
let board = [];
let currentPiece = null;
let cellElements = [];
let dropTimerId = null;
let isPlaying = false;
let isGameOver = false;

/**
 * CSS Grid 보드 DOM을 한 번만 생성하고 셀 참조를 저장합니다.
 */
function initBoardDOM() {
  boardElement.innerHTML = "";
  cellElements = [];

  for (let row = 0; row < ROWS; row++) {
    cellElements[row] = [];
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      boardElement.appendChild(cell);
      cellElements[row][col] = cell;
    }
  }
}

/**
 * 보드 데이터(2차원 배열)를 초기화합니다.
 * null = 빈 칸, 문자열 = 고정된 블록 색상 클래스
 */
function createBoardState() {
  board = Array.from({ length: ROWS }, function () {
    return Array(COLS).fill(null);
  });
}

/**
 * 새 테트로미노 블록을 생성합니다.
 * @param {string} [type] - 블록 종류 (I, O, T, S, Z, J, L). 생략 시 무작위.
 * @returns {{ type: string, shape: number[][], row: number, col: number, color: string }}
 */
function createPiece(type) {
  const types = Object.keys(PIECES);
  const pieceType = type || types[Math.floor(Math.random() * types.length)];
  const pieceDef = PIECES[pieceType];
  const shapeWidth = pieceDef.shape[0].length;

  return {
    type: pieceType,
    shape: pieceDef.shape.map(function (row) {
      return row.slice();
    }),
    row: 0,
    col: Math.floor((COLS - shapeWidth) / 2),
    color: pieceDef.color,
  };
}

/**
 * 블록이 (dx, dy)만큼 이동했을 때 유효한지 검사합니다.
 * @param {{ shape: number[][], row: number, col: number }} piece
 * @param {number} dx - 가로 이동량
 * @param {number} dy - 세로 이동량
 * @param {(string|null)[][]} matrix - 고정된 블록이 담긴 보드 배열
 * @returns {boolean}
 */
function canMove(piece, dx, dy, matrix) {
  const targetRow = piece.row + dy;
  const targetCol = piece.col + dx;
  const shape = piece.shape;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) {
        continue;
      }

      const boardRow = targetRow + r;
      const boardCol = targetCol + c;

      if (
        boardRow < 0 ||
        boardRow >= ROWS ||
        boardCol < 0 ||
        boardCol >= COLS
      ) {
        return false;
      }

      if (matrix[boardRow][boardCol] !== null) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 현재 블록을 보드에 고정합니다.
 */
function lockPiece() {
  const shape = currentPiece.shape;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) {
        continue;
      }

      const boardRow = currentPiece.row + r;
      const boardCol = currentPiece.col + c;
      board[boardRow][boardCol] = currentPiece.color;
    }
  }
}

/**
 * 현재 블록이 차지하는 보드 좌표 목록을 반환합니다.
 * @returns {{ row: number, col: number, color: string }[]}
 */
function drawPiece() {
  if (!currentPiece) {
    return [];
  }

  const cells = [];
  const shape = currentPiece.shape;
  const offsetRow = currentPiece.row;
  const offsetCol = currentPiece.col;
  const color = currentPiece.color;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) {
        continue;
      }

      const boardRow = offsetRow + r;
      const boardCol = offsetCol + c;

      if (
        boardRow >= 0 &&
        boardRow < ROWS &&
        boardCol >= 0 &&
        boardCol < COLS
      ) {
        cells.push({ row: boardRow, col: boardCol, color: color });
      }
    }
  }

  return cells;
}

/**
 * 보드 데이터와 현재 블록을 DOM에 반영합니다.
 */
function renderBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      setCellAppearance(row, col, board[row][col]);
    }
  }

  const pieceCells = drawPiece();
  for (let i = 0; i < pieceCells.length; i++) {
    const cell = pieceCells[i];
    setCellAppearance(cell.row, cell.col, cell.color);
  }
}

/**
 * 개별 셀의 표시 상태를 갱신합니다.
 */
function setCellAppearance(row, col, colorClass) {
  const cell = cellElements[row][col];
  cell.className = "cell";

  if (colorClass) {
    cell.classList.add("filled", colorClass);
  }
}

/**
 * 점수 표시를 갱신합니다.
 */
function updateScoreDisplay() {
  scoreElement.textContent = score;
}

/**
 * 게임 오버 메시지 표시를 갱신합니다.
 */
function updateGameStatusDisplay() {
  if (isGameOver) {
    gameStatusElement.textContent = "게임 오버";
    gameStatusElement.classList.add("game-over");
  } else {
    gameStatusElement.textContent = "";
    gameStatusElement.classList.remove("game-over");
  }
}

/**
 * 가득 찬 줄을 삭제하고 위 줄을 내립니다.
 * @returns {number} 삭제된 줄 수
 */
function clearLines() {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    const isFull = board[row].every(function (cell) {
      return cell !== null;
    });

    if (!isFull) {
      continue;
    }

    board.splice(row, 1);
    board.unshift(Array(COLS).fill(null));
    linesCleared += 1;
    row += 1;
  }

  return linesCleared;
}

/**
 * 삭제된 줄 수에 따라 점수를 증가시킵니다.
 * @param {number} linesCleared
 */
function addScore(linesCleared) {
  if (linesCleared <= 0) {
    return;
  }

  score += LINE_SCORES[linesCleared] || linesCleared * 100;
  updateScoreDisplay();
}

/**
 * 게임 오버 상태로 전환합니다.
 */
function triggerGameOver() {
  stopDropTimer();
  isGameOver = true;
  currentPiece = null;
  updateGameStatusDisplay();
}

/**
 * 자동 낙하 타이머를 시작합니다.
 */
function startDropTimer() {
  stopDropTimer();
  dropTimerId = setInterval(tickFall, DROP_INTERVAL);
  isPlaying = true;
}

/**
 * 자동 낙하 타이머를 중지합니다.
 */
function stopDropTimer() {
  if (dropTimerId !== null) {
    clearInterval(dropTimerId);
    dropTimerId = null;
  }
  isPlaying = false;
}

/**
 * 현재 블록을 보드에 고정하고, 줄 삭제·점수 반영 후 새 블록을 생성합니다.
 */
function lockPieceAndSpawn() {
  lockPiece();

  const linesCleared = clearLines();
  addScore(linesCleared);

  currentPiece = createPiece();

  if (!canMove(currentPiece, 0, 0, board)) {
    triggerGameOver();
  }
}

/**
 * shape를 시계 방향으로 90도 회전합니다.
 * @param {number[][]} shape
 * @returns {number[][]}
 */
function rotateShape(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated = Array.from({ length: cols }, function () {
    return Array(rows).fill(0);
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }

  return rotated;
}

/**
 * 충돌 판정을 통과할 때만 블록을 이동합니다.
 * @param {number} dx
 * @param {number} dy
 * @returns {boolean}
 */
function tryMovePiece(dx, dy) {
  if (!canMove(currentPiece, dx, dy, board)) {
    return false;
  }

  currentPiece.col += dx;
  currentPiece.row += dy;
  return true;
}

/**
 * 회전을 시도합니다. 충돌하면 shape를 원래대로 되돌립니다.
 * @returns {boolean}
 */
function tryRotatePiece() {
  const previousShape = currentPiece.shape;
  currentPiece.shape = rotateShape(previousShape);

  if (!canMove(currentPiece, 0, 0, board)) {
    currentPiece.shape = previousShape;
    return false;
  }

  return true;
}

/**
 * 한 칸 아래로 빠르게 내립니다.
 */
function softDrop() {
  if (tryMovePiece(0, 1)) {
    return;
  }

  lockPieceAndSpawn();
}

/**
 * 바닥 또는 고정 블록까지 즉시 낙하합니다.
 */
function hardDrop() {
  while (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  }

  lockPieceAndSpawn();
}

/**
 * 키보드 입력을 처리합니다. (document에 한 번만 등록)
 */
function handleKeyDown(event) {
  if (!isPlaying || !currentPiece || isGameOver) {
    return;
  }

  let handled = false;

  switch (event.code) {
    case "ArrowLeft":
      tryMovePiece(-1, 0);
      handled = true;
      break;
    case "ArrowRight":
      tryMovePiece(1, 0);
      handled = true;
      break;
    case "ArrowDown":
      softDrop();
      handled = true;
      break;
    case "ArrowUp":
      tryRotatePiece();
      handled = true;
      break;
    case "Space":
      hardDrop();
      handled = true;
      break;
    default:
      return;
  }

  if (handled) {
    event.preventDefault();
    renderBoard();
  }
}

/**
 * 키보드 이벤트를 한 번만 등록합니다.
 */
function initKeyboardControls() {
  document.addEventListener("keydown", handleKeyDown);
}

/**
 * 한 칸 아래로 이동을 시도합니다. 불가능하면 고정 후 새 블록을 생성합니다.
 */
function tickFall() {
  if (!currentPiece || isGameOver) {
    return;
  }

  if (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  } else {
    lockPieceAndSpawn();
  }

  renderBoard();
}

/**
 * 게임을 초기 상태로 되돌립니다.
 */
function resetGame() {
  stopDropTimer();
  isGameOver = false;
  score = 0;
  updateScoreDisplay();
  updateGameStatusDisplay();
  createBoardState();
  currentPiece = createPiece();
  renderBoard();
}

startBtn.addEventListener("click", function () {
  resetGame();
  startDropTimer();
});

restartBtn.addEventListener("click", function () {
  resetGame();
  startDropTimer();
});

// 페이지 로드 시 보드·블록·키보드 초기화 (낙하는 시작 버튼 클릭 후)
initBoardDOM();
initKeyboardControls();
createBoardState();
currentPiece = createPiece();
renderBoard();
updateScoreDisplay();
