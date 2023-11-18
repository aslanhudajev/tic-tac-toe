
//Player object - singleton - factory

const Player = (function () {
    let sign = "";

    function MadeMove () {
        GameManager.SetCpuTurn()
    }

    function SetSign () {
        sign = "X";
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
        console.log(possibleChoices);

        let cellChoiceIndex = RandomRange(possibleChoices.length);
        let cellChoiceCoord = possibleChoices[cellChoiceIndex].GetCoord();
        Gameboard.SetMark(cellChoiceCoord[0], cellChoiceCoord[1], sign);
        GameManager.CheckForWinner();
        GameManager.SetPlayerTurn();
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
    function CellPressed (e, r, c) {
        if (GameManager.GetPlayerTurn) {
            //Player made a move - through a click
            Gameboard.SetMark(e.target.dataset.rowcol.substring(0, 1), e.target.dataset.rowcol.substring(1), Player.GetSign());
            GameManager.CheckForWinner();
            Player.MadeMove();
            CPU.MakeMove();
            e.stopPropagation();       
        }
    }
    return { CellPressed }
})()

//Gameboard object - singleton - factory

const Gameboard = (function () {
    const ROW = 3;
    const COL = 3;

    let board = [];

    let boardHtmlContainer = document.querySelector(".board");
    let cellHtmlTemplate = document.querySelector("#cell-template");

    //init
    function CreateBoard () {
        for (let r = 0; r < ROW; r++) {
            board[r] = [];
            for (let c = 0; c < COL; c++) {
                board[r].push(CreateCell(r, c));

                let cellHtml = cellHtmlTemplate.content.cloneNode(true).querySelector("div");
                cellHtml.classList.add("cell");
                cellHtml.dataset.rowcol= r.toString() + c.toString();
                cellHtml.addEventListener("click", EventManager.CellPressed);

                boardHtmlContainer.appendChild(cellHtml);
            }
        }
        Render();
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

    function GetCell (r, c) {
        return board[r][c];
    } 

    function SetMark (row, col, sign) {
        board[row][col].Press(sign);
        Render();
    }

    return { ClearBoard, SetMark, GetCell, GetNonPressedCells, CreateBoard }
})();

//Game manager object - singleton - factory

const GameManager = (function () {
    let gameWon = false;
    let winner = "";

    let playerTurn = false;
    let cpuTurn = false;

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
        CPU.SetSign();
        Gameboard.CreateBoard();
    }

    function CheckForWinner () {
        let playerStreakCounter = 0;
        let cpuStreakCounter = 0;

        for (const combo of winningCombos) {
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
                    console.log("Player Won");
                    RestartGame();
                    break;
                } else if (cpuStreakCounter === 3) {
                    console.log("CPU Won");
                    RestartGame();
                    break;
                }
            }
        }
    }

    function RestartGame () {
        Gameboard.ClearBoard(); 
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
    }

    Init();

    return { GetPlayerTurn, SetPlayerTurn, SetCpuTurn, CheckForWinner, RestartGame }
})()