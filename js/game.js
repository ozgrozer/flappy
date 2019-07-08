class Game {
  constructor () {
    this.canvas = document.getElementById('game')
    this.ctx = this.canvas.getContext('2d')

    this.frameCount = 1
    this.givePoint = false
    this.score = 0

    this.velocity = 0
    this.gravity = 0.5
    this.lift = 7
    this.birdPosition = {}
    this.birdConfig = {
      width: 35,
      height: 25,
      border: 3
    }

    this.pipeConfig = {
      width: 50,
      border: 5,
      speed: 3,
      gap: 100,
      minHeight: 60,
      newPipeAtFrame: 70
    }
    this.pipes = []

    this.preloadSounds()
    this.startGame()
    this.birdJumpEvent()

    this.initializeCanvasSize()
  }

  initializeCanvasSize () {
    this.canvasSize()
    window.onresize = () => {
      this.canvasSize()
    }
  }
  canvasSize () {
    let canvasWidth = window.innerWidth
    let canvasHeight = window.innerHeight
    if (canvasWidth >= 600) {
      canvasWidth = 320
      canvasHeight = 480
    }
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
  }

  clearCanvas () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = '#70c4cd'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  preloadSounds () {
    new window.Howl({
      preload: true,
      src: ['./sfx/hit.wav']
    })
    new window.Howl({
      preload: true,
      src: ['./sfx/point.wav']
    })
    new window.Howl({
      preload: true,
      src: ['./sfx/swooshing.wav']
    })
    new window.Howl({
      preload: true,
      src: ['./sfx/wing.wav']
    })
  }

  playSound (props) {
    const sound = new window.Howl({
      src: ['./sfx/' + props.audio + '.wav']
    })

    sound.play()
  }

  birdJump () {
    this.velocity = -this.lift
    this.playSound({ audio: 'wing' })
  }
  birdJumpEvent () {
    document.body.onkeydown = (e) => {
      if (e.keyCode === 32) {
        this.birdJump()
      }
    }

    document.body.ontouchstart = (e) => {
      this.birdJump()
    }
  }

  drawBird () {
    this.ctx.beginPath()
    this.ctx.rect(this.birdPosition.x, this.birdPosition.y, this.birdConfig.width, this.birdConfig.height)
    this.ctx.fillStyle = '#d2bf2b'
    this.ctx.fill()
    this.ctx.lineWidth = this.birdConfig.border
    this.ctx.strokeStyle = '#000000'
    this.ctx.stroke()
  }

  fallingBird () {
    this.drawBird()

    this.velocity += this.gravity
    this.birdPosition.y += this.velocity

    if (this.birdPosition.y > this.canvas.height) {
      this.birdPosition.y = this.canvas.height
      this.velocity = 0
    }
  }

  drawPipe (props) {
    props.x -= this.pipeConfig.speed

    this.ctx.beginPath()
    this.ctx.rect(
      props.x,
      -this.pipeConfig.border,
      this.pipeConfig.width,
      props.topHeight
    )
    this.ctx.rect(
      props.x,
      (this.canvas.height - props.bottomHeight + this.pipeConfig.border),
      this.pipeConfig.width,
      props.bottomHeight
    )
    this.ctx.fillStyle = '#73bf2d'
    this.ctx.fill()
    this.ctx.lineWidth = this.pipeConfig.border
    this.ctx.strokeStyle = '#000000'
    this.ctx.stroke()
  }

  randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  generatePipe () {
    const minNumber = this.pipeConfig.minHeight
    const maxNumber = this.canvas.height - this.pipeConfig.gap - this.pipeConfig.minHeight
    const topHeight = this.randomInt(minNumber, maxNumber)
    const bottomHeight = this.canvas.height - topHeight - this.pipeConfig.gap

    return {
      x: this.canvas.width + this.pipeConfig.border,
      topHeight: topHeight,
      bottomHeight: bottomHeight
    }
  }

  newPipe () {
    if (this.frameCount % this.pipeConfig.newPipeAtFrame === 0) {
      this.pipes.push(this.generatePipe())
    }
  }

  removePipe (props) {
    if (props.pipeX < -(this.pipeConfig.width + this.pipeConfig.border)) {
      this.pipes.splice(props.i, 1)
      this.givePoint = false
    }
  }

  getBirdPosition () {
    const birdPositionXBeginning = this.birdPosition.x - this.birdConfig.border
    const birdPositionXEnd = birdPositionXBeginning + this.birdConfig.width + this.birdConfig.border
    const birdPositionYBeginning = this.birdPosition.y - this.birdConfig.border
    const birdPositionYEnd = birdPositionYBeginning + this.birdConfig.height + this.birdConfig.border

    return {
      birdPositionXBeginning: birdPositionXBeginning,
      birdPositionXEnd: birdPositionXEnd,
      birdPositionYBeginning: birdPositionYBeginning,
      birdPositionYEnd: birdPositionYEnd
    }
  }

  getFirstPipePosition () {
    const firstPipe = this.pipes[0]

    if (firstPipe) {
      const firstPipeXBeginning = firstPipe.x - this.pipeConfig.border
      const firstPipeXEnd = firstPipeXBeginning + this.pipeConfig.width + this.pipeConfig.border
      const firstPipeTopPipeYEnd = firstPipe.topHeight + this.pipeConfig.border
      const firstPipeBottomPipeYBeginning = this.canvas.height - firstPipe.bottomHeight + this.pipeConfig.border

      return {
        firstPipeXBeginning: firstPipeXBeginning,
        firstPipeXEnd: firstPipeXEnd,
        firstPipeTopPipeYEnd: firstPipeTopPipeYEnd,
        firstPipeBottomPipeYBeginning: firstPipeBottomPipeYBeginning
      }
    }
  }

  birdHitsPipe () {
    const firstPipe = this.pipes[0]

    if (firstPipe) {
      const getBirdPosition = this.getBirdPosition()
      const getFirstPipePosition = this.getFirstPipePosition()

      if (
        (
          getBirdPosition.birdPositionXEnd > getFirstPipePosition.firstPipeXBeginning &&
          getBirdPosition.birdPositionXBeginning < getFirstPipePosition.firstPipeXEnd
        ) &&
        (
          getBirdPosition.birdPositionYBeginning < getFirstPipePosition.firstPipeTopPipeYEnd ||
          getBirdPosition.birdPositionYEnd > getFirstPipePosition.firstPipeBottomPipeYBeginning
        )
      ) {
        this.playSound({ audio: 'hit' })
        this.startGame()
      }
    }
  }

  birdPassesPipe () {
    const firstPipe = this.pipes[0]

    if (firstPipe) {
      const getBirdPosition = this.getBirdPosition()
      const getFirstPipePosition = this.getFirstPipePosition()

      if (
        (
          !this.givePoint &&
          getBirdPosition.birdPositionXEnd > getFirstPipePosition.firstPipeXBeginning &&
          getBirdPosition.birdPositionXBeginning > getFirstPipePosition.firstPipeXEnd
        )
      ) {
        this.givePoint = true
        this.score++
        this.playSound({ audio: 'point' })
      }
    }
  }

  comingPipes () {
    this.newPipe()

    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i]
      this.drawPipe(pipe)
      this.removePipe({ i: i, pipeX: pipe.x })
    }
  }

  showScore () {
    document.getElementById('score').innerHTML = this.score
  }

  startGame () {
    this.givePoint = false
    this.score = 0
    this.frameCount = 1
    this.pipes = []
    this.birdPosition = {
      x: 50,
      y: 100
    }
    setTimeout(() => {
      this.playSound({ audio: 'swooshing' })
    }, 100)
  }

  render () {
    this.clearCanvas()

    this.comingPipes()

    this.fallingBird()
    this.birdHitsPipe()
    this.birdPassesPipe()

    this.showScore()

    this.frameCount++
    window.requestAnimationFrame(this.render.bind(this))
  }
}

const game = new Game()
game.render()
