import '@babel/polyfill';
import './index.scss';

declare global {
  interface Window {
    requestIdleCallback: Function;
  }
}

const animationFrame = () =>
  new Promise(resolve => window.requestAnimationFrame(resolve));

const idle = () => new Promise(resolve => window.requestIdleCallback(resolve));

const getRandomNumber = (max: number) => Math.floor(Math.random() * max);

const getCssText = styles =>
  Object.entries(styles).reduce(
    (cssText, [property, value]) => `${cssText}${property}:${value};`,
    '',
  );

const pageEl = document.getElementById('js-page') as HTMLDivElement;
const humanWinsEl = document.getElementById('js-human-wins') as HTMLDivElement;
const aiWinsEl = document.getElementById('js-ai-wins') as HTMLDivElement;
const penEl = document.getElementById('js-pencil') as HTMLDivElement;

enum Player {
  X = 'X',
  O = 'O',
}

type Board = Array<null | Player>;

const getDefaultMap = (): Board => Array.apply(null, { length: 9 }).fill(null);

let state: Player | 'draw' | 'ongoing';
let map: Board = getDefaultMap();
let win;
const games = [];

const getAvailableFields = (board: Board) => {
  const indexes = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      indexes.push(i);
    }
  }
  return indexes;
};

let HUMAN: Player = Player.X;
let AI: Player = Player.O;

function winning(board: Board, player: Player): boolean {
  for (let i = 0; i <= 6; i = i + 3) {
    if (
      player === board[i] &&
      player === board[i + 1] &&
      player === board[i + 2]
    ) {
      return true;
    }
  }
  for (let i = 0; i <= 2; i++) {
    if (
      player === board[i] &&
      player === board[i + 3] &&
      player === board[i + 6]
    ) {
      return true;
    }
  }
  for (let i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
    if (
      player === board[i] &&
      player === board[i + j] &&
      player === board[i + 2 * j]
    ) {
      return true;
    }
  }
  return false;
}

type AImove = {
  index?: number;
  score: number;
};

function miniMax(map: Board, player: Player): AImove {
  const board: Board = map.slice();
  const available: number[] = getAvailableFields(board);

  if (winning(board, HUMAN)) {
    return {
      score: -10,
    };
  }

  if (winning(board, AI)) {
    return {
      score: 10,
    };
  }

  if (available.length === 0) {
    return {
      score: 0,
    };
  }

  const moves: AImove[] = [];
  for (let i = 0; i < available.length; i++) {
    const move: AImove = {
      index: 0,
      score: 0,
    };
    move.index = available[i];
    board[available[i]] = player;

    if (player === AI) {
      move.score = miniMax(board, HUMAN).score;
    } else {
      move.score = miniMax(board, AI).score;
    }
    board[available[i]] = null;
    moves.push(move);
  }

  let bestMove;
  if (player === AI) {
    let bestScore = -10000;
    for (let i = 0, l = moves.length; i < l; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0, l = moves.length; i < l; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

const isGameFinished = (board: Board) => {
  for (let i = 0; i <= 6; i = i + 3) {
    if (
      board[i] !== null &&
      board[i] === board[i + 1] &&
      board[i] === board[i + 2]
    ) {
      state = board[i];
      win.push(i, i + 2);
      return true;
    }
  }
  for (let i = 0; i <= 2; i++) {
    if (
      board[i] !== null &&
      board[i] === board[i + 3] &&
      board[i] === board[i + 6]
    ) {
      state = board[i];
      win.push(i, i + 6);
      return true;
    }
  }
  for (let i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
    if (
      board[i] !== null &&
      board[i] === board[i + j] &&
      board[i] === board[i + 2 * j]
    ) {
      state = board[i];
      win.push(i, i + 2 * j);
      return true;
    }
  }
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      return false;
    }
  }

  state = 'draw';
  return true;
};

const makeAImove = containerEl => {
  const AImove = miniMax(map, AI);
  map[AImove.index] = AI;
  if (AImove.index !== undefined) {
    containerEl.children[AImove.index].classList.add(`field--${AI}`);
  }
};

const handleClick = (containerEl, el, index) => async () => {
  if (map[index] !== null) return;

  await animationFrame();
  el.classList.add(`field--${HUMAN}`);
  map[index] = HUMAN;

  await idle();
  makeAImove(containerEl);

  if (isGameFinished(map)) {
    containerEl.classList.add('container--finished');
    const winEl = document.createElement('span');
    if (state === HUMAN) {
      humanWinsEl.appendChild(winEl);
    }

    if (state === AI) {
      aiWinsEl.appendChild(winEl);
    }

    if (state === Player.X || state === Player.O) {
      containerEl.classList.add(
        'container--win',
        `container--${win[0]}-${win[1]}`,
      );
    }

    [HUMAN, AI] = [AI, HUMAN];
    startGame();
  }
};

const getRandomPosition = (rows, cols) => {
  const y = getRandomNumber(rows);
  const x = getRandomNumber(cols);
  if (games.includes(`${y},${x}`)) {
    return getRandomPosition(rows, cols);
  }
  games.push(`${y},${x}`);
  return { y, x };
};

const clearPaper = () => {
  const boards = document.querySelectorAll('.container');
  for (const el of boards) {
    el.remove();
  }
  games.length = 0;
};

const startGame = async () => {
  win = [];
  state = 'ongoing';
  map = getDefaultMap();

  await animationFrame();
  const containerEl = document.createElement('div');
  containerEl.classList.add('container');

  for (let i = 0; i < 9; i++) {
    const fieldEl = document.createElement('span');
    fieldEl.classList.add('field');
    fieldEl.addEventListener('click', handleClick(containerEl, fieldEl, i));
    containerEl.appendChild(fieldEl);
  }

  const { width, height } = pageEl.getBoundingClientRect();
  const cols = ~~((height - 40) / 150);
  const rows = ~~((width - 60) / 150);
  if (games.length === cols * rows) clearPaper();
  const position = getRandomPosition(rows, cols);

  const styles = {
    left: `${position.y * 150 + 120}px`,
    top: `${position.x * 150 + 20}px`,
    transform: `rotate(${
      (Math.random() >= 0.5 ? -1 : 1) * getRandomNumber(30)
    }deg)`,
  };

  await animationFrame();
  containerEl.style.cssText = getCssText(styles);
  containerEl.classList.add(`ai-${AI}`);
  pageEl.appendChild(containerEl);

  if (AI === 'X') {
    await idle();
    await animationFrame();
    makeAImove(containerEl);
  }
};

const handlePenMove = pen => async ({ pageX, pageY }) => {
  await animationFrame();
  const styles = {
    left: `${pageX}px`,
    top: `${pageY}px`,
  };
  pen.style.cssText = getCssText(styles);
};

pageEl.addEventListener('mousemove', handlePenMove(penEl));
startGame();
