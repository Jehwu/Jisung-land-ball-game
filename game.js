// ==========================================
// [게임 유틸리티 및 수학 함수]
// ==========================================
const PI = Math.PI, PI2 = PI * 2;
const getDist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
const getObjDist = (a, b) => getDist(a.x, a.y, b.x, b.y);
const getAngle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const getObjAngle = (a, b) => getAngle(a.x, a.y, b.x, b.y);
const rand = (min, max) => Math.random() * (max - min) + min;

// 배열에서 요소를 삭제하며 순회하는 고차 함수 (역순 순회 최적화)
const processArr = (arr, fn) => {
  for (let i = arr.length - 1; i >= 0; i--) if (fn(arr[i], i)) arr.splice(i, 1);
};

// ==========================================
// [초기 설정 및 글로벌 변수]
// ==========================================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const size = Math.min(window.innerWidth - 30, 360);
canvas.width = canvas.height = size;
const [arenaLeft, arenaRight, arenaTop, arenaBottom] = [4, size - 4, 4, size - 4];

let gameSpeed = 1.0, isCountingDown = false, countdownTimer = 3, gameMode = 2, gameActive = false, countdownIntervalId = null;
let shakeTime = 0, shakeIntensity = 0, flashBgColor = null;
let lastScreenBeforeDict = 'main';
let p1Selected = null, p2Selected = null, p3Selected = null;

// 엔티티 관리 배열들
let balls = [], particles = [], bullets = [], groundSlamAreas = [], textPopups = [], fanAttackPreviews = [], customGrabs = [], burrowPreviews = [];
let earthquakes = [], craters = [], soundwaves = [], darkBombThreats = [], parkSwords = [], dogPuddles = [], activeDonations = [];
let monkeyRains = [], simonProjectiles = [], dominicProjectiles = [], seqLaserBullets = [];

// ==========================================
// [데이터 모음]
// ==========================================
const characters = [
  { id: 0, name: "🛡️ 김민채", nickname: "김민채", class: "tanker", color: "#ff4757", maxHp: 300, radius: 23, speed: 1.4, bumpDmg: 0 },
  { id: 1, name: "⚡ 공병은", nickname: "공병은", class: "dealer", color: "#2ed573", maxHp: 225, radius: 18, speed: 1.7, bumpDmg: 0 },
  { id: 2, name: "👑 박지성", nickname: "박지성", class: "dealer", color: "#f1c40f", maxHp: 225, radius: 20, speed: 1.95, bumpDmg: 0 },
  { id: 3, name: "📺 김티비", nickname: "김티비", class: "dealer", color: "#808080", maxHp: 50, radius: 21, speed: 1.3, bumpDmg: 5 },
  { id: 4, name: "🖌️ 김가은", nickname: "김가은", class: "util", color: "#b339a3", maxHp: 180, radius: 19, speed: 2.1, bumpDmg: 0 },
  { id: 5, name: "🎙️ 김건우", nickname: "김건우", class: "dealer", color: "#e67e22", maxHp: 250, radius: 20, speed: 1.2, bumpDmg: 0 },
  { id: 6, name: "🔮 곤지암병은", nickname: "곤지암병은", class: "util", color: "#741b7c", maxHp: 150, radius: 18, speed: 1.6, bumpDmg: 0 },
  { id: 8, name: "✨ 차은우지성", nickname: "차은우지성", class: "util", color: "#ffb6c1", maxHp: 210, radius: 20, speed: 1.5, bumpDmg: 0 },
  { id: 9, name: "🔴 버튜버 김티비", nickname: "V티비", class: "util", color: "#ff9ff3", maxHp: 175, radius: 21, speed: 1.5, bumpDmg: 0 },
  { id: 10, name: "💻 김민제미나이", nickname: "김민제미나이", class: "dealer", color: "#00ff00", maxHp: 200, radius: 20, speed: 1.6, bumpDmg: 0 },
  { id: 11, name: "🐵 건숭이", nickname: "건숭이", class: "tanker", color: "#8B4513", maxHp: 300, radius: 22, speed: 1.68, bumpDmg: 0 },
  { id: 12, name: "🏰 공필두병은", nickname: "공필두병은", class: "tanker", color: "#2c3e50", maxHp: 260, radius: 24, speed: 1.5, bumpDmg: 0 },
  { id: 13, name: "🤖 기가은", nickname: "기가은", class: "dealer", color: "#bdc3c7", maxHp: 175, radius: 22, speed: 1.5, bumpDmg: 0 },
  { id: 14, name: "🔫 김가은(기가은)", nickname: "김가은", class: "dealer", color: "#b339a3", maxHp: 50, radius: 16, speed: 1.8, bumpDmg: 0, hidden: true },
  { id: 15, name: "🫦 김민제리얌", nickname: "김민제리얌", class: "util", color: "#e84393", maxHp: 180, radius: 20, speed: 1.5, bumpDmg: 0 }
];

const dictionaryData = [
  { nickname: "김민채", color: "#ff4757", name: "🛡️ 김민채", class: "tanker", hpStat: 95, atkStat: 50, spdStat: 40, desc: "패시브: 받는 피해 10% 감소 (분노 시 30% 감면 및 이속 100% 증가) 🛡️<br>스킬 1: 먹기 - 장판에 닿은 대상을 삼켜 피해.<br>스킬 2: 대지 강타 - 광역 지진 슬로우.<br>스킬 3: 코끼리의 왕 (3.5초) - 거대한 코끼리 1마리를 발사합니다. 적중 시 강한 넉백 및 15피해. 벽에 충돌 시 10 추가 피해." },
  { nickname: "공병은", color: "#2ed573", name: "⚡ 공병은", class: "dealer", hpStat: 55, atkStat: 75, spdStat: 75, desc: "스킬 1: 사이먼도미닉 / 15 / 3초 / 감전<br>스킬 2: 사이먼 앤 도미닉 봄 / 15 / 3.5초 / 감전<br>스킬 3: 일렉트릭 레이저 / 7 / 4초 / 360도 회전 3방향 빔 발사 (적중 시 단일 타격 7뎀 및 감전 부여, 감전 갱신 방지)" },
  { nickname: "박지성", color: "#f1c40f", name: "👑 박지성", class: "dealer", hpStat: 65, atkStat: 65, spdStat: 90, desc: "패시브: 이동속도 +30% 🏃<br>스킬 1: 소드 마스터 - 4개의 검을 소환하여 순차 발사 (쿨타임 3.5초).<br>스킬 2: 얼굴 뽐내기 - 음파 발사 (20피해).<br>궁극기: 신성력\n• \n지속 시간 동안 이동속도 +150%, 공격력 +25%, 충돌 데미지 활성화(10)." },
  { nickname: "김티비(1페)", color: "#808080", name: "📺 김티비 (1페이즈)", class: "dealer", hpStat: 20, atkStat: 90, spdStat: 35, desc: "패시브: 사망 시 각성 페이즈 진입.<br>스킬 1: 기본 공격 패턴 - 아직 각성하지 않은 상태입니다." },
  { nickname: "최해솔(각성)", color: "#ff4757", name: "🔥 최해솔 (각성)", class: "util", hpStat: 90, atkStat: 100, spdStat: 60, desc: "패시브: 폭주 모드 - 스킬 쿨타임 및 선딜레이 감소.<br>스킬 1: 화면 붕괴 레이저 (적중 시 화상).<br>스킬 2: 화염방사기 - 1초간 부채꼴 위협 후 2초간 화염을 발사해 피해와 화상을 입힘.<br>스킬 3: 전방위 펄스 (15피해, 쿨타임 4초)." },
  { nickname: "김가은", color: "#b339a3", name: "🖌️ 김가은", class: "util", hpStat: 45, atkStat: 60, spdStat: 95, desc: "패시브: 이동속도 +40% ⚡<br>스킬 1: 붓 슬래시.<br>스킬 2: 광역 붓질 - 적을 빨아들이고 폭발.<br>스킬 3: 표식 - 적중 시 10데미지 및 표식 대상 피격 시 5 체력 회복." },
  { nickname: "김건우", color: "#e67e22", name: "🎙️ 김건우", class: "dealer", hpStat: 75, atkStat: 80, spdStat: 40, desc: "패시브: 이동속도 -20% 🐌 (땅파기 사용 시 게이지 획득, 최대 2. 꽉 차면 다음 스킬 강화)<br>스킬 1: 하이퍼 파괴 레이저 (초당 18뎀 / 강화 시 파란색, 초당 30뎀).<br>스킬 2: 잠행 기습 - 땅으로 숨어 넉백 (20뎀 / 강화 시 파란색, 30뎀).<br>스킬 3: 사자후 - 0.5초 위협 후 2.5초간 전방 90도 범위에 거대한 사자후를 뿜어 초당 15의 지속 피해. 사자후에 닿은 적은 스킬 쿨타임이 정지됩니다." },
  { nickname: "곤지암병은", color: "#741b7c", name: "🔮 곤지암병은", class: "util", hpStat: 40, atkStat: 65, spdStat: 70, desc: "스킬 1: 환영 분신 소환 (본체 체력 10 회복, 체력 소진 시 소멸).<br>스킬 2: 너는 이미 죽어있다 - 적 배후 순간이동 찌르기(+5 힐).<br>스킬 3: 어둠 폭탄 (+5 힐)." },
  { nickname: "차은우지성", color: "#ffb6c1", name: "✨ 차은우지성", class: "util", hpStat: 70, atkStat: 60, spdStat: 60, desc: "패시브: 주변 반경 내 적에게 지속 피해 (틱당 1뎀 연타).<br>스킬 1: 매력의 개 / 5 / 3.5초 / 개 투사체 발사 후 지속피해 장판(반지름 71.5) 생성<br>스킬 2: 매력 업 / 0 / 4초 / 패시브 장판 범위 대폭 증가 (반지름 143)<br>스킬 3: 치유의 장판 / 0 / 4.5초 / 장판 내 적 피해 및 자신 지속 회복" },
  { nickname: "V티비", color: "#ff9ff3", name: "🔴 버튜버 김티비", class: "util", hpStat: 55, atkStat: 70, spdStat: 60, desc: "패시브: 4.5초마다 무작위 도네이션 스킬 발동.<br>도네이션: 좋은 힐(40회복)\n등 \n모든 스킬 동일 확률(약 14.28%) 발동." },
  { nickname: "김민제미나이", color: "#00ff00", name: "💻 김민제미나이", class: "dealer", hpStat: 60, atkStat: 85, spdStat: 70, desc: "스킬 1: 레이저 펄스 - 적에게 화상을 입히는 일직선 레이저 빔 발사.<br>스킬 2: 데이터 폭발 - 적을 2초간 빨아들이는 구역을 생성 후 폭발(범위 15% 증가, 20뎀).<br>스킬 3: 해킹 - 적에게 링크를 연결하여 연결 완료 즉시 폭발(20뎀)과 함께 4초간 해킹 디버프를 부여합니다." },
  { nickname: "건숭이", color: "#8B4513", name: "🐵 건숭이", class: "tanker", hpStat: 95, atkStat: 50, spdStat: 70, desc: "패시브: 이동속도 20% 증가<br>스킬 1: 원숭이의 속도 (4초) - 0.5초간 구석 이동 후 벽을 타고 3바퀴 돌며 닿는 적에게 10피해 및 밀쳐냄<br>스킬 2: 원숭이의 비 (4초) - 커다란 원숭이들이 화면 위에서 폭우처럼 쏟아져 내립니다. 닿은 적에게 20피해<br>스킬 3: 원숭이가 되 (4초) - 3초간 이름이 🐵로 변경, 이속 250% 증가, 충돌데미지 15 획득, 방어력 30% 감소." },
  { nickname: "공필두병은", color: "#2c3e50", name: "🏰 공필두병은", class: "tanker", hpStat: 90, atkStat: 70, spdStat: 50, desc: "패시브 특화: 쿨타임 바에 진화 남은 시간을 표시합니다.<br>Lv.1 무장지대: 좌우 권총포탑 (1.5초마다 3피해).<br>Lv.2 무장요새: 상하 소총포탑 추가 (1초마다 4피해).<br>Lv.max 무장성채: 대각선 저격포탑 추가 (1.5초마다 7피해)." },
  { nickname: "기가은", color: "#bdc3c7", name: "🤖 기가은", class: "dealer", hpStat: 70, atkStat: 100, spdStat: 60, desc: "패시브: 체력이 0이 되면 파일럿(김가은)으로 탈출합니다.<br>스킬 1: 기가빔 - 0.5초간 직선 위협 후 가로가 확장된 초당 12뎀 메탈릭 레이저 발사. (발사 중 적을 향해 느리게 추적합니다)<br>스킬 2: 기가플라잉 - 1초 에임 후 4초 쿨타임으로 초고속 대시합니다. (최대 6회 벽 튕김, 튕길때마다 적에게 15피해).<br>스킬 3: 메가 블레이드 - 1초 위협 후 날카로운 메가 레이저 검을 휘둘러 10피해 및 감전 부여." },
  { nickname: "김민제리얌", color: "#e84393", name: "🫦 김민제리얌", class: "util", hpStat: 65, atkStat: 60, spdStat: 65, desc: "스킬 1: 퀸카의 먹방 (3.5초) - 마법 구체 3개를 유도 없이 발사 (개당 12뎀).<br>스킬 2: 이런 먹방 안먹방 (4초) - 본체 피해를 우선 흡수하는 15체력의 보호막 생성 (남은 체력 표시).<br>스킬 3: 이런 반찬 안먹찬 (3.5초) - 시금치, 김치, 버섯 중 랜덤 투척하여 상태이상 및 큰 피해 부여." }
];

// ==========================================
// [이펙트 및 스킬 헬퍼 함수]
// ==========================================
const createShockwave = (x, y, radius, color) => soundwaves.push({ x, y, angle: 0, life: 60, radius, color, isFullCircle: true });
const spawnParticles = (x, y, color, type = 'sharp', count = 16) => {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color, type));
};
const spawnImpactEffect = (x, y, color, isWall = false) => {
  shakeTime = isWall ? 10 : 15; shakeIntensity = isWall ? 4 : 10;
  if (!isWall) { flashBgColor = "rgba(255, 255, 255, 0.08)"; setTimeout(() => flashBgColor = null, 40); }
  spawnParticles(x, y, color, 'sharp', 16);
};

// 유효한 타겟(살아있고 적군이며 특수 상태가 아닌 대상) 필터링
const getValidEnemies = (owner) => balls.filter(b => b.hp > 0 && b.pIndex !== owner.pIndex && !b.isSwallowed() && !b.isBurrowed && !b.isBurrowInAnimation && !b.isTransforming && !b.isMovingToCenter);

// ==========================================
// [UI 이벤트 바인딩]
// ==========================================
document.getElementById('patch-note-btn').onclick = () => { document.getElementById('patch-note-modal').style.display = 'block'; };
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
  ['tanker', 'dealer', 'util'].forEach(cls => { const el = document.getElementById(`grid-${cls}`); if (el) el.innerHTML = ''; });
  characters.forEach(origChar => {
    if (origChar.hidden) return; // 숨겨진 캐릭터 제외
    let char = (gameMode === 4 && origChar.id === 3) ? { ...origChar, name: "🔥 최해솔 (각성)", nickname: "최해솔", color: "#ff4757", maxHp: 200, startAsPhase2: true } : origChar;
    const card = document.createElement('div'); card.className = 'char-card'; card.id = 'card-' + char.id;
    card.innerHTML = `<div class="char-name" style="color:${char.color}">${char.name}</div><div class="char-info" style="display:none;"></div>`;
    card.onclick = () => selectCharacter(char);
    document.getElementById('grid-' + char.class)?.appendChild(card);
  });
}
initCharCards();

const dictTabsGrid = document.getElementById('dict-tabs-grid');
dictTabsGrid.innerHTML = '';
dictionaryData.forEach((char, idx) => {
  const tab = document.createElement('div'); tab.className = `dict-tab ${idx === 0 ? 'active' : ''}`;
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
  document.getElementById(lastScreenBeforeDict === 'main' ? 'main-home-screen' : 'mode-select-screen').style.display = 'flex';
}

function showDictDetail(char, tabEl) {
  document.querySelectorAll('.dict-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  const classNames = { tanker: "탱커 🛡️", dealer: "데미지 딜러 ⚔️", util: "유틸리티 ⚡" };
  document.getElementById('dict-detail-content').innerHTML = `
    <div class="dict-detail-header"><div class="dict-detail-name" style="color:${char.color}">${char.name}</div><div class="dict-detail-class" style="color:${char.color}">${classNames[char.class]}</div></div>
    <div class="stat-row"><div class="stat-label">생명력</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${char.hpStat}%; background:var(--neon-red)"></div></div></div>
    <div class="stat-row"><div class="stat-label">공격력</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${char.atkStat}%; background:var(--neon-yellow)"></div></div></div>
    <div class="stat-row"><div class="stat-label">기동성</div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${char.spdStat}%; background:var(--neon-blue)"></div></div></div>
    <div class="dict-detail-desc"><strong>[영웅 메커니즘 개요]</strong><br>${char.desc}</div>`;
}

function setGameSpeed(speed) {
  gameSpeed = speed;
  document.querySelectorAll('.speed-btn').forEach(btn => btn.classList.toggle('active', parseFloat(btn.innerText.replace('×', '')) === speed));
}

function goToModeSelect() {
  document.getElementById('main-home-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'flex';
  document.getElementById('char-select-screen').style.display = 'none'; document.getElementById('game-container').style.display = 'none';
}

function setGameMode(mode) {
  gameMode = mode; initCharCards(); p1Selected = p2Selected = p3Selected = null;
  document.getElementById('main-home-screen').style.display = 'none'; document.getElementById('mode-select-screen').style.display = 'none';
  document.getElementById('char-select-screen').style.display = 'flex';
  document.getElementById('p3-ui-box').style.display = (mode === 3) ? 'flex' : 'none';
  document.getElementById('selection-status').innerText = mode === 4 ? "연습할 영웅을 고르세요!" : "1P 대기중... 영웅을 고르세요";
}

function goToMainHome() {
  gameActive = isCountingDown = false; if (countdownIntervalId) clearInterval(countdownIntervalId);
  p1Selected = p2Selected = p3Selected = null;
  balls = []; particles = []; bullets = []; groundSlamAreas = []; craters = []; soundwaves = []; textPopups = []; fanAttackPreviews = [];
  customGrabs = []; burrowPreviews = []; dogPuddles = []; activeDonations = []; earthquakes = []; parkSwords = []; simonProjectiles = [];
  dominicProjectiles = []; seqLaserBullets = []; darkBombThreats = []; monkeyRains = [];
  setGameSpeed(1.0); ctx.clearRect(0, 0, canvas.width, canvas.height);
  ['char-select-screen', 'mode-select-screen', 'game-container', 'countdown-overlay', 'result-screen'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('main-home-screen').style.display = 'flex';
}

function selectCharacter(char) {
  if (gameMode === 4) {
    p1Selected = char; p2Selected = { id: 99, name: "🤖 훈련용 봇", nickname: "샌드백", class: "tanker", color: "#888888", maxHp: 99999, radius: 25, speed: 0, bumpDmg: 0 };
    playSelectImpact(char.color); setTimeout(startBattle, 400); return;
  }
  if (!p1Selected) { p1Selected = char; playSelectImpact(char.color); document.getElementById('selection-status').innerText = "2P 대기중... 영웅을 고르세요"; }
  else if (!p2Selected) { p2Selected = char; playSelectImpact(char.color); if (gameMode === 2) setTimeout(startBattle, 400); else document.getElementById('selection-status').innerText = "3P 대기중... 영웅을 고르세요"; }
  else if (gameMode === 3 && !p3Selected) { p3Selected = char; playSelectImpact(char.color); setTimeout(startBattle, 400); }
}

function playSelectImpact(color) {
  flashBgColor = color; shakeTime = 12; shakeIntensity = 8; setTimeout(() => flashBgColor = null, 120);
}

// ==========================================
// [엔티티 클래스 정의]
// ==========================================
class TextPopup {
  constructor(x, y, text, isHeal = false, colorOverride = null) {
    this.x = x + rand(-20, 20); this.y = y - 15 - rand(0, 25);
    this.text = text; this.isHeal = isHeal; this.life = 55; this.vy = -0.8; this.alpha = 1;
    this.colorOverride = colorOverride; // 실드 파괴 등 커스텀 컬러를 위한 추가 옵션
  }
  update() { this.y += this.vy * gameSpeed; this.life -= gameSpeed; if (this.life < 20) this.alpha -= (1 / 20) * gameSpeed; }
  draw() {
    if (this.alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.colorOverride ? this.colorOverride : (this.isHeal ? "#2ed573" : (this.text.includes("어지러움") ? "#f1c40f" : "#ff3838"));
    ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.shadowBlur = 6; ctx.shadowColor = "#000"; ctx.fillText(this.text, this.x, this.y); ctx.restore();
  }
}

class Particle {
  constructor(x, y, color, type = 'sharp') {
    this.x = x; this.y = y; this.type = type; this.color = color; this.alpha = 1;
    const angle = rand(0, PI2), speed = type === 'sharp' ? rand(4, 11) : rand(1, 3);
    this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
    this.life = type === 'sharp' ? 35 : 25; this.size = rand(2, 6);
  }
  update() {
    if (this.type === 'burn') { this.vy -= 0.15 * gameSpeed; this.vx += rand(-0.2, 0.2) * gameSpeed; }
    this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed; this.alpha -= (1 / this.life) * gameSpeed;
  }
  draw() {
    if (this.alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.beginPath();
    if (this.type === 'sharp') { ctx.moveTo(this.x, this.y - this.size); ctx.lineTo(this.x + this.size * 1.5, this.y + this.size); ctx.lineTo(this.x - this.size * 1.5, this.y + this.size); }
    else { ctx.shadowBlur = 8; ctx.shadowColor = this.color; ctx.arc(this.x, this.y, this.size, 0, PI2); }
    ctx.fill(); ctx.restore();
  }
}

class Bullet {
  constructor(x, y, vx, vy, text, color, damage, pIndex, type = 'normal') {
    Object.assign(this, { x, y, vx, vy, text, color, damage, ownerIndex: pIndex, type });
    this.radius = type === 'elephant' ? 25 : type === 'ink_slash' ? 14 : type === 'dog_charm' ? 16 : type === 'giga_gun' ? 8 : (type.startsWith('ink') || type === 'dark_assassinate' || type === 'dark_bomb' ? 12 : type === 'laser_bullet' ? 6 : type === 'pistol_bullet' ? 4 : type === 'rifle_bullet' ? 3 : type === 'sniper_bullet' ? 7 : (type === 'homing_orb' || type === 'magic_orb' ? 8 : (type.startsWith('food_') ? 20 : 16.2)));
    this.life = type === 'ink_slash' ? 45 : 240; this.angle = Math.atan2(vy, vx);
  }
  update() { 
    this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed; this.life -= gameSpeed; 
  }
  draw() {
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
    if (this.type === 'ink_slash') {
      ctx.fillStyle = "rgba(234, 32, 192, 0.95)"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff";
      ctx.beginPath(); ctx.moveTo(25, 0); ctx.quadraticCurveTo(0, -10, -20, -4); ctx.quadraticCurveTo(-5, 0, -20, 4); ctx.quadraticCurveTo(0, 10, 25, 0); ctx.fill(); ctx.stroke();
    } else if (this.type === 'ink_mark') {
      ctx.fillStyle = "#ff00ff"; ctx.fillRect(-12, -3, 16, 6); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(4, -4); ctx.lineTo(20, 0); ctx.lineTo(4, 4); ctx.fill();
    } else if (this.type === 'laser_bullet' || this.type === 'dark_assassinate' || this.type === 'dark_bomb') {
      ctx.fillStyle = this.type === 'laser_bullet' ? "#ff4757" : (this.type === 'dark_bomb' ? "#111122" : "#4a154b");
      ctx.strokeStyle = this.type === 'laser_bullet' ? "#ffffff" : (this.type === 'dark_bomb' ? "#741b7c" : "#9b59b6");
      ctx.lineWidth = this.type === 'dark_bomb' ? 3 : (this.type === 'dark_assassinate' ? 2 : 1.5);
      ctx.shadowBlur = this.type === 'dark_bomb' ? 20 : (this.type === 'dark_assassinate' ? 15 : 12);
      ctx.shadowColor = this.type === 'laser_bullet' ? "#ff4757" : (this.type === 'dark_bomb' ? "#9b59b6" : "#741b7c");
      ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, PI2); ctx.fill(); ctx.stroke();
      if (this.type === 'dark_assassinate') { ctx.fillStyle = "#ffffff"; ctx.font = "9px sans-serif"; ctx.textAlign = "center"; ctx.fillText("죽음", 0, 3); }
    } else if (this.type === 'elephant') {
      ctx.fillStyle = this.color; ctx.font = "40px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(this.text, 0, 0);
    } else if (this.type === 'pistol_bullet') {
      ctx.fillStyle = this.color; ctx.shadowBlur = 5; ctx.shadowColor = this.color; ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, PI2); ctx.fill();
    } else if (this.type === 'rifle_bullet') {
      ctx.fillStyle = this.color; ctx.shadowBlur = 5; ctx.shadowColor = this.color; ctx.fillRect(-this.radius, -this.radius / 2, this.radius * 2, this.radius);
    } else if (this.type === 'sniper_bullet') {
      ctx.fillStyle = this.color; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
      ctx.beginPath(); ctx.moveTo(this.radius, 0); ctx.lineTo(-this.radius, this.radius * 0.7); ctx.lineTo(-this.radius, -this.radius * 0.7); ctx.fill(); ctx.stroke();
    } else if (this.type === 'giga_gun') {
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#b339a3"; ctx.lineWidth = 2; ctx.shadowBlur = 8; ctx.shadowColor = "#ff00ff";
      ctx.beginPath(); ctx.ellipse(0, 0, this.radius, this.radius/2, 0, 0, PI2); ctx.fill(); ctx.stroke();
    } else if (this.type === 'homing_orb' || this.type === 'magic_orb') {
      ctx.fillStyle = "#ff9ff3"; ctx.shadowBlur = 15; ctx.shadowColor = "#ff9ff3";
      ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, PI2); ctx.fill();
    } else if (this.type === 'food_spinach') {
      ctx.fillStyle = "#2ecc71"; ctx.shadowBlur = 8; ctx.shadowColor = "#2ecc71";
      ctx.beginPath(); ctx.ellipse(0, 0, 24, 12, 0, 0, PI2); ctx.fill();
      ctx.strokeStyle = "#27ae60"; ctx.stroke();
    } else if (this.type === 'food_kimchi') {
      ctx.fillStyle = "#e74c3c"; ctx.shadowBlur = 8; ctx.shadowColor = "#e74c3c";
      ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, -12); ctx.lineTo(20, 12); ctx.lineTo(-20, 12); ctx.closePath(); ctx.fill();
    } else if (this.type === 'food_mushroom') {
      ctx.fillStyle = "#ecf0f1"; ctx.fillRect(-6, 0, 12, 16);
      ctx.fillStyle = "#8e44ad"; ctx.beginPath(); ctx.arc(0, 0, 18, Math.PI, PI2); ctx.fill();
    } else {
      ctx.fillStyle = this.color; ctx.font = "bold 13px sans-serif"; ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.textAlign = "center"; ctx.fillText(this.text, 0, 5);
    }
    ctx.restore();
  }
}

class Ball {
  constructor(x, y, data, pIndex, isClone = false, master = null) {
    Object.assign(this, { x, y, id: data.id, pIndex, isClone, master, vx: 0, vy: 0, angle: rand(0, PI2) });
    this.radius = data.radius; this.color = isClone ? "rgba(74, 21, 124, 0.65)" : data.color;
    this.fullName = data.name; this.nickname = isClone ? "분신" : data.nickname; this.originalNickname = this.nickname;
    this.maxHp = isClone ? 10 : data.maxHp; this.hp = this.maxHp;
    this.bumpDmg = isClone ? 5 : data.bumpDmg; this.originalBumpDmg = this.bumpDmg;
    this.baseSpeed = isClone ? data.speed * 1.3 : data.speed;
    
    // 각종 타이머 및 상태 초기화
    Object.assign(this, {
      currentSkillStep: 1, skillTimer: 0, isCharging: false, eatReady: false, swallowedBall: null, swallowTimer: 0, eatDmgCount: 0,
      electricDuration: 0, burnDuration: 0, woundDuration: 0, slowDuration: 0, darkDebuffTimer: 0, isSlamCharging: false,
      parkCycleIdx: 0, divineTimer: 0, divinePauseTimer: 0, isFaceCharging: false, faceTargetAngle: 0, weakDebuffTimer: 0,
      isPhase2: !!data.startAsPhase2, isTransforming: false, transformTimer: 0, tvBeamActive: false, tvBeamTimer: 0, tvBeamAngle: 0,
      isGrabbed: false, isMovingToCenter: false, wasHitByWindRush: false, isInkSpinning: false, inkSpinAngle: 0, markedTargetId: null,
      isInkPulling: false, inkPullTimer: 0, beamCycleId: 0, laserHitBeams: {}, isBurrowed: false, isBurrowInAnimation: false,
      burrowAnimTimer: 45, burrowScale: 1, burrowTimer: 0, burrowTargetX: 0, burrowTargetY: 0, isGunwooEmerging: false, gunwooEmergeTimer: 0,
      voiceLaserActive: false, voiceLaserTimer: 0, voiceLaserAngleFixed: 0, laserFadeTimer: 0, laserSegments: null, deathSequenceTimer: 0,
      isDeadCompletely: false, dizzyTimer: 0, isTeleportStabbing: false, totalDamageTaken: 0, donationPendingSkill: null, donationTimer: 0,
      hackDebuffTimer: 0, hackBombTimer: 0, geminiLaserActive: false, geminiLaserTimer: 0, geminiLaserTarget: null, gongLaserActive: false,
      gongLaserTimer: 0, gongLaserAngle: 0, gongLaserHits: {}, gunwooGauge: 0, enhancedLaser: false, enhancedBurrow: false, monkeyRunState: 0,
      monkeyRunTimer: 0, monkeyLaps: 0, monkeyBuffTimer: 0, elephantWallBangReady: 0, elephantWallBangAttacker: null, passiveAuraRadius: 71.5,
      auraCharmUpTimer: 0, auraHealTimer: 0, auraDmgTick: 0, selfHealTick: 0, flamethrowerState: 0, flamethrowerTimer: 0, flamethrowerAngle: 0,
      gigaBeamAimTimer: 0, gigaBeamActiveTimer: 0, gigaBeamAngle: 0, gigaDashAimTimer: 0, gigaDashActive: false, gigaDashAngle: 0, gigaBounceCount: 0, gigaDashHits: {},
      gigaBladeAimTimer: 0, gigaBladeActiveTimer: 0, gigaBladeAngle: 0, shieldHp: 0, wandAnimTimer: 0, cdPauseTimer: 0, lionRoarAimTimer: 0, lionRoarActiveTimer: 0, lionRoarAngle: 0
    });

    if (this.isPhase2) { this.fullName = "🔥 각성 최해솔"; this.nickname = "최해솔"; this.color = "#ff4757"; }
    if (this.id === 12) {
      this.pilduLevel = 1; this.pilduUpgradeTimer = 20 * 60; this.pilduAuraRadius = 65;
      this.turrets = {
        pistolL: { cd: 0, maxCd: 90, type: 'pistol' }, pistolR: { cd: 0, maxCd: 90, type: 'pistol' },
        rifleU: { cd: 0, maxCd: 60, type: 'rifle' }, rifleD: { cd: 0, maxCd: 60, type: 'rifle' },
        sniper1: { cd: 0, maxCd: 90, type: 'sniper' }, sniper2: { cd: 0, maxCd: 90, type: 'sniper' },
        sniper3: { cd: 0, maxCd: 90, type: 'sniper' }, sniper4: { cd: 0, maxCd: 90, type: 'sniper' }
      };
    }
  }

  launch() {
    if (this.id === 99) return;
    this.angle = rand(0, PI2); this.vx = Math.cos(this.angle) * this.baseSpeed; this.vy = Math.sin(this.angle) * this.baseSpeed;
    this.setNextSkillCooldown();
  }

  setNextSkillCooldown() {
    if (this.isClone || this.id === 99) { this.skillTimer = 99999; return; }
    this.skillTimer = this.getMaxCooldown();
    this.isCharging = this.isSlamCharging = this.isFaceCharging = false;
  }

  getMaxCooldown() {
    const s = this.currentSkillStep;
    switch(this.id) {
      case 0: return s === 1 ? 300 : (s === 2 ? 180 : 210);
      case 1: return s === 1 ? 180 : (s === 2 ? 210 : 240);
      case 2: const step = [1, 2, 3, 1, 2, 1, 2, 3][this.parkCycleIdx]; return step === 1 ? 210 : (step === 2 ? 360 : 120);
      case 3: return !this.isPhase2 ? 99999 : 240;
      case 4: return s === 1 ? 210 : (s === 2 ? 120 : 180);
      case 5: return s === 1 ? 240 : (s === 2 ? 300 : 240); // [신규 스킬: 사자후 쿨타임 반영]
      case 6: return s === 1 ? 240 : (s === 2 ? 240 : 120);
      case 8: return s === 1 ? 210 : (s === 2 ? 240 : 270);
      case 9: return 270;
      case 10: return s === 1 ? 180 : 240;
      case 11: return 240;
      case 12: return 99999;
      case 13: return s === 1 ? 210 : (s === 2 ? 240 : 210); 
      case 14: return 90;
      case 15: return s === 1 ? 210 : (s === 2 ? 240 : 210);
      default: return 240;
    }
  }

  forceCancelSkill() {
    this.isFaceCharging = this.isSlamCharging = this.eatReady = this.tvBeamActive = this.isInkSpinning = this.isInkPulling = this.voiceLaserActive = this.isBurrowInAnimation = this.isGunwooEmerging = this.isTeleportStabbing = this.gongLaserActive = false;
    this.burrowScale = 1; this.divinePauseTimer = this.donationTimer = this.monkeyRunState = this.elephantWallBangReady = this.flamethrowerState = 0;
    this.gigaBeamAimTimer = this.gigaBeamActiveTimer = this.gigaDashAimTimer = this.gigaBladeAimTimer = this.gigaBladeActiveTimer = 0; this.gigaDashActive = false;
    this.lionRoarAimTimer = this.lionRoarActiveTimer = 0; this.cdPauseTimer = 0;
    this.donationPendingSkill = null; processArr(fanAttackPreviews, p => p.owner === this);
  }

  applyDamage(amount, attacker = null) {
    if (this.hp <= 0 || amount <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed) return;
    
    if (this.shieldHp > 0) {
      let dmgToShield = Math.min(amount, this.shieldHp);
      this.shieldHp -= dmgToShield;
      amount -= dmgToShield;
      textPopups.push(new TextPopup(this.x, this.y, `방어 -${Math.ceil(dmgToShield)}`, false, "#74b9ff"));
      if (this.shieldHp <= 0) {
         spawnParticles(this.x, this.y, "#74b9ff", 'sharp', 15);
      }
    }
    if (amount <= 0) return;

    if (attacker && attacker.burnDuration > 0) amount *= 0.85;
    if (attacker && (attacker.id === 2 || attacker.id === 9) && attacker.divineTimer > 0) amount *= 1.25;
    if (attacker && attacker.hackDebuffTimer > 0) amount *= 0.7;
    if (this.id === 0) amount *= 0.9;
    if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) amount *= 0.8;
    if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) amount *= 0.7;
    if (this.darkDebuffTimer > 0) amount *= 1.2;
    if (this.monkeyBuffTimer > 0) amount *= 1.3;
    
    if (this.id === 99) { this.totalDamageTaken += amount; textPopups.push(new TextPopup(this.x, this.y, '-' + Math.ceil(amount), false)); return; }
    
    this.hp = Math.max(0, this.hp - amount);
    textPopups.push(new TextPopup(this.x, this.y, '-' + Math.ceil(amount), false));
    
    if (this.hp <= 0) {
      if (this.isClone) {
        if (this.master && this.master.hp > 0) {
          this.master.applyHeal(10);
          spawnParticles(this.x, this.y, "rgba(147, 112, 219, 0.6)", 'burn', 10);
          for (let k = 0; k < 5; k++) setTimeout(() => { if (this.master && this.master.hp > 0) particles.push(new Particle(this.x + (this.master.x - this.x) * (k / 5), this.y + (this.master.y - this.y) * (k / 5), "#9b59b6", 'sharp')); }, k * 80);
        }
        this.isDeadCompletely = true; return;
      }
      if (this.id === 13) {
        createShockwave(this.x, this.y, 100, "#bdc3c7");
        spawnParticles(this.x, this.y, "#ff4500", 'sharp', 30);
        shakeTime = 20; shakeIntensity = 10;
        this.id = 14; this.maxHp = 50; this.hp = 50; this.color = "#b339a3"; this.radius = 16;
        this.fullName = "🔫 김가은(기가은)"; this.nickname = "김가은"; this.originalNickname = "김가은";
        this.baseSpeed = 1.8; this.bumpDmg = 0; this.originalBumpDmg = 0;
        this.forceCancelSkill(); this.currentSkillStep = 1; this.setNextSkillCooldown(); this.launch(); return;
      }
      if (this.id === 3 && !this.isPhase2) { this.hp = 1; this.isMovingToCenter = true; this.vx = this.vy = 0; return; }
      else if (this.deathSequenceTimer === 0) { this.deathSequenceTimer = 120; this.vx = this.vy = 0; }
    }
    balls.forEach(att => { if (att.id === 4 && att.markedTargetId === this.pIndex && att.hp > 0 && !att.isClone) att.applyHeal(5); });
  }

  applyHeal(amount) {
    if (this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    textPopups.push(new TextPopup(this.x, this.y, '+' + amount, true));
  }

  getNearestEnemy() {
    let near = null, minDist = Infinity;
    getValidEnemies(this).forEach(b => { let d = getObjDist(this, b); if (d < minDist) { minDist = d; near = b; } });
    return near;
  }

  getOriginalEnemyTarget() {
    const enemies = getValidEnemies(this);
    return enemies.length > 0 ? enemies[Math.floor(Math.random() * enemies.length)] : null;
  }

  executeDonationSkill() {
    if (this.hp <= 0 || this.isSwallowed() || this.isTransforming || this.isMovingToCenter || this.isGrabbed || this.isTeleportStabbing) return;
    const skill = this.donationPendingSkill; this.donationPendingSkill = null;
    const target = this.getNearestEnemy();
    const launchAngle = target ? getObjAngle(this, target) : this.angle;
    
    switch(skill) {
      case 'eat':
        this.eatReady = true; this.eatDmgCount = 0;
        setTimeout(() => { if (this.hp > 0 && !this.swallowedBall && this.eatReady) { this.eatReady = false; this.vx = Math.cos(this.angle) * this.baseSpeed; this.vy = Math.sin(this.angle) * this.baseSpeed; } }, 3500 / gameSpeed);
        break;
      case 'simon':
        simonProjectiles.push({ x: this.x, y: this.y, vx: Math.cos(launchAngle)*5.5, vy: Math.sin(launchAngle)*5.5, text: "사이먼도미닉", color: "#2ed573", ownerIndex: this.pIndex, radius: 18, life: 120 });
        break;
      case 'sword':
        for(let i=0; i<4; i++) {
          const ox = i % 2 === 0 ? -30 : 30, oy = i < 2 ? -30 : 30;
          parkSwords.push({ owner: this, x: this.x + ox, y: this.y + oy, offsetX: ox, offsetY: oy, timer: 60 + (i * 15), state: 'wait', damage: 7, vx: 0, vy: 0, angle: -PI/4 });
          spawnImpactEffect(this.x + ox, this.y + oy, "#00ffff");
        }
        break;
      case 'dog':
        bullets.push(new Bullet(this.x, this.y, Math.cos(launchAngle)*8, Math.sin(launchAngle)*8, "🐕", "#8B4513", 5, this.pIndex, 'dog_charm'));
        break;
      case 'laser':
        this.voiceLaserActive = true; this.voiceLaserTimer = 180; this.voiceLaserAngleFixed = rand(0, PI2);
        break;
      case 'divine':
        this.divineTimer = 360; flashBgColor = "rgba(255, 255, 200, 0.4)"; setTimeout(() => flashBgColor = null, 100);
        break;
      case 'heal':
        this.applyHeal(40); spawnParticles(this.x, this.y, "#2ed573", 'sharp', 15);
        break;
    }
  }

  isSwallowed() { return balls.some(b => b.swallowedBall === this); }

  update() {
    if (this.isDeadCompletely) return;
    if (this.id === 99) { this.hp = this.maxHp; this.vx *= 0.85; this.vy *= 0.85; this.skillTimer = 99999; this.isCharging = false; }

    if (this.cdPauseTimer > 0) this.cdPauseTimer -= gameSpeed;

    if (this.donationTimer > 0) { this.donationTimer -= gameSpeed; if (this.donationTimer <= 0) this.executeDonationSkill(); }
    if (this.monkeyBuffTimer > 0) {
      this.monkeyBuffTimer -= gameSpeed; this.nickname = "🐵"; this.bumpDmg = 15;
      if (this.monkeyBuffTimer <= 0) { this.nickname = this.originalNickname; this.bumpDmg = this.originalBumpDmg; }
    }

    if (this.wandAnimTimer > 0) this.wandAnimTimer -= gameSpeed;

    if (this.darkDebuffTimer > 0) this.darkDebuffTimer -= gameSpeed;
    if (this.dizzyTimer > 0) this.dizzyTimer -= gameSpeed;
    if (this.hackDebuffTimer > 0) { this.hackDebuffTimer -= gameSpeed; if (Math.random() < 0.15) spawnParticles(this.x + rand(-15,15), this.y + rand(-15,15), "#00ff00", 'sharp', 1); }
    if (this.elephantWallBangReady > 0) this.elephantWallBangReady = Math.max(0, this.elephantWallBangReady - gameSpeed);

    if (this.hackBombTimer > 0) {
      this.hackBombTimer -= gameSpeed;
      if (this.hackBombTimer <= 0 && this.hp > 0) {
        this.applyDamage(20, null); this.hackDebuffTimer = 240; createShockwave(this.x, this.y, 40, "#00ff00");
        spawnParticles(this.x, this.y, "#00ff00", 'sharp', 20); textPopups.push(new TextPopup(this.x, this.y - 20, "해킹 완료!", false));
      }
    }
    if (this.geminiLaserTimer > 0) {
      this.geminiLaserTimer -= gameSpeed;
      if (this.geminiLaserTarget && this.geminiLaserTarget.hp <= 0) this.geminiLaserTarget = null;
    }

    if (this.flamethrowerState > 0) {
      this.vx = this.vy = 0; this.flamethrowerTimer -= gameSpeed;
      if (this.flamethrowerState === 1 && this.flamethrowerTimer <= 0) { 
        this.flamethrowerState = 2; this.flamethrowerTimer = 120; shakeTime = 20; shakeIntensity = 10; 
      }
      else if (this.flamethrowerState === 2) {
        for(let p=0; p<4; p++) {
          if (Math.random() < 0.9 * gameSpeed) {
            let fAng = this.flamethrowerAngle + rand(-PI/6, PI/6);
            let fDist = rand(15, size * 1.5);
            let color = Math.random() < 0.3 ? "#fff700" : (Math.random() < 0.6 ? "#ff4500" : "#ff0000");
            let pt = new Particle(this.x + Math.cos(fAng)*fDist, this.y + Math.sin(fAng)*fDist, color, 'burn');
            pt.size = rand(5, 15);
            pt.vx = Math.cos(fAng) * rand(3, 8);
            pt.vy = Math.sin(fAng) * rand(3, 8);
            particles.push(pt);
          }
        }
        
        getValidEnemies(this).forEach(e => {
          let dx = e.x - this.x, dy = e.y - this.y, dist = Math.hypot(dx, dy);
          if (dist <= size * 1.5) {
            let angDiff = Math.abs(Math.atan2(dy, dx) - this.flamethrowerAngle);
            if (angDiff > Math.PI) angDiff = 2 * Math.PI - angDiff;
            if (angDiff <= Math.PI/6 + 0.1) {
              e.applyDamage((10/60) * gameSpeed, this);
              if (e.burnDuration <= 0) e.burnDuration = 180;
            }
          }
        });
        
        if (this.flamethrowerTimer <= 0) { 
          this.flamethrowerState = 0; this.currentSkillStep = 3; this.setNextSkillCooldown(); 
          let mAng = rand(0, PI2); this.vx = Math.cos(mAng) * this.baseSpeed; this.vy = Math.sin(mAng) * this.baseSpeed; 
        }
      }
    }

    if (this.id === 13) {
      if (this.gigaBeamAimTimer > 0) {
        this.gigaBeamAimTimer -= gameSpeed; this.vx = this.vy = 0;
        let aimTarget = this.getNearestEnemy();
        if (aimTarget) { this.gigaBeamAngle = getObjAngle(this, aimTarget); }
        if (this.gigaBeamAimTimer <= 0) { this.gigaBeamActiveTimer = 120; shakeTime = 15; shakeIntensity = 8; flashBgColor = "rgba(189, 195, 199, 0.3)"; setTimeout(() => flashBgColor = null, 50); }
        return;
      }
      if (this.gigaBeamActiveTimer > 0) {
        this.gigaBeamActiveTimer -= gameSpeed; this.vx = this.vy = 0;
        let aimTarget = this.getNearestEnemy();
        if (aimTarget) {
          // [밸런스 패치 적용] 레이저 추적 회전 로직 연동
          let targetAngle = getObjAngle(this, aimTarget);
          let diff = targetAngle - this.gigaBeamAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          let turnSpeed = 0.02 * gameSpeed; // 추적 회전 속도 (기존 0.015에서 소폭 상향)
          if (Math.abs(diff) < turnSpeed) {
            this.gigaBeamAngle = targetAngle;
          } else {
            this.gigaBeamAngle += (diff > 0 ? turnSpeed : -turnSpeed);
          }
        }
        // [밸런스 패치 적용] 기가은 1스킬 초당 12데미지로 변경
        let dps = 12 / 60 * gameSpeed;
        getValidEnemies(this).forEach(e => {
          let dx = e.x - this.x, dy = e.y - this.y, dot = dx * Math.cos(this.gigaBeamAngle) + dy * Math.sin(this.gigaBeamAngle);
          let perp = Math.abs(dx * Math.sin(this.gigaBeamAngle) - dy * Math.cos(this.gigaBeamAngle));
          if (dot > 0 && perp < 56.25 + e.radius && dot < size * 2) { e.applyDamage(dps, this); if(Math.random()<0.2) spawnParticles(e.x, e.y, "#bdc3c7", 'sharp', 1); }
        });
        if (this.gigaBeamActiveTimer <= 0) { this.launch(); }
        return;
      }
      if (this.gigaDashAimTimer > 0) {
        this.gigaDashAimTimer -= gameSpeed; this.vx = this.vy = 0;
        if (this.gigaDashAimTimer <= 0) { 
          this.gigaDashActive = true; 
          this.gigaBounceCount = 6; 
          this.gigaDashHits = {}; 
          this.vx = Math.cos(this.gigaDashAngle) * 20; 
          this.vy = Math.sin(this.gigaDashAngle) * 20; 
          spawnParticles(this.x, this.y, "#bdc3c7", 'sharp', 20); 
        }
        return;
      }
      if (this.gigaDashActive) {
        getValidEnemies(this).forEach(e => {
          if (getObjDist(this, e) <= this.radius + e.radius + 5) {
            if (!this.gigaDashHits[e.pIndex]) { 
              e.applyDamage(15, this); e.applyKnockback(this.x, this.y, 10); 
              this.gigaDashHits[e.pIndex] = true; spawnImpactEffect(e.x, e.y, "#bdc3c7"); 
            }
          }
        });
      }
      if (this.gigaBladeAimTimer > 0) {
        this.gigaBladeAimTimer -= gameSpeed; this.vx = this.vy = 0;
        if (this.gigaBladeAimTimer <= 0) {
          this.gigaBladeActiveTimer = 15; shakeTime = 20; shakeIntensity = 12;
          getValidEnemies(this).forEach(e => {
            let dx = e.x - this.x, dy = e.y - this.y;
            if (Math.hypot(dx, dy) <= 250 + e.radius) {
              let angDiff = Math.abs(Math.atan2(dy, dx) - this.gigaBladeAngle);
              if (angDiff > Math.PI) angDiff = 2 * Math.PI - angDiff;
              if (angDiff <= 50 * Math.PI / 180) {
                e.applyDamage(10, this); e.electricDuration = 180; spawnImpactEffect(e.x, e.y, "#00ffff");
              }
            }
          });
        }
        return;
      }
      if (this.gigaBladeActiveTimer > 0) {
        this.gigaBladeActiveTimer -= gameSpeed; this.vx = this.vy = 0;
        if (this.gigaBladeActiveTimer <= 0) { this.launch(); }
        return;
      }
    }

    // [신규 스킬: 김건우 사자후 업데이트 로직]
    if (this.id === 5) {
      if (this.lionRoarAimTimer > 0) {
        this.lionRoarAimTimer -= gameSpeed; this.vx = this.vy = 0;
        if (this.lionRoarAimTimer <= 0) {
          this.lionRoarActiveTimer = 150; // 2.5초 활성화
          shakeTime = 15; shakeIntensity = 8;
          flashBgColor = "rgba(230, 126, 34, 0.3)"; setTimeout(() => flashBgColor = null, 50);
        }
      } else if (this.lionRoarActiveTimer > 0) {
        this.lionRoarActiveTimer -= gameSpeed; this.vx = this.vy = 0;
        
        // 사자후 입자 이펙트 출력
        for (let i = 0; i < 2; i++) {
          if (Math.random() < 0.8 * gameSpeed) {
            let fAng = this.lionRoarAngle + rand(-Math.PI/4, Math.PI/4);
            let fDist = rand(20, size * 1.5);
            let pt = new Particle(this.x + Math.cos(fAng)*fDist, this.y + Math.sin(fAng)*fDist, "#e67e22", 'burn');
            pt.size = rand(8, 16);
            pt.vx = Math.cos(fAng)*rand(6, 12); pt.vy = Math.sin(fAng)*rand(6, 12);
            particles.push(pt);
          }
        }
        
        let dps = 15 / 60 * gameSpeed;
        getValidEnemies(this).forEach(e => {
          let dx = e.x - this.x, dy = e.y - this.y;
          let dist = Math.hypot(dx, dy);
          if (dist <= size * 1.5) {
            let angDiff = Math.abs(Math.atan2(dy, dx) - this.lionRoarAngle);
            if (angDiff > Math.PI) angDiff = 2 * Math.PI - angDiff;
            if (angDiff <= Math.PI/4 + 0.1) { // 90도 부채꼴 판정
              e.applyDamage(dps, this);
              e.cdPauseTimer = 2; // 적 스킬 쿨타임 실시간 정지 디버프 적용 (2프레임 갱신)
              if (Math.random() < 0.1) spawnParticles(e.x, e.y, "#e67e22", 'sharp', 1);
            }
          }
        });
        
        if (this.lionRoarActiveTimer <= 0) {
          this.currentSkillStep = 1; this.setNextSkillCooldown(); this.launch();
        }
      }
    }

    if (this.id === 8 && this.hp > 0 && !this.isBurrowed && !this.isDeadCompletely && !this.isMovingToCenter && !this.isTransforming && !this.isSwallowed()) {
      if (this.auraCharmUpTimer > 0) this.auraCharmUpTimer -= gameSpeed;
      if (this.auraHealTimer > 0) {
        this.auraHealTimer -= gameSpeed; this.selfHealTick -= gameSpeed;
        if (this.selfHealTick <= 0) { this.selfHealTick = 60; this.applyHeal(5); if (Math.random() < 0.5) spawnParticles(this.x+rand(-10,10), this.y+rand(-10,10), "#2ed573", 'sharp', 1); }
      } else this.selfHealTick = 0;
      // [밸런스 패치 적용] 차은우지성 장판 범위 30% 증가 (기존 55 -> 71.5, 110 -> 143)
      this.passiveAuraRadius = this.auraCharmUpTimer > 0 ? 143 : 71.5;
      this.auraDmgTick -= gameSpeed;
      if (this.auraDmgTick <= 0) {
        this.auraDmgTick = 60 / (this.auraHealTimer > 0 ? 5 : 12);
        getValidEnemies(this).forEach(e => { if (getObjDist(e, this) <= this.passiveAuraRadius + e.radius) e.applyDamage(1, this); });
      }
    }

    if (this.id === 12 && this.hp > 0 && !this.isBurrowed && !this.isDeadCompletely && !this.isMovingToCenter && !this.isTransforming && !this.isSwallowed()) {
      if (this.pilduLevel === 1) {
        this.pilduUpgradeTimer -= gameSpeed;
        if (this.pilduUpgradeTimer <= 0) { this.pilduLevel = 2; this.pilduAuraRadius = 110; this.pilduUpgradeTimer = 30 * 60; createShockwave(this.x, this.y, 110, "#f39c12"); textPopups.push(new TextPopup(this.x, this.y - 20, "무장 요새!", false)); spawnParticles(this.x, this.y, "#f39c12", 'sharp', 20); }
      } else if (this.pilduLevel === 2) {
        this.pilduUpgradeTimer -= gameSpeed;
        if (this.pilduUpgradeTimer <= 0) { this.pilduLevel = 3; this.pilduAuraRadius = 150; createShockwave(this.x, this.y, 150, "#e74c3c"); textPopups.push(new TextPopup(this.x, this.y - 20, "무장 성채!", false)); spawnParticles(this.x, this.y, "#e74c3c", 'sharp', 30); }
      }
      
      let target = null, minDist = Infinity;
      getValidEnemies(this).forEach(b => { let d = getObjDist(b, this); if(d <= this.pilduAuraRadius + b.radius && d < minDist) { minDist = d; target = b; } });

      const fireTurret = (tKey, tX, tY, dmg, speed, bType, color) => {
        let t = this.turrets[tKey]; if (t.cd > 0) t.cd -= gameSpeed;
        if (t.cd <= 0 && target) { t.cd = t.maxCd; let ang = getAngle(tX, tY, target.x, target.y); bullets.push(new Bullet(tX, tY, Math.cos(ang)*speed, Math.sin(ang)*speed, "", color, dmg, this.pIndex, bType)); particles.push(new Particle(tX + Math.cos(ang)*10, tY + Math.sin(ang)*10, color, 'sharp')); }
      };

      const [cx, cy, r] = [this.x, this.y, this.pilduAuraRadius];
      fireTurret('pistolL', cx - r, cy, 3, 8, 'pistol_bullet', '#bdc3c7'); fireTurret('pistolR', cx + r, cy, 3, 8, 'pistol_bullet', '#bdc3c7');
      if (this.pilduLevel >= 2) { fireTurret('rifleU', cx, cy - r, 4, 12, 'rifle_bullet', '#f1c40f'); fireTurret('rifleD', cx, cy + r, 4, 12, 'rifle_bullet', '#f1c40f'); }
      if (this.pilduLevel >= 3) { let diag = r * 0.7071; fireTurret('sniper1', cx - diag, cy - diag, 7, 20, 'sniper_bullet', '#e74c3c'); fireTurret('sniper2', cx + diag, cy - diag, 7, 20, 'sniper_bullet', '#e74c3c'); fireTurret('sniper3', cx - diag, cy + diag, 7, 20, 'sniper_bullet', '#e74c3c'); fireTurret('sniper4', cx + diag, cy + diag, 7, 20, 'sniper_bullet', '#e74c3c'); }
    }

    if (this.id === 2 && this.divinePauseTimer > 0) {
      this.divinePauseTimer -= gameSpeed; this.vx = this.vy = 0; if (Math.random() < 0.4) spawnParticles(this.x + rand(-15,15), this.y - 40 - rand(0,25), "#fffacd", 'sharp', 1);
      if (this.divinePauseTimer <= 0) { this.divineTimer = 540; flashBgColor = "rgba(255, 255, 200, 0.4)"; setTimeout(() => flashBgColor = null, 100); this.setNextSkillCooldown(); let rAng = rand(0, PI2); this.vx = Math.cos(rAng)*this.baseSpeed; this.vy = Math.sin(rAng)*this.baseSpeed; }
    }

    if (this.id === 2 || this.id === 9) {
      if (this.divineTimer > 0) { this.divineTimer -= gameSpeed; this.bumpDmg = 10; if (Math.random() < 0.2) spawnParticles(this.x, this.y, "#ffff00", 'sharp', 1); }
      else if (this.id === 2 || this.id === 9) this.bumpDmg = 0;
    }

    if ((this.id === 0 || this.id === 9) && this.eatReady && this.hp > 0 && !this.swallowedBall) {
      for (let b of getValidEnemies(this)) {
        if (getObjDist(this, b) <= this.radius + 12 + b.radius) { this.swallowedBall = b; this.eatReady = false; this.swallowTimer = 120; this.eatDmgCount = 0; b.forceCancelSkill(); break; }
      }
    }

    if (this.id === 5 && this.isBurrowInAnimation) {
      this.vx = this.vy = 0; this.burrowAnimTimer -= gameSpeed; this.angle += 0.25 * gameSpeed; this.burrowScale = Math.max(0, this.burrowAnimTimer / 45);
      if (Math.random() < 0.4) spawnParticles(this.x, this.y, this.enhancedBurrow ? "#0077ff" : "#855e42", 'burn', 1);
      if (this.burrowAnimTimer <= 0) {
        this.isBurrowInAnimation = false; this.isBurrowed = true; this.burrowScale = 0; this.burrowTimer = 120; this.isGunwooEmerging = false;
        let target = this.getOriginalEnemyTarget();
        if (target) { this.burrowTargetX = target.x; this.burrowTargetY = target.y; }
        else { this.burrowTargetX = arenaLeft + this.radius + rand(0, arenaRight - arenaLeft - this.radius*2); this.burrowTargetY = arenaTop + this.radius + rand(0, arenaBottom - arenaTop - this.radius*2); }
      }
      return;
    }

    if (this.isBurrowed) {
      this.vx = this.vy = 0; this.burrowTimer -= gameSpeed;
      let target = this.getOriginalEnemyTarget();
      if (target && this.burrowTimer > 15 && !this.isGunwooEmerging) { this.burrowTargetX = target.x; this.burrowTargetY = target.y; }
      if (this.burrowTimer <= 30 && !this.isGunwooEmerging) { processArr(burrowPreviews, p => p.owner === this); burrowPreviews.push({ owner: this, x: this.burrowTargetX, y: this.burrowTargetY, radius: 65 }); }
      if (this.burrowTimer <= 0 && !this.isGunwooEmerging) { this.isGunwooEmerging = true; this.gunwooEmergeTimer = 30; }
      if (this.isGunwooEmerging) {
        this.gunwooEmergeTimer -= gameSpeed; if (Math.random() < 0.2) spawnParticles(this.burrowTargetX, this.burrowTargetY, this.enhancedBurrow ? "#00a8ff" : "#e67e22", 'burn', 1);
        if (this.gunwooEmergeTimer <= 0) {
          this.isGunwooEmerging = false; this.isBurrowed = false; this.burrowScale = 1; this.x = this.burrowTargetX; this.y = this.burrowTargetY;
          processArr(burrowPreviews, p => p.owner === this); flashBgColor = this.enhancedBurrow ? "rgba(0, 168, 255, 0.25)" : "rgba(230, 126, 34, 0.25)"; setTimeout(() => flashBgColor = null, 70); shakeTime = 25; shakeIntensity = 15;
          spawnParticles(this.x, this.y, this.enhancedBurrow ? "#0077ff" : "#8B4513", 'sharp', 15); spawnParticles(this.x, this.y, this.enhancedBurrow ? "#00a8ff" : "#A0522D", 'burn', 10); spawnParticles(this.x, this.y, this.enhancedBurrow ? "#00ffff" : "#e67e22", 'sharp', 20);
          let dmg = this.enhancedBurrow ? 30 : 20; if (this.weakDebuffTimer > 0) dmg = this.enhancedBurrow ? 15 : 10;
          getValidEnemies(this).forEach(e => { if (getObjDist(e, this) <= 65 + e.radius) { e.applyDamage(dmg, this); e.applyKnockback(this.x, this.y, 6.5); } });
          
          // [신규 스킬] 김건우 땅파기 후 스텝을 사자후 대기(3스텝)로 전환
          this.currentSkillStep = 3; this.setNextSkillCooldown(); this.launch();
        }
      }
      return;
    }

    if (this.isMovingToCenter) {
      let cx = size / 2, cy = size / 2, dx = cx - this.x, dy = cy - this.y, dist = Math.hypot(dx, dy), moveStep = 4.0 * gameSpeed;
      if (dist > moveStep) { this.x += (dx/dist)*moveStep; this.y += (dy/dist)*moveStep; this.angle += 0.06 * gameSpeed; if (Math.random() < 0.25) spawnParticles(this.x, this.y, "rgba(155, 89, 182, 0.4)", 'sharp', 1); }
      else {
        this.x = cx; this.y = cy; this.isMovingToCenter = false; this.isTransforming = true; this.transformTimer = 180;
        this.fullName = "🔥 각성 최해솔"; this.nickname = "최해솔"; this.color = "#ff4757";
        document.getElementById(`p${this.pIndex+1}-name`).innerText = `P${this.pIndex+1} 최해솔`; document.getElementById(`p${this.pIndex+1}-name`).style.color = "#ff4757";
        spawnParticles(this.x, this.y, "#9b59b6", 'sharp', 40); soundwaves.push({x: this.x, y: this.y, angle: 0, life: 60, radius: 10}, {x: this.x, y: this.y, angle: PI, life: 60, radius: 10}); shakeTime = 25; shakeIntensity = 12;
      }
      return;
    }

    if (this.id === 11 && this.monkeyRunState > 0) {
      if (this.monkeyRunState === 1) {
        this.monkeyRunTimer -= gameSpeed;
        if (this.monkeyRunTimer <= 0) { this.monkeyRunState = 2; this.x = arenaLeft + this.radius; this.y = arenaBottom - this.radius; this.monkeyLaps = 0; this.monkeyRunTimer = 0; }
        else { this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed; }
      } else if (this.monkeyRunState === 2) {
        let speedPerFrame = (2 * ((arenaRight - arenaLeft - 2*this.radius) + (arenaBottom - arenaTop - 2*this.radius))) / 60 * gameSpeed;
        let corners = [{x: arenaRight - this.radius, y: arenaBottom - this.radius}, {x: arenaRight - this.radius, y: arenaTop + this.radius}, {x: arenaLeft + this.radius, y: arenaTop + this.radius}, {x: arenaLeft + this.radius, y: arenaBottom - this.radius}];
        let targetCorner = corners[this.monkeyLaps % 4], dx = targetCorner.x - this.x, dy = targetCorner.y - this.y, dist = Math.hypot(dx, dy);
        if (dist <= speedPerFrame) { this.x = targetCorner.x; this.y = targetCorner.y; this.monkeyLaps++; if (this.monkeyLaps >= 12) { this.monkeyRunState = 0; this.launch(); } }
        else { this.x += (dx/dist)*speedPerFrame; this.y += (dy/dist)*speedPerFrame; }
        this.vx = this.vy = 0;
        getValidEnemies(this).forEach(t => {
          if (getObjDist(t, this) <= this.radius + t.radius + 10) {
            let key = t.pIndex + '_' + this.monkeyLaps; if (!this.gongLaserHits) this.gongLaserHits = {};
            if (!this.gongLaserHits[key]) { t.applyDamage(10, this); t.applyKnockback(this.x, this.y, 8); this.gongLaserHits[key] = true; createShockwave(t.x, t.y, 30, "#8B4513"); }
          }
        });
      }
      return;
    }

    if (this.isTransforming) {
      this.vx = this.vy = 0; this.tvBeamAngle += 0.02 * gameSpeed; checkLaserCollision(this, this.tvBeamAngle, 5); this.transformTimer -= gameSpeed;
      if (this.transformTimer <= 0) {
        this.isTransforming = false; this.isPhase2 = true; this.hp = this.maxHp = 200; this.bumpDmg = 0; this.currentSkillStep = 1; this.setNextSkillCooldown();
        this.angle = rand(0, PI2); this.vx = Math.cos(this.angle)*this.baseSpeed; this.vy = Math.sin(this.angle)*this.baseSpeed;
        spawnParticles(this.x, this.y, "#ff4757", 'sharp', 40); shakeTime = 30; shakeIntensity = 15;
      }
      return;
    }

    if (this.hp <= 0 && this.deathSequenceTimer > 0) {
      this.vx = this.vy = 0; this.deathSequenceTimer -= gameSpeed;
      if (this.deathSequenceTimer <= 0) { this.isDeadCompletely = true; spawnParticles(this.x, this.y, this.color, 'sharp', 30); shakeTime = 30; shakeIntensity = 15; flashBgColor = "rgba(255, 255, 255, 0.25)"; setTimeout(() => flashBgColor = null, 100); }
      return;
    }

    if (this.isSwallowed()) { let host = balls.find(b => b.swallowedBall === this); if (host) { this.x = host.x; this.y = host.y; } return; }
    if (isCountingDown) { this.angle += 0.05 * gameSpeed; return; }

    if (this.tvBeamActive) {
      this.tvBeamTimer -= gameSpeed; this.tvBeamAngle += 0.04 * gameSpeed; checkLaserCollision(this, this.tvBeamAngle, 7, true, true);
      if (this.tvBeamTimer <= 0) { this.tvBeamActive = false; this.currentSkillStep = 2; this.setNextSkillCooldown(); let randAng = rand(0, PI2); this.vx = Math.cos(randAng)*this.baseSpeed; this.vy = Math.sin(randAng)*this.baseSpeed; }
    }

    if (this.gongLaserActive) { this.gongLaserTimer -= gameSpeed; this.gongLaserAngle += 0.05 * gameSpeed; checkGongLaserCollision(this, this.gongLaserAngle); if (this.gongLaserTimer <= 0) { this.gongLaserActive = false; this.setNextSkillCooldown(); } }
    if ((this.id === 5 || this.id === 9) && this.voiceLaserActive) { 
      this.voiceLaserTimer -= gameSpeed; calculateVoiceLaser(this); 
      if (this.voiceLaserTimer <= 0) { 
        this.voiceLaserActive = false; this.laserFadeTimer = 30; 
        if (this.id === 5) { this.currentSkillStep = 2; this.setNextSkillCooldown(); } 
      } 
    }

    if (this.laserFadeTimer > 0) this.laserFadeTimer -= gameSpeed;
    if (this.weakDebuffTimer > 0) this.weakDebuffTimer -= gameSpeed;

    if (this.id === 4 && this.isInkPulling) {
      this.vx = this.vy = 0; this.inkPullTimer -= gameSpeed; this.inkSpinAngle += 0.3 * gameSpeed;
      if (Math.random() < 0.6) { let a = rand(0, PI2), d = rand(0, 170); spawnParticles(this.x + Math.cos(a)*d, this.y + Math.sin(a)*d, "#d488ff", 'sharp', 1); }
      let hitSelf = false;
      getValidEnemies(this).forEach(e => {
        let dx = this.x - e.x, dy = this.y - e.y, dist = Math.hypot(dx, dy);
        if (dist <= 170 + e.radius && dist > 10) { e.x += (dx/dist)*3.5*gameSpeed; e.y += (dy/dist)*3.5*gameSpeed; }
        if (dist <= this.radius + e.radius + 5) hitSelf = true;
      });
      if (this.inkPullTimer <= 0 || hitSelf) {
        this.isInkPulling = false; this.isInkSpinning = true; this.inkSpinAngle = 0; flashBgColor = "rgba(255, 0, 255, 0.2)"; setTimeout(() => flashBgColor = null, 60); shakeTime = 15; shakeIntensity = 10;
        let baseDmg = this.weakDebuffTimer > 0 ? 12.5 : 25;
        getValidEnemies(this).forEach(e => { if (getObjDist(e, this) <= 90 + e.radius) { e.applyDamage(baseDmg, this); e.applyKnockback(this.x, this.y, 8.5); } });
        spawnParticles(this.x + rand(-20,20), this.y + rand(-20,20), "#ff00ff", 'sharp', 25);
        this.currentSkillStep = 3; this.setNextSkillCooldown();
      }
    }
    if (this.id === 4 && this.isInkSpinning) { this.inkSpinAngle += 0.45 * gameSpeed; if (this.inkSpinAngle >= PI2) { this.isInkSpinning = false; this.inkSpinAngle = 0; } }

    this.handleStatusEffects();

    if (this.id === 99) { /* bot */ } 
    else if ((this.id === 2 && this.isFaceCharging) || (this.id === 2 && this.divinePauseTimer > 0) || this.isTeleportStabbing || ((this.id === 0 || this.id === 9) && this.swallowedBall) || this.isGrabbed || this.flamethrowerState > 0 || (this.id === 13 && (this.gigaBeamAimTimer > 0 || this.gigaBeamActiveTimer > 0 || this.gigaDashAimTimer > 0 || this.gigaBladeAimTimer > 0 || this.gigaBladeActiveTimer > 0)) || (this.id === 5 && (this.lionRoarAimTimer > 0 || this.lionRoarActiveTimer > 0))) { this.vx = this.vy = 0; }
    else if (!(this.id === 4 && this.isInkPulling) && this.monkeyRunState === 0) {
      let speed = this.baseSpeed;
      if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) speed *= 2.5;
      if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) speed *= 2.0;
      if (this.slowDuration > 0 || this.electricDuration > 0 || this.dizzyTimer > 0) speed *= 0.5;
      if (this.darkDebuffTimer > 0) speed *= 0.8;
      if (this.monkeyBuffTimer > 0) speed *= 3.5;
      if (this.id === 13 && this.gigaDashActive) speed = 20;
      
      let curVel = Math.hypot(this.vx, this.vy);
      if (curVel < speed && curVel > 0) { this.vx = (this.vx/curVel)*speed; this.vy = (this.vy/curVel)*speed; }
      else if (curVel === 0 && !this.isTransforming && !this.isMovingToCenter && !this.gigaDashActive) { this.angle = rand(0, PI2); this.vx = Math.cos(this.angle)*speed; this.vy = Math.sin(this.angle)*speed; }
    }

    this.x += this.vx * gameSpeed; this.y += this.vy * gameSpeed;
    if (Math.hypot(this.vx, this.vy) > 0) this.angle = Math.atan2(this.vy, this.vx);
    
    let hitWall = false, activeSpeed = this.baseSpeed;
    if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) activeSpeed *= 2.5;
    if (this.monkeyBuffTimer > 0) activeSpeed *= 3.5;
    if (this.id === 13 && this.gigaDashActive) activeSpeed = 20;
    let buffer = this.radius + 5;
    
    if (this.monkeyRunState === 0) {
      if (this.x - this.radius < arenaLeft) { this.x = arenaLeft + buffer; this.vx = Math.abs(this.vx); hitWall = true; }
      if (this.x + this.radius > arenaRight) { this.x = arenaRight - buffer; this.vx = -Math.abs(this.vx); hitWall = true; }
      if (this.y - this.radius < arenaTop) { this.y = arenaTop + buffer; this.vy = Math.abs(this.vy); hitWall = true; }
      if (this.y + this.radius > arenaBottom) { this.y = arenaBottom - buffer; this.vy = -Math.abs(this.vy); hitWall = true; }
    }

    if (hitWall) {
      if (this.id === 13 && this.gigaDashActive) {
        this.gigaBounceCount--; createShockwave(this.x, this.y, 40, "#bdc3c7");
        this.gigaDashHits = {}; 
        if (this.gigaBounceCount <= 0) { this.gigaDashActive = false; this.launch(); }
        else { let mag = Math.hypot(this.vx, this.vy); this.vx = (this.vx/mag)*20; this.vy = (this.vy/mag)*20; }
      } else {
        let mag = Math.hypot(this.vx, this.vy); if (mag > 0 && this.id !== 99) { this.vx = (this.vx/mag)*activeSpeed; this.vy = (this.vy/mag)*activeSpeed; }
      }
      spawnImpactEffect(this.x, this.y, this.woundDuration > 0 ? "#8b0000" : (this.burnDuration > 0 ? "#ff4500" : this.color), true);
      if (this.woundDuration > 0) { this.applyDamage(5, null); textPopups.push(new TextPopup(this.x, this.y, "상처!", false)); }
      if (this.wasHitByWindRush) { this.wasHitByWindRush = false; let bjs = balls.find(b => b.id === 2); this.applyDamage(bjs && bjs.weakDebuffTimer > 0 ? 2.5 : 5, bjs); shakeTime = 14; shakeIntensity = 8; spawnParticles(this.x, this.y, "#f1c40f", 'sharp', 8); }
      if (this.elephantWallBangReady > 0) { this.elephantWallBangReady = 0; this.applyDamage(10, this.elephantWallBangAttacker); textPopups.push(new TextPopup(this.x, this.y, "부딪힘!", false)); spawnImpactEffect(this.x, this.y, "#ffffff", true); }
    }

    if ((this.id === 0 || this.id === 9) && this.swallowedBall) {
      this.swallowTimer -= gameSpeed;
      if (this.swallowTimer <= 60 && this.eatDmgCount === 0) { this.swallowedBall.applyDamage(15, this); this.eatDmgCount = 1; }
      if (this.swallowTimer <= 0) { if (this.eatDmgCount === 1) { this.swallowedBall.applyDamage(15, this); this.eatDmgCount = 2; } this.spitOut(); }
    }

    // [밸런스 패치 적용] 사자후 디버프 중엔 쿨타임 증가 정지 (adjSkillSpeed = 0)
    let adjSkillSpeed = gameSpeed * ((this.darkDebuffTimer > 0 || this.dizzyTimer > 0 || this.hackDebuffTimer > 0) ? 0.5 : 1);
    if (this.cdPauseTimer > 0) adjSkillSpeed = 0; 

    if (this.skillTimer > 0 && !this.isGrabbed && !isCountingDown && !this.isSwallowed() && !this.isMovingToCenter && !this.isBurrowInAnimation && this.divinePauseTimer <= 0 && !this.isTeleportStabbing && this.id !== 99 && !this.gigaDashActive) {
      this.skillTimer -= adjSkillSpeed; if (this.skillTimer <= 0) this.triggerSkill();
    }
  }

  handleStatusEffects() {
    if (this.electricDuration > 0 && this.hp > 0) { let prev = this.electricDuration; this.electricDuration -= gameSpeed; if (Math.floor(prev/60) > Math.floor(this.electricDuration/60)) this.applyDamage(3, null); }
    if (this.burnDuration > 0 && this.hp > 0) { let prev = this.burnDuration; this.burnDuration -= gameSpeed; if (Math.floor(prev/60) > Math.floor(this.burnDuration/60)) this.applyDamage(2, null); if (Math.random() < 0.5 * gameSpeed) spawnParticles(this.x+rand(-8,8), this.y+rand(-8,8), "#ff4500", 'burn', 1); }
    if (this.woundDuration > 0 && this.hp > 0) { this.woundDuration -= gameSpeed; if (Math.random() < 0.6 * gameSpeed) spawnParticles(this.x+rand(-8,8), this.y+rand(-8,8), "#8b0000", 'sharp', 1); }
    if (this.slowDuration > 0) this.slowDuration -= gameSpeed;
  }
  
  triggerSkill() {
    if (this.isSwallowed() || this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isGrabbed || this.isTeleportStabbing || this.id === 99) { this.setNextSkillCooldown(); return; }
    this.isCharging = true;
    const target = this.getNearestEnemy(), stTargetAng = target ? getObjAngle(this, target) : this.angle;

    switch (this.id) {
      case 0:
        if (this.currentSkillStep === 1) { this.eatReady = true; this.eatDmgCount = 0; setTimeout(() => { if (this.hp>0 && !this.swallowedBall && this.eatReady) { this.eatReady = false; this.currentSkillStep = 2; this.setNextSkillCooldown(); this.vx = Math.cos(this.angle)*this.baseSpeed; this.vy = Math.sin(this.angle)*this.baseSpeed; } }, 5000/gameSpeed); }
        else if (this.currentSkillStep === 2) { this.isSlamCharging = true; groundSlamAreas.push({ timer: 60, owner: this, type: 'slam' }); setTimeout(() => { this.isSlamCharging = false; this.currentSkillStep = 3; this.setNextSkillCooldown(); }, 1000/gameSpeed); }
        else { bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*4, Math.sin(stTargetAng)*4, "🐘", "#aaaaaa", 15, this.pIndex, 'elephant')); this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 1:
        if (this.currentSkillStep === 1) { simonProjectiles.push({ x: this.x, y: this.y, vx: Math.cos(stTargetAng)*5.5, vy: Math.sin(stTargetAng)*5.5, text: "사이먼도미닉", color: "#2ed573", ownerIndex: this.pIndex, radius: 18, life: 120 }); this.currentSkillStep = 2; }
        else if (this.currentSkillStep === 2) { for(let k=0; k<6; k++) { let rX = rand(arenaLeft+25, arenaRight-25), rY = rand(arenaTop+25, arenaBottom-25), sAng = rand(0, PI2), sX = rX + Math.cos(sAng)*120, sY = rY + Math.sin(sAng)*120; dominicProjectiles.push({ x: sX, y: sY, tx: rX, ty: rY, vx: (rX-sX)/55, vy: (rY-sY)/55, text: k < 3 ? "사이먼" : "도미닉", color: "#00ffff", ownerIndex: this.pIndex, life: 55, isArrived: false, explosionTimer: 25 }); } this.currentSkillStep = 3; }
        else { this.gongLaserActive = true; this.gongLaserTimer = 180; this.gongLaserAngle = rand(0, PI2); this.gongLaserHits = {}; this.currentSkillStep = 1; }
        this.setNextSkillCooldown(); break;
      case 2:
        let pStep = [1, 2, 3, 1, 2, 1, 2, 3][this.parkCycleIdx];
        if (pStep === 1) { if (!target) { this.setNextSkillCooldown(); return; } this.parkCycleIdx = (this.parkCycleIdx+1)%8; this.currentSkillStep = 2; this.skillTimer = 210; for(let i=0; i<4; i++) { let ox = i%2===0?-30:30, oy = i<2?-30:30; parkSwords.push({ owner: this, x: this.x+ox, y: this.y+oy, offsetX: ox, offsetY: oy, timer: 60+(i*15), state: 'wait', damage: 7, vx: 0, vy: 0, angle: -PI/4 }); spawnImpactEffect(this.x+ox, this.y+oy, "#00ffff"); } }
        else if (pStep === 2) { if (!target) { this.setNextSkillCooldown(); return; } this.isFaceCharging = true; this.vx = this.vy = 0; this.faceTargetAngle = stTargetAng; fanAttackPreviews.push({ owner: this, targetAngle: this.faceTargetAngle, timer: 90 }); setTimeout(() => { if (this.hp<=0 || this.isSwallowed() || this.isGrabbed || !this.isFaceCharging) return; this.executeFaceExplosion(); this.parkCycleIdx = (this.parkCycleIdx+1)%8; this.setNextSkillCooldown(); let rAng = rand(0,PI2); this.vx = Math.cos(rAng)*this.baseSpeed; this.vy = Math.sin(rAng)*this.baseSpeed; }, 1500/gameSpeed); }
        else { this.divinePauseTimer = 90; this.vx = this.vy = 0; this.parkCycleIdx = (this.parkCycleIdx+1)%8; }
        break;
      case 3:
        if (this.isPhase2) {
          if (this.currentSkillStep === 1) { 
            this.tvBeamActive = true; this.tvBeamTimer = 180; this.beamCycleId++; this.laserHitBeams = {}; let rAng = rand(0,PI2); this.vx = Math.cos(rAng)*this.baseSpeed; this.vy = Math.sin(rAng)*this.baseSpeed; this.currentSkillStep = 2; this.setNextSkillCooldown(); 
          }
          else if (this.currentSkillStep === 2) {
            this.flamethrowerState = 1; this.flamethrowerTimer = 60; this.flamethrowerAngle = target ? stTargetAng : this.angle;
          }
          else { 
            this.vx = this.vy = 0; 
            for(let i=0; i<12; i++) {
              setTimeout(() => {
                if(this.hp>0 && gameActive && !this.isSwallowed()) {
                  let ang = (PI2/12)*i;
                  seqLaserBullets.push({ x: this.x, y: this.y, angle: ang, life: 20, color: "#ff4757" });
                  spawnParticles(this.x, this.y, "#ff4757", 'sharp', 8);
                  shakeTime = 8; shakeIntensity = 6;
                  
                  getValidEnemies(this).forEach(e => {
                    let dx = e.x - this.x, dy = e.y - this.y;
                    let dot = dx * Math.cos(ang) + dy * Math.sin(ang);
                    if (dot > 0 && getDist(e.x, e.y, this.x + Math.cos(ang) * dot, this.y + Math.sin(ang) * dot) < e.radius + 20) {
                      e.applyDamage(15, this);
                      spawnImpactEffect(e.x, e.y, "#ff4757");
                    }
                  });
                }
              }, (i*100)/gameSpeed);
            }
            setTimeout(() => { 
              if(this.hp>0 && gameActive) { 
                let mAng = rand(0,PI2); this.vx = Math.cos(mAng)*this.baseSpeed; this.vy = Math.sin(mAng)*this.baseSpeed; 
              } 
            }, (12*100)/gameSpeed); 
            this.currentSkillStep = 1; this.setNextSkillCooldown(); 
          }
        } break;
      case 4:
        if (this.currentSkillStep === 1) { bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*7.5, Math.sin(stTargetAng)*7.5, "", "#ff00ff", (this.weakDebuffTimer>0?10:20), this.pIndex, 'ink_slash')); this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { this.isInkPulling = true; this.inkPullTimer = 120; this.inkSpinAngle = 0; }
        else { bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*6, Math.sin(stTargetAng)*6, "", "#ff00ff", 10, this.pIndex, 'ink_mark')); this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 5:
        if (this.currentSkillStep === 1) { 
          this.voiceLaserActive = true; this.voiceLaserTimer = 150; this.voiceLaserAngleFixed = rand(0,PI2); this.enhancedLaser = this.gunwooGauge >= 2; if (this.enhancedLaser) this.gunwooGauge = 0; else this.gunwooGauge++; 
        }
        else if (this.currentSkillStep === 2) { 
          this.isBurrowInAnimation = true; this.burrowAnimTimer = 45; this.burrowScale = 1; this.vx = this.vy = 0; this.enhancedBurrow = this.gunwooGauge >= 2; if (this.enhancedBurrow) this.gunwooGauge = 0; else this.gunwooGauge++; 
        }
        else if (this.currentSkillStep === 3) {
          // [신규 스킬] 김건우 3스킬 (사자후) 발동 진입
          this.lionRoarAimTimer = 30; // 0.5초 위협 표시
          this.lionRoarAngle = stTargetAng; // 가장 가까운 적을 향해 방향 설정
          this.vx = this.vy = 0;
        }
        break;
      case 6:
        if (this.currentSkillStep === 1) { let sAng = rand(0,PI2); let cBall = new Ball(this.x+Math.cos(sAng)*30, this.y+Math.sin(sAng)*30, characters[6], this.pIndex, true, this); balls.push(cBall); cBall.launch(); spawnParticles(this.x, this.y, "#9b59b6", 'sharp', 8); this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*10, Math.sin(stTargetAng)*10, "", "#741b7c", 5, this.pIndex, 'dark_assassinate')); this.currentSkillStep = 3; this.setNextSkillCooldown(); }
        else { if (target) { darkBombThreats.push({ target, timer: 30, owner: this }); setTimeout(() => { if (this.hp>0 && target && target.hp>0) bullets.push(new Bullet(this.x, this.y, Math.cos(getObjAngle(this,target))*12, Math.sin(getObjAngle(this,target))*12, "", "#4a154b", 15, this.pIndex, 'dark_bomb')); }, 500/gameSpeed); } this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 8:
        if (this.currentSkillStep === 1) { bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*8, Math.sin(stTargetAng)*8, "🐕", "#8B4513", 5, this.pIndex, 'dog_charm')); this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { this.auraCharmUpTimer = 240; this.currentSkillStep = 3; this.setNextSkillCooldown(); }
        else { this.auraHealTimer = 180; this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 9:
        let r = Math.random(); const sMap = [{c:1/7,s:'eat',t:"김민채님이 먹기를 후원하셨습니다!"}, {c:2/7,s:'simon',t:"공병은님이 사이먼 도미닉을 후원하셨습니다!"}, {c:3/7,s:'sword',t:"박지성님이 소드마스터를 후원하셨습니다!"}, {c:4/7,s:'dog',t:"차은우지성님이 매력의 개를 후원하셨습니다!"}, {c:5/7,s:'laser',t:"김건우님이 저음레이저를 후원하셨습니다!"}, {c:6/7,s:'divine',t:"박지성님이 신성력을 후원하셨습니다!"}, {c:1,s:'heal',t:"메르시님이 좋은 힐을 후원하셨습니다!"}];
        let pick = sMap.find(x => r < x.c);
        activeDonations.push({ text: pick.t, timer: 60, color: this.color }); this.donationPendingSkill = pick.s; this.donationTimer = 30; this.setNextSkillCooldown();
        break;
      case 10:
        if (this.currentSkillStep === 1) { if(target) { this.geminiLaserTimer = 15; this.geminiLaserTarget = target; target.applyDamage(10, this); target.burnDuration = 180; } this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { let rX = rand(arenaLeft+87.975, arenaRight-87.975), rY = rand(arenaTop+87.975, arenaBottom-87.975); dominicProjectiles.push({ type: 'data_grenade', x: this.x, y: this.y, tx: rX, ty: rY, vx: (rX-this.x)/30, vy: (rY-this.y)/30, text: "Data", color: "#00ff00", ownerIndex: this.pIndex, life: 30, isArrived: false, explosionTimer: 120 }); this.currentSkillStep = 3; this.setNextSkillCooldown(); }
        else { if(target) customGrabs.push({ type: 'hack_link', owner: this, victim: target, timer: 90, x: this.x, y: this.y }); this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 11:
        if (this.currentSkillStep === 1) { this.monkeyRunState = 1; this.monkeyRunTimer = 30; this.vx = (arenaLeft+this.radius - this.x)/30; this.vy = (arenaBottom-this.radius - this.y)/30; this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { for(let i=0; i<4; i++) monkeyRains.push({ ownerIndex: this.pIndex, x: rand(arenaLeft+30, arenaRight-30), y: arenaTop - 60 - rand(0,100), vy: rand(8,12), radius: 25 }); this.currentSkillStep = 3; this.setNextSkillCooldown(); }
        else { this.monkeyBuffTimer = 180; this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 12: this.setNextSkillCooldown(); break;
      case 13:
        if (this.currentSkillStep === 1) { this.gigaBeamAimTimer = 30; this.gigaBeamAngle = stTargetAng; this.vx = this.vy = 0; this.currentSkillStep = 2; this.setNextSkillCooldown(); }
        else if (this.currentSkillStep === 2) { this.gigaDashAimTimer = 60; this.gigaDashAngle = stTargetAng; this.vx = this.vy = 0; this.currentSkillStep = 3; this.setNextSkillCooldown(); }
        else { this.gigaBladeAimTimer = 60; this.gigaBladeAngle = stTargetAng; this.vx = this.vy = 0; this.currentSkillStep = 1; this.setNextSkillCooldown(); }
        break;
      case 14:
        bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*12, Math.sin(stTargetAng)*12, "", "#b339a3", 7, this.pIndex, 'giga_gun'));
        this.setNextSkillCooldown();
        break;
      case 15:
        if (this.currentSkillStep === 1) {
          textPopups.push(new TextPopup(this.x, this.y - 30, "퀸카의 먹방!", false, "#ff9ff3"));
          this.wandAnimTimer = 60;
          for(let i=0; i<3; i++) {
            setTimeout(() => {
              if(this.hp > 0 && !this.isDeadCompletely) {
                let curTarget = this.getNearestEnemy();
                let ang = curTarget ? getObjAngle(this, curTarget) : stTargetAng;
                // [밸런스 패치 적용] 김민제리얌 1스킬 데미지 15 -> 12로 하향
                bullets.push(new Bullet(this.x, this.y, Math.cos(ang)*2.5, Math.sin(ang)*2.5, "", "#ff9ff3", 12, this.pIndex, 'magic_orb'));
              }
            }, i * 200 / gameSpeed);
          }
          this.currentSkillStep = 2;
          this.setNextSkillCooldown();
        } else if (this.currentSkillStep === 2) {
          textPopups.push(new TextPopup(this.x, this.y - 30, "이런 먹방 안먹방!", false, "#74b9ff"));
          this.shieldHp = 15;
          spawnParticles(this.x, this.y, "#74b9ff", 'sharp', 20);
          this.currentSkillStep = 3;
          this.setNextSkillCooldown();
        } else {
          let foods = ['food_spinach', 'food_kimchi', 'food_mushroom'];
          let foodNames = { 'food_spinach': '시금치🥬', 'food_kimchi': '김치🌶️', 'food_mushroom': '버섯🍄' };
          let foodColors = { 'food_spinach': '#2ecc71', 'food_kimchi': '#e74c3c', 'food_mushroom': '#a29bfe' };
          let food = foods[Math.floor(Math.random() * foods.length)];
          let dmg = food === 'food_spinach' ? 15 : (food === 'food_kimchi' ? 18 : 30);
          
          textPopups.push(new TextPopup(this.x, this.y - 30, `이런 반찬 안먹찬! [${foodNames[food]}]`, false, foodColors[food]));
          
          bullets.push(new Bullet(this.x, this.y, Math.cos(stTargetAng)*7, Math.sin(stTargetAng)*7, "", "#fff", dmg, this.pIndex, food));
          this.currentSkillStep = 1;
          this.setNextSkillCooldown();
        }
        break;
    }
  }

  executeFaceExplosion() {
    flashBgColor = "rgba(241, 196, 15, 0.2)"; setTimeout(() => flashBgColor = null, 80); shakeTime = 25; shakeIntensity = 15;
    soundwaves.push({x: this.x, y: this.y, angle: this.faceTargetAngle, life: 60, radius: 40});
    for (let i=0; i<35; i++) { let a = this.faceTargetAngle + rand(-PI/3, PI/3), d = rand(0, size*1.2); particles.push(new Particle(this.x+Math.cos(a)*d, this.y+Math.sin(a)*d, "#f1c40f", 'sharp')); }
    let dmg = this.weakDebuffTimer > 0 ? 10 : 20;
    getValidEnemies(this).forEach(t => {
      let dx = t.x - this.x, dy = t.y - this.y;
      if (Math.hypot(dx, dy) <= size*2) {
        let diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - this.faceTargetAngle), Math.cos(Math.atan2(dy, dx) - this.faceTargetAngle));
        if (Math.abs(diff) <= PI/3) { t.applyDamage(dmg, this); t.applyKnockback(this.x, this.y, 8); t.weakDebuffTimer = 180; }
      }
    });
  }

  spitOut() {
    let sb = this.swallowedBall; if(!sb) return;
    let lAng = getAngle(this.x, this.y, size/2, size/2) + rand(-0.25, 0.25);
    sb.x = this.x + Math.cos(lAng) * (this.radius + sb.radius + 5); sb.y = this.y + Math.sin(lAng) * (this.radius + sb.radius + 5);
    sb.vx = Math.cos(lAng)*11; sb.vy = Math.sin(lAng)*11; sb.woundDuration = 180;
    this.swallowedBall = null; this.eatReady = false;
    if (this.id === 0) { this.currentSkillStep = 2; this.setNextSkillCooldown(); }
    this.vx = Math.cos(this.angle)*this.baseSpeed; this.vy = Math.sin(this.angle)*this.baseSpeed; spawnImpactEffect(sb.x, sb.y, "#8b0000");
  }

  applyKnockback(fromX, fromY, power) {
    if (isCountingDown || this.isSwallowed() || this.hp <= 0 || this.isTransforming || this.isMovingToCenter || this.isBurrowed || this.isBurrowInAnimation || ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall)) || (this.id === 2 && this.isFaceCharging) || (this.id === 3 && this.tvBeamActive) || ((this.id === 5 || this.id === 9) && this.voiceLaserActive) || this.flamethrowerState > 0 || (this.id === 13 && (this.gigaBeamAimTimer > 0 || this.gigaBeamActiveTimer > 0 || this.gigaDashAimTimer > 0 || this.gigaDashActive || this.gigaBladeAimTimer > 0 || this.gigaBladeActiveTimer > 0)) || (this.id === 5 && (this.lionRoarAimTimer > 0 || this.lionRoarActiveTimer > 0))) return;
    let dx = this.x - fromX, dy = this.y - fromY, d = Math.hypot(dx, dy);
    if (d > 0) { this.vx += (dx/d)*power; this.vy += (dy/d)*power; }
  }

  draw() {
    if (this.isDeadCompletely || this.isBurrowed || this.isSwallowed()) return;
    ctx.save();
    
    // [신규 스킬: 김건우 사자후 시각 효과]
    if (this.id === 5 && this.hp > 0) {
      if (this.lionRoarAimTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.lionRoarAngle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, size * 1.5, -Math.PI/4, Math.PI/4); ctx.closePath();
        ctx.fillStyle = "rgba(230, 126, 34, 0.15)"; ctx.fill();
        ctx.strokeStyle = "rgba(230, 126, 34, 0.8)"; ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.stroke();
        ctx.restore();
      }
      if (this.lionRoarActiveTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.lionRoarAngle);
        let pulse = Math.abs(Math.sin(Date.now() / 50));
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, size * 1.5, -Math.PI/4, Math.PI/4); ctx.closePath();
        let gradOuter = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
        gradOuter.addColorStop(0, `rgba(255, 140, 0, ${0.4 + pulse*0.2})`);
        gradOuter.addColorStop(1, "transparent");
        ctx.fillStyle = gradOuter; ctx.fill();
        ctx.strokeStyle = "rgba(255, 140, 0, 0.6)"; ctx.lineWidth = 3; ctx.stroke();
        ctx.restore();
      }
    }

    if (this.flamethrowerState === 1) {
      ctx.save(); ctx.fillStyle = "rgba(255, 69, 0, 0.25)"; ctx.strokeStyle = "rgba(255, 69, 0, 0.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.arc(this.x, this.y, size * 1.5, this.flamethrowerAngle - Math.PI/6, this.flamethrowerAngle + Math.PI/6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (this.flamethrowerState === 2) {
      ctx.save();
      let pulse = 0.15 + Math.sin(Date.now() * 0.05) * 0.25;
      ctx.fillStyle = `rgba(255, 69, 0, ${pulse})`;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.arc(this.x, this.y, size * 1.5, this.flamethrowerAngle - Math.PI/6, this.flamethrowerAngle + Math.PI/6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    if (this.id === 13 && this.hp > 0) {
      if (this.gigaBeamAimTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.gigaBeamAngle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size * 2, 0);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"; ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.stroke();
        ctx.fillStyle = "rgba(255, 0, 0, 0.1)"; ctx.fillRect(0, -56.25, size*2, 112.5);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
        ctx.strokeRect(0, -56.25, size*2, 112.5);
        ctx.restore();
      }
      if (this.gigaBeamActiveTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.gigaBeamAngle);
        let pulse = Math.abs(Math.sin(Date.now() / 50));
        let gradOuter = ctx.createLinearGradient(0, -60 - pulse*5, 0, 60 + pulse*5);
        gradOuter.addColorStop(0, "transparent"); gradOuter.addColorStop(0.5, "rgba(0, 255, 255, 0.5)"); gradOuter.addColorStop(1, "transparent");
        ctx.fillStyle = gradOuter; ctx.fillRect(0, -67.5, size*2, 135);
        let gradCore = ctx.createLinearGradient(0, -37.5, 0, 37.5);
        gradCore.addColorStop(0, "#2c3e50"); gradCore.addColorStop(0.3, "#bdc3c7"); gradCore.addColorStop(0.5, "#ffffff"); gradCore.addColorStop(0.7, "#bdc3c7"); gradCore.addColorStop(1, "#2c3e50");
        ctx.fillStyle = gradCore; ctx.fillRect(0, -37.5, size*2, 75);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(size*2, -15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(size*2, 15); ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 15 + pulse * 10; ctx.shadowColor = "#00ffff";
        ctx.fillRect(0, -6, size*2, 12);
        ctx.restore();
      }
      if (this.gigaDashAimTimer > 0 || this.gigaDashActive) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.gigaDashAimTimer > 0 ? this.gigaDashAngle : this.angle);
        ctx.fillStyle = "rgba(189, 195, 199, 0.3)"; ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 2.5; ctx.shadowBlur = 15; ctx.shadowColor = "#00ffff";
        ctx.beginPath(); ctx.moveTo(0, -this.radius); ctx.lineTo(-30, -this.radius - 40); ctx.lineTo(-10, -this.radius - 20); ctx.lineTo(15, -this.radius - 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, this.radius); ctx.lineTo(-30, this.radius + 40); ctx.lineTo(-10, this.radius + 20); ctx.lineTo(15, this.radius + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#ff00ff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, -this.radius - 20); ctx.lineTo(0, -this.radius - 5); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-10, this.radius + 20); ctx.lineTo(0, this.radius + 5); ctx.stroke();
        ctx.restore();
      }
      if (this.gigaBladeAimTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.gigaBladeAngle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 250, -50 * Math.PI / 180, 50 * Math.PI / 180); ctx.closePath();
        ctx.fillStyle = "rgba(0, 255, 255, 0.15)"; ctx.fill();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.8)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.stroke();
        ctx.restore();
      }
      if (this.gigaBladeActiveTimer > 0) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.gigaBladeAngle);
        let swingProgress = 1 - (this.gigaBladeActiveTimer / 15);
        let curAng = -50 * Math.PI / 180 + (100 * Math.PI / 180) * swingProgress;
        ctx.rotate(curAng);
        
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(240, -18);
        ctx.lineTo(290, 0);
        ctx.lineTo(240, 18);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 255, 255, 0.85)";
        ctx.shadowBlur = 40; ctx.shadowColor = "#00ffff";
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(230, -6);
        ctx.lineTo(270, 0);
        ctx.lineTo(230, 6);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.restore();
      }
    }

    customGrabs.forEach(g => { if (g.type === 'hack_link' && g.owner === this) { ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"; ctx.lineWidth = 3; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(g.victim.x, g.victim.y); ctx.stroke(); } });
    if (this.id === 10 && this.geminiLaserTimer > 0 && this.geminiLaserTarget) { ctx.strokeStyle = `rgba(0, 255, 0, ${this.geminiLaserTimer/15})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.geminiLaserTarget.x, this.geminiLaserTarget.y); ctx.stroke(); }
    if (this.hackDebuffTimer > 0 && this.hp > 0) { ctx.strokeStyle = "rgba(0, 255, 0, 0.9)"; ctx.lineWidth = 3; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 8, 0, PI2); ctx.stroke(); ctx.fillStyle = "#00ff00"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center"; ctx.fillText("0101", this.x, this.y - this.radius - 10); ctx.setLineDash([]); }

    if (this.id === 8 && this.hp > 0) { ctx.beginPath(); ctx.arc(this.x, this.y, this.passiveAuraRadius, 0, PI2); ctx.fillStyle = this.auraHealTimer > 0 ? "rgba(46, 213, 115, 0.15)" : "rgba(255, 182, 193, 0.15)"; ctx.strokeStyle = this.auraHealTimer > 0 ? "rgba(46, 213, 115, 0.5)" : "rgba(255, 182, 193, 0.5)"; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); }
    if (this.id === 12 && this.hp > 0) {
      let r = this.pilduAuraRadius; ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, PI2);
      ctx.fillStyle = this.pilduLevel === 1 ? "rgba(189, 195, 199, 0.1)" : (this.pilduLevel === 2 ? "rgba(243, 156, 18, 0.1)" : "rgba(231, 76, 60, 0.15)");
      ctx.strokeStyle = this.pilduLevel === 1 ? "rgba(189, 195, 199, 0.5)" : (this.pilduLevel === 2 ? "rgba(243, 156, 18, 0.6)" : "rgba(231, 76, 60, 0.8)");
      ctx.lineWidth = 2; ctx.setLineDash([10, 5]); ctx.stroke(); ctx.fill(); ctx.setLineDash([]);
      
      const drawTurret = (tX, tY, type, angle) => {
        ctx.save(); ctx.translate(tX, tY); ctx.rotate(angle);
        if (type === 'pistol') { ctx.fillStyle = "#7f8c8d"; ctx.fillRect(-8, -8, 16, 16); ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, -3, 12, 6); ctx.fillStyle = "#2c3e50"; ctx.beginPath(); ctx.arc(0, 0, 4, 0, PI2); ctx.fill(); }
        else if (type === 'rifle') { ctx.fillStyle = "#d35400"; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, 8); ctx.lineTo(-8, -8); ctx.fill(); ctx.fillStyle = "#f1c40f"; ctx.fillRect(0, -2, 16, 4); }
        else { ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.arc(0, 0, 10, 0, PI2); ctx.fill(); ctx.fillStyle = "#e74c3c"; ctx.fillRect(0, -2, 22, 4); ctx.fillStyle = "#000"; ctx.fillRect(8, -4, 6, 8); }
        ctx.restore();
      };
      
      let target = null, minDist = Infinity; getValidEnemies(this).forEach(b => { let d = getObjDist(b, this); if(d <= r + b.radius && d < minDist) { minDist = d; target = b; } });
      const getAng = (tx, ty) => target ? getAngle(tx, ty, target.x, target.y) : 0;
      drawTurret(this.x - r, this.y, 'pistol', getAng(this.x - r, this.y)); drawTurret(this.x + r, this.y, 'pistol', getAng(this.x + r, this.y));
      if (this.pilduLevel >= 2) { drawTurret(this.x, this.y - r, 'rifle', getAng(this.x, this.y - r)); drawTurret(this.x, this.y + r, 'rifle', getAng(this.x, this.y + r)); }
      if (this.pilduLevel >= 3) { let diag = r * 0.7071; drawTurret(this.x - diag, this.y - diag, 'sniper', getAng(this.x - diag, this.y - diag)); drawTurret(this.x + diag, this.y - diag, 'sniper', getAng(this.x + diag, this.y - diag)); drawTurret(this.x - diag, this.y + diag, 'sniper', getAng(this.x - diag, this.y + diag)); drawTurret(this.x + diag, this.y + diag, 'sniper', getAng(this.x + diag, this.y + diag)); }
    }

    if (this.darkDebuffTimer > 0 && this.hp > 0) { ctx.strokeStyle = "rgba(74, 21, 124, 0.95)"; ctx.lineWidth = 4; ctx.shadowBlur = 25; ctx.shadowColor = "#9b59b6"; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 9, 0, PI2); ctx.stroke(); for (let m=0; m<3; m++) { ctx.fillStyle = "rgba(42, 9, 68, 0.5)"; ctx.beginPath(); ctx.arc(this.x + Math.sin(Date.now()*0.01 + m)*5, this.y + Math.cos(Date.now()*0.01 + m)*5, this.radius - 2, 0, PI2); ctx.fill(); } ctx.fillStyle = "#da70d6"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("어둠 디버프", this.x, this.y - this.radius - 12); }
    if (this.weakDebuffTimer > 0 && this.hp > 0) { ctx.strokeStyle = "rgba(231, 76, 60, 0.8)"; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.shadowColor = "#ff4757"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 7, 0, PI2); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#ff4757"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("위협됨", this.x, this.y - this.radius - 6); }
    if (this.isTransforming) { ctx.strokeStyle = `rgba(255, 71, 87, ${this.transformTimer / 180})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.x, this.y, 40 + (180 - this.transformTimer)*1.5, 0, PI2); ctx.stroke(); ctx.fillStyle = "rgba(155, 89, 182, 0.25)"; ctx.beginPath(); ctx.arc(this.x, this.y, (180 - this.transformTimer)*0.8, 0, PI2); ctx.fill(); ctx.strokeStyle = "rgba(255, 71, 87, 0.6)"; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.shadowColor = "#ff4757"; [this.tvBeamAngle, this.tvBeamAngle + PI/2, this.tvBeamAngle + PI, this.tvBeamAngle + PI*1.5].forEach(ang => { ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + Math.cos(ang)*size*1.5, this.y + Math.sin(ang)*size*1.5); ctx.stroke(); }); }
    
    if (this.shieldHp > 0) {
      let actRad = this.radius * this.burrowScale;
      ctx.save(); ctx.translate(this.x, this.y);
      ctx.beginPath(); ctx.arc(0, 0, actRad + 8, 0, PI2);
      ctx.fillStyle = "rgba(116, 185, 255, 0.3)";
      ctx.strokeStyle = "rgba(116, 185, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#74b9ff";
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-5, -5, actRad * 0.4, 0, Math.PI);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowBlur = 5; ctx.shadowColor = "#000000"; ctx.fillText(Math.ceil(this.shieldHp), 0, -actRad - 20);
      ctx.restore();
    }

    balls.forEach(gBall => { if (gBall.id === 4 && gBall.markedTargetId === this.pIndex && this.hp > 0 && !this.isClone) { ctx.strokeStyle = "#ff00ff"; ctx.lineWidth = 3.5; ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff"; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 8, 0, PI2); ctx.stroke(); ctx.setLineDash([]); } });
    if (this.electricDuration > 0 && Math.random() < 0.7 && this.hp > 0) { ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 4; ctx.shadowBlur = 20; ctx.shadowColor = "#00ffff"; ctx.beginPath(); ctx.moveTo(this.x + rand(-20,20), this.y + rand(-20,20)); for(let s=0; s<3; s++) ctx.lineTo(this.x + rand(-50,50), this.y + rand(-50,50)); ctx.stroke(); }

    let actRad = this.radius * this.burrowScale;
    if (this.hp <= 0 && this.deathSequenceTimer > 0) actRad = Math.max(5, this.radius + Math.sin(this.deathSequenceTimer * 0.3)*7 + (120 - this.deathSequenceTimer)*0.12);

    ctx.translate(this.x, this.y);
    if (this.dizzyTimer > 0 && this.hp > 0) { ctx.save(); ctx.rotate(Date.now()*0.005); ctx.fillStyle = "#f1c40f"; ctx.font = "16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("💫", 0, -this.radius-12); ctx.fillText("💫", 16, this.radius+6); ctx.fillText("💫", -16, this.radius+6); ctx.restore(); }

    ctx.rotate(this.angle);
    if (this.weakDebuffTimer > 0 || this.darkDebuffTimer > 0) ctx.globalAlpha = 0.65;

    ctx.beginPath(); ctx.arc(0, 0, actRad, 0, PI2); ctx.fillStyle = this.color; ctx.shadowBlur = (this.hp <= 0 || this.isMovingToCenter) ? 28 : 18; ctx.shadowColor = this.isMovingToCenter ? "#9b59b6" : (this.hp <= 0 ? "#ff3333" : this.color); ctx.fill();
    ctx.rotate(-this.angle);

    if ((this.id === 0 || this.id === 9) && (this.eatReady || this.swallowedBall) && this.hp > 0) { ctx.beginPath(); ctx.arc(0, 0, this.radius + 14 + Math.sin(Date.now()/60)*4, 0, PI2); ctx.strokeStyle = "rgba(255, 10, 10, 0.85)"; ctx.lineWidth = 3.5; ctx.shadowBlur = 18; ctx.shadowColor = "#ff0000"; ctx.stroke(); ctx.fillStyle = "rgba(255, 0, 0, 0.08)"; ctx.fill(); }
    if (this.id === 0 && this.isSlamCharging) { ctx.beginPath(); ctx.arc(0, 0, 165, 0, PI2); ctx.fillStyle = "rgba(255, 71, 87, 0.08)"; ctx.strokeStyle = "rgba(255, 71, 87, 0.5)"; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke(); }
    if ((this.id === 2 || this.id === 9) && this.divineTimer > 0) { ctx.beginPath(); ctx.arc(0, 0, actRad + 5, 0, PI2); ctx.strokeStyle = "#ffff00"; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.shadowColor = "#ffffff"; ctx.stroke(); }
    
    if (this.burrowScale > 0.3) { ctx.fillStyle = this.isClone ? "#e0c0ff" : "#ffffff"; ctx.font = `bold ${this.nickname === "🐵" ? 24*this.burrowScale : 12*this.burrowScale}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowBlur = 5; ctx.shadowColor = "#000000"; ctx.fillText(this.nickname, 0, 0); }
    
    if (this.id === 4 && this.hp > 0) {
      ctx.save(); if (this.isInkSpinning || this.isInkPulling) ctx.rotate(this.inkSpinAngle * 5); else ctx.rotate(this.angle + Math.PI/4);
      ctx.fillStyle = "#d488ff"; ctx.fillRect(8, -2, 18, 4); ctx.fillStyle = "#ffffff"; ctx.fillRect(26, -3, 4, 6); ctx.fillStyle = "#ff00ff"; ctx.shadowBlur = 10; ctx.shadowColor = "#ff00ff"; ctx.beginPath(); ctx.moveTo(30, -3); ctx.lineTo(44, 0); ctx.lineTo(30, 3); ctx.closePath(); ctx.fill(); ctx.restore();
      if (this.isInkPulling) { ctx.strokeStyle = "rgba(212, 136, 255, 0.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 10]); ctx.beginPath(); ctx.arc(0, 0, 170, 0, PI2); ctx.stroke(); ctx.setLineDash([]); }
    }
    if (this.id === 4 && this.isInkSpinning && this.hp > 0) { ctx.strokeStyle = "rgba(255, 0, 255, 0.8)"; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff"; ctx.beginPath(); ctx.arc(0, 0, 90, 0, PI2); ctx.stroke(); }

    if (this.id === 14 && this.hp > 0) {
      ctx.save(); ctx.rotate(this.angle);
      ctx.fillStyle = "#333"; ctx.fillRect(this.radius - 2, -4, 14, 8);
      ctx.fillStyle = "#bdc3c7"; ctx.fillRect(this.radius + 8, -5, 6, 10);
      ctx.restore();
    }
    
    if (this.id === 15 && this.wandAnimTimer > 0) {
      ctx.save();
      ctx.fillStyle = "#f1c40f";
      ctx.beginPath();
      ctx.moveTo(-10, -this.radius - 5); ctx.lineTo(-15, -this.radius - 20); ctx.lineTo(-5, -this.radius - 12);
      ctx.lineTo(0, -this.radius - 25); ctx.lineTo(5, -this.radius - 12); ctx.lineTo(15, -this.radius - 20); ctx.lineTo(10, -this.radius - 5);
      ctx.closePath(); ctx.fill();
      ctx.rotate(Math.sin(Date.now() / 100) * 0.5);
      ctx.fillStyle = "#d35400"; ctx.fillRect(this.radius + 5, -15, 4, 30);
      ctx.fillStyle = "#ff9ff3"; ctx.shadowBlur = 15; ctx.shadowColor = "#ff9ff3";
      ctx.beginPath(); ctx.arc(this.radius + 7, -15, 7, 0, PI2); ctx.fill();
      ctx.restore();
    }

    if (this.hp <= 0 && !this.isMovingToCenter && this.id === 99) { ctx.fillStyle = "#fffa85"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("누적 딜: " + Math.round(this.totalDamageTaken), 0, -this.radius - 20); ctx.restore(); return; }
    if (this.weakDebuffTimer > 0 && Math.random() < 0.15) textPopups.push(new TextPopup(this.x, this.y - 10, "⬇", false));
    if (this.id === 99) { ctx.fillStyle = "#fffa85"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("누적 딜: " + Math.round(this.totalDamageTaken), 0, -this.radius - 20); }

    if (this.id === 5 && this.hp > 0 && !this.isDeadCompletely && !this.isBurrowed && !this.isTransforming && !this.isMovingToCenter) {
      ctx.translate(0, this.radius + 8);
      for (let i=0; i<2; i++) { ctx.beginPath(); ctx.rect(-12+i*14, 0, 10, 10); ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; ctx.lineWidth = 1.5; ctx.stroke(); if(this.gunwooGauge > i){ ctx.fillStyle = "#00a8ff"; ctx.fill(); ctx.shadowBlur = 8; ctx.shadowColor = "#00a8ff"; } }
    }
    ctx.restore();
  }
}

// ==========================================
// [각종 충돌 및 스킬 처리 헬퍼]
// ==========================================
function calculateVoiceLaser(owner) {
  let px = owner.x, py = owner.y, dx = Math.cos(owner.voiceLaserAngleFixed), dy = Math.sin(owner.voiceLaserAngleFixed);
  owner.laserSegments = [{x: px, y: py}];
  for(let b=0; b<4; b++) {
    let t = 99999, w = '';
    if (dx > 0) { let tr = (arenaRight - px)/dx; if(tr < t) { t = tr; w = 'V'; } }
    if (dx < 0) { let tl = (arenaLeft - px)/dx; if(tl < t) { t = tl; w = 'V'; } }
    if (dy > 0) { let tb = (arenaBottom - py)/dy; if(tb < t) { t = tb; w = 'H'; } }
    if (dy < 0) { let tt = (arenaTop - py)/dy; if(tt < t) { t = tt; w = 'H'; } }
    px += dx*t; py += dy*t; owner.laserSegments.push({x: px, y: py});
    if (w === 'V') dx = -dx; else if (w === 'H') dy = -dy;
  }
  let dps = (owner.enhancedLaser ? 30 : 18) / 60 * gameSpeed;
  getValidEnemies(owner).forEach(e => {
    for (let i = 0; i < owner.laserSegments.length - 1; i++) {
      let p1 = owner.laserSegments[i], p2 = owner.laserSegments[i+1], ldx = p2.x - p1.x, ldy = p2.y - p1.y, lenSq = ldx*ldx + ldy*ldy;
      let t = Math.max(0, Math.min(1, ((e.x - p1.x)*ldx + (e.y - p1.y)*ldy)/(lenSq || 1)));
      let cx = p1.x + t*ldx, cy = p1.y + t*ldy;
      if (getDist(e.x, e.y, cx, cy) < e.radius + 20) { e.applyDamage(dps, owner); if (Math.random() < 0.2) spawnParticles(cx, cy, owner.enhancedLaser ? "#00a8ff" : "#e67e22", 'sharp', 1); break; }
    }
  });
}

function checkLaserCollision(owner, baseAngle, damage, applySlow = false, applyBurn = false) {
  let angles = [baseAngle, baseAngle + Math.PI/2, baseAngle + Math.PI, baseAngle + Math.PI*1.5];
  getValidEnemies(owner).forEach(t => {
    angles.forEach((ang, idx) => {
      let dx = t.x - owner.x, dy = t.y - owner.y, dot = dx * Math.cos(ang) + dy * Math.sin(ang);
      if (dot > 0 && getDist(t.x, t.y, owner.x + Math.cos(ang)*dot, owner.y + Math.sin(ang)*dot) < t.radius + 8) {
        let key = `cycle_${owner.beamCycleId}beam${idx}hit${t.pIndex}`;
        if (!owner.laserHitBeams[key]) { t.applyDamage(owner.weakDebuffTimer > 0 ? damage*0.5 : damage, owner); if (applySlow) t.slowDuration = 60; if (applyBurn && t.burnDuration <= 0) t.burnDuration = 240; owner.laserHitBeams[key] = true; }
      }
    });
  });
}

function checkGongLaserCollision(owner, baseAngle) {
  let angles = [baseAngle, baseAngle + PI2/3, baseAngle + PI2*2/3];
  getValidEnemies(owner).forEach(t => {
    angles.forEach((ang, idx) => {
      let dot = (t.x - owner.x)*Math.cos(ang) + (t.y - owner.y)*Math.sin(ang);
      if (dot > 0 && getDist(t.x, t.y, owner.x + Math.cos(ang)*dot, owner.y + Math.sin(ang)*dot) < t.radius + 12) {
        let key = t.pIndex + '_' + idx;
        if (!owner.gongLaserHits[key]) { t.applyDamage(7, owner); if (t.electricDuration <= 0) t.electricDuration = 180; owner.gongLaserHits[key] = 9999; spawnParticles(owner.x + Math.cos(ang)*dot, owner.y + Math.sin(ang)*dot, "#00ffff", 'sharp', 5); }
      }
    });
  });
}

function handleParkSwords() {
  processArr(parkSwords, s => {
    if (s.state === 'wait') {
      s.x = s.owner.x + s.offsetX; s.y = s.owner.y + s.offsetY; s.timer -= gameSpeed;
      if (s.owner.hp <= 0) return true;
      if (s.timer <= 0) { s.state = 'fire'; let t = s.owner.getNearestEnemy(), ang = t ? getObjAngle(s, t) : s.owner.angle; s.vx = Math.cos(ang)*9; s.vy = Math.sin(ang)*9; s.angle = ang; }
    } else {
      s.x += s.vx * gameSpeed; s.y += s.vy * gameSpeed; let hit = false;
      for (let b of getValidEnemies(s.owner)) if (getObjDist(b, s) < b.radius + 8) { b.applyDamage(s.damage, s.owner); spawnImpactEffect(s.x, s.y, "#00ffff"); hit = true; break; }
      if (hit || s.x < arenaLeft || s.x > arenaRight || s.y < arenaTop || s.y > arenaBottom) return true;
    }
    return false;
  });
}

function handleCustomGrabs() {
  processArr(customGrabs, g => {
    if (g.type === 'hack_link') {
      if (g.owner.hp <= 0 || g.victim.hp <= 0 || g.owner.isSwallowed() || g.victim.isSwallowed()) return true;
      g.timer -= gameSpeed; if (Math.random() < 0.3) spawnParticles(g.victim.x + rand(-30,30), g.victim.y + rand(-30,30), "#00ff00", 'sharp', 1);
      if (g.timer <= 0) { g.victim.hackBombTimer = 1; textPopups.push(new TextPopup(g.victim.x, g.victim.y, "링크 완료!", false)); return true; }
      return false;
    }
    if (g.owner.hp <= 0 || g.owner.isTransforming || g.owner.isMovingToCenter || g.owner.isSwallowed()) { if (g.victim) g.victim.isGrabbed = false; return true; }
    if (g.state === 'launch') {
      g.x += g.vx * gameSpeed; g.y += g.vy * gameSpeed; g.length = getObjDist(g, g.owner) || 1;
      if (g.x < arenaLeft || g.x > arenaRight || g.y < arenaTop || g.y > arenaBottom || g.length >= g.maxLength) { g.x = Math.max(arenaLeft, Math.min(arenaRight, g.x)); g.y = Math.max(arenaTop, Math.min(arenaBottom, g.y)); g.state = 'pull'; }
      getValidEnemies(g.owner).forEach(t => { if (!g.victim && getObjDist(t, g) < t.radius + 45) { g.victim = t; t.isGrabbed = true; t.forceCancelSkill(); t.applyDamage(10, g.owner); g.state = 'pull'; } });
    } else {
      let dx = g.owner.x - g.x, dy = g.owner.y - g.y, d = Math.hypot(dx, dy) || 1, ps = 15 * gameSpeed;
      if (d > ps + 15) { g.x += (dx/d)*ps; g.y += (dy/d)*ps; if (g.victim) { g.victim.x = Math.max(arenaLeft+g.victim.radius, Math.min(arenaRight-g.victim.radius, g.x)); g.victim.y = Math.max(arenaTop+g.victim.radius, Math.min(arenaBottom-g.victim.radius, g.y)); g.victim.vx = g.victim.vy = 0; } }
      else { if (g.victim) { g.victim.isGrabbed = false; let eA = rand(0, PI2); g.victim.vx = Math.cos(eA)*g.victim.baseSpeed*2.0; g.victim.vy = Math.sin(eA)*g.victim.baseSpeed*2.0; } return true; }
    }
    return false;
  });
}

function handleDogPuddles() {
  if (isCountingDown) return;
  processArr(dogPuddles, p => {
    p.timer -= gameSpeed; p.tickTimer = (p.tickTimer || 0) - gameSpeed;
    if (p.timer <= 0) return true;
    if (p.tickTimer <= 0) {
      p.tickTimer = 4; let oHero = balls.find(b => b.pIndex === p.ownerIndex && !b.isClone);
      balls.forEach(t => { if (t.hp > 0 && t.pIndex !== p.ownerIndex && !t.isSwallowed() && !t.isBurrowed && !t.isTransforming && !t.isMovingToCenter && getObjDist(t, p) <= 55 + t.radius) t.applyDamage(1, oHero); });
    }
    return false;
  });
}

function handleMonkeyRains() {
  if (isCountingDown) return;
  processArr(monkeyRains, m => {
    m.y += m.vy * gameSpeed; let hit = false, oHero = balls.find(b => b.pIndex === m.ownerIndex && !b.isClone);
    for (let t of balls) {
      if (t.hp > 0 && t.pIndex !== m.ownerIndex && !t.isSwallowed() && !t.isBurrowed && !t.isTransforming && !t.isMovingToCenter && getObjDist(t, m) <= m.radius + t.radius) {
        t.applyDamage(20, oHero); createShockwave(m.x, m.y, 45, "#8B4513"); spawnParticles(m.x, m.y, "#8B4513", 'sharp', 15); hit = true; break;
      }
    }
    return hit || m.y > arenaBottom + 50;
  });
}

function handleGongSkills() {
  if (isCountingDown) return;
  processArr(simonProjectiles, p => {
    p.x += p.vx * gameSpeed; p.y += p.vy * gameSpeed; p.life -= gameSpeed;
    if (p.x < arenaLeft || p.x > arenaRight || p.y < arenaTop || p.y > arenaBottom || p.life <= 0) return true;
    for (let e of balls) {
      if (e.hp > 0 && p.ownerIndex !== e.pIndex && !e.isSwallowed() && !e.isBurrowed && !e.isTransforming && !e.isMovingToCenter && getObjDist(e, p) < e.radius + p.radius) {
        let o = balls.find(b => b.pIndex === p.ownerIndex && !b.isClone); e.applyDamage(o && o.weakDebuffTimer > 0 ? 7.5 : 15, o); e.electricDuration = 180; spawnParticles(p.x, p.y, "#00ffff", 'sharp', 12); return true;
      }
    }
    return false;
  });

  processArr(dominicProjectiles, d => {
    let isData = d.type === 'data_grenade';
    if (!d.isArrived) {
      d.x += d.vx * gameSpeed; d.y += d.vy * gameSpeed; d.life -= gameSpeed;
      if (d.life <= 0) {
        d.x = d.tx; d.y = d.ty; d.isArrived = true;
        if (!isData) {
          spawnParticles(d.x, d.y, "#00ffff", 'sharp', 14); let o = balls.find(b => b.pIndex === d.ownerIndex && !b.isClone);
          balls.forEach(e => { if (e.hp > 0 && e.pIndex !== d.ownerIndex && !e.isSwallowed() && !e.isBurrowed && getObjDist(e, d) <= 38.8125 + e.radius) { e.applyDamage(o && o.weakDebuffTimer > 0 ? 7.5 : 15, o); e.electricDuration = 120; } });
        }
      }
    } else {
      d.explosionTimer -= gameSpeed;
      if (isData) {
        balls.forEach(e => { if (e.hp > 0 && e.pIndex !== d.ownerIndex && !e.isSwallowed() && !e.isTransforming && !e.isMovingToCenter && !e.isBurrowed && getObjDist(e, d) <= 87.975 + e.radius && getObjDist(e, d) > 5) { e.x += (d.x - e.x)*0.05*gameSpeed; e.y += (d.y - e.y)*0.05*gameSpeed; } });
        if (Math.random() < 0.4) spawnParticles(d.x + rand(-87.975,87.975), d.y + rand(-87.975,87.975), "#00ff00", 'sharp', 1);
        if (d.explosionTimer <= 0) { let o = balls.find(b => b.pIndex === d.ownerIndex && !b.isClone); balls.forEach(e => { if (e.hp > 0 && e.pIndex !== d.ownerIndex && getObjDist(e, d) <= 87.975 + e.radius) e.applyDamage(20, o); }); createShockwave(d.x, d.y, 87.975, "#00ff00"); return true; }
      } else if (d.explosionTimer <= 0) return true;
    }
    return false;
  });
}

function handleGroundSlamAreas() {
  if (isCountingDown) return;
  processArr(groundSlamAreas, a => {
    a.timer -= gameSpeed;
    if (a.timer <= 0) {
      if (a.type === 'slam') {
        let cracks = [];
        for(let c=0; c<14; c++){ let ang = (PI2/14)*c + rand(-0.25,0.25), pts = [], r = 0, cAng = ang; while(r < 165) { r += rand(15,35); cAng += rand(-0.4,0.4); pts.push({x: Math.cos(cAng)*Math.min(r, 165), y: Math.sin(cAng)*Math.min(r, 165)}); } cracks.push(pts); }
        earthquakes.push({x: a.owner.x, y: a.owner.y, life: 60, cracks}); shakeTime = 25; shakeIntensity = 15;
        getValidEnemies(a.owner).forEach(t => { if (getObjDist(t, a.owner) <= 165 + t.radius) { t.applyDamage(25, a.owner); t.slowDuration = 180; } });
        spawnParticles(a.owner.x, a.owner.y, "#ff4757", 'sharp', 20);
      }
      return true;
    }
    return false;
  });
}

function handleBallCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let b1 = balls[i], b2 = balls[j];
      if (b1.hp <= 0 || b2.hp <= 0 || b1.isBurrowed || b2.isBurrowed || b1.isSwallowed() || b2.isSwallowed() || b1.isTransforming || b2.isTransforming || b1.isMovingToCenter || b2.isMovingToCenter) continue;
      let dx = b2.x - b1.x, dy = b2.y - b1.y, d = Math.hypot(dx, dy), minD = b1.radius + b2.radius;
      if (d < minD && d > 0) {
        let over = minD - d, nx = dx/d, ny = dy/d;
        b1.x -= nx*(over/2); b1.y -= ny*(over/2); b2.x += nx*(over/2); b2.y += ny*(over/2);
        let p = 2.0 * (nx*(b1.vx - b2.vx) + ny*(b1.vy - b2.vy)) / 2.0;
        if(b1.id !== 99 && !b1.gigaDashActive) { b1.vx -= p*nx; b1.vy -= p*ny; } 
        if(b2.id !== 99 && !b2.gigaDashActive) { b2.vx += p*nx; b2.vy += p*ny; }
        if (b1.bumpDmg > 0 && b1.pIndex !== b2.pIndex) b2.applyDamage(b1.bumpDmg, b1);
        if (b2.bumpDmg > 0 && b1.pIndex !== b2.pIndex) b1.applyDamage(b2.bumpDmg, b2);
      }
    }
  }
}

function handleBulletCollisions() {
  processArr(bullets, b => {
    b.update(); let hit = false;
    for (let t of balls) {
      if (t.hp <= 0 || t.pIndex === b.ownerIndex || t.isSwallowed() || t.isBurrowed || t.isTransforming || t.isMovingToCenter) continue;
      if (getObjDist(t, b) < t.radius + b.radius) {
        let o = balls.find(x => x.pIndex === b.ownerIndex && !x.isClone);
        if (b.type === 'dark_assassinate') {
          t.applyDamage(b.damage, o);
          if (o) {
            let rAng = rand(0, PI2), off = t.radius + o.radius + 15;
            o.x = t.x + Math.cos(rAng)*off; o.y = t.y + Math.sin(rAng)*off; o.isTeleportStabbing = true; o.vx = o.vy = 0;
            setTimeout(() => { o.isTeleportStabbing = false; if(o.hp > 0 && t.hp > 0 && !o.isDeadCompletely) { t.applyDamage(16, o); o.applyHeal(5); t.darkDebuffTimer = 180; textPopups.push(new TextPopup(t.x, t.y-20, "찌르기!", false)); createShockwave(t.x, t.y, 40, '#9b59b6'); } let mAng = rand(0,PI2); o.vx = Math.cos(mAng)*o.baseSpeed; o.vy = Math.sin(mAng)*o.baseSpeed; }, 300/gameSpeed);
          }
        } else {
          t.applyDamage(b.damage, o);
          if (b.type === 'elephant') { t.vx = Math.cos(b.angle)*16; t.vy = Math.sin(b.angle)*16; t.elephantWallBangReady = 60; t.elephantWallBangAttacker = o; }
          else if (b.type === 'ink_mark') { if (o) o.markedTargetId = t.pIndex; }
          else if (b.type === 'dark_bomb') { createShockwave(b.x, b.y, 40, "#741b7c"); if (o) o.applyHeal(5); }
          else if (b.type === 'dog_charm') dogPuddles.push({ x: t.x, y: t.y, timer: 240, ownerIndex: b.ownerIndex });
          else if (b.type === 'food_spinach') { t.electricDuration = 180; }
          else if (b.type === 'food_kimchi') { t.burnDuration = 180; }
        }
        spawnParticles(b.x, b.y, b.color, 'sharp', 8); hit = true; break;
      }
    }
    return hit || b.x < arenaLeft || b.x > arenaRight || b.y < arenaTop || b.y > arenaBottom || b.life <= 0;
  });
}

function startBattle() {
  ['main-home-screen', 'mode-select-screen', 'char-select-screen'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('game-container').style.display = 'flex';
  document.getElementById('p1-name').innerText = '1P ' + p1Selected.nickname; document.getElementById('p1-name').style.color = "var(--neon-red)";
  document.getElementById('p2-name').innerText = '2P ' + p2Selected.nickname; document.getElementById('p2-name').style.color = "var(--neon-green)";
  if (gameMode === 3) { document.getElementById('p3-name').innerText = '3P ' + p3Selected.nickname; document.getElementById('p3-name').style.color = "var(--neon-yellow)"; }

  balls = [];
  if (gameMode === 2 || gameMode === 4) { balls.push(new Ball(size*0.25, size*0.5, p1Selected, 0), new Ball(size*0.75, size*0.5, p2Selected, 1)); }
  else { let cX = size/2, cY = size/2 + 10, r = size*0.26; balls.push(new Ball(cX+Math.cos(-PI/2)*r, cY+Math.sin(-PI/2)*r, p1Selected, 0), new Ball(cX+Math.cos(PI/6)*r, cY+Math.sin(PI/6)*r, p2Selected, 1), new Ball(cX+Math.cos(5*PI/6)*r, cY+Math.sin(5*PI/6)*r, p3Selected, 2)); }
  
  updateUI();
  particles = []; bullets = []; groundSlamAreas = []; craters = []; soundwaves = []; textPopups = []; fanAttackPreviews = []; customGrabs = []; burrowPreviews = []; simonProjectiles = []; dominicProjectiles = []; seqLaserBullets = []; darkBombThreats = []; earthquakes = []; parkSwords = []; dogPuddles = []; activeDonations = []; monkeyRains = [];
  isCountingDown = true; countdownTimer = 3;
  const overlay = document.getElementById('countdown-overlay'); overlay.innerText = countdownTimer; overlay.style.display = 'block';
  
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownIntervalId = setInterval(() => {
    countdownTimer--;
    if (countdownTimer > 0) overlay.innerText = countdownTimer;
    else if (countdownTimer === 0) { overlay.innerText = "START!"; isCountingDown = false; balls.forEach(b => b.launch()); }
    else { overlay.style.display = 'none'; clearInterval(countdownIntervalId); }
  }, 1000);
  gameActive = true; animate();
}

function updateUI() {
  const aBalls = balls.filter(b => !b.isClone);
  const setUI = (pIdx, b) => {
    if(!b) return;
    if (b.id === 99) { document.getElementById(`p${pIdx}-hp-bar`).style.width = '100%'; document.getElementById(`p${pIdx}-hp-text`).innerText = '∞ / ∞'; document.getElementById(`p${pIdx}-cool-bar`).style.width = '0%'; return; }
    document.getElementById(`p${pIdx}-hp-bar`).style.width = `${b.hp / b.maxHp * 100}%`; document.getElementById(`p${pIdx}-hp-text`).innerText = `${Math.ceil(b.hp)}/${b.maxHp}`;
    
    if (b.id === 12) {
      let maxT = b.pilduLevel === 1 ? 20 * 60 : (b.pilduLevel === 2 ? 30 * 60 : 1);
      let curT = b.pilduLevel === 3 ? 0 : b.pilduUpgradeTimer;
      let cPct = b.pilduLevel === 3 ? 1 : Math.max(0, Math.min(1, 1 - (curT / maxT)));
      document.getElementById(`p${pIdx}-cool-bar`).style.width = `${cPct * 100}%`;
      document.getElementById(`p${pIdx}-cool-bar`).classList.toggle('ready-glow', b.pilduLevel === 3);
    } else {
      let cPct = Math.max(0, Math.min(1, 1 - (b.skillTimer / b.getMaxCooldown())));
      document.getElementById(`p${pIdx}-cool-bar`).style.width = `${cPct * 100}%`;
      document.getElementById(`p${pIdx}-cool-bar`).classList.toggle('ready-glow', cPct >= 1);
    }
  };
  setUI(1, aBalls[0]); setUI(2, aBalls[1]); if(gameMode === 3) setUI(3, aBalls[2]);
}

function checkGameEnd() {
  if (!gameActive) return;
  let alive = balls.filter(b => b.hp > 0 && !b.isClone);
  if (gameMode === 4) { if (alive.filter(p => p.id !== 99).length === 0) { gameActive = false; document.getElementById('result-screen').style.display = 'flex'; document.getElementById('result-title').innerText = "PRACTICE OVER"; document.getElementById('result-title').style.color = "#fff"; } return; }
  if (alive.length <= 1) {
    gameActive = false; const screen = document.getElementById('result-screen'), title = document.getElementById('result-title'); screen.style.display = 'flex';
    if(alive.length === 1) { title.innerText = `${alive[0].pIndex + 1}P ${alive[0].nickname} WIN! 🎉`; title.style.color = alive[0].color; }
    else { title.innerText = "DRAW! ⚖️"; title.style.color = "#fff"; }
  }
}

function drawParkSwords() { parkSwords.forEach(s => { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.state === 'fire' ? s.angle : -PI/4); ctx.fillStyle = "#00ffff"; ctx.shadowBlur = 10; ctx.shadowColor = "#00ffff"; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(0, -6); ctx.lineTo(-10, 0); ctx.lineTo(0, 6); ctx.fill(); ctx.restore(); }); }
function drawMonkeyRains() { monkeyRains.forEach(m => { ctx.save(); ctx.translate(m.x, m.y); ctx.font = "50px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowBlur = 8; ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.fillText("🐒", 0, 0); ctx.restore(); }); }

function animate() {
  if (!gameActive) return;
  requestAnimationFrame(animate);
  balls.forEach(b => b.update());
  handleBallCollisions(); handleBulletCollisions(); handleCustomGrabs(); handleGongSkills(); handleGroundSlamAreas(); handleParkSwords(); handleDogPuddles(); handleMonkeyRains();

  ctx.save();
  if (shakeTime > 0) { ctx.translate(rand(-shakeIntensity, shakeIntensity), rand(-shakeIntensity, shakeIntensity)); shakeTime -= gameSpeed; }
  ctx.fillStyle = flashBgColor || '#06060c'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  dogPuddles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 55, 0, PI2); ctx.fillStyle = "rgba(139, 69, 19, 0.2)"; ctx.strokeStyle = "rgba(139, 69, 19, 0.6)"; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; ctx.lineWidth = 8; ctx.strokeRect(0, 0, size, size);

  processArr(earthquakes, eq => {
    eq.life -= gameSpeed; if (eq.life <= 0) return true;
    ctx.save(); ctx.translate(eq.x, eq.y); ctx.strokeStyle = `rgba(255, 71, 87, ${eq.life / 60})`; ctx.lineWidth = 3 + (eq.life / 20); ctx.shadowBlur = 10; ctx.shadowColor = "#ff4757";
    eq.cracks.forEach(cr => { ctx.beginPath(); ctx.moveTo(0, 0); cr.forEach(pt => ctx.lineTo(pt.x, pt.y)); ctx.stroke(); }); ctx.restore(); return false;
  });

  processArr(craters, c => {
    c.life -= gameSpeed; if (c.life <= 0) return true;
    ctx.save(); ctx.strokeStyle = `rgba(180, 70, 40, ${c.life / 120})`; ctx.lineWidth = 2.5;
    if (c.isEnhanced) { ctx.beginPath(); ctx.arc(c.x, c.y, c.maxRadius * 0.15, 0, PI2); ctx.stroke(); c.cracks.forEach(cr => { ctx.beginPath(); ctx.moveTo(c.x, c.y); let eX = c.x + Math.cos(cr.angle)*c.maxRadius*cr.lengthMult, eY = c.y + Math.sin(cr.angle)*c.maxRadius*cr.lengthMult, mX = c.x + Math.cos(cr.angle+cr.branches[0])*c.maxRadius*cr.lengthMult*0.5, mY = c.y + Math.sin(cr.angle+cr.branches[0])*c.maxRadius*cr.lengthMult*0.5; ctx.lineTo(mX, mY); ctx.lineTo(eX, eY); ctx.stroke(); if (c.life > 40) { ctx.beginPath(); ctx.moveTo(mX, mY); ctx.lineTo(mX + Math.cos(cr.angle+0.8)*25, mY + Math.sin(cr.angle+0.8)*25); ctx.stroke(); } }); }
    else { ctx.beginPath(); ctx.arc(c.x, c.y, c.maxRadius * (1 - c.life / 120), 0, PI2); ctx.stroke(); } ctx.restore(); return false;
  });

  processArr(soundwaves, s => {
    s.life -= 1.5 * gameSpeed; s.radius += 12 * gameSpeed; if (s.life <= 0) return true;
    ctx.save(); ctx.globalAlpha = Math.max(0, s.life / 60); ctx.strokeStyle = s.color || '#f1c40f'; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.shadowBlur = 15; ctx.shadowColor = s.color || "#f1c40f"; ctx.beginPath();
    if (s.isFullCircle) ctx.arc(s.x, s.y, s.radius, 0, PI2); else ctx.arc(s.x, s.y, s.radius, s.angle - PI/3, s.angle + PI/3);
    ctx.stroke(); ctx.restore(); return false;
  });

  processArr(darkBombThreats, t => {
    t.timer -= gameSpeed; if (t.timer <= 0 || t.target.hp <= 0) return true;
    ctx.save(); ctx.strokeStyle = "rgba(147, 112, 219, 0.7)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(t.owner.x, t.owner.y); ctx.lineTo(t.target.x, t.target.y); ctx.stroke(); ctx.fillStyle = "#ff00ff"; ctx.font = "bold 9px sans-serif"; ctx.fillText("위협 조준", t.target.x - 15, t.target.y - t.target.radius - 5); ctx.restore(); return false;
  });

  burrowPreviews.forEach(p => { ctx.save(); ctx.strokeStyle = "rgba(230, 126, 34, 0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, PI2); ctx.stroke(); ctx.restore(); });
  
  processArr(fanAttackPreviews, p => {
    p.timer -= gameSpeed; if (p.timer <= 0) return true;
    ctx.save(); ctx.fillStyle = "rgba(241, 196, 15, 0.25)"; ctx.strokeStyle = "rgba(241, 196, 15, 0.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.owner.x, p.owner.y); ctx.arc(p.owner.x, p.owner.y, size*1.2, p.targetAngle - PI/3, p.targetAngle + PI/3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); return false;
  });

  customGrabs.forEach(g => { if (g.type !== 'hack_link') { ctx.save(); ctx.strokeStyle = g.owner.color; ctx.lineWidth = 3.5; ctx.shadowBlur = 10; ctx.shadowColor = g.owner.color; ctx.beginPath(); ctx.moveTo(g.owner.x, g.owner.y); ctx.lineTo(g.x, g.y); ctx.stroke(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.x, g.y, 6, 0, PI2); ctx.fill(); ctx.restore(); } });

  balls.forEach(b => {
    if ((b.id === 5 || b.id === 9) && b.voiceLaserActive && b.laserSegments) {
      ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y); for(let k=1; k<b.laserSegments.length; k++) ctx.lineTo(b.laserSegments[k].x, b.laserSegments[k].y);
      let oCol = b.enhancedLaser ? "rgba(0, 168, 255, 0.3)" : "rgba(255, 140, 0, 0.3)", iCol = b.enhancedLaser ? "rgba(0, 255, 255, 0.7)" : "rgba(255, 200, 0, 0.7)", sCol = b.enhancedLaser ? "#00a8ff" : "#ff8c00";
      ctx.strokeStyle = oCol; ctx.lineWidth = 26 + Math.sin(Date.now()/40)*6; ctx.shadowBlur = 24; ctx.shadowColor = sCol; ctx.stroke(); ctx.strokeStyle = iCol; ctx.lineWidth = 12; ctx.shadowBlur = 12; ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.shadowBlur = 6; ctx.stroke(); ctx.restore();
    }
    if (!b.voiceLaserActive && b.laserFadeTimer > 0 && b.laserSegments) {
      ctx.save(); ctx.globalAlpha = b.laserFadeTimer / 30;
      if (b.id === 6) { ctx.strokeStyle = "#9b59b6"; ctx.lineWidth = 8; ctx.lineCap ="round"; ctx.beginPath(); ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y); ctx.lineTo(b.laserSegments[1].x, b.laserSegments[1].y); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.stroke(); }
      else { ctx.strokeStyle = b.enhancedLaser ? "rgba(0, 168, 255, 0.5)" : "rgba(230, 126, 34, 0.5)"; ctx.lineWidth = 28; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(b.laserSegments[0].x, b.laserSegments[0].y); for(let k=1; k<b.laserSegments.length; k++) ctx.lineTo(b.laserSegments[k].x, b.laserSegments[k].y); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 8; ctx.stroke(); } ctx.restore();
    }
    if (b.tvBeamActive) { ctx.save(); ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"; ctx.lineWidth = 5; ctx.shadowBlur = 10; ctx.shadowColor = "#ff0000"; let bAngs = [b.tvBeamAngle, b.tvBeamAngle + PI/2, b.tvBeamAngle + PI, b.tvBeamAngle + PI*1.5]; ctx.beginPath(); bAngs.forEach(a => { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(a)*size*1.5, b.y + Math.sin(a)*size*1.5); }); ctx.stroke(); ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"; ctx.lineWidth = 2.5; ctx.shadowBlur = 0; ctx.beginPath(); bAngs.forEach(a => { ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(a)*size*1.5, b.y + Math.sin(a)*size*1.5); }); ctx.stroke(); ctx.restore(); }
    if (b.gongLaserActive) { ctx.save(); let angs = [b.gongLaserAngle, b.gongLaserAngle + PI2/3, b.gongLaserAngle + PI2*2/3]; ctx.strokeStyle = "rgba(0, 255, 255, 0.8)"; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = "#00ffff"; angs.forEach(a => { ctx.beginPath(); let cX = b.x, cY = b.y; ctx.moveTo(cX, cY); for(let s=0; s<12; s++) { cX += Math.cos(a)*(size*1.5/12) + rand(-15,15); cY += Math.sin(a)*(size*1.5/12) + rand(-15,15); ctx.lineTo(cX, cY); } ctx.stroke(); }); ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"; ctx.lineWidth = 2; ctx.shadowBlur = 0; angs.forEach(a => { ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(a)*size*1.5, b.y + Math.sin(a)*size*1.5); ctx.stroke(); }); ctx.restore(); }
  });

  if (bullets) bullets.forEach(b => b.draw());
  if (simonProjectiles) simonProjectiles.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.shadowBlur = 10; ctx.shadowColor = p.color || "#fff"; ctx.fillStyle = p.color || "#fff"; ctx.font = "900 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.text, 0, 0); ctx.fillStyle = "#fff"; ctx.fillText(p.text, 0, 0); ctx.restore(); });
  if (dominicProjectiles) dominicProjectiles.forEach(d => {
    let dR = d.type === 'data_grenade' ? 87.975 : 38.8125, rC = d.type === 'data_grenade' ? "rgba(0, 255, 0, 0.5)" : "rgba(0, 255, 255, 0.5)", rF = d.type === 'data_grenade' ? "rgba(0, 255, 0, 0.1)" : "rgba(0, 255, 255, 0.1)";
    if (!d.isArrived || (d.type === 'data_grenade' && d.explosionTimer > 0)) { let cX = d.isArrived ? d.x : (d.tx || d.x), cY = d.isArrived ? d.y : (d.ty || d.y); ctx.save(); ctx.beginPath(); ctx.arc(cX, cY, dR, 0, PI2); ctx.strokeStyle = rC; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.fillStyle = rF; ctx.fill(); ctx.restore(); }
    if (!d.isArrived) { ctx.save(); ctx.translate(d.x, d.y); ctx.shadowBlur = 10; ctx.shadowColor = d.color; ctx.fillStyle = d.color; ctx.font = "900 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(d.text, 0, 0); ctx.fillStyle = "#fff"; ctx.fillText(d.text, 0, 0); ctx.restore(); }
  });

  drawParkSwords(); drawMonkeyRains(); balls.forEach(b => b.draw());
  processArr(particles, p => { p.update(); p.draw(); return p.alpha <= 0; });
  processArr(textPopups, t => { t.update(); t.draw(); return t.alpha <= 0; });

  processArr(seqLaserBullets, l => {
    l.life -= gameSpeed;
    if (l.life <= 0) return true;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 71, 87, ${l.life/20})`;
    ctx.lineWidth = 12;
    ctx.shadowBlur = 15;
    ctx.shadowColor = l.color;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(l.x + Math.cos(l.angle) * size * 2.5, l.y + Math.sin(l.angle) * size * 2.5);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, ${l.life/20})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    return false;
  });

  let dYOffset = 40;
  processArr(activeDonations, d => {
    d.timer -= gameSpeed; if (d.timer <= 0) return true;
    ctx.save(); ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowBlur = 5; ctx.shadowColor = d.color; ctx.fillText(d.text, size/2, dYOffset); ctx.restore(); dYOffset += 20; return false;
  });

  ctx.restore(); updateUI(); checkGameEnd();
}
