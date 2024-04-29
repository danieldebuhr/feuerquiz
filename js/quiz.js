let equipmentInfo = {};
let firetruckEquipment = [];
let firetruckShelves = {};
let selectedEquipment = {};
let randomEquipment;

let countAll = 0;
let countCorrect = 0;


const truckSelect = document.getElementById('truckSelect');
const shelfSelect = document.getElementById('shelfSelect');
const finish = document.getElementById('finish');
const finishText = document.getElementById('finishText');
const resultDiv = document.getElementById('result');
const equipmentImage = document.getElementById('equipmentImage');
const equimentDisplay = document.getElementById('equipmentDisplay')
const setup = document.getElementById('setup');
const quizContainer = document.getElementById('quizContainer');
const statusDiv = document.getElementById('status');
const nextButton = document.getElementById('next');

function fetchData() {
    fetch('/equipment_info.json')
        .then(response => response.json())
        .then(data => {
            equipmentInfo = data;
            // Fetch the firetruck shelves info from the static JSON file
            fetch('/firetruck_shelves.json')
                .then(response => response.json())
                .then(data => {
                    firetruckShelves = data;
                    // Initialize a random equipment after the data is fetched
                    start();
                });
        });
}

function setCars() {
    truckSelect.innerHTML = '<option value="">Fahrzeug auswählen</option>';
    Object.keys(firetruckShelves).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `Fahrzeug ${key}`;
        truckSelect.appendChild(option);
    });
    shelfSelect.innerHTML = '<option value="">Ort auswählen</option>';
}

function start() {
    quizContainer.classList.add('hidden');
    setup.classList.remove('hidden');
    setCars();
}

function updateStatus() {
    const truck = truckSelect.value
    statusDiv.innerHTML = `Fahrzeug ${truck} | ${countAll - firetruckEquipment.length} von ${countAll}`;
}

function startQuiz() {

    
    resultDiv.innerHTML = '';

    populateTruckEquipment()
    populateShelves()
    selectRandomEquipment()
    

    setup.classList.add('hidden');
    quizContainer.classList.remove('hidden');

}

function cleanName($name) {
    return $name.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function populateTruckEquipment() {
    // map equipment to firetruck
    firetruckEquipment = [];
    for (let key in equipmentInfo) {
        equipmentInfo[key].forEach(equipment => {
            if (equipment.firetruck == truckSelect.value) {
                firetruckEquipment.push({ equipment: key, ...equipment });
            }
        });
    }

    firetruckEquipment.sort(() => Math.random() - 0.5);
    firetruckEquipment = firetruckEquipment.slice(0, 10);

    countAll = firetruckEquipment.length;
}

function populateShelves() {
    const selectedTruck = truckSelect.value;
    shelfSelect.innerHTML = '<option value="">Wo befindet sich...</option>';

    if (selectedTruck && firetruckShelves[selectedTruck]) {
        firetruckShelves[selectedTruck].sort().forEach(shelf => {
            const option = document.createElement('option');
            option.value = shelf;
            option.textContent = `${shelf}`;
            shelfSelect.appendChild(option);
        });
    }
}


function selectRandomEquipment() {
    const randomIndex = Math.floor(Math.random() * firetruckEquipment.length);
    selectedEquipment = firetruckEquipment.pop(randomIndex); // Remove the random equipment from the array
    equipmentImage.src = `/img/${selectedEquipment.equipment}${selectedEquipment.extension}`;  // Set the image
    equimentDisplay.innerHTML = `<b>${cleanName(selectedEquipment.equipment)}</b>`;
    updateStatus()
}


// Function to validate user's selection
function validateSelection() {

    shelfSelect.classList.add('hidden');

    let resultText = '';
    if (selectedEquipment.shelf === shelfSelect.value) {
        launchConfetti(); // Launch confetti effect
        // resultText = `Super! ${selectedEquipment.shelf} ist der richtige Ort. Weiter so! 🎉`;
        const randomIndex = Math.floor(Math.random() * correctAnswers.length);
        resultText = correctAnswers[randomIndex].replace('##SHELF##', selectedEquipment.shelf);
        countCorrect++;
    } else {
        const randomIndex = Math.floor(Math.random() * wrongAnwsers.length);
        resultText = wrongAnwsers[randomIndex].replace('##SHELF##', selectedEquipment.shelf);
    }

    nextButton.classList.remove('hidden');
    resultDiv.innerHTML = resultText;
}

function next() {
    shelfSelect.classList.remove('hidden');
    nextButton.classList.add('hidden');
    resultDiv.innerHTML = '';
    shelfSelect.value = '';
    if(firetruckEquipment.length == 0) {
        showFinishScreen();
        return;
    }
    selectRandomEquipment()
}

function showFinishScreen() {
    quizContainer.classList.add('hidden');
    setup.classList.remove('hidden');
    finishText.classList.remove('hidden');
    const percentage = (countCorrect / countAll) * 100;
    let message = "";

    if (percentage < 20) {
        message = `Es scheint, als wäre dieses Quiz ziemlich schwierig für dich gewesen. Du hast nur ${countCorrect} von ${countAll} Fragen richtig. Aber keine Sorge, Übung macht den Meister!`;
    } else if (percentage >= 20 && percentage < 50) {
        message = `Nicht schlecht! Du hast ${countCorrect} von ${countAll} Fragen richtig beantwortet. Mit etwas mehr Übung erreichst du sicher bald eine höhere Punktzahl.`;
    } else if (percentage >= 50 && percentage < 70) {
        launchConfetti()
        message = `Gut gemacht! Du hast mehr als die Hälfte der Fragen richtig, nämlich ${countCorrect} von ${countAll}. Das ist eine solide Leistung, auf der du aufbauen kannst.`;
    } else if (percentage >= 70 && percentage < 90) {
        launchConfetti()
        message = `Tolle Leistung! Du hast ${countCorrect} von ${countAll} Fragen richtig. Du hast das Thema wirklich gut verstanden. Weiter so!`;
    } else if (percentage >= 90 && percentage < 100) {
        launchConfetti()
        message = `Hervorragend! Du hast fast alle Fragen richtig beantwortet, nämlich ${countCorrect} von ${countAll}. Dein Wissen zu diesem Thema ist beeindruckend!`;
    } else {
        launchConfetti()
        setTimeout(launchConfetti, 1000);
        setTimeout(launchConfetti, 2000);
        message = `Perfekt! Du hast alle Fragen richtig beantwortet. Das ist eine beeindruckende Leistung! Herzlichen Glückwunsch!`;
    }

    finishText.innerHTML = message;

    countCorrect = 0;
    countAll = 0;
    setCars();
}

// Function to launch confetti
function launchConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Initialize a random equipment on page load
window.onload = function () {
    quizContainer.classList.add('hidden');
    finishText.classList.add('hidden');
    setup.classList.remove('hidden');
    nextButton.classList.add('hidden');
    fetchData();
}