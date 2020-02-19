/**
 * Generates a maze using the recursive backtracking algorithm and returns it in a 2D array
 * http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking
 * 
 * @param {Int} width 
 * @param {Int} height 
 * @param {Char} start 
 * @param {Char} end 
 * @param {Char} empty 
 * @param {Char} wall 
 */
function getMaze(width, height, start, end, empty, wall) {

    /**
     * The magic that makes recursive backtracking work
     * @param {Int} cx 
     * @param {Int} cy 
     * @param {Array[Array[Int]]} grid 
     */
    function carve_passages_from(cx, cy, grid) {
        shuffle(dirs);
        dirs.forEach(function (direction) {
            var nx = cx + DX[direction];
            var ny = cy + DY[direction];
            if (ny >= 0 && ny <= (grid.length - 1) && nx >= 0
                && nx <= (grid.length - 1) && sum(grid[ny][nx]) == 0) {
                grid[cy][cx].push(dirsValue[direction]);
                grid[ny][nx].push(OPPOSITE[direction]);
                carve_passages_from(nx, ny, grid);
            }
        })
    }

    /** 
     * Randomly shuffles an array in-place
     * @param {Array} arr 
     */
    function shuffle(arr) {
        for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    };

    /** 
     * Returns the summation of an array of numbers
     * @param {Array[Number]} arr 
     */
    function sum(arr) {
        return arr.reduce((a, b) => a + b, 0);
    }

    /** 
     * Returns whether a space of the maze is considered a corner
     * A corner is part of the open path, and is surrounded by walls on all sides except one
     * @param {Array[Array[String]]} maze 
     * @param {Int} x 
     * @param {Int} y 
     */
    function isCorner(maze, x, y) {
        var wallCount = 0;
        if (maze[y + 1][x] == wall) { wallCount++ }
        if (maze[y - 1][x] == wall) { wallCount++ }
        if (maze[y][x + 1] == wall) { wallCount++ }
        if (maze[y][x - 1] == wall) { wallCount++ }
        return maze[y][x] == empty && wallCount == 3;
    }

    /**
     * Initialize grid for recursive backtracking algorithm
     */

    var grid = [];

    for (var y = 0; y < height; y++) {
        grid.push([]);
        for (var x = 0; x < width; x++) {
            grid[y].push([]);
        }
    }

    /**
     * Do recursive backtracking to generate maze definition
     */

    var [N, S, E, W] = [1, 2, 4, 8];
    var dirs = ['N', 'E', 'S', 'W'];
    var dirsValue = { N: N, E: E, S: S, W: W };
    var DX = { E: 1, W: -1, N: 0, S: 0 };
    var DY = { E: 0, W: 0, N: -1, S: 1 };
    var OPPOSITE = { E: W, W: E, N: S, S: N };

    carve_passages_from(0, 0, grid);

    var maze = [];
    var [mazeHeight, mazeWidth] = [height * 2 + 1, width * 2 + 1];
    for (var y = 0; y < mazeHeight; y++) {
        maze.push([]);
        for (var x = 0; x < mazeWidth; x++) {
            maze[y].push(wall);
        }
    }

    /**
     * Convert maze definition into a nested array that's easy to use
     */

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            [mazeH, mazeW] = [y * 2 + 1, x * 2 + 1];
            if (grid[y][x].includes(N) || grid[y][x].includes(S) || grid[y][x].includes(E) || grid[y][x].includes(W)) {
                maze[mazeH][mazeW] = empty;
            }
            if (grid[y][x].includes(N) && y > 1) {
                maze[mazeH - 1][mazeW] = empty;
            }
            if (grid[y][x].includes(S) && y < mazeHeight - 1) {
                maze[mazeH + 1][mazeW] = empty;
            }
            if (grid[y][x].includes(E) && x < mazeWidth - 1) {
                maze[mazeH][mazeW + 1] = empty;
            }
            if (grid[y][x].includes(W) && x > 1) {
                maze[mazeH][mazeW - 1] = empty;
            }
        }
    }

    // place the start location in a random open corner
    var [placedStart, placedEnd] = [false, false];
    while (!placedStart) {
        var y = parseInt(Math.random() * (mazeHeight - 2)) + 1;
        var x = parseInt(Math.random() * (mazeWidth - 2)) + 1;
        if (isCorner(maze, x, y)) {
            maze[y][x] = start;
            placedStart = true;
        }
    }
    // place the end location in a random open corner
    while (!placedEnd) {
        var y = parseInt(Math.random() * (mazeHeight - 2)) + 1;
        var x = parseInt(Math.random() * (mazeHeight - 2)) + 1;
        if (isCorner(maze, x, y)) {
            maze[y][x] = end;
            placedEnd = true;
        }
    }

    return maze;
}
