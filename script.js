const gameArea = document.getElementById("game-area");
const shotsEl = document.getElementById("shots");
const hitsEl = document.getElementById("hits");
const accuracyEl = document.getElementById("accuracy");
const startBtn = document.getElementById("start");

let shots = 0;
let hits = 0;
let roundActive = false;
let target;

function spawnTarget() {
  if (target) target.remove();

  target = document.createElement("div");
  target.classList.add("target");

  const x = Math.random() * (gameArea.clientWidth - 40);
  const y = Math.random() * (gameArea.clientHeight - 40);

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener("click", (e) => {
    e.stopPropagation(); // prevents counting as a miss
    hits++;
    updateStats();
    spawnTarget();
  });

  gameArea.appendChild(target);
}

function updateStats() {
  shotsEl.textContent = shots;
  hitsEl.textContent = hits;
  accuracyEl.textContent =
    shots === 0 ? "0%" : `${Math.round((hits / shots) * 100)}%`;
}

gameArea.addEventListener("click", () => {
  if (!roundActive) return;
  shots++;
  updateStats();
});

startBtn.addEventListener("click", () => {
  shots = 0;
  hits = 0;
  roundActive = true;
  updateStats();
  spawnTarget();

  setTimeout(() => {
    roundActive = false;
    if (target) target.remove();
    alert(`Round over!\nAccuracy: ${accuracyEl.textContent}`);
  }, 30000); // 30-second round
});
