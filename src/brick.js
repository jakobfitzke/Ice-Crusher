import { detectCollision } from "./collisionDetection";

export default class Brick {
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
