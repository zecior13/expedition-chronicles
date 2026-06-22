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

kayakImage.onload = function(){
    kayakImageLoaded = true;
};

kayakImage.src = "assets/kayak.svg";

function showScreen(id){

    document.querySelectorAll('.screen')
    .forEach(screen=>{
        screen.classList.remove('active');
    });

    document
        .getElementById(id)
        .classList.add('active');
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

    localStorage.setItem(
        'players',
        JSON.stringify(players)
    );

    document.getElementById(
        'expeditionTitle'
    ).innerText =
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

        if(e.key === "ArrowLeft"){
            moveLeft = true;
        }

        if(e.key === "ArrowRight"){
            moveRight = true;
        }
    };

    document.onkeyup = (e)=>{

        if(e.key === "ArrowLeft"){
            moveLeft = false;
        }

        if(e.key === "ArrowRight"){
            moveRight = false;
        }
    };
}

function drawWater(){

    ctx.fillStyle = "#63b7df";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    waterOffset += 1.5;

    if(waterOffset > 80){
        waterOffset = 0;
    }

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;

    for(let y = -80 + waterOffset; y < canvas.height + 80; y += 80){

        ctx.beginPath();

        for(let x = 0; x <= canvas.width; x += 40){

            const wave =
                Math.sin((x + y) * 0.02) * 8;

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

        const x =
            (canvas.width / 7) * (i + 1);

        const y =
            (waterOffset * 3 + i * 90) % canvas.height;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 35);

        ctx.stroke();
    }
}

function drawKayak(){

    const elapsed =
        (performance.now() - startTime) / 1000;

    const sway =
        Math.sin(elapsed * 3) * 0.04;

    const width = 44;
    const height = 88;

    ctx.save();

    ctx.translate(kayakX, kayakY);
    ctx.rotate(sway);

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

function update(){

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
}

function gameLoop(){

    drawWater();

    drawMovementLines();

    update();

    drawKayak();

    animationId =
        requestAnimationFrame(gameLoop);
}

window.onload = function(){

    const savedName =
        localStorage.getItem('expeditionName');

    if(savedName){

        document.getElementById(
            'expeditionTitle'
        ).innerText = savedName;

        showScreen('mapScreen');
    }
};