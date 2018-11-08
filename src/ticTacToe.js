// eslint-disable-next-line import/no-unresolved
import myObject from '../../my-object';
// eslint-disable-next-line import/no-unresolved
import { myDOM } from '../../myDOM';

function createPlayers(mark = 'x') {
  const otherMark = mark === 'x' ? 'o' : 'x';
  return Object.freeze({
    [mark]: {
      name: 'Player One',
      mark,
    },
    [otherMark]: {
      name: 'Player Two',
      mark: otherMark,
    },
  });
}
const player = createPlayers();
let mark = 'x';
function toggleMark() {
  mark = mark === 'x' ? 'o' : 'x';
}

const gameBoard = (() => {
  const defaultBoardSize = 3;
  function createBoard(newBoardSize = defaultBoardSize) {
    // creates a 2D array = newBoardSize x newBoardSize
    const newBoard = [];
    for (let i = 0; i < newBoardSize; i += 1) {
      const subArray = [];
      for (let j = 0; j < newBoardSize; j += 1) {
        subArray.push('');
      }
      newBoard.push(subArray);
    }
    return newBoard;
  }

  let board = createBoard(defaultBoardSize);

  function reset() {
    board = createBoard(defaultBoardSize);
    mark = 'x';
    return board;
  }
  function checkForWinner() {
    // check diagonals
    for (let i = 0; i < defaultBoardSize; i += 2) {
      const diagonal = board[0][0 + i] + board[1][1] + board[2][2 - i];
      if (diagonal === 'xxx' || diagonal === 'ooo') return board[1][1];
    }
    // check rows
    for (let i = 0; i < defaultBoardSize; i += 1) {
      const row = board[i][0] + board[i][1] + board[i][2];
      if (row === 'xxx' || row === 'ooo') return board[i][2];
    }
    // check columns
    for (let i = 0; i < defaultBoardSize; i += 1) {
      const column = board[0][i] + board[1][i] + board[2][i];
      if (column === 'xxx' || column === 'ooo') return board[2][i];
    }
    return 'No Winner Yet!';
  }
  function setBoard({ newMark, row, column }) {
    if (board[row][column] === '') {
      board[row][column] = newMark;
      return checkForWinner();
    }
    return 'Invalid Move!!!';
  }
  function checkBoardCompletion() {
    const blankSpots = [];
    const check = board.every(subArr => subArr.every(element => element !== ''));
    board.forEach((subarr, i) => subarr.forEach((element, j) => {
      if (element === '') blankSpots.push([i, j]);
    }));
    const status = check ? 'Game Over!' : 'Continue!';
    return {
      status,
      blankSpots,
    };
  }
  return Object.freeze({
    setBoard,
    checkForWinner,
    reset,
    checkBoardCompletion,
    getBoard() {
      return myObject.copy(board, true);
    },
  });
})();


const displayController = (() => {
  const BOARD = myDOM.$()('#board');
  const currentMark = myDOM.$()('#current-mark');
  currentMark.textContent = mark;
  function updateDOMBoard(cellText, row, column) {
    const text = cellText;
    currentMark.textContent = mark;
    text.textContent = gameBoard.getBoard()[+row][+column];
  }

  const handler = (() => {
    const self = Object.freeze({
      x(...args) {
        // console.log(cellText);
        // eslint-disable-next-line no-unused-expressions
        args && updateDOMBoard(...args);
        const oldBoard = gameBoard.getBoard();
        gameBoard.reset();
        self.removeEventListens();
        myDOM.$()('#winner').textContent = `Congratulations: ${player.x.name} has won!!!`;
        return {
          winner: player.x.name,
          oldBoard,
        };
      },
      o(...args) {
        // console.log(cellText);
        // eslint-disable-next-line no-unused-expressions
        (args) && (updateDOMBoard(...args));
        const oldBoard = gameBoard.getBoard();
        gameBoard.reset();
        self.removeEventListens();
        myDOM.$()('#winner').textContent = `Congratulations: ${player.o.name} has won!!!`;
        return {
          winner: player.o.name,
          oldBoard,
        };
      },
      'No Winner Yet!': function noWinnerYet(...args) {
        return self[gameBoard.checkBoardCompletion().status](...args);
      },
      'Invalid Move!!!': () => false,
      'Continue!': (...args) => {
        toggleMark();
        updateDOMBoard(...args);
        setTimeout(self.autoTurn, 800);
      },
      autoTurn() {
        if (player[mark].name === 'Player Two') {
          const { blankSpots = [] } = gameBoard.checkBoardCompletion();
          const { length } = blankSpots;
          const [row, column] = blankSpots[Math.floor(Math.random() * length)];
          const setterObj = { newMark: mark, row, column };
          const setresponse = gameBoard.setBoard(setterObj);
          const cellText = myDOM.$(BOARD)(`[data-row='${row}'][data-column='${column}']>p`);
          self[setresponse](cellText, row, column);
        }
      },
      'Game Over!': (...args) => {
        toggleMark();
        updateDOMBoard(...args);
        self.removeEventListens();
        gameBoard.reset();
        myDOM.$()('#winner').textContent = 'GAME OVER!';
        return 'Game Over!';
      },
      clicks(evt) {
        if (mark === 'x') {
          const { cellText, row, column } = evt.target.myParams;
          const setterObj = { newMark: mark, row, column };
          const setresponse = gameBoard.setBoard(setterObj);
          self[setresponse](cellText, row, column);
        }
      },
      removeEventListens() {
        const cells = myDOM.$All()('[data-row]');
        cells.forEach((cell) => {
          cell.removeEventListener('click', self.clicks);
        });
      },
    });
    return self;
  })();

  function createDOMBoard(newBoardSize = 3) {
    BOARD.innerHTML = '';
    myDOM.$()('#winner').textContent = '';
    for (let i = 0; i < newBoardSize; i += 1) {
      const row = BOARD.appendChild(myDOM.$Create('div'));
      row.classList.add('col-12', 'row', 'board-row');
      for (let j = 0; j < newBoardSize; j += 1) {
        const cell = row.appendChild(myDOM.$Create('div'));
        const cellText = cell.appendChild(myDOM.$Create('p'));
        cell.classList.add('col-4', 'd-flex', 'border', 'cell', 'text-center', 'align-items-center', 'justify-content-center');
        cellText.classList.add('col', 'm-0', 'text-uppercase', 'display-4');
        cell.setAttribute('data-row', `${i}`);
        cell.setAttribute('data-column', `${j}`);
        cellText.textContent = gameBoard.getBoard()[i][j];
        cell.myParams = { cellText, row: i, column: j };
        cell.addEventListener('click', handler.clicks);
      }
    }
  }
  return {
    createDOMBoard,
  };
})();

displayController.createDOMBoard();
