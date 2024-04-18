const buttons = document.querySelectorAll(".buttons > button");
const colorPrompt = document.querySelector("#color-prompt");
const cells = document.querySelectorAll(".color-grid > button");
const showScore = document.querySelector("#score");
const showTimer = document.querySelector("#timer");

let colorToGuess;
let score = 0;
let timerInterval;
let isFirstGame = true;
let roundCount = 0;

// generates array of random colors
function generateColorArray(amount) {
  const colorArray = Array(amount).fill("transparent");
  for (let i = 0; i < amount; i++) {
    colorArray[i] = randomRGB();
  }
  return colorArray;
}
// variable to track unlocked difficulty level
let unlockedDifficulty = "easy";

// event listeners for difficulty buttons
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((btn) => btn.classList.remove("selected"));

    button.classList.add("selected");

    const difficulty = button.getAttribute("data-difficulty");
    resetColor();

    // start the game if the selected difficulty is unlocked or show locked message

    if (unlockedDifficulty === difficulty) {
      startGame(difficulty);
    } else {
      let requiredRounds = 0;
      let currentDifficulty = "";

      // determine the number of requiered rounds to unlock selected difficulty
      if (
        difficulty === "easy" &&
        unlockedDifficulty !== "normal" &&
        unlockedDifficulty !== "hard"
      ) {
        requiredRounds = 0;
        currentDifficulty = "EASY";
      } else if (difficulty === "normal" && unlockedDifficulty === "easy") {
        requiredRounds = 1;
        currentDifficulty = "EASY";
      } else if (difficulty === "hard" && unlockedDifficulty === "normal") {
        requiredRounds = 1;
        currentDifficulty = "NORMAL";
      } else if (difficulty === "hard" && unlockedDifficulty === "easy") {
        requiredRounds = 1;
        currentDifficulty = "NORMAL";
      }

      // show locked message if selected difficulty is locked
      if (requiredRounds > 0) {
        let lockedText = `You need to complete ${requiredRounds} round${
          requiredRounds > 1 ? "s" : ""
        } of ${currentDifficulty} mode to unlock ${difficulty.toUpperCase()} mode.`;

        Swal.fire({
          title: "Locked",
          text: lockedText,
          icon: "warning",
          confirmButtonText: "Okay",
          customClass: {
            popup: `locked-popup`,
          },
        });
      } else {
        // else unlock the selected difficulty and start the game
        unlockedDifficulty = difficulty;
        startGame(difficulty);
      }
    }
  });
});

// reset color of cells
function resetColor() {
  cells.forEach((cell) => {
    cell.style.backgroundColor = "transparent";
    cell.removeAttribute("disabled");
  });
}

// start the game with specified difficulty level
function startGame(difficulty) {
  // decide size of color array and the time limit based on difficulty
  const colorArraySize =
    difficulty === "easy" ? 3 : difficulty === "normal" ? 6 : 9;
  const timeLimit =
    difficulty === "easy" ? 40 : difficulty === "normal" ? 30 : 20;

  // generate array of random colors
  const colors = generateColorArray(colorArraySize);
  roundCount = difficulty === "easy" ? 2 : 1;

  // select color to guess and display it
  const availableColors = colors.filter((color) => color !== "transparent");
  colorToGuess = availableColors[randomNum(availableColors.length - 1)];
  colorPrompt.textContent = colorToGuess;

  // reset score if it is first game
  if (isFirstGame) {
    score = 0;
    updateScore();
    isFirstGame = false;
  }

  // reset timer and display colors on cells
  resetTimer(timeLimit);
  cells.forEach((cell, index) => {
    const cellColor = colors[index];
    cell.style.backgroundColor = cellColor;
    cell.setAttribute("onclick", `guess('${cellColor}','${difficulty}')`);
    if (cellColor === "transparent") {
      cell.setAttribute("disabled", true);
    } else {
      cell.removeAttribute("disabled");
    }
  });
}
// handling correct and incorrect guess from player
function guess(guessColor, difficulty) {
  clearInterval(timerInterval);
  // reset cell colors and remove disabled attribute
  cells.forEach((cell) => {
    cell.style.backgroundColor = "transparent";
    cell.removeAttribute("disabled");
  });

  // check if the guess is correct
  if (guessColor === colorToGuess) {
    // Winning scenario
    let scoreIncrement = 0;
    if (difficulty === "easy") {
      scoreIncrement = 10;
    } else if (difficulty === "normal") {
      scoreIncrement = 20;
    } else if (difficulty === "hard") {
      scoreIncrement = 30;
    }
    score += scoreIncrement;
    updateScore();

    roundCount++;

    // update unlockedDifficulty if required rounds are completed
    if (roundCount >= 2) {
      if (unlockedDifficulty === "easy" && difficulty === "easy") {
        unlockedDifficulty = "normal";
      } else if (unlockedDifficulty === "normal" && difficulty === "normal") {
        unlockedDifficulty = "hard";
      } else if (unlockedDifficulty === "hard" && difficulty === "hard") {
        Swal.fire({
          title: "Congratulations!",
          text: "You have completed all difficulty levels.",
          icon: "success",
          confirmButtonText: "Okay",
        });
        return;
      }
      roundCount = 0;
    }
    // show win message and start the next game
    Swal.fire({
      title: "YOU WIN!",
      text: `Score: ${score}`,
      icon: "success",
      confirmButtonText: "Okay",
      customClass: {
        popup: `success-popup`,
        title: `success-title`,
        content: `success-content`,
      },
    }).then(() => {
      startGame(unlockedDifficulty);
    });
  } else {
    // Losing scenario
    score = 0;
    updateScore();
    Swal.fire({
      title: "YOU LOSE!",
      text: `Score: ${score}`,
      icon: "error",
      confirmButtonText: "Okay",
      customClass: {
        popup: `error-popup`,
        title: `error-title`,
        content: `error-content`,
      },
    });
  }
}

function updateScore() {
  showScore.textContent = `Score: ${score}`;
}
// generate random color
function randomRGB() {
  return `rgb(${randomNum(255)}, ${randomNum(255)}, ${randomNum(255)})`;
}
// generates random number up to given limit
function randomNum(n) {
  return Math.ceil(Math.random() * n);
}

// reset timer based on specified time limit
function resetTimer(timeLimit) {
  clearInterval(timerInterval);

  let timeLeft = timeLimit;
  showTimer.textContent = `Time: ${timeLeft} sec`;
  timerInterval = setInterval(() => {
    timeLeft--;
    showTimer.textContent = `Time: ${timeLeft} sec`;

    if (timeLeft === 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}
// end of the game if timeout
function endGame() {
  Swal.fire({
    title: "Time's up!",
    text: `Final Score: ${score}`,
    icon: "info",
    confirmButtonText: "Okay",
    customClass: {
      popup: `time-popup`,
    },
  });
}
