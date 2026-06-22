let canvas, ctx;

let kayakX = 200;
let kayakY = 450;

let moveLeft = false;
let moveRight = false;

let animationId = null;
let waterOffset = 0;

let kayakImage = new Image();
let kayakImageLoaded = false;

let startTime = 0;
let rocks = [];
let lives = 4;
let score = 0;
let gameSeconds = 60;
let gameRunning = false;
let invincibleUntil = 0;

let driftDirection = 1;
let lastDriftChange = 0;
let lastClusterSpawn = 0;

kayakImage.onload = function(){
    kayakImageLoaded = true;
};

kayakImage.src = "assets/kayak.svg";

function showScreen(id){
    document.querySelectorAll(".screen").forEach(screen=>{
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}

function saveExpedition(){
    localStorage.setItem(
        "expeditionName",
        document.getElementById("expeditionName").value
    );

    showScreen("playersScreen");
}

function savePlayers(){
    const players = [
        document.getElementById("player1").value,
        document.getElementById("player2").value,
        document.getElementById("player3").value
    ];

    localStorage.setItem("players", JSON.stringify(players));

    document.getElementById("expeditionTitle").innerText =
        localStorage.getItem("expeditionName");

    showScreen("mapScreen");
}

function openWalvisBay(){
    showScreen("walvisScreen");
}

function startKayakGame(){
    showScreen("kayakScreen");

    setTimeout(()=>{
        initCanvas();
    },150);
}

function stopKayakGame(){
    if(animationId){
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    gameRunning = false;
    moveLeft = false;
    moveRight = false;
}

function initCanvas(){
    canvas = document.getElementById("kayakCanvas");
    ctx = canvas.getContext("2d");

    if(!resizeCanvas(false)){
        requestAnimationFrame(initCanvas);
        return;
    }

    kayakX = canvas.width / 2;
    setKayakY();

    waterOffset = 0;
    startTime = performance.now();

    rocks = [];
    lives = 4;
    score = 0;
    gameSeconds = 60;
    gameRunning = true;
    invincibleUntil = 0;
    lastClusterSpawn = 0;

    driftDirection = 1;
    lastDriftChange = performance.now();

    setupControls();

    if(animationId){
        cancelAnimationFrame(animationId);
    }

    gameLoop();
}

function setKayakY(){
    kayakY = canvas.height - 115;
}

function resizeCanvas(preserveState){
    if(!canvas){
        return false;
    }

    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);

    if(nextWidth <= 0 || nextHeight <= 0){
        return false;
    }

    if(canvas.width === nextWidth && canvas.height === nextHeight){
        return true;
    }

    const previousWidth = canvas.width || nextWidth;
    const previousHeight = canvas.height || nextHeight;
    const scaleX = nextWidth / previousWidth;
    const scaleY = nextHeight / previousHeight;

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    if(preserveState){
        kayakX *= scaleX;

        for(const rock of rocks){
            rock.x *= scaleX;
            rock.y *= scaleY;
        }
    }

    setKayakY();

    return true;
}

function setupControls(){
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");

    leftBtn.onmousedown = ()=> moveLeft = true;
    rightBtn.onmousedown = ()=> moveRight = true;

    leftBtn.onmouseup = ()=> moveLeft = false;
    rightBtn.onmouseup = ()=> moveRight = false;

    leftBtn.onmouseleave = ()=> moveLeft = false;
    rightBtn.onmouseleave = ()=> moveRight = false;

    leftBtn.ontouchstart = e=>{
        e.preventDefault();
        moveLeft = true;
    };

    leftBtn.ontouchend = e=>{
        e.preventDefault();
        moveLeft = false;
    };

    rightBtn.ontouchstart = e=>{
        e.preventDefault();
        moveRight = true;
    };

    rightBtn.ontouchend = e=>{
        e.preventDefault();
        moveRight = false;
    };

    document.onkeydown = e=>{
        if(e.key === "ArrowLeft") moveLeft = true;
        if(e.key === "ArrowRight") moveRight = true;
    };

    document.onkeyup = e=>{
        if(e.key === "ArrowLeft") moveLeft = false;
        if(e.key === "ArrowRight") moveRight = false;
    };
}

function getElapsed(){
    return Math.floor((performance.now() - startTime) / 1000);
}

function getDifficulty(){
    const elapsed = getElapsed();

    if(elapsed < 20){
        return 1;
    }

    if(elapsed < 40){
        return 2;
    }

    return 3;
}

function getWorldSpeed(){
    const difficulty = getDifficulty();
    const isNarrow = canvas && canvas.width < 520;

    const speed =
        difficulty === 1 ? 2.7 :
        difficulty === 2 ? 3.45 :
        4.2;

    if(isNarrow){
        return speed + 0.25;
    }

    return speed;
}

function getSpawnDelay(){
    const difficulty = getDifficulty();
    const isNarrow = canvas && canvas.width < 520;

    if(isNarrow && difficulty === 1) return 1500;
    if(isNarrow && difficulty === 2) return 1350;
    if(isNarrow && difficulty === 3) return 1200;

    if(difficulty === 1) return 1250;
    if(difficulty === 2) return 1050;
    return 880;
}

function drawWater(){
    ctx.fillStyle = "#63b7df";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    waterOffset += getWorldSpeed() * 0.55;

    if(waterOffset > 80){
        waterOffset = 0;
    }

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;

    for(let y = -80 + waterOffset; y < canvas.height + 80; y += 80){
        ctx.beginPath();

        for(let x = 0; x <= canvas.width; x += 40){
            const wave = Math.sin((x + y) * 0.02) * 8;

            if(x === 0){
                ctx.moveTo(x, y + wave);
            }else{
                ctx.lineTo(x, y + wave);
            }
        }

        ctx.stroke();
    }
}

function drawMovementLines(){
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.lineWidth = 3;

    for(let i = 0; i < 7; i++){
        const x = (canvas.width / 8) * (i + 1);
        const y = (waterOffset * 3 + i * 90) % canvas.height;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
    }
}

function drawHud(){
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(12, 10, canvas.width - 24, 44);

    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";

    const hearts = "❤️".repeat(lives);
    const remaining = Math.max(0, gameSeconds - getElapsed());
    const level = getDifficulty();

    ctx.fillText(hearts, 28, 39);
    ctx.fillText("Punkty: " + score, canvas.width / 2 - 60, 39);
    ctx.fillText("Czas: " + remaining, canvas.width - 145, 39);

    ctx.font = "14px Arial";
    ctx.fillText("Poziom: " + level, canvas.width / 2 + 85, 38);
}

function drawKayak(){
    const elapsed = (performance.now() - startTime) / 1000;
    const sway = Math.sin(elapsed * 3) * 0.04;

    const width = 44;
    const height = 88;

    const now = performance.now();
    const isInvincible = now < invincibleUntil;

    ctx.save();
    ctx.translate(kayakX, kayakY);
    ctx.rotate(sway);

    if(isInvincible){
        ctx.globalAlpha = 0.45 + Math.sin(now * 0.03) * 0.25;
    }

    if(kayakImageLoaded){
        ctx.drawImage(
            kayakImage,
            -width / 2,
            -height / 2,
            width,
            height
        );
    }else{
        ctx.fillStyle = "#8b5a2b";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 42, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#d8c090";
        ctx.fillRect(-25, -2, 50, 4);
    }

    ctx.restore();
}

function createRock(x, y, radius){
    return {
        x,
        y,
        radius
    };
}

function spawnCluster(now){
    const delay = getSpawnDelay();

    if(now - lastClusterSpawn < delay){
        return;
    }

    lastClusterSpawn = now;

    const w = canvas.width;
    const y = -50;

    const difficulty = getDifficulty();
    const isNarrow = canvas.width < 520;

    const r =
        isNarrow && difficulty === 1 ? 16 :
        isNarrow && difficulty === 2 ? 17 :
        isNarrow && difficulty === 3 ? 18 :
        difficulty === 1 ? 20 :
        difficulty === 2 ? 22 :
        24;

    let patterns = [];

    if(isNarrow && difficulty === 1){
        patterns = [
            [
                createRock(w * 0.28, y, r)
            ],
            [
                createRock(w * 0.72, y, r)
            ],
            [
                createRock(w * 0.24, y, r),
                createRock(w * 0.64, y - 130, r)
            ],
            [
                createRock(w * 0.76, y, r),
                createRock(w * 0.36, y - 130, r)
            ],
            [
                createRock(w * 0.12, y, r)
            ],
            [
                createRock(w * 0.88, y, r)
            ]
        ];
    }

    if(isNarrow && difficulty === 2){
        patterns = [
            [
                createRock(w * 0.24, y, r),
                createRock(w * 0.62, y - 145, r)
            ],
            [
                createRock(w * 0.76, y, r),
                createRock(w * 0.38, y - 145, r)
            ],
            [
                createRock(w * 0.34, y, r),
                createRock(w * 0.72, y - 155, r)
            ],
            [
                createRock(w * 0.66, y, r),
                createRock(w * 0.28, y - 155, r)
            ],
            [
                createRock(w * 0.12, y, r),
                createRock(w * 0.68, y - 150, r)
            ],
            [
                createRock(w * 0.88, y, r),
                createRock(w * 0.32, y - 150, r)
            ]
        ];
    }

    if(isNarrow && difficulty === 3){
        patterns = [
            [
                createRock(w * 0.24, y, r),
                createRock(w * 0.66, y - 165, r)
            ],
            [
                createRock(w * 0.76, y, r),
                createRock(w * 0.34, y - 165, r)
            ],
            [
                createRock(w * 0.32, y, r),
                createRock(w * 0.70, y - 175, r)
            ],
            [
                createRock(w * 0.68, y, r),
                createRock(w * 0.30, y - 175, r)
            ],
            [
                createRock(w * 0.12, y, r),
                createRock(w * 0.70, y - 180, r)
            ],
            [
                createRock(w * 0.88, y, r),
                createRock(w * 0.30, y - 180, r)
            ]
        ];
    }

    if(!isNarrow && difficulty === 1){
        patterns = [
            [
                createRock(w * 0.20, y, r),
                createRock(w * 0.72, y - 10, r)
            ],
            [
                createRock(w * 0.78, y, r),
                createRock(w * 0.30, y - 10, r)
            ],
            [
                createRock(w * 0.50, y, r),
                createRock(w * 0.20, y - 80, r)
            ],
            [
                createRock(w * 0.10, y, r)
            ],
            [
                createRock(w * 0.90, y, r)
            ]
        ];
    }

    if(!isNarrow && difficulty === 2){
        patterns = [
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.28, y - 22, r),
                createRock(w * 0.72, y - 12, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.70, y - 22, r),
                createRock(w * 0.30, y - 12, r)
            ],
            [
                createRock(w * 0.40, y, r),
                createRock(w * 0.60, y - 65, r)
            ],
            [
                createRock(w * 0.22, y, r),
                createRock(w * 0.50, y - 70, r),
                createRock(w * 0.78, y - 140, r)
            ],
            [
                createRock(w * 0.10, y, r),
                createRock(w * 0.62, y - 95, r)
            ],
            [
                createRock(w * 0.90, y, r),
                createRock(w * 0.38, y - 95, r)
            ]
        ];
    }

    if(!isNarrow && difficulty === 3){
        patterns = [
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.30, y - 18, r),
                createRock(w * 0.62, y - 10, r),
                createRock(w * 0.82, y - 22, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.70, y - 20, r),
                createRock(w * 0.38, y - 12, r),
                createRock(w * 0.18, y - 28, r)
            ],
            [
                createRock(w * 0.20, y, r),
                createRock(w * 0.50, y - 65, r),
                createRock(w * 0.80, y - 130, r),
                createRock(w * 0.45, y - 190, r)
            ],
            [
                createRock(w * 0.80, y, r),
                createRock(w * 0.50, y - 65, r),
                createRock(w * 0.20, y - 130, r),
                createRock(w * 0.55, y - 190, r)
            ],
            [
                createRock(w * 0.10, y, r),
                createRock(w * 0.35, y - 95, r),
                createRock(w * 0.74, y - 190, r)
            ],
            [
                createRock(w * 0.90, y, r),
                createRock(w * 0.65, y - 95, r),
                createRock(w * 0.26, y - 190, r)
            ]
        ];
    }

    const chosen =
        patterns[Math.floor(Math.random() * patterns.length)];

    for(const rock of chosen){
        rocks.push(rock);
    }
}

function updateRocks(){
    const worldSpeed = getWorldSpeed();

    for(let rock of rocks){
        rock.y += worldSpeed;
    }

    rocks = rocks.filter(
        rock => rock.y < canvas.height + 90
    );
}

function drawSingleRock(x, y, r){
    ctx.fillStyle = "#6b6258";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
}

function drawRocks(){
    for(const rock of rocks){
        drawSingleRock(rock.x, rock.y, rock.radius);
    }
}

function checkCollisions(){
    const now = performance.now();

    if(now < invincibleUntil){
        return;
    }

    for(const rock of rocks){
        const dx = kayakX - rock.x;
        const dy = kayakY - rock.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < rock.radius + 25){
            lives--;
            invincibleUntil = now + 1000;

            rock.y = canvas.height + 100;

            if(lives <= 0){
                endKayakGame(false);
            }

            return;
        }
    }
}

function update(){
    const now = performance.now();

    if(now - lastDriftChange > 4000){
        driftDirection *= -1;
        lastDriftChange = now;
    }

    kayakX += driftDirection * 0.35;

    const speed = 4.2;

    if(moveLeft){
        kayakX -= speed;
    }

    if(moveRight){
        kayakX += speed;
    }

    if(kayakX < 30){
        kayakX = 30;
    }

    if(kayakX > canvas.width - 30){
        kayakX = canvas.width - 30;
    }

    score = getElapsed() * 10;

    if(getElapsed() >= gameSeconds){
        endKayakGame(true);
    }
}

function drawEndScreen(won){
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "34px Arial";
    ctx.fillText(
        won ? "🏁 META!" : "💀 KONIEC WYPRAWY",
        canvas.width / 2,
        canvas.height / 2 - 50
    );

    ctx.font = "21px Arial";
    ctx.fillText(
        won ? "Dotarłeś do końca laguny." : "Kajak wymaga naprawy.",
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.fillText(
        "Wynik: " + score,
        canvas.width / 2,
        canvas.height / 2 + 40
    );

    ctx.fillText(
        "Kliknij Wróć i spróbuj ponownie.",
        canvas.width / 2,
        canvas.height / 2 + 85
    );

    ctx.textAlign = "start";
}

function endKayakGame(won){
    gameRunning = false;

    drawWater();
    drawMovementLines();
    drawRocks();
    drawKayak();
    drawHud();
    drawEndScreen(won);

    if(animationId){
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function gameLoop(){
    const now = performance.now();

    resizeCanvas(true);

    drawWater();
    drawMovementLines();

    if(gameRunning){
        spawnCluster(now);
        updateRocks();
        update();
        checkCollisions();
    }

    drawRocks();
    drawKayak();
    drawHud();

    if(gameRunning){
        animationId = requestAnimationFrame(gameLoop);
    }
}

window.onload = function(){
    const savedName = localStorage.getItem("expeditionName");

    if(savedName){
        document.getElementById("expeditionTitle").innerText = savedName;
        showScreen("mapScreen");
    }
};

window.onresize = function(){
    resizeCanvas(true);
};
