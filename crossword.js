/*
 * See if a word from the crossword can match an actual word (the candidate)
 */
function isMatch(wordFromCrossword, candidate) {
    // If the words are different length then they'll never match
    if(wordFromCrossword.length != candidate.length) {
        return false;
    }

    for (let i = 0; i < wordFromCrossword.length; i++) {
        // A space in the crossword means any character can match, which is fine
        if (wordFromCrossword[i] == ' ') {
            continue;
        }

        if (wordFromCrossword[i] != candidate[i]) {
            return false;
        }
    }

    return true;
}

/*
 * Creates a crossword cell which holds the information we need to solve the puzzle
 */
function createCell(initialCount) {
    let isStartCell = initialCount > 0

    let cell = {
        isStartCell: isStartCell,
        wordsFromThisCell: initialCount,
        char: " "
    };

    return cell;
}

/*
 * Creates a crossword from a description.
 * Cells that can't contain a letter are set to null
 */
function createCrossword(boardDescription) {
    let rows = boardDescription.split("\n");

    let cells = rows.map(row => {
        let characters = Array.from(row)
        return characters.map(cell => cell == '.' ? null : createCell(parseInt(cell)))
    });

    let rowCount = rows.length;
    let columnCount = rows[0].length;

    return {
        rowCount: rowCount,
        columnCount: columnCount,
        cells: cells
    };
}

/*
 * Given a cell on the crossword works out if we can add a word at the cell and going right
 */
function canGoRight(crossword, row, column) {
    if(column + 1 == crossword.columnCount) {
        return false;
    }

    let cell = crossword.cells[row][column + 1];
    if(cell == null) {
        return false;
    }

    return true;
}

/*
 * Given a cell on the crossword works out if we can add a word at the cell and going down
 */
function canGoDown(crossword, row, column) {
    if(row + 1 == crossword.rowCount) {
        return false;
    }

    let cell = crossword.cells[row + 1][column];
    if(cell == null) {
        return false;
    }

    return true;
}

/*
 * Gets the word that runs to the right, starting at [row,col]
 */
function getWordRight(crossword, row, column) {
    let word = "";
    
    for (let i = column; i < crossword.columnCount; i++) {
        let cell = crossword.cells[row][i];
        if (cell == null)
        {
            break;
        }

        word += cell.char;
    }

    return word;
}

/*
 * Gets the word that runs down, starting at [row,col]
 */
function getWordDown(crossword, row, column) {
    let word = "";
    
    for (let i = row; i < crossword.rowCount; i++) {
        let cell = crossword.cells[i][column];
        if (cell == null)
        {
            break;
        }

        word += cell.char;
    }

    return word;
}

/*
 * Writes a word to the crossword.
 * The delta is used to adjust the count.
 * When we are trying out a word the delta is -1, when we return the word it's 1
 */
function setWordRight(crossword, row, column, word, delta) {
    let startCell = crossword.cells[row][column];
    startCell.wordsFromThisCell += delta;

    for(let i = 0; i < word.length; i++) {
        let c = word[i];
        cell = crossword.cells[row][column + i];
        cell.char = c;
    }  
}

function setWordDown(crossword, row, column, word, delta) {
    let startCell = crossword.cells[row][column];
    startCell.wordsFromThisCell += delta;

    for(let i = 0; i < word.length; i++) {
        let c = word[i];
        let cell = crossword.cells[row + i][column];
        cell.char = c;
    }    
}

function printCrossword(crossword) {
    console.log("Solution");
    console.log("--------");

    for(let row = 0; row < crossword.rowCount; row++) {
        let line = "";
        for(let col = 0; col < crossword.columnCount; col++) {
            let cell = crossword.cells[row][col];

            if(cell == null) {
                line += ".";
            }
            else {
                line += cell.char;
            }
        }
        console.log(line);        
    }
    console.log();
}

/*
 * Attempts to solve a crossword.
 * Returns true if it solved the crossword, false it if failed to solve the crossword.
 * NOTE: This is our recursive function
 */
function solveCrossword(crossword, words) {
    let cell = null;
    let row = 0;
    let col = 0;

    /*
     * Looks for a cell that we can try to place a word into
     */
    for(; row < crossword.rowCount; row++) {
        for(col = 0; col < crossword.columnCount; col++) {
            let possibleCell = crossword.cells[row][col];
            if(possibleCell != null) {
                if(possibleCell.isStartCell && possibleCell.wordsFromThisCell > 0) {
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
        // There are no cells left to solve (we're done).
        // This is known as the "terminating condition" in recursion
        return true;
    }

    // We've got a cell. Can we put a word in going right?
    if(canGoRight(crossword, row, col)) {
        // Get the current word at [row, col] and to the right.
        // It may just be spaces, or it may have some letters in from words that intersect it.
        let pattern = getWordRight(crossword, row, col);

        // Now look for a word that matches the word pattern.
        for(let i = 0; i < words.length; i++) {            
            let word = words[i];

            // If word is null it means it's been previously removed as part of a possible solution
            if(word != null && isMatch(pattern, word)) {
                // We've got a match. Take the word out of the array by setting it to null...
                words[i] = null;       
                
                // ...now add the word to the crossword and try to solve the "new" crossword
                // We use -1 as we're adding a word and want to reduce the "wordsFromThisCell" value
                setWordRight(crossword, row, col, word, -1);
                if(solveCrossword(crossword, words)) {
                    return true;
                }

                // As solveCrossword returned false it means we haven't solved it yet.
                // Reset the word (by putting it back to "pattern") and try again with another word.
                // NOTE: This is the backtracking bit!
                // We use 1 as we're putting the old word back and want to increase the count
                setWordRight(crossword, row, col, pattern, 1);
                words[i] = word;
            }
        }
    }
    
    // NOTE: The comments above apply to this block, too
    if(canGoDown(crossword, row, col)) {
        let pattern = getWordDown(crossword, row, col);

        for(let i = 0; i < words.length; i++) {
            let word = words[i];
            if(word != null && isMatch(pattern, word)) {
                words[i] = null;  

                setWordDown(crossword, row, col, word, -1);
                if(solveCrossword(crossword, words)) {
                    return true;
                }

                setWordDown(crossword, row, col, pattern, 1);
                words[i] = word;
            }
        }
    } 

    // We tried left and right and neither returned true and neither
    // of their calls to solveCrossword returned true, so there is 
    // not solution at this level.
    return false;
}

function doHolidays() {

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
..........0....`;

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

    let crossword = createCrossword(puzzle);
    if(solveCrossword(crossword, words)) {
        printCrossword(crossword);
    }
}


function doFood(){

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
....0......`;

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
    ];

    let crossword = createCrossword(puzzle);
    if(solveCrossword(crossword, words)) {
        printCrossword(crossword);
    }
}


function doWords() {
    const puzzle = '2001\n0..0\n1000\n0..0'
    const words = ['casa', 'alan', 'ciao', 'anta']

    let crossword = createCrossword(puzzle);
    if(solveCrossword(crossword, words)) {
        printCrossword(crossword);
    }
}

doWords();
doHolidays();
doFood();