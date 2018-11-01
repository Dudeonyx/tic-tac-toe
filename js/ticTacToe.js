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
  
})();

