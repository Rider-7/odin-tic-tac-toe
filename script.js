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

const gameController = (player1Name, player2Name, isVsCom) => {
    
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

    // TODO: Try to make gameStatus variable global within gameController.
    const playTurn = (cell) => {
        let gameStatus = getGameStatus();
        if (gameStatus != 'in-play') return gameStatus;

        if (activePlayer.type === 'computer') gameboardInstance.markCell(activePlayer.marker, activePlayer.randomSelection(gameboardInstance));
        if (activePlayer.type === 'human') {
            legalCells = gameboardInstance.getLegalCells();
            if (!(legalCells.includes(cell))) return;
            gameboardInstance.markCell(activePlayer.marker, cell);
        }
        gameStatus = getGameStatus();
        if (gameStatus == 'win') return gameStatus;
        switchActivePlayer();

        // debug
        console.log(gameStatus)
        gameboardInstance.printBoard();

        return gameStatus;
    };

    const restartGame = () => {
        gameboardInstance.clearBoard();
        board = gameboardInstance.getBoard();
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
    const player1 = Human(player1Name, 'X');
    console.log(isVsCom)//d
    const player2 = (isVsCom) ? Computer('O') : Human(player2Name, 'O');
    let activePlayer = (Math.round(Math.random())) ? player1 : player2;

    return {playTurn, restartGame, getBoard: gameboardInstance.getBoard, getActivePlayer};
};

const mainController = (() => {

    function startGame(player1Name, player2Name, isVsCom) {
        const gameDiv = document.querySelector('.game');
        const gameboardDiv = document.querySelector('.gameboard');
        const game = gameController(player1Name, player2Name, isVsCom);
    
        // Create Tic-Tac-Toe HTML layout
        for (let i = 0; i < 9; i++) {
            const cellButton = document.createElement('button');
            cellButton.setAttribute('class', 'cell');
            cellButton.setAttribute('type', 'button');
            cellButton.dataset.index = i;
            gameDiv.querySelector('.gameboard').appendChild(cellButton);
        }
    
        document.querySelector('.turn').textContent = `${game.getActivePlayer().name} GOES FIRST!`;
    
        const updateScreen = (gameStatus) => {
            console.log(gameStatus)
    
            const board = game.getBoard();
            const activePlayer = game.getActivePlayer();
    
            const cellDivs = [...document.querySelectorAll('.cell')];
            cellDivs.forEach((cellDiv, i) => cellDiv.textContent = board[i]);
    
            const playerTurnSpan = document.querySelector('.turn');
            if (gameStatus === 'win') playerTurnSpan.textContent = `${activePlayer.name} WINS!`;
            else if (gameStatus === 'draw') playerTurnSpan.textContent = `DRAW!`;
            else playerTurnSpan.textContent = `${activePlayer.name}'S TURN!`;
        };
    
        const gameboardClickHandler = (e) => {
            if (e.target.dataset.index) {
                gameStatus = game.playTurn(parseInt(e.target.dataset.index));
                updateScreen(gameStatus);}
        }
    
        gameboardDiv.addEventListener('click', gameboardClickHandler);
    } 

    function selectHandler(e) {
        e.preventDefault();
        const selectDivList = document.querySelectorAll('.select');
        selectDivList.forEach(selectDiv => {
            selectDiv.removeEventListener('click', selectHandler);
            selectDiv.querySelectorAll('button').forEach(button => button.setAttribute('disabled',''));
        });
        const selectDiv = e.currentTarget;
        console.log(selectDiv);
        if (selectDiv.hasAttribute('data-template-id')) templateControls.changeTemplate(selectDiv.dataset.templateId);
        }

    const templateControls = (() => {

        const animation = (() => { 
            function removeAnimation (e, animation) {
                void e.target.offsetWidth; // Trigger DOM reflow
                e.target.classList.remove(animation);
            }

            function animateLeft(element) {
                const animation = 'animate-left'
                element.addEventListener('animationend', (e) => removeAnimation(e, animation));
                element.classList.add(animation);
            }

            function animateRightReverse(element) {
                const animation = 'animate-right-reverse'
                element.addEventListener('animationend', (e) => removeAnimation(e, animation));
                element.classList.add('animate-right-reverse');
            }
            
            return {animateLeft, animateRightReverse};
        })();

        function getTemplateContent (templateId) {
            return document.getElementById(templateId).content;
        }

        function changeTemplate(templateId) {
            const oldTemplateContent = document.querySelector('.main');
            animation.animateRightReverse(oldTemplateContent);
    
            oldTemplateContent.addEventListener('animationend', () => initaliseTemplate(templateId));
        }

        function initaliseTemplate(templateId) {
            
            const newTemplateContentFragment = getTemplateContent(templateId);
            const body = document.querySelector('body');

            let player1Name;
            let player2Name;
            let isVsCom;
            if(templateId === 'game-template') {
                if (body.querySelector('.player-1-name')) {
                    const inputName = body.querySelector('.player-1-name').value;
                    if (inputName) player1Name = inputName;
                    else player1Name = 'PLAYER 1';
                }
                if (body.querySelector('.player-2-name')) {
                    const inputName = body.querySelector('.player-2-name').value;
                    if (inputName) player2Name = inputName;
                    else player2Name = 'PLAYER 2';
                }
                isVsCom = (!body.querySelector('.player-2-name')) ? true : false;
            }

            body.replaceChild(newTemplateContentFragment.cloneNode(true), body.lastElementChild);
            
            const newTemplateContent = document.querySelector('.main');
            animation.animateLeft(newTemplateContent);
            
            const selectDivList = body.querySelectorAll('.select');
            selectDivList.forEach(selectDiv => selectDiv.addEventListener('click', selectHandler));

            if(templateId === 'game-template') startGame(player1Name, player2Name, isVsCom);
        }

        return {changeTemplate, initaliseTemplate};

    })();

        templateControls.initaliseTemplate('main-menu-template');

})();