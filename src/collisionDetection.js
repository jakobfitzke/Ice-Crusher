export function detectCollision(ball, gameObject) {
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
