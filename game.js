let nephewImg = new Image();
nephewImg.src = "images/camden.png";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ----------------------
// HIT COUNTER
// ----------------------

let hitCount = 0;

// ----------------------
// NEPHEW
// ----------------------

let nephew = {
  x: canvas.width / 2 - 45,
  y: canvas.height - 90 - 10,
  width: 90,
  height: 90,
  speed: 7
};



let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function moveNephew() {
  if (keys["ArrowLeft"] && nephew.x > 0) {
    nephew.x -= nephew.speed;
  }
  if (keys["ArrowRight"] && nephew.x + nephew.width < canvas.width) {
    nephew.x += nephew.speed;
  }
}

function drawNephew() {
  ctx.drawImage(
    nephewImg,
    nephew.x,
    nephew.y,
    nephew.width,
    nephew.height
  );
}


// ----------------------
// WHALES
// ----------------------

let whales = [];

function spawnWhale() {

  let whale = {
    x: Math.random() * (canvas.width - 60),
    y: 0,
    width: 60,
    height: 40,
    state: "warning",
    timer: 60
  };

  whales.push(whale);
}

setInterval(spawnWhale, 2000);

function moveWhales() {

  whales.forEach(whale => {

    if (whale.state === "warning") {
      whale.timer--;

      if (whale.timer <= 0) {
        whale.state = "falling";
      }
    }

    else if (whale.state === "falling") {
      whale.y += 10;
    }

  });

  whales = whales.filter(whale => whale.y < canvas.height);
}

function drawWhales() {

  whales.forEach(whale => {

    if (whale.state === "warning") {
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "cyan";
    }

    ctx.fillRect(whale.x, whale.y, whale.width, whale.height);

  });
}

// ----------------------
// COLLISION
// ----------------------

function detectHit() {

  for (let i = whales.length - 1; i >= 0; i--) {

    let whale = whales[i];

    if (
      nephew.x < whale.x + whale.width &&
      nephew.x + nephew.width > whale.x &&
      nephew.y < whale.y + whale.height &&
      nephew.y + nephew.height > whale.y
    ) {

      // REMOVE WHALE
      whales.splice(i, 1);

      // INCREMENT COUNTER
      hitCount++;
    }
  }
}

// ----------------------
// DRAW COUNTER
// ----------------------

function drawCounter() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Whales Hit: " + hitCount, 20, 40);
}

// ----------------------
// GAME LOOP
// ----------------------

function gameLoop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveNephew();
  moveWhales();
  detectHit();

  drawNephew();
  drawWhales();
  drawCounter();

  requestAnimationFrame(gameLoop);
}

gameLoop();
