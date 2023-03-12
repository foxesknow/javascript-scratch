function isMatch(lineFromCrossword, candidate) {
    /*
     * lineFromCrossword can contain either a letter or a space.
     * A space means we don't know if there a match
     */
    if(lineFromCrossword.length != candidate.length) {
        return false;
    }

    for (var i = 0; i < lineFromCrossword.length; i++) {
        if (lineFromCrossword[i] == ' ') {
            continue;
        }

        if (lineFromCrossword[i] != candidate[i]) {
            return false;
        }
    }

    return true;
}

function findWordThatMatches(pattern, words) {
    for(var i = 0; i < words.length; i++) {
        var word = words[i];
        if(word != null) {
            if(isMatch(pattern, word)) {
                return [word, i];
            }
        }
    }

    return [null, -1];
}

function createCell(initialCount) {
    var isStartCell = initialCount > 0

    return {
        isStartCell: isStartCell,
        initialCount: initialCount,
        char: " "
    };
}

function createBoard(boardDescription) {
    var rows = boardDescription.split("\n");

    return rows.map(row => {
        var characters = Array.from(row)
        return characters.map(cell => cell == '.' ? null : createCell(parseInt(cell)))
    });
}


function getHorizontalLength(board, row, column) {
    // assume the length of the first row is the width of the board (for now)
    var width = board[0].length;
    
    var length = 0;
    
    for (var i = column; i < width; i++) {
        var cell = board[row][i];
        if (cell == null)
        {
            break;
        }

        length++;
    }

    return length;
}

function getVerticalLength(board, row, column) {
    // assume the length of the board row is the height of the board (for now)
    var height = board.length;
    
    var length = 0;
    
    for (var i = row; i < height; i++) {
        var cell = board[i][column];
        if (cell == null)
        {
            break;
        }

        length++;
    }

    return length;
}

function canGoRight(board, row, column) {
    var width = board[0].length;

    if(column == width) {
        return false;
    }

    var cell = board[row][column + 1];
    if(cell == null) {
        return false;
    }

    return true;
}

function canGoDown(board, row, column) {
    var height = board.length;

    if(row == height) {
        return false;
    }

    var cell = board[row + 1][column];
    if(cell == null) {
        return false;
    }

    return true;
}

function getWordRight(board, row, column) {
    // assume the length of the first row is the width of the board (for now)
    var width = board[0].length;
    
    var word = "";
    
    for (var i = column; i < width; i++) {
        var cell = board[row][i];
        if (cell == null)
        {
            break;
        }

        word += cell.char;
    }

    return word;
}

function getWordDown(board, row, column) {
    // assume the length of the board row is the height of the board (for now)
    var height = board.length;
    
    var word = "";
    
    for (var i = row; i < height; i++) {
        var cell = board[i][column];
        if (cell == null)
        {
            break;
        }

        word += cell.char;
    }

    return word;
}

function setWordRight(board, row, column, word) {
    // assume the length of the first row is the width of the board (for now)
    var width = board[0].length;

    var delta = word[0] == " " ? 1 : -1;
    
    var startCell = board[row][column];
    startCell.initialCount += delta;

    for(var i = 0; i < word.length; i++) {
        var c = word[i];
        cell = board[row][column + i];
        cell.char = c;
    }  
}

function setWordDown(board, row, column, word) {
    // assume the length of the first row is the width of the board (for now)
    var height = board.length;
    
    var delta = word[0] == " " ? 1 : -1;

    var startCell = board[row][column];
    startCell.initialCount += delta;

    for(var i = 0; i < word.length; i++) {
        var c = word[i];
        var cell = board[row + i][column];
        cell.char = c;
    }    
}

function printBoard(board) {
    console.log("Solution");
    console.log("--------");
    for(var row = 0; row < board.length; row++) {
        var line = "";
        for(var col = 0; col < board[0].length; col++) {
            let cell = board[row][col];

            if(cell == null) {
                line += " ";
            }
            else {
                line += cell.char;
            }
        }
        console.log(line);        
    }
    console.log();
}

function solveBoard(board, words) {
    // Find a cell
    var rowCount = board.length;
    var colCount = board[0].length;

    var cell = null;
    var row = 0;
    var col = 0;

    for(; row < rowCount; row++) {
        col = 0;
        for(; col < colCount; col++) {
            var possibleCell = board[row][col];
            if(possibleCell != null) {
                if(possibleCell.isStartCell && possibleCell.initialCount > 0) {
                    cell = possibleCell;
                    break;
                }
            }
        }

        if(cell != null) {
            break;
        }
    }

    if(cell == null) {
        // There are no cells left to match!
        printBoard(board);
        return;
    }

    // We've got a cell
    if(canGoRight(board, row, col)) {
        var pattern = getWordRight(board, row, col);

        for(var i = 0; i < words.length; i++) {
            var word = words[i];
            if(word != null && isMatch(pattern, word)) {
                words[i] = null;       
                var char = cell.char;
                setWordRight(board, row, col, word);
                solveBoard(board, words)
                setWordRight(board, row, col, " ".repeat(word.length));
                cell.char = char;
                words[i] = word;
            }
        }
    }
    
    if(canGoDown(board, row, col)) {
        var pattern = getWordDown(board, row, col);

        for(var i = 0; i < words.length; i++) {
            var word = words[i];
            if(word != null && isMatch(pattern, word)) {
                words[i] = null;   
                var char = cell.char;
                setWordDown(board, row, col, word);
                solveBoard(board, words)
                setWordDown(board, row, col, " ".repeat(word.length));
                cell.char = char;
                words[i] = word;
            }
        }
    } 
}

//console.log(board)

//console.log(getHorizontalLength(board, 4, 0));
//console.log(getVerticalLength(board, 0, 0));
//console.log(getWordDown(board, 2, 0).length);

/*
const puzzle = `...1...........
..1000001000...
...0....0......
.1......0...1..
.0....100000000
100000..0...0..
.0.....1001000.
.0.1....0.0....
.10000000.0....
.0.0......0....
.0.0.....100...
...0......0....
..........0....`


const words = [
  'sun',
  'sunglasses',
  'suncream',
  'swimming',
  'bikini',
  'beach',
  'icecream',
  'tan',
  'deckchair',
  'sand',
  'seaside',
  'sandals',
]
*/


/*
const puzzle = `..1.1..1...
10000..1000
..0.0..0...
..1000000..
..0.0..0...
1000..10000
..0.1..0...
....0..0...
..100000...
....0..0...
....0......`
const words = [
  'popcorn',
  'fruit',
  'flour',
  'chicken',
  'eggs',
  'vegetables',
  'pasta',
  'pork',
  'steak',
  'cheese',
]
*/

const puzzle = '2001\n0..0\n1000\n0..0'
const words = ['casa', 'alan', 'ciao', 'anta']

b = createBoard(puzzle);
solveBoard(b, words);