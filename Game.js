
//Player object - singleton - factory

const Player = (function () {
    let sign = "";

    function MakeMove () {
        let row = prompt ("what row would you like to press?");
        let col = prompt ("What column would you like to press?");

        return [row, col];
    }

    function SetSign () {
        sign = prompt("What sign would you like?");
    }

    function GetSign () {
        return sign;
    }

    return { MakeMove, SetSign, GetSign };
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

    function MakeMove (possibleChoices) {
        console.log(possibleChoices);
        cellChoice = RandomRange(possibleChoices.length);
        return possibleChoices[cellChoice].GetCoord();
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

//Gameboard object - singleton - factory

const Gameboard = (function () {
    const ROW = 3;
    const COL = 3;

    let board = [];

    //init
    for (let r = 0; r < ROW; r++) {
        board[r] = [];
        for (let c = 0; c < COL; c++) {
            board[r].push(CreateCell(r, c));
        }
    }

    Render();

    function Render () {
        for (let r = 0; r < ROW; r++) {
            let boardStr = "/"
            for (let c = 0; c < COL; c++) {
                if (board[r][c].GetIsPressed() === false)
                    boardStr += "[ ]"
                else
                    boardStr += `[${board[r][c].GetPressedBy()}]`;
            }
            boardStr += "/";

            console.log(boardStr);
        }
    }

    function SetMark (row, col, sign) {
        board[row][col].Press(sign);
        Render();
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
    }

    return { ClearBoard, SetMark, GetNonPressedCells }
})();

//Game manager object - singleton - factory

const GameManager = (function () {
    let gameWon = false;
    let winner = "";
    
    function Init () {
        Player.SetSign();
        CPU.SetSign();

        StartGame();
    }

    function StartGame () {
        while (gameWon == false) {
            let pChoiceArr = Player.MakeMove();
            Gameboard.SetMark(pChoiceArr[0], pChoiceArr[1], Player.GetSign());

            //CPU takes list of all non-pressed cells as argument, to help him/her make a choice.
            let cpuChoiceArr = CPU.MakeMove(Gameboard.GetNonPressedCells());
            Gameboard.SetMark(cpuChoiceArr[0], cpuChoiceArr[1], CPU.GetSign());

            CheckForWinner();
        }

    }

    function CheckForWinner () {

    }

    Init();
})()