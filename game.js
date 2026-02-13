let nephewImg = new Image();
nephewImg.src = "images/camden.png";

let whaleImg = new Image();
whaleImg.src = "images/whale.png";

let whaleBallsImg = new Image();
whaleBallsImg.src = "images/whaleBalls.png";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {

  let baseWidth = 675;
  let baseHeight = 900;

  let controlSpace = 180; // arrows + safari bar

  let availableHeight = window.innerHeight - controlSpace;

  let scale = Math.min(
    window.innerWidth / baseWidth,
    availableHeight / baseHeight
  );

  scale = Math.min(scale, 1);

  canvas.style.width = baseWidth * scale + "px";
  canvas.style.height = baseHeight * scale + "px";

  canvas.width = baseWidth;
  canvas.height = baseHeight;
}




resizeCanvas();
window.addEventListener("resize", resizeCanvas);


// ----------------------
// HIT COUNTER
// ----------------------

let hitCount = 0;
let hitFlashTimer = 0;

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

function positionNephew() {
  nephew.y = canvas.height - nephew.height - 80;
}


// ----------------------
// WHALES
// ----------------------

let whales = [];

function spawnWhale() {

  let whale = {
    x: Math.random() * (canvas.width - 90),
    y: 0,
    width: 90,
    height: 70,
    timer: 60
  };

  whales.push(whale);
}


setInterval(spawnWhale, 2000);

function moveWhales() {

  whales.forEach(whale => {

    if (whale.timer > 0) {
      whale.timer--;
    } else {
      whale.y += 8;
    }

  });

  whales = whales.filter(whale => whale.y < canvas.height);
}


function drawWhales() {

  whales.forEach(whale => {

    ctx.drawImage(
      whaleImg,
      whale.x,
      whale.y,
      whale.width,
      whale.height
    );

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

            whales.splice(i, 1);
            hitCount++;

            // SHOW "WHALE BALLS!" FOR ~1 SECOND
            hitFlashTimer = 60;
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

    positionNephew();
    drawNephew();
    drawWhales();
    drawCounter();
    drawHitFlash();


    requestAnimationFrame(gameLoop);
}

function drawHitFlash() {

  if (hitFlashTimer > 0) {

    ctx.save();

    let splashWidth = 250;
    let splashHeight = 150;

    let splashX = canvas.width / 2 - splashWidth / 2;
    let splashY = canvas.height / 2 - splashHeight / 2;

    ctx.drawImage(
      whaleBallsImg,
      splashX,
      splashY,
      splashWidth,
      splashHeight
    );

    ctx.restore();

    hitFlashTimer--;
  }
}





gameLoop();

function holdKey(key) {
  return function(e) {
    e.preventDefault();
    keys[key] = true;
  };
}

function releaseKey(key) {
  return function(e) {
    e.preventDefault();
    keys[key] = false;
  };
}

// LEFT BUTTON
leftBtn.addEventListener("touchstart", holdKey("ArrowLeft"), { passive:false });
leftBtn.addEventListener("touchend", releaseKey("ArrowLeft"), { passive:false });
leftBtn.addEventListener("mousedown", holdKey("ArrowLeft"));
leftBtn.addEventListener("mouseup", releaseKey("ArrowLeft"));
leftBtn.addEventListener("mouseleave", releaseKey("ArrowLeft"));

// RIGHT BUTTON
rightBtn.addEventListener("touchstart", holdKey("ArrowRight"), { passive:false });
rightBtn.addEventListener("touchend", releaseKey("ArrowRight"), { passive:false });
rightBtn.addEventListener("mousedown", holdKey("ArrowRight"));
rightBtn.addEventListener("mouseup", releaseKey("ArrowRight"));
rightBtn.addEventListener("mouseleave", releaseKey("ArrowRight"));


