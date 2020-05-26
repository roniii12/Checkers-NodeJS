const tools = {
    darkSolider: 1,
    brightSolider: 2,
    darkKing: 3,
    brightKing: 4,
    empty: 0
}

let getCurrentSolider1 = function () {
    return currentChecker;
}
let getCurrentKing1 = function () {
    return currentCheckerKing;
}



function CheckersGame(numbersOfRow, currentChecker, currentCheckerKing) {
    this.table = [];
    this.locations = [];
    this.isTurnBright = true;
    this.selectedElements = [];
    this.update = {
        location: this.locations,
        locationDelete: {
            row: [],
            column: []
        },
        isTurnBright: this.isTurnBright,
        prototype: {
            burn: false
        }
    }
    //this.update.table = this.clone(this.table);
    this.createTable = function () {
        for (let row = 0; row < numbersOfRow; row++) {
            this.table[row] = [];
            for (let column = 0; column < numbersOfRow; column++) {
                if (row < (numbersOfRow / 2 - 1))
                    this.insertSoliderStart(tools.darkSolider, row, column);
                else if (row > numbersOfRow / 2)
                    this.insertSoliderStart(tools.brightSolider, row, column);
                else
                    this.table[row][column] = tools.empty;
            }
        }
    }

    this.insertSoliderStart = function (typeSolider, row, column) {
        if (row % 2 === 0 && column % 2 === 1)
            this.table[row][column] = (typeSolider);
        else if (row % 2 === 1 && column % 2 === 0)
            this.table[row][column] = (typeSolider);
        else
            this.table[row][column] = tools.empty;
    }
    this.setInitLocations = function (location) {
        let detailsLocation = returnRowAndColumn(location);
        if ((this.isCurrentPlayer(detailsLocation.row,detailsLocation.column)
            && (this.getCurrentSolider() == currentChecker || this.getCurrentKing() == currentCheckerKing)) &&
            this.locations.length < 2) {
            this.locations = [location];
        } else if (this.locations.length == 1) {
            return false;
        }
        return true;
    }
    this.setElements = function (element) {
        if (this.locations.length > 0) {
            element.className += " selected";
        }
        if (this.selectedElements.length == 0) {
            this.selectedElements[0] = element;
        } else
            this.selectedElements[1] = element;
        if (this.selectedElements.length > 1) {
            this.selectedElements[0].className = this.selectedElements[0].className.replace("selected", "");
        }
    }

    this.isLegalMove = function (targetLocation) {
        let lastLocation = this.locations.length - 1;
        let from = returnRowAndColumn(this.locations[lastLocation]);
        let target = returnRowAndColumn(targetLocation);
        let remainderRow = target.row - from.row;
        if (remainderRow == 1 && this.isTurnBright && this.table[from.row][from.column] != tools.brightKing)
            return false;
        else if (remainderRow == -1 && !this.isTurnBright && this.table[from.row][from.column] != tools.darkKing)
            return false;
        else if (remainderRow == 0)
            return false;
        if (this.locations.length > 0)
            return this.isMove(from, target);
    }
    this.isLegalMoveFromToTarget = function (from, target) {
        let remainderRow = target.row - from.row;
        if (remainderRow == 1 && this.isTurnBright && this.table[from.row][from.column] != tools.brightKing)
            return false;
        else if (remainderRow == -1 && !this.isTurnBright && this.table[from.row][from.column] != tools.darkKing)
            return false;
        else if (remainderRow == 0)
            return false;
        if (this.locations.length > 0)
            return this.isMove(from, target);
    }
    this.isMove = function (from, target) {
        let remainderRow = Number(target.row) - Number(from.row);
        let remainderColumn = Number(target.column) - Number(from.column);
        let remainderRowAbs = Math.abs(remainderRow);
        let remainderColumnAbs = Math.abs(remainderColumn);
        if (remainderRowAbs == 1 && remainderColumnAbs == 1) {
            if (!this.isCharacterPosition(target.row, target.column)) {
                this.update.location = [];
                return true;
            }
        } else if (remainderRowAbs == 2 && remainderColumnAbs == 2) {
            if (!this.isCharacterPosition(target.row, target.column) && this.isEat(remainderRow, remainderColumn, target)) {
                this.update.location.push(target.row + "/" + target.column);
                return true;
            } else if (this.table[from.row][from.column] > 2 && this.isMoveKing(from, target)) {
                return true;
            }
        } else if (remainderRowAbs > 2 && remainderColumnAbs > 2 && this.table[from.row][from.column] > 2 && remainderRowAbs == remainderColumnAbs) {
            if (!this.isCharacterPosition(target.row, target.column) && this.isMoveKing(from, target)) {
                this.update.location.push(target.row + "/" + target.column);
                return true;
            }
        }
    }
    this.isMoveKing = function (from, target) {
        if (!this.isCharacterPosition(target.row, target.column)) {
            let remainderRow = Number(target.row) - Number(from.row);
            let remainderColumn = Number(target.column) - Number(from.column);
            let remainderRowAbs = Math.abs(remainderRow);
            let remainderColumnAbs = Math.abs(remainderColumn);
            if (remainderRowAbs == remainderColumnAbs) {
                if (this.isEatKing(remainderRow, remainderColumn, target))
                    return true;
                return this.isMoveKingWithoutEat(from, target);
            }
        }
        return false;
    }
    this.isMoveKingWithoutEat = function (from, target) {
        let column = from.column;
        let addToColumnEveryRow = target.column > from.column ? 1 : -1;
        for (let row = from.row + 1; row <= target.row; row++) {
            column += addToColumnEveryRow;
            if (this.isCharacterPosition(row, column))
                return false;
        }
        column = from.column
        for (let row = from.row - 1; row >= target.row; row--) {
            column += addToColumnEveryRow;
            if (this.isCharacterPosition(row, column))
                return false;
        }
        return true;
    }
    this.isEat = function (remainderRow, remainderColumn, target) {
        if (Math.abs(remainderRow) == 2) {
            let rowBetween = target.row - (remainderRow > 0 ? 1 : -1);
            let columnBetween = target.column - (remainderColumn > 0 ? 1 : -1);
            if (this.isOpponentPlayer(rowBetween, columnBetween)) {
                this.update.locationDelete.row.push(rowBetween)
                this.update.locationDelete.column.push(columnBetween)
                return true;
            }
        } else if (Math.abs(remainderRow) >= 2) {
            this.isEatKing(remainderRow, remainderColumn, target);
        }
        return false;
    }
    this.isEatKing = function (remainderRow, remainderColumn, target) {
        if (Math.abs(remainderRow) >= 2) {
            let remainder = 1;
            let rowBetween = target.row - (remainderRow > 0 ? remainder : -remainder);
            let columnBetween = target.column - (remainderColumn > 0 ? remainder : -remainder);
            do {
                rowBetween = target.row - (remainderRow > 0 ? remainder : -remainder);
                columnBetween = target.column - (remainderColumn > 0 ? remainder : -remainder);
                if (this.isOpponentPlayer(rowBetween, columnBetween)) {
                    if (Math.abs(rowBetween - this.update.locationDelete.row[this.update.locationDelete.row.length - 1]) != 1) {
                        this.update.locationDelete.row.push(rowBetween)
                        this.update.locationDelete.column.push(columnBetween)
                    } else {
                        return false;
                    }
                } else if (this.isCurrentPlayer(rowBetween, columnBetween)) {
                    return false;
                }
                remainder++;
            } while (Math.abs(remainderRow) != Math.abs(remainder));
        }
        return this.update.locationDelete.row.length != 0;
    }
    this.getOpponentSolider = function () {
        return this.isTurnBright ? tools.darkSolider : tools.brightSolider;
    }
    this.getOpponentKing = function () {
        return this.isTurnBright ? tools.darkKing : tools.brightKing;
    }
    this.getCurrentSolider = function () {
        return this.isTurnBright ? tools.brightSolider : tools.darkSolider;
    }
    this.getCurrentKing = function () {
        return this.isTurnBright ? tools.brightKing : tools.darkKing;
    }
    this.isOpponentPlayer = function (row, column) {
        return (this.table[row][column] == this.getOpponentSolider() ||
            this.table[row][column] == this.getOpponentKing());
    }
    this.isCurrentPlayer = function (row, column) {
        return ((this.table[row][column] == this.getCurrentSolider())||
            (this.table[row][column] == this.getCurrentKing()));
    }
    this.isSomeoneCanEat = function () {
        let countSoliders = 0;
        for (let row = 0; row < this.table.length; row++) {
            for (let column = 0; column < this.table[row].length; column++) {
                if (this.table[row][column] == this.getCurrentSolider()) {
                    countSoliders++;
                    if (this.isCanEat({
                            row: row,
                            column: column
                        })) {
                        return true;
                    }
                } else if (this.table[row][column] == this.getCurrentKing()) {
                    countSoliders++;
                    if (this.isCanEatKing({
                            row: row,
                            column: column
                        })) {
                        return true;
                    }
                }
            }
        }
        if (countSoliders == 0)
            alert("Game Over! the winner is: " + (this.isTurnBright ? "Dark player" : "Bright player"));
        return false;
    }
    this.isCanEat = function (from) {
        for (let row = -2; row <= 4; row += 4) {
            for (let column = -2; column <= 4; column += 4) {
                if (this.table[from.row + row] != undefined && this.table[from.row + row][from.column + column] != undefined) {
                    if (this.isMove(from, {
                            row: (from.row + row),
                            column: (from.column + column)
                        }))
                        return true;
                }
            }
        }
        return false;
    }
    this.isCanEatKing = function (from) {
        let up = 1;
        for (let ways = 0; ways < 2; ways++) {
            up *= -1;
            let stopForward = false;
            let stopBack = false;
            let columnForward = from.column;
            let columnBack = from.column;
            for (let row = from.row + up; row < this.table.length && (!stopBack || !stopForward) && row >= 0; row += up) {
                if (!stopForward) {
                    columnForward++
                    if (this.table[row] != undefined && this.table[row][columnForward] != undefined) {
                        if (this.isCurrentPlayer(row, columnForward)) {
                            stopForward = true;
                        } else if (this.table[row][columnForward] != tools.empty &&
                            this.table[row + up] != undefined && this.table[row + up][columnForward + 1] != undefined) {
                            if (this.isMoveKing(from, {
                                    row: (row + up),
                                    column: (columnForward + 1)
                                }))
                                return true;
                        }
                    }
                }
                if (!stopBack) {
                    columnBack--;
                    if (this.table[row] != undefined && this.table[row][columnBack] != undefined) {
                        if (this.isCurrentPlayer(row, columnBack)) {
                            stopBack = true;
                        } else if (this.table[row][columnBack] != tools.empty &&
                            this.table[row + up] != undefined && this.table[row + up][columnBack - 1] != undefined) {
                            if (this.isMoveKing(from, {
                                    row: (row + up),
                                    column: (columnBack - 1)
                                }))
                                return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    this.isCharacterPosition = function (locationRow, locationColumn) {
        if (this.table[locationRow][locationColumn] != tools.empty)
            return true;
        return false;
    }
    this.move = function (element, targetLocation) {
        if(this.getCurrentSolider() == currentChecker || this.getCurrentKing() == currentCheckerKing){
            if (this.setInitLocations(targetLocation)) {
                if (this.locations.length == 1)
                    this.setElements(element);
            }
            let target = returnRowAndColumn(targetLocation);
            let canEat = this.isSomeoneCanEat();
            this.update.locationDelete = {
                row: [],
                column: []
            };
            if (this.locations.length > 0) {
                if (this.isLegalMove(targetLocation)) {
                    let from = returnRowAndColumn(this.locations[this.locations.length - 1]);
                    if ((this.table[from.row][from.column] > 2 ? true : (canEat == (Math.abs(target.row - from.row) > 1))) && canEat == (this.update.locationDelete.row.length != 0)) {
                        console.log("can eat: ", canEat);
                        this.setElements(element);
                        this.locations.push(targetLocation);
                        if (this.update.locationDelete.row.length != 0) {
                            this.deleteCharacters();
                        }
                        if ((target.row == 0 && this.table[from.row][from.column] == tools.brightSolider) ||
                            (target.row == this.table.length - 1 && this.table[from.row][from.column] == tools.darkSolider)) {
                            this.table[target.row][target.column] = this.getCurrentKing();
                        } else
                            this.table[target.row][target.column] = this.table[from.row][from.column];
                        this.table[from.row][from.column] = tools.empty;
                    }
                }
            }
            if (this.locations.length > 1) {
                let from = returnRowAndColumn(this.locations[this.locations.length - 1]);
                if ((this.table[from.row][from.column] > 2 ? !this.isCanEatKing(from) : !this.isCanEat(from)) || canEat == false) {
                    if (this.isGameOver()) {
                        this.isGameOverProp = {
                            GameOver: true,
                            message: "Game Over! the winner is: " + (this.isTurnBright ? "Bright player" : "Dark player")
                        };
                        console.log(this.isGameOverProp);
                    }
                    this.locations = [];
                    this.selectedElements[1].className += " end"
                    this.isTurnBright = (this.isTurnBright ? false : true);
                }
                console.log("locations: ", this.locations);
            }
        return true;
    }return false}
    this.isGameOver = function () {
        if (this.isHasSoliderOpponentPlayer() && this.isSomeoneCanMoveInOpponentPlayer())
            return false;
        return true;
    }
    this.isHasSoliderOpponentPlayer = function () {
        for (let row = 0; row < this.table.length; row++) {
            for (let column = 0; column < this.table[row].length; column++) {
                if (this.isOpponentPlayer(row, column))
                    return true;
            }
        }
    }
    this.isSomeoneCanMoveInOpponentPlayer = function () {
        this.isTurnBright = !this.isTurnBright;
        for (let row = 0; row < this.table.length; row++) {
            for (let column = 0; column < this.table[row].length; column++) {
                if (this.isCurrentPlayer(row, column)) {
                    if (this.isCanEat({
                            row: row,
                            column: column
                        })) {
                        this.isTurnBright = !this.isTurnBright;
                        return true;
                    } else {
                        for (let remainderRow = -1; remainderRow <= 1; remainderRow += 2) {
                            for (let remainderColumn = -1; remainderColumn <= 1; remainderColumn += 2) {
                                if (this.table[remainderRow + row] != undefined && this.table[remainderRow + row][remainderColumn + column] != undefined) {
                                    let from = {
                                        row: row,
                                        column: column
                                    }
                                    let target = {
                                        row: (row + remainderRow),
                                        column: (column + remainderColumn)
                                    }
                                    if (this.isLegalMoveFromToTarget(from, target)) {
                                        this.isTurnBright = !this.isTurnBright;
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.isTurnBright = !this.isTurnBright;
        return false;
    }
    this.deleteCharacters = function () {
        for (let index = 0; index < this.update.locationDelete.row.length; index++) {
            this.table[this.update.locationDelete.row[index]][this.update.locationDelete.column[index]] = tools.empty;
        }
    }

    function returnRowAndColumn(locationConvert) {
        let halfLocation = locationConvert.indexOf("/");
        let row = Number(locationConvert.substring(0, halfLocation));
        let column = Number(locationConvert.substring(halfLocation + 1));
        return {
            row,
            column
        };
    }
}
module.exports = CheckersGame;