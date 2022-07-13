var r = document.querySelector(":root");
const scoreBoard = document.getElementById("score-board");
const ctnGame = document.getElementById("ctn-game");
const ctnStart = document.getElementById("ctn-start");
const ctnGameOver = document.getElementById("ctn-game-over");
const startGame = document.getElementById("start-game");
const restartGame = document.getElementById("restart-game");
const amiiboFigure = document.getElementById("amiibo-figure");
const marioFigure = document.getElementById("mario-figure");
const restartAmiiboFigure = document.getElementById("restart-amiibo-figure");
const restartMarioFigure = document.getElementById("restart-mario-figure");
const marioCard = document.getElementById("mario-card");
const amiiboCard = document.getElementById("amiibo-card");
const restartAmiiboCard = document.getElementById("restart-amiibo-card");
const restartMarioCard = document.getElementById("restart-mario-card");
let numberOfCards = 6;
let outPut = ``;
let typeOfAmiibo = "Figure"; // Default
let cards;
let match = 0;
const timer = document.getElementById("timer");
let startTime = 30;
let currentTime = startTime;
const bestTimeSpan = document.getElementById("best-time");
let bestTime = 0;
const flips = document.getElementById("flips");
let currentFlips = 0;
const bestFlipsSpan = document.getElementById("best-flips");
let bestFlips = 100;
const gameResults = document.getElementById("game-results");
let result = false;
let countDown;

amiiboFigure.addEventListener("click", choseAmiiboFigure);
marioFigure.addEventListener("click", choseAmiiboFigure);

restartAmiiboFigure.addEventListener("click", choseAmiiboFigure);
restartMarioFigure.addEventListener("click", choseAmiiboFigure);

amiiboCard.addEventListener("click", choseAmiiboCard);
marioCard.addEventListener("click", choseAmiiboCard);

restartAmiiboCard.addEventListener("click", choseAmiiboCard);
restartMarioCard.addEventListener("click", choseAmiiboCard);

function choseAmiiboFigure() {
	typeOfAmiibo = "Figure";
	amiiboFigure.style.color = "goldenrod";
	amiiboCard.style.color = "white";
	restartAmiiboFigure.style.color = "goldenrod";
	restartAmiiboCard.style.color = "white";
}

function choseAmiiboCard() {
	typeOfAmiibo = "Card";
	amiiboCard.style.color = "goldenrod";
	amiiboFigure.style.color = "white";
	restartAmiiboCard.style.color = "goldenrod";
	restartAmiiboFigure.style.color = "white";
}

startGame.addEventListener("click", fetchAllAmiibos);
restartGame.addEventListener("click", fetchAllAmiibos);

// Track card numbers used
let numberArrayUsed = [];
let numberArrayUsedWithoutDuplicates;

// Main program code
async function fetchAllAmiibos() {
	ctnStart.style.display = "none";
	ctnGameOver.style.display = "none";
	document.querySelector(".overlay").classList.add("active");
	const resultsAll = await fetch("https://www.amiiboapi.com/api/amiibo/");
	const dataAll = await resultsAll.json();

	// Create a random array without duplicates
	let chooseRandomNumber;
	const randomNumberArray = [];
	let randomNumberArrayWithoutDuplicates = [...new Set(randomNumberArray)];

	numberArrayUsedWithoutDuplicates = [...new Set(numberArrayUsed)];

	do {
		chooseRandomNumber = Math.floor(Math.random() * dataAll.amiibo.length);
		if (dataAll.amiibo[chooseRandomNumber].type === typeOfAmiibo) {
			// Reset the array after all cards are used
			if (numberArrayUsed.length >= dataAll.amiibo.length) {
				numberArrayUsed = [];
			}

			// Push unused random numbers into both arrays, providing a new set of cards each replay
			if (!numberArrayUsedWithoutDuplicates.includes(chooseRandomNumber)) {
				randomNumberArray.push(chooseRandomNumber);
				numberArrayUsed.push(chooseRandomNumber);
			}
		}
		randomNumberArrayWithoutDuplicates = [...new Set(randomNumberArray)];
	} while (randomNumberArrayWithoutDuplicates.length < numberOfCards);

	// Flexibility to change the imgage heights, using a CSS variable
	if (typeOfAmiibo === "Figure") {
		r.style.setProperty("--img-height", "75px");
	}
	if (typeOfAmiibo === "Card") {
		r.style.setProperty("--img-height", "75px");
	}

	let amiiboName;
	let amiiboNameNoWhiteSpace;
	let ammiboImage;

	for (let i = 0; i < numberOfCards; i++) {
		// Retrieve name of card
		amiiboName = dataAll.amiibo[randomNumberArrayWithoutDuplicates[i]].name;
		// Remove whitespace from the name of the card
		amiiboNameNoWhiteSpace = amiiboName.split(" ").join("");
		// Retrieve name of image
		ammiboImage = dataAll.amiibo[randomNumberArrayWithoutDuplicates[i]].image;

		// Create a set of matching cards
		outPut += `
                <div class="memory-card" data-image="${amiiboNameNoWhiteSpace}">
                  <div class="card-layout ${typeOfAmiibo.toLowerCase()} front-face">
                    <h5>${amiiboName}</h5>
                    <img src="${ammiboImage}">
                  </div>
                  <div class="card-layout ${typeOfAmiibo.toLowerCase()} back-face">
                    <h5>Nintendo</h5>
                  </div>                 
                </div>
                <div class="memory-card" data-image="${amiiboNameNoWhiteSpace}">
                  <div class="card-layout ${typeOfAmiibo.toLowerCase()} front-face">
                    <h5>${amiiboName}</h5>
                    <img src="${ammiboImage}">
                  </div>
                  <div class="card-layout ${typeOfAmiibo.toLowerCase()} back-face">
                    <h5>Nintendo</h5>
                  </div>   
                </div>  
                `;
	}
	// Add the set of matching cards to the game container
	ctnGame.innerHTML = outPut;
	document.querySelector(".overlay").classList.remove("active");
	ctnGame.style.display = "flex";

	// Set score board
	timer.innerHTML = `Time: ${currentTime}`;
	flips.innerHTML = `Flips: ${currentFlips}`;
	scoreBoard.style.display = "flex";

	cards = document.querySelectorAll(".memory-card");

	// Shuffle cards by assigning a CSS order Property to each card
	shuffle();
	// Start the game
	setInterval(checkForWin, 1000);
	startCountDown();

	let hasFlippedCard = false;
	let lockBoard = false;
	let firstCard;
	let secondCard;

	function flipCard() {
		if (lockBoard) return;
		if (this === firstCard) return;

		this.classList.toggle("flip");

		if (!hasFlippedCard) {
			hasFlippedCard = true;
			firstCard = this;
			currentFlips += 1;
			flips.innerHTML = `Flips: ${currentFlips}`;
		} else {
			secondCard = this;
			currentFlips += 1;
			flips.innerHTML = `Flips: ${currentFlips}`;
			checkForMatch();
		}
	} // End of flipCard

	function checkForMatch() {
		if (firstCard.dataset.image === secondCard.dataset.image) {
			match += 1;
			disableCards();
		} else {
			unflipCards();
		}
	}

	function disableCards() {
		firstCard.removeEventListener("click", flipCard);
		secondCard.removeEventListener("click", flipCard);

		resetBoard();
	}

	function unflipCards() {
		lockBoard = true;
		setTimeout(() => {
			firstCard.classList.remove("flip");
			secondCard.classList.remove("flip");

			resetBoard();
		}, 1500);
	}

	function resetBoard() {
		[hasFlippedCard, lockBoard] = [false, false];
		[firstCard, secondCard] = [null, null];
	}

	cards.forEach((c) => c.addEventListener("click", flipCard));
} // End of fetchAllAmiibos

function checkForWin() {
	// Check for lose
	if (currentTime === 0) {
		result = false;
		gameResults.textContent = "You Lose!";
		gameResults.style.color = "red";
		ctnGame.style.display = "none";
		ctnGameOver.style.display = "flex";

		// Delete current cards from the game container
		for (let i = 1; i < cards.length; i++) {
			cards[i].remove();
		}

		// Check for best time
		if (currentTime > bestTime) {
			bestTime = currentTime;
			bestTimeSpan.innerHTML = `Best Time: ${startTime - bestTime} Seconds`;
		}
		// Check for lowest flips
		if (currentFlips < bestFlips && result === true) {
			bestFlips = currentFlips;
			bestFlipsSpan.innerHTML = `Least Flips: ${bestFlips}`;
		} else {
			// Fix display if the game is not played or lost the first time
			bestFlipsSpan.innerHTML = `Least Flips: ${bestFlips}`;
		}
		resetVariables();
	}

	// Check for win
	if (match === numberOfCards) {
		result = true;
		match = 0;

		setTimeout(() => {
			gameResults.textContent = "You Win!";
			gameResults.style.color = "LawnGreen";
			ctnGame.style.display = "none";
			ctnGameOver.style.display = "flex";

			// Delete current cards
			for (let i = 1; i < cards.length; i++) {
				cards[i].remove();
			}
		}, 1000);

		// Check for best time
		if (currentTime > bestTime) {
			bestTime = currentTime;
			bestTimeSpan.innerHTML = `Best Time: ${startTime - bestTime} Seconds`;
		}
		// Check for lowest flips
		if (currentFlips < bestFlips && result === true) {
			bestFlips = currentFlips;
			bestFlipsSpan.innerHTML = `Least Flips: ${bestFlips}`;
		} else {
			// Fix display if the game is not played or lost the first time
			bestFlipsSpan.innerHTML = `Least Flips: ${bestFlips}`;
		}
		resetVariables();
	}

	// Fix display if the game is not played or lost the first time
	if (bestFlips === 100) {
		bestFlipsSpan.innerHTML = `Least Flips: `;
	}
} // End of checkForWin function

function startCountDown() {
	countDown = setInterval(() => {
		currentTime -= 1;
		timer.innerHTML = `Time: ${currentTime}`;
	}, 1000);
}

function resetVariables() {
	clearInterval(checkForWin);
	clearInterval(countDown);

	// Clear arrays
	cards = [];
	arraryRandomPosition = [];
	arraryRandomPositionWithoutDuplicates = [];
	// Clear variables
	currentTime = startTime;
	currentFlips = 0;
	match = 0;
	outPut = ``;
	result = null;
}

// Shuffle cards by assigning a CSS order Property to each card
function shuffle() {
	cards = document.querySelectorAll(".memory-card");

	let arraryRandomPosition = [];
	let arraryRandomPositionWithoutDuplicates = [];

	do {
		let randomPosition = Math.floor(Math.random() * numberOfCards * 2);
		arraryRandomPosition.push(randomPosition);

		arraryRandomPositionWithoutDuplicates = [...new Set(arraryRandomPosition)];
	} while (arraryRandomPositionWithoutDuplicates.length < numberOfCards * 2);

	for (let i = 0; i < arraryRandomPositionWithoutDuplicates.length; i++) {
		cards[i].style.order = arraryRandomPositionWithoutDuplicates[i];
	}
}
