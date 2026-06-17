document.getElementById('patch-note-btn').onclick = () => { document.getElementById('patch-note-modal').style.display = 'block'; };

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const size = Math.min(window.innerWidth - 30, 360);
canvas.width = size;
canvas.height = size;

let shakeTime = 0, shakeIntensity = 0;
let balls = [], particles = [], bullets = [], groundSlamAreas = [], textPopups = [], fanAttackPreviews = [], customGrabs = [], burrowPreviews = [];
let earthquakes = [];
let flashBgColor = null;
let craters = [], soundwaves = [], darkBombThreats = [];
let parkSwords = [];
let dogPuddles = [];
let activeDonations = [];
let monkeyRains = [];
let gameSpeed = 1.0;
let simonProjectiles = [], dominicProjectiles = [], seqLaserBullets = [];
const arenaLeft = 4, arenaRight = size - 4, arenaTop = 4, arenaBottom = size - 4;
let isCountingDown = false, countdownTimer = 3, gameMode = 2, gameActive = false, countdownIntervalId = null;
let lastScreenBeforeDict = 'main';
let p1Selected = null, p2Selected = null, p3Selected = null;
function createShockwave(x, y, maxRadius, color) {
soundwaves.push({ x: x, y: y, angle: 0, life: 60, radius: 10, color: color, isFullCircle: true });
}

// 캐릭터 데이터 (건숭이, 김민채 스킬 설명 등 갱신)
const characters = [
{ id: 0, name: "🛡️ 김민채", nickname: "민채", class: "tanker", color: "#ff4757", maxHp: 300, radius: 23, speed: 1.4, bumpDmg: 0 },
{ id: 1, name: "⚡ 공병은", nickname: "병은", class: "dealer", color: "#2ed573", maxHp: 225, radius: 18, speed: 1.7, bumpDmg: 0 },
{ id: 2, name: "👑 박지성", nickname: "지성", class: "dealer", color: "#f1c40f", maxHp: 225, radius: 20, speed: 1.95, bumpDmg: 0 },
{ id: 3, name: "📺 김티비", nickname: "티비", class: "dealer", color: "#808080", maxHp: 50, radius: 21, speed: 1.3, bumpDmg: 5 },
{ id: 4, name: "🖌️ 김가은", nickname: "가은", class: "util", color: "#b339a3", maxHp: 175, radius: 19, speed: 2.1, bumpDmg: 0 },
{ id: 5, name: "🎙️ 김건우", nickname: "건우", class: "dealer", color: "#e67e22", maxHp: 250, radius: 20, speed: 1.2, bumpDmg: 0 },
{ id: 6, name: "🔮 곤지암병은", nickname: "곤지암병은", class: "util", color: "#741b7c", maxHp: 150, radius: 18, speed: 1.6, bumpDmg: 0 },
{ id: 8, name: "✨ 차은우지성", nickname: "차은우지성", class: "util", color: "#ffb6c1", maxHp: 200, radius: 20, speed: 1.5, bumpDmg: 0 },
{ id: 9, name: "🔴 버튜버 김티비", nickname: "V티비", class: "util", color: "#ff9ff3", maxHp: 225, radius: 21, speed: 1.5, bumpDmg: 0 },
{ id: 10, name: "💻 김민제미나이", nickname: "김민제미나이", class: "dealer", color: "#00ff00", maxHp: 200, radius: 20, speed: 1.6, bumpDmg: 0 },
{ id: 11, name: "🐵 건숭이", nickname: "건숭이", class: "tanker", color: "#8B4513", maxHp: 300, radius: 22, speed: 1.68, bumpDmg: 0 },
{ id: 12, name: "🏰 공필두병은", nickname: "공필두", class: "tanker", color: "#2c3e50", maxHp: 275, radius: 24, speed: 1.5, bumpDmg: 0 }
];
const dictionaryData = [
{ nickname: "민채", color: "#ff4757", name: "🛡️ 김민채", class: "tanker", hpStat: 95, atkStat: 50, spdStat: 40, desc: "패시브: 받는 피해 10% 감소 (분노 시 30% 감면 및 이속 100% 증가) 🛡️<br>스킬 1: 먹기 - 장판에 닿은 대상을 삼켜 피해.<br>스킬 2: 대지 강타 - 광역 지진 슬로우.<br>스킬 3: 코끼리의 왕 (3.5초) - 거대한 코끼리 2마리를 발사합니다. 적중 시 강한 넉백 및 15피해. 벽에 충돌 시 10 추가 피해." },
{ nickname: "병은", color: "#2ed573", name: "⚡ 공병은", class: "dealer", hpStat: 55, atkStat: 75, spdStat: 75, desc: "스킬 1: 사이먼도미닉 / 15 / 3초 / 감전<br>스킬 2: 사이먼 앤 도미닉 봄 / 15 / 3.5초 / 감전<br>스킬 3: 일렉트릭 레이저 / 6 / 4초 / 360도 회전 3방향 빔 발사 (적중 시 단일 타격 6뎀 및 감전 부여, 감전 갱신 방지)" },
{ nickname: "지성", color: "#f1c40f", name: "👑 박지성", class: "dealer", hpStat: 65, atkStat: 65, spdStat: 90, desc: "패시브: 이동속도 +30% 🏃<br>스킬 1: 소드 마스터 - 4개의 검을 소환하여 순차 발사 (쿨타임 3.5초).<br>스킬 2: 얼굴 뽐내기 - 음파 발사.<br>궁극기: 신성력\n• \n지속 시간 동안만 충돌 데미지 활성화(5)." },
{ nickname: "티비(1페)", color: "#808080", name: "📺 김티비 (1페이즈)", class: "dealer", hpStat: 20, atkStat: 90, spdStat: 35, desc: "패시브: 사망 시 각성 페이즈 진입.<br>스킬 1: 기본 공격 패턴 - 아직 각성하지 않은 상태입니다." },
{ nickname: "최해솔(각성)", color: "#ff4757", name: "🔥 최해솔 (각성)", class: "util", hpStat: 90, atkStat: 100, spdStat: 60, desc: "패시브: 폭주 모드 - 스킬 쿨타임 및 선딜레이 감소.<br>스킬 1: 화면 붕괴 레이저 (적중 시 화상).<br>스킬 2: 전방위 펄스.<br>스킬 3: 데스 그랩 - 적을 강제로 끌고 오는 사슬 투척." },
{ nickname: "가은", color: "#b339a3", name: "🖌️ 김가은", class: "util", hpStat: 45, atkStat: 60, spdStat: 95, desc: "패시브: 이동속도 +40% ⚡<br>스킬 1: 붓 슬래시.<br>스킬 2: 광역 붓질 - 적을 빨아들이고 폭발.<br>스킬 3: 표식 - 적중 시 10데미지 및 표식 대상 피격 시 5 체력 회복." },
{ nickname: "건우", color: "#e67e22", name: "🎙️ 김건우", class: "dealer", hpStat: 75, atkStat: 80, spdStat: 40, desc: "패시브: 이동속도 -20% 🐌 (땅파기 사용 시 게이지 획득, 최대 2. 꽉 차면 다음 스킬 강화)<br>스킬 1: 하이퍼 파괴 레이저 (초당 18뎀 / 강화 시 파란색, 초당 30뎀).<br>스킬 2: 잠행 기습 - 땅으로 숨어 넉백 (20뎀 / 강화 시 파란색, 30뎀)." },
{ nickname: "곤지암병은", color: "#741b7c", name: "🔮 곤지암병은", class: "util", hpStat: 40, atkStat: 65, spdStat: 70, desc: "스킬 1: 환영 분신 소환 (본체 체력 10 회복, 체력 소진 시 소멸).<br>스킬 2: 너는 이미 죽어있다 - 적 배후 순간이동 찌르기(+5 힐).<br>스킬 3: 어둠 폭탄 (+5 힐)." },
{ nickname: "차은우지성", color: "#ffb6c1", name: "✨ 차은우지성", class: "util", hpStat: 70, atkStat: 60, spdStat: 60, desc: "패시브: 주변 반경 내 적에게 지속 피해 (틱당 1뎀 연타).<br>스킬 1: 매력의 개 / 5 / 3.5초 / 개 투사체 발사 후 지속피해 장판(반지름 55) 생성<br>스킬 2: 매력 업 / 0 / 4초 / 패시브 장판 범위 대폭 증가 (반지름 110)<br>스킬 3: 치유의 장판 / 0 / 4.5초 / 장판 내 적 피해 및 자신 지속 회복" },
{ nickname: "V티비", color: "#ff9ff3", name: "🔴 버튜버 김티비", class: "util", hpStat: 75, atkStat: 70, spdStat: 60, desc: "패시브: 4.5초마다 무작위 도네이션 스킬 발동.<br>도네이션: 좋은 힐(50회복)\n등 \n모든 스킬 동일 확률(약 14.28%) 발동." },
{ nickname: "김민제미나이", color: "#00ff00", name: "💻 김민제미나이", class: "dealer", hpStat: 60, atkStat: 85, spdStat: 70, desc: "스킬 1: 레이저 펄스 - 적에게 화상을 입히는 일직선 레이저 빔 발사.<br>스킬 2: 데이터 폭발 - 적을 2초간 빨아들이는 구역을 생성 후 폭발(20뎀).<br>스킬 3: 해킹 - 적에게 링크를 연결하여 연결 완료 즉시 폭발(20뎀)과 함께 4초간 해킹 디버프를 부여하며 체력을 10 회복합니다." },
{ nickname: "건숭이", color: "#8B4513", name: "🐵 건숭이", class: "tanker", hpStat: 95, atkStat: 50, spdStat: 70, desc: "패시브: 이동속도 20% 증가<br>스킬 1: 원숭이의 속도 (4초) - 0.5초간 구석 이동 후 벽을 타고 3바퀴 돌며 닿는 적에게 15피해 및 밀쳐냄<br>스킬 2: 원숭이의 비 (4초) - 커다란 원숭이들이 화면 위에서 폭우처럼 쏟아져 내립니다. 닿은 적에게 20피해<br>스킬 3: 원숭이가 되 (4초) - 3초간 이름이 🐵로 변경, 이속 250% 증가, 충돌데미지 10 획득, 방어력 30% 감소." },
{ nickname: "공필두", color: "#2c3e50", name: "🏰 공필두병은", class: "tanker", hpStat: 90, atkStat: 70, spdStat: 50, desc: "패시브 특화: 쿨타임 정지 및 스킬 건너뛰기 효과에 면역됩니다.<br>Lv.1 무장지대 (반지름 65): 좌우 권총포탑 (1초마다 3피해). 15초 유지.<br>Lv.2 무장요새 (반지름 110): 상하 소총포탑 추가 (1초마다 6피해). 25초 유지.<br>Lv.max 무장성채 (반지름 150): 대각선 저격포탑 추가 (1초마다 8피해)." }
];

document.getElementById('btn-start-game').onclick = goToModeSelect;
document.getElementById('btn-mode-1v1').onclick = () => setGameMode(2);
document.getElementById('btn-mode-brawl').onclick = () => setGameMode(3);
document.getElementById('btn-mode-practice').onclick = () => setGameMode(4);
document.getElementById('btn-mode-back').onclick = goToMainHome;
document.getElementById('btn-char-back').onclick = goToModeSelect;
document.getElementById('btn-exit-game').onclick = goToMainHome;
document.getElementById('btn-next-match').onclick = () => { goToMainHome(); goToModeSelect(); };
document.getElementById('btn-open-dict-home').onclick = () => openDictionary('main');
document.getElementById('btn-open-dict-mode').onclick = () => openDictionary('mode');
document.getElementById('btn-close-dict').onclick = closeDictionary;

function initCharCards() {
document.getElementById('grid-tanker').innerHTML = '';
document.getElementById('grid-dealer').innerHTML = '';
document.getElementById('grid-util').innerHTML = '';
characters.forEach(origChar => {
let char = origChar;
if (gameMode === 4 && origChar.id === 3) {
char = { id: 3, name: "🔥 최해솔 (각성)", nickname: "최해솔", class: "dealer", color: "#ff4757", maxHp: 200, radius: 21, speed: 1.3, bumpDmg: 0, startAsPhase2: true };
}
const card = document.createElement('div'); card.className = 'char-card'; card.id = 'card-' + char.id;
card.innerHTML = '<div class="char-name" style="color:'+char.color+'">'+char.name+'</div><div class="char-info" style="display:none;"></div>';
card.addEventListener('click', () => selectCharacter(char));
const targetGrid = document.getElementById('grid-' + char.class);
if (targetGrid) targetGrid.appendChild(card);
});
}
initCharCards();

const dictTabsGrid = document.getElementById('dict-tabs-grid');
dictTabsGrid.innerHTML = '';
dictionaryData.forEach((char, idx) => {
const tab = document.createElement('div'); tab.className = 'dict-tab ' + (idx === 0 ? 'active' : '');
tab.style.color = char.color; tab.innerText = char.nickname; tab.onclick = () => showDictDetail(char, tab);
dictTabsGrid.appendChild(tab);
});
function openDictionary(fromScreen) {
lastScreenBeforeDict = fromScreen;
document.getElementById('main-home-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'none';
document.getElementById('dict-screen').style.display = 'flex';
showDictDetail(dictionaryData[0], dictTabsGrid.firstChild);
}

function closeDictionary() {
document.getElementById('dict-screen').style.display = 'none';
if (lastScreenBeforeDict === 'main') { document.getElementById('main-home-screen').style.display = 'flex'; }
else { document.getElementById('mode-select-screen').style.display = 'flex';
}
}

function showDictDetail(char, tabEl) {
document.querySelectorAll('.dict-tab').forEach(t => t.classList.remove('active'));
if(tabEl) tabEl.classList.add('active');
const classNames = { tanker: "탱커 🛡️", dealer: "데미지 딜러 ⚔️", util: "유틸리티 ⚡" };
const detailBox = document.getElementById('dict-detail-content');
detailBox.innerHTML = '<div class="dict-detail-header"><div class="dict-detail-name" style="color:'+char.color+'">'+char.name+'</div><div class="dict-detail-class" style="color:'+char.color+'">'+classNames[char.class]+'</div></div>' +
'<div class="stat-row"><div class="stat-label">생명력</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:'+char.hpStat+'%; background:var(--neon-red)"></div></div></div>' +
'<div class="stat-row"><div class="stat-label">공격력</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:'+char.atkStat+'%; background:var(--neon-yellow)"></div></div></div>' +
'<div class="stat-row"><div class="stat-label">기동성</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:'+char.spdStat+'%; background:var(--neon-blue)"></div></div></div>' +
'<div class="dict-detail-desc"><strong>[영웅 메커니즘 개요]</strong><br>' + char.desc + '</div>';
}

function setGameSpeed(speed) {
gameSpeed = speed;
const buttons = document.querySelectorAll('.speed-btn');
buttons.forEach(btn => {
if (parseFloat(btn.innerText.replace('×', '')) === speed) { btn.classList.add('active'); } else { btn.classList.remove('active'); }
});
}

function goToModeSelect() {
document.getElementById('main-home-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'flex';
document.getElementById('char-select-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'none';
}

function setGameMode(mode) {
gameMode = mode;
initCharCards();
p1Selected = null; p2Selected = null; p3Selected = null;
document.getElementById('main-home-screen').style.display = 'none';
document.getElementById('mode-select-screen').style.display = 'none';
document.getElementById('char-select-screen').style.display = 'flex';
document.getElementById('p3-ui-box').style.display = (mode === 3) ? 'flex' : 'none';
if(mode === 4) document.getElementById('selection-status').innerText = "연습할 영웅을 고르세요!";
else document.getElementById('selection-status').innerText = "1P 대기중... 영웅을 고르세요";
}

function goToMainHome() {
gameActive = false;
isCountingDown = false; if(countdownIntervalId) clearInterval(countdownIntervalId);
p1Selected = null;
p2Selected = null; p3Selected = null;
balls = []; bullets = []; particles = []; groundSlamAreas = [];
craters = []; soundwaves = []; textPopups = []; fanAttackPreviews = [];
customGrabs = []; burrowPreviews = [];
dogPuddles = []; activeDonations = [];
earthquakes = []; parkSwords = []; simonProjectiles = []; dominicProjectiles = [];
seqLaserBullets = []; darkBombThreats = []; monkeyRains = [];
setGameSpeed(1.0);
ctx.clearRect(0, 0, canvas.width, canvas.height);
document.getElementById('char-select-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'none';
document.getElementById('game-container').style.display = 'none';
document.getElementById('countdown-overlay').style.display = 'none';
document.getElementById('result-screen').style.display = 'none';
document.getElementById('main-home-screen').style.display = 'flex';
}

function selectCharacter(char) {
if (gameMode === 4) {
p1Selected = char;
p2Selected = { id: 99, name: "🤖 훈련용 봇", nickname: "샌드백", class: "tanker", color: "#888888", maxHp: 99999, radius: 25, speed: 0, bumpDmg: 0 };
playSelectImpact(char.color);
setTimeout(() => { startBattle(); }, 400);
return;
}
if (!p1Selected) { p1Selected = char; playSelectImpact(char.color);
document.getElementById('selection-status').innerText = "2P 대기중... 영웅을 고르세요"; }
else if (!p2Selected) {
p2Selected = char; playSelectImpact(char.color);
if (gameMode === 2) { setTimeout(() => { startBattle(); }, 400); }
else { document.getElementById('selection-status').innerText = "3P 대기중... 영웅을 고르세요";
}
}
else if (gameMode === 3 && !p3Selected) { p3Selected = char; playSelectImpact(char.color); setTimeout(() => { startBattle(); }, 400);
}
}

function playSelectImpact(color) {
flashBgColor = color; shakeTime = 12; shakeIntensity = 8; setTimeout(() => { flashBgColor = null; }, 120);
}

class TextPopup {
constructor(x, y, text, isHeal = false) {
this.x = x + (Math.random() - 0.5) * 40;
this.y = y - 15 - Math.random() * 25;
this.text = text; this.isHeal = isHeal;
this.life = 55;
this.vy = -0.8; this.alpha = 1;
}
update() { this.y += this.vy * gameSpeed; this.life -= gameSpeed;
if (this.life < 20) this.alpha -= (1 / 20) * gameSpeed; }
draw() {
if (this.alpha <= 0) return;
ctx.save();
ctx.globalAlpha = Math.max(0, this.alpha);
ctx.fillStyle = this.isHeal ? "#2ed573" : (this.text.includes("어지러움") ? "#f1c40f" : "#ff3838");
ctx.font = "bold 16px Arial";
ctx.textAlign = "center"; ctx.shadowBlur = 6; ctx.shadowColor = "#000";
ctx.fillText(this.text, this.x, this.y); ctx.restore();
}
}

class Particle {
constructor(x, y, color, type = 'sharp') {
this.x = x; this.y = y; this.type = type;
let angle = Math.random() * Math.PI * 2; let speed = (type === 'sharp') ?
Math.random() * 7 + 4 : Math.random() * 2 + 1;
this.vx = Math.cos(angle) * speed;
this.vy = Math.sin(angle) * speed; this.color = color; this.alpha = 1;
this.life = (type === 'sharp') ? 35 : 25;
this.size = Math.random() * 4 + 2;
}
update() {
if (this.type === 'burn') { this.vy -= 0.15 * gameSpeed;
this.vx += (Math.random()-0.5) * 0.4 * gameSpeed; }
this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed;
this.alpha -= (1 / this.life) * gameSpeed;
}
draw() {
if (this.alpha <= 0) return;
ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color;
ctx.beginPath();
if(this.type === 'sharp') { ctx.moveTo(this.x, this.y - this.size); ctx.lineTo(this.x + this.size * 1.5, this.y + this.size);
ctx.lineTo(this.x - this.size * 1.5, this.y + this.size); }
else if (this.type === 'burn') { ctx.shadowBlur = 8; ctx.shadowColor = this.color;
ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); }
ctx.fill(); ctx.restore();
}
}

function spawnImpactEffect(x, y, color, isWall = false) {
if (isWall) { shakeTime = 10;
shakeIntensity = 4; return; }
shakeTime = 15; shakeIntensity = 10; flashBgColor = "rgba(255, 255, 255, 0.08)";
setTimeout(() => { flashBgColor = null; }, 40);
for(let i=0; i<16; i++) particles.push(new Particle(x, y, color, 'sharp'));
}

class Bullet {
constructor(x, y, vx, vy, text, color, damage, pIndex, type = 'normal') {
this.x = x; this.y = y;
this.vx = vx; this.vy = vy; this.text = text; this.color = color; this.damage = damage; this.ownerIndex = pIndex;
this.type = type;
this.radius = type === 'elephant' ? 25 :
type === 'ink_slash' ? 14 :
type === 'dog_charm' ?
16 :
(type.startsWith('ink') || type === 'dark_assassinate' || type === 'dark_bomb' ? 12 :
type === 'laser_bullet' ? 6 :
type === 'pistol_bullet' ? 4 :
type === 'rifle_bullet' ? 3 :
type === 'sniper_bullet' ? 7 : 16.2);
this.life = type === 'ink_slash' ? 45 : 240; this.angle = Math.atan2(vy, vx);
}
update() { this.x += this.vx * gameSpeed;
this.y += this.vy * gameSpeed; this.life -= gameSpeed; }
draw() {
ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
if (this.type === 'ink_slash') {
ctx.fillStyle = "rgba(234, 32, 192, 0.95)"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.shadowBlur = 15;
ctx.shadowColor = "#ff00ff";
ctx.beginPath(); ctx.moveTo(25, 0); ctx.quadraticCurveTo(0, -10, -20, -4); ctx.quadraticCurveTo(-5, 0, -20, 4); ctx.quadraticCurveTo(0, 10, 25, 0); ctx.fill(); ctx.stroke();
} else if (this.type === 'ink_mark') {
ctx.fillStyle = "#ff00ff"; ctx.fillRect(-12, -3, 16, 6); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(4, -4);
ctx.lineTo(20, 0); ctx.lineTo(4, 4); ctx.fill();
} else if (this.type === 'laser_bullet') {
ctx.fillStyle = "#ff4757"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
ctx.shadowBlur = 12; ctx.shadowColor = "#ff4757";
ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
} else if (this.type === 'dark_assassinate') {
ctx.fillStyle = "#4a154b"; ctx.strokeStyle = "#9b59b6"; ctx.lineWidth = 2; ctx.shadowBlur = 15;
ctx.shadowColor = "#741b7c";
ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
ctx.fillStyle = "#ffffff"; ctx.font = "9px sans-serif";
ctx.textAlign = "center"; ctx.fillText("죽음", 0, 3);
} else if (this.type === 'dark_bomb') {
ctx.fillStyle = "#111122"; ctx.strokeStyle = "#741b7c";
ctx.lineWidth = 3; ctx.shadowBlur = 20; ctx.shadowColor = "#9b59b6";
ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
} else if (this.type === 'elephant') {
ctx.fillStyle = this.color; ctx.font = "40px sans-serif";
ctx.textAlign = "center"; ctx.textBaseline = "middle";
ctx.fillText(this.text, 0, 0);
} else if (this.type === 'pistol_bullet') {
ctx.fillStyle = this.color; ctx.shadowBlur = 5; ctx.shadowColor = this.color;
ctx.beginPath();
ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill();
} else if (this.type === 'rifle_bullet') {
ctx.fillStyle = this.color; ctx.shadowBlur = 5;
ctx.shadowColor = this.color;
ctx.fillRect(-this.radius, -this.radius/2, this.radius * 2, this.radius);
} else if (this.type === 'sniper_bullet') {
ctx.fillStyle = this.color;
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 1;
ctx.shadowBlur = 10; ctx.shadowColor = this.color;
ctx.beginPath(); ctx.moveTo(this.radius, 0); ctx.lineTo(-this.radius, this.radius * 0.7);
ctx.lineTo(-this.radius, -this.radius * 0.7); ctx.fill(); ctx.stroke();
} else {
ctx.fillStyle = this.color; ctx.font = "bold 13px sans-serif"; ctx.shadowBlur = 10;
ctx.shadowColor = this.color;
ctx.textAlign = "center";
ctx.fillText(this.text, 0, 5);
}
ctx.restore();
}
}

class Ball {
constructor(x, y, data, pIndex, isClone = false, master = null) {
this.x = x;
this.y = y;
this.radius = data.radius; this.color = isClone ? "rgba(74, 21, 124, 0.65)" : data.color;
this.fullName = data.name;
this.nickname = isClone ?
"분신" : data.nickname;
this.maxHp = isClone ? 10 : data.maxHp; this.hp = this.maxHp; this.id = data.id;
this.pIndex = pIndex;
this.bumpDmg = isClone ? 5 : data.bumpDmg; this.originalBumpDmg = this.bumpDmg;
this.baseSpeed = isClone ?
data.speed * 1.3 : data.speed;
this.isClone = isClone; this.master = master; this.vx = 0; this.vy = 0;
this.angle = Math.random() * Math.PI * 2;
this.currentSkillStep = 1; this.skillTimer = 0; this.isCharging = false; this.eatReady = false;
this.swallowedBall = null; this.swallowTimer = 0;
this.eatDmgCount = 0;
this.electricDuration = 0; this.burnDuration = 0; this.woundDuration = 0;
this.slowDuration = 0; this.darkDebuffTimer = 0;
this.isSlamCharging = false;
this.parkCycleIdx = 0; this.divineTimer = 0; this.divinePauseTimer = 0;
this.isFaceCharging = false; this.faceTargetAngle = 0;
this.weakDebuffTimer = 0;
this.isPhase2 = false; this.isTransforming = false; this.transformTimer = 0;
this.tvBeamActive = false; this.tvBeamTimer = 0;
this.tvBeamAngle = 0;
this.isGrabbed = false; this.isMovingToCenter = false; this.wasHitByWindRush = false;
this.isInkSpinning = false; this.inkSpinAngle = 0;
this.markedTargetId = null;
this.isInkPulling = false; this.inkPullTimer = 0; this.beamCycleId = 0;
this.laserHitBeams = {};
this.isBurrowed = false;
this.isBurrowInAnimation = false; this.burrowAnimTimer = 45;
this.burrowScale = 1; this.burrowTimer = 0;
this.burrowTargetX = 0; this.burrowTargetY = 0;
this.isGunwooEmerging = false; this.gunwooEmergeTimer = 0;
this.voiceLaserActive = false; this.voiceLaserTimer = 0;
this.voiceLaserAngleFixed = 0;
this.laserFadeTimer = 0;
this.laserSegments = null;
this.deathSequenceTimer = 0; this.isDeadCompletely = false; this.dizzyTimer = 0;
this.isTeleportStabbing = false; this.totalDamageTaken = 0;
this.donationPendingSkill = null;
this.donationTimer = 0;

// 제미나이 전용
this.hackDebuffTimer = 0;
this.hackBombTimer = 0;
this.geminiLaserActive = false;
this.geminiLaserTimer = 0;
this.geminiLaserTarget = null;

// 공병은 일렉트릭 레이저 전용
this.gongLaserActive = false;
this.gongLaserTimer = 0;
this.gongLaserAngle = 0;
this.gongLaserHits = {};
// 김건우 전용
this.gunwooGauge = 0;
this.enhancedLaser = false;
this.enhancedBurrow = false;
// 건숭이 전용
this.monkeyRunState = 0;
this.monkeyRunTimer = 0;
this.monkeyLaps = 0;
this.monkeyBuffTimer = 0;
this.originalNickname = this.nickname;
// 김민채 3스킬 전용
this.elephantWallBangReady = 0;
this.elephantWallBangAttacker = null;
if (data.startAsPhase2) {
this.isPhase2 = true;
this.fullName = "🔥 각성 최해솔";
this.nickname = "최해솔";
this.color = "#ff4757";
}

// 차은우지성 전용
this.passiveAuraRadius = 55; this.auraCharmUpTimer = 0;
this.auraHealTimer = 0;
this.auraDmgTick = 0;
this.selfHealTick = 0;
// 공필두병은 전용
if (data.id === 12) {
this.pilduLevel = 1;
this.pilduUpgradeTimer = 15 * 60;
this.pilduAuraRadius = 65;
this.turrets = {
pistolL: { cd: 0, maxCd: 60, type: 'pistol' },
pistolR: { cd: 0, maxCd: 60, type: 'pistol' },
rifleU: { cd: 0, maxCd: 60, type: 'rifle' },
rifleD: { cd: 0, maxCd: 60, type: 'rifle' },
sniper1: { cd: 0, maxCd: 60, type: 'sniper' },
sniper2: { cd: 0, maxCd: 60, type: 'sniper' },
sniper3: { cd: 0, maxCd: 60, type: 'sniper' },
sniper4: { cd: 0, maxCd: 60, type: 'sniper' }
};
}
}

launch() {
if (this.id === 99) return;
this.angle = Math.random() * Math.PI * 2;
this.vx = Math.cos(this.angle) * this.baseSpeed;
this.vy = Math.sin(this.angle) * this.baseSpeed;
this.setNextSkillCooldown();
}

setNextSkillCooldown() {
if (this.isClone || this.id === 99) { this.skillTimer = 99999; return;
}
this.skillTimer = getMaxCooldown(this);
this.isCharging = false;
this.isSlamCharging = false; this.isFaceCharging = false;
}

forceCancelSkill() {
this.isFaceCharging = false;
this.isSlamCharging = false;
this.eatReady = false;
this.tvBeamActive = false;
this.isInkSpinning = false;
this.isInkPulling = false;
this.voiceLaserActive = false;
this.isBurrowInAnimation = false;
this.burrowScale = 1;
this.divinePauseTimer = 0;
this.isGunwooEmerging = false;
this.donationPendingSkill = null;
this.donationTimer = 0;
this.isTeleportStabbing = false;
this.gongLaserActive = false;
this.monkeyRunState = 0;
this.elephantWallBangReady = 0;
fanAttackPreviews = fanAttackPreviews.filter(p => p.owner !== this);
}

applyDamage(amount, attacker = null) {
if(this.hp <= 0 || amount <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed) return;
if (attacker && attacker.burnDuration > 0) amount *= 0.85;
if (attacker && (attacker.id === 2 || attacker.id === 9) && attacker.divineTimer > 0) amount *= 1.5;
if (attacker && attacker.hackDebuffTimer > 0) amount *= 0.7;
if (this.id === 0) amount *= 0.9;
if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) amount *= 0.8;
if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) amount *= 0.7;
if (this.darkDebuffTimer > 0) amount *= 1.2;
if (this.monkeyBuffTimer > 0) amount *= 1.3;
if (this.id === 99) {
this.totalDamageTaken += amount;
textPopups.push(new TextPopup(this.x, this.y, '-' + Math.ceil(amount), false));
return;
}

this.hp = Math.max(0, this.hp - amount);
if (this.id !== 99) textPopups.push(new TextPopup(this.x, this.y, '-' + Math.ceil(amount), false));
if (this.hp <= 0) {
if (this.isClone) {
if (this.master && this.master.hp > 0) {
this.master.applyHeal(10);
for(let p=0; p<10; p++) { particles.push(new Particle(this.x, this.y, "rgba(147, 112, 219, 0.6)", 'burn'));
}
let mx = this.master.x, my = this.master.y, sx = this.x, sy = this.y;
for (let k = 0; k < 5; k++) { setTimeout(() => { if (this.master && this.master.hp > 0) { particles.push(new Particle(sx + (mx - sx) * (k / 5), sy + (my - sy) * (k / 5), "#9b59b6", 'sharp')); } }, k * 80);
}
}
this.isDeadCompletely = true; return;
}
if (this.id === 3 && !this.isPhase2) {
this.hp = 1; this.isMovingToCenter = true; this.vx = 0;
this.vy = 0; return;
} else if (this.deathSequenceTimer === 0) {
this.deathSequenceTimer = 120; this.vx = 0; this.vy = 0;
}
}

balls.forEach(att => { if (att.id === 4 && att.markedTargetId === this.pIndex && att.hp > 0 && !att.isClone) { att.applyHeal(5); } });
}

applyHeal(amount) {
if(this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed) return;
this.hp = Math.min(this.maxHp, this.hp + amount);
textPopups.push(new TextPopup(this.x, this.y, '+' + amount, true));
}

getNearestEnemy() {
let near = null, minDist = 9999;
balls.forEach(b => { if(b.pIndex !== this.pIndex && b.hp > 0 && !b.isSwallowed() && !b.isBurrowed && !b.isBurrowInAnimation && !b.isTransforming && !b.isMovingToCenter) { let d = Math.sqrt(Math.pow(b.x-this.x, 2)+Math.pow(b.y-this.y, 2)); if(d<minDist){minDist=d; near=b;} } });
return near;
}

getOriginalEnemyTarget() {
let liveEnemies = balls.filter(b => b.pIndex !== this.pIndex && b.hp > 0 && !b.isSwallowed() && !b.isTransforming && !b.isMovingToCenter);
if (liveEnemies.length === 0) return null;
return liveEnemies[Math.floor(Math.random() * liveEnemies.length)];
}

executeDonationSkill() {
if (this.hp <= 0 || this.isSwallowed() || this.isTransforming || this.isMovingToCenter || this.isGrabbed || this.isTeleportStabbing) return;
let skill = this.donationPendingSkill;
this.donationPendingSkill = null;

if (skill === 'eat') {
this.eatReady = true; this.eatDmgCount = 0;
setTimeout(() => {
if(this.hp > 0 && !this.swallowedBall && this.eatReady) {
this.eatReady = false;
this.vx = Math.cos(this.angle) * this.baseSpeed; this.vy = Math.sin(this.angle) * this.baseSpeed;
}
}, 3500 / gameSpeed);
} else if (skill === 'simon') {
let target = this.getNearestEnemy();
let launchAngle = target ?
Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
simonProjectiles.push({ x: this.x, y: this.y, vx: Math.cos(launchAngle) * 5.5, vy: Math.sin(launchAngle) * 5.5, text: "사이먼도미닉", color: "#2ed573", ownerIndex: this.pIndex, radius: 18, life: 120 });
} else if (skill === 'sword') {
for(let i=0; i<4; i++) {
parkSwords.push({
owner: this, x: this.x + (i % 2 === 0 ? -30 : 30), y: this.y + (i < 2 ? -30 : 30),
offsetX: (i % 2 === 0 ? -30 : 30), offsetY: (i < 2 ? -30 : 30),
timer: 60 + (i * 15), state: 'wait', damage: 7, vx: 0, vy: 0, angle: -Math.PI/4
});
spawnImpactEffect(this.x + (i % 2 === 0 ? -30 : 30), this.y + (i < 2 ? -30 : 30), "#00ffff");
}
} else if (skill === 'dog') {
let target = this.getNearestEnemy();
let shootAngle = target ?
Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle)*8, Math.sin(shootAngle)*8, "🐕", "#8B4513", 5, this.pIndex, 'dog_charm'));
} else if (skill === 'laser') {
this.voiceLaserActive = true;
this.voiceLaserTimer = 180;
this.voiceLaserAngleFixed = Math.random() * Math.PI * 2;
} else if (skill === 'divine') {
this.divineTimer = 360;
flashBgColor = "rgba(255, 255, 200, 0.4)";
setTimeout(() => flashBgColor = null, 100);
} else if (skill === 'heal') {
this.applyHeal(50);
for(let i=0; i<15; i++) particles.push(new Particle(this.x, this.y, "#2ed573", 'sharp'));
}
}

update() {
if (this.isDeadCompletely) return;
if (this.id === 99) {
this.hp = this.maxHp;
this.vx *= 0.85; this.vy *= 0.85; this.skillTimer = 99999;
this.isCharging = false;
}

if (this.donationTimer > 0) {
this.donationTimer -= gameSpeed;
if (this.donationTimer <= 0) { this.executeDonationSkill(); }
}

if (this.monkeyBuffTimer > 0) {
this.monkeyBuffTimer -= gameSpeed;
this.nickname = "🐵";
this.bumpDmg = 10;
if (this.monkeyBuffTimer <= 0) {
this.nickname = this.originalNickname;
this.bumpDmg = this.originalBumpDmg;
}
}

if (this.darkDebuffTimer > 0) this.darkDebuffTimer -= gameSpeed;
if (this.dizzyTimer > 0) this.dizzyTimer -= gameSpeed;
if (this.hackDebuffTimer > 0) {
this.hackDebuffTimer -= gameSpeed;
if (Math.random() < 0.15) particles.push(new Particle(this.x + (Math.random()-0.5)*30, this.y + (Math.random()-0.5)*30, "#00ff00", 'sharp'));
}

if (this.elephantWallBangReady > 0) {
this.elephantWallBangReady -= gameSpeed;
if (this.elephantWallBangReady <= 0) this.elephantWallBangReady = 0;
}

if (this.hackBombTimer > 0) {
this.hackBombTimer -= gameSpeed;
if (this.hackBombTimer <= 0 && this.hp > 0) {
this.applyDamage(20, null);
this.hackDebuffTimer = 240;
createShockwave(this.x, this.y, 40, "#00ff00");
for(let i=0; i<20; i++) particles.push(new Particle(this.x, this.y, "#00ff00", 'sharp'));
textPopups.push(new TextPopup(this.x, this.y - 20, "시스템 파괴!", false));
}
}

if (this.id === 8 && this.hp > 0 && !this.isBurrowed && !this.isDeadCompletely && !this.isMovingToCenter && !this.isTransforming && !this.isSwallowed()) {
if (this.auraCharmUpTimer > 0) this.auraCharmUpTimer -= gameSpeed;
if (this.auraHealTimer > 0) {
this.auraHealTimer -= gameSpeed;
this.selfHealTick -= gameSpeed;
if (this.selfHealTick <= 0) {
this.selfHealTick = 60;
this.applyHeal(7);
if (Math.random() < 0.5) particles.push(new Particle(this.x + (Math.random()-0.5)*20, this.y + (Math.random()-0.5)*20, "#2ed573", 'sharp'));
}
} else {
this.selfHealTick = 0;
}

this.passiveAuraRadius = this.auraCharmUpTimer > 0 ? 110 : 55;
let auraDps = this.auraHealTimer > 0 ? 5 : 12;
let tickRate = 60 / auraDps;
this.auraDmgTick -= gameSpeed;
if (this.auraDmgTick <= 0) {
this.auraDmgTick = tickRate;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== this.pIndex && !enemy.isSwallowed() && !enemy.isBurrowed && !enemy.isTransforming && !enemy.isMovingToCenter) {
let dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
if (dist <= this.passiveAuraRadius + enemy.radius) {
enemy.applyDamage(1, this);
}
}
});
}
}

// 공필두병은(12) 전용 로직 (타겟 인식 범위 수정 및 스탯 재설정)
if (this.id === 12 && this.hp > 0 && !this.isBurrowed && !this.isDeadCompletely && !this.isMovingToCenter && !this.isTransforming && !this.isSwallowed()) {
if (this.pilduLevel === 1) {
this.pilduUpgradeTimer -= gameSpeed;
if (this.pilduUpgradeTimer <= 0) {
this.pilduLevel = 2;
this.pilduAuraRadius = 110;
this.pilduUpgradeTimer = 25 * 60;
createShockwave(this.x, this.y, 110, "#f39c12");
textPopups.push(new TextPopup(this.x, this.y - 20, "무장 요새!", false));
for(let i=0; i<20; i++) particles.push(new Particle(this.x, this.y, "#f39c12", 'sharp'));
}
} else if (this.pilduLevel === 2) {
this.pilduUpgradeTimer -= gameSpeed;
if (this.pilduUpgradeTimer <= 0) {
this.pilduLevel = 3;
this.pilduAuraRadius = 150;
createShockwave(this.x, this.y, 150, "#e74c3c");
textPopups.push(new TextPopup(this.x, this.y - 20, "무장 성채!", false));
for(let i=0; i<30; i++) particles.push(new Particle(this.x, this.y, "#e74c3c", 'sharp'));
}
}

let cx = this.x, cy = this.y, r = this.pilduAuraRadius;

// 타겟을 반경 내에서만 찾도록 수정
let target = null;
let minDist = Infinity;
balls.forEach(b => {
  if(b.pIndex !== this.pIndex && b.hp > 0 && !b.isSwallowed() && !b.isBurrowed && !b.isBurrowInAnimation && !b.isTransforming && !b.isMovingToCenter) {
    let d = Math.hypot(b.x - this.x, b.y - this.y);
    if(d <= r + b.radius && d < minDist) {
      minDist = d;
      target = b;
    }
  }
});

let fireTurret = (turretKey, tX, tY, dmg, speed, bType, color) => {
let t = this.turrets[turretKey];
if (t.cd > 0) t.cd -= gameSpeed;
if (t.cd <= 0 && target) {
t.cd = t.maxCd;
let ang = Math.atan2(target.y - tY, target.x - tX);
bullets.push(new Bullet(tX, tY, Math.cos(ang)*speed, Math.sin(ang)*speed, "", color, dmg, this.pIndex, bType));
particles.push(new Particle(tX + Math.cos(ang)*10, tY + Math.sin(ang)*10, color, 'sharp'));
}
};

fireTurret('pistolL', cx - r, cy, 3, 8, 'pistol_bullet', '#bdc3c7');
fireTurret('pistolR', cx + r, cy, 3, 8, 'pistol_bullet', '#bdc3c7');

if (this.pilduLevel >= 2) {
fireTurret('rifleU', cx, cy - r, 6, 12, 'rifle_bullet', '#f1c40f');
fireTurret('rifleD', cx, cy + r, 6, 12, 'rifle_bullet', '#f1c40f');
}

if (this.pilduLevel >= 3) {
let diag = r * 0.7071;
fireTurret('sniper1', cx - diag, cy - diag, 8, 20, 'sniper_bullet', '#e74c3c');
fireTurret('sniper2', cx + diag, cy - diag, 8, 20, 'sniper_bullet', '#e74c3c');
fireTurret('sniper3', cx - diag, cy + diag, 8, 20, 'sniper_bullet', '#e74c3c');
fireTurret('sniper4', cx + diag, cy + diag, 8, 20, 'sniper_bullet', '#e74c3c');
}
}

if (this.id === 2 && this.divinePauseTimer > 0) {
this.divinePauseTimer -= gameSpeed; this.vx = 0; this.vy = 0;
if (Math.random() < 0.4) particles.push(new Particle(this.x + (Math.random()-0.5)*30, this.y - 40 - Math.random()*50, "#fffacd", 'sharp'));
if (this.divinePauseTimer <= 0) {
this.divineTimer = 540; flashBgColor = "rgba(255, 255, 200, 0.4)"; setTimeout(() => flashBgColor = null, 100);
this.setNextSkillCooldown();
let rAng = Math.random() * Math.PI * 2; this.vx = Math.cos(rAng) * this.baseSpeed; this.vy = Math.sin(rAng) * this.baseSpeed;
}
}

if (this.id === 2 || this.id === 9) {
if (this.divineTimer > 0) {
this.divineTimer -= gameSpeed; this.bumpDmg = 5;
if (Math.random() < 0.2) particles.push(new Particle(this.x, this.y, "#ffff00", 'sharp'));
} else if (this.id === 2 || this.id === 9) { this.bumpDmg = 0;
}
}

if ((this.id === 0 || this.id === 9) && this.eatReady && this.hp > 0 && !this.swallowedBall) {
let eatRange = this.radius + 12;
for (let b of balls) {
if (b.hp > 0 && b.pIndex !== this.pIndex && !b.isSwallowed() && !b.isTransforming && !b.isMovingToCenter && !b.isBurrowed) {
let dist = Math.hypot(this.x - b.x, this.y - b.y);
if (dist <= eatRange + b.radius) {
this.swallowedBall = b; this.eatReady = false; this.swallowTimer = 120; this.eatDmgCount = 0;
b.forceCancelSkill();
break;
}
}
}
}

if (this.id === 5 && this.isBurrowInAnimation) {
this.vx = 0; this.vy = 0;
this.burrowAnimTimer -= gameSpeed; this.angle += 0.25 * gameSpeed;
this.burrowScale = Math.max(0, this.burrowAnimTimer / 45);
if (Math.random() < 0.4) particles.push(new Particle(this.x, this.y, this.enhancedBurrow ? "#0077ff" : "#855e42", 'burn'));
if (this.burrowAnimTimer <= 0) {
this.isBurrowInAnimation = false; this.isBurrowed = true;
this.burrowScale = 0; this.burrowTimer = 120; this.isGunwooEmerging = false;
let target = this.getOriginalEnemyTarget();
if (target) { this.burrowTargetX = target.x; this.burrowTargetY = target.y;
}
else { this.burrowTargetX = arenaLeft + this.radius + Math.random() * (arenaRight - arenaLeft - this.radius * 2);
this.burrowTargetY = arenaTop + this.radius + Math.random() * (arenaBottom - arenaTop - this.radius * 2); }
}
return;
}

if (this.isBurrowed) {
this.vx = 0; this.vy = 0; this.burrowTimer -= gameSpeed;
let target = this.getOriginalEnemyTarget();
if (target && this.burrowTimer > 15 && !this.isGunwooEmerging) { this.burrowTargetX = target.x; this.burrowTargetY = target.y;
}
if (this.burrowTimer <= 30 && !this.isGunwooEmerging) {
burrowPreviews = burrowPreviews.filter(p => p.owner !== this);
burrowPreviews.push({ owner: this, x: this.burrowTargetX, y: this.burrowTargetY, radius: 65 });
}
if (this.burrowTimer <= 0 && !this.isGunwooEmerging) { this.isGunwooEmerging = true;
this.gunwooEmergeTimer = 30; }
if (this.isGunwooEmerging) {
this.gunwooEmergeTimer -= gameSpeed;
if (Math.random() < 0.2) particles.push(new Particle(this.burrowTargetX, this.burrowTargetY, this.enhancedBurrow ? "#00a8ff" : "#e67e22", 'burn'));
if (this.gunwooEmergeTimer <= 0) {
this.isGunwooEmerging = false; this.isBurrowed = false; this.burrowScale = 1; this.x = this.burrowTargetX; this.y = this.burrowTargetY;
burrowPreviews = burrowPreviews.filter(p => p.owner !== this);
flashBgColor = this.enhancedBurrow ? "rgba(0, 168, 255, 0.25)" : "rgba(230, 126, 34, 0.25)";
setTimeout(() => flashBgColor = null, 70);
shakeTime = 25; shakeIntensity = 15;

let pColor1 = this.enhancedBurrow ? "#0077ff" : "#8B4513";
let pColor2 = this.enhancedBurrow ? "#00a8ff" : "#A0522D";
let pColor3 = this.enhancedBurrow ? "#00ffff" : "#e67e22";
for(let i=0; i<15; i++) particles.push(new Particle(this.x, this.y, pColor1, 'sharp'));
for(let i=0; i<10; i++) particles.push(new Particle(this.x, this.y, pColor2, 'burn'));
for(let i=0; i<20; i++) particles.push(new Particle(this.x, this.y, pColor3, 'sharp'));

let dmg = this.enhancedBurrow ? 30 : 20;
if (this.weakDebuffTimer > 0) dmg = this.enhancedBurrow ? 15 : 10;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== this.pIndex && !enemy.isSwallowed() && !enemy.isTransforming && !enemy.isMovingToCenter) {
let dist = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
if (dist <= 65 + enemy.radius) { enemy.applyDamage(dmg, this); enemy.applyKnockback(this.x, this.y, 6.5); }
}
});
this.currentSkillStep = 1; this.setNextSkillCooldown(); this.launch();
}
}
return;
}

if (this.isMovingToCenter) {
let centerX = size / 2; let centerY = size / 2;
let dx = centerX - this.x; let dy = centerY - this.y;
let dist = Math.sqrt(dx * dx + dy * dy);
let moveStep = 4.0 * gameSpeed;
if (dist > moveStep) {
this.x += (dx / dist) * moveStep; this.y += (dy / dist) * moveStep;
this.angle += 0.06 * gameSpeed;
if (Math.random() < 0.25) particles.push(new Particle(this.x, this.y, "rgba(155, 89, 182, 0.4)", 'sharp'));
} else {
this.x = centerX; this.y = centerY; this.isMovingToCenter = false; this.isTransforming = true; this.transformTimer = 180;
this.fullName = "🔥 각성 최해솔"; this.nickname = "최해솔"; this.color = "#ff4757";
document.getElementById('p' + (this.pIndex+1) + '-name').innerText = 'P' + (this.pIndex+1) + ' 최해솔';
document.getElementById('p' + (this.pIndex+1) + '-name').style.color = "#ff4757";
for(let i=0; i<40; i++) particles.push(new Particle(this.x, this.y, "#9b59b6", 'sharp'));
soundwaves.push({x: this.x, y: this.y, angle: 0, life: 60, radius: 10});
soundwaves.push({x: this.x, y: this.y, angle: Math.PI, life: 60, radius: 10});
shakeTime = 25; shakeIntensity = 12;
}
return;
}

if (this.id === 11 && this.monkeyRunState > 0) {
if (this.monkeyRunState === 1) {
this.monkeyRunTimer -= gameSpeed;
if (this.monkeyRunTimer <= 0) {
this.monkeyRunState = 2;
this.x = arenaLeft + this.radius;
this.y = arenaBottom - this.radius;
this.monkeyLaps = 0;
this.monkeyRunTimer = 0;
} else {
this.x += this.vx * gameSpeed;
this.y += this.vy * gameSpeed;
}
} else if (this.monkeyRunState === 2) {
let totalPerimeter = 2 * ((arenaRight - arenaLeft - 2 * this.radius) + (arenaBottom - arenaTop - 2 * this.radius));
let speedPerFrame = totalPerimeter / 60 * gameSpeed;

let corners = [
{x: arenaRight - this.radius, y: arenaBottom - this.radius},
{x: arenaRight - this.radius, y: arenaTop + this.radius},
{x: arenaLeft + this.radius, y: arenaTop + this.radius},
{x: arenaLeft + this.radius, y: arenaBottom - this.radius}
 ];
let targetCorner = corners[this.monkeyLaps % 4];
let dx = targetCorner.x - this.x;
let dy = targetCorner.y - this.y;
let dist = Math.hypot(dx, dy);

if (dist <= speedPerFrame) {
this.x = targetCorner.x;
this.y = targetCorner.y;
this.monkeyLaps++;
if (this.monkeyLaps >= 12) {
this.monkeyRunState = 0;
this.launch();
}
} else {
this.x += (dx / dist) * speedPerFrame;
this.y += (dy / dist) * speedPerFrame;
}
this.vx = 0;
this.vy = 0;
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== this.pIndex && !target.isSwallowed() && !target.isTransforming && !target.isMovingToCenter && !target.isBurrowed) {
if (Math.hypot(target.x - this.x, target.y - this.y) <= this.radius + target.radius + 10) {
let hitKey = target.pIndex + '_' + this.monkeyLaps;
if (!this.gongLaserHits) this.gongLaserHits = {};
if (!this.gongLaserHits[hitKey]) {
target.applyDamage(15, this);
target.applyKnockback(this.x, this.y, 8);
this.gongLaserHits[hitKey] = true;
createShockwave(target.x, target.y, 30, "#8B4513");
}
}
}
});
}
return;
}

if (this.isTransforming) {
this.vx = 0; this.vy = 0; this.tvBeamAngle += 0.02 * gameSpeed;
checkLaserCollision(this, this.tvBeamAngle, 5);
this.transformTimer -= gameSpeed;
if (this.transformTimer <= 0) {
this.isTransforming = false; this.isPhase2 = true; this.maxHp = 200; this.hp = 200;
this.bumpDmg = 0;
this.currentSkillStep = 1; this.setNextSkillCooldown();
this.angle = Math.random() * Math.PI * 2; this.vx = Math.cos(this.angle) * this.baseSpeed;
this.vy = Math.sin(this.angle) * this.baseSpeed;
for(let i=0; i<40; i++) particles.push(new Particle(this.x, this.y, "#ff4757", 'sharp'));
shakeTime = 30; shakeIntensity = 15;
}
return;
}

if (this.hp <= 0 && this.deathSequenceTimer > 0) {
this.vx = 0; this.vy = 0; this.deathSequenceTimer -= gameSpeed;
if (this.deathSequenceTimer <= 0) {
this.isDeadCompletely = true;
for(let i=0; i<30; i++) particles.push(new Particle(this.x, this.y, this.color, 'sharp'));
shakeTime = 30;
shakeIntensity = 15; flashBgColor = "rgba(255, 255, 255, 0.25)"; setTimeout(() => flashBgColor = null, 100);
}
return;
}

if (this.isSwallowed()) {
let host = balls.find(b => b.swallowedBall === this);
if (host) { this.x = host.x; this.y = host.y;
} return;
}

if (isCountingDown) { this.angle += 0.05 * gameSpeed; return; }

if (this.tvBeamActive) {
this.tvBeamTimer -= gameSpeed;
this.tvBeamAngle += 0.04 * gameSpeed; checkLaserCollision(this, this.tvBeamAngle, 7, true, true);
if (this.tvBeamTimer <= 0) {
this.tvBeamActive = false; this.currentSkillStep = 2;
this.setNextSkillCooldown();
let randAng = Math.random() * Math.PI * 2; this.vx = Math.cos(randAng) * this.baseSpeed; this.vy = Math.sin(randAng) * this.baseSpeed;
}
}

if (this.gongLaserActive) {
this.gongLaserTimer -= gameSpeed;
this.gongLaserAngle += 0.05 * gameSpeed;
checkGongLaserCollision(this, this.gongLaserAngle);
if (this.gongLaserTimer <= 0) {
this.gongLaserActive = false;
this.setNextSkillCooldown();
}
}

if ((this.id === 5 || this.id === 9) && this.voiceLaserActive) {
this.voiceLaserTimer -= gameSpeed;
calculateVoiceLaser(this);
if (this.voiceLaserTimer <= 0) { this.voiceLaserActive = false;
this.laserFadeTimer = 30;
if (this.id === 5) { this.currentSkillStep = 2;
this.setNextSkillCooldown();
}
}
}

if (this.laserFadeTimer > 0) this.laserFadeTimer -= gameSpeed;
if (this.weakDebuffTimer > 0) this.weakDebuffTimer -= gameSpeed;
if (this.id === 4 && this.isInkPulling) {
this.vx = 0; this.vy = 0;
this.inkPullTimer -= gameSpeed; this.inkSpinAngle += 0.3 * gameSpeed;
if (Math.random() < 0.6) { let pAngle = Math.random() * Math.PI * 2; let pDist = Math.random() * 170;
particles.push(new Particle(this.x + Math.cos(pAngle)*pDist, this.y + Math.sin(pAngle)*pDist, "#d488ff", 'sharp')); }
let hitSelf = false;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== this.pIndex && !enemy.isSwallowed() && !enemy.isTransforming && !enemy.isMovingToCenter && !enemy.isBurrowed) {
let dx = this.x - enemy.x; let dy = this.y - enemy.y; let dist = Math.sqrt(dx * dx + dy * dy);
if (dist <= 170 + enemy.radius && dist > 10) { enemy.x += (dx / dist) * 3.5 * gameSpeed; enemy.y += (dy / dist) * 3.5 * gameSpeed; }
if (dist <= this.radius + enemy.radius + 5) hitSelf = true;
}
});
if (this.inkPullTimer <= 0 || hitSelf) {
this.isInkPulling = false; this.isInkSpinning = true; this.inkSpinAngle = 0;
flashBgColor = "rgba(255, 0, 255, 0.2)"; setTimeout(() => flashBgColor = null, 60); shakeTime = 15; shakeIntensity = 10;
let baseDmg = this.weakDebuffTimer > 0 ? 12.5 : 25;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== this.pIndex && !enemy.isSwallowed() && !enemy.isTransforming && !enemy.isMovingToCenter && !enemy.isBurrowed) {
let d = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
if (d <= 90 + enemy.radius) { enemy.applyDamage(baseDmg, this); enemy.applyKnockback(this.x, this.y, 8.5); }
}
});
for (let k = 0; k < 25; k++) particles.push(new Particle(this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40, "#ff00ff", 'sharp'));
this.currentSkillStep = 3; this.setNextSkillCooldown();
}
}

if (this.id === 4 && this.isInkSpinning) {
this.inkSpinAngle += 0.45 * gameSpeed;
if (this.inkSpinAngle >= Math.PI * 2) { this.isInkSpinning = false; this.inkSpinAngle = 0;
}
}

if (this.electricDuration > 0 && this.hp > 0) {
let prevElec = this.electricDuration; this.electricDuration -= gameSpeed;
if (Math.floor(prevElec/60) > Math.floor(this.electricDuration/60)) { this.applyDamage(3, null); }
}

if (this.burnDuration > 0 && this.hp > 0) {
let prevBurn = this.burnDuration;
this.burnDuration -= gameSpeed;
if (Math.floor(prevBurn/60) > Math.floor(this.burnDuration/60)) { this.applyDamage(2, null);
}
if (Math.random() < 0.5 * gameSpeed) { particles.push(new Particle(this.x + (Math.random()-0.5)*16, this.y + (Math.random()-0.5)*16, "#ff4500", 'burn'));
}
}

if (this.woundDuration > 0 && this.hp > 0) {
this.woundDuration -= gameSpeed;
if (Math.random() < 0.6 * gameSpeed) { particles.push(new Particle(this.x + (Math.random()-0.5)*16, this.y + (Math.random()-0.5)*16, "#8b0000", 'sharp'));
}
}

if (this.slowDuration > 0) this.slowDuration -= gameSpeed;

if (this.id === 99) {
// 봇
} else if ((this.id === 2 && this.isFaceCharging) || (this.id === 2 && this.divinePauseTimer > 0) || this.isTeleportStabbing) {
this.vx = 0;
this.vy = 0;
} else if ((this.id === 0 || this.id === 9) && this.swallowedBall) {
this.vx = 0;
this.vy = 0;
} else if (!(this.id === 4 && this.isInkPulling) && this.monkeyRunState === 0) {
let activeSpeed = this.baseSpeed;
if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) activeSpeed *= 1.7;
if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) { activeSpeed *= 2.0;
}
if (this.slowDuration > 0) activeSpeed *= 0.5;
if (this.electricDuration > 0) activeSpeed *= 0.5;
if (this.darkDebuffTimer > 0) activeSpeed *= 0.8;
if (this.dizzyTimer > 0) activeSpeed *= 0.5;
if (this.monkeyBuffTimer > 0) activeSpeed *= 3.5;

let currentVel = Math.hypot(this.vx, this.vy);
if (currentVel < activeSpeed && currentVel > 0) {
this.vx = (this.vx / currentVel) * activeSpeed;
this.vy = (this.vy / currentVel) * activeSpeed;
} else if (currentVel === 0 && !this.isGrabbed && !this.isTransforming && !this.isMovingToCenter && !((this.id === 0 || this.id === 9) && this.swallowedBall)) {
this.angle = Math.random() * Math.PI * 2;
this.vx = Math.cos(this.angle) * activeSpeed; this.vy = Math.sin(this.angle) * activeSpeed;
}
}

if (this.isGrabbed) { this.vx = 0; this.vy = 0;
}

this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed;
if (Math.hypot(this.vx, this.vy) > 0) this.angle = Math.atan2(this.vy, this.vx);
let hitWall = false;
let activeSpeed = this.baseSpeed;
if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) activeSpeed *= 1.7;
if (this.monkeyBuffTimer > 0) activeSpeed *= 3.5;
let buffer = this.radius + 5;
if (this.monkeyRunState === 0) {
if (this.x - this.radius < arenaLeft) { this.x = arenaLeft + buffer; this.vx = Math.abs(this.vx);
hitWall = true; }
if (this.x + this.radius > arenaRight) { this.x = arenaRight - buffer; this.vx = -Math.abs(this.vx);
hitWall = true; }
if (this.y - this.radius < arenaTop) { this.y = arenaTop + buffer; this.vy = Math.abs(this.vy);
hitWall = true; }
if (this.y + this.radius > arenaBottom) { this.y = arenaBottom - buffer; this.vy = -Math.abs(this.vy);
hitWall = true; }
}

if (hitWall) {
let mag = Math.hypot(this.vx, this.vy);
if (mag > 0 && this.id !== 99) { this.vx = (this.vx / mag) * activeSpeed;
this.vy = (this.vy / mag) * activeSpeed; }
spawnImpactEffect(this.x, this.y, this.woundDuration > 0 ? "#8b0000" : (this.burnDuration > 0 ? "#ff4500" : this.color), true);
if (this.woundDuration > 0) {
this.applyDamage(5, null); textPopups.push(new TextPopup(this.x, this.y, "상처!", false));
}

if (this.wasHitByWindRush) {
this.wasHitByWindRush = false;
let dmg = 5;
let bjs = balls.find(b => b.id === 2);
if (bjs && bjs.weakDebuffTimer > 0) dmg *= 0.5;
this.applyDamage(dmg, bjs);
shakeTime = 14; shakeIntensity = 8;
for(let i=0; i<8; i++) particles.push(new Particle(this.x, this.y, "#f1c40f", 'sharp'));
}

// 김민채 3스킬 코끼리 넉백 벽 꽝 판정
if (this.elephantWallBangReady > 0) {
this.elephantWallBangReady = 0;
this.applyDamage(10, this.elephantWallBangAttacker);
textPopups.push(new TextPopup(this.x, this.y, "벽 꽝!", false));
shakeTime = 15; shakeIntensity = 10;
spawnImpactEffect(this.x, this.y, "#ffffff", true);
}
}

if ((this.id === 0 || this.id === 9) && this.swallowedBall) {
this.swallowTimer -= gameSpeed;
if (this.swallowTimer <= 60 && this.eatDmgCount === 0) { this.swallowedBall.applyDamage(15, this); this.eatDmgCount = 1;
}
if (this.swallowTimer <= 0) { if (this.eatDmgCount === 1) { this.swallowedBall.applyDamage(15, this); this.eatDmgCount = 2; } this.spitOut();
}
}

let adjustedSkillSpeed = gameSpeed;
if (this.darkDebuffTimer > 0) adjustedSkillSpeed *= 0.5;
if (this.dizzyTimer > 0) adjustedSkillSpeed *= 0.5;
if (this.hackDebuffTimer > 0) adjustedSkillSpeed *= 0.5;

if (this.skillTimer > 0 && !this.isGrabbed && !isCountingDown && !this.isSwallowed() && !this.isMovingToCenter && !this.isBurrowInAnimation && this.divinePauseTimer <= 0 && !this.isTeleportStabbing && this.id !== 99) {
this.skillTimer -= adjustedSkillSpeed;
if(this.skillTimer <= 0) { this.triggerSkill(); }
}
}

isSwallowed() { return balls.some(b => b.swallowedBall === this);
}

triggerSkill() {
if (this.isSwallowed() || this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isGrabbed || this.isTeleportStabbing || this.id === 99) { this.setNextSkillCooldown();
return; }
this.isCharging = true;

if (this.id === 0) {
if (this.currentSkillStep === 1) {
this.eatReady = true; this.eatDmgCount = 0;
setTimeout(() => {
if(this.hp>0 && !this.swallowedBall && this.eatReady) {
this.eatReady = false; this.currentSkillStep = 2; this.setNextSkillCooldown();
this.vx = Math.cos(this.angle) * this.baseSpeed; this.vy = Math.sin(this.angle) * this.baseSpeed;
}
}, 5000 / gameSpeed);
} else if (this.currentSkillStep === 2) {
this.isSlamCharging = true; groundSlamAreas.push({ timer: 60, owner: this, type: 'slam' });
setTimeout(() => { this.isSlamCharging = false; this.currentSkillStep = 3; this.setNextSkillCooldown(); }, 1000 / gameSpeed);
} else {
let target = this.getNearestEnemy();
let shootAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle - 0.25)*4, Math.sin(shootAngle - 0.25)*4, "🐘", "#aaaaaa", 15, this.pIndex, 'elephant'));
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle + 0.25)*4, Math.sin(shootAngle + 0.25)*4, "🐘", "#aaaaaa", 15, this.pIndex, 'elephant'));
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 1) {
if (this.currentSkillStep === 1) {
let target = this.getNearestEnemy(); let launchAngle = target ?
Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
simonProjectiles.push({ x: this.x, y: this.y, vx: Math.cos(launchAngle) * 5.5, vy: Math.sin(launchAngle) * 5.5, text: "사이먼도미닉", color: "#2ed573", ownerIndex: this.pIndex, radius: 18, life: 120 });
this.currentSkillStep = 2;
} else if (this.currentSkillStep === 2) {
for (let k = 0; k < 6; k++) {
let rX = arenaLeft + 25 + Math.random() * (arenaRight - arenaLeft - 50);
let rY = arenaTop + 25 + Math.random() * (arenaBottom - arenaTop - 50);
let startAngle = Math.random() * Math.PI * 2; let sX = rX + Math.cos(startAngle) * 120;
let sY = rY + Math.sin(startAngle) * 120;
dominicProjectiles.push({ x: sX, y: sY, tx: rX, ty: rY, vx: (rX - sX) / 55, vy: (rY - sY) / 55, text: (k < 3) ? "사이먼" : "도미닉", color: "#00ffff", ownerIndex: this.pIndex, life: 55, isArrived: false, explosionTimer: 25 });
}
this.currentSkillStep = 3;
} else {
this.gongLaserActive = true;
this.gongLaserTimer = 180;
this.gongLaserAngle = Math.random() * Math.PI * 2;
this.gongLaserHits = {};
this.currentSkillStep = 1;
}
this.setNextSkillCooldown();
}
else if (this.id === 2) {
let step = [1, 2, 3, 1, 2, 1, 2, 3][this.parkCycleIdx];
let target = this.getNearestEnemy();
if (step === 1) {
if (!target) { this.setNextSkillCooldown(); return; }
this.parkCycleIdx = (this.parkCycleIdx + 1) % 8;
this.currentSkillStep = 2; this.skillTimer = 210;
for(let i=0; i<4; i++) {
parkSwords.push({ owner: this, x: this.x + (i % 2 === 0 ? -30 : 30), y: this.y + (i < 2 ? -30 : 30), offsetX: (i % 2 === 0 ? -30 : 30), offsetY: (i < 2 ? -30 : 30), timer: 60 + (i * 15), state: 'wait', damage: 7, vx: 0, vy: 0, angle: -Math.PI/4 });
spawnImpactEffect(this.x + (i % 2 === 0 ? -30 : 30), this.y + (i < 2 ? -30 : 30), "#00ffff");
}
} else if (step === 2) {
if (!target) { this.setNextSkillCooldown(); return; }
this.isFaceCharging = true; this.vx = 0; this.vy = 0;
this.faceTargetAngle = Math.atan2(target.y - this.y, target.x - this.x);
fanAttackPreviews.push({ owner: this, targetAngle: this.faceTargetAngle, timer: 90 });
setTimeout(() => {
if (this.hp <= 0 || this.isSwallowed() || this.isGrabbed || !this.isFaceCharging) return;
this.executeFaceExplosion(); this.parkCycleIdx = (this.parkCycleIdx + 1) % 8; this.setNextSkillCooldown();
let rAng = Math.random() * Math.PI * 2; this.vx = Math.cos(rAng) * this.baseSpeed; this.vy = Math.sin(rAng) * this.baseSpeed;
}, 1500 / gameSpeed);
} else if (step === 3) {
this.divinePauseTimer = 90; this.vx = 0; this.vy = 0;
this.parkCycleIdx = (this.parkCycleIdx + 1) % 8;
}
}
else if (this.id === 3 && this.isPhase2) {
if (this.currentSkillStep === 1) {
this.tvBeamActive = true;
this.tvBeamTimer = 180; this.beamCycleId++; this.laserHitBeams = {};
let randAng = Math.random() * Math.PI * 2; this.vx = Math.cos(randAng) * this.baseSpeed;
this.vy = Math.sin(randAng) * this.baseSpeed;
this.currentSkillStep = 2; this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
let target = this.getNearestEnemy();
if (target) {
let grabAngle = Math.atan2(target.y - this.y, target.x - this.x);
customGrabs.push({ owner: this, x: this.x, y: this.y, vx: Math.cos(grabAngle) * 5.0, vy: Math.sin(grabAngle) * 5.0, length: 0, maxLength: size * 0.85, state: 'launch', victim: null });
}
this.currentSkillStep = 3; this.setNextSkillCooldown();
let moveAng = Math.random() * Math.PI * 2; this.vx = Math.cos(moveAng) * this.baseSpeed;
this.vy = Math.sin(moveAng) * this.baseSpeed;
} else {
this.vx = 0; this.vy = 0;
for (let i = 0; i < 12; i++) {
setTimeout(() => {
if (this.hp <= 0 || !gameActive || this.isSwallowed()) return;
let angle = (Math.PI * 2 / 12) * i;
bullets.push(new Bullet(this.x, this.y, Math.cos(angle) * 6.2, Math.sin(angle) * 6.2, "", "#ff4757", 12, this.pIndex, 'laser_bullet'));
for(let p=0; p<3; p++) particles.push(new Particle(this.x, this.y, "#ff4757", 'sharp'));
}, (i * 150) / gameSpeed);
}
setTimeout(() => {
if (this.hp <= 0 || !gameActive) return;
let moveAng = Math.random() * Math.PI * 2; this.vx = Math.cos(moveAng) * this.baseSpeed; this.vy = Math.sin(moveAng) * this.baseSpeed;
}, (12 * 150) / gameSpeed);
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 4) {
let target = this.getNearestEnemy();
if (this.currentSkillStep === 1) {
let shootAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle)*7.5, Math.sin(shootAngle)*7.5, "", "#ff00ff", (this.weakDebuffTimer > 0 ? 10 : 20), this.pIndex, 'ink_slash'));
this.currentSkillStep = 2; this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
this.isInkPulling = true; this.inkPullTimer = 120; this.inkSpinAngle = 0;
} else {
let markAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(markAngle)*6, Math.sin(markAngle)*6, "", "#ff00ff", 10, this.pIndex, 'ink_mark'));
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 5) {
if (this.currentSkillStep === 1) {
this.voiceLaserActive = true;
this.voiceLaserTimer = 150;
this.voiceLaserAngleFixed = Math.random() * Math.PI * 2;
if (this.gunwooGauge >= 2) {
this.enhancedLaser = true;
this.gunwooGauge = 0;
} else {
this.enhancedLaser = false;
}
} else {
this.isBurrowInAnimation = true;
this.burrowAnimTimer = 45;
this.burrowScale = 1;
this.vx = 0;
this.vy = 0;
if (this.gunwooGauge >= 2) {
this.enhancedBurrow = true;
this.gunwooGauge = 0;
} else {
this.enhancedBurrow = false;
this.gunwooGauge++;
}
}
}
else if (this.id === 6) {
if (this.currentSkillStep === 1) {
let spawnAngle = Math.random() * Math.PI * 2;
let cloneBall = new Ball(this.x + Math.cos(spawnAngle)*30, this.y + Math.sin(spawnAngle)*30, characters[6], this.pIndex, true, this);
balls.push(cloneBall); cloneBall.launch();
for(let p=0; p<8; p++) particles.push(new Particle(this.x, this.y, "#9b59b6", 'sharp'));
this.currentSkillStep = 2; this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
let target = this.getNearestEnemy(); let shootAngle = target ?
Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle)*10, Math.sin(shootAngle)*10, "", "#741b7c", 5, this.pIndex, 'dark_assassinate'));
this.currentSkillStep = 3; this.setNextSkillCooldown();
} else {
let target = this.getNearestEnemy();
if (target) {
darkBombThreats.push({ target: target, timer: 30, owner: this });
setTimeout(() => {
if (this.hp > 0 && target && target.hp > 0) {
let newShootAngle = Math.atan2(target.y - this.y, target.x - this.x);
bullets.push(new Bullet(this.x, this.y, Math.cos(newShootAngle)*12, Math.sin(newShootAngle)*12, "", "#4a154b", 15, this.pIndex, 'dark_bomb'));
}
}, 500 / gameSpeed);
}
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 8) {
if (this.currentSkillStep === 1) {
let target = this.getNearestEnemy();
let shootAngle = target ? Math.atan2(target.y - this.y, target.x - this.x) : this.angle;
bullets.push(new Bullet(this.x, this.y, Math.cos(shootAngle)*8, Math.sin(shootAngle)*8, "🐕", "#8B4513", 5, this.pIndex, 'dog_charm'));
this.currentSkillStep = 2;
this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
this.auraCharmUpTimer = 240; this.currentSkillStep = 3; this.setNextSkillCooldown();
} else {
this.auraHealTimer = 180;
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 9) {
let rand = Math.random(); let skillType, text;
if (rand < 1/7) { skillType = 'eat'; text = "김민채님이 먹기를 후원하셨습니다!";
}
else if (rand < 2/7) { skillType = 'simon'; text = "공병은님이 사이먼 도미닉을 후원하셨습니다!";
}
else if (rand < 3/7) { skillType = 'sword'; text = "박지성님이 소드마스터를 후원하셨습니다!";
}
else if (rand < 4/7) { skillType = 'dog'; text = "차은우지성님이 매력의 개를 후원하셨습니다!";
}
else if (rand < 5/7) { skillType = 'laser'; text = "김건우님이 저음레이저를 후원하셨습니다!";
}
else if (rand < 6/7) { skillType = 'divine'; text = "박지성님이 신성력을 후원하셨습니다!"; }
else { skillType = 'heal';
text = "메르시님이 좋은 힐을 후원하셨습니다!"; }

activeDonations.push({ text: text, timer: 60, color: this.color });
this.donationPendingSkill = skillType; this.donationTimer = 30;
this.setNextSkillCooldown();
}
else if (this.id === 10) {
let target = this.getNearestEnemy();
if (this.currentSkillStep === 1) {
if (target) {
this.geminiLaserTimer = 15;
this.geminiLaserTarget = target;
target.applyDamage(10, this);
target.burnDuration = 180;
}
this.currentSkillStep = 2; this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
let rX = arenaLeft + 76.5 + Math.random() * (arenaRight - arenaLeft - 153);
let rY = arenaTop + 76.5 + Math.random() * (arenaBottom - arenaTop - 153);
dominicProjectiles.push({
type: 'data_grenade', x: this.x, y: this.y, tx: rX, ty: rY,
vx: (rX - this.x) / 30, vy: (rY - this.y) / 30, text: "Data", color: "#00ff00",
ownerIndex: this.pIndex, life: 30, isArrived: false, explosionTimer: 120
});
this.currentSkillStep = 3; this.setNextSkillCooldown();
} else {
if (target) {
customGrabs.push({ type: 'hack_link', owner: this, victim: target, timer: 90, x: this.x, y: this.y });
}
this.currentSkillStep = 1; this.setNextSkillCooldown();
}
}
else if (this.id === 11) { // 건숭이
if (this.currentSkillStep === 1) {
this.monkeyRunState = 1;
this.monkeyRunTimer = 30; // 0.5초 이동
let targetX = arenaLeft + this.radius;
let targetY = arenaBottom - this.radius;
this.vx = (targetX - this.x) / 30;
this.vy = (targetY - this.y) / 30;
this.currentSkillStep = 2;
this.setNextSkillCooldown();
} else if (this.currentSkillStep === 2) {
// 비처럼 위에서 쏟아지는 원숭이
for (let i = 0; i < 4; i++) {
let rX = arenaLeft + 30 + Math.random() * (arenaRight - arenaLeft - 60);
monkeyRains.push({
ownerIndex: this.pIndex,
x: rX,
y: arenaTop - 60 - Math.random() * 100, // 맵 윗부분에서 스폰
vy: 8 + Math.random() * 4, // 낙하 속도
radius: 25 // 히트박스 증가
});
}
this.currentSkillStep = 3;
this.setNextSkillCooldown();
} else {
this.monkeyBuffTimer = 180;
this.currentSkillStep = 1;
this.setNextSkillCooldown();
}
}
else if (this.id === 12) {
this.setNextSkillCooldown();
}
}

executeFaceExplosion() {
let rangeRadius = size * 2;
let baseAngle = this.faceTargetAngle;
flashBgColor = "rgba(241, 196, 15, 0.2)";
setTimeout(() => flashBgColor = null, 80);
shakeTime = 25;
shakeIntensity = 15;
soundwaves.push({x: this.x, y: this.y, angle: baseAngle, life: 60, radius: 40});
for (let i = 0; i < 35; i++) {
let pAngle = baseAngle + (Math.random() - 0.5) * (Math.PI * 120 / 180);
let pDist = Math.random() * (size * 1.2);
particles.push(new Particle(this.x + Math.cos(pAngle) * pDist, this.y + Math.sin(pAngle) * pDist, "#f1c40f", 'sharp'));
}
let dmg = this.weakDebuffTimer > 0 ? 12.5 : 25;
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== this.pIndex && !target.isSwallowed() && !target.isTransforming && !target.isMovingToCenter) {
let dx = target.x - this.x, dy = target.y - this.y; let dist = Math.sqrt(dx * dx + dy * dy);
if (dist <= rangeRadius) {
let angleToEnemy = Math.atan2(dy, dx); let diff = Math.atan2(Math.sin(angleToEnemy - baseAngle), Math.cos(angleToEnemy - baseAngle));
if (Math.abs(diff) <= (60 * Math.PI / 180)) { target.applyDamage(dmg, this); target.applyKnockback(this.x, this.y, 8); target.weakDebuffTimer = 180; }
}
}
});
}

spitOut() {
let sb = this.swallowedBall; if(!sb) return;
let centerX = size / 2, centerY = size / 2;
let launchAngle = Math.atan2(centerY - this.y, centerX - this.x) + (Math.random() - 0.5) * 0.5;
sb.x = this.x + Math.cos(launchAngle) * (this.radius + sb.radius + 5);
sb.y = this.y + Math.sin(launchAngle) * (this.radius + sb.radius + 5);
sb.vx = Math.cos(launchAngle) * 11;
sb.vy = Math.sin(launchAngle) * 11;
sb.woundDuration = 180;
this.swallowedBall = null; this.eatReady = false;
if (this.id === 0) { this.currentSkillStep = 2; this.setNextSkillCooldown(); }
this.vx = Math.cos(this.angle) * this.baseSpeed; this.vy = Math.sin(this.angle) * this.baseSpeed;
spawnImpactEffect(sb.x, sb.y, "#8b0000");
}

applyKnockback(fromX, fromY, power) {
if (isCountingDown || this.isSwallowed() || this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed || this.isBurrowInAnimation) return;
if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) return;
if (this.id === 2 && this.isFaceCharging) return;
if (this.id === 3 && this.tvBeamActive) return;
if ((this.id === 5 || this.id === 9) && this.voiceLaserActive) return;
let kDx = this.x - fromX, kDy = this.y - fromY, kDist = Math.sqrt(kDx * kDx + kDy * kDy);
if (kDist > 0) { this.vx += (kDx / kDist) * power; this.vy += (kDy / kDist) * power;
}
}

draw() {
if (this.isDeadCompletely || this.isBurrowed) return;
if (this.isSwallowed()) return;

customGrabs.forEach(g => {
if (g.type === 'hack_link' && g.owner === this) {
ctx.save(); ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"; ctx.lineWidth = 3; ctx.setLineDash([5, 5]);
ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(g.victim.x, g.victim.y); ctx.stroke(); ctx.restore();
}
});
if (this.id === 10 && this.geminiLaserTimer > 0 && this.geminiLaserTarget) {
this.geminiLaserTimer -= gameSpeed;
ctx.save();
ctx.strokeStyle = "rgba(0, 255, 0, " + (this.geminiLaserTimer/15) + ")"; ctx.lineWidth = 5;
ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.geminiLaserTarget.x, this.geminiLaserTarget.y); ctx.stroke(); ctx.restore();
}

if (this.hackDebuffTimer > 0 && this.hp > 0) {
ctx.save(); ctx.strokeStyle = "rgba(0, 255, 0, 0.9)"; ctx.lineWidth = 3; ctx.setLineDash([4, 4]);
ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2); ctx.stroke();
ctx.fillStyle = "#00ff00"; ctx.font = "bold 12px monospace";
ctx.textAlign = "center";
ctx.fillText("0101", this.x, this.y - this.radius - 10); ctx.restore();
}

if (this.id === 8 && this.hp > 0) {
ctx.save();
ctx.beginPath();
ctx.arc(this.x, this.y, this.passiveAuraRadius, 0, Math.PI * 2);
if (this.auraHealTimer > 0) { ctx.fillStyle = "rgba(46, 213, 115, 0.15)";
ctx.strokeStyle = "rgba(46, 213, 115, 0.5)"; }
else { ctx.fillStyle = "rgba(255, 182, 193, 0.15)"; ctx.strokeStyle = "rgba(255, 182, 193, 0.5)";
}
ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.restore();
}

if (this.id === 12 && this.hp > 0) {
ctx.save();
let r = this.pilduAuraRadius;

ctx.beginPath();
ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
if (this.pilduLevel === 1) {
ctx.fillStyle = "rgba(189, 195, 199, 0.1)";
ctx.strokeStyle = "rgba(189, 195, 199, 0.5)";
} else if (this.pilduLevel === 2) {
ctx.fillStyle = "rgba(243, 156, 18, 0.1)";
ctx.strokeStyle = "rgba(243, 156, 18, 0.6)";
} else {
ctx.fillStyle = "rgba(231, 76, 60, 0.15)";
ctx.strokeStyle = "rgba(231, 76, 60, 0.8)";
}
ctx.lineWidth = 2;
ctx.setLineDash([10, 5]);
ctx.stroke();
ctx.fill();
ctx.setLineDash([]);

let drawTurret = (tX, tY, type, angle) => {
ctx.save();
ctx.translate(tX, tY);
ctx.rotate(angle);
if (type === 'pistol') {
ctx.fillStyle = "#7f8c8d";
ctx.fillRect(-8, -8, 16, 16);
ctx.fillStyle = "#bdc3c7";
ctx.fillRect(0, -3, 12, 6);
ctx.fillStyle = "#2c3e50";
ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
} else if (type === 'rifle') {
ctx.fillStyle = "#d35400";
ctx.beginPath();
ctx.moveTo(10, 0); ctx.lineTo(-8, 8); ctx.lineTo(-8, -8); ctx.fill();
ctx.fillStyle = "#f1c40f";
ctx.fillRect(0, -2, 16, 4);
} else if (type === 'sniper') {
ctx.fillStyle = "#c0392b";
ctx.beginPath();
ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = "#e74c3c";
ctx.fillRect(0, -2, 22, 4);
ctx.fillStyle = "#000";
ctx.fillRect(8, -4, 6, 8);
}
ctx.restore();
};

let cx = this.x, cy = this.y;

// 그릴 때도 반경 내 타겟만 바라보게 수정
let target = null;
let minDist = Infinity;
balls.forEach(b => {
  if(b.pIndex !== this.pIndex && b.hp > 0 && !b.isSwallowed() && !b.isBurrowed && !b.isBurrowInAnimation && !b.isTransforming && !b.isMovingToCenter) {
    let d = Math.hypot(b.x - this.x, b.y - this.y);
    if(d <= r + b.radius && d < minDist) {
      minDist = d;
      target = b;
    }
  }
});

let getAng = (tx, ty) => target ? Math.atan2(target.y - ty, target.x - tx) : 0;
drawTurret(cx - r, cy, 'pistol', getAng(cx - r, cy));
drawTurret(cx + r, cy, 'pistol', getAng(cx + r, cy));
if (this.pilduLevel >= 2) {
drawTurret(cx, cy - r, 'rifle', getAng(cx, cy - r));
drawTurret(cx, cy + r, 'rifle', getAng(cx, cy + r));
}

if (this.pilduLevel >= 3) {
let diag = r * 0.7071;
drawTurret(cx - diag, cy - diag, 'sniper', getAng(cx - diag, cy - diag));
drawTurret(cx + diag, cy - diag, 'sniper', getAng(cx + diag, cy - diag));
drawTurret(cx - diag, cy + diag, 'sniper', getAng(cx - diag, cy + diag));
drawTurret(cx + diag, cy + diag, 'sniper', getAng(cx + diag, cy + diag));
}
ctx.restore();
}

if (this.darkDebuffTimer > 0 && this.hp > 0) {
ctx.save();
ctx.strokeStyle = "rgba(74, 21, 124, 0.95)"; ctx.lineWidth = 4;
ctx.shadowBlur = 25; ctx.shadowColor = "#9b59b6";
ctx.beginPath();
ctx.arc(this.x, this.y, this.radius + 9, 0, Math.PI * 2); ctx.stroke();
for (let m=0; m<3; m++) { ctx.fillStyle = "rgba(42, 9, 68, 0.5)"; ctx.beginPath();
ctx.arc(this.x + Math.sin(Date.now()*0.01 + m)*5, this.y + Math.cos(Date.now()*0.01 + m)*5, this.radius - 2, 0, Math.PI * 2); ctx.fill();
}
ctx.fillStyle = "#da70d6"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("어둠 디버프", this.x, this.y - this.radius - 12); ctx.restore();
}

if (this.weakDebuffTimer > 0 && this.hp > 0) {
ctx.save(); ctx.strokeStyle = "rgba(231, 76, 60, 0.8)"; ctx.lineWidth = 3;
ctx.shadowBlur = 15; ctx.shadowColor = "#ff4757"; ctx.setLineDash([4, 4]);
ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 7, 0, Math.PI * 2); ctx.stroke();
ctx.fillStyle = "#ff4757"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("위협됨", this.x, this.y - this.radius - 6); ctx.restore();
}

if (this.isTransforming) {
ctx.save(); ctx.strokeStyle = "rgba(255, 71, 87, " + (this.transformTimer / 180) + ")"; ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(this.x, this.y, 40 + (180 - this.transformTimer)*1.5, 0, Math.PI * 2); ctx.stroke();
ctx.fillStyle = "rgba(155, 89, 182, 0.25)"; ctx.beginPath();
ctx.arc(this.x, this.y, (180 - this.transformTimer)*0.8, 0, Math.PI * 2); ctx.fill();
ctx.strokeStyle = "rgba(255, 71, 87, 0.6)"; ctx.lineWidth = 3;
ctx.shadowBlur = 15; ctx.shadowColor = "#ff4757";
let beamAngles = [this.tvBeamAngle, this.tvBeamAngle + Math.PI/2, this.tvBeamAngle + Math.PI, this.tvBeamAngle + Math.PI*1.5];
beamAngles.forEach(ang => { ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + Math.cos(ang) * size * 1.5, this.y + Math.sin(ang) * size * 1.5); ctx.stroke(); });
ctx.restore();
}

balls.forEach(gBall => {
if (gBall.id === 4 && gBall.markedTargetId === this.pIndex && this.hp > 0 && !this.isClone) {
ctx.save(); ctx.strokeStyle = "#ff00ff"; ctx.lineWidth = 3.5; ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff"; ctx.setLineDash([6, 4]);
ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
});
if (this.electricDuration > 0 && Math.random() < 0.7 && this.hp > 0) {
ctx.save(); ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 4;
ctx.shadowBlur = 20; ctx.shadowColor = "#00ffff";
ctx.beginPath(); let segmentCount = 3; let lastX = this.x + (Math.random()-0.5)*20;
let lastY = this.y + (Math.random()-0.5)*20; ctx.moveTo(lastX, lastY);
for(let s=0; s<segmentCount; s++) { let nX = this.x + (Math.random()-0.5)*50;
let nY = this.y + (Math.random()-0.5)*50; ctx.lineTo(nX, nY); }
ctx.stroke(); ctx.restore();
}

let activeRadius = this.radius * this.burrowScale;
if (this.hp <= 0 && this.deathSequenceTimer > 0) {
let pulse = Math.sin(this.deathSequenceTimer * 0.3) * 7;
let growth = (120 - this.deathSequenceTimer) * 0.12; activeRadius = Math.max(5, this.radius + pulse + growth);
}

ctx.save(); ctx.translate(this.x, this.y);
if (this.dizzyTimer > 0 && this.hp > 0) {
ctx.save(); let rot = Date.now() * 0.005; ctx.rotate(rot); ctx.fillStyle = "#f1c40f";
ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
ctx.fillText("💫", 0, -this.radius - 12); ctx.fillText("💫", 16, this.radius + 6);
ctx.fillText("💫", -16, this.radius + 6); ctx.restore();
}

ctx.rotate(this.angle);
if (this.weakDebuffTimer > 0 || this.darkDebuffTimer > 0) ctx.globalAlpha = 0.65;
ctx.beginPath();
ctx.arc(0, 0, activeRadius, 0, Math.PI * 2);
ctx.fillStyle = this.color; ctx.shadowBlur = (this.hp <= 0 || this.isMovingToCenter) ?
28 : 18;
ctx.shadowColor = (this.isMovingToCenter) ? "#9b59b6" : ((this.hp <= 0) ? "#ff3333" : this.color);
ctx.fill(); ctx.clip();
if (this.img && this.img.complete && this.img.naturalWidth > 0) { ctx.drawImage(this.img, -activeRadius, -activeRadius, activeRadius * 2, activeRadius * 2); }
ctx.restore();
if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall) && this.hp > 0) {
ctx.save(); ctx.beginPath();
let pulseRadius = this.radius + 14 + Math.sin(Date.now() / 60) * 4;
ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(255, 10, 10, 0.85)"; ctx.lineWidth = 3.5; ctx.shadowBlur = 18; ctx.shadowColor = "#ff0000"; ctx.stroke();
ctx.fillStyle = "rgba(255, 0, 0, 0.08)"; ctx.fill(); ctx.restore();
}

if (this.id === 0 && this.isSlamCharging) {
ctx.save(); ctx.beginPath();
ctx.arc(this.x, this.y, 165, 0, Math.PI * 2);
ctx.fillStyle = "rgba(255, 71, 87, 0.08)";
ctx.strokeStyle = "rgba(255, 71, 87, 0.5)";
ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke(); ctx.restore();
}
if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) {
ctx.save(); ctx.beginPath();
ctx.arc(this.x, this.y, activeRadius + 5, 0, Math.PI * 2);
ctx.strokeStyle = "#ffff00"; ctx.lineWidth = 3; ctx.shadowBlur = 15;
ctx.shadowColor = "#ffffff"; ctx.stroke(); ctx.restore();
}
if (this.burrowScale > 0.3) {
ctx.save(); ctx.fillStyle = "#ffffff";
let displaySize = this.nickname === "🐵" ?
24 : 12;
ctx.font = "bold " + (displaySize * this.burrowScale) + "px sans-serif"; ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.shadowBlur = 5;
ctx.shadowColor = "#000000"; if (this.isClone) ctx.fillStyle = "#e0c0ff"; ctx.fillText(this.nickname, this.x, this.y); ctx.restore();
}

if (this.id === 4 && this.hp > 0) {
ctx.save(); ctx.translate(this.x, this.y);
if (this.isInkSpinning || this.isInkPulling) ctx.rotate(this.inkSpinAngle * 5);
else ctx.rotate(this.angle + Math.PI/4);
ctx.fillStyle = "#d488ff"; ctx.fillRect(8, -2, 18, 4); ctx.fillStyle = "#ffffff"; ctx.fillRect(26, -3, 4, 6);
ctx.fillStyle = "#ff00ff"; ctx.shadowBlur = 10; ctx.shadowColor = "#ff00ff"; ctx.beginPath(); ctx.moveTo(30, -3); ctx.lineTo(44, 0); ctx.lineTo(30, 3); ctx.closePath(); ctx.fill(); ctx.restore();
if (this.isInkPulling) { ctx.save(); ctx.strokeStyle = "rgba(212, 136, 255, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 10]); ctx.beginPath();
ctx.arc(this.x, this.y, 170, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
}
if (this.id === 4 && this.isInkSpinning && this.hp > 0) {
ctx.save();
ctx.strokeStyle = "rgba(255, 0, 255, 0.8)"; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff"; ctx.beginPath();
ctx.arc(this.x, this.y, 90, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
if (this.hp <= 0 && !this.isMovingToCenter) {
if (this.id === 99) { ctx.save();
ctx.fillStyle = "#fffa85"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
ctx.fillText("누적 딜: " + Math.round(this.totalDamageTaken), this.x, this.y - this.radius - 20); ctx.restore(); } return;
}
if (this.weakDebuffTimer > 0 && Math.random() < 0.15) textPopups.push(new TextPopup(this.x, this.y - 10, "⬇", false));
if (this.id === 99) {
ctx.save();
ctx.fillStyle = "#fffa85"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
ctx.fillText("누적 딜: " + Math.round(this.totalDamageTaken), this.x, this.y - this.radius - 20); ctx.restore();
}

// 김건우 게이지 UI
if (this.id === 5 && this.hp > 0 && !this.isDeadCompletely && !this.isBurrowed && !this.isTransforming && !this.isMovingToCenter) {
ctx.save();
ctx.translate(this.x, this.y + this.radius + 8);
for (let i = 0; i < 2; i++) {
ctx.beginPath();
ctx.rect(-12 + i * 14, 0, 10, 10);
ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
ctx.lineWidth = 1.5;
ctx.stroke();
if (this.gunwooGauge > i) {
ctx.fillStyle = "#00a8ff";
ctx.fill();
ctx.shadowBlur = 8;
ctx.shadowColor = "#00a8ff";
}
}
ctx.restore();
}
}
}

function calculateVoiceLaser(owner) {
let currentAngle = owner.voiceLaserAngleFixed;
let px = owner.x; let py = owner.y; let dx = Math.cos(currentAngle);
let dy = Math.sin(currentAngle);
owner.laserSegments = [{x: px, y: py}]; let bounces = 0;
while (bounces < 4) {
let intersectT = 99999;
let wallType = '';
if (dx > 0) { let t = (arenaRight - px) / dx;
if (t < intersectT) { intersectT = t; wallType = 'V';
} }
if (dx < 0) { let t = (arenaLeft - px) / dx;
if (t < intersectT) { intersectT = t; wallType = 'V';
} }
if (dy > 0) { let t = (arenaBottom - py) / dy;
if (t < intersectT) { intersectT = t; wallType = 'H';
} }
if (dy < 0) { let t = (arenaTop - py) / dy;
if (t < intersectT) { intersectT = t; wallType = 'H'; } }
px += dx * intersectT;
py += dy * intersectT; owner.laserSegments.push({x: px, y: py}); bounces++;
if (wallType === 'V') dx = -dx;
else if (wallType === 'H') dy = -dy;
}
let dmgPerFrame = (owner.enhancedLaser ? 30 : 18) / 60 * gameSpeed;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== owner.pIndex && !enemy.isSwallowed() && !enemy.isBurrowed && !enemy.isBurrowInAnimation && !enemy.isTransforming && !enemy.isMovingToCenter) {
for (let i = 0; i < owner.laserSegments.length - 1; i++) {
let p1 = owner.laserSegments[i]; let p2 = owner.laserSegments[i+1]; let lDx = p2.x - p1.x; let lDy = p2.y - p1.y; let lineLenSq = lDx * lDx + lDy * lDy;
let t = ((enemy.x - p1.x) * lDx + (enemy.y - p1.y) * lDy) / (lineLenSq || 1); t = Math.max(0, Math.min(1, t));
let closestX = p1.x + t * lDx; let closestY = p1.y + t * lDy;
let dist =
Math.sqrt(Math.pow(enemy.x - closestX, 2) + Math.pow(enemy.y - closestY, 2));
if (dist < enemy.radius + 20) { enemy.applyDamage(dmgPerFrame, owner); if (Math.random() < 0.2) particles.push(new Particle(closestX, closestY, owner.enhancedLaser ? "#00a8ff" : "#e67e22", 'sharp')); break; }
}
}
});
}

function checkLaserCollision(owner, baseAngle, damage, applySlow = false, applyBurn = false) {
let laserAngles = [baseAngle, baseAngle + Math.PI/2, baseAngle + Math.PI, baseAngle + Math.PI*1.5];
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== owner.pIndex && !target.isSwallowed() && !target.isTransforming && !target.isMovingToCenter) {
laserAngles.forEach((ang, beamIdx) => {
let dx = target.x - owner.x; let dy = target.y - owner.y; let dotProduct = dx * Math.cos(ang) + dy * Math.sin(ang);
if (dotProduct > 0) {
let closestX = owner.x + Math.cos(ang) * dotProduct; let closestY = owner.y + Math.sin(ang) * dotProduct;
let dist = Math.sqrt(Math.pow(target.x - closestX, 2) + Math.pow(target.y - closestY, 2));
if (dist < target.radius + 8) {
let uniqueKey = 'cycle_' + owner.beamCycleId + 'beam' + beamIdx + 'hit' + target.pIndex;
if (!owner.laserHitBeams[uniqueKey]) {
let finalDmg = owner.weakDebuffTimer > 0 ? damage * 0.5 : damage;
target.applyDamage(finalDmg, owner);
if (applySlow) target.slowDuration = 60;
if (applyBurn && target.burnDuration <= 0) target.burnDuration = 240;
owner.laserHitBeams[uniqueKey] = true;
}
}
}
});
}
});
}

function checkGongLaserCollision(owner, baseAngle) {
let angles = [baseAngle, baseAngle + (2 * Math.PI / 3), baseAngle + (4 * Math.PI / 3)];
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== owner.pIndex && !target.isSwallowed() && !target.isTransforming && !target.isMovingToCenter && !target.isBurrowed) {
angles.forEach((ang, angIdx) => {
let dx = target.x - owner.x; let dy = target.y - owner.y;
let dotProduct = dx * Math.cos(ang) + dy * Math.sin(ang);
if (dotProduct > 0) {
let closestX = owner.x + Math.cos(ang) * dotProduct;
let closestY = owner.y + Math.sin(ang) * dotProduct;
let dist = Math.sqrt(Math.pow(target.x - closestX, 2) + Math.pow(target.y - closestY, 2));
if (dist < target.radius + 12) {
let hitKey = target.pIndex + '_' + angIdx;
let hitCd = owner.gongLaserHits[hitKey] || 0;
if (hitCd <= 0) {
target.applyDamage(6, owner);
if (target.electricDuration <= 0) target.electricDuration = 180;
owner.gongLaserHits[hitKey] = 9999;
for(let p=0; p<5; p++) particles.push(new Particle(closestX, closestY, "#00ffff", 'sharp'));
}
}
}
});
}
});
}

function handleParkSwords() {
for (let i = parkSwords.length - 1; i >= 0; i--) {
let sword = parkSwords[i];
if (sword.state === 'wait') {
sword.x = sword.owner.x + sword.offsetX; sword.y = sword.owner.y + sword.offsetY; sword.timer -= gameSpeed;
if (sword.owner.hp <= 0) { parkSwords.splice(i, 1); continue; }
if (sword.timer <= 0) {
sword.state = 'fire'; let target = sword.owner.getNearestEnemy();
let angle = target ? Math.atan2(target.y - sword.y, target.x - sword.x) : sword.owner.angle;
sword.vx = Math.cos(angle) * 9;
sword.vy = Math.sin(angle) * 9; sword.angle = angle;
}
} else if (sword.state === 'fire') {
sword.x += sword.vx * gameSpeed;
sword.y += sword.vy * gameSpeed; let hit = false;
for(let b of balls) {
if(b.hp > 0 && b.pIndex !== sword.owner.pIndex && !b.isSwallowed() && !b.isBurrowed && !b.isTransforming) {
let dist = Math.hypot(b.x - sword.x, b.y - sword.y);
if(dist < b.radius + 8) {
b.applyDamage(sword.damage, sword.owner); spawnImpactEffect(sword.x, sword.y, "#00ffff");
parkSwords.splice(i, 1); hit = true; break;
}
}
}
if(!hit && (sword.x < arenaLeft || sword.x > arenaRight || sword.y < arenaTop || sword.y > arenaBottom)) { parkSwords.splice(i, 1);
}
}
}
}

function handleCustomGrabs() {
for (let i = customGrabs.length - 1; i >= 0; i--) {
let g = customGrabs[i];
if (g.type === 'hack_link') {
if (g.owner.hp <= 0 || g.victim.hp <= 0 || g.owner.isSwallowed() || g.victim.isSwallowed()) {
customGrabs.splice(i, 1); continue;
}
g.timer -= gameSpeed;
if (Math.random() < 0.3) particles.push(new Particle(g.victim.x + (Math.random()-0.5)*30, g.victim.y + (Math.random()-0.5)*30, "#00ff00", 'sharp'));
if (g.timer <= 0) {
g.victim.hackBombTimer = 1;
textPopups.push(new TextPopup(g.victim.x, g.victim.y, "링크 완료!", false));
if (g.owner && g.owner.hp > 0) g.owner.applyHeal(10);
customGrabs.splice(i, 1);
}
continue;
}

if (g.owner.hp <= 0 || g.owner.isTransforming || g.owner.isMovingToCenter || g.owner.isSwallowed()) {
if (g.victim) g.victim.isGrabbed = false; customGrabs.splice(i, 1);
continue;
}
if (g.state === 'launch') {
g.x += g.vx * gameSpeed; g.y += g.vy * gameSpeed;
let dx = g.x - g.owner.x, dy = g.y - g.owner.y; g.length = Math.hypot(dx, dy) || 1;
if (g.x < arenaLeft || g.x > arenaRight || g.y < arenaTop || g.y > arenaBottom || g.length >= g.maxLength) {
g.x = Math.max(arenaLeft, Math.min(arenaRight, g.x));
g.y = Math.max(arenaTop, Math.min(arenaBottom, g.y)); g.state = 'pull';
}
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== g.owner.pIndex && !target.isSwallowed() && !target.isTransforming && !target.isMovingToCenter && !g.victim) {
let tDx = target.x - g.x, tDy = target.y - g.y;
if (Math.sqrt(tDx * tDx + tDy * tDy) < target.radius + 45) {
g.victim = target; target.isGrabbed = true; target.forceCancelSkill();
let finalDmg = 10; target.applyDamage(finalDmg, g.owner); g.state = 'pull';
}
}
});
} else if (g.state === 'pull') {
let dx = g.owner.x - g.x, dy = g.owner.y - g.y;
let dist = Math.hypot(dx, dy) || 1; let pullSpeed = 15 * gameSpeed;
if (dist > pullSpeed + 15) {
g.x += (dx / dist) * pullSpeed; g.y += (dy / dist) * pullSpeed;
if (g.victim) {
g.victim.x = g.x; g.victim.y = g.y; g.victim.x = Math.max(arenaLeft + g.victim.radius, Math.min(arenaRight - g.victim.radius, g.victim.x));
g.victim.y = Math.max(arenaTop + g.victim.radius, Math.min(arenaBottom - g.victim.radius, g.victim.y));
g.victim.vx = 0; g.victim.vy = 0;
}
} else {
if (g.victim) {
g.victim.isGrabbed = false; let escapeAng = Math.random() * Math.PI * 2;
g.victim.vx = Math.cos(escapeAng) * g.victim.baseSpeed * 2.0; g.victim.vy = Math.sin(escapeAng) * g.victim.baseSpeed * 2.0;
}
customGrabs.splice(i, 1);
}
}
}
}

function handleDogPuddles() {
if (isCountingDown) return;
for (let i = dogPuddles.length - 1; i >= 0; i--) {
let p = dogPuddles[i];
p.timer -= gameSpeed; if (!p.tickTimer) p.tickTimer = 0; p.tickTimer -= gameSpeed;
if (p.timer <= 0) { dogPuddles.splice(i, 1); continue;
}
if (p.tickTimer <= 0) {
p.tickTimer = 4;
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== p.ownerIndex && !target.isSwallowed() && !target.isBurrowed && !target.isTransforming && !target.isMovingToCenter) {
let dist = Math.hypot(target.x - p.x, target.y - p.y);
if (dist <= 55 + target.radius) {
let ownerHero = balls.find(b => b.pIndex === p.ownerIndex && !b.isClone);
target.applyDamage(1, ownerHero);
}
}
});
}
}
}

function handleMonkeyRains() {
if (isCountingDown) return;
for (let i = monkeyRains.length - 1; i >= 0; i--) {
let m = monkeyRains[i];
m.y += m.vy * gameSpeed;
let hit = false;

let ownerHero = balls.find(b => b.pIndex === m.ownerIndex && !b.isClone);
for (let j = 0; j < balls.length; j++) {
let target = balls[j];
if (target.hp > 0 && target.pIndex !== m.ownerIndex && !target.isSwallowed() && !target.isBurrowed && !target.isTransforming && !target.isMovingToCenter) {
if (Math.hypot(target.x - m.x, target.y - m.y) <= m.radius + target.radius) {
target.applyDamage(20, ownerHero);
createShockwave(m.x, m.y, 45, "#8B4513");
for(let p=0; p<15; p++) particles.push(new Particle(m.x, m.y, "#8B4513", 'sharp'));
hit = true;
break;
}
}
}

if (hit || m.y > arenaBottom + 50) {
monkeyRains.splice(i, 1);
}
}
}

function handleGongSkills() {
if (isCountingDown) return;
for (let i = simonProjectiles.length - 1; i >= 0; i--) {
let p = simonProjectiles[i];
p.x += p.vx * gameSpeed;
p.y += p.vy * gameSpeed; p.life -= gameSpeed;
if (p.x < arenaLeft || p.x > arenaRight || p.y < arenaTop || p.y > arenaBottom || p.life <= 0) { simonProjectiles.splice(i, 1);
continue; }
let hit = false;
for (let t = 0; t < balls.length; t++) {
let enemy = balls[t];
if (enemy.hp <= 0 || p.ownerIndex === enemy.pIndex || enemy.isSwallowed() || enemy.isBurrowed || enemy.isTransforming || enemy.isMovingToCenter) continue;
let dx = enemy.x - p.x, dy = enemy.y - p.y;
if (Math.sqrt(dx * dx + dy * dy) < enemy.radius + p.radius) {
let ownerHero = balls.find(ball => ball.pIndex === p.ownerIndex && !ball.isClone);
let finalDmg = ownerHero && ownerHero.weakDebuffTimer > 0 ? 7.5 : 15;
enemy.applyDamage(finalDmg, ownerHero); enemy.electricDuration = 180;
for (let k = 0; k < 12; k++) particles.push(new Particle(p.x, p.y, "#00ffff", 'sharp'));
simonProjectiles.splice(i, 1); hit = true; break;
}
}
if (hit) continue;
}

for (let i = dominicProjectiles.length - 1; i >= 0; i--) {
let d = dominicProjectiles[i];
if (d.type === 'data_grenade') {
if (!d.isArrived) {
d.x += d.vx * gameSpeed; d.y += d.vy * gameSpeed; d.life -= gameSpeed;
if (d.life <= 0) { d.x = d.tx; d.y = d.ty; d.isArrived = true; }
} else {
d.explosionTimer -= gameSpeed;
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== d.ownerIndex && !enemy.isSwallowed() && !enemy.isTransforming && !enemy.isMovingToCenter && !enemy.isBurrowed) {
let dist = Math.hypot(enemy.x - d.x, enemy.y - d.y);
if (dist <= 76.5 + enemy.radius && dist > 5) {
enemy.x += (d.x - enemy.x) * 0.05 * gameSpeed; enemy.y += (d.y - enemy.y) * 0.05 * gameSpeed;
}
}
});
if (Math.random() < 0.4) particles.push(new Particle(d.x + (Math.random()-0.5)*76.5, d.y + (Math.random()-0.5)*76.5, "#00ff00", 'sharp'));
if (d.explosionTimer <= 0) {
let ownerHero = balls.find(ball => ball.pIndex === d.ownerIndex && !ball.isClone);
balls.forEach(enemy => {
if (enemy.hp > 0 && enemy.pIndex !== d.ownerIndex && Math.hypot(enemy.x - d.x, enemy.y - d.y) <= 76.5 + enemy.radius) {
enemy.applyDamage(20, ownerHero);
}
});
createShockwave(d.x, d.y, 76.5, "#00ff00");
dominicProjectiles.splice(i, 1);
}
}
continue;
}

if (!d.isArrived) {
d.x += d.vx * gameSpeed; d.y += d.vy * gameSpeed;
d.life -= gameSpeed;
if (d.life <= 0) {
d.x = d.tx; d.y = d.ty; d.isArrived = true; let explosionRadius = 38.8125;
let hitCount = 0;
for (let p = 0; p < 14; p++) particles.push(new Particle(d.x, d.y, "#00ffff", 'sharp'));
balls.forEach(enemy => {
if (enemy.hp <= 0 || enemy.pIndex === d.ownerIndex || enemy.isSwallowed() || enemy.isBurrowed) return;
let dist = Math.sqrt(Math.pow(enemy.x - d.x, 2) + Math.pow(enemy.y - d.y, 2));
if (dist <= explosionRadius + enemy.radius) {
let ownerHero = balls.find(ball => ball.pIndex === d.ownerIndex && !ball.isClone);
let finalDmg = ownerHero && ownerHero.weakDebuffTimer > 0 ? 7.5 : 15;
enemy.applyDamage(finalDmg, ownerHero); enemy.electricDuration = 120; hitCount++;
}
});
}
} else { d.explosionTimer -= gameSpeed;
if (d.explosionTimer <= 0) dominicProjectiles.splice(i, 1); }
}
}

function handleGroundSlamAreas() {
if (isCountingDown) return;
for (let i = groundSlamAreas.length - 1; i >= 0; i--) {
let area = groundSlamAreas[i]; area.timer -= gameSpeed;
if (area.timer <= 0) {
if (area.type === 'slam') {
let cracks = [];
for(let c=0; c<14; c++){
let ang = (Math.PI*2/14)*c + (Math.random()-0.5)*0.5; let pts = [];
let r = 0;
let cAng = ang;
while(r < 165) { r += 15 + Math.random()*20; cAng += (Math.random()-0.5)*0.8;
pts.push({x: Math.cos(cAng)*Math.min(r, 165), y: Math.sin(cAng)*Math.min(r, 165)}); }
cracks.push(pts);
}
earthquakes.push({x: area.owner.x, y: area.owner.y, life: 60, cracks: cracks});
shakeTime = 25;
shakeIntensity = 15;
balls.forEach(target => {
if (target.hp > 0 && target.pIndex !== area.owner.pIndex && !target.isSwallowed() && !target.isBurrowed && !target.isTransforming && !target.isMovingToCenter) {
let dist = Math.hypot(target.x - area.owner.x, target.y - area.owner.y);
if (dist <= 165 + target.radius) { target.applyDamage(25, area.owner); target.slowDuration = 180; }
}
});
for(let k=0; k<20; k++) particles.push(new Particle(area.owner.x, area.owner.y, "#ff4757", 'sharp'));
}
groundSlamAreas.splice(i, 1);
}
}
}

function handleBallCollisions() {
for (let i = 0; i < balls.length; i++) {
for (let j = i + 1; j < balls.length; j++) {
let b1 = balls[i];
let b2 = balls[j];
if (b1.hp <= 0 || b2.hp <= 0 || b1.isBurrowed || b2.isBurrowed || b1.isSwallowed() || b2.isSwallowed() || b1.isTransforming || b2.isTransforming || b1.isMovingToCenter || b2.isMovingToCenter) continue;
let dx = b2.x - b1.x; let dy = b2.y - b1.y;
let dist = Math.sqrt(dx * dx + dy * dy); let minDist = b1.radius + b2.radius;
if (dist < minDist && dist > 0) {
let overlap = minDist - dist; let nx = dx / dist;
let ny = dy / dist;
b1.x -= nx * (overlap / 2); b1.y -= ny * (overlap / 2);
b2.x += nx * (overlap / 2); b2.y += ny * (overlap / 2);
let kx = (b1.vx - b2.vx);
let ky = (b1.vy - b2.vy);
let p = 2.0 * (nx * kx + ny * ky) / 2.0;
if(b1.id !== 99) { b1.vx -= p * nx; b1.vy -= p * ny;
}
if(b2.id !== 99) { b2.vx += p * nx; b2.vy += p * ny;
}

if (b1.bumpDmg > 0 && b1.pIndex !== b2.pIndex) b2.applyDamage(b1.bumpDmg, b1);
if (b2.bumpDmg > 0 && b1.pIndex !== b2.pIndex) b1.applyDamage(b2.bumpDmg, b2);
}
}
}
}

function handleBulletCollisions() {
for (let i = bullets.length - 1; i >= 0; i--) {
let b = bullets[i]; b.update();
let hit = false;
for (let j = 0; j < balls.length; j++) {
let target = balls[j];
if (target.hp <= 0 || target.pIndex === b.ownerIndex || target.isSwallowed() || target.isBurrowed || target.isTransforming || target.isMovingToCenter) continue;
let dx = target.x - b.x; let dy = target.y - b.y;
let dist = Math.sqrt(dx * dx + dy * dy);
if (dist < target.radius + b.radius) {
let ownerHero = balls.find(ball => ball.pIndex === b.ownerIndex && !ball.isClone);
if (b.type === 'dark_assassinate') {
target.applyDamage(b.damage, ownerHero);
if (ownerHero) {
let randAng = Math.random() * Math.PI * 2;
let offset = target.radius + ownerHero.radius + 15;
ownerHero.x = target.x + Math.cos(randAng) * offset;
ownerHero.y = target.y + Math.sin(randAng) * offset;
ownerHero.isTeleportStabbing = true; ownerHero.vx = 0; ownerHero.vy = 0;
setTimeout(() => {
ownerHero.isTeleportStabbing = false;
if(ownerHero.hp > 0 && target.hp > 0 && !ownerHero.isDeadCompletely) {
target.applyDamage(16, ownerHero); ownerHero.applyHeal(5); target.darkDebuffTimer = 180;
textPopups.push(new TextPopup(target.x, target.y - 20, "찌르기!", false)); createShockwave(target.x, target.y, 40, '#9b59b6');
}
let moveAng = Math.random() * Math.PI * 2; ownerHero.vx = Math.cos(moveAng) * ownerHero.baseSpeed; ownerHero.vy = Math.sin(moveAng) * ownerHero.baseSpeed;
}, 300 / gameSpeed);
}
} else {
target.applyDamage(b.damage, ownerHero);
if (b.type === 'elephant') {
// 코끼리 넉백 및 벽 꽝 대기 상태 부여
let kbAngle = Math.atan2(b.vy, b.vx);
target.vx = Math.cos(kbAngle) * 16;
target.vy = Math.sin(kbAngle) * 16;
target.elephantWallBangReady = 60;
// 1초 내에 벽 닿으면 데미지
target.elephantWallBangAttacker = ownerHero;
}
else if (b.type === 'ink_mark') { if (ownerHero) ownerHero.markedTargetId = target.pIndex;
}
else if (b.type === 'dark_bomb') { createShockwave(b.x, b.y, 40, "#741b7c"); if (ownerHero) ownerHero.applyHeal(5);
}
else if (b.type === 'dog_charm') { dogPuddles.push({ x: target.x, y: target.y, timer: 240, ownerIndex: b.ownerIndex });
}
}
for(let k=0; k<8; k++) particles.push(new Particle(b.x, b.y, b.color, 'sharp'));
bullets.splice(i, 1); hit = true; break;
}
}
if (!hit && (b.x < arenaLeft || b.x > arenaRight || b.y < arenaTop || b.y > arenaBottom || b.life <= 0)) { bullets.splice(i, 1);
}
}
}

function drawParkSwords() {
parkSwords.forEach(s => {
ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.state === 'fire' ? s.angle : -Math.PI/4);
ctx.fillStyle = "#00ffff"; ctx.shadowBlur = 10; ctx.shadowColor = "#00ffff";
ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(0, -6); ctx.lineTo(-10, 0); ctx.lineTo(0, 6); ctx.fill(); ctx.restore();
});
}

function drawMonkeyRains() {
monkeyRains.forEach(m => {
ctx.save();
ctx.translate(m.x, m.y);
ctx.font = "50px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.shadowBlur = 8;
ctx.shadowColor = "rgba(0,0,0,0.5)";
ctx.fillText("🐒", 0, 0);
ctx.restore();
});
}

function startBattle() {
document.getElementById('main-home-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'none'; document.getElementById('char-select-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'flex';
document.getElementById('p1-name').innerText = '1P ' + p1Selected.nickname;
document.getElementById('p1-name').style.color = "var(--neon-red)";
document.getElementById('p2-name').innerText = '2P ' + p2Selected.nickname; document.getElementById('p2-name').style.color = "var(--neon-green)";
if(gameMode === 3) { document.getElementById('p3-name').innerText = '3P ' + p3Selected.nickname; document.getElementById('p3-name').style.color = "var(--neon-yellow)"; }

balls = [];
if (gameMode === 2 || gameMode === 4) {
balls.push(new Ball(size * 0.25, size * 0.5, p1Selected, 0));
balls.push(new Ball(size * 0.75, size * 0.5, p2Selected, 1));
} else {
let centerX = size / 2, centerY = size / 2 + 10, radius = size * 0.26;
balls.push(new Ball(centerX + Math.cos(-Math.PI/2)*radius, centerY + Math.sin(-Math.PI/2)*radius, p1Selected, 0));
balls.push(new Ball(centerX + Math.cos(Math.PI/6) * radius, centerY + Math.sin(Math.PI/6) * radius, p2Selected, 1));
balls.push(new Ball(centerX + Math.cos(5 * Math.PI/6) * radius, centerY + Math.sin(5 * Math.PI/6) * radius, p3Selected, 2));
}

updateUI();
particles = []; bullets = []; groundSlamAreas = []; craters = []; soundwaves = []; textPopups = [];
fanAttackPreviews = []; customGrabs = []; burrowPreviews = []; simonProjectiles = []; dominicProjectiles = []; seqLaserBullets = [];
darkBombThreats = []; earthquakes = []; parkSwords = []; dogPuddles = []; activeDonations = []; monkeyRains = [];
isCountingDown = true;
countdownTimer = 3;
const overlay = document.getElementById('countdown-overlay'); overlay.innerText = countdownTimer; overlay.style.display = 'block';

if(countdownIntervalId) clearInterval(countdownIntervalId);
countdownIntervalId = setInterval(() => {
countdownTimer--;
if (countdownTimer > 0) { overlay.innerText = countdownTimer; }
else if (countdownTimer === 0) { overlay.innerText = "START! 💥"; isCountingDown = false; balls.forEach(b => b.launch()); }
else { overlay.style.display = 'none'; clearInterval(countdownIntervalId); }
}, 1000);
gameActive = true; animate();
}

function getMaxCooldown(ball) {
if (ball.id === 0) return ball.currentSkillStep === 1 ?
300 : (ball.currentSkillStep === 2 ? 180 : 210);
if (ball.id === 1) return ball.currentSkillStep === 1 ?
180 : (ball.currentSkillStep === 2 ? 210 : 240);
if (ball.id === 2) {
let step = [1, 2, 3, 1, 2, 1, 2, 3][ball.parkCycleIdx];
if (step === 1) return 210;
if (step === 2) return 360;
if (step === 3) return 120;
}
if (ball.id === 3) return !ball.isPhase2 ? 99999 : (ball.currentSkillStep === 1 ? 240 : 180);
if (ball.id === 4) return ball.currentSkillStep === 1 ? 210 : (ball.currentSkillStep === 2 ? 120 : 180);
if (ball.id === 5) return ball.currentSkillStep === 1 ? 240 : 300;
if (ball.id === 6) return ball.currentSkillStep === 1 ? 240 : (ball.currentSkillStep === 2 ? 240 : 120);
if (ball.id === 8) return ball.currentSkillStep === 1 ? 210 : (ball.currentSkillStep === 2 ? 240 : 270);
if (ball.id === 9) return 270;
if (ball.id === 10) return ball.currentSkillStep === 1 ? 180 : 240;
if (ball.id === 11) return 240;
if (ball.id === 12) return 99999;
return 240;
}

function updateUI() {
const activeBalls = balls.filter(b => !b.isClone);
if(activeBalls[0]) {
document.getElementById('p1-hp-bar').style.width = (activeBalls[0].hp / activeBalls[0].maxHp * 100) + '%';
document.getElementById('p1-hp-text').innerText = Math.ceil(activeBalls[0].hp) + '/' + activeBalls[0].maxHp;
let cPct = activeBalls[0].isClone ? 0 : (1 - (activeBalls[0].skillTimer / getMaxCooldown(activeBalls[0])));
cPct = Math.max(0, Math.min(1, cPct));
document.getElementById('p1-cool-bar').style.width = (cPct * 100) + '%';
if(cPct >= 1) document.getElementById('p1-cool-bar').classList.add('ready-glow'); else document.getElementById('p1-cool-bar').classList.remove('ready-glow');
}
if(activeBalls[1]) {
if (activeBalls[1].id === 99) {
document.getElementById('p2-hp-bar').style.width = '100%'; document.getElementById('p2-hp-text').innerText = '∞ / ∞'; document.getElementById('p2-cool-bar').style.width = '0%';
} else {
document.getElementById('p2-hp-bar').style.width = (activeBalls[1].hp / activeBalls[1].maxHp * 100) + '%'; document.getElementById('p2-hp-text').innerText = Math.ceil(activeBalls[1].hp) + '/' + activeBalls[1].maxHp;
let cPct = 1 - (activeBalls[1].skillTimer / getMaxCooldown(activeBalls[1]));
cPct = Math.max(0, Math.min(1, cPct)); document.getElementById('p2-cool-bar').style.width = (cPct * 100) + '%';
if(cPct >= 1) document.getElementById('p2-cool-bar').classList.add('ready-glow'); else document.getElementById('p2-cool-bar').classList.remove('ready-glow');
}
}
if(gameMode === 3 && activeBalls[2]) {
document.getElementById('p3-hp-bar').style.width = (activeBalls[2].hp / activeBalls[2].maxHp * 100) + '%';
document.getElementById('p3-hp-text').innerText = Math.ceil(activeBalls[2].hp) + '/' + activeBalls[2].maxHp;
let cPct = 1 - (activeBalls[2].skillTimer / getMaxCooldown(activeBalls[2]));
cPct = Math.max(0, Math.min(1, cPct));
document.getElementById('p3-cool-bar').style.width = (cPct * 100) + '%';
if(cPct >= 1) document.getElementById('p3-cool-bar').classList.add('ready-glow'); else document.getElementById('p3-cool-bar').classList.remove('ready-glow');
}
}

function checkGameEnd() {
if (!gameActive) return;
let alivePlayers = balls.filter(b => b.hp > 0 && !b.isClone);
if (gameMode === 4) {
if (alivePlayers.filter(p => p.id !== 99).length === 0) {
gameActive = false; document.getElementById('result-screen').style.display = 'flex';
document.getElementById('result-title').innerText = "PRACTICE OVER"; document.getElementById('result-title').style.color = "#fff";
}
return;
}

if (alivePlayers.length <= 1) {
gameActive = false;
const screen = document.getElementById('result-screen');
const title = document.getElementById('result-title'); screen.style.display = 'flex';
if(alivePlayers.length === 1) { let winnerNum = alivePlayers[0].pIndex + 1;
title.innerText = winnerNum + 'P ' + alivePlayers[0].nickname + ' WIN! 🎉'; title.style.color = alivePlayers[0].color;
}
else { title.innerText = "DRAW! ⚖️"; title.style.color = "#fff"; }
}
}

function animate() {
if (!gameActive) return;
requestAnimationFrame(animate);
balls.forEach(b => b.update());
handleBallCollisions();
handleBulletCollisions();
handleCustomGrabs();
handleGongSkills();
handleGroundSlamAreas();
handleParkSwords();
handleDogPuddles();
handleMonkeyRains();

ctx.save();
if (shakeTime > 0) { let dx = (Math.random() - 0.5) * shakeIntensity;
let dy = (Math.random() - 0.5) * shakeIntensity; ctx.translate(dx, dy); shakeTime -= gameSpeed; }
ctx.fillStyle = flashBgColor ? flashBgColor : '#06060c';
ctx.fillRect(0, 0, canvas.width, canvas.height);

dogPuddles.forEach(p => {
ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, 55, 0, Math.PI * 2);
ctx.fillStyle = "rgba(139, 69, 19, 0.2)"; ctx.strokeStyle = "rgba(139, 69, 19, 0.6)"; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); ctx.restore();
});
ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; ctx.lineWidth = 8; ctx.strokeRect(0, 0, size, size);
for (let i = earthquakes.length - 1; i >= 0; i--) {
let eq = earthquakes[i]; eq.life -= gameSpeed;
if (eq.life <= 0) { earthquakes.splice(i, 1); continue; }
ctx.save(); ctx.translate(eq.x, eq.y); ctx.strokeStyle = `rgba(255, 71, 87, ${eq.life / 60})`;
ctx.lineWidth = 3 + (eq.life / 20); ctx.shadowBlur = 10; ctx.shadowColor = "#ff4757";
eq.cracks.forEach(crack => { ctx.beginPath(); ctx.moveTo(0, 0); crack.forEach(pt => ctx.lineTo(pt.x, pt.y)); ctx.stroke(); }); ctx.restore();
}

for (let i = craters.length - 1; i >= 0; i--) {
let c = craters[i]; c.life -= gameSpeed;
if (c.life <= 0) { craters.splice(i, 1); continue; }
ctx.save(); ctx.strokeStyle = 'rgba(180, 70, 40,' + (c.life / 120) + ')';
ctx.lineWidth = 2.5;
if (c.isEnhanced) {
ctx.beginPath(); ctx.arc(c.x, c.y, c.maxRadius * 0.15, 0, Math.PI * 2); ctx.stroke();
c.cracks.forEach(cr => {
ctx.beginPath(); ctx.moveTo(c.x, c.y); let endX = c.x + Math.cos(cr.angle) * c.maxRadius * cr.lengthMult; let endY = c.y + Math.sin(cr.angle) * c.maxRadius * cr.lengthMult; let midX = c.x + Math.cos(cr.angle + cr.branches[0]) * c.maxRadius * cr.lengthMult * 0.5; let midY = c.y + Math.sin(cr.angle + cr.branches[0]) * c.maxRadius * cr.lengthMult * 0.5; ctx.lineTo(midX, midY); ctx.lineTo(endX, endY); ctx.stroke();
if (c.life > 40) { ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(midX + Math.cos(cr.angle + 0.8) * 25, midY + Math.sin(cr.angle + 0.8) * 25); ctx.stroke(); }
});
} else { ctx.beginPath(); ctx.arc(c.x, c.y, c.maxRadius * (1 - c.life / 120), 0, Math.PI * 2); ctx.stroke(); }
ctx.restore();
}

for (let i = soundwaves.length - 1; i >= 0; i--) {
let s = soundwaves[i]; s.life -= 1.5 * gameSpeed;
s.radius += 12 * gameSpeed; if (s.life <= 0) { soundwaves.splice(i, 1); continue; }
ctx.save(); ctx.globalAlpha = Math.max(0, s.life / 60);
ctx.strokeStyle = s.color || 'rgba(241, 196, 15, 1)'; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.shadowBlur = 15;
ctx.shadowColor = s.color || "#f1c40f"; ctx.beginPath();
if (s.isFullCircle) { ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
} else { ctx.arc(s.x, s.y, s.radius, s.angle - Math.PI/3, s.angle + Math.PI/3); }
ctx.stroke(); ctx.restore();
}

for (let i = darkBombThreats.length - 1; i >= 0; i--) {
let t = darkBombThreats[i]; t.timer -= gameSpeed;
if (t.timer <= 0 || t.target.hp <= 0) { darkBombThreats.splice(i, 1); continue; }
ctx.save(); ctx.strokeStyle = "rgba(147, 112, 219, 0.7)";
ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(t.owner.x, t.owner.y); ctx.lineTo(t.target.x, t.target.y); ctx.stroke();
ctx.fillStyle = "#ff00ff"; ctx.font = "bold 9px sans-serif";
ctx.fillText("위협 조준", t.target.x - 15, t.target.y - t.target.radius - 5); ctx.restore();
}

for (let i = burrowPreviews.length - 1; i >= 0; i--) { let p = burrowPreviews[i]; ctx.save();
ctx.strokeStyle = "rgba(230, 126, 34, 0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

for (let i = fanAttackPreviews.length - 1; i >= 0; i--) {
let p = fanAttackPreviews[i]; p.timer -= gameSpeed;
if (p.timer <= 0) { fanAttackPreviews.splice(i, 1); continue; }
ctx.save(); ctx.fillStyle = "rgba(241, 196, 15, 0.25)";
ctx.strokeStyle = "rgba(241, 196, 15, 0.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.owner.x, p.owner.y);
ctx.arc(p.owner.x, p.owner.y, size * 1.2, p.targetAngle - (60 * Math.PI/180), p.targetAngle + (60 * Math.PI/180)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

customGrabs.forEach(g => {
if (g.type !== 'hack_link') {
ctx.save(); ctx.strokeStyle = g.owner.color; ctx.lineWidth = 3.5; ctx.shadowBlur = 10; ctx.shadowColor = g.owner.color; ctx.beginPath(); ctx.moveTo(g.owner.x, g.owner.y); ctx.lineTo(g.x, g.y); ctx.stroke(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.x, g.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
});
balls.forEach(b => {
if ((b.id === 5 || b.id === 9) && b.voiceLaserActive && b.laserSegments) {
ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y); for(let k=1; k<b.laserSegments.length; k++) ctx.lineTo(b.laserSegments[k].x, b.laserSegments[k].y);

let outerColor = b.enhancedLaser ? "rgba(0, 168, 255, 0.3)" : "rgba(255, 140, 0, 0.3)";
let innerColor = b.enhancedLaser ? "rgba(0, 255, 255, 0.7)" : "rgba(255, 200, 0, 0.7)";
let shadowOuter = b.enhancedLaser ? "#00a8ff" : "#ff8c00";

ctx.strokeStyle = outerColor; ctx.lineWidth = 26 + Math.sin(Date.now() / 40) * 6; ctx.shadowBlur = 24; ctx.shadowColor = shadowOuter; ctx.stroke();
ctx.strokeStyle = innerColor; ctx.lineWidth = 12; ctx.shadowBlur = 12; ctx.stroke();
ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.shadowBlur = 6; ctx.stroke(); ctx.restore();
}

if (!b.voiceLaserActive && b.laserFadeTimer > 0 && b.laserSegments) {
ctx.save(); ctx.globalAlpha = b.laserFadeTimer / 30;
if (b.id === 6) { ctx.strokeStyle = "#9b59b6";
ctx.lineWidth = 8; ctx.lineCap ="round";
ctx.beginPath();
ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y); ctx.lineTo(b.laserSegments[1].x, b.laserSegments[1].y); ctx.stroke();
ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.stroke();
}
else { ctx.strokeStyle = b.enhancedLaser ?
"rgba(0, 168, 255, 0.5)" : "rgba(230, 126, 34, 0.5)";
ctx.lineWidth = 28;
ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y);
for(let k=1; k<b.laserSegments.length; k++) ctx.lineTo(b.laserSegments[k].x, b.laserSegments[k].y); ctx.stroke();
ctx.strokeStyle = "#ffffff";
ctx.lineWidth = 8; ctx.stroke(); }
ctx.restore();
}

if (b.tvBeamActive) {
ctx.save();
ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"; ctx.lineWidth = 5;
ctx.shadowBlur = 10;
ctx.shadowColor = "#ff0000";
let beamAngles = [b.tvBeamAngle, b.tvBeamAngle + Math.PI/2, b.tvBeamAngle + Math.PI, b.tvBeamAngle + Math.PI*1.5];
ctx.beginPath();
beamAngles.forEach(ang => { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(ang) * size * 1.5, b.y + Math.sin(ang) * size * 1.5); });
ctx.stroke();
ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"; ctx.lineWidth = 2.5; ctx.shadowBlur = 0; ctx.beginPath();
beamAngles.forEach(ang => { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(ang) * size * 1.5, b.y + Math.sin(ang) * size * 1.5); });
ctx.stroke(); ctx.restore();
}

if (b.gongLaserActive) {
ctx.save();
let angles = [b.gongLaserAngle, b.gongLaserAngle + (2 * Math.PI / 3), b.gongLaserAngle + (4 * Math.PI / 3)];
ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
ctx.lineWidth = 4;
ctx.shadowBlur = 15;
ctx.shadowColor = "#00ffff";
angles.forEach(ang => {
ctx.beginPath();
let curX = b.x, curY = b.y;
ctx.moveTo(curX, curY);
for(let s=0; s<12; s++) {
curX += Math.cos(ang) * (size * 1.5 / 12) + (Math.random()-0.5) * 15;
curY += Math.sin(ang) * (size * 1.5 / 12) + (Math.random()-0.5) * 15;
ctx.lineTo(curX, curY);
}
ctx.stroke();
});
ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
ctx.lineWidth = 2;
ctx.shadowBlur = 0;
angles.forEach(ang => {
ctx.beginPath();
ctx.moveTo(b.x, b.y);
ctx.lineTo(b.x + Math.cos(ang) * size * 1.5, b.y + Math.sin(ang) * size * 1.5);
ctx.stroke();
});
ctx.restore();
}
});
if (typeof bullets !== 'undefined' && bullets) bullets.forEach(b => { if(b && typeof b.draw === 'function') b.draw(); });
if (typeof simonProjectiles !== 'undefined' && simonProjectiles) {
simonProjectiles.forEach(p => { if(!p || typeof p.x === 'undefined') return; ctx.save(); ctx.translate(p.x, p.y); ctx.shadowBlur = 10; ctx.shadowColor = p.color || "#fff"; ctx.fillStyle = p.color || "#fff"; ctx.font = "900 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.text || "", 0, 0); ctx.fillStyle = "#fff"; ctx.fillText(p.text || "", 0, 0); ctx.restore(); });
}

if (typeof dominicProjectiles !== 'undefined' && dominicProjectiles) {
dominicProjectiles.forEach(d => {
if(!d || typeof d.x === 'undefined') return;
let drawRadius = d.type === 'data_grenade' ? 76.5 : 38.8125;
let rangeColor = d.type === 'data_grenade' ? "rgba(0, 255, 0, 0.5)" : "rgba(0, 255, 255, 0.5)";
let rangeFill = d.type === 'data_grenade' ? "rgba(0, 255, 0, 0.1)" : "rgba(0, 255, 255, 0.1)";

if (!d.isArrived || (d.type === 'data_grenade' && d.isArrived && d.explosionTimer > 0)) {
let cX = d.isArrived ? d.x : (d.tx || d.x);
let cY = d.isArrived ? d.y : (d.ty || d.y);
ctx.save(); ctx.beginPath(); ctx.arc(cX, cY, drawRadius, 0, Math.PI * 2);
ctx.strokeStyle = rangeColor; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
ctx.stroke();
ctx.fillStyle = rangeFill; ctx.fill(); ctx.restore();
}

if (!d.isArrived) {
ctx.save(); ctx.translate(d.x, d.y); ctx.shadowBlur = 10; ctx.shadowColor = d.color || "#00ffff"; ctx.fillStyle = d.color || "#00ffff";
ctx.font = "900 16px sans-serif"; ctx.textAlign = "center";
ctx.textBaseline = "middle"; ctx.fillText(d.text || "", 0, 0); ctx.fillStyle = "#fff";
ctx.fillText(d.text || "", 0, 0); ctx.restore();
}
});
}

drawParkSwords();
drawMonkeyRains();
balls.forEach(b => b.draw());

for (let i = particles.length - 1; i >= 0; i--) { let p = particles[i];
p.update();
p.draw();
if (p.alpha <= 0) particles.splice(i, 1); }
for (let i = textPopups.length - 1; i >= 0; i--) { let t = textPopups[i];
t.update(); t.draw(); if (t.alpha <= 0) textPopups.splice(i, 1); }

let dYOffset = 40;
for (let i = activeDonations.length - 1; i >= 0; i--) {
let d = activeDonations[i]; d.timer -= gameSpeed;
if (d.timer <= 0) { activeDonations.splice(i, 1); continue; }
ctx.save(); ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
ctx.textBaseline = "middle"; ctx.shadowBlur = 5; ctx.shadowColor = d.color; ctx.fillText(d.text, size/2, dYOffset); ctx.restore();
dYOffset += 20;
}

ctx.restore(); updateUI(); checkGameEnd();
}
