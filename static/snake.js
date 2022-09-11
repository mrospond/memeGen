const frameRate = 60
const deltaTime = Math.floor(1000 / frameRate)
const cellSize = 10
const xCells = 28
const yCells = 28
const keysToDirections = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown' : 'down'
}
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

        this.canvas.classList.add('snake')
        $('#game')[0].appendChild(this.canvas)
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
    keyPressQueue: [],
    speed: 15,
    init: function () {
        for (let i = 0; i < this.tailLength; i++) {
            this.tail.push({
                cellX: this.startPos.cellX - i,
                cellY: this.startPos.cellY
            })
        }
        this._deltaPosition = deltaTime * ((this.speed * cellSize) / 1000)
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
        //this.keyPressQueue.push(direction)
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
        console.log('Tail head: ' + this.tail[0].cellX + ' ' + this.tail[0].cellY)
        console.log(this.direction)
        if (this.direction === 'left') {
            newPos = {cellX: this.tail[0].cellX - 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'right') {
            newPos = {cellX: this.tail[0].cellX + 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'down') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY + 1}
        } else if (this.direction === 'up') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY - 1}
        }
        let lostTailEnd = this.tail[this.tail.length - 1]
        this.updateTail(newPos)
        return {
            nextDirection: this.direction,
            lostTailEnd: lostTailEnd
        }
    }
}

function refreshArea() {
    let mod = Math.round(frameRate / snake.speed)
    let sequenceNum = frames % mod
    if (sequenceNum === 0) {
        console.log('Moved')
        let tuple = snake.move()
        nextDirection = tuple.nextDirection
        lostTailEnd = tuple.lostTailEnd
    }
    gameArea.context.clearRect(0, 0, gameArea.canvas.width, gameArea.canvas.height)
    for (let i = 1; i < snake.tail.length; i++) {
        gameArea.context.fillRect(snake.tail[i].cellX * cellSize, snake.tail[i].cellY * cellSize, cellSize, cellSize)
    }
    let tailEndNextDirection = getTailEndNextDirection(lostTailEnd, snake.tail[snake.tail.length - 1])
    renderTailHead(snake.tail[0], nextDirection, sequenceNum, mod)
    renderTailEnd(lostTailEnd, tailEndNextDirection, sequenceNum, mod)

    frames++
    setTimeout(refreshArea, deltaTime)
}

function renderTailHead(head, nextDirection, sequenceNum, mod) {
    let scale = (sequenceNum + 1) / mod
    if (nextDirection === 'left') {
        gameArea.context.fillRect((head.cellX + (1 - scale)) * cellSize, head.cellY * cellSize, scale * cellSize, cellSize)
    } else if (nextDirection === 'right') {
        gameArea.context.fillRect(head.cellX * cellSize, head.cellY * cellSize, scale * cellSize, cellSize)
    } else if (nextDirection === 'down') {
        gameArea.context.fillRect(head.cellX * cellSize, head.cellY * cellSize , cellSize, scale * cellSize)
    } else if (nextDirection === 'up') {
        gameArea.context.fillRect(head.cellX * cellSize, (head.cellY + (1 - scale)) * cellSize, cellSize, scale * cellSize)
    }
}

function renderTailEnd(tailEnd, nextDirection, sequenceNum, mod) {
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

function getTailEndNextDirection(lostTailEnd, currentTailEnd) {
    if (currentTailEnd.cellX - lostTailEnd.cellX < 0) {
        return 'left'
    }
    if (currentTailEnd.cellX - lostTailEnd.cellX > 0) {
        return 'right'
    }
    if (currentTailEnd.cellY - lostTailEnd.cellY > 0) {
        return 'down'
    }
    if (currentTailEnd.cellY - lostTailEnd.cellY < 0) {
        return 'up'
    }
}

function initGame() {
    snake.init()
    gameArea.init()
}

let nextDirection
let lostTailEnd
function startGame() {
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    refreshArea()
}

$().ready(function () {
    initGame()
    window.addEventListener('keydown', function (e) {
        if (keysToDirections[e.key]) {
            console.log(keysToDirections[e.key])
            snake.changeDirection(keysToDirections[e.key])
        }
    })
})
