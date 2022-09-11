const frameRate = 80
const deltaTime = Math.floor(1000 / frameRate)
const cellSize = 30
const xCells = 15
const yCells = 15
const keysToDirections = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown' : 'down'
}
const pieSrc = '../static/img/pie.png'
const snakeHeadSrc = '../static/img/face.png'

const replayButton = $('#replay')[0]
const defeatText = $('#defeatText')[0]
const game = $('#game')[0]
const hintText = $('#hintText')[0]
const pieCounterElement = $('.pie-count')[0]

let started = false
let pieCounter = 0

game.width = xCells * cellSize
game.height = yCells * cellSize

let pie
let snakeHead

let frames = 0

const gameArea = {
    canvas: document.createElement('canvas'),
    end: false,
    init: function () {
        this.canvas.width = xCells * cellSize
        this.canvas.height = yCells * cellSize
        this.canvas.style.width = xCells * cellSize + 'px';
        this.canvas.style.height = yCells * cellSize + 'px';
        this.context = this.canvas.getContext('2d')
        this.context.fillStyle = '#ffde00'

        this.canvas.classList.add('snake')
        game.insertBefore(this.canvas, game.firstChild)
    },
    spawnPie: function () {
        let spawned = false
        let cell
        while (!spawned) {
            cell = {
                cellX: getRandomInt(0, xCells),
                cellY: getRandomInt(0, yCells)
            }
            spawned = !pieOverlaps(snake.tail, cell)
        }

        gameArea.pieLocation = cell
        console.log('Spawned pie at: ' + cell.cellX + ' ' + cell.cellY)
        for (let i = 0; i < snake.tail.length; i++) {
            console.log(i + ': ' + snake.tail[i].cellX + ' ' + snake.tail[i].cellY)
        }
    }
}

const snake = {
    tail: [],
    tailLength: 4,
    startPos: {
        cellX: 3,
        cellY: 13
    },
    direction: 'right',
    directionChanged: false,
    speed: 10,
    dead: false,
    init: function () {
        for (let i = 0; i < this.tailLength; i++) {
            this.tail.push({
                cellX: this.startPos.cellX - i,
                cellY: this.startPos.cellY
            })
        }
    },
    reset: function () {
        snake.tail = []
        snake.tailLength = 4
        snake.startPos = {
            cellX: 3,
            cellY: 13
        }
        snake.direction = 'right'
        snake.dead = false
    },
    changeDirection: function (direction) {
        if (this.direction === 'up' && direction === 'down') {
            return;
        }
        if (this.direction === 'down' && direction === 'up') {
            return;
        }
        if (this.direction === 'left' && direction === 'right') {
            return;
        }
        if (this.direction === 'right' && direction === 'left') {
            return;
        }
        this.direction = direction
        this.directionChanged = true
        //console.log(direction)
    },
    updateTail: function (newPosition) {
        let newPos = newPosition
        for (let i = 0; i < this.tail.length; i++) {
            let temp = this.tail[i]
            this.tail[i] = newPos
            newPos = temp
        }
    },
    move: function () {
        let newPos
        //console.log('Tail head: ' + this.tail[0].cellX + ' ' + this.tail[0].cellY)
        if (this.direction === 'left') {
            newPos = {cellX: this.tail[0].cellX - 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'right') {
            newPos = {cellX: this.tail[0].cellX + 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'down') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY + 1}
        } else if (this.direction === 'up') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY - 1}
        }

        let tailEnd = this.tail[this.tail.length - 1]
        let tailLost

        if ((newPos.cellX >= xCells || newPos.cellY >= yCells || newPos.cellX < 0 || newPos.cellY < 0)
            || headOverlaps(this.tail)) {
            this.die()
        }

        // eat pie
        if (!gameArea.pieLocation ||
            (newPos.cellX !== gameArea.pieLocation.cellX || newPos.cellY !== gameArea.pieLocation.cellY)){
            this.updateTail(newPos)
            tailLost = true
        } else {
            this.tailLength++
            this.updateTail(newPos)
            this.tail.push(tailEnd)
            tailLost = false
            pieCounterElement.innerText = 'Pie count: ' + ++pieCounter
            gameArea.spawnPie()
        }

        return {
            nextDirection: this.direction.slice(),
            tailLost: tailLost,
            tailEnd: tailEnd
        }
    },
    die: function () {
        this.dead = true
    }
}

function headOverlaps(tail) {
    let head = tail[0]
    for (let i = 1; i < tail.length; i++) {
        if (head.cellX === tail[i].cellX && head.cellY === tail[i].cellY) {
            return true
        }
    }
    return false
}

function pieOverlaps(tail, cell) {
    for (let i = 0; i < snake.tail.length; i++) {
        if (snake.tail[i].cellX === cell.cellX && snake.tail[i].cellY === cell.cellY) {
            return true
        }
    }
    return false
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function refreshArea() {
    if (snake.dead) {
        defeatText.style = 'display: block'
        replayButton.style = 'display: block'
        return
    }
    let mod = Math.round(frameRate / snake.speed)
    let sequenceNum = frames % mod
    if (sequenceNum === 0) {
        let tuple = snake.move()
        nextDirection = tuple.nextDirection
        lostTailEnd = tuple.tailEnd
        tailLost = tuple.tailLost
    }
    gameArea.context.clearRect(0, 0, gameArea.canvas.width, gameArea.canvas.height)
    for (let i = 1; i < snake.tail.length; i++) {
        gameArea.context.fillRect(snake.tail[i].cellX * cellSize, snake.tail[i].cellY * cellSize, cellSize, cellSize)
    }
    let tailEndNextDirection = getTailNodeNextDirection(lostTailEnd, snake.tail[snake.tail.length - 1])
    renderTailHead(snake.tail[0], nextDirection, sequenceNum, mod)
    renderTailEnd(lostTailEnd, tailEndNextDirection, sequenceNum, mod, tailLost)
    renderPie()

    frames++
    setTimeout(refreshArea, deltaTime)
}

function renderImage(imgX, imgY) {
    if (!snakeHead) {
        snakeHead = new Image(cellSize, cellSize)
        snakeHead.onload = function () {
            gameArea.context.drawImage(snakeHead, imgX, imgY, cellSize, cellSize)
        }
        snakeHead.src = snakeHeadSrc
    } else {
        gameArea.context.drawImage(snakeHead, imgX, imgY, cellSize, cellSize)
    }
}

function renderTailHead(head, direction, sequenceNum, mod) {
    let scale = (sequenceNum + 1) / mod
    let coords
    if (direction === 'left') {
        coords = {
            x: (head.cellX + (1 - scale)) * cellSize,
            y: head.cellY * cellSize,
            width: scale * cellSize,
            height: cellSize,
            imgX: (head.cellX - scale + 1) * cellSize,
            imgY: head.cellY * cellSize
        }
    } else if (direction === 'right') {
        coords = {
            x: head.cellX * cellSize,
            y: head.cellY * cellSize,
            width: scale * cellSize,
            height: cellSize,
            imgX: (head.cellX + scale - 1) * cellSize,
            imgY: head.cellY * cellSize
        }
    } else if (direction === 'down') {
        coords = {
            x: head.cellX * cellSize,
            y: head.cellY * cellSize,
            width: cellSize,
            height: scale * cellSize,
            imgX: head.cellX * cellSize,
            imgY: (head.cellY + scale - 1) * cellSize
        }
    } else if (direction === 'up') {
        coords = {
            x: head.cellX * cellSize,
            y: (head.cellY + (1 - scale)) * cellSize,
            width: cellSize,
            height: scale * cellSize,
            imgX: head.cellX * cellSize,
            imgY: (head.cellY - scale + 1) * cellSize
        }
    }
    gameArea.context.fillRect(coords.x, coords.y, coords.width, coords.height)
    renderImage(coords.imgX, coords.imgY)

    return coords
}

function renderTailEnd(tailEnd, nextDirection, sequenceNum, mod, tailLost) {
    if (!tailLost) {
        return
    }
    let scale = (sequenceNum + 1) / mod
    if (nextDirection === 'left') {
        gameArea.context.fillRect(tailEnd.cellX * cellSize, tailEnd.cellY * cellSize, (1 - scale) * cellSize, cellSize)
    } else if (nextDirection === 'right') {
        gameArea.context.fillRect((tailEnd.cellX + scale) * cellSize, tailEnd.cellY * cellSize, (1 - scale) * cellSize, cellSize)
    } else if (nextDirection === 'down') {
        gameArea.context.fillRect(tailEnd.cellX * cellSize, (tailEnd.cellY + scale) * cellSize , cellSize, (1 - scale) * cellSize)
    } else if (nextDirection === 'up') {
        gameArea.context.fillRect(tailEnd.cellX * cellSize, tailEnd.cellY * cellSize, cellSize, (1 - scale) * cellSize)
    }
}

function renderPie() {
    if (!pie) {
        pie = new Image(cellSize, cellSize)
        pie.onload = function () {
            gameArea.context.drawImage(pie, gameArea.pieLocation.cellX * cellSize,
                gameArea.pieLocation.cellY * cellSize, cellSize, cellSize);
        }
        pie.src = pieSrc
    } else {
        gameArea.context.drawImage(pie, gameArea.pieLocation.cellX * cellSize,
            gameArea.pieLocation.cellY * cellSize, cellSize, cellSize);
    }
}

function getTailNodeNextDirection(previous, next) {
    if (next.cellX - previous.cellX < 0) {
        return 'left'
    }
    if (next.cellX - previous.cellX > 0) {
        return 'right'
    }
    if (next.cellY - previous.cellY > 0) {
        return 'down'
    }
    if (next.cellY - previous.cellY < 0) {
        return 'up'
    }
}

function initRender() {
    gameArea.context.clearRect(0, 0, gameArea.canvas.width, gameArea.canvas.height)
    renderPie()
    for (let i = 1; i < snake.tail.length; i++) {
        gameArea.context.fillRect(snake.tail[i].cellX * cellSize, snake.tail[i].cellY * cellSize, cellSize, cellSize)
        renderImage(snake.tail[0].cellX * cellSize, snake.tail[0].cellY * cellSize)
    }
}

function initGame(initArea= true) {
    snake.init()
    if (initArea) {
        gameArea.init()
    }
    replayButton.style = 'display: none'
    defeatText.style = 'display: none'
    hintText.style = 'display: block'
    pieCounterElement.innerText = 'Pie count: 0'
    pieCounter = 0
    frames = 0
    nextDirection = snake.direction.slice()
    tailLost = false
    lostTailEnd = undefined
    started = false
    gameArea.spawnPie()
    initRender()
}

let nextDirection
let lostTailEnd
let tailLost

replayButton.addEventListener('click', function () {
    snake.reset()
    initGame(false)
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    replayButton.style = 'display: none'
})

$().ready(function () {
    initGame()
    window.addEventListener('keydown', function (e) {
        if (keysToDirections[e.key]) {
            if (!started) {
                refreshArea()
                started = true
                hintText.style = 'display: none'
            }
            snake.changeDirection(keysToDirections[e.key])
        }
    })
})
