const frameRate = 60
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

const startButton = $('#start')[0]
const replayButton = $('#replay')[0]
const defeatText = $('#defeatText')[0]
const game = $('#game')[0]
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
            for (let i = 0; i < snake.tail.length; i++) {
                if (snake.tail[i].cellX === cell.cellX && snake.tail[i].cellY === cell.cellY) {
                    break
                }
                spawned = true
            }
        }

        gameArea.pieLocation = cell
        console.log('Spawned pie at: ' + cell.cellX + ' ' + cell.cellY)
    }
}

const snake = {
    tail: [],
    tailLength: 4,
    startPos: {
        cellX: 7,
        cellY: 7
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
            cellX: 7,
            cellY: 7
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function refreshArea() {
    if (snake.dead) {
        defeatText.style = 'display: block'
        startButton.style = 'display: none'
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
    renderTailSubHead(snake.tail[0], nextDirection, sequenceNum, mod)
    //renderTailHead(snake.tail[0], subHeadCoords, nextDirection, tailSubHeadNextDirection, sequenceNum, mod)
    renderTailEnd(lostTailEnd, tailEndNextDirection, sequenceNum, mod, tailLost)
    renderPie()

    frames++
    setTimeout(refreshArea, deltaTime)
}

function renderTailHead(head, subHeadCoords, nextDirection, subHeadDirection, sequenceNum, mod) {
    if (!snakeHead) {
        snakeHead = new Image(cellSize, cellSize)
        snakeHead.onload = function () {
            _renderTailHead(head, subHeadCoords, nextDirection, subHeadDirection, sequenceNum, mod)
        }
        snakeHead.src = snakeHeadSrc
    } else {
        _renderTailHead(head, subHeadCoords, nextDirection, subHeadDirection, sequenceNum, mod)
    }
}

function _renderTailHead(head, subHeadCoords, nextDirection, subHeadDirection, sequenceNum, mod) {
    let scale = (sequenceNum + 1) / mod
    if (nextDirection === 'left') {
        gameArea.context.drawImage(snakeHead, (subHeadCoords.cellX + (1 - scale)) * cellSize, subHeadCoords.cellY * cellSize, cellSize, cellSize)
    } else if (nextDirection === 'right') {
        gameArea.context.drawImage(snakeHead, subHeadCoords.cellX * cellSize, subHeadCoords.cellY * cellSize, cellSize, cellSize)
    } else if (nextDirection === 'down') {
        gameArea.context.drawImage(snakeHead, subHeadCoords.cellX * cellSize, subHeadCoords.cellY * cellSize , cellSize, cellSize)
    } else if (nextDirection === 'up') {
        gameArea.context.drawImage(snakeHead, subHeadCoords.cellX * cellSize, (subHeadCoords.cellY + (1 - scale)) * cellSize, cellSize, cellSize)
    }
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

function renderTailSubHead(subHead, direction, sequenceNum, mod) {
    let scale = (sequenceNum + 1) / mod
    let coords
    if (direction === 'left') {
        coords = {
            x: (subHead.cellX + (1 - scale)) * cellSize,
            y: subHead.cellY * cellSize,
            width: scale * cellSize,
            height: cellSize,
            imgX: (subHead.cellX - scale + 1) * cellSize,
            imgY: subHead.cellY * cellSize
        }
    } else if (direction === 'right') {
        coords = {
            x: subHead.cellX * cellSize,
            y: subHead.cellY * cellSize,
            width: scale * cellSize,
            height: cellSize,
            imgX: (subHead.cellX + scale - 1) * cellSize,
            imgY: subHead.cellY * cellSize
        }
    } else if (direction === 'down') {
        coords = {
            x: subHead.cellX * cellSize,
            y: subHead.cellY * cellSize,
            width: cellSize,
            height: scale * cellSize,
            imgX: subHead.cellX * cellSize,
            imgY: (subHead.cellY + scale - 1) * cellSize
        }
    } else if (direction === 'up') {
        coords = {
            x: subHead.cellX * cellSize,
            y: (subHead.cellY + (1 - scale)) * cellSize,
            width: cellSize,
            height: scale * cellSize,
            imgX: subHead.cellX * cellSize,
            imgY: (subHead.cellY - scale + 1) * cellSize
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

function initGame() {
    snake.init()
    gameArea.init()
    gameArea.spawnPie()
    renderPie()
}

let nextDirection
let lostTailEnd
let tailLost

startButton.addEventListener('click', function () {
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    refreshArea()
})
replayButton.addEventListener('click', function () {
    snake.reset()
    snake.init()
    gameArea.spawnPie()
    renderPie()
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    startButton.style = 'display: block'
    replayButton.style = 'display: none'
    refreshArea()
})

$().ready(function () {
    initGame()
    window.addEventListener('keydown', function (e) {
        if (keysToDirections[e.key]) {
            snake.changeDirection(keysToDirections[e.key])
        }
    })
})
