class Paddle {
  constructor(game) {
    this.width = 150;
    this.height = 30;
    this.gameWidth = game.gameWidth;
    this.maxSpeed = 7;
    this.speed = 0;
    this.position = {
      x: game.gameWidth / 2 - this.width / 2,
      y: game.gameHeight - this.height - 10
    };
  }

  moveLeft() {
    this.speed = -this.maxSpeed;
  }

  moveRight() {
    this.speed = this.maxSpeed;
  }

  stop() {
    this.speed = 0;
  }

  draw(ctx) {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(deltaTime) {
    this.position.x += this.speed;
    if (this.position.x < 0) {
      this.position.x = 0;
    }
    if (this.position.x + this.width > this.gameWidth) {
      this.position.x = this.gameWidth - this.width;
    }
  }
}

class InputHandler {
  constructor(paddle, game) {
    document.addEventListener("keydown", (event) => {
      switch (event.keyCode) {
        case 37:
          paddle.moveLeft();
          break;
        case 39:
          paddle.moveRight();
          break;
        case 27:
          game.togglePause();
          break;
        case 32:
          game.start();
          break;
        default:
          break;
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.keyCode) {
        case 37:
          if (paddle.speed < 0) {
            paddle.stop();
          }
          break;
        case 39:
          if (paddle.speed > 0) {
            paddle.stop();
          }
          break;
        default:
          break;
      }
    });
  }
}

function detectCollision(ball, gameObject) {
  let bottomOfBall = ball.position.y + ball.size;
  let topOfBall = ball.position.y;

  let topOfObject = gameObject.position.y;
  let bottomOfObject = gameObject.position.y + gameObject.height;
  let leftSideOfObject = gameObject.position.x;
  let rightSideOfObject = gameObject.position.x + gameObject.width;
  let sides = [];

  if (
    bottomOfBall >= topOfObject &&
    topOfBall <= bottomOfObject &&
    ball.position.x + ball.size >= leftSideOfObject &&
    ball.position.x <= rightSideOfObject
  ) {
    sides[0] = Math.abs(bottomOfBall - topOfObject);
    sides[1] = Math.abs(ball.position.x - rightSideOfObject);
    sides[2] = Math.abs(topOfBall - bottomOfObject);
    sides[3] = Math.abs(ball.position.x + ball.size - leftSideOfObject);
    let indexOfMaxValue = sides.reduce(
      (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
      0
    );
    return indexOfMaxValue;
  } else {
    return -1;
  }
}

class Ball {
  constructor(game) {
    this.image = document.getElementById("img_ball");
    this.reset();
    this.size = 16;
    this.gameWidth = game.gameWidth;
    this.gameHeight = game.gameHeight;
    this.game = game;
    this.dirChanged = false;
  }

  reset() {
    this.position = {
      x: this.gameWidth / 2 - this.size / 2 + 10,
      y: this.gameHeight - 64
    };
    this.speed = { x: 4, y: -2 };
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size,
      this.size
    );
  }

  update(deltaTime) {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    this.dirChanged = false;

    // collision walls
    if (this.position.x + this.size > this.gameWidth || this.position.x < 0) {
      this.speed.x = -this.speed.x;
    }
    if (this.position.y < 0) {
      this.speed.y = -this.speed.y;
    }

    // collision bottom
    if (this.position.y + this.size > this.gameHeight) {
      this.game.lives--;
      if (this.game.lives !== 0) {
        this.reset();
      }
    }

    if (detectCollision(this, this.game.paddle) !== -1) {
      this.speed.y = -this.speed.y;
      this.position.y = this.game.paddle.position.y - this.size;
    }
  }
}

class Brick {
  constructor(game, position) {
    this.image = document.getElementById("img_brick");
    this.position = position;
    this.width = 64;
    this.height = 64;
    this.game = game;

    this.markedForDeletion = false;
  }

  update() {
    let collisionSide = detectCollision(this.game.ball, this);
    if (collisionSide === 0 || collisionSide === 2) {
      if (!this.game.ball.dirChanged) {
        this.game.ball.speed.y = -this.game.ball.speed.y;
        this.game.ball.dirChanged = true;
      }
      this.markedForDeletion = true;
    }
    if (collisionSide === 1 || collisionSide === 3) {
      if (!this.game.ball.dirChanged) {
        this.game.ball.speed.x = -this.game.ball.speed.x;
        this.game.ball.dirChanged = true;
      }
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

function buildLevel(game, level) {
  let bricks = [];

  level.forEach((row, rowIndex) => {
    row.forEach((brick, brickIndex) => {
      if (brick === 1) {
        let position = {
          x: 64 + 64 * brickIndex,
          y: 64 + 64 * rowIndex
        };
        bricks.push(new Brick(game, position));
      }
    });
  });
  return bricks;
}

const level1 = [
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const level2 = [
  [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
];

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4
};

class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.gamestate = GAMESTATE.MENU;

    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 3;
    this.levels = [level1, level2];
    this.currentLevel = 0;
    new InputHandler(this.paddle, this);
  }

  start() {
    if (
      this.gamestate !== GAMESTATE.MENU &&
      this.gamestate !== GAMESTATE.NEWLEVEL
    ) {
      return;
    }

    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.gameObjects = [this.ball, this.paddle];
    this.gamestate = GAMESTATE.RUNNING;
    this.ball.reset();
  }

  update(deltaTime) {
    if (this.lives === 0) {
      this.gamestate = GAMESTATE.GAMEOVER;
    }

    if (
      this.gamestate === GAMESTATE.PAUSED ||
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER
    ) {
      return;
    }

    if (this.bricks.length === 0) {
      this.currentLevel++;
      if (this.currentLevel >= this.levels.length) {
        this.currentLevel = 0;
      }
      this.gamestate = GAMESTATE.NEWLEVEL;
      this.start();
    }

    [...this.gameObjects, ...this.bricks].forEach((object) =>
      object.update(deltaTime)
    );

    this.bricks = this.bricks.filter((brick) => !brick.markedForDeletion);
  }

  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx));

    if (this.gamestate === GAMESTATE.PAUSED) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      ctx.font = "bold 100px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2 + 20);
    }
    if (this.gamestate === GAMESTATE.MENU) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fill();

      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press Space to start",
        this.gameWidth / 2,
        this.gameHeight / 2 + 20
      );
    }
    if (this.gamestate === GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameHeight);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      ctx.font = "bold 100px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.textAlign = "center";
      ctx.fillText("Game Over", this.gameWidth / 2, this.gameHeight / 2 + 20);
    }
  }

  togglePause() {
    if (this.gamestate === GAMESTATE.PAUSED) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      this.gamestate = GAMESTATE.PAUSED;
    }
  }
}

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 832;
const GAME_HEIGHT = 832;

let game = new Game(GAME_WIDTH, GAME_HEIGHT);

let lastTime = 0;

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  game.update(deltaTime);
  game.draw(ctx);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
