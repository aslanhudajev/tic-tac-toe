//TYPEDEFS
const PLAYER_WIN = 1;
const CPU_WIN = 2;
const DRAW = 0;

//Player object - singleton - factory

const Player = (function () {
    let sign = "";

    function MadeMove () {
        GameManager.SetCpuTurn()
    }

    function SetSign (s) {
        sign = s || "X";
    }

    function GetSign () {
        return sign;
    }

    return { MadeMove, SetSign, GetSign };
})();

//CPU player object - singleton - factory

const CPU = (function () {
    let sign = ""

    function SetSign () {
        if (Player.GetSign() == "X")
            sign = "O"
        else
            sign = "X";
    }

    function GetSign () {
        return sign;
    }

    function MakeMove () {
        let possibleChoices = Gameboard.GetNonPressedCells();    

        if (GameManager.GetCpuTurn() && possibleChoices.length > 0) {
            let cellChoiceIndex = RandomRange(possibleChoices.length);
            let cellChoiceCoord = possibleChoices[cellChoiceIndex].GetCoord();
            let r = cellChoiceCoord[0];
            let c = cellChoiceCoord[1];

            Gameboard.SetMark(r, c, sign);

            if (GameManager.CheckForWinner() != true) {
                GameManager.SetPlayerTurn();
            } else {
                GameManager.GameWon();
            } 
        }
    }

    function RandomRange (r) {
        return Math.floor(Math.random() * r);
    }

    return { SetSign, GetSign, MakeMove };
})();

//Cell object - factory

function CreateCell (row, col) {
    let isPressed = false;
    let pressedBy = "";

    function Press (presser) {
        isPressed = true;
        pressedBy = presser;
    }

    function GetIsPressed () {
        return isPressed;
    }

    function GetPressedBy () {
        return pressedBy;
    }

    function GetCoord () {
        return [row, col];
    }

    function ClearPress () {
        isPressed = false;
        pressedBy = "";
    }

    return { Press, ClearPress, GetIsPressed, GetPressedBy, GetCoord };
}

//Event manager object - singleton - factory

let EventManager = (function () {
    function CellPressed (e) {
        let r  = e.target.dataset.rowcol.substring(0, 1);
        let c = e.target.dataset.rowcol.substring(1);

        if (GameManager.GetPlayerTurn() && Gameboard.GetCell(r, c).GetIsPressed() === false) {
            //Player made a move - through a click
            Gameboard.SetMark(r, c, Player.GetSign());

            if (GameManager.CheckForWinner() != true) {
                Player.MadeMove();
            } else {
                GameManager.GameWon();
            } 
        }
    }

    function ChangeSign (e) {
        let signToChangeTo = e.target.id;

        Player.SetSign(signToChangeTo);
        CPU.SetSign();
        GameManager.RestartGame();
    }

    function RestartGame (e) {
        GameManager.RestartGame();
    }

    return { CellPressed, RestartGame, ChangeSign }
})()

//Gameboard object - singleton - factory

const Gameboard = (function () {
    const ROW = 3;
    const COL = 3;

    let board = [];

    const boardHtmlContainer = document.querySelector(".board");
    const cellHtmlTemplate = document.querySelector("#cell-template");
    const overlayHtmlTemplate =  document.querySelector("#overlay-template");
    let overlayHtmlContainer = null;
    let overlayHtmlTitle = null;

    const changeSignXHtmlButton = document.querySelector("#X");
    const changeSignOHtmlButton = document.querySelector("#O");


    const playerWinMessage = "Player won";
    const cpuWinMessage = "Computer won";
    const drawMessage = "Game drawn";

    function Init () {
        changeSignXHtmlButton.addEventListener("click", EventManager.ChangeSign);
        changeSignOHtmlButton.addEventListener("click", EventManager.ChangeSign);
        CreateBoard();
    } 

    //init
    function CreateBoard () {
        for (let r = 0; r < ROW; r++) {
            board[r] = [];
            for (let c = 0; c < COL; c++) {
                board[r].push(CreateCell(r, c));

                let cellHtml = cellHtmlTemplate.content.cloneNode(true).querySelector("div");
                cellHtml.dataset.rowcol= r.toString() + c.toString();
                cellHtml.addEventListener("click", EventManager.CellPressed);

                boardHtmlContainer.appendChild(cellHtml);
            }
        }

        let overlayHtml = overlayHtmlTemplate.content.cloneNode(true).querySelector("div");
        overlayHtml.querySelector("button").addEventListener("click", EventManager.RestartGame);
        boardHtmlContainer.appendChild(overlayHtml);

        overlayHtmlContainer = boardHtmlContainer.querySelector(".overlay");
        overlayHtmlTitle = boardHtmlContainer.querySelector(".overlay > h1");
    }

    function Render () {
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                currentCellSignHtml = boardHtmlContainer.querySelector(`[data-rowcol="${r}${c}"]> h1`);
                currentCellSign = board[r][c].GetPressedBy();
                
                currentCellSignHtml.textContent = currentCellSign;
            }
        }
    }

    function GetNonPressedCells () {
        let nonPressedCells = [];
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                if (board[r][c].GetIsPressed() === false)
                    nonPressedCells.push(board[r][c]);
            }
        }
        return nonPressedCells;
    }

    function ClearBoard () {
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++)
            {
                board[r][c].ClearPress();
            }
        }
        Render();
    }

    function ShowGameWonScreen (winner) {
        switch (winner) {
            case PLAYER_WIN:
                overlayHtmlTitle.textContent = playerWinMessage;
                break;
            case CPU_WIN:
                overlayHtmlTitle.textContent= cpuWinMessage;
                break;
            case DRAW:
                overlayHtmlTitle.textContent = drawMessage;
                break;
                
        }

        overlayHtmlContainer.classList.remove("hidden");
    }

    function HideGameWonScreen () {
        overlayHtmlContainer.classList.add("hidden");
    } 
    

    function GetCell (r, c) {
        return board[r][c];
    } 

    function SetMark (row, col, sign) {
        board[row][col].Press(sign);
        Render();
    }

    return { Init, ClearBoard, SetMark, GetCell, GetNonPressedCells, CreateBoard, ShowGameWonScreen, HideGameWonScreen}
})();

//Game manager object - singleton - factory

const GameManager = (function () {
    let gameWon = false;
    let winner = null;

    let winningCombos = [
        [[0, 0], [0, 1], [0, 2]],   // X X X
                                    // 0 0 0
                                    // 0 0 0

        [[1, 0], [1, 1], [1, 2]],   // 0 0 0
                                    // X X X
                                    // 0 0 0

        [[2, 0], [2, 1], [2, 2]],   // 0 0 0
                                    // 0 0 0
                                    // X X X

        [[0, 0], [1, 0], [2, 0]],   // X 0 0
                                    // X 0 0
                                    // X 0 0

        [[0, 1], [1, 1], [2, 1]],   // 0 X 0
                                    // 0 X 0
                                    // 0 X 0

        [[0, 2], [1, 2], [2, 2]],   // 0 0 X
                                    // 0 0 X
                                    // 0 0 X

        [[0, 0], [1, 1], [2, 2]],   // X 0 0
                                    // 0 X 0
                                    // 0 0 X

        [[0, 2], [1, 1], [2, 0]],   // 0 0 X
                                    // 0 X 0
                                    // X 0 0
    ]
    
    function Init () {
        Player.SetSign();
        SetPlayerTurn();
        CPU.SetSign();
        Gameboard.Init();
    }

    function CheckForWinner () {
        let playerStreakCounter = 0;
        let cpuStreakCounter = 0;

        //check if there is a winner
        for (const combo of winningCombos) {
            playerStreakCounter = 0;
            cpuStreakCounter = 0;
            for (const cell of combo) {
                let currentCellSign = Gameboard.GetCell(cell[0], cell[1]).GetPressedBy();
                if (currentCellSign === Player.GetSign()) {
                    playerStreakCounter += 1;
                    cpuStreakCounter = 0;
                } else if (currentCellSign === CPU.GetSign()) {
                    cpuStreakCounter += 1;
                    playerStreakCounter = 0;
                } else {
                    playerStreakCounter = 0;
                    cpuStreakCounter = 0;
                }

                if (playerStreakCounter === 3) {
                    gameWon = true;
                    winner = PLAYER_WIN;
                    return gameWon;
                } else if (cpuStreakCounter === 3) {
                    gameWon = true;
                    winner = CPU_WIN;
                    return gameWon;
                }
            }
        }

        //if no winner, check if draw
        if (Gameboard.GetNonPressedCells().length < 1) {
            winner = DRAW;
            return gameWon;
        }
    }

    function GameWon () {
        playerTurn = false;
        cpuTurn = false;
        
        Gameboard.ShowGameWonScreen(winner);
    }

    function RestartGame () {
        Gameboard.HideGameWonScreen();
        Gameboard.ClearBoard();

        if (Player.GetSign() == "X")
            SetPlayerTurn();
        else
            SetCpuTurn();
    }

    function SetPlayerTurn () {
        cpuTurn = false;
        playerTurn = true;
    }

    function GetPlayerTurn () {
        return playerTurn;
    }

    function SetCpuTurn () {
        playerTurn = false;
        cpuTurn = true;

        CPU.MakeMove();
    }

    function GetCpuTurn () {
        return cpuTurn;
    } 

    Init();

    return { GetPlayerTurn, SetPlayerTurn, SetCpuTurn, CheckForWinner, RestartGame, GetCpuTurn, GameWon }
})()