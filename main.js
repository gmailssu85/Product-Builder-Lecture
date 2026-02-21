const generateButton = document.getElementById("generate-button");
const numbersContainer = document.getElementById("numbers");
const bonusNumberContainer = document.getElementById("bonus-number");

function createUniqueNumbers(count, min, max, excludeSet = new Set()) {
  const numbers = new Set(excludeSet);

  while (numbers.size < count + excludeSet.size) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }

  return [...numbers].filter((n) => !excludeSet.has(n));
}

function renderMainNumbers(numbers) {
  numbersContainer.innerHTML = "";
  numbers.forEach((num) => {
    const ball = document.createElement("span");
    ball.className = "ball";
    ball.textContent = String(num);
    numbersContainer.appendChild(ball);
  });
}

function renderBonusNumber(num) {
  bonusNumberContainer.textContent = String(num);
}

function generateLottoNumbers() {
  const mainNumbers = createUniqueNumbers(6, 1, 45).sort((a, b) => a - b);
  const bonusNumber = createUniqueNumbers(1, 1, 45, new Set(mainNumbers))[0];

  renderMainNumbers(mainNumbers);
  renderBonusNumber(bonusNumber);
}

generateButton.addEventListener("click", generateLottoNumbers);
generateLottoNumbers();
