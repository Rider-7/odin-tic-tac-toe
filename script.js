// setupPlayers ->
// startGame ->

const gameboard = (() => {

    const board = (function createBoard() {
        const board = [];
        for(let i = 0; i < 9; i++) board.push('');
        return board;
    })();


    const getBoard = () => board;

    const printBoard = () => {
        console.log(board.slice(0,3));
        console.log(board.slice(3,6));
        console.log(board.slice(6,9));
    }

    const markCell = (marker, cell) => {
        board[cell] = marker;
    }
    
    const getLegalCells = () => {
        const legalCells =  [...board.entries()].filter((pair) => (pair[1] === ''));
        return legalCells.map((pair => pair[0]));
    }

    return {getBoard, printBoard, markCell, getLegalCells}
})();

const gameController = (() => {

    // Factory Function - Player
    const Player = (name, marker, type) => {
        return {name, marker, type};
    }

    // Factory Function - Computer Player extends Player
    const Computer = (marker) => {
        const {name, type} = Player('Computer', marker, 'computer');
        
        const randomSelection = () => {
            const legalCellsIdxs = gameboard.getLegalCells();
            const selection = legalCellsIdxs[Math.floor(Math.random() * (legalCellsIdxs.length))];
            console.log(legalCellsIdxs, selection);
            return selection;
        }
        return {name, marker, type, randomSelection}
    }

    // Factory Function - Human Player extends Player
    const Human = (name, marker) => {
        const {type} = Player(name, marker, 'human');
        return {name, marker, type}
    }

    const player1 = Human('Tom', 'X');
    const player2 = Computer('O');

    let activePlayer = (Math.round(Math.random())) ? player1 : player2;
    console.log(`${activePlayer.name} goes first!`); // debug

    const board = gameboard.getBoard();


    const playTurn = (cell) => {
        if (activePlayer.type === 'computer') gameboard.markCell(activePlayer.marker, activePlayer.randomSelection());
        if (activePlayer.type === 'human') gameboard.markCell(activePlayer.marker, cell);
        screenController.updateScreen();
        gameboard.printBoard(); // debug

        const gameStatus = getGameStatus();
        if(gameStatus === 'win') return console.log(`${activePlayer.name} wins!`); // debug
        if(gameStatus === 'draw') return console.log("Draw!"); // debug

        switchActivePlayer();
        if (activePlayer.type === 'computer') playTurn();
    };

    const switchActivePlayer = () => activePlayer = (activePlayer == player1) ? player2 : player1;

    const getActivePlayer = () => activePlayer;

    const getGameStatus = () => {

        const isRowWinner = (function validateRows() {
            for (let i = 0; i < 3; i++) {
                const arr = [board[0+(3*i)], board[1+(3*i)], board[2+(3*i)]];
                if (!(arr.includes('')) && (arr.every((marker) => marker === board[0+3*i]))) return true;
            }
        })();

        if (isRowWinner) return 'win';

        const isColumnWinner = (function validateColumns() {
            for (let i = 0; i < 3; i++) {
                const arr = [board[0+(1*i)], board[3+(1*i)], board[6+(1*i)]];
                if (!(arr.includes('')) && (arr.every((marker) => marker === board[0+(1*i)]))) return true;
            }
        })();

        if (isColumnWinner) return 'win';

        const isDiagonalWinner = (function validateDiagonals() {
            const leftDiag = [board[0], board[4], board[8]];
            const rightDiag = [board[2], board[4], board[6]];
            if (!(leftDiag.includes('')) && (leftDiag.every((marker) => marker === board[0]))) return true;
            if (!(rightDiag.includes('')) && (rightDiag.every((marker) => marker === board[2]))) return true;
        })();

        if (isDiagonalWinner) return 'win';

        const isDraw = (function validateDraw() {
            if (!board.includes('')) return true;
        })();
        
        if(isDraw) return 'draw';

        return 'in-play';
    }

    return {playTurn, getBoard: gameboard.getBoard, getActivePlayer};
})();

const screenController = (() => {

    const gameboardDiv = document.querySelector('.gameboard');

    // Create Tic-Tac-Toe HTML layout
    for (let i = 0; i < 9; i++) {
        const cellButton = document.createElement('button');
        cellButton.setAttribute('class', 'cell');
        cellButton.setAttribute('type', 'button');
        cellButton.dataset.index = i;
        gameboardDiv.appendChild(cellButton);
    }

    const updateScreen = () => {
        const board = gameController.getBoard();
        const cellDivs = [...document.querySelectorAll('.cell')];
        const boardMarkers = board.flat();

        cellDivs.forEach((cellDiv, i) => cellDiv.textContent = boardMarkers[i]);
        document.querySelector('.turn').textContent = gameController.getActivePlayer().name;
    };

    const gameboardClickHandler = (e) => {
        const Cell = e.target.dataset.index;
        if (!Cell) return;

        gameController.playTurn(Cell);
    }

    gameboardDiv.addEventListener('click', gameboardClickHandler);

    return {updateScreen};
})();