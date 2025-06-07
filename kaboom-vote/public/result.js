// ==========================
// 🎇 Kaboom.js - 스페셜 이벤트 효과 추가 + 결과별 사운드 분기
// ==========================
import kaboom from "https://unpkg.com/kaboom@3000.0.0-beta.2/dist/kaboom.mjs";

kaboom({
  background: [14, 29, 47],
});

loadSound("pop", "/sounds/pop.mp3");         // 성공
loadSound("fail", "/sounds/fail.mp3");       // 실패
loadSound("neutral", "/sounds/neutral.mp3"); // 애매
loadSound("drum", "/sounds/drumroll.mp3");

const socket = io();

let currentQuestion = "Which do you prefer: A or B?";
let teamScore = { teamA: 0, teamB: 0 };
let round = 1;
let logStartY = 580;
let lastResult = { aPercent: 0, bPercent: 0, aCount: 0, bCount: 0 };
let resultVisible = false;

const accent = rgb(0, 168, 225);
const colorA = rgb(240, 80, 80);
const colorB = rgb(80, 160, 255);
const textColor = rgb(240, 240, 240);

let questionLabel = add([
  text(currentQuestion, { size: 36, color: accent }),
  pos(center().x, 100),
  anchor("center"),
]);

const inputBox = document.createElement("input");
inputBox.type = "text";
inputBox.placeholder = "Type new question and press Enter...";
inputBox.style.position = "absolute";
inputBox.style.top = "20px";
inputBox.style.left = "50%";
inputBox.style.transform = "translateX(-50%)";
inputBox.style.padding = "14px 24px";
inputBox.style.borderRadius = "14px";
inputBox.style.border = "none";
inputBox.style.background = "#1e2a3a";
inputBox.style.color = "#fff";
inputBox.style.fontSize = "17px";
inputBox.style.outline = "none";
inputBox.style.fontFamily = "'Amazon Ember', sans-serif";
document.body.appendChild(inputBox);

inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentQuestion = inputBox.value;
    questionLabel.text = currentQuestion;
    inputBox.value = "";
  }
});

const barY = 160;
const barX = center().x - 300;

let aBar = add([
  rect(0, 36),
  pos(barX, barY),
  color(colorA),
  outline(2, rgb(255, 255, 255)),
  anchor("left"),
]);

let bBar = add([
  rect(0, 36),
  pos(barX, barY),
  color(colorB),
  outline(2, rgb(255, 255, 255)),
  anchor("left"),
]);

let aLabel = add([
  text("A: ?% (?)", { size: 20, color: textColor }),
  pos(barX + 10, barY + 4),
  anchor("left"),
]);

let bLabel = add([
  text("B: ?% (?)", { size: 20, color: textColor }),
  pos(barX + 590, barY + 4),
  anchor("right"),
]);

let scoreLabel = add([
  text("Team A: 0 | Team B: 0", { size: 20, color: textColor }),
  pos(center().x, 240),
  anchor("center"),
]);

function styledButton(label, posX, tag, bgColor = accent) {
  add([
    rect(180, 48, { radius: 10 }),
    pos(posX, 300),
    color(bgColor),
    area(),
    anchor("center"),
    outline(2),
    tag
  ]);
  add([
    text(label, { size: 20, color: rgb(20, 20, 20) }),
    pos(posX, 300),
    anchor("center"),
  ]);
}

styledButton("Reveal Result", center().x - 120, "revealBtn");
styledButton("Reset Votes", center().x + 120, "resetBtn", rgb(160, 160, 160));

onClick("revealBtn", () => {
  countdown(() => {
    resultVisible = true;
    updateBars(lastResult.aCount, lastResult.bCount);
    playRevealEffect(lastResult);
  });
});

onClick("resetBtn", () => {
  socket.emit("resetVotes");
  logResult();
  resultVisible = false;
  aLabel.text = "A: ?% (?)";
  bLabel.text = "B: ?% (?)";
  aBar.width = 0;
  bBar.width = 0;
  bBar.pos = vec2(barX, barY);
});

function updateBars(aCount, bCount) {
  const total = aCount + bCount;
  const aRatio = total > 0 ? aCount / total : 0;
  const bRatio = total > 0 ? bCount / total : 0;
  const aPercent = Math.round(aRatio * 100);
  const bPercent = Math.round(bRatio * 100);

  lastResult = { aPercent, bPercent, aCount, bCount };

  if (resultVisible) {
    tween(aBar.width, 600 * aRatio, 0.5, (aW) => {
      aBar.width = aW;
      bBar.pos = vec2(barX + aW, barY);
    });

    tween(bBar.width, 600 * bRatio, 0.5, (bW) => {
      bBar.width = bW;
    });

    aLabel.text = `A: ${aPercent}% (${aCount})`;
    bLabel.text = `B: ${bPercent}% (${bCount})`;
  }

  if (aCount !== bCount) {
    if (aCount > bCount) teamScore.teamA++;
    else teamScore.teamB++;
  }

  scoreLabel.text = `Team A: ${teamScore.teamA} | Team B: ${teamScore.teamB}`;
}

function logResult() {
  const logText = `Round ${round++}: A ${lastResult.aPercent}% (${lastResult.aCount}) | B ${lastResult.bPercent}% (${lastResult.bCount})\n→ ${currentQuestion}`;
  add([
    text(logText, { size: 16, color: textColor }),
    pos(60, logStartY),
  ]);
  logStartY += 32;
}

function countdown(callback) {
  const countdownText = add([
    text("3", { size: 64, color: accent }),
    pos(center()),
    anchor("center"),
    z(20),
  ]);
  play("drum");
  let count = 3;
  const interval = setInterval(() => {
    count--;
    countdownText.text = count > 0 ? count.toString() : "";
    if (count === 0) {
      destroy(countdownText);
      clearInterval(interval);
      callback();
    }
  }, 1000);
}

function playRevealEffect(result) {
  const gap = Math.abs(result.aPercent - result.bPercent);
  let scaleVal = gap <= 2 ? 3 : gap <= 5 ? 2.5 : gap <= 10 ? 2 : gap <= 20 ? 1.5 : 1.2;

  if (gap > 40) shake(8);

  const fx = add([
    text("50:50 MATCH!", { size: 32, color: accent }),
    pos(center()),
    anchor("center"),
    scale(vec2(0.1)),
    z(10),
  ]);

  tween(vec2(0.1), vec2(scaleVal), 0.6, (val) => fx.scale = vec2(val), easings.easeOutBounce);
  wait(2, () => destroy(fx));

  const flash = add([
    rect(width(), height()),
    pos(0, 0),
    color(255, 255, 255),
    opacity(0.1),
    z(0),
  ]);
  tween(0.1, 0, 0.5, (o) => flash.opacity = o, easings.easeOutSine);
  wait(0.6, () => destroy(flash));

  for (let i = 0; i < 80; i++) {
    add([
      rect(rand(3, 6), rand(3, 6)),
      pos(center()),
      color(rand(150, 255), rand(100, 255), rand(100, 255)),
      move(choose([LEFT, RIGHT, UP, DOWN]), rand(200, 600)),
      lifespan(1.2),
      rotate(rand(0, 360)),
    ]);
  }

  if (gap <= 5) {
    play("pop");
  } else if (gap > 10) {
    play("fail");
  } else {
    play("neutral");
  }
}

socket.on("update", ({ A, B }) => {
  updateBars(A, B);
});
