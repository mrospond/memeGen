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
    speed: 8,
    init: function () {
        for (let i = 0; i < this.tailLength; i++) {
            this.tail.push({
                cellX: this.startPos.cellX - i,
                cellY: this.startPos.cellY
            })
        }
        this.currentDestination = {cellX: this.startPos.cellX + 1, cellY: this.startPos.cellY}
        this._tail = this._copyTailWithRealCoords()
        this._currentDestination = {x: (this.startPos.cellX + 1) * cellSize, y: this.startPos.cellY * cellSize}
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
        //this.direction = direction
        this.keyPressQueue.push(direction)
    },
    moveDestination: function () {
        let newPos
        console.log('Tail head: ' + this.tail[0].cellX + ' ' + this.tail[0].cellY)
        if (this.direction === 'left') {
            newPos = {cellX: this.tail[0].cellX - 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'right') {
            newPos = {cellX: this.tail[0].cellX + 1, cellY: this.tail[0].cellY}
        } else if (this.direction === 'up') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY - 1}
        } else if (this.direction === 'down') {
            newPos = {cellX: this.tail[0].cellX, cellY: this.tail[0].cellY + 1}
        }
        this._currentDestination = {x: newPos.cellX * cellSize, y: newPos.cellY * cellSize}
        this.currentDestination = newPos
    },
    updateTail: function (newPosition) {
        let newPos = newPosition
        for (let i = 0; i < this.tail.length; i++) {
            let temp = this.tail[i]
            this.tail[i] = newPos
            newPos = temp
        }
    },
    _copyTailWithRealCoords: function () {
        let tailCopy = []
        for (let i = 0; i < this.tail.length; i++) {
            let cell = this.tail[i]
            let positionCopy = {x: cell.cellX * cellSize, y: cell.cellY * cellSize}
            tailCopy.push(positionCopy)
        }
        return tailCopy
    },

    _moveTowardsDestination: function () {
        let deltaX = Math.abs(this._currentDestination.x - this._tail[0].x)
        let deltaY = Math.abs(this._currentDestination.y - this._tail[0].y)

        if (deltaX < this._deltaPosition && deltaY < this._deltaPosition) {
            this.updateTail(this.currentDestination)
            this._tail = this._copyTailWithRealCoords()
            this.direction = this.keyPressQueue.shift()
            this.keyPressQueue = []
            this.moveDestination()
        } else if (deltaX > 0) {
            let sign = Math.sign(deltaX)
            for (let i = 0; i < this._tail.length; i++) {
                this._tail[i].x += sign * this._deltaPosition
            }
        } else if (deltaY > 0) {
            let sign = Math.sign(deltaY)
            for (let i = 0; i < this._tail.length; i++) {
                this._tail[i].y += sign * this._deltaPosition
            }
        }
    }
}

function refreshArea() {
    gameArea.context.clearRect(0, 0, gameArea.canvas.width, gameArea.canvas.height)
    for (let i = 0; i < snake._tail.length; i++) {
        gameArea.context.fillRect(snake._tail[i].x, snake._tail[i].y, cellSize, cellSize)
    }
    snake._moveTowardsDestination()
    setTimeout(refreshArea, deltaTime)
}

function initGame() {
    snake.init()
    gameArea.init()
}

function startGame() {
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    refreshArea()
}

$().ready(function () {
    initGame()
    window.addEventListener('keydown', function (e) {
        console.log(keysToDirections[e.key])
        snake.changeDirection(keysToDirections[e.key])
    })
})
