function getMaze(width, height) {

    function carve_passages_from(cx, cy, grid) {
        var directions = shuffle(dirs);

        directions.forEach(function (direction) {
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

    function shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    function sum(arr) {
        return arr.reduce((a, b) => a + b, 0);
    }

    function isCorner(maze, w, h) {
        var wallCount = 0;
        if (maze[h + 1][w] == 'x') { wallCount++ }
        if (maze[h - 1][w] == 'x') { wallCount++ }
        if (maze[h][w + 1] == 'x') { wallCount++ }
        if (maze[h][w - 1] == 'x') { wallCount++ }
        return wallCount == 3;
    }

    var grid = [];

    for (var h = 0; h < height; h++) {
        grid.push([]);
        for (var w = 0; w < width; w++) {
            grid[h].push([]);
        }
    }

    var [N, S, E, W] = [1, 2, 4, 8];
    var dirs = ['N', 'E', 'S', 'W'];
    var dirsValue = { N: N, E: E, S: S, W: W };
    var DX = { E: 1, W: -1, N: 0, S: 0 };
    var DY = { E: 0, W: 0, N: -1, S: 1 };
    var OPPOSITE = { E: W, W: E, N: S, S: N };

    carve_passages_from(0, 0, grid);

    var maze = [];
    var [mazeHeight, mazeWidth] = [height * 2 + 1, width * 2 + 1];
    for (var h = 0; h < mazeHeight; h++) {
        maze.push([]);
        for (var w = 0; w < mazeWidth; w++) {
            maze[h].push('x');
        }
    }

    for (var h = 0; h < height; h++) {
        for (var w = 0; w < width; w++) {
            [mazeH, mazeW] = [h * 2 + 1, w * 2 + 1];
            if (grid[h][w].includes(N) || grid[h][w].includes(S) || grid[h][w].includes(E) || grid[h][w].includes(W)) {
                maze[mazeH][mazeW] = ' ';
            }
            if (grid[h][w].includes(N) && h > 1) {
                maze[mazeH - 1][mazeW] = ' ';
            }
            if (grid[h][w].includes(S) && h < mazeHeight - 1) {
                maze[mazeH + 1][mazeW] = ' ';
            }
            if (grid[h][w].includes(E) && w < mazeWidth - 1) {
                maze[mazeH][mazeW + 1] = ' ';
            }
            if (grid[h][w].includes(W) && w > 1) {
                maze[mazeH][mazeW - 1] = ' ';
            }
        }
    }

    var [placedStart, placedEnd] = [false, false];
    while (!placedStart) {
        var h = parseInt(Math.random() * mazeHeight - 2, 10) + 1;
        var w = parseInt(Math.random() * mazeWidth - 2, 10) + 1;
        if (maze[h][w] == ' ' && isCorner(maze, w, h)) {
            maze[h][w] = 's';
            placedStart = true;
        }
    }
    while (!placedEnd) {
        var h = parseInt(Math.random() * mazeHeight - 2, 10) + 1;
        var w = parseInt(Math.random() * mazeWidth - 2, 10) + 1;
        if (maze[h][w] == ' ' && isCorner(maze, w, h)) {
            maze[h][w] = 'e';
            placedEnd = true;
        }
    }
    return maze;
}
