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
let seals = [];
let fish = [];
let lives = 3;
let score = 0;
let bonusScore = 0;
let sealCount = 0;
let gameSeconds = 60;
let gameRunning = false;
let invincibleUntil = 0;
let sealMessageUntil = 0;

let driftDirection = 1;
let lastDriftChange = 0;
let lastClusterSpawn = 0;
let lastSealSpawn = 0;
let nextSealDelay = 15000;
let lastFishSpawn = 0;
let nextFishDelay = 4000;

let flamingoRunning = false;
let flamingoOffset = 0;
let flamingoSceneWidth = 0;
let flamingoViewportWidth = 0;
let flamingoDragging = false;
let flamingoDragStartX = 0;
let flamingoDragStartOffset = 0;
let binocularMode = false;
let flamingoMessageUntil = 0;
let flamingoAnimationId = null;
let flamingosFound = 0;
let secretsFound = [];
let wildlifeRunning = false;
let wildlifeBinocularMode = false;
let wildlifeMessageUntil = 0;
let wildlifeAnimationId = null;
let wildlifePhotosFound = 0;

const flamingoGroups = [
    { id: "flamingo-1", x: 0.14, y: 0.58, discovered: false, identified: false },
    { id: "flamingo-2", x: 0.31, y: 0.48, discovered: false, identified: false },
    { id: "flamingo-3", x: 0.49, y: 0.62, discovered: false, identified: false },
    { id: "flamingo-4", x: 0.68, y: 0.50, discovered: false, identified: false },
    { id: "flamingo-5", x: 0.87, y: 0.60, discovered: false, identified: false }
];

const flamingoSecrets = [
    { id: "seal", label: "🦭", x: 0.23, y: 0.68 },
    { id: "pelican", label: "🪿", x: 0.57, y: 0.30 },
    { id: "wreck", label: "⛵", x: 0.78, y: 0.72 }
];

const wildlifeTargets = [
    { id: "seal-1", type: "seal", label: "🦭", x: 8, y: 60, difficulty: "medium", found: false },
    { id: "seal-2", type: "seal", label: "🦭", x: 34, y: 69, difficulty: "easy", found: false },
    { id: "seal-3", type: "seal", label: "🦭", x: 43, y: 59, difficulty: "hard", found: false },
    { id: "seal-4", type: "seal", label: "🦭", x: 54, y: 55, difficulty: "very hard", found: false },
    { id: "seal-5", type: "seal", label: "🦭", x: 83, y: 62, difficulty: "medium", found: false },
    { id: "flamingo-1", type: "flamingo", label: "🦩", x: 9, y: 43, difficulty: "medium", found: false },
    { id: "flamingo-2", type: "flamingo", label: "🦩", x: 27, y: 40, difficulty: "easy", found: false },
    { id: "flamingo-3", type: "flamingo", label: "🦩", x: 47, y: 38, difficulty: "hard", found: false },
    { id: "flamingo-4", type: "flamingo", label: "🦩", x: 59, y: 47, difficulty: "very hard", found: false },
    { id: "flamingo-5", type: "flamingo", label: "🦩", x: 69, y: 43, difficulty: "extreme", found: false },
    { id: "pelican-1", type: "pelican", label: "🪿", x: 11, y: 75, difficulty: "easy", found: false },
    { id: "pelican-2", type: "pelican", label: "🪿", x: 42, y: 84, difficulty: "medium", found: false },
    { id: "pelican-3", type: "pelican", label: "🪿", x: 62, y: 58, difficulty: "hard", found: false },
    { id: "pelican-4", type: "pelican", label: "🪿", x: 72, y: 75, difficulty: "medium", found: false },
    { id: "pelican-5", type: "pelican", label: "🪿", x: 70, y: 5, difficulty: "extreme", found: false }
];

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

function startWildlifeSearch(){
    stopKayakGame();
    stopFlamingoObserver();
    showScreen("wildlifeScreen");

    wildlifeRunning = true;
    wildlifeBinocularMode = false;
    wildlifeMessageUntil = 0;

    const savedTargets = JSON.parse(localStorage.getItem("wildlifeTargetsFound") || "[]");

    for(const target of wildlifeTargets){
        target.found = savedTargets.includes(target.id);
    }

    renderWildlifeScene();
    updateWildlifeProgress();
    updateWildlifeBinocularButton();
    showWildlifeMessage("");

    if(wildlifeAnimationId){
        cancelAnimationFrame(wildlifeAnimationId);
    }

    wildlifeLoop();
}

function stopWildlifeSearch(){
    wildlifeRunning = false;

    if(wildlifeAnimationId){
        cancelAnimationFrame(wildlifeAnimationId);
        wildlifeAnimationId = null;
    }
}

function renderWildlifeScene(){
    const scene = document.getElementById("wildlifeScene");

    scene.dataset.sceneImage = "assets/wildlife/walvis-bay-search-01.png";
    scene.innerHTML = `
        <div class="wildlife-waterline"></div>
        <div class="wildlife-decor" style="left:8%;top:72%;font-size:2rem;">🪨</div>
        <div class="wildlife-decor" style="left:24%;top:61%;font-size:2rem;">🚤</div>
        <div class="wildlife-decor" style="left:46%;top:73%;font-size:2rem;">🪨</div>
        <div class="wildlife-decor" style="left:58%;top:47%;font-size:2.2rem;">⛵</div>
        <div class="wildlife-decor" style="left:80%;top:70%;font-size:2rem;">🪨</div>
        <div class="wildlife-decor" style="left:92%;top:48%;font-size:2rem;">🚤</div>
    `;

    for(const target of wildlifeTargets){
        const el = document.createElement("button");
        el.className = "wildlife-target";
        el.dataset.id = target.id;
        el.style.left = target.x + "%";
        el.style.top = target.y + "%";
        el.textContent = target.label;
        el.onclick = ()=> markWildlifeTargetFound(target.id);
        scene.appendChild(el);
    }

    updateWildlifeTargetStyles();
}

function toggleWildlifeBinoculars(){
    wildlifeBinocularMode = !wildlifeBinocularMode;
    updateWildlifeBinocularButton();
}

function updateWildlifeBinocularButton(){
    const screen = document.getElementById("wildlifeScreen");
    const button = document.getElementById("wildlifeBinocularBtn");

    screen.classList.toggle("binocular-active", wildlifeBinocularMode);
    button.classList.toggle("active", wildlifeBinocularMode);
}

function takeWildlifePhoto(){
    const target = getCenteredWildlifeTarget();

    if(target){
        markWildlifeTargetFound(target.id);
    }else{
        showWildlifeMessage(wildlifeBinocularMode ? "Przesuń kadr bliżej zwierzęcia." : "Włącz lornetkę i znajdź cel.");
    }
}

function getCenteredWildlifeTarget(){
    const viewport = document.getElementById("wildlifeViewport").getBoundingClientRect();
    const centerX = viewport.left + viewport.width / 2;
    const centerY = viewport.top + viewport.height / 2;
    let bestTarget = null;
    let bestDistance = Infinity;

    for(const target of wildlifeTargets){
        if(target.found){
            continue;
        }

        const el = document.querySelector('[data-id="' + target.id + '"]');
        const rect = el.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - centerX;
        const dy = rect.top + rect.height / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < bestDistance){
            bestDistance = distance;
            bestTarget = target;
        }
    }

    if(bestDistance < (wildlifeBinocularMode ? 130 : 70)){
        return bestTarget;
    }

    return null;
}

function markWildlifeTargetFound(id){
    const target = wildlifeTargets.find(item => item.id === id);

    if(!target || target.found){
        return;
    }

    target.found = true;
    showWildlifeMessage("📸 Zdjęcie zapisane: " + getWildlifeTypeLabel(target.type));
    updateWildlifeProgress();
    updateWildlifeTargetStyles();
}

function getWildlifeTypeLabel(type){
    if(type === "seal") return "Foka";
    if(type === "flamingo") return "Flaming";
    return "Pelikan";
}

function showWildlifeHint(){
    const remaining = wildlifeTargets.filter(target => !target.found);

    if(remaining.length === 0){
        return;
    }

    const target = remaining[Math.floor(Math.random() * remaining.length)];
    const el = document.querySelector('[data-id="' + target.id + '"]');

    if(el){
        el.classList.add("hint");
        showWildlifeMessage("Podpowiedź: szukaj " + getWildlifeTypeLabel(target.type).toLowerCase() + ".");

        setTimeout(()=>{
            el.classList.remove("hint");
        },1200);
    }
}

function showWildlifeChronicle(){
    showWildlifeMessage("Kronika: zapisano " + wildlifePhotosFound + " / 15 zdjęć.");
}

function updateWildlifeProgress(){
    wildlifePhotosFound = wildlifeTargets.filter(target => target.found).length;

    const seals = wildlifeTargets.filter(target => target.type === "seal" && target.found).length;
    const flamingos = wildlifeTargets.filter(target => target.type === "flamingo" && target.found).length;
    const pelicans = wildlifeTargets.filter(target => target.type === "pelican" && target.found).length;
    const foundIds = wildlifeTargets.filter(target => target.found).map(target => target.id);

    document.getElementById("wildlifePhotoProgress").innerText = "Zdjęcia " + wildlifePhotosFound + "/15";
    document.getElementById("sealObjective").innerText = "Foka " + seals + "/5";
    document.getElementById("flamingoObjective").innerText = "Flaming " + flamingos + "/5";
    document.getElementById("pelicanObjective").innerText = "Pelikan " + pelicans + "/5";

    localStorage.setItem("wildlifePhotosFound", String(wildlifePhotosFound));
    localStorage.setItem("wildlifeTargetsFound", JSON.stringify(foundIds));

    if(wildlifePhotosFound === 15){
        localStorage.setItem("wildlifeSearchCompleted", "true");
        stopWildlifeSearch();
        showScreen("wildlifeCompleteScreen");
    }
}

function updateWildlifeTargetStyles(){
    for(const target of wildlifeTargets){
        const el = document.querySelector('[data-id="' + target.id + '"]');

        if(el){
            el.classList.toggle("found", target.found);
        }
    }
}

function showWildlifeMessage(text){
    const message = document.getElementById("wildlifeMessage");

    if(!text){
        message.classList.remove("visible");
        message.innerText = "";
        return;
    }

    message.innerText = text;
    message.classList.add("visible");
    wildlifeMessageUntil = performance.now() + 1800;
}

function wildlifeLoop(){
    if(!wildlifeRunning){
        return;
    }

    if(performance.now() > wildlifeMessageUntil){
        showWildlifeMessage("");
    }

    wildlifeAnimationId = requestAnimationFrame(wildlifeLoop);
}

function addWildlifeToChronicle(){
    showScreen("walvisScreen");
}

function startFlamingoObserver(){
    stopKayakGame();
    showScreen("flamingoScreen");

    flamingoRunning = true;
    flamingoOffset = 0;
    binocularMode = false;
    flamingoMessageUntil = 0;
    secretsFound = JSON.parse(localStorage.getItem("secretsFound") || "[]");

    for(const group of flamingoGroups){
        group.discovered = false;
        group.identified = false;
    }

    renderFlamingoScene();
    setupFlamingoControls();
    updateFlamingoLayout();
    updateFlamingoProgress();
    updateBinocularButton();
    showFlamingoMessage("");

    if(flamingoAnimationId){
        cancelAnimationFrame(flamingoAnimationId);
    }

    flamingoLoop();
}

function stopFlamingoObserver(){
    flamingoRunning = false;

    if(flamingoAnimationId){
        cancelAnimationFrame(flamingoAnimationId);
        flamingoAnimationId = null;
    }
}

function renderFlamingoScene(){
    const panorama = document.getElementById("flamingoPanorama");

    panorama.innerHTML = `
        <div class="lagoon-band lagoon-water"></div>
        <div class="lagoon-band lagoon-shore"></div>
    `;

    const scenery = [
        { label: "🪨", x: 0.08, y: 0.72, className: "lagoon-small" },
        { label: "🚤", x: 0.18, y: 0.47, className: "lagoon-boat" },
        { label: "🪨", x: 0.29, y: 0.70, className: "lagoon-small" },
        { label: "⛵", x: 0.40, y: 0.44, className: "lagoon-boat" },
        { label: "🪨", x: 0.52, y: 0.76, className: "lagoon-small" },
        { label: "🚤", x: 0.63, y: 0.52, className: "lagoon-boat" },
        { label: "🪨", x: 0.73, y: 0.69, className: "lagoon-small" },
        { label: "⛵", x: 0.91, y: 0.48, className: "lagoon-boat" },
        { label: "𓅃", x: 0.12, y: 0.24, className: "lagoon-bird" },
        { label: "𓅃", x: 0.46, y: 0.20, className: "lagoon-bird" },
        { label: "𓅃", x: 0.83, y: 0.26, className: "lagoon-bird" }
    ];

    for(const item of scenery){
        addFlamingoObject(panorama, item.label, item.x, item.y, item.className);
    }

    for(const secret of flamingoSecrets){
        addFlamingoObject(
            panorama,
            secret.label,
            secret.x,
            secret.y,
            "lagoon-small secret-" + secret.id
        );
    }

    for(const group of flamingoGroups){
        const el = document.createElement("div");
        el.className = "flamingo-object flamingo-group";
        el.dataset.id = group.id;
        el.style.left = group.x * 100 + "%";
        el.style.top = group.y * 100 + "%";
        el.innerHTML = `<span class="flamingo-head">🦩</span> 🦩 🦩`;
        panorama.appendChild(el);
    }
}

function addFlamingoObject(parent, label, x, y, className){
    const el = document.createElement("div");
    el.className = "flamingo-object " + className;
    el.style.left = x * 100 + "%";
    el.style.top = y * 100 + "%";
    el.textContent = label;
    parent.appendChild(el);
}

function setupFlamingoControls(){
    const viewport = document.getElementById("flamingoViewport");

    viewport.onpointerdown = e=>{
        flamingoDragging = true;
        flamingoDragStartX = e.clientX;
        flamingoDragStartOffset = flamingoOffset;
        viewport.classList.add("dragging");
        viewport.setPointerCapture(e.pointerId);
    };

    viewport.onpointermove = e=>{
        if(!flamingoDragging){
            return;
        }

        flamingoOffset = clampFlamingoOffset(
            flamingoDragStartOffset - (e.clientX - flamingoDragStartX)
        );
        updateFlamingoView();
    };

    viewport.onpointerup = e=>{
        flamingoDragging = false;
        viewport.classList.remove("dragging");
        viewport.releasePointerCapture(e.pointerId);
    };

    viewport.onpointercancel = ()=>{
        flamingoDragging = false;
        viewport.classList.remove("dragging");
    };
}

function updateFlamingoLayout(){
    const viewport = document.getElementById("flamingoViewport");
    const panorama = document.getElementById("flamingoPanorama");

    flamingoViewportWidth = viewport.getBoundingClientRect().width;
    flamingoSceneWidth = panorama.getBoundingClientRect().width;
    flamingoOffset = clampFlamingoOffset(flamingoOffset);
    updateFlamingoView();
}

function clampFlamingoOffset(value){
    return Math.max(0, Math.min(value, Math.max(0, flamingoSceneWidth - flamingoViewportWidth)));
}

function updateFlamingoView(){
    const panorama = document.getElementById("flamingoPanorama");
    panorama.style.transform = "translateX(" + -flamingoOffset + "px)";
    updateVisibleFlamingos();
}

function toggleBinocularMode(){
    binocularMode = !binocularMode;
    updateBinocularButton();
    updateVisibleFlamingos();
}

function updateBinocularButton(){
    const screen = document.getElementById("flamingoScreen");
    const button = document.getElementById("binocularBtn");

    screen.classList.toggle("binocular-active", binocularMode);
    button.classList.toggle("active", binocularMode);
}

function updateVisibleFlamingos(){
    const centerX = flamingoOffset + flamingoViewportWidth / 2;
    const identifyRange = flamingoViewportWidth * 0.34;

    for(const group of flamingoGroups){
        const groupX = group.x * flamingoSceneWidth;

        if(binocularMode && Math.abs(groupX - centerX) < identifyRange){
            group.identified = true;
        }

        const el = document.querySelector('[data-id="' + group.id + '"]');

        if(el){
            el.classList.toggle("identified", group.identified && !group.discovered);
            el.classList.toggle("discovered", group.discovered);
        }
    }

    if(binocularMode){
        checkVisibleSecrets(centerX);
    }
}

function checkVisibleSecrets(centerX){
    const secretRange = flamingoViewportWidth * 0.24;

    for(const secret of flamingoSecrets){
        const secretX = secret.x * flamingoSceneWidth;

        if(Math.abs(secretX - centerX) < secretRange && !secretsFound.includes(secret.id)){
            secretsFound.push(secret.id);
            localStorage.setItem("secretsFound", JSON.stringify(secretsFound));
            showFlamingoMessage("Sekret odkryty: " + secret.label);
        }
    }
}

function takeFlamingoPhoto(){
    const centerX = flamingoOffset + flamingoViewportWidth / 2;
    const photoRange = flamingoViewportWidth * 0.36;
    let photographed = false;

    for(const group of flamingoGroups){
        const groupX = group.x * flamingoSceneWidth;

        if(group.identified && !group.discovered && Math.abs(groupX - centerX) < photoRange){
            group.discovered = true;
            photographed = true;
            showFlamingoMessage("📸 Flamingi udokumentowane!");
            break;
        }
    }

    if(!photographed){
        showFlamingoMessage(binocularMode ? "Ustaw kadr bliżej flamingów." : "Użyj lornetki, aby rozpoznać grupę.");
    }

    updateFlamingoProgress();
    updateVisibleFlamingos();
}

function updateFlamingoProgress(){
    flamingosFound = flamingoGroups.filter(group => group.discovered).length;
    document.getElementById("flamingoProgress").innerText = "🦩 " + flamingosFound + " / 5";
    localStorage.setItem("flamingosFound", String(flamingosFound));
    localStorage.setItem("secretsFound", JSON.stringify(secretsFound));

    if(flamingosFound === 5){
        localStorage.setItem("flamingoObserverCompleted", "true");
        localStorage.setItem("bestPhotoUnlocked", "true");
        stopFlamingoObserver();
        showScreen("flamingoCompleteScreen");
    }
}

function showFlamingoMessage(text){
    const message = document.getElementById("flamingoMessage");

    if(!text){
        message.classList.remove("visible");
        message.innerText = "";
        return;
    }

    message.innerText = text;
    message.classList.add("visible");
    flamingoMessageUntil = performance.now() + 1800;
}

function flamingoLoop(){
    if(!flamingoRunning){
        return;
    }

    if(performance.now() > flamingoMessageUntil){
        showFlamingoMessage("");
    }

    updateFlamingoLayout();
    flamingoAnimationId = requestAnimationFrame(flamingoLoop);
}

function addFlamingoToChronicle(){
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
    seals = [];
    fish = [];
    lives = 3;
    score = 0;
    bonusScore = 0;
    sealCount = 0;
    gameSeconds = 60;
    gameRunning = true;
    invincibleUntil = 0;
    sealMessageUntil = 0;
    lastClusterSpawn = 0;
    lastSealSpawn = performance.now();
    nextSealDelay = 15000 + Math.random() * 5000;
    lastFishSpawn = performance.now();
    nextFishDelay = 2500 + Math.random() * 2500;

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

        for(const seal of seals){
            seal.x *= scaleX;
            seal.y *= scaleY;
        }

        for(const singleFish of fish){
            singleFish.x *= scaleX;
            singleFish.y *= scaleY;
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
    const speedMultiplier = 3.0;

    const speed =
        difficulty === 1 ? 2.7 :
        difficulty === 2 ? 3.45 :
        4.2;
    const boostedSpeed = speed * speedMultiplier;

    if(isNarrow){
        return boostedSpeed + 0.75;
    }

    return boostedSpeed;
}

function getSpawnDelay(){
    const difficulty = getDifficulty();

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
    const hudY = 12;
    const isNarrow = canvas.width < 520;
    const hudHeight = isNarrow ? 64 : 44;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(12, hudY, canvas.width - 24, hudHeight);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px Arial";
    ctx.textBaseline = "alphabetic";

    const hearts = "❤️".repeat(lives);
    const remaining = Math.max(0, gameSeconds - getElapsed());
    const level = getDifficulty();

    if(isNarrow){
        ctx.textAlign = "left";
        ctx.fillText(hearts, 24, hudY + 25);

        ctx.textAlign = "right";
        ctx.fillText("Czas: " + remaining, canvas.width - 24, hudY + 25);

        ctx.textAlign = "center";
        ctx.fillText("Punkty: " + score, canvas.width / 2, hudY + 52);

        ctx.font = "bold 11px Arial";
        ctx.textAlign = "left";
        ctx.fillText("🦭 " + sealCount + " · Poziom " + level, 24, hudY + 52);

        ctx.textAlign = "right";
        ctx.fillText("SPD x3.0", canvas.width - 24, hudY + 52);
    }else{
        ctx.textAlign = "left";
        ctx.fillText(hearts, 28, hudY + 29);

        ctx.textAlign = "center";
        ctx.fillText("Punkty: " + score, canvas.width / 2, hudY + 29);

        ctx.textAlign = "right";
        ctx.fillText("Czas: " + remaining, canvas.width - 28, hudY + 29);

        ctx.font = "bold 12px Arial";
        ctx.textAlign = "left";
        ctx.fillText("🦭 " + sealCount + " · Poziom " + level + " · SPD x3.0", 28, hudY + 41);
    }

    ctx.restore();
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
        isNarrow && difficulty === 1 ? 18 :
        isNarrow && difficulty === 2 ? 20 :
        isNarrow && difficulty === 3 ? 22 :
        difficulty === 1 ? 20 :
        difficulty === 2 ? 22 :
        24;

    let patterns = [];

    if(isNarrow && difficulty === 1){
        patterns = [
            [
                createRock(w * 0.22, y, r),
                createRock(w * 0.72, y - 35, r)
            ],
            [
                createRock(w * 0.78, y, r),
                createRock(w * 0.28, y - 35, r)
            ],
            [
                createRock(w * 0.50, y, r),
                createRock(w * 0.22, y - 110, r)
            ],
            [
                createRock(w * 0.12, y, r),
                createRock(w * 0.62, y - 110, r)
            ],
            [
                createRock(w * 0.88, y, r),
                createRock(w * 0.38, y - 110, r)
            ]
        ];
    }

    if(isNarrow && difficulty === 2){
        patterns = [
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.34, y - 70, r),
                createRock(w * 0.72, y - 150, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.66, y - 70, r),
                createRock(w * 0.28, y - 150, r)
            ],
            [
                createRock(w * 0.40, y, r),
                createRock(w * 0.64, y - 85, r)
            ],
            [
                createRock(w * 0.60, y, r),
                createRock(w * 0.36, y - 85, r)
            ],
            [
                createRock(w * 0.12, y, r),
                createRock(w * 0.62, y - 115, r)
            ],
            [
                createRock(w * 0.88, y, r),
                createRock(w * 0.38, y - 115, r)
            ]
        ];
    }

    if(isNarrow && difficulty === 3){
        patterns = [
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.36, y - 80, r),
                createRock(w * 0.72, y - 165, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.64, y - 80, r),
                createRock(w * 0.28, y - 165, r)
            ],
            [
                createRock(w * 0.22, y, r),
                createRock(w * 0.52, y - 95, r),
                createRock(w * 0.78, y - 190, r)
            ],
            [
                createRock(w * 0.78, y, r),
                createRock(w * 0.48, y - 95, r),
                createRock(w * 0.22, y - 190, r)
            ],
            [
                createRock(w * 0.12, y, r),
                createRock(w * 0.36, y - 95, r),
                createRock(w * 0.74, y - 190, r)
            ],
            [
                createRock(w * 0.88, y, r),
                createRock(w * 0.64, y - 95, r),
                createRock(w * 0.26, y - 190, r)
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

    let maneuverPatterns = [];

    if(isNarrow){
        maneuverPatterns = [
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.48, y - 95, r),
                createRock(w * 0.78, y - 190, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.52, y - 95, r),
                createRock(w * 0.22, y - 190, r)
            ],
            [
                createRock(w * 0.16, y, r),
                createRock(w * 0.66, y - 75, r),
                createRock(w * 0.34, y - 170, r)
            ],
            [
                createRock(w * 0.84, y, r),
                createRock(w * 0.34, y - 75, r),
                createRock(w * 0.66, y - 170, r)
            ],
            [
                createRock(w * 0.30, y, r),
                createRock(w * 0.70, y - 80, r),
                createRock(w * 0.50, y - 165, r)
            ]
        ];
    }else{
        maneuverPatterns = [
            [
                createRock(w * 0.16, y, r),
                createRock(w * 0.38, y - 80, r),
                createRock(w * 0.68, y - 165, r),
                createRock(w * 0.84, y - 245, r)
            ],
            [
                createRock(w * 0.84, y, r),
                createRock(w * 0.62, y - 80, r),
                createRock(w * 0.32, y - 165, r),
                createRock(w * 0.16, y - 245, r)
            ],
            [
                createRock(w * 0.18, y, r),
                createRock(w * 0.68, y - 70, r),
                createRock(w * 0.36, y - 155, r),
                createRock(w * 0.78, y - 240, r)
            ],
            [
                createRock(w * 0.82, y, r),
                createRock(w * 0.32, y - 70, r),
                createRock(w * 0.64, y - 155, r),
                createRock(w * 0.22, y - 240, r)
            ],
            [
                createRock(w * 0.30, y, r),
                createRock(w * 0.70, y, r),
                createRock(w * 0.50, y - 125, r)
            ]
        ];
    }

    const useManeuverCluster = Math.random() < 0.12;
    const activePatterns = useManeuverCluster ? maneuverPatterns : patterns;
    const chosen =
        activePatterns[Math.floor(Math.random() * activePatterns.length)];

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

function spawnSeal(now){
    if(now - lastSealSpawn < nextSealDelay){
        return;
    }

    lastSealSpawn = now;
    nextSealDelay = 15000 + Math.random() * 5000;

    seals.push({
        x: canvas.width * (0.22 + Math.random() * 0.56),
        y: -45,
        radius: 26,
        collected: false
    });
}

function updateSeals(){
    const worldSpeed = getWorldSpeed();

    for(const seal of seals){
        seal.y += worldSpeed;
        seal.x += Math.sin((seal.y + waterOffset) * 0.025) * 0.22;
    }

    seals = seals.filter(
        seal => seal.y < canvas.height + 70 && !seal.collected
    );
}

function drawSeals(){
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "32px Arial";

    for(const seal of seals){
        ctx.fillText("🦭", seal.x, seal.y);
    }

    ctx.restore();
}

function checkSealEncounters(){
    const collectRadius = 46;

    for(const seal of seals){
        const dx = kayakX - seal.x;
        const dy = kayakY - seal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < collectRadius){
            seal.collected = true;
            sealCount++;
            bonusScore += 100;
            sealMessageUntil = performance.now() + 1500;
        }
    }
}

function drawSealMessage(){
    if(performance.now() > sealMessageUntil){
        return;
    }

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(canvas.width / 2 - 120, 92, 240, 40);
    ctx.fillStyle = "#000000";
    ctx.fillText("🦭 Spotkana foka!", canvas.width / 2, 120);
    ctx.restore();
}

function spawnFish(now){
    if(now - lastFishSpawn < nextFishDelay){
        return;
    }

    lastFishSpawn = now;
    nextFishDelay = 2500 + Math.random() * 2500;

    let x = canvas.width * (0.16 + Math.random() * 0.68);
    let y = -35;

    if(rocks.length > 0 && Math.random() < 0.35){
        const rock = rocks[Math.floor(Math.random() * rocks.length)];
        x = Math.max(28, Math.min(canvas.width - 28, rock.x + (Math.random() < 0.5 ? -54 : 54)));
        y = Math.min(-25, rock.y - 60);
    }

    fish.push({
        x,
        y,
        radius: 18,
        collected: false
    });
}

function updateFish(){
    const worldSpeed = getWorldSpeed();

    for(const singleFish of fish){
        singleFish.y += worldSpeed;
        singleFish.x += Math.sin((singleFish.y + waterOffset) * 0.03) * 0.28;
    }

    fish = fish.filter(
        singleFish => singleFish.y < canvas.height + 55 && !singleFish.collected
    );
}

function drawFish(){
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "24px Arial";

    for(const singleFish of fish){
        ctx.fillText("🐟", singleFish.x, singleFish.y);
    }

    ctx.restore();
}

function checkFishEncounters(){
    const collectRadius = 34;

    for(const singleFish of fish){
        const dx = kayakX - singleFish.x;
        const dy = kayakY - singleFish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < collectRadius){
            singleFish.collected = true;
            bonusScore += 25;
        }
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

    score = getElapsed() * 10 + bonusScore;

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
    drawFish();
    drawSeals();
    drawKayak();
    drawHud();
    drawSealMessage();
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
        spawnSeal(now);
        spawnFish(now);
        updateRocks();
        updateSeals();
        updateFish();
        update();
        checkCollisions();
        checkSealEncounters();
        checkFishEncounters();
    }

    drawRocks();
    drawFish();
    drawSeals();
    drawKayak();
    drawHud();
    drawSealMessage();

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
