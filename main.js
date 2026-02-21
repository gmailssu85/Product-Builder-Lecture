const generateButton = document.getElementById("generate-button");
const numbersContainer = document.getElementById("numbers");
const bonusNumberContainer = document.getElementById("bonus-number");
const themeToggleButton = document.getElementById("theme-toggle");
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggleButton.textContent = theme === "dark" ? "화이트 모드" : "다크 모드";
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const currentTheme = root.getAttribute("data-theme") || "light";
  setTheme(currentTheme === "dark" ? "light" : "dark");
}

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

themeToggleButton.addEventListener("click", toggleTheme);
generateButton.addEventListener("click", generateLottoNumbers);

initTheme();
generateLottoNumbers();
