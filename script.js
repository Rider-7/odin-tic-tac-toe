const gameboard = () => {

    const createBoard = () => {
        const board = [];
        for(let i = 0; i < 9; i++) board.push('');
        return board;
    };

    const getBoard = () => board;

    // debug
    const printBoard = () => {
        console.log(board.slice(0,3));
        console.log(board.slice(3,6));
        console.log(board.slice(6,9));
    };

    const markCell = (marker, cell) => {
        board[cell] = marker;
    };
    
    const getLegalCells = () => {
        const legalCells =  [...board.entries()].filter((pair) => (pair[1] === ''));
        return legalCells.map((pair => pair[0]));
    };

    const clearBoard = () => {
        board = createBoard();
    };

    let board = createBoard();

    return {getBoard, clearBoard, printBoard, markCell, getLegalCells}
};

const gameController = () => {
    
    // Factory Function - Player
    const Player = (name, marker, type) => {
        return {name, marker, type};
    }

    // Factory Function - Computer Player extends Player
    const Computer = (marker) => {
        const {name, type} = Player('Computer', marker, 'computer');
        
        const randomSelection = () => {
            const legalCellsIdxs = gameboardInstance.getLegalCells();
            const selection = legalCellsIdxs[Math.floor(Math.random() * (legalCellsIdxs.length))];
            // debug
            console.log(legalCellsIdxs, selection);
            return selection;
        }
        return {name, marker, type, randomSelection}
    }

    // Factory Function - Human Player extends Player
    const Human = (name, marker) => {
        const {type} = Player(name, marker, 'human');
        return {name, marker, type}
    };

    const playTurn = (cell) => {
        if (gameStatus != 'in-play') return;

        if (activePlayer.type === 'computer') gameboardInstance.markCell(activePlayer.marker, activePlayer.randomSelection(gameboardInstance));
        if (activePlayer.type === 'human') {
            legalCells = gameboardInstance.getLegalCells();
            if (!(legalCells.includes(cell))) return;
            gameboardInstance.markCell(activePlayer.marker, cell);
        }

        gameStatus = getGameStatus();
        switchActivePlayer();
        
        screenController.updateScreen(gameStatus);

        // debug
        console.log(gameStatus)
        gameboardInstance.printBoard();
    };

    const restartGame = () => {
        gameboardInstance.clearBoard();
        board = gameboardInstance.getBoard();
        gameStatus = 'in-play';
        activePlayer = (Math.round(Math.random())) ? player1 : player2;
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

    // Game Initialisation
    const gameboardInstance = gameboard();
    let board = gameboardInstance.getBoard();
    let gameStatus = 'in-play';
    const gameSelection = (() => prompt('Enter 1 for 2 Player PVP, or 2 to play against the computer:'))();
    const player1 = Human(prompt("Please enter Player 1's name:"), 'X');
    const player2 = (gameSelection === '1') ? Human(prompt("Please enter Player 2's name"), 'O') : Computer('O');
    let activePlayer = (Math.round(Math.random())) ? player1 : player2;



    return {playTurn, restartGame, getBoard: gameboardInstance.getBoard, getActivePlayer};
};

const screenController = (() => {

    const game = gameController();

    const gameDiv = document.querySelector('.game');
    const gameboardDiv = document.querySelector('.gameboard');
    const nextDiv = document.querySelector('.nav > .next');


    // Create Tic-Tac-Toe HTML layout
    for (let i = 0; i < 9; i++) {
        const cellButton = document.createElement('button');
        cellButton.setAttribute('class', 'cell');
        cellButton.setAttribute('type', 'button');
        cellButton.dataset.index = i;
        gameDiv.querySelector('.gameboard').appendChild(cellButton);
    }

    document.querySelector('.turn').textContent = game.getActivePlayer().name;

    const updateScreen = (gameStatus) => {

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();
        const cellDivs = [...document.querySelectorAll('.cell')];

        cellDivs.forEach((cellDiv, i) => cellDiv.textContent = board[i]);

        const playerTurnSpan = document.querySelector('.turn')

        if (gameStatus === 'win') playerTurnSpan.textContent = `${activePlayer.name} WINS!`;
        else if (gameStatus === 'draw') playerTurnSpan.textContent = `Draw!`;
        else playerTurnSpan.textContent = `${activePlayer.name}'S TURN!`;
    };

    const gameboardClickHandler = (e) => {
        if (e.target.dataset.index) game.playTurn(parseInt(e.target.dataset.index));
    }

    const navClickHandler = (e) => {
         game.restartGame();
         updateScreen();
    }

    gameboardDiv.addEventListener('click', gameboardClickHandler);
    nextDiv.addEventListener('click', navClickHandler);

    return {updateScreen};
});

const menuController = (() => {

    const getTemplate = (templateId) => {
                return document.getElementById(templateId);
        }

    const clickHandler = (e) => {
        e.preventDefault();

        const animationHandler = (e) => {
            const template = getTemplate(templateId);
            console.log(template, templateId)
            body.replaceChild(template.content.cloneNode(true),body.lastElementChild);
            const selectDivList = body.querySelectorAll('.select');
            selectDivList.forEach(optionDiv => optionDiv.addEventListener('click', clickHandler))
        }

        const templateId = e.currentTarget.dataset['templateId'];
        const mainDiv = body.querySelector('.menu');

        mainDiv.classList.remove('animate-left');
        void mainDiv.offsetWidth; // Trigger DOM reflow
        mainDiv.addEventListener('animationend', animationHandler);
        mainDiv.classList.add('animate-right-reverse');
    };

    const body = document.querySelector('body');

    (function initaliseController() {
        const template = getTemplate('main-menu-template');
        body.append(template.content.cloneNode(true));

        const selectDivList = body.querySelectorAll('.select');
        selectDivList.forEach(optionDiv => optionDiv.addEventListener('click', clickHandler))
    })();

})();