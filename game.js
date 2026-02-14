let gameOver = false;

let nephewImg = new Image();
nephewImg.src = "images/camden.png";

let whaleImg = new Image();
whaleImg.src = "images/whale.png";

let buckImg = new Image();
buckImg.src = "images/buck.png";

let whaleBallsImg = new Image();
whaleBallsImg.src = "images/whaleBalls.png";

let hitCount = 0;
let hitFlashTimer = 0;

let spawnDelay = 2000;
let spawnInterval = null;

let phase = "whale";
let buckWaveInterval = null;
let buckWaveActive = false;
let pendingResume = false;

let whales = [];
let bucks = [];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let nephew = {
    x: 0,
    y: 0,
    width: 150,
    height: 150,
    speed: 7
};

let keys = {};

function resizeCanvas() {
    let baseWidth = 675;
    let baseHeight = 900;
    let controlSpace = 120;
    let availableHeight = window.innerHeight - controlSpace;
    let scale = Math.min(window.innerWidth / baseWidth, availableHeight / baseHeight);
    scale = Math.min(scale, 1);
    canvas.style.width = baseWidth * scale + "px";
    canvas.style.height = baseHeight * scale + "px";
    canvas.width = baseWidth;
    canvas.height = baseHeight;

    if (!nephew.x) {
        nephew.x = canvas.width / 2 - nephew.width / 2;
    }
    positionNephew();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function moveNephew() {
    if (gameOver) return;
    if (keys["ArrowLeft"] && nephew.x > 0) nephew.x -= nephew.speed;
    if (keys["ArrowRight"] && nephew.x + nephew.width < canvas.width) nephew.x += nephew.speed;
}

function drawNephew() {
    ctx.drawImage(nephewImg, nephew.x, nephew.y, nephew.width, nephew.height);
}

function positionNephew() {
    nephew.y = canvas.height - nephew.height - 20;
}

function spawnWhale() {
    whales.push({
        x: Math.random() * (canvas.width - 90),
        y: 80,
        width: 90,
        height: 70,
        timer: 60
    });
}

function spawnBuck() {
    bucks.push({
        x: Math.random() * (canvas.width - 120),
        y: 80,
        width: 120,
        height: 100,
        timer: 60
    });
}

function startWhaleSpawning() {
    clearInterval(spawnInterval);
    spawnInterval = setInterval(() => {
        if (!gameOver && phase === "whale") spawnWhale();
    }, spawnDelay);
}

function stopWhaleSpawning() {
    clearInterval(spawnInterval);
    spawnInterval = null;
}

function startBuckWave() {
    if (gameOver) return;

    phase = "buck";
    buckWaveActive = true;
    pendingResume = false;

    stopWhaleSpawning();
    whales = [];

    let spawnCount = 0;
    clearInterval(buckWaveInterval);
    buckWaveInterval = setInterval(() => {
        if (gameOver) return;

        spawnBuck();
        spawnCount++;

        if (spawnCount >= 6) {
            clearInterval(buckWaveInterval);
            buckWaveInterval = null;
        }
    }, 700);
}

function resumeWhalesAfterBuckWave() {
    if (pendingResume) return;
    pendingResume = true;

    setTimeout(() => {
        if (gameOver) return;

        buckWaveActive = false;
        phase = "whale";

        spawnDelay = Math.max(500, spawnDelay - 250);
        startWhaleSpawning();
        pendingResume = false;
    }, 1200);
}

function moveWhales() {
    if (gameOver) return;
    if (phase !== "whale") return;

    for (let i = whales.length - 1; i >= 0; i--) {
        let whale = whales[i];

        if (whale.timer > 0) whale.timer--;
        else whale.y += 8;

        if (whale.y > canvas.height) whales.splice(i, 1);
    }
}

function moveBucks() {
    if (gameOver) return;
    if (phase !== "buck") return;

    for (let i = bucks.length - 1; i >= 0; i--) {
        let buck = bucks[i];

        if (buck.timer > 0) buck.timer--;
        else buck.y += 8;

        if (buck.y > canvas.height) bucks.splice(i, 1);
    }

    if (buckWaveActive && bucks.length === 0 && buckWaveInterval === null) {
        resumeWhalesAfterBuckWave();
    }
}

function drawWhales() {
    for (let whale of whales) {
        ctx.drawImage(whaleImg, whale.x, whale.y, whale.width, whale.height);
    }
}

function drawBucks() {
    for (let buck of bucks) {
        ctx.drawImage(buckImg, buck.x, buck.y, buck.width, buck.height);
    }
}

function detectCatch() {
    if (gameOver) return;
    if (phase !== "whale") return;

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

            if (hitCount >= 10 && (hitCount - 10) % 5 === 0 && spawnDelay > 500) {
                startBuckWave();
            }
        }
    }
}

function detectMiss() {
    if (gameOver) return;
    if (phase !== "whale") return;

    for (let whale of whales) {
        if (whale.y + whale.height >= canvas.height) {
            gameOver = true;
            hitFlashTimer = 9999;
            retryBtn.style.display = "block";
            break;
        }
    }
}

function detectBuckHit() {
    if (gameOver) return;
    if (phase !== "buck") return;

    for (let buck of bucks) {
        if (
            nephew.x < buck.x + buck.width &&
            nephew.x + nephew.width > buck.x &&
            nephew.y < buck.y + buck.height &&
            nephew.y + nephew.height > buck.y
        ) {
            gameOver = true;
            hitFlashTimer = 9999;
            retryBtn.style.display = "block";
            break;
        }
    }
}

function resetGame() {
    gameOver = false;
    hitCount = 0;
    hitFlashTimer = 0;

    phase = "whale";
    buckWaveActive = false;
    pendingResume = false;

    whales = [];
    bucks = [];

    clearInterval(buckWaveInterval);
    buckWaveInterval = null;

    stopWhaleSpawning();
    spawnDelay = 2000;
    startWhaleSpawning();

    nephew.x = canvas.width / 2 - nephew.width / 2;
    positionNephew();

    retryBtn.style.display = "none";
}

function drawCounter() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Whales: " + hitCount, 20, 40);
}

function drawHitFlash() {
    if (hitFlashTimer > 0) {
        ctx.save();
        let splashWidth = 360;
        let splashHeight = 240;
        let splashX = canvas.width / 2 - splashWidth / 2;
        let splashY = canvas.height / 2 - splashHeight / 2 - 120;
        ctx.drawImage(whaleBallsImg, splashX, splashY, splashWidth, splashHeight);
        ctx.restore();
        hitFlashTimer--;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveNephew();
    moveWhales();
    moveBucks();

    detectCatch();
    detectMiss();
    detectBuckHit();

    positionNephew();
    drawNephew();
    drawWhales();
    drawBucks();
    drawCounter();
    drawHitFlash();

    requestAnimationFrame(gameLoop);
}

startWhaleSpawning();
gameLoop();

function holdKey(key) {
    return function (e) {
        e.preventDefault();
        keys[key] = true;
    };
}

function releaseKey(key) {
    return function (e) {
        e.preventDefault();
        keys[key] = false;
    };
}

leftBtn.addEventListener("touchstart", holdKey("ArrowLeft"), { passive: false });
leftBtn.addEventListener("touchend", releaseKey("ArrowLeft"), { passive: false });
leftBtn.addEventListener("mousedown", holdKey("ArrowLeft"));
leftBtn.addEventListener("mouseup", releaseKey("ArrowLeft"));
leftBtn.addEventListener("mouseleave", releaseKey("ArrowLeft"));

rightBtn.addEventListener("touchstart", holdKey("ArrowRight"), { passive: false });
rightBtn.addEventListener("touchend", releaseKey("ArrowRight"), { passive: false });
rightBtn.addEventListener("mousedown", holdKey("ArrowRight"));
rightBtn.addEventListener("mouseup", releaseKey("ArrowRight"));
rightBtn.addEventListener("mouseleave", releaseKey("ArrowRight"));

let retryBtn = document.getElementById("retryBtn");

retryBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    resetGame();
}, { passive: false });

retryBtn.addEventListener("click", () => {
    resetGame();
});
