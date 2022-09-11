const frameRate = 60
const deltaTime = Math.floor(1000 / frameRate)
const cellSize = 20
const xCells = 15
const yCells = 15
const keysToDirections = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown' : 'down'
}
const pieSrc = '../static/img/pie.png'
let pie

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
        console.log(direction)
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
            nextDirection: this.direction,
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
    let tailEndNextDirection = getTailEndNextDirection(lostTailEnd, snake.tail[snake.tail.length - 1])
    renderTailHead(snake.tail[0], nextDirection, sequenceNum, mod)
    renderTailEnd(lostTailEnd, tailEndNextDirection, sequenceNum, mod, tailLost)
    renderPie()

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
    gameArea.spawnPie()
    renderPie()
}

let nextDirection
let lostTailEnd
let tailLost

const startButton = $('#start')[0]
const defeatText = $('#defeatText')[0]
startButton.addEventListener('click', function () {
    console.log('Frame updates every ' + deltaTime + ' ms with framerate: ' + frameRate)
    refreshArea()
})

$().ready(function () {
    initGame()
    window.addEventListener('keydown', function (e) {
        if (keysToDirections[e.key]) {
            console.log(keysToDirections[e.key])
            snake.changeDirection(keysToDirections[e.key])
        }
    })
})
