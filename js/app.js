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
let lastPatternSpawn = 0;
let lives = 4;
let score = 0;
let gameSeconds = 60;
let gameRunning = false;
let invincibleUntil = 0;
let lastRockSpawn = 0;
let driftDirection = 1;
let lastDriftChange = 0;

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
    lastRockSpawn = 0;
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
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;

    for(let i = 0; i < 6; i++){
        const x = (canvas.width / 7) * (i + 1);
        const y = (waterOffset * 3 + i * 90) % canvas.height;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 35);
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

function spawnPattern(now){

    if(now - lastPatternSpawn < 2500){
        return;
    }

    lastPatternSpawn = now;

    const margin = 60;
    const width = canvas.width;

    const patterns = [

        // BRAMA

        [
            {x: margin},
            {x: width - margin}
        ],

        // LEWA ZAMKNIĘTA

        [
            {x: margin},
            {x: margin + 60}
        ],

        // PRAWA ZAMKNIĘTA

        [
            {x: width - margin},
            {x: width - margin - 60}
        ],

        // SLALOM

        [
            {x: margin},
            {x: width / 2},
            {x: width - margin}
        ],

        // ŚRODEK ZAMKNIĘTY

        [
            {x: width / 2}
        ]
    ];

    const pattern =
        patterns[
            Math.floor(Math.random() * patterns.length)
        ];

    pattern.forEach((item,index)=>{

        rocks.push({

            x: item.x,

            y: -60 - (index * 80),

            radius: 26,

            speed: 3
        });

    });
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

function drawRocks(){
    for(let rock of rocks){
        ctx.fillStyle = "#6b6258";
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.beginPath();
        ctx.arc(rock.x - 6, rock.y - 6, rock.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
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

        if(distance < rock.radius + 26){
            lives -= 1;
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

    if(kayakX < 35){
        kayakX = 35;
    }

    if(kayakX > canvas.width - 35){
        kayakX = canvas.width - 35;
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
        spawnPattern(now);
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