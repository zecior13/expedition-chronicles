let canvas;
let ctx;

let kayakX = 200;
let kayakY = 450;

let moveLeft = false;
let moveRight = false;

let animationId = null;

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
    }
}

function initCanvas(){

    canvas = document.getElementById('kayakCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 130;

    kayakX = canvas.width / 2;
    kayakY = canvas.height - 120;

    setupControls();

    gameLoop();
}

function setupControls(){

    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    leftBtn.onmousedown = ()=> moveLeft = true;
    rightBtn.onmousedown = ()=> moveRight = true;

    leftBtn.onmouseup = ()=> moveLeft = false;
    rightBtn.onmouseup = ()=> moveRight = false;

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

    ctx.fillStyle = "#6bb7e8";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

function drawKayak(){

    ctx.fillStyle = "#8b5a2b";

    ctx.beginPath();

    ctx.ellipse(
        kayakX,
        kayakY,
        40,
        15,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#d8c090";

    ctx.fillRect(
        kayakX - 3,
        kayakY - 25,
        6,
        50
    );
}

function update(){

    const speed = 5;

    if(moveLeft){
        kayakX -= speed;
    }

    if(moveRight){
        kayakX += speed;
    }

    if(kayakX < 40){
        kayakX = 40;
    }

    if(kayakX > canvas.width - 40){
        kayakX = canvas.width - 40;
    }
}

function gameLoop(){

    drawWater();

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