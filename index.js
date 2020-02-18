var dim = 30;
var maze = getMaze(dim, dim);

var [START, END, EMPTY, TRAVERSED, WALL] = ['s', 'e', ' ', 't', 'x'];

var colors = {
    's': 'red',
    'e': 'blue',
    ' ': 'white',
    't': 'lightgreen',
    'x': 'grey'
}

var queue = [];
var bestPaths = {};
var searchCount = 0;
var times = { 'p': 0, 'd': 0, 'w': 0 };
var lastTime = (new Date).getTime();

var mazeW = maze[0].length;
var mazeH = maze.length;

var mazeId = 'maze';

var dim = 7;

function setDimension() {
    let winW = $(window).width() - 20;
    let winH = $(window).height() * 0.75;
    dim = Math.max(Math.min(winW / mazeW, winH / mazeH), 1);
}

function setDisplay() {
    var tableStr = '';
    for (var row = 0; row < maze.length; row++) {
        tableStr += '<tr>';
        for (var col = 0; col < maze[row].length; col++) {
            let square = maze[row][col];
            let bg = (colors[square] != undefined) ? colors[square] : 'grey';
            tableStr += '<td id="' + getSqId({ 'x': col, 'y': row }) +
                '" style="background-color:' + bg + ';width:' + dim + 'px;height:' + dim + 'px;"></td>';
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

function traverse() {
    times['w'] += (new Date).getTime() - lastTime;
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
            times['p'] += (new Date).getTime() - lastTime;
            lastTime = (new Date).getTime();
            if (maze[y][x] != START) {
                maze[y][x] = TRAVERSED;
                this.updateDisplay(sq);
            }
            times['d'] += (new Date).getTime() - lastTime;
            lastTime = (new Date).getTime();
            window.postMessage('iterate', '*');
        }
    }
}

async function handleMessage(event) {
    if ((new Date).getTime() - lastTime >= Math.max(15000/(mazeW * mazeH), 1)) {
        traverse();
    } else {
        window.postMessage('iterate', '*');
    }
}

window.addEventListener('message', handleMessage, false);

window.onload = function () {
    this.setDimension();
    this.setDisplay();
    this.queue.push({ 'sq': this.findSquare(this.START), 'path': [] });
    this.traverse();
}
