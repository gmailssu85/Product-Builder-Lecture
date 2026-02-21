const generateButton = document.getElementById("generate-button");
const numbersContainer = document.getElementById("numbers");
const bonusNumberContainer = document.getElementById("bonus-number");
const themeToggleButton = document.getElementById("theme-toggle");
const commentForm = document.getElementById("comment-form");
const commentNameInput = document.getElementById("comment-name");
const commentMessageInput = document.getElementById("comment-message");
const commentStatus = document.getElementById("comment-status");
const commentList = document.getElementById("comment-list");
const root = document.documentElement;

const SUN_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0-4.5a1 1 0 0 1 1 1v1.5a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1zm10-8a1 1 0 0 1-1 1h-1.5a1 1 0 0 1 0-2H21a1 1 0 0 1 1 1zM5 12a1 1 0 0 1-1 1H2.5a1 1 0 1 1 0-2H4a1 1 0 0 1 1 1zm12.95-6.36a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0zM7.52 16.78a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.41-1.41l1.06-1.06a1 1 0 0 1 1.41 0zm10.43 2.47a1 1 0 0 1-1.41 0l-1.06-1.06a1 1 0 1 1 1.41-1.41l1.06 1.06a1 1 0 0 1 0 1.41zM7.52 7.22a1 1 0 0 1-1.41 0L5.05 6.16a1 1 0 0 1 1.41-1.41l1.06 1.06a1 1 0 0 1 0 1.41z"
      fill="currentColor"
    />
  </svg>
`;

const MOON_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M21 14.5a8.5 8.5 0 1 1-9.5-11 1 1 0 0 1 .3 1.95 6.5 6.5 0 1 0 7.25 7.25 1 1 0 0 1 1.95.3z"
      fill="currentColor"
    />
  </svg>
`;

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggleButton.innerHTML = theme === "dark" ? SUN_ICON : MOON_ICON;
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

function formatCreatedAt(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "방금 전";
  }

  return timestamp.toDate().toLocaleString("ko-KR");
}

function renderComments(docs) {
  commentList.innerHTML = "";

  if (!docs.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "comment-item";
    emptyItem.textContent = "첫 댓글을 남겨보세요.";
    commentList.appendChild(emptyItem);
    return;
  }

  docs.forEach((doc) => {
    const data = doc.data();
    const item = document.createElement("li");
    item.className = "comment-item";

    const meta = document.createElement("div");
    meta.className = "comment-meta";

    const author = document.createElement("strong");
    author.textContent = data.name || "익명";

    const date = document.createElement("span");
    date.textContent = formatCreatedAt(data.createdAt);

    meta.appendChild(author);
    meta.appendChild(date);

    const message = document.createElement("p");
    message.className = "comment-message";
    message.textContent = data.message || "";

    item.appendChild(meta);
    item.appendChild(message);
    commentList.appendChild(item);
  });
}

function setCommentStatus(message) {
  commentStatus.textContent = message;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureFirebaseReady() {
  if (!window.firebase) {
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");
  } else if (!firebase.firestore) {
    await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");
  }

  if (!firebase.apps || !firebase.apps.length) {
    let initError;
    try {
      await loadScript("/__/firebase/init.js");
    } catch (error) {
      initError = error;
    }

    if (!firebase.apps || !firebase.apps.length) {
      try {
        const response = await fetch("/__/firebase/init.json");
        if (!response.ok) {
          throw new Error("Firebase 설정 응답이 올바르지 않습니다.");
        }
        const config = await response.json();
        firebase.initializeApp(config);
      } catch (error) {
        throw initError || error;
      }
    }
  }

  if (!firebase.firestore) {
    throw new Error("Firestore SDK를 불러오지 못했습니다.");
  }

  return firebase.firestore();
}

async function initFirebaseComments() {
  let db;
  try {
    db = await ensureFirebaseReady();
  } catch (error) {
    setCommentStatus("Firebase 초기화에 실패했습니다. Firebase Hosting 배포 상태를 확인해 주세요.");
    return;
  }

  const commentsRef = db.collection("lotto-comments");

  commentsRef
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot(
      (snapshot) => {
        renderComments(snapshot.docs);
      },
      () => {
        setCommentStatus("댓글을 불러오지 못했습니다.");
      }
    );

  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = commentNameInput.value.trim();
    const message = commentMessageInput.value.trim();

    if (!name || !message) {
      setCommentStatus("이름과 댓글 내용을 입력해 주세요.");
      return;
    }

    try {
      setCommentStatus("댓글 저장 중...");
      await commentsRef.add({
        name,
        message,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      commentMessageInput.value = "";
      setCommentStatus("댓글이 등록되었습니다.");
    } catch (error) {
      setCommentStatus("댓글 등록에 실패했습니다. Firestore 권한을 확인해 주세요.");
    }
  });
}

themeToggleButton.addEventListener("click", toggleTheme);
generateButton.addEventListener("click", generateLottoNumbers);

initTheme();
generateLottoNumbers();
initFirebaseComments();
