const MODEL_URL = "https://teachablemachine.withgoogle.com/models/eWIHszlmV/";

const fileInput = document.getElementById("file-input");
const previewImage = document.getElementById("preview-image");
const uploadHint = document.querySelector(".upload-hint");
const statusText = document.getElementById("status");
const imageStateBadge = document.getElementById("image-state");
const labelContainer = document.getElementById("label-container");
const topResultBadge = document.getElementById("top-result");
const confidenceBar = document.getElementById("confidence-bar");

let model;

function setStatus(message) {
  statusText.textContent = message;
}

function setImageState(message) {
  imageStateBadge.textContent = message;
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

async function predict() {
  const predictions = await model.predict(previewImage);
  predictions.sort((a, b) => b.probability - a.probability);
  renderLabels(predictions);
  updateTopResult(predictions);
}

function showPreview(objectUrl) {
  previewImage.onload = async () => {
    previewImage.classList.add("is-visible");
    if (uploadHint) {
      uploadHint.style.display = "none";
    }
    URL.revokeObjectURL(objectUrl);
    try {
      setStatus("이미지 분석 중...");
      setImageState("분석 중");
      await predict();
      setStatus("분석 완료. 다른 이미지를 올려보세요.");
      setImageState("완료");
    } catch (error) {
      setStatus("분석에 실패했습니다. 다시 시도해 주세요.");
      setImageState("오류");
      clearLabels();
    }
  };

  previewImage.src = objectUrl;
}

async function handleFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  clearLabels();
  setImageState("로딩 중");
  const objectUrl = URL.createObjectURL(file);
  showPreview(objectUrl);
}

async function init() {
  try {
    setStatus("모델을 불러오는 중...");
    await loadModel();
    setStatus("사진을 업로드해 주세요.");
  } catch (error) {
    setStatus("모델을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

fileInput.addEventListener("change", handleFileChange);
clearLabels();
setImageState("대기 중");
init();
