import './index.scss';

const xWinsEl = document.getElementById('js-x-wins');
const oWinsEl = document.getElementById('js-o-wins');

let state;
let turn;
let map;
let win;
const games = [];

const isGameFinished = () => {
    // rows
    for (let i = 0; i <= 6; i = i + 3) {
        if (map[i] !== null && map[i] === map[i + 1] && map[i] === map[i + 2]) {
            state = map[i];
            win.push(i, i + 2);
            return true;
        }
    }

    // columns
    for (let i = 0; i <= 2 ; i++) {
        if (map[i] !== null && map[i] === map[i + 3] && map[i] === map[i + 6]) {
            state = map[i];
            win.push(i, i + 6);
            return true;
        }
    }

    // diagonals
    for (let i = 0, j = 4; i <= 2 ; i = i + 2, j = j - 2) {
        if (map[i] !== null && map[i] === map[i + j] && map[i] === map[i + 2 * j]) {
            state = map[i];
            win.push(i, i + 2 * j);
            return true;
        }
    }

    for (let i = 0; i < 9 ; i++) {
        if (map[i] === null) {
            return false;
        }
    }

    state = 'draw';
    return true;
};

const handleClick = (containerEl, el, index) => () => {
    if (map[index] !== null) return;
    el.classList.add(`field--${turn}`);
    map[index] = turn;
    turn = turn === 'X' ? 'O' : 'X';
    if (isGameFinished()) {
        const winEl = document.createElement('span');
        if (state === 'X') {
            xWinsEl.appendChild(winEl);
        }
        if (state === 'O') {
            oWinsEl.appendChild(winEl);
        }

        if (state === 'X' || state === 'O') {
            containerEl.classList.add('container--win', `container--${win[0]}-${win[1]}`);
        }
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
    turn = 'X';
    map = [null, null, null, null, null, null, null, null, null];

    const containerEl = document.createElement('div');
    containerEl.classList.add('container');

    for (let i = 0; i < 9; i++) {
        const fieldEl = document.createElement('span');
        fieldEl.classList.add('field');
        fieldEl.addEventListener('click', handleClick(containerEl, fieldEl, i));
        containerEl.appendChild(fieldEl);
    }


    const cols = ~~(window.innerHeight / 150);
    const rows = ~~(window.innerWidth / 150);
    const position = getRandomPosition(rows, cols);

    containerEl.style.left = `${position.y * 150}px`;
    containerEl.style.top = `${position.x * 150}px`;
    containerEl.style.transform = `rotate(${Math.random() >= 0.5 ? '-' : ''}${Math.floor(Math.random() * 30)}deg)`;

    document.body.appendChild(containerEl);
};

startGame();
