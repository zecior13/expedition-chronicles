let canvas;
let ctx;

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
    document.querySelectorAll('.screen').forEach(screen=>{
        screen.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

function saveExpedition(){
    localStorage.setItem(
        'expeditionName',
        document.getElementById('expeditionName').value
    );
    showScreen('playersScreen');
}

function savePlayers(){
    const players = [
        document.getElementById('player1').value,
        document.getElementById('player2').value,
        document.getElementById('player3').value
    ];

    localStorage.setItem('players', JSON.stringify(players));

    document.getElementById('expeditionTitle').innerText =
        localStorage.getItem('expeditionName');

    showScreen('mapScreen');
}

function openWalvisBay(){
    showScreen('walvisScreen');
}

function startKayakGame(){
    showScreen('kayakScreen');

    setTimeout(()=>{
        initCanvas();
    },100);
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
    canvas = document.getElementById('kayakCanvas');
    ctx = canvas.getContext('2d');

    const maxWidth = 900;
    const maxHeight = 520;

    canvas.width = Math.min(window.innerWidth, maxWidth);
    canvas.height = Math.min(window.innerHeight - 130, maxHeight);

    kayakX = canvas.width / 2;
    kayakY = canvas.height - 115;

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

function setupControls(){
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    leftBtn.onmousedown = ()=> moveLeft = true;
    rightBtn.onmousedown = ()=> moveRight = true;

    leftBtn.onmouseup = ()=> moveLeft = false;
    rightBtn.onmouseup = ()=> moveRight = false;

    leftBtn.onmouseleave = ()=> moveLeft = false;
    rightBtn.onmouseleave = ()=> moveRight = false;

    leftBtn.ontouchstart = (e)=>{
        e.preventDefault();
        moveLeft = true;
    };

    leftBtn.ontouchend = ()=>{
        moveLeft = false;
    };

    rightBtn.ontouchstart = (e)=>{
        e.preventDefault();
        moveRight = true;
    };

    rightBtn.ontouchend = ()=>{
        moveRight = false;
    };

    document.onkeydown = (e)=>{
        if(e.key === "ArrowLeft") moveLeft = true;
        if(e.key === "ArrowRight") moveRight = true;
    };

    document.onkeyup = (e)=>{
        if(e.key === "ArrowLeft") moveLeft = false;
        if(e.key === "ArrowRight") moveRight = false;
    };
}

function drawWater(){
    ctx.fillStyle = "#63b7df";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    waterOffset += 1.5;

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
    ctx.strokeStyle = "rgba(255,255,255,0.40)";
    ctx.lineWidth = 3;

    for(let i = 0; i < 6; i++){
        const x = (canvas.width / 7) * (i + 1);
        const y = (waterOffset * 3 + i * 90) % canvas.height;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 30);
        ctx.stroke();
    }
}

function drawHud(){
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fillRect(10, 10, canvas.width - 20, 46);

    ctx.fillStyle = "#111";
    ctx.font = "20px Arial";

    const hearts = "❤️".repeat(lives);
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    const remaining = Math.max(0, gameSeconds - elapsed);

    ctx.fillText(hearts, 25, 40);
    ctx.fillText("Punkty: " + score, canvas.width / 2 - 60, 40);
    ctx.fillText("Czas: " + remaining, canvas.width - 130, 40);
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
        x: x,
        y: y,
        radius: radius,
        speed: 3
    };
}

function spawnCluster(now){
    if(now - lastClusterSpawn < 1050){
        return;
    }

    lastClusterSpawn = now;

    const w = canvas.width;
    const y = -45;
    const r = 22;

    const patterns = [
        // lewy klaster + prawa pojedyncza
        [
            createRock(w * 0.18, y, r),
            createRock(w * 0.28, y - 22, r),
            createRock(w * 0.72, y - 12, r)
        ],

        // prawy klaster + lewa pojedyncza
        [
            createRock(w * 0.82, y, r),
            createRock(w * 0.70, y - 22, r),
            createRock(w * 0.30, y - 12, r)
        ],

        // środek zablokowany, przejścia bokami
        [
            createRock(w * 0.43, y, r),
            createRock(w * 0.53, y - 18, r),
            createRock(w * 0.63, y, r)
        ],

        // slalom lewy-środek-prawy
        [
            createRock(w * 0.22, y, r),
            createRock(w * 0.50, y - 70, r),
            createRock(w * 0.78, y - 140, r)
        ],

        // slalom prawy-środek-lewy
        [
            createRock(w * 0.78, y, r),
            createRock(w * 0.50, y - 70, r),
            createRock(w * 0.22, y - 140, r)
        ],

        // brama przesunięta w lewo
        [
            createRock(w * 0.10, y, r),
            createRock(w * 0.22, y - 8, r),
            createRock(w * 0.68, y, r),
            createRock(w * 0.82, y - 8, r)
        ],

        // brama przesunięta w prawo
        [
            createRock(w * 0.18, y, r),
            createRock(w * 0.32, y - 8, r),
            createRock(w * 0.78, y, r),
            createRock(w * 0.90, y - 8, r)
        ]
    ];

    const chosen =
        patterns[Math.floor(Math.random() * patterns.length)];

    for(let rock of chosen){
        rocks.push(rock);
    }
}

function updateRocks(){
    const worldSpeed = 3;

    for(let rock of rocks){
        rock.y += worldSpeed;
    }

    rocks = rocks.filter(
        rock => rock.y < canvas.height + 80
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
    for(let rock of rocks){
        drawSingleRock(rock.x, rock.y, rock.radius);
    }
}

function checkCollisions(){
    const now = performance.now();

    if(now < invincibleUntil){
        return;
    }

    for(let rock of rocks){
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

    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    score = elapsed * 10;

    if(elapsed >= gameSeconds){
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
    const savedName = localStorage.getItem('expeditionName');

    if(savedName){
        document.getElementById('expeditionTitle').innerText = savedName;
        showScreen('mapScreen');
    }
};