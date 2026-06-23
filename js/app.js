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

let mapPanX = 0;
let mapPanY = 0;
let mapZoom = 1;
let mapDragging = false;
let mapDragMoved = false;
let mapDragStartX = 0;
let mapDragStartY = 0;
let mapPanStartX = 0;
let mapPanStartY = 0;
let mapControlsReady = false;
let mapInitialPanReady = false;
let mapPointers = {};
let mapPinchStartDistance = 0;
let mapPinchStartZoom = 1;
let mapPinchMapX = 0;
let mapPinchMapY = 0;
let mapViewportDebugLogged = false;
const mapMinZoom = 0.3;
const mapMaxZoom = 1.8;
const mapOverviewPadding = 0.92;
const guardianMinRenderedSize = 24;
const guardianPreferredRenderedSize = 39;
const guardianMaxRenderedSize = 56;

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
let wildlifeLensX = 50;
let wildlifeLensY = 50;
let wildlifeLensDragging = false;
let wildlifePanX = 0;
let wildlifePanY = 0;
let wildlifePanStartX = 0;
let wildlifePanStartY = 0;
let wildlifeDragStartX = 0;
let wildlifeDragStartY = 0;
let wildlifeDragMode = null;
const DEBUG_HOTSPOTS = true;
const wildlifeSceneImage = "assets/wildlife/Board 01 Prototype.png";
const wildlifeImageAspect = 1619 / 972;
const wildlifeLensZoom = 2.2;

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
    { id: "seal_a", type: "seal", label: "Foka A", xPercent: 80.5, yPercent: 77.0, radiusPercent: 9.5, difficulty: "easy", hint: "Szukaj dużej foki w prawej dolnej części planszy.", found: false },
    { id: "seal_b", type: "seal", label: "Foka B", xPercent: 50.0, yPercent: 55.2, radiusPercent: 5.0, difficulty: "medium", hint: "Szukaj foki wynurzającej się w wodzie blisko środka planszy.", found: false },
    { id: "flamingo_a", type: "flamingo", label: "Flaming A", xPercent: 20.6, yPercent: 51.4, radiusPercent: 6.4, difficulty: "easy", hint: "Szukaj wysokiego flaminga w lewej części laguny.", found: false },
    { id: "flamingo_b", type: "flamingo", label: "Flaming B", xPercent: 79.5, yPercent: 56.6, radiusPercent: 5.0, difficulty: "medium", hint: "Szukaj flaminga w trzcinach po prawej stronie planszy.", found: false },
    { id: "pelican_a", type: "pelican", label: "Pelikan A", xPercent: 13.2, yPercent: 73.4, radiusPercent: 8.0, difficulty: "easy", hint: "Szukaj dużego pelikana nisko po lewej stronie.", found: false },
    { id: "pelican_b", type: "pelican", label: "Pelikan B", xPercent: 88.9, yPercent: 47.2, radiusPercent: 5.4, difficulty: "medium", hint: "Szukaj pelikana na skałach w prawej części obrazu.", found: false }
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

    updateWalvisBayMapState();

    if(id === "mapScreen"){
        setupNamibiaMap();
        mapInitialPanReady = false;
        updateNamibiaMap();
    }

    if(id === "walvisChronicleScreen"){
        updateWalvisChronicle();
    }
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
    const sealAlreadyCollected = localStorage.getItem("oceanGuardianSeal") === "true";

    if(checkWalvisBayCompletion(true) && !sealAlreadyCollected){
        return;
    }

    showScreen("walvisScreen");
}

function isSealKayakCompleted(){
    return localStorage.getItem("sealKayakCompleted") === "true";
}

function isWildlifeSearchCompleted(){
    return localStorage.getItem("wildlifeSearchCompleted") === "true";
}

function isWalvisBayCompleteReady(){
    return isSealKayakCompleted() && isWildlifeSearchCompleted();
}

function checkWalvisBayCompletion(showReward){
    if(!isWalvisBayCompleteReady()){
        return false;
    }

    localStorage.setItem("walvisBayCompleted", "true");

    if(showReward && localStorage.getItem("oceanGuardianSeal") !== "true"){
        stopKayakGame();
        stopWildlifeSearch();
        showScreen("walvisSealIntroScreen");
    }

    return true;
}

function collectOceanGuardianSeal(){
    localStorage.setItem("oceanGuardianSeal", "true");
    localStorage.setItem("chronicleWalvisBayUnlocked", "true");
    updateWalvisBayMapState();
    showScreen("oceanGuardianSealScreen");
}

function openWalvisChronicle(){
    localStorage.setItem("chronicleWalvisBayUnlocked", "true");
    showScreen("walvisChronicleScreen");
}

function updateWalvisChronicle(){
    const sealStatus = document.getElementById("chronicleSealStatus");
    const kayakStatus = document.getElementById("chronicleKayakStatus");
    const wildlifeStatus = document.getElementById("chronicleWildlifeStatus");

    if(!sealStatus || !kayakStatus || !wildlifeStatus){
        return;
    }

    sealStatus.innerText = "Seal collected: " + (localStorage.getItem("oceanGuardianSeal") === "true" ? "Tak" : "Nie");
    kayakStatus.innerText = "Kayak completed: " + (isSealKayakCompleted() ? "Tak" : "Nie");
    wildlifeStatus.innerText = "Wildlife Search completed: " + (isWildlifeSearchCompleted() ? "Tak" : "Nie");
}

function updateWalvisBayMapState(){
    const location = document.getElementById("walvisMapLocation");
    const status = document.getElementById("walvisMapStatus");
    const kayakStatus = document.getElementById("walvisKayakStatus");
    const wildlifeStatus = document.getElementById("walvisWildlifeStatus");
    const sealStatus = document.getElementById("walvisSealStatus");

    if(!location || !status){
        return;
    }

    const kayakDone = isSealKayakCompleted();
    const wildlifeDone = isWildlifeSearchCompleted();
    const walvisDone = localStorage.getItem("walvisBayCompleted") === "true";
    const sealCollected = localStorage.getItem("oceanGuardianSeal") === "true";

    location.classList.remove("in-progress", "completed");

    if(walvisDone || sealCollected){
        location.classList.add("completed");
        status.innerText = sealCollected ? "🦭 Pieczęć Strażnika Oceanu" : "Ukończono - pieczęć czeka";
    }else if(kayakDone || wildlifeDone){
        location.classList.add("in-progress");
        status.innerText = "W trakcie";
    }else{
        status.innerText = "Nie rozpoczęto";
    }

    if(kayakStatus){
        kayakStatus.innerText = kayakDone ? "✓ ukończone" : "Do odkrycia";
    }

    if(wildlifeStatus){
        wildlifeStatus.innerText = wildlifeDone ? "✓ ukończone" : "Do odkrycia";
    }

    if(sealStatus){
        sealStatus.innerText = sealCollected ? "✓ odebrana" : (walvisDone ? "Czeka na odbiór" : "Nieodebrana");
    }
}

function setupNamibiaMap(){
    const viewport = document.getElementById("mapViewport");

    if(!viewport || mapControlsReady){
        return;
    }

    mapControlsReady = true;

    viewport.onpointerdown = e=>{
        mapPointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        mapDragging = true;
        mapDragMoved = false;
        mapDragStartX = e.clientX;
        mapDragStartY = e.clientY;
        mapPanStartX = mapPanX;
        mapPanStartY = mapPanY;
        viewport.classList.add("dragging");
        viewport.setPointerCapture(e.pointerId);

        if(getMapPointerList().length === 2){
            startNamibiaMapPinch();
        }
    };

    viewport.onpointermove = e=>{
        if(!mapPointers[e.pointerId]){
            return;
        }

        mapPointers[e.pointerId] = { x: e.clientX, y: e.clientY };

        const pointers = getMapPointerList();

        if(pointers.length >= 2){
            updateNamibiaMapPinch(pointers);
            mapDragMoved = true;
            return;
        }

        if(mapDragging){
            mapPanX = mapPanStartX + e.clientX - mapDragStartX;
            mapPanY = mapPanStartY + e.clientY - mapDragStartY;

            if(Math.abs(e.clientX - mapDragStartX) > 6 || Math.abs(e.clientY - mapDragStartY) > 6){
                mapDragMoved = true;
            }

            updateNamibiaMap();
        }
    };

    viewport.onpointerup = e=>{
        delete mapPointers[e.pointerId];

        if(getMapPointerList().length === 0){
            mapDragging = false;
            viewport.classList.remove("dragging");
        }else{
            const nextPointer = getMapPointerList()[0];
            mapDragStartX = nextPointer.x;
            mapDragStartY = nextPointer.y;
            mapPanStartX = mapPanX;
            mapPanStartY = mapPanY;
        }

        viewport.releasePointerCapture(e.pointerId);
    };

    viewport.onpointercancel = e=>{
        delete mapPointers[e.pointerId];

        if(getMapPointerList().length === 0){
            mapDragging = false;
            viewport.classList.remove("dragging");
        }
    };

    viewport.addEventListener("click", e=>{
        if(mapDragMoved){
            e.preventDefault();
            e.stopPropagation();
            mapDragMoved = false;
        }
    }, true);
}

function getMapPointerList(){
    return Object.values(mapPointers);
}

function getMapPointerDistance(pointers){
    return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
}

function getMapPointerCenter(pointers){
    return {
        x: (pointers[0].x + pointers[1].x) / 2,
        y: (pointers[0].y + pointers[1].y) / 2
    };
}

function startNamibiaMapPinch(){
    const viewport = document.getElementById("mapViewport");
    const pointers = getMapPointerList();

    if(!viewport || pointers.length < 2){
        return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const center = getMapPointerCenter(pointers);
    const centerX = center.x - viewportRect.left;
    const centerY = center.y - viewportRect.top;

    mapPinchStartDistance = getMapPointerDistance(pointers);
    mapPinchStartZoom = mapZoom;
    mapPinchMapX = (centerX - mapPanX) / mapZoom;
    mapPinchMapY = (centerY - mapPanY) / mapZoom;
}

function updateNamibiaMapPinch(pointers){
    const viewport = document.getElementById("mapViewport");

    if(!viewport || mapPinchStartDistance <= 0){
        return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const center = getMapPointerCenter(pointers);
    const centerX = center.x - viewportRect.left;
    const centerY = center.y - viewportRect.top;
    const scale = getMapPointerDistance(pointers) / mapPinchStartDistance;

    mapZoom = clampNamibiaMapZoom(mapPinchStartZoom * scale);
    mapPanX = centerX - mapPinchMapX * mapZoom;
    mapPanY = centerY - mapPinchMapY * mapZoom;
    updateNamibiaMap();
}

function clampNamibiaMapZoom(value){
    return Math.max(mapMinZoom, Math.min(mapMaxZoom, value));
}

function getGuardianVisualScale(){
    const baseSize = 42;
    const normalZoomRange = Math.max(0.01, 1 - mapMinZoom);
    const overviewProgress = Math.max(0, Math.min(1, (mapZoom - mapMinZoom) / normalZoomRange));
    let targetSize = guardianMinRenderedSize + (guardianPreferredRenderedSize - guardianMinRenderedSize) * overviewProgress;

    if(mapZoom > 1){
        const closeProgress = Math.max(0, Math.min(1, (mapZoom - 1) / Math.max(0.01, mapMaxZoom - 1)));
        targetSize = guardianPreferredRenderedSize + (guardianMaxRenderedSize - guardianPreferredRenderedSize) * closeProgress;
    }

    return targetSize / (baseSize * mapZoom);
}

function updateNamibiaMap(){
    const viewport = document.getElementById("mapViewport");
    const layer = document.getElementById("namibiaMapLayer");

    if(!viewport || !layer){
        return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    if(!mapViewportDebugLogged){
        const width = Math.round(viewportRect.width);
        const height = Math.round(viewportRect.height);
        const aspectRatio = (viewportRect.width / viewportRect.height).toFixed(3);
        console.log("[Map viewport locked]", {
            width: width + "px",
            height: height + "px",
            aspectRatio
        });
        mapViewportDebugLogged = true;
    }

    for(const region of layer.querySelectorAll(".map-region")){
        const x = Number(region.dataset.x || 50);
        const y = Number(region.dataset.y || 50);
        region.style.left = x + "%";
        region.style.top = y + "%";
    }

    for(const guardian of layer.querySelectorAll(".map-guardian")){
        const x = Number(guardian.dataset.x || 50);
        const y = Number(guardian.dataset.y || 50);
        guardian.style.left = x + "%";
        guardian.style.top = y + "%";
        guardian.style.setProperty("--guardian-scale", getGuardianVisualScale());
    }

    updateNamibiaRouteLayer(layer);

    if(!mapInitialPanReady){
        mapZoom = getNamibiaOverviewZoom(viewportRect, layer);
        const overviewWidth = layer.offsetWidth * mapZoom;
        const overviewHeight = layer.offsetHeight * mapZoom;
        mapPanX = (viewportRect.width - overviewWidth) / 2;
        mapPanY = (viewportRect.height - overviewHeight) / 2;
        mapInitialPanReady = true;
    }

    constrainNamibiaMapPan(viewportRect, layer);

    layer.style.transform = "translate(" + mapPanX + "px, " + mapPanY + "px) scale(" + mapZoom + ")";
}

function getNamibiaOverviewZoom(viewportRect, layer){
    const fitX = viewportRect.width / layer.offsetWidth;
    const fitY = viewportRect.height / layer.offsetHeight;

    return clampNamibiaMapZoom(Math.min(fitX, fitY) * mapOverviewPadding);
}

function constrainNamibiaMapPan(viewportRect, layer){
    const layerWidth = layer.offsetWidth * mapZoom;
    const layerHeight = layer.offsetHeight * mapZoom;

    if(layerWidth <= viewportRect.width){
        mapPanX = (viewportRect.width - layerWidth) / 2;
    }else{
        const minX = viewportRect.width - layerWidth;
        mapPanX = Math.min(0, Math.max(minX, mapPanX));
    }

    if(layerHeight <= viewportRect.height){
        mapPanY = (viewportRect.height - layerHeight) / 2;
    }else{
        const minY = viewportRect.height - layerHeight;
        mapPanY = Math.min(0, Math.max(minY, mapPanY));
    }
}

function updateNamibiaRouteLayer(layer){
    const routeLayer = layer.querySelector(".map-route-layer");

    if(!routeLayer){
        return;
    }

    const points = Array.from(layer.querySelectorAll(".map-region")).map(region=>{
        const x = Number(region.dataset.x || 50) * layer.offsetWidth / 100;
        const y = Number(region.dataset.y || 50) * layer.offsetHeight / 100;
        return x + "," + y;
    });

    routeLayer.innerHTML =
        "<svg class=\"map-route-svg\" viewBox=\"0 0 " + layer.offsetWidth + " " + layer.offsetHeight + "\" preserveAspectRatio=\"none\">" +
        "<polyline class=\"map-route-line\" points=\"" + points.join(" ") + "\"></polyline>" +
        "</svg>";
}

function zoomNamibiaMap(direction){
    const viewport = document.getElementById("mapViewport");

    if(!viewport){
        return;
    }

    const oldZoom = mapZoom;
    const nextZoom = clampNamibiaMapZoom(mapZoom + direction * 0.2);
    const viewportRect = viewport.getBoundingClientRect();
    const centerX = viewportRect.width / 2;
    const centerY = viewportRect.height / 2;
    const mapCenterX = (centerX - mapPanX) / oldZoom;
    const mapCenterY = (centerY - mapPanY) / oldZoom;

    mapZoom = nextZoom;
    mapPanX = centerX - mapCenterX * mapZoom;
    mapPanY = centerY - mapCenterY * mapZoom;
    updateNamibiaMap();
}

function resetNamibiaMap(){
    mapInitialPanReady = false;
    updateNamibiaMap();
}

function startWildlifeSearch(){
    stopKayakGame();
    stopFlamingoObserver();
    showScreen("wildlifeScreen");

    wildlifeRunning = true;
    wildlifeBinocularMode = false;
    wildlifeMessageUntil = 0;
    wildlifeLensX = 50;
    wildlifeLensY = 50;
    wildlifeLensDragging = false;
    wildlifePanX = 0;
    wildlifePanY = 0;
    wildlifeDragMode = null;

    const savedTargets = JSON.parse(localStorage.getItem("wildlifeTargetsFound") || "[]");

    for(const target of wildlifeTargets){
        target.found = savedTargets.includes(target.id);
    }

    renderWildlifeScene();
    setupWildlifeLensControls();
    updateWildlifeSceneLayout();
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

    scene.dataset.sceneImage = wildlifeSceneImage;
    scene.innerHTML = "";

    if(!DEBUG_HOTSPOTS){
        return;
    }

    for(const target of wildlifeTargets){
        const marker = document.createElement("div");
        marker.className = "wildlife-debug-hotspot";
        marker.style.left = target.xPercent + "%";
        marker.style.top = target.yPercent + "%";
        marker.style.width = target.radiusPercent * 2 + "%";
        marker.style.height = target.radiusPercent * 2 + "%";
        marker.innerHTML = "<span>" + target.label + "</span>";
        scene.appendChild(marker);
    }
}

function setupWildlifeLensControls(){
    const viewport = document.getElementById("wildlifeViewport");

    viewport.onpointerdown = e=>{
        const viewportRect = viewport.getBoundingClientRect();
        const lensX = viewportRect.left + viewportRect.width * wildlifeLensX / 100;
        const lensY = viewportRect.top + viewportRect.height * wildlifeLensY / 100;
        const distanceFromLens = Math.sqrt((e.clientX - lensX) ** 2 + (e.clientY - lensY) ** 2);

        wildlifeDragMode =
            wildlifeBinocularMode && distanceFromLens < 90 ? "lens" :
            "pan";
        wildlifeLensDragging = wildlifeDragMode === "lens";
        wildlifeDragStartX = e.clientX;
        wildlifeDragStartY = e.clientY;
        wildlifePanStartX = wildlifePanX;
        wildlifePanStartY = wildlifePanY;
        viewport.setPointerCapture(e.pointerId);

        if(wildlifeDragMode === "lens"){
            moveWildlifeLens(e);
        }
    };

    viewport.onpointermove = e=>{
        if(!wildlifeDragMode){
            return;
        }

        if(wildlifeDragMode === "lens"){
            moveWildlifeLens(e);
        }else{
            wildlifePanX = wildlifePanStartX + e.clientX - wildlifeDragStartX;
            wildlifePanY = wildlifePanStartY + e.clientY - wildlifeDragStartY;
            updateWildlifeSceneLayout();
        }
    };

    viewport.onpointerup = e=>{
        wildlifeLensDragging = false;
        wildlifeDragMode = null;
        viewport.releasePointerCapture(e.pointerId);
    };

    viewport.onpointercancel = ()=>{
        wildlifeLensDragging = false;
        wildlifeDragMode = null;
    };
}

function moveWildlifeLens(e){
    const viewport = document.getElementById("wildlifeViewport").getBoundingClientRect();
    wildlifeLensX = Math.max(4, Math.min(96, ((e.clientX - viewport.left) / viewport.width) * 100));
    wildlifeLensY = Math.max(6, Math.min(94, ((e.clientY - viewport.top) / viewport.height) * 100));
    updateWildlifeLens();
}

function updateWildlifeSceneLayout(){
    const viewport = document.getElementById("wildlifeViewport");
    const scene = document.getElementById("wildlifeScene");
    const viewportRect = viewport.getBoundingClientRect();

    if(viewportRect.width <= 0 || viewportRect.height <= 0){
        return;
    }

    let sceneWidth = viewportRect.width;
    let sceneHeight = sceneWidth / wildlifeImageAspect;

    if(sceneHeight < viewportRect.height){
        sceneHeight = viewportRect.height;
        sceneWidth = sceneHeight * wildlifeImageAspect;
    }

    const minX = viewportRect.width - sceneWidth;
    const minY = viewportRect.height - sceneHeight;

    wildlifePanX = Math.min(0, Math.max(minX, wildlifePanX));
    wildlifePanY = Math.min(0, Math.max(minY, wildlifePanY));

    scene.style.width = sceneWidth + "px";
    scene.style.height = sceneHeight + "px";
    scene.style.transform = "translate(" + wildlifePanX + "px, " + wildlifePanY + "px)";

    updateWildlifeLens();
}

function updateWildlifeLens(){
    const lens = document.getElementById("wildlifeMagnifier");
    const viewport = document.getElementById("wildlifeViewport");
    const scene = document.getElementById("wildlifeScene");
    const viewportRect = viewport.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const lensSize = lens.getBoundingClientRect().width || 148;
    const lensCenterX = viewportRect.width * wildlifeLensX / 100;
    const lensCenterY = viewportRect.height * wildlifeLensY / 100;
    const imageX = lensCenterX - wildlifePanX;
    const imageY = lensCenterY - wildlifePanY;
    const backgroundWidth = sceneRect.width * wildlifeLensZoom;
    const backgroundHeight = sceneRect.height * wildlifeLensZoom;
    const backgroundX = lensSize / 2 - imageX * wildlifeLensZoom;
    const backgroundY = lensSize / 2 - imageY * wildlifeLensZoom;

    lens.style.left = wildlifeLensX + "%";
    lens.style.top = wildlifeLensY + "%";
    lens.style.backgroundSize = backgroundWidth + "px " + backgroundHeight + "px";
    lens.style.backgroundPosition = backgroundX + "px " + backgroundY + "px";
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
    updateWildlifeLens();
}

function takeWildlifePhoto(){
    const target = getCenteredWildlifeTarget();

    if(target){
        markWildlifeTargetFound(target.id);
    }else{
        showWildlifeMessage("Nic tu nie znaleziono.");
    }
}

function getCenteredWildlifeTarget(){
    const viewport = document.getElementById("wildlifeViewport").getBoundingClientRect();
    const scene = document.getElementById("wildlifeScene").getBoundingClientRect();
    const lensViewportX = viewport.width * wildlifeLensX / 100;
    const lensViewportY = viewport.height * wildlifeLensY / 100;
    const lensImageX = ((lensViewportX - wildlifePanX) / scene.width) * 100;
    const lensImageY = ((lensViewportY - wildlifePanY) / scene.height) * 100;
    let bestTarget = null;
    let bestDistance = Infinity;

    for(const target of wildlifeTargets){
        if(target.found){
            continue;
        }

        const dx = target.xPercent - lensImageX;
        const dy = target.yPercent - lensImageY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance <= target.radiusPercent && distance < bestDistance){
            bestDistance = distance;
            bestTarget = target;
        }
    }

    return bestTarget;
}

function markWildlifeTargetFound(id){
    const target = wildlifeTargets.find(item => item.id === id);

    if(!target || target.found){
        return;
    }

    target.found = true;
    showWildlifeMessage("Zdjęcie zaliczone!");
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
    const hint = document.createElement("div");
    hint.className = "wildlife-hint-area";
    const scene = document.getElementById("wildlifeScene").getBoundingClientRect();
    const viewport = document.getElementById("wildlifeViewport").getBoundingClientRect();
    const hintX = wildlifePanX + scene.width * target.xPercent / 100;
    const hintY = wildlifePanY + scene.height * target.yPercent / 100;
    hint.style.left = hintX + "px";
    hint.style.top = hintY + "px";
    document.getElementById("wildlifeViewport").appendChild(hint);
    showWildlifeMessage(target.hint);

    setTimeout(()=>{
        hint.remove();
    },1400);
}

function showWildlifeChronicle(){
    const found = wildlifeTargets.filter(target => target.found);
    const panel = document.getElementById("wildlifeChroniclePanel");
    const total = wildlifeTargets.length;
    const summary =
        found.length === 0 ?
        "Brak zdjęć." :
        found.map(target => getWildlifeTypeLabel(target.type) + " (" + target.difficulty + ")").join(", ");

    panel.innerHTML =
        "<h2>Kronika</h2>" +
        "<p>Zdjęcia: " + wildlifePhotosFound + " / " + total + "</p>" +
        "<p>" + summary + "</p>" +
        "<button class=\"small-button\" onclick=\"hideWildlifeChronicle()\">Zamknij</button>";
    panel.classList.add("visible");
}

function hideWildlifeChronicle(){
    document.getElementById("wildlifeChroniclePanel").classList.remove("visible");
}

function updateWildlifeProgress(){
    wildlifePhotosFound = wildlifeTargets.filter(target => target.found).length;

    const seals = wildlifeTargets.filter(target => target.type === "seal" && target.found).length;
    const flamingos = wildlifeTargets.filter(target => target.type === "flamingo" && target.found).length;
    const pelicans = wildlifeTargets.filter(target => target.type === "pelican" && target.found).length;
    const total = wildlifeTargets.length;
    const sealTotal = wildlifeTargets.filter(target => target.type === "seal").length;
    const flamingoTotal = wildlifeTargets.filter(target => target.type === "flamingo").length;
    const pelicanTotal = wildlifeTargets.filter(target => target.type === "pelican").length;
    const foundIds = wildlifeTargets.filter(target => target.found).map(target => target.id);

    document.getElementById("wildlifePhotoProgress").innerText = "Zdjęcia " + wildlifePhotosFound + "/" + total;
    document.getElementById("sealObjective").innerText = "Foka " + seals + "/" + sealTotal;
    document.getElementById("flamingoObjective").innerText = "Flaming " + flamingos + "/" + flamingoTotal;
    document.getElementById("pelicanObjective").innerText = "Pelikan " + pelicans + "/" + pelicanTotal;

    localStorage.setItem("wildlifePhotosFound", String(wildlifePhotosFound));
    localStorage.setItem("wildlifeTargetsFound", JSON.stringify(foundIds));

    if(wildlifePhotosFound === total){
        localStorage.setItem("wildlifeSearchCompleted", "true");
        stopWildlifeSearch();

        if(!checkWalvisBayCompletion(true)){
            showScreen("wildlifeCompleteScreen");
        }
    }
}

function updateWildlifeTargetStyles(){
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

    updateWildlifeSceneLayout();
    wildlifeAnimationId = requestAnimationFrame(wildlifeLoop);
}

function addWildlifeToChronicle(){
    if(!checkWalvisBayCompletion(true)){
        showScreen("walvisScreen");
    }
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

    if(won){
        localStorage.setItem("sealKayakCompleted", "true");
    }

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

    if(won){
        checkWalvisBayCompletion(true);
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
        checkWalvisBayCompletion(false);
        showScreen("mapScreen");
    }
};

window.onresize = function(){
    resizeCanvas(true);
    updateNamibiaMap();
};
