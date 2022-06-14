import { detectCollision } from "./collisionDetection";

export default class Ball {
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
