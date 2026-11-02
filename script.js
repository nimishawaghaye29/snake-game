const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tileCount = canvas.width / tileSize;

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const messageElement = document.getElementById("message");

let snake;
let apple;
let direction;
let nextDirection;
let score;
let best = 0;
let gameTimer = null;
let isRunning = false;
let isOver = false;

function resetGame() {
  clearInterval(gameTimer);
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isRunning = false;
  isOver = false;
  scoreElement.textContent = score;
  messageElement.textContent = "Press Start to play";
  placeApple();
  draw();
}

function placeApple() {
  do {
    apple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(part => part.x === apple.x && part.y === apple.y));
}

function draw() {
  ctx.fillStyle = "#101a12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid
  ctx.strokeStyle = "#1d2b1f";
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }

  // Apple
  ctx.fillStyle = "#ef4545";
  ctx.beginPath();
  ctx.arc(
    apple.x * tileSize + tileSize / 2,
    apple.y * tileSize + tileSize / 2,
    tileSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(apple.x * tileSize + 9, apple.y * tileSize + 1, 3, 5);

  // Snake
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#c4f279" : "#65bd50";
    ctx.fillRect(
      part.x * tileSize + 1,
      part.y * tileSize + 1,
      tileSize - 2,
      tileSize - 2
    );
  });

  if (!isRunning && !isOver) {
    drawOverlay("SNAKE GAME", "Press Start");
  }

  if (isOver) {
    drawOverlay("GAME OVER", `Final score: ${score}`);
  }
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#c4f279";
  ctx.font = "bold 30px Arial";
  ctx.fillText(title, canvas.width / 2, 185);
  ctx.fillStyle = "#ffffff";
  ctx.font = "17px Arial";
  ctx.fillText(subtitle, canvas.width / 2, 220);
}

function gameStep() {
  direction = nextDirection;

  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const eatingApple = newHead.x === apple.x && newHead.y === apple.y;

  // Moving into the last tail square is allowed if the snake is not growing.
  const bodyToCheck = eatingApple ? snake : snake.slice(0, -1);
  const hitWall =
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= tileCount ||
    newHead.y >= tileCount;
  const hitSelf = bodyToCheck.some(
    part => part.x === newHead.x && part.y === newHead.y
  );

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (eatingApple) {
    score += 10;
    scoreElement.textContent = score;
    best = Math.max(best, score);
    bestElement.textContent = best;
    placeApple();
    // Increase speed gradually, with a safe minimum interval.
    clearInterval(gameTimer);
    gameTimer = setInterval(gameStep, Math.max(65, 150 - score));
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  if (isRunning || isOver) return;
  isRunning = true;
  messageElement.textContent = "Playing";
  clearInterval(gameTimer);
  gameTimer = setInterval(gameStep, Math.max(65, 150 - score));
  draw();
}

function pauseGame() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(gameTimer);
  messageElement.textContent = "Paused";
  draw();
}

function endGame() {
  isRunning = false;
  isOver = true;
  clearInterval(gameTimer);
  messageElement.textContent = "Game over! Press Restart to try again.";
  draw();
}

function changeDirection(newDirection) {
  // Prevent the snake from reversing directly into itself.
  if (
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y
  ) return;

  nextDirection = newDirection;
  if (!isRunning && !isOver) startGame();
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (directions[key]) {
    event.preventDefault();
    changeDirection(directions[key]);
  }

  if (key === " ") {
    event.preventDefault();
    if (isRunning) pauseGame();
    else startGame();
  }
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", pauseGame);
document.getElementById("restartBtn").addEventListener("click", resetGame);

document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("click", () => {
    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    changeDirection(directions[button.dataset.direction]);
  });
});

resetGame();
