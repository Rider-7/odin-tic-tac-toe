//  Current Goal: To make a tic-tac-toe game against a naive computer.
//  
//      To implement:
//          gameboard object:
//              1. The gameboard layout
//                  a. Layout stored as 3x3 2D array.
//                  b. 3 Possible values to store: 'X' for Player 1, 'O' for Player 2, '' for empty.
//              2. Setter & Getter methods
//                  a. Getter -> return gameboard layout
//                  b. Setter -> set a value within gameboard layout w/ validation logic
//                          
//        gameController object:
//             1. tracks current player turn
//             2. updates gameboard with player's play
//             3. validates win/draw/lose conditions



// gameboard object that controls the gameboard layout.
const gameboard = (() => {

    // Create board.
    const board = [];
    const dims = 3;
        for (let i = 0; i < dims; i++) {
            board.push([]);
            for (let j = 0; j < dims; j++) {
                board[i].push('');
            }
        }

    // Method - Get board.
    const getBoard = () => board;
    
    // Method - Mark position on board with given marker.
    const placeMarker = (marker, row, column) => {
        board[row][column] = marker;
    }

    // Method - Print current board onto console.
    const printBoard = () => {
        board.map((row) => console.log(row));
    }

    return {getBoard, placeMarker, printBoard}
})();

const gameController = (() => {

    // Factory Function - Player
    function Player(name, marker, type) {
        return {name, marker, type};
    }

    // Factory Function - Computer Player
    const ComputerPlayer = (marker) => {
        const {name, type} = Player('Computer', marker, 'computer');

        const promptSelection = (board) => {
            // Format board as flattened 1D array with remaining legal grids/move (i.e., grids that still have '') filtered in.
            const filteredBoard = [];
            const keyValueArr = [...board.flat().entries()].filter(pair => pair[1] === '');
            keyValueArr.forEach((pair) => filteredBoard.push(pair[0]));

            // Randomly select a legal grid from formatted board using index.
            const idx = Math.round(Math.random() * (filteredBoard.length - 1));
            const selection = filteredBoard[idx];

            // Reformat legal grid to original 2D board indices.
            const row = Math.floor(selection / 3);
            const column = selection % 3;
            
            return [row, column];
        }
        return {name, marker, type, promptSelection}
    }

    // Factory Function - Human Player
    const HumanPlayer = (name, marker) => {
        const {type} = Player(name, marker, 'human');

        const promptSelection = () => {
            selection = prompt("Select a grid (from 0 to 8)");

            const row = Math.floor(selection / 3);
            const column = selection % 3;
            
            return [row, column];
        }
        return {name, marker, type, promptSelection}
    }

        const player1 = HumanPlayer('Tom', 'X');
        const player2 = ComputerPlayer('O');

        let activePlayer = (Math.round(Math.random())) ? player1 : player2;
        console.log(`${activePlayer.name} goes first!`);

        const board = gameboard.getBoard();
        console.log(player2.promptSelection(board)) // debug

    // Method - Plays the current player's turn, updates the board, and stops at the start of other player's turn.
    const playTurn = () => {
        gameboard.placeMarker(activePlayer.marker, ...activePlayer.promptSelection(board));
        gameboard.printBoard();

        const gameStatus = getGameStatus();
        if(gameStatus === 'win') return activePlayer;
        if(gameStatus === 'draw') return console.log("Draw!");
        switchActivePlayer();
    };

    // Method - Switch players.
    const switchActivePlayer = () => activePlayer = (activePlayer == player1) ? player2 : player1;

    // Method - Check for winning/draw conditions.
    const getGameStatus = () => {

        const isRowWinner = (function validateRows() {
            for (let i = 0; i < 3; i++) {
                const uniqueElements = board[i].filter((el, idx, row) => row.indexOf(el) === idx);
                if (uniqueElements.length === 1 && !uniqueElements.includes('')) return true;
            }
        })();
        if (isRowWinner) return 'win';

        const isColumnWinner = (function validateColumns() {
            for (let i = 0; i < 3; i++) {
                let column = [];
                for (let j = 0; j < 3; j++) {
                    column.push(board[j][i]);
                }
                const uniqueElements = column.filter((el, idx, column) => column.indexOf(el) === idx);
                if (uniqueElements.length === 1 && !uniqueElements.includes('')) return true;
            }
        })();
        if (isColumnWinner) return 'win';

        const isDiagonalWinner = (function validateDiagonals() {
            let leftDiagonal = [];
            let rightDiagonal = [];
            for (let i = 0; i < 3; i++) {
                    leftDiagonal.push(board[i][i]);
                    rightDiagonal.push(board[i][(board.length-1) - i]);
                }
            for (diagonal of [leftDiagonal, rightDiagonal]) {
                const uniqueElements = diagonal.filter((el, idx, diagonal) => diagonal.indexOf(el) === idx);
                if (uniqueElements.length === 1 && !uniqueElements.includes('')) return true;
            }
        })();
        if (isDiagonalWinner) return 'win';

        const isDraw = (function validateDraw() {
            flatten = [];
            for (let i = 0; i < 3; i++) {
                flatten = flatten.concat(board[i]);
            }
            if (!flatten.includes('')) return true;
        })();
        if(isDraw) return 'draw';

        return 'in-play';
    }

    return {playTurn};
})();

function test() {
    const board = gameboard.getBoard();
    const arr = [...board.flat().entries()].filter(pair => pair[1] === '');
    let temp = [];
    arr.forEach((pair) => temp.push(pair[0]));
    return temp;
}
