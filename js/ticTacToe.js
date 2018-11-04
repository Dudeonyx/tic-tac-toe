// window.addEventListener('load', () => {
const myDOM = (() => {
  function $(element = document) {
    return selector => element.querySelector(selector);
  }
  function $All(element = document) {
    return selector => element.querySelectorAll(selector);
  }
  function $Create(element) {
    return document.createElement(element);
  }
  return {
    $,
    $All,
    $Create,
  };
})();
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
let player = createPlayers();
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
  function setBoard({ mark, row, column }) {
    if (board[row][column] === '') {
      board[row][column] = mark;
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
      return board.slice();
    },
  });
})();

const handler = (() => Object.freeze({
  x() {
    const oldBoard = gameBoard.getBoard();
    gameBoard.reset();
    return {
      winner: player.x.name,
      oldBoard,
    };
  },
  o() {
    const oldBoard = gameBoard.getBoard();
    gameBoard.reset();
    return {
      winner: player.o.name,
      oldBoard,
    };
  },
  'No Winner Yet!': function noWinnerYet() {
    return this[gameBoard.checkBoardCompletion().status]();
  },
  'Invalid Move!!!': () => Error('Invalid Move!!!'),
  'Continue!': () => 'Continue!',
  'Game Over!': () => {
    gameBoard.reset();
    return 'Game Over!';
  },
}))();


const displayController = (() => {
  const BOARD = myDOM.$()('#board');
  const currentMark = myDOM.$()('#current-mark');
  currentMark.textContent = mark;
  function updateDOMBoard() {
    currentMark.textContent = mark;
    const cells = myDOM.$All()('[data-row]');
    cells.forEach((cell) => {
      const { row, column } = cell.dataset;
      // console.log({cell});
      const text = cell.firstChild;
      text.textContent = gameBoard.getBoard()[+row][+column];
    });
  }
  function createDOMBoard(newBoardSize = 3) {
    BOARD.innerHTML = '';
    for (let i = 0; i < newBoardSize; i += 1) {
      const row = BOARD.appendChild(myDOM.$Create('div'));
      row.classList.add('col-12', 'row', 'board-row');
      for (let j = 0; j < newBoardSize; j += 1) {
        const cell = row.appendChild(myDOM.$Create('div'));
        const cellText = cell.appendChild(myDOM.$Create('p'));
        cell.classList.add('col-4', 'd-flex', 'border', 'cell', 'text-center', 'align-items-center', 'justify-content-center');
        cellText.classList.add('col', 'm-0');
        cell.setAttribute('data-row', `${i}`);
        cell.setAttribute('data-column', `${j}`);
        cellText.textContent = gameBoard.getBoard()[i][j];
        cell.addEventListener('click', () => { // eslint-disable-line no-loop-func
          const setterObj = { mark, row: i, column: j };
          const setresponse = gameBoard.setBoard(setterObj);
          const reponse = handler[setresponse]();
          toggleMark();
          updateDOMBoard();
          // createDOMBoard();
        });
      }
    }
  }
  return {
    createDOMBoard,
  };
})();

displayController.createDOMBoard();
// });
