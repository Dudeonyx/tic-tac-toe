window.addEventListener('load', () => {
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
        return board.slice();
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

    const handler = (() => Object.freeze({
      x(...args) {
      // console.log(cellText);
        updateDOMBoard(...args);
        const oldBoard = gameBoard.getBoard();
        gameBoard.reset();
        removeEventListens();
        myDOM.$()('#winner').textContent = `Congratulations: ${player.x.name} has won!!!`;
        return {
          winner: player.x.name,
          oldBoard,
        };
      },
      o(...args) {
      // console.log(cellText);
        updateDOMBoard(...args);
        const oldBoard = gameBoard.getBoard();
        gameBoard.reset();
        removeEventListens();
        myDOM.$()('#winner').textContent = `Congratulations: ${player.o.name} has won!!!`;
        return {
          winner: player.o.name,
          oldBoard,
        };
      },
      'No Winner Yet!': function noWinnerYet(...args) {
        return this[gameBoard.checkBoardCompletion().status](...args);
      },
      'Invalid Move!!!': () => false,
      'Continue!': (...args) => {
        toggleMark();
        updateDOMBoard(...args);
      },
      'Game Over!': (...args) => {
        toggleMark();
        updateDOMBoard(...args);
        removeEventListens();
        gameBoard.reset();
        return 'Game Over!';
      },
    }))();
    function handleClicks(evt) {
      const { cellText, row, column } = evt.target.myParams;
      const setterObj = { newMark: mark, row, column };
      const setresponse = gameBoard.setBoard(setterObj);
      handler[setresponse](cellText, row, column);
    }
    function removeEventListens() {
      const cells = myDOM.$All()('[data-row]');
      cells.forEach((cell) => {
        cell.removeEventListener('click', handleClicks);
      });
    }
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
          cellText.classList.add('col', 'm-0', 'text-uppercase');
          cell.setAttribute('data-row', `${i}`);
          cell.setAttribute('data-column', `${j}`);
          cellText.textContent = gameBoard.getBoard()[i][j];
          cell.myParams = { cellText, row: i, column: j };
          cell.addEventListener('click', handleClicks);
        /* () => { // eslint-disable-line no-loop-func
          const setterObj = { newMark: mark, row: i, column: j };
          const setresponse = gameBoard.setBoard(setterObj);
          const handlerResponse = handler[setresponse](cellText, i, j);
          // createDOMBoard();
        } );// */
        // console.log({ cell });
        }
      }
    }
    return {
      createDOMBoard,
    };
  })();

  displayController.createDOMBoard();
});
