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
const FIREBASE_CONFIG = {
  projectId: "productionbuilderweek1",
  appId: "1:891804464676:web:b4fd2ec6cd11a07afa8ab1",
  storageBucket: "productionbuilderweek1.firebasestorage.app",
  apiKey: "AIzaSyCPrsyRzWVLfAwkRWS1-mef2JTH4CD5bjo",
  authDomain: "productionbuilderweek1.firebaseapp.com",
  messagingSenderId: "891804464676",
  measurementId: "G-NDXNPFHGBL",
};

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
    firebase.initializeApp(FIREBASE_CONFIG);
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
