const MODEL_URL = "https://teachablemachine.withgoogle.com/models/eWIHszlmV/";

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const statusText = document.getElementById("status");
const webcamContainer = document.getElementById("webcam-container");
const labelContainer = document.getElementById("label-container");
const topResultBadge = document.getElementById("top-result");
const confidenceBar = document.getElementById("confidence-bar");
const fpsBadge = document.getElementById("fps");

let model;
let webcam;
let maxPredictions = 0;
let running = false;
let lastFrameTime = 0;

function setStatus(message) {
  statusText.textContent = message;
}

function setButtons(active) {
  startButton.disabled = active;
  stopButton.disabled = !active;
}

function clearLabels() {
  labelContainer.innerHTML = "";
  topResultBadge.textContent = "대기 중";
  confidenceBar.style.width = "0%";
}

async function loadModel() {
  const modelURL = `${MODEL_URL}model.json`;
  const metadataURL = `${MODEL_URL}metadata.json`;
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
}

function renderLabels(predictions) {
  labelContainer.innerHTML = "";

  predictions.forEach((prediction) => {
    const row = document.createElement("div");
    row.className = "label-row";

    const name = document.createElement("span");
    name.className = "label-name";
    name.textContent = prediction.className;

    const score = document.createElement("span");
    score.className = "label-score";
    score.textContent = `${(prediction.probability * 100).toFixed(1)}%`;

    row.appendChild(name);
    row.appendChild(score);
    labelContainer.appendChild(row);
  });
}

function updateTopResult(predictions) {
  if (!predictions.length) {
    topResultBadge.textContent = "대기 중";
    confidenceBar.style.width = "0%";
    return;
  }

  const top = predictions[0];
  topResultBadge.textContent = `${top.className} ${(top.probability * 100).toFixed(1)}%`;
  confidenceBar.style.width = `${Math.round(top.probability * 100)}%`;
}

function updateFps(now) {
  if (!lastFrameTime) {
    lastFrameTime = now;
    return;
  }
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  const fps = Math.round(1000 / Math.max(delta, 1));
  fpsBadge.textContent = `FPS: ${fps}`;
}

async function initCamera() {
  const flip = true;
  webcam = new tmImage.Webcam(360, 360, flip);
  await webcam.setup();
  await webcam.play();
  webcamContainer.innerHTML = "";
  webcamContainer.appendChild(webcam.canvas);
}

async function loop(timestamp) {
  if (!running) {
    return;
  }
  webcam.update();
  updateFps(timestamp);
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const predictions = await model.predict(webcam.canvas);
  predictions.sort((a, b) => b.probability - a.probability);
  renderLabels(predictions);
  updateTopResult(predictions);
}

async function start() {
  if (running) {
    return;
  }

  try {
    setStatus("모델을 불러오는 중...");
    setButtons(true);
    clearLabels();

    if (!model) {
      await loadModel();
    }

    setStatus("카메라 준비 중...");
    await initCamera();

    running = true;
    setStatus("분석 중입니다. 카메라를 향해 주세요.");
    window.requestAnimationFrame(loop);
  } catch (error) {
    running = false;
    setButtons(false);
    setStatus("카메라를 시작할 수 없습니다. 권한을 확인해 주세요.");
  }
}

function stop() {
  if (!running) {
    return;
  }

  running = false;
  setButtons(false);
  setStatus("중지되었습니다. 다시 시작할 수 있습니다.");
  clearLabels();
  fpsBadge.textContent = "FPS: --";

  if (webcam) {
    webcam.stop();
  }
}

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);

setButtons(false);
clearLabels();
