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

const expeditionBaseStats = {
    kondycja: 3,
    szybkosc: 3,
    odpornosc: 3,
    uwaznosc: 3,
    organizacja: 3,
    spokoj: 3
};

const expeditionProfileChoices = {
    headgear: {
        hat: {
            label: "Kapelusz pustynny",
            stats: { odpornosc: 1, spokoj: 1 }
        },
        cap: {
            label: "Czapka z daszkiem",
            stats: { szybkosc: 1, uwaznosc: 1 }
        }
    },
    waterLoad: {
        light: {
            label: "Lekki zapas wody",
            stats: { szybkosc: 2, kondycja: 1, odpornosc: -1 }
        },
        balanced: {
            label: "Zbalansowany zapas",
            stats: { kondycja: 1, organizacja: 1 }
        },
        heavy: {
            label: "Dużo wody",
            stats: { odpornosc: 2, spokoj: 1, szybkosc: -1 }
        }
    },
    boots: {
        trekking: {
            label: "Buty trekkingowe",
            stats: { kondycja: 1, odpornosc: 1 }
        },
        light: {
            label: "Lekkie buty",
            stats: { szybkosc: 1, kondycja: 1 }
        }
    },
    toolkit: {
        binoculars: {
            label: "Lornetka",
            stats: { uwaznosc: 2 }
        },
        notebook: {
            label: "Notatnik",
            stats: { uwaznosc: 1, spokoj: 1 }
        },
        multitool: {
            label: "Multitool",
            stats: { organizacja: 2 }
        }
    }
};

const expeditionStatLabels = {
    kondycja: "Kondycja",
    szybkosc: "Szybkość",
    odpornosc: "Odporność",
    uwaznosc: "Uważność",
    organizacja: "Organizacja",
    spokoj: "Spokój"
};

const expeditionHeroes = [
    {
        id: "driver",
        name: "Kapitan 4x4",
        tagline: "Mięśnie, spokój i kluczyki.",
        description: "Trochę zbyt pewny siebie, ale kiedy droga znika pod piaskiem, nagle wszyscy siedzą cicho i patrzą na niego. Mocny w jeździe, presji i sytuacjach za kierownicą.",
        image: "assets/characters/hero-driver.png",
        stats: { kondycja: 4, szybkosc: 4, odpornosc: 3, uwaznosc: 2, organizacja: 3, spokoj: 4 }
    },
    {
        id: "tracker",
        name: "Tropicielka Szczegółów",
        tagline: "Widziała ślad, zanim był śladem.",
        description: "Zauważa kropkę na piasku z odległości, z której inni widzą tylko piasek. Świetna w tropieniu, safari i ukrytych wskazówkach.",
        image: "assets/characters/hero-tracker.png",
        stats: { kondycja: 3, szybkosc: 3, odpornosc: 4, uwaznosc: 5, organizacja: 2, spokoj: 3 }
    },
    {
        id: "logistician",
        name: "Mistrz Logistyki",
        tagline: "Ma plan B, C i podpisany woreczek na kable.",
        description: "Dobroduszny człowiek-checklista. Nosi za dużo, ale kiedy robi się gorąco, wszyscy nagle pytają, gdzie jest woda i powerbank.",
        image: "assets/characters/hero-logistician.png",
        stats: { kondycja: 3, szybkosc: 2, odpornosc: 4, uwaznosc: 3, organizacja: 5, spokoj: 4 }
    },
    {
        id: "wanderer",
        name: "Wytrwały Wędrowiec",
        tagline: "Jeszcze tylko jedna wydma.",
        description: "Suchy jak wiatr, uparty jak szlak. Najlepszy tam, gdzie trzeba iść, wspinać się i nie marudzić przed śniadaniem.",
        image: "assets/characters/hero-wanderer.png",
        stats: { kondycja: 5, szybkosc: 3, odpornosc: 4, uwaznosc: 3, organizacja: 2, spokoj: 3 }
    },
    {
        id: "chronicler",
        name: "Kronikarka Szlaku",
        tagline: "Każda przygoda ma dobry akapit.",
        description: "Ma notes, aparat i niebezpieczną zdolność pamiętania, kto co powiedział trzy dni temu. Mocna w kulturze, historii i finale Kroniki.",
        image: "assets/characters/hero-chronicler.png",
        stats: { kondycja: 2, szybkosc: 3, odpornosc: 3, uwaznosc: 5, organizacja: 4, spokoj: 4 }
    },
    {
        id: "daredevil",
        name: "Ryzykant Adrenaliny",
        tagline: "Najpierw zjazd, potem pytania.",
        description: "Widzi stromą wydmę i pyta tylko, z której strony jest szybciej. Świetny w quadach, sandboardingu, pościgach i szybkich decyzjach.",
        image: "assets/characters/hero-daredevil.png",
        stats: { kondycja: 4, szybkosc: 5, odpornosc: 2, uwaznosc: 2, organizacja: 2, spokoj: 2 }
    },
    {
        id: "chatterbox",
        name: "Negocjator Opowieści",
        tagline: "Zagada nawet cenę figurki.",
        description: "Gada, pyta, śmieje się, gubi notatki i wraca z najlepszą historią. Mało zorganizowany, ale genialny przy ludziach i targowaniu.",
        image: "assets/characters/hero-chatterbox.png",
        stats: { kondycja: 2, szybkosc: 3, odpornosc: 2, uwaznosc: 4, organizacja: 1, spokoj: 5 }
    },
    {
        id: "diva",
        name: "Safari Diva",
        tagline: "Czy tu jest basen?",
        description: "Przyjechała jak do lodge'u z widokiem, a trafiła na kurz, camp i wydmy. Zaskakująco dobra w rozmowach, komforcie i robieniu wrażenia.",
        image: "assets/characters/hero-diva.png",
        stats: { kondycja: 1, szybkosc: 2, odpornosc: 2, uwaznosc: 4, organizacja: 3, spokoj: 5 }
    }
];

let selectedHeroId = "driver";
let windhoekHistoryChoices = [];
let draggedHistoryEventId = null;
let historyPointerDrag = null;
let historyLastPointerDrop = 0;
let windhoekBaboonStage = 0;
let windhoekBaboonState = {
    safety: 0,
    respect: 0,
    control: 0,
    selected: false,
    mistakes: 0,
    foodSecured: false,
    lastActionWrong: false
};

const namibiaHistoryEvents = [
    { id: "coast-contact", year: "1480s", imageNumber: "01", block: "Pierwsze kontakty", title: "Europejscy żeglarze opisują zdradliwe wybrzeże", detail: "Atlantyckie wybrzeże staje się znane europejskim wyprawom, choć interior przez długi czas pozostaje poza ich kontrolą." },
    { id: "german-protectorate", year: "1884", imageNumber: "02", block: "Kolonia niemiecka", title: "Powstaje Niemiecka Afryka Południowo-Zachodnia", detail: "Niemcy ogłaszają protektorat, a kolonialna administracja zaczyna przejmować ziemię i szlaki." },
    { id: "herero-nama-war", year: "1904", imageNumber: "03", block: "Kolonia niemiecka", title: "Herero i Nama podnoszą opór przeciw kolonii", detail: "Opór przeciw niemieckiej władzy prowadzi do brutalnej wojny kolonialnej." },
    { id: "genocide", year: "1904-1908", imageNumber: "04", block: "Kolonia niemiecka", title: "Ludobójstwo Herero i Nama", detail: "Ten rozdział pozostaje jedną z najważniejszych i najtragiczniejszych części pamięci historycznej Namibii." },
    { id: "south-africa-occupies", year: "1915", imageNumber: "05", block: "Rządy RPA", title: "Afryka Południowa przejmuje kontrolę nad terytorium", detail: "Po kampanii I wojny światowej kończy się niemiecka administracja, a zaczyna długi okres rządów RPA." },
    { id: "old-location", year: "1959", imageNumber: "06", block: "Droga do oporu", title: "Protest w Old Location w Windhoek", detail: "Sprzeciw wobec przymusowych przesiedleń staje się mocnym symbolem narastającego oporu." },
    { id: "swapo-founded", year: "1960", imageNumber: "07", block: "Droga do oporu", title: "Powstaje SWAPO", detail: "Organizacja wyrasta na najważniejszy ruch polityczny walki o niepodległość." },
    { id: "armed-struggle", year: "1966", imageNumber: "08", block: "Walka o niepodległość", title: "Rozpoczyna się wojna wyzwoleńcza", detail: "Starcie pod Omugulugwombashe otwiera militarny etap walki o samostanowienie." },
    { id: "untag-elections", year: "1989", imageNumber: "09", block: "Niepodległość", title: "Misja ONZ nadzoruje pierwsze wolne wybory", detail: "UNTAG pomaga przeprowadzić wybory do zgromadzenia konstytucyjnego." },
    { id: "independence", year: "1990", imageNumber: "10", block: "Niepodległość", title: "Namibia staje się niepodległym państwem", detail: "21 marca Namibia odzyskuje niepodległość, a Sam Nujoma zostaje pierwszym prezydentem." }
];

const historyTilePositions = {
    "german-protectorate": { x: 28, y: 12 },
    "old-location": { x: 62, y: 10 },
    "genocide": { x: 42, y: 24 },
    "untag-elections": { x: 72, y: 31 },
    "swapo-founded": { x: 24, y: 38 },
    "coast-contact": { x: 56, y: 48 },
    "south-africa-occupies": { x: 32, y: 62 },
    "armed-struggle": { x: 70, y: 66 },
    "independence": { x: 48, y: 84 },
    "herero-nama-war": { x: 72, y: 88 }
};

const shuffledHistoryEventIds = [
    "german-protectorate",
    "old-location",
    "genocide",
    "untag-elections",
    "swapo-founded",
    "coast-contact",
    "south-africa-occupies",
    "armed-struggle",
    "independence",
    "herero-nama-war"
];

const baboonStages = [
    {
        prompt: "Stado przecina drogę. Samochód jedzie za Tobą, a młode pawiany są przy poboczu.",
        correctAction: "slow",
        success: "Dobrze. Zwalniasz, dajesz sygnał za sobą i odzyskujesz kontrolę nad sceną.",
        danger: "Pawiany robią się nerwowe, a dystans szybko znika."
    },
    {
        prompt: "Jeden pawian zauważa koszyk z przekąskami i podchodzi bliżej okna.",
        correctAction: "secure",
        success: "Koszyk znika z widoku. Pawian traci motywację do negocjacji przez szybę.",
        danger: "Jedzenie na widoku zamienia ciekawość w bardzo konkretny plan."
    },
    {
        prompt: "Na końcu stada młody pawian zatrzymuje się przy drodze. Trzeba wybrać moment odjazdu.",
        correctAction: "wait",
        success: "Czekasz sekundę dłużej. Droga jest czysta, a wyprawa rusza bez konfliktu.",
        danger: "Pośpiech prowokuje ostatni zwrot akcji tuż przed wyjazdem."
    }
];

const baboonActions = [
    { id: "slow", label: "Zwolnij", stats: { safety: 2, respect: 1, control: 2 }, mood: "✅" },
    { id: "secure", label: "Schowaj jedzenie", stats: { safety: 1, respect: 2, control: 2 }, mood: "🧺" },
    { id: "wait", label: "Poczekaj", stats: { safety: 2, respect: 2, control: 1 }, mood: "🌿" },
    { id: "honk", label: "Klakson", stats: { safety: -1, respect: -2, control: -1 }, mood: "⚠️" }
];

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
    updateWindhoekState();
    updateSolitaireState();

    if(id === "mapScreen"){
        setupNamibiaMap();
        mapInitialPanReady = false;
        updateNamibiaMap();
    }

    if(id === "heroSelectScreen"){
        renderHeroRoster();
    }

    if(id === "expeditionProfileScreen"){
        updateExpeditionProfilePreview();
    }

    if(id === "windhoekScreen"){
        updateWindhoekState();
    }

    if(id === "windhoekHistoryScreen"){
        renderWindhoekHistory();
    }

    if(id === "windhoekBaboonsScreen"){
        updateWindhoekBaboonScreen();
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

    showScreen("heroSelectScreen");
}

function getExpeditionHero(heroId){
    return expeditionHeroes.find(hero=>hero.id === heroId) || expeditionHeroes[0];
}

function getSavedHeroId(){
    return localStorage.getItem("expeditionHeroId") || selectedHeroId || "driver";
}

function renderHeroRoster(){
    const roster = document.getElementById("heroRoster");

    if(!roster){
        return;
    }

    selectedHeroId = getSavedHeroId();

    roster.innerHTML = expeditionHeroes.map(hero=>
        "<button class=\"hero-card" + (hero.id === selectedHeroId ? " selected" : "") + "\" onclick=\"selectHeroProfile('" + hero.id + "')\">" +
            "<span class=\"hero-card-image\" style=\"background-image:url('" + hero.image + "')\"></span>" +
            "<span class=\"hero-card-copy\">" +
                "<strong>" + hero.name + "</strong>" +
                "<small>" + hero.tagline + "</small>" +
            "</span>" +
        "</button>"
    ).join("");

    updateSelectedHeroPreview();
}

function selectHeroProfile(heroId){
    selectedHeroId = heroId;

    for(const card of document.querySelectorAll(".hero-card")){
        card.classList.remove("selected");
    }

    const selectedIndex = expeditionHeroes.findIndex(hero=>hero.id === heroId);
    const selectedCard = document.querySelectorAll(".hero-card")[selectedIndex];

    if(selectedCard){
        selectedCard.classList.add("selected");
    }

    updateSelectedHeroPreview();
}

function updateSelectedHeroPreview(){
    const hero = getExpeditionHero(selectedHeroId);
    const portrait = document.getElementById("selectedHeroPortrait");
    const name = document.getElementById("selectedHeroName");
    const description = document.getElementById("selectedHeroDescription");

    if(portrait){
        portrait.style.backgroundImage = "url('" + hero.image + "')";
    }

    if(name){
        name.innerText = hero.name;
    }

    if(description){
        description.innerText = hero.description;
    }

    renderStatsGrid(document.getElementById("selectedHeroStats"), hero.stats);
}

function saveHeroProfile(){
    const hero = getExpeditionHero(selectedHeroId);

    localStorage.setItem("expeditionHeroId", hero.id);
    localStorage.setItem("expeditionHeroName", hero.name);
    localStorage.setItem("expeditionHeroImage", hero.image);
    localStorage.setItem("expeditionHeroDescription", hero.description);

    showScreen("expeditionProfileScreen");
}

function getCheckedProfileValue(groupName){
    const selected = document.querySelector("input[name=\"" + groupName + "\"]:checked");

    return selected ? selected.value : "";
}

function getCurrentExpeditionChoices(){
    return {
        headgear: getCheckedProfileValue("headgear") || "hat",
        waterLoad: getCheckedProfileValue("waterLoad") || "balanced",
        boots: getCheckedProfileValue("boots") || "trekking",
        toolkit: getCheckedProfileValue("toolkit") || "binoculars"
    };
}

function calculateExpeditionStats(choices){
    const hero = getExpeditionHero(getSavedHeroId());
    const stats = { ...(hero.stats || expeditionBaseStats) };

    for(const groupName of Object.keys(choices)){
        const option = expeditionProfileChoices[groupName] && expeditionProfileChoices[groupName][choices[groupName]];

        if(!option){
            continue;
        }

        for(const statName of Object.keys(option.stats)){
            stats[statName] = Math.max(1, Math.min(6, stats[statName] + option.stats[statName]));
        }
    }

    return stats;
}

function getExpeditionArchetype(stats){
    const heroName = localStorage.getItem("expeditionHeroName");

    if(heroName){
        return heroName;
    }

    const ordered = Object.keys(stats).sort((a, b)=>stats[b] - stats[a]);
    const top = ordered[0];
    const second = ordered[1];

    if(top === "odpornosc" && second === "spokoj"){
        return "Pustynny Twardziel";
    }

    if(top === "szybkosc"){
        return "Szybki Zwiadowca";
    }

    if(top === "uwaznosc"){
        return "Tropiciel Szczegółów";
    }

    if(top === "organizacja"){
        return "Mistrz Logistyki";
    }

    if(top === "spokoj"){
        return "Opanowany Negocjator";
    }

    if(top === "kondycja"){
        return "Wytrwały Wędrowiec";
    }

    return "Zbalansowany Odkrywca";
}

function renderStatsGrid(container, stats){
    if(!container){
        return;
    }

    container.innerHTML = Object.keys(expeditionStatLabels).map(statName=>{
        const value = stats[statName] || 0;
        const dots = Array.from({ length: 6 }, (_, index)=>
            "<span class=\"" + (index < value ? "filled" : "") + "\"></span>"
        ).join("");

        return (
            "<div class=\"stat-chip\">" +
                "<strong>" + expeditionStatLabels[statName] + "</strong>" +
                "<div class=\"stat-dots\">" + dots + "</div>" +
            "</div>"
        );
    }).join("");
}

function updateExpeditionProfilePreview(){
    hydrateExpeditionProfileForm();

    const choices = getCurrentExpeditionChoices();
    const stats = calculateExpeditionStats(choices);
    const archetype = getExpeditionArchetype(stats);
    const hero = getExpeditionHero(getSavedHeroId());

    const archetypeElement = document.getElementById("expeditionArchetype");
    const loadoutElement = document.getElementById("expeditionHeroLoadout");

    if(archetypeElement){
        archetypeElement.innerText = archetype;
    }

    if(loadoutElement){
        loadoutElement.innerText = hero.name + " + ekwipunek startowy";
    }

    renderStatsGrid(document.getElementById("expeditionStatsPreview"), stats);
    setExpeditionProfileLocked(isExpeditionProfileLocked());
}

function isExpeditionProfileLocked(){
    return localStorage.getItem("expeditionProfileLocked") === "true";
}

function setExpeditionProfileLocked(isLocked){
    const profileScreen = document.getElementById("expeditionProfileScreen");
    const inputs = document.querySelectorAll("#expeditionProfileScreen input");
    const button = document.querySelector("#expeditionProfileScreen > button");
    const hero = getExpeditionHero(getSavedHeroId());
    const loadoutElement = document.getElementById("expeditionHeroLoadout");

    if(profileScreen){
        profileScreen.classList.toggle("profile-locked", isLocked);
    }

    for(const input of inputs){
        input.disabled = isLocked;
    }

    if(button){
        button.innerText = isLocked ? "Wróć do Windhoek" : "Rozpocznij trasę";
        button.onclick = isLocked ? function(){ showScreen("windhoekScreen"); } : saveExpeditionProfile;
    }

    if(loadoutElement && isLocked){
        loadoutElement.innerText = hero.name + " · ekwipunek zablokowany po wyjeździe z Windhoek";
    }
}

function hydrateExpeditionProfileForm(){
    if(hydrateExpeditionProfileForm.done){
        return;
    }

    const savedChoices = localStorage.getItem("expeditionProfileChoices");

    if(!savedChoices){
        hydrateExpeditionProfileForm.done = true;
        return;
    }

    try{
        const choices = JSON.parse(savedChoices);

        for(const groupName of Object.keys(choices)){
            const input = document.querySelector("input[name=\"" + groupName + "\"][value=\"" + choices[groupName] + "\"]");

            if(input){
                input.checked = true;
            }
        }
    }catch(error){
        // Keep default expedition choices if old save data is malformed.
    }

    hydrateExpeditionProfileForm.done = true;
}

function saveExpeditionProfile(){
    if(isExpeditionProfileLocked()){
        showScreen("windhoekScreen");
        return;
    }

    const choices = getCurrentExpeditionChoices();
    const stats = calculateExpeditionStats(choices);
    const archetype = getExpeditionArchetype(stats);
    const hero = getExpeditionHero(getSavedHeroId());

    localStorage.setItem("expeditionProfileChoices", JSON.stringify(choices));
    localStorage.setItem("expeditionStats", JSON.stringify(stats));
    localStorage.setItem("expeditionArchetype", archetype);
    localStorage.setItem("expeditionHeroName", hero.name);
    localStorage.setItem("expeditionHeroImage", hero.image);
    localStorage.setItem("expeditionHeroDescription", hero.description);
    localStorage.setItem("windhoekStarted", "true");

    updateWindhoekState();
    showScreen("mapScreen");
}

function getSavedExpeditionStats(){
    const savedStats = localStorage.getItem("expeditionStats");

    if(!savedStats){
        return calculateExpeditionStats(getCurrentExpeditionChoices());
    }

    try{
        return JSON.parse(savedStats);
    }catch(error){
        return calculateExpeditionStats(getCurrentExpeditionChoices());
    }
}

function updateWindhoekState(){
    const mapLocation = document.getElementById("windhoekMapLocation");
    const mapStatus = document.getElementById("windhoekMapStatus");
    const stats = getSavedExpeditionStats();
    const archetype = localStorage.getItem("expeditionArchetype") || getExpeditionArchetype(stats);
    const hero = getExpeditionHero(getSavedHeroId());
    const started = localStorage.getItem("windhoekStarted") === "true";
    const historyDone = localStorage.getItem("windhoekHistoryCompleted") === "true";
    const baboonsDone = localStorage.getItem("windhoekBaboonsCompleted") === "true";
    const windhoekDone = localStorage.getItem("windhoekCompleted") === "true";

    if(mapLocation){
        mapLocation.classList.toggle("in-progress", started && !windhoekDone);
        mapLocation.classList.toggle("completed", windhoekDone);
    }

    if(mapStatus){
        if(windhoekDone){
            mapStatus.innerText = "Ukończono · droga do Solitaire";
        }else if(started){
            mapStatus.innerText = archetype;
        }else{
            mapStatus.innerText = "Start wyprawy";
        }
    }

    const windhoekArchetype = document.getElementById("windhoekArchetype");

    if(windhoekArchetype){
        windhoekArchetype.innerText = archetype;
    }

    const windhoekPortrait = document.getElementById("windhoekHeroPortrait");
    const windhoekDescription = document.getElementById("windhoekHeroDescription");

    if(windhoekPortrait){
        windhoekPortrait.style.backgroundImage = "url('" + (localStorage.getItem("expeditionHeroImage") || hero.image) + "')";
    }

    if(windhoekDescription){
        windhoekDescription.innerText = localStorage.getItem("expeditionHeroDescription") || hero.description;
    }

    renderStatsGrid(document.getElementById("windhoekStatsGrid"), stats);

    const prepStatus = document.getElementById("windhoekPrepStatus");
    const historyStatus = document.getElementById("windhoekHistoryStatus");
    const baboonsStatus = document.getElementById("windhoekBaboonsStatus");
    const departButton = document.getElementById("windhoekDepartButton");
    const prepButton = document.getElementById("windhoekPrepButton");

    if(prepStatus){
        prepStatus.innerText = isExpeditionProfileLocked() ? "Zablokowane po wyjeździe z Windhoek" : "Możesz jeszcze zmienić ekwipunek";
    }

    if(prepButton){
        prepButton.classList.toggle("completed-activity", isExpeditionProfileLocked());
    }

    if(historyStatus){
        historyStatus.innerText = historyDone ? "✓ ukończone" : "Muzeum i oś czasu";
    }

    if(baboonsStatus){
        baboonsStatus.innerText = baboonsDone ? "✓ ukończone" : "Wyjazd z miasta i pierwsza lekcja dzikiej natury";
    }

    if(departButton){
        departButton.innerText = windhoekDone ? "Droga do Solitaire" : "Wyjedź z Windhoek";
    }
}

function updateSolitaireState(){
    const solitaireLocation = document.getElementById("solitaireMapLocation");
    const solitaireStatus = document.getElementById("solitaireMapStatus");
    const travelJeep = document.getElementById("windhoekTravelJeep");
    const unlocked = localStorage.getItem("solitaireUnlocked") === "true";
    const travelPending = localStorage.getItem("windhoekDepartureAnimationPending") === "true";

    if(solitaireLocation){
        solitaireLocation.classList.toggle("locked", !unlocked);
        solitaireLocation.classList.toggle("unlocked", unlocked);
        solitaireLocation.disabled = !unlocked;
    }

    if(solitaireStatus){
        solitaireStatus.innerText = unlocked ? "Odblokowano" : "Po wyjeździe z Windhoek";
    }

    if(travelJeep){
        travelJeep.classList.toggle("active", travelPending);
    }
}

function openWindhoek(){
    showScreen("windhoekScreen");
}

function openCurrentRegion(){
    openWindhoek();
}

function openExpeditionPrep(){
    showScreen("expeditionProfileScreen");
    updateExpeditionProfilePreview();
}

function startWindhoekHistory(){
    const savedOrder = localStorage.getItem("windhoekHistoryOrder");

    if(savedOrder){
        try{
            const eventById = getHistoryEventById();
            windhoekHistoryChoices = normalizeHistorySlots(JSON.parse(savedOrder).filter(id=>!id || eventById[id]));
        }catch(error){
            windhoekHistoryChoices = getEmptyHistorySlots();
        }
    }else if(localStorage.getItem("windhoekHistoryCompleted") === "true"){
        windhoekHistoryChoices = namibiaHistoryEvents.map(event=>event.id);
    }else{
        windhoekHistoryChoices = getEmptyHistorySlots();
    }

    showScreen("windhoekHistoryScreen");
}

function chooseWindhoekHistory(choice){
    addHistoryEvent(choice);
}

function renderWindhoekHistory(){
    const pool = document.getElementById("historyEventPool");
    const slots = document.getElementById("historyTimelineSlots");
    const order = document.getElementById("windhoekHistoryOrder");
    const progress = document.getElementById("historyTimelineProgress");
    const screen = document.getElementById("windhoekHistoryScreen");
    const message = document.getElementById("windhoekHistoryMessage");
    const continueButton = document.getElementById("windhoekHistoryContinueButton");

    if(!pool || !slots || !order){
        return;
    }

    const completed = localStorage.getItem("windhoekHistoryCompleted") === "true";
    windhoekHistoryChoices = normalizeHistorySlots(windhoekHistoryChoices);
    const selectedIds = new Set(windhoekHistoryChoices);
    const eventById = getHistoryEventById();
    const availableEvents = shuffledHistoryEventIds
        .map(id=>eventById[id])
        .filter(event=>event && !selectedIds.has(event.id));

    if(screen){
        screen.classList.toggle("history-solved", completed);
    }

    pool.innerHTML = completed
        ? renderHistoryCompleteStory()
        : availableEvents.map(event=>renderHistoryPoolTile(event)).join("");
    slots.innerHTML = windhoekHistoryChoices
        .map((id, index)=>id && eventById[id] ? renderHistoryTimelineTile(eventById[id], index) : renderHistoryEmptySlot(index))
        .join("");

    if(progress){
        progress.innerText = getFilledHistoryCount() + " / " + namibiaHistoryEvents.length + " wydarzeń";
    }

    if(continueButton){
        continueButton.classList.toggle("visible", completed);
    }

    if(completed){
        order.innerText = "Poznałeś historię Namibii. Możesz ruszać dalej.";

        if(message){
            message.innerText = "Daty zostały odsłonięte, a kafle połączyły się w jedną opowieść: od wybrzeża, przez kolonializm i opór, do niepodległości.";
        }
    }else{
        order.innerText = getFilledHistoryCount()
            ? "Na drabince: " + getFilledHistoryCount() + " wydarzeń. Daty odsłonią się dopiero po poprawnym ułożeniu."
            : "Zbuduj oś z 10 wydarzeń.";
    }
}

function getEmptyHistorySlots(){
    return new Array(namibiaHistoryEvents.length).fill(null);
}

function normalizeHistorySlots(slots){
    const normalized = Array.isArray(slots) ? slots.slice(0, namibiaHistoryEvents.length) : [];

    while(normalized.length < namibiaHistoryEvents.length){
        normalized.push(null);
    }

    return normalized;
}

function getFilledHistoryCount(){
    return windhoekHistoryChoices.filter(Boolean).length;
}

function getHistoryEventById(){
    return namibiaHistoryEvents.reduce((events, event)=>{
        events[event.id] = event;
        return events;
    }, {});
}

function renderHistoryPoolTile(event){
    const position = historyTilePositions[event.id] || { x: 50, y: 50 };

    return "<button class=\"history-tile scattered-history-tile\" style=\"--tile-x:" + position.x + "%; --tile-y:" + position.y + "%\" draggable=\"true\" onpointerdown=\"startHistoryPointerDrag(event, '" + event.id + "')\" ondragstart=\"dragHistoryEvent(event, '" + event.id + "')\" onclick=\"tapHistoryEvent('" + event.id + "')\">" +
        "<span>" + event.block + "</span>" +
        "<div class=\"history-tile-main\">" +
            "<div class=\"history-image-slot\" style=\"background-image:url('assets/history/" + event.imageNumber + ".jpeg')\"></div>" +
            "<strong>" + event.title + "</strong>" +
        "</div>" +
    "</button>";
}

function renderHistoryTimelineTile(event, index){
    const completed = localStorage.getItem("windhoekHistoryCompleted") === "true";
    const dateCopy = completed ? event.year + " · " : "";

    return "<div class=\"history-timeline-item\" draggable=\"true\" onpointerdown=\"startHistoryPointerDrag(event, '" + event.id + "')\" ondragstart=\"dragHistoryEvent(event, '" + event.id + "')\" ondragover=\"allowHistoryDrop(event)\" ondrop=\"dropHistoryEvent(event, " + index + ")\">" +
        "<div class=\"history-event-copy\">" +
            "<span>" + (index + 1) + ". " + dateCopy + event.block + "</span>" +
            "<div class=\"history-tile-main\">" +
                "<div class=\"history-image-slot\" style=\"background-image:url('assets/history/" + event.imageNumber + ".jpeg')\"></div>" +
                "<strong>" + event.title + "</strong>" +
            "</div>" +
        "</div>" +
    "</div>";
}

function renderHistoryCompleteStory(){
    return "<div class=\"history-complete-note\">" +
        namibiaHistoryEvents.map(event=>
            "<article>" +
                "<img src=\"assets/history/" + event.imageNumber + ".jpeg\" alt=\"\">" +
                "<div>" +
                    "<span>" + event.year + " · " + event.block + "</span>" +
                    "<strong>" + event.title + "</strong>" +
                    "<small>" + event.detail + "</small>" +
                "</div>" +
            "</article>"
        ).join("") +
    "</div>";
}

function renderHistoryEmptySlot(index){
    return "<div class=\"history-empty-slot\" data-history-slot=\"" + index + "\" ondragover=\"allowHistoryDrop(event)\" ondrop=\"dropHistoryEvent(event, " + index + ")\">" +
        "<span>" + (index + 1) + "</span>" +
        "<small>Upuść kafel</small>" +
    "</div>";
}

function tapHistoryEvent(id){
    if(Date.now() - historyLastPointerDrop < 300){
        return;
    }

    addHistoryEvent(id);
}

function addHistoryEvent(id, insertIndex){
    if(windhoekHistoryChoices.includes(id)){
        return;
    }

    windhoekHistoryChoices = normalizeHistorySlots(windhoekHistoryChoices);

    if(typeof insertIndex === "number"){
        placeHistoryEventAt(id, insertIndex);
    }else{
        const firstEmpty = windhoekHistoryChoices.indexOf(null);
        placeHistoryEventAt(id, firstEmpty >= 0 ? firstEmpty : windhoekHistoryChoices.length - 1);
    }

    saveWindhoekHistoryOrder();
    renderWindhoekHistory();
}

function removeHistoryEvent(id){
    windhoekHistoryChoices = normalizeHistorySlots(windhoekHistoryChoices).map(eventId=>eventId === id ? null : eventId);
    localStorage.removeItem("windhoekHistoryCompleted");
    saveWindhoekHistoryOrder();
    renderWindhoekHistory();
    updateWindhoekState();
}

function moveHistoryEvent(id, direction){
    const currentIndex = windhoekHistoryChoices.indexOf(id);
    const nextIndex = currentIndex + direction;

    if(currentIndex < 0 || nextIndex < 0 || nextIndex >= windhoekHistoryChoices.length){
        return;
    }

    const displaced = windhoekHistoryChoices[nextIndex];
    windhoekHistoryChoices[nextIndex] = id;
    windhoekHistoryChoices[currentIndex] = displaced || null;
    localStorage.removeItem("windhoekHistoryCompleted");
    saveWindhoekHistoryOrder();
    renderWindhoekHistory();
    updateWindhoekState();
}

function placeHistoryEventAt(id, index){
    windhoekHistoryChoices = normalizeHistorySlots(windhoekHistoryChoices);

    const safeIndex = Math.max(0, Math.min(namibiaHistoryEvents.length - 1, index));
    const currentIndex = windhoekHistoryChoices.indexOf(id);

    if(currentIndex >= 0){
        windhoekHistoryChoices[currentIndex] = null;
    }

    const displaced = windhoekHistoryChoices[safeIndex];
    windhoekHistoryChoices[safeIndex] = id;

    if(displaced && displaced !== id){
        const emptyIndex = windhoekHistoryChoices.indexOf(null);

        if(emptyIndex >= 0){
            windhoekHistoryChoices[emptyIndex] = displaced;
        }else if(currentIndex >= 0){
            windhoekHistoryChoices[currentIndex] = displaced;
        }
    }

    localStorage.removeItem("windhoekHistoryCompleted");
}

function saveWindhoekHistoryOrder(){
    localStorage.setItem("windhoekHistoryOrder", JSON.stringify(windhoekHistoryChoices));
}

function dragHistoryEvent(event, id){
    draggedHistoryEventId = id;
    event.dataTransfer.setData("text/plain", id);
}

function allowHistoryDrop(event){
    event.preventDefault();
}

function dropHistoryEvent(event, insertIndex){
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || draggedHistoryEventId;

    if(!id){
        return;
    }

    if(typeof insertIndex === "number"){
        placeHistoryEventAt(id, insertIndex);
        saveWindhoekHistoryOrder();
        renderWindhoekHistory();
    }else{
        addHistoryEvent(id);
    }

    draggedHistoryEventId = null;
}

function startHistoryPointerDrag(event, id){
    if(event.pointerType === "mouse" && event.button !== 0){
        return;
    }

    const tile = event.currentTarget;
    const rect = tile.getBoundingClientRect();
    const clone = tile.cloneNode(true);

    clone.classList.add("history-drag-ghost");
    clone.style.width = rect.width + "px";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.setProperty("--drag-x", "0px");
    clone.style.setProperty("--drag-y", "0px");
    document.body.appendChild(clone);

    historyPointerDrag = {
        id,
        clone,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        moved: false
    };

    tile.classList.add("drag-source");
    tile.setPointerCapture(event.pointerId);
    tile.addEventListener("pointermove", moveHistoryPointerDrag);
    tile.addEventListener("pointerup", endHistoryPointerDrag);
    tile.addEventListener("pointercancel", cancelHistoryPointerDrag);
}

function moveHistoryPointerDrag(event){
    if(!historyPointerDrag){
        return;
    }

    const drag = historyPointerDrag;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if(Math.abs(deltaX) + Math.abs(deltaY) > 8){
        drag.moved = true;
    }

    drag.clone.style.left = (event.clientX - drag.offsetX) + "px";
    drag.clone.style.top = (event.clientY - drag.offsetY) + "px";
}

function endHistoryPointerDrag(event){
    if(!historyPointerDrag){
        return;
    }

    const drag = historyPointerDrag;
    const source = event.currentTarget;
    const targetSlot = getHistorySlotFromPoint(event.clientX, event.clientY);

    cleanupHistoryPointerDrag(source, event);

    if(targetSlot !== null){
        placeHistoryEventAt(drag.id, targetSlot);
        saveWindhoekHistoryOrder();
        renderWindhoekHistory();
        historyLastPointerDrop = Date.now();
    }else if(drag.moved){
        historyLastPointerDrop = Date.now();
    }
}

function cancelHistoryPointerDrag(event){
    cleanupHistoryPointerDrag(event.currentTarget, event);
}

function cleanupHistoryPointerDrag(source, event){
    if(historyPointerDrag && historyPointerDrag.clone){
        historyPointerDrag.clone.remove();
    }

    if(source){
        source.classList.remove("drag-source");
        source.removeEventListener("pointermove", moveHistoryPointerDrag);
        source.removeEventListener("pointerup", endHistoryPointerDrag);
        source.removeEventListener("pointercancel", cancelHistoryPointerDrag);

        if(event && typeof source.releasePointerCapture === "function"){
            try{
                source.releasePointerCapture(event.pointerId);
            }catch(error){
                // Pointer capture may already be released by the browser.
            }
        }
    }

    historyPointerDrag = null;
}

function getHistorySlotFromPoint(x, y){
    const element = document.elementFromPoint(x, y);
    const slot = element ? element.closest("[data-history-slot], .history-timeline-item") : null;

    if(!slot){
        return null;
    }

    const slotIndex = slot.dataset.historySlot;

    if(slotIndex !== undefined){
        return Number(slotIndex);
    }

    const timelineItems = Array.from(document.querySelectorAll("#historyTimelineSlots .history-timeline-item, #historyTimelineSlots .history-empty-slot"));
    return timelineItems.indexOf(slot);
}

function checkWindhoekHistory(){
    const message = document.getElementById("windhoekHistoryMessage");

    windhoekHistoryChoices = normalizeHistorySlots(windhoekHistoryChoices);

    if(getFilledHistoryCount() < namibiaHistoryEvents.length){
        if(message){
            message.innerText = "Brakuje jeszcze " + (namibiaHistoryEvents.length - getFilledHistoryCount()) + " kafli. Najpierw wypełnij całą drabinkę.";
        }

        return;
    }

    const correctOrder = namibiaHistoryEvents.map(event=>event.id);
    const firstWrongIndex = windhoekHistoryChoices.findIndex((id, index)=>id !== correctOrder[index]);

    if(firstWrongIndex === -1){
        localStorage.setItem("windhoekHistoryCompleted", "true");
        localStorage.setItem("windhoekHistoryOrder", JSON.stringify(windhoekHistoryChoices));

        if(message){
            message.innerText = "Dobra oś. Wyprawa rusza z dużo lepszym rozumieniem kraju, a wpis trafia do Kroniki.";
        }

        renderWindhoekHistory();
    }else if(message){
        message.innerText = "Coś nie gra w okolicy pozycji " + (firstWrongIndex + 1) + ". Sprawdź sąsiednie wydarzenia i spróbuj zamienić je miejscami.";
    }

    updateWindhoekState();
}

function resetWindhoekHistory(){
    windhoekHistoryChoices = getEmptyHistorySlots();
    localStorage.removeItem("windhoekHistoryOrder");
    localStorage.removeItem("windhoekHistoryCompleted");
    renderWindhoekHistory();

    const message = document.getElementById("windhoekHistoryMessage");

    if(message){
        message.innerText = "Ułóż wydarzenia od najstarszego do najnowszego.";
    }

    updateWindhoekState();
}

function startWindhoekBaboons(){
    windhoekBaboonStage = 0;
    windhoekBaboonState = {
        safety: 0,
        respect: 0,
        control: 0,
        selected: false,
        mistakes: 0,
        foodSecured: false,
        lastActionWrong: false
    };
    showScreen("windhoekBaboonsScreen");
}

function updateWindhoekBaboonScreen(){
    const message = document.getElementById("windhoekBaboonsMessage");
    const completeButton = document.getElementById("windhoekBaboonsCompleteButton");
    const prompt = document.getElementById("windhoekBaboonsPrompt");
    const choices = document.getElementById("windhoekBaboonsChoices");
    const safety = document.getElementById("baboonSafetyValue");
    const respect = document.getElementById("baboonRespectValue");
    const control = document.getElementById("baboonControlValue");
    const mood = document.getElementById("baboonMoodIcon");
    const playfield = document.querySelector(".baboon-playfield");
    const food = document.getElementById("baboonFoodIcon");
    const completed = localStorage.getItem("windhoekBaboonsCompleted") === "true";
    const stage = baboonStages[windhoekBaboonStage];

    if(safety){
        safety.innerText = windhoekBaboonState.safety;
    }

    if(respect){
        respect.innerText = windhoekBaboonState.respect;
    }

    if(control){
        control.innerText = windhoekBaboonState.control;
    }

    if(mood && !windhoekBaboonState.selected){
        mood.innerText = windhoekBaboonStage >= baboonStages.length ? "✅" : "👀";
    }

    if(playfield){
        playfield.dataset.stage = String(Math.min(windhoekBaboonStage, baboonStages.length - 1));
        playfield.classList.toggle("resolved", windhoekBaboonState.selected || completed);
        playfield.classList.toggle("completed", completed);
        playfield.classList.toggle("warning", windhoekBaboonState.lastActionWrong === true);
    }

    if(food){
        food.classList.toggle("secured", windhoekBaboonState.foodSecured || completed);
    }

    if(prompt && stage){
        prompt.innerText = stage.prompt;
    }

    if(choices){
        if(completed){
            choices.innerHTML = "<div class=\"baboon-summary\">Lekcja zaliczona: dystans, brak dokarmiania i spokój przy dzikich zwierzętach.</div>";
        }else if(stage){
            choices.innerHTML = baboonActions.map(action=>
                "<button class=\"baboon-choice\" onclick=\"resolveBaboonChoice('" + action.id + "')\"" + (windhoekBaboonState.selected ? " disabled" : "") + ">" + action.label + "</button>"
            ).join("");
        }else{
            choices.innerHTML = "";
        }
    }

    if(message && completed){
        message.innerText = "Jedzenie zabezpieczone, pawiany zostają przy drodze, a wyprawa może ruszać dalej.";
    }

    if(completeButton){
        completeButton.disabled = !windhoekBaboonState.selected && !completed;
        completeButton.classList.toggle("disabled-button", completeButton.disabled);
        completeButton.innerText = completed ? "Ruszaj dalej" : "Dalej";
    }
}

function resolveBaboonChoice(choice){
    const stage = baboonStages[windhoekBaboonStage];
    const message = document.getElementById("windhoekBaboonsMessage");
    const mood = document.getElementById("baboonMoodIcon");
    const selected = baboonActions.find(item=>item.id === choice);

    if(!stage || windhoekBaboonState.selected){
        return;
    }

    if(!selected){
        return;
    }

    const isCorrect = selected.id === stage.correctAction;
    const multiplier = isCorrect ? 1 : 0.7;

    windhoekBaboonState.safety += Math.round(selected.stats.safety * multiplier);
    windhoekBaboonState.respect += Math.round(selected.stats.respect * multiplier);
    windhoekBaboonState.control += Math.round(selected.stats.control * multiplier);
    windhoekBaboonState.lastActionWrong = !isCorrect;

    if(isCorrect){
        windhoekBaboonState.selected = true;

        if(selected.id === "secure"){
            windhoekBaboonState.foodSecured = true;
        }
    }else{
        windhoekBaboonState.mistakes = (windhoekBaboonState.mistakes || 0) + 1;
    }

    if(message){
        message.innerText = isCorrect ? stage.success : stage.danger + " Spróbuj inną akcję.";
    }

    if(mood){
        mood.innerText = isCorrect ? selected.mood : "⚠️";
    }

    updateWindhoekBaboonScreen();
    updateWindhoekState();
}

function advanceWindhoekBaboonStage(){
    if(localStorage.getItem("windhoekBaboonsCompleted") === "true"){
        completeWindhoekDeparture();
        return;
    }

    if(!windhoekBaboonState.selected){
        updateWindhoekBaboonScreen();
        return;
    }

    windhoekBaboonStage += 1;
    windhoekBaboonState.selected = false;
    windhoekBaboonState.lastActionWrong = false;

    if(windhoekBaboonStage >= baboonStages.length){
        localStorage.setItem("windhoekBaboonsCompleted", "true");
    }

    updateWindhoekBaboonScreen();
    updateWindhoekState();
}

function completeWindhoekDeparture(){
    if(localStorage.getItem("windhoekHistoryCompleted") !== "true"){
        startWindhoekHistory();
        return;
    }

    if(localStorage.getItem("windhoekBaboonsCompleted") !== "true"){
        startWindhoekBaboons();
        return;
    }

    localStorage.setItem("windhoekCompleted", "true");
    localStorage.setItem("expeditionProfileLocked", "true");
    localStorage.setItem("solitaireUnlocked", "true");
    localStorage.setItem("windhoekDepartureAnimationPending", "true");
    updateWindhoekState();
    showScreen("mapScreen");

    setTimeout(()=>{
        localStorage.removeItem("windhoekDepartureAnimationPending");
        updateSolitaireState();
    }, 4200);
}

function openSolitaire(){
    if(localStorage.getItem("solitaireUnlocked") !== "true"){
        showScreen("windhoekScreen");
        return;
    }

    showScreen("solitaireScreen");
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

    for(const stop of layer.querySelectorAll(".map-stop")){
        const x = Number(stop.dataset.x || 50);
        const y = Number(stop.dataset.y || 50);
        stop.style.left = x + "%";
        stop.style.top = y + "%";
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

    const routeRegions = Array.from(layer.querySelectorAll(".map-region"));
    const regionPoint = region=>{
        const x = Number(region.dataset.x || 50) * layer.offsetWidth / 100;
        const y = Number(region.dataset.y || 50) * layer.offsetHeight / 100;
        return { x, y };
    };
    const routePoints = [];

    for(let index = 0; index < routeRegions.length; index++){
        const point = regionPoint(routeRegions[index]);

        routePoints.push(point);

        if(index === 2 && routeRegions[index + 1]){
            const nextPoint = regionPoint(routeRegions[index + 1]);
            routePoints.push({ x: point.x - 72, y: point.y - 70 });
            routePoints.push({ x: nextPoint.x + 12, y: nextPoint.y + 22 });
        }

        if(index === 3 && routeRegions[index + 1]){
            const nextPoint = regionPoint(routeRegions[index + 1]);
            routePoints.push({ x: point.x + 6, y: nextPoint.y - 20 });
        }

        if(index === 4 && routeRegions[index + 1]){
            const nextPoint = regionPoint(routeRegions[index + 1]);
            routePoints.push({ x: point.x - 8, y: (point.y + nextPoint.y) / 2 });
        }

        if(index === 5 && routeRegions[index + 1]){
            const nextPoint = regionPoint(routeRegions[index + 1]);
            routePoints.push({ x: point.x + 38, y: point.y - 34 });
            routePoints.push({ x: nextPoint.x - 26, y: nextPoint.y + 34 });
        }
    }

    const points = routePoints.map(point=>point.x + "," + point.y);

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
