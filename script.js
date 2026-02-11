const gameArea = document.getElementById("game-area");
const shotsEl = document.getElementById("shots");
const hitsEl = document.getElementById("hits");
const accuracyEl = document.getElementById("accuracy");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start");
const sizeSlider = document.getElementById("sizeSlider");
const difficultySelect = document.getElementById("difficultySelect");
const timerEl = document.getElementById("timer");

let shots = 0;
let hits = 0;
let roundActive = false;
let target;
let clickTimes = [];
let hitOffsets = [];
let spawnInterval;
let roundTime = 30;
let timerCountdown;

// Difficulty spawn rates (ms)
const difficultySettings = {
  easy: 1200,
  medium: 800,
  hard: 400
};

// Utility clamp
function clamp(v) { return Math.max(0, Math.min(1, v)); }

// Update stats
function updateStats() {
  shotsEl.textContent = shots;
  hitsEl.textContent = hits;
  accuracyEl.textContent = shots === 0 ? "0%" : `${Math.round((hits/shots)*100)}%`;

  // Skill-based score
  const avgTime = clickTimes.length > 1 ? (clickTimes.at(-1)-clickTimes[0])/hits : 0;
  const precision = hitOffsets.length ? 1-(hitOffsets.reduce((a,b)=>a+b)/hitOffsets.length)/40 : 0;
  const speed = clamp(avgTime ? 1/(avgTime/300) : 0);
  const precisionScore = clamp((hits/shots) * precision);
  const finalScore = speed*0.3 + precisionScore*0.7;
  scoreEl.textContent = Math.round(finalScore*1000);
}

// Create a particle effect at x,y
function createParticle(x,y) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.width = '8px';
  p.style.height = '8px';
  p.style.left = `${x-4}px`;
  p.style.top = `${y-4}px`;
  p.style.background = `hsl(${Math.random()*360},100%,50%)`;
  gameArea.appendChild(p);
  setTimeout(()=>p.remove(),600);
}

// Spawn a target
function spawnTarget() {
  if(target) target.remove();

  const size = sizeSlider.value;
  target = document.createElement("div");
  target.className = "target";
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  const x = Math.random() * (gameArea.clientWidth - size);
  const y = Math.random() * (gameArea.clientHeight - size);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;

  target.addEventListener("click", (e)=>{
    e.stopPropagation();
    shots++;
    hits++;

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width/2 - gameArea.getBoundingClientRect().left;
    const centerY = rect.top + rect.height/2 - gameArea.getBoundingClientRect().top;
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;
    hitOffsets.push(Math.hypot(dx-rect.width/2, dy-rect.height/2));
    clickTimes.push(performance.now());

    createParticle(centerX, centerY);
    showScorePopup(centerX, centerY, "+1");

    updateStats();
    spawnTarget();
  });

  gameArea.appendChild(target);
}

// Click = miss
gameArea.addEventListener("click",()=>{
  if(!roundActive) return;
  shots++;
  updateStats();
});

// Show floating score popup
function showScorePopup(x,y,text) {
  const pop = document.createElement('div');
  pop.textContent = text;
  pop.style.position='absolute';
  pop.style.left=`${x}px`;
  pop.style.top=`${y}px`;
  pop.style.color='yellow';
  pop.style.fontWeight='bold';
  pop.style.fontSize='16px';
  pop.style.pointerEvents='none';
  gameArea.appendChild(pop);

  let top=0;
  const anim = setInterval(()=>{
    top-=2;
    pop.style.top=`${y+top}px`;
    pop.style.opacity=1+top/40;
  },16);
  setTimeout(()=>{
    clearInterval(anim);
    pop.remove();
  },600);
}

// Start round
startBtn.addEventListener("click",()=>{
  shots=0; hits=0; clickTimes=[]; hitOffsets=[];
  roundActive=true; updateStats();
  spawnTarget();

  const difficulty = difficultySelect.value;
  clearInterval(spawnInterval);

  // Timer
  clearInterval(timerCountdown);
  let timeLeft=roundTime;
  timerEl.textContent=`Time: ${timeLeft}s`;
  timerCountdown=setInterval(()=>{
    if(!roundActive) { clearInterval(timerCountdown); return; }
    timeLeft--;
    timerEl.textContent=`Time: ${timeLeft}s`;
    if(timeLeft<=0){
      roundActive=false;
      if(target) target.remove();
      clearInterval(spawnInterval);
      clearInterval(timerCountdown);
      alert(`Round over!\nAccuracy: ${accuracyEl.textContent}\nScore: ${scoreEl.textContent}`);
    }
  },1000);

  // Smooth target movement for medium/hard
  if(difficulty!=="easy"){
    spawnInterval=setInterval(()=>{
      if(!target) return;
      const size=target.offsetWidth;
      target.style.left=`${Math.random()*(gameArea.clientWidth-size)}px`;
      target.style.top=`${Math.random()*(gameArea.clientHeight-size)}px`;
    }, difficultySettings[difficulty]);
  }
});
