var mazeDim = 30;
var maze, queue, bestPaths, bestPathIdx, searchCount, lastTime, mazeW, mazeH, sqDim;

var [START, END, EMPTY, TRAVERSED, WALL, BESTPATH] = ['s', 'e', ' ', 't', 'x', 'b'];

var colors = {
    's': 'red',
    'e': 'blue',
    ' ': 'white',
    't': 'lightgreen',
    'x': 'grey',
    'b': '#bea5df'
}

var mazeId = 'maze';

function setMaze() {
    maze = getMaze(mazeDim, mazeDim, START, END, EMPTY, WALL);
    mazeW = maze[0].length;
    mazeH = maze.length;
    queue = [];
    bestPaths = {};
    bestPathIdx = 1;
    searchCount = 0;
    lastTime = (new Date).getTime();
    updateDimensions();
    setMazeDisplay();
}

function updateDimensions() {
    let winW = $(window).width() - 20;
    let winH = $(window).height() * 0.75;
    sqDim = Math.max(Math.min(winW / mazeW, winH / mazeH), 1);
}

function setMazeDisplay() {
    var tableStr = '';
    for (var row = 0; row < maze.length; row++) {
        tableStr += '<tr>';
        for (var col = 0; col < maze[row].length; col++) {
            let square = maze[row][col];
            let bg = (colors[square] != undefined) ? colors[square] : 'grey';
            tableStr += '<td id="' + getSqId({ 'x': col, 'y': row }) +
                '" style="background-color:' + bg + ';width:' + sqDim + 'px;height:' + sqDim + 'px;"></td>';
        }
        tableStr += '</tr>';
    }
    $('#' + mazeId).html(tableStr);
}

function updateDisplay(sq) {
    let [x, y] = [sq.x, sq.y];
    let squareVal = maze[y][x];
    let bg = (colors[squareVal] != undefined) ? colors[squareVal] : 'grey';
    document.getElementById(getSqId(sq)).style.backgroundColor = bg;
}

function findSquare(val) {
    for (var y = 0; y < maze.length; y++) {
        for (var x = 0; x < maze[y].length; x++) {
            if (maze[y][x] == val) {
                return { 'x': x, 'y': y };
            }
        }
    }
    throw Error("Square with value '" + val + "' does not exist");
}

function getOptions(sq) {
    let options = [];
    let [x, y] = [sq.x, sq.y];
    if (x != 0) { options.push({ 'x': x - 1, 'y': y }); }
    if (x != mazeW - 1) { options.push({ 'x': x + 1, 'y': y }); }
    if (y != 0) { options.push({ 'x': x, 'y': y - 1 }); }
    if (y != mazeH - 1) { options.push({ 'x': x, 'y': y + 1 }); }
    return options.filter(o => [EMPTY, END].includes(maze[o.y][o.x]));
}

function sortQueue() {
    for (var i = 0; i < queue.length; i++) {
        for (var j = 0; j < queue.length; j++) {
            if (queue[i].path.length > queue[j].path.length) {
                let tmp = queue[i];
                queue[i] = queue[j];
                queue[j] = tmp;
            }
        }
    }
}

function getSqId(sq) {
    return String(sq.x) + ',' + String(sq.y);
}

function traverseBFS() {
    lastTime = (new Date).getTime();
    let endSqStr = getSqId(findSquare(END));
    if (queue.length > 0 && bestPaths[endSqStr] == undefined) {
        searchCount++;
        let opt = queue.pop();
        let [sq, path] = [opt.sq, opt.path];
        let [x, y] = [sq.x, sq.y];
        let sqStr = getSqId(sq);
        bestPaths[sqStr] = path;
        let newPath = path.concat(sq)
        if (sqStr != endSqStr) {
            let options = getOptions(sq).map(o => {
                return { 'sq': o, 'path': newPath }
            });
            options.forEach(o => queue.push(o));
            sortQueue();
            lastTime = (new Date).getTime();
            if (maze[y][x] != START) {
                maze[y][x] = TRAVERSED;
                updateDisplay(sq);
            }
            lastTime = (new Date).getTime();
            window.postMessage('traverseBFS', '*');
        } else {
            setTimeout(traverseBestPath, 1000);
        }
    } else if (queue.length == 0 && bestPaths[endSqStr] == undefined) {
        queue.push({ 'sq': findSquare(START), 'path': [] });
        window.postMessage('traverseBFS', '*');
    }
}

function traverseBestPath() {
    lastTime = (new Date).getTime();
    let endSqStr = getSqId(findSquare(END));
    let path = bestPaths[endSqStr];
    if (path != undefined && bestPathIdx < path.length) {
        let sq = path[bestPathIdx++];
        maze[sq.y][sq.x] = BESTPATH;
        updateDisplay(sq);
        window.postMessage('traverseBestPath', '*');
    }
}

async function handleMessage(event) {
    let messageMap = {
        'traverseBFS': traverseBFS,
        'traverseBestPath': traverseBestPath
    }
    let interval = {
        'traverseBFS': Math.max(15000 / (mazeW * mazeH), 1),
        'traverseBestPath': Math.max(50000 / (mazeW * mazeH), 1)
    }
    Object.keys(messageMap).forEach(key => {
        if (key == event.data) {
            if ((new Date).getTime() - lastTime >= interval[key]) {
                messageMap[key]();
            } else {
                window.postMessage(event.data, '*');
            }
        }
    })
}

window.addEventListener('message', handleMessage, false);

window.onload = function () {
    this.setMaze();
    this.traverseBFS();
}
