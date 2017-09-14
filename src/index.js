import './index.scss';

const pageEl = document.getElementById('js-page');
const humanWinsEl = document.getElementById('js-human-wins');
const aiWinsEl = document.getElementById('js-ai-wins');

let state;
let map = [null, null, null, null, null, null, null, null, null];
let win;
const games = [];

const getAvailableFields = board => {
    const indexes = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            indexes.push(i);
        }
    }
    return indexes;
};

let HUMAN = 'X';
let AI = 'O';

function winning(board, player) {
    for (let i = 0; i <= 6; i = i + 3) {
        if (player === board[i] && player === board[i + 1] && player === board[i + 2]) {
            return true;
        }
    }
    for (let i = 0; i <= 2 ; i++) {
        if (player === board[i] && player === board[i + 3] && player === board[i + 6]) {
            return true;
        }
    }
    for (let i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
        if (player === board[i] && player === board[i + j] && player === board[i + 2 * j]) {
            return true;
        }
    }
    return false;
}

function miniMax(map, player) {
    const board = map.slice();
    const available = getAvailableFields(board);

    if (winning(board, HUMAN)) {
        return {
            score: -10
        };
    } else if (winning(board, AI)) {
        return {
            score: 10
        };
    } else if (available.length === 0) {
        return {
            score: 0
        };
    }

    const moves = [];
    for (let i = 0; i < available.length; i++) {
        const move = {};
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

const isGameFinished = board => {
    for (let i = 0; i <= 6; i = i + 3) {
        if (board[i] !== null && board[i] === board[i + 1] && board[i] === board[i + 2]) {
            state = board[i];
            win.push(i, i + 2);
            return true;
        }
    }
    for (let i = 0; i <= 2 ; i++) {
        if (board[i] !== null && board[i] === board[i + 3] && board[i] === board[i + 6]) {
            state = board[i];
            win.push(i, i + 6);
            return true;
        }
    }
    for (let i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
        if (board[i] !== null && board[i] === board[i + j] && board[i] === board[i + 2 * j]) {
            state = board[i];
            win.push(i, i + 2 * j);
            return true;
        }
    }
    for (let i = 0; i < 9 ; i++) {
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

const handleClick = (containerEl, el, index) => () => {
    if (map[index] !== null) return;
    el.classList.add(`field--${HUMAN}`);
    map[index] = HUMAN;

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

        if (state === 'X' || state === 'O') {
            containerEl.classList.add('container--win', `container--${win[0]}-${win[1]}`);
        }

        HUMAN = HUMAN === 'X' ? 'O' : 'X';
        AI = AI === 'X' ? 'O' : 'X';
        startGame();
    }
};

const getRandomNumber = max => Math.floor(Math.random() * max);

const getRandomPosition = (rows, cols) => {
    const y = getRandomNumber(rows);
    const x = getRandomNumber(cols);
    if (games.includes(`${y},${x}`)) {
        return getRandomPosition(rows, cols);
    }
    games.push(`${y},${x}`);
    return { y, x };
};

const startGame = () => {
    win = [];
    state = 'ongoing';
    map = [null, null, null, null, null, null, null, null, null];

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
    if (games.length === cols * rows) return;
    const position = getRandomPosition(rows, cols);

    containerEl.style.left = `${position.y * 150 + 120}px`;
    containerEl.style.top = `${position.x * 150 + 20}px`;
    containerEl.style.transform = `rotate(${Math.random() >= 0.5 ? '-' : ''}${Math.floor(Math.random() * 30)}deg)`;
    containerEl.classList.add(`ai-${AI}`);

    pageEl.appendChild(containerEl);

    if (AI === 'X') {
        makeAImove(containerEl);
    }
};

const handlePenMove = pen => ({ pageX, pageY }) => {
    pen.style.left = pageX + 'px';
    pen.style.top = pageY + 'px';
};

const penEl = document.getElementById('js-pencil');

pageEl.addEventListener('mousemove', handlePenMove(penEl));

startGame();
