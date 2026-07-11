const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let w, h;
let running = false;
let paused = false;
let combo = 0;
let score = 0;
let lives = 3;
let nodes = [];
let pulses = [];
let particles = [];
let lastTime = 0;
let nextPulse = 0;
let maxPulses = 1;

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const scoreText = document.getElementById("score");
const startButton = document.getElementById("startButton");
const pauseBtn = document.getElementById("pauseBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const comboText = document.getElementById("combo");
const levelText = document.getElementById("level");
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    createNodes();
}

window.addEventListener("resize", resize);

function createNodes() {
    nodes = [];

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.34;

    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;

        nodes.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            active: false,
            pulse: 0
        });
    }
}

function createParticles() {
    particles = [];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.8 + 0.4,
            speed: Math.random() * 12 + 5
        });
    }
}

resize();
createParticles();

function spawnPulse() {
    const target = Math.floor(Math.random() * nodes.length);

    pulses.push({
        x: w / 2,
        y: h / 2,
        target,
        progress: 0,
        speed: 0.16 + Math.min(score * 0.003, 0.18),
        resolved: false
    });
}

function startGame() {
    score = 0;
    maxPulses = 1;
    lives = 3;
    combo = 0;
comboText.textContent = combo;
    pulses = [];
    running = true;
    nextPulse = 0.8;

    nodes.forEach(node => node.active = false);

    scoreText.textContent = score;

    menu.classList.add("hidden");
    hud.classList.remove("hidden");
}

startButton.addEventListener("click", startGame);

    pauseBtn.onclick = () => {

    paused = !paused;

    pauseBtn.textContent = paused ? "▶" : "⏸";

};

fullscreenBtn.onclick = async () => {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen?.();

    } else {

        document.exitFullscreen?.();

    }

};

canvas.addEventListener("pointerdown", event => {
    if (!running) return;

    const x = event.clientX;
    const y = event.clientY;

    for (const node of nodes) {
        const distance = Math.hypot(x - node.x, y - node.y);

        if (distance < 48) {
            node.active = !node.active;
            node.pulse = 1;
            break;
        }
    }
});

function update(dt) {

    if (paused) return;
    for (const particle of particles) {
        particle.y -= particle.speed * dt;

        if (particle.y < -5) {
            particle.y = h + 5;
            particle.x = Math.random() * w;
        }
    }

    for (const node of nodes) {
        node.pulse = Math.max(0, node.pulse - dt * 3);
    }

    if (!running) return;

    nextPulse -= dt;

    if (score >= 8) maxPulses = 2;
if (score >= 20) maxPulses = 3;
if (score >= 40) maxPulses = 4;
    levelText.textContent = maxPulses;

if (nextPulse <= 0) {

    if (pulses.length < maxPulses) {
        spawnPulse();
    }

    nextPulse = Math.max(
        0.45,
        1.4 - score * 0.02
    );

}

    for (const pulse of pulses) {
        if (pulse.resolved) continue;

        pulse.progress += pulse.speed * dt;

        if (pulse.progress >= 1) {
            pulse.resolved = true;

            const targetNode = nodes[pulse.target];

            if (targetNode.active) {
                combo++;
score += combo;
scoreText.textContent = score;
comboText.textContent = combo;

                targetNode.active = false;
                targetNode.pulse = 1;
            } else {
                lives--;
                combo = 0;
comboText.textContent = combo;
                targetNode.pulse = 1;

                if (lives <= 0) {
                    endGame();
                }
            }
        }
    }

    pulses = pulses.filter(
        pulse => !pulse.resolved
    );
}

function endGame() {
    running = false;

    setTimeout(() => {
        menu.classList.remove("hidden");
        hud.classList.add("hidden");

        const subtitle = menu.querySelector("p");
        subtitle.textContent =
            "Runde beendet · " + score + " Punkte";

        startButton.textContent = "Nochmal spielen";
    }, 500);
}

function drawBackground() {
    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, w, h);

    for (const particle of particles) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(120,220,255,.35)";
        ctx.arc(
            particle.x,
            particle.y,
            particle.r,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function drawNetwork() {
    const cx = w / 2;
    const cy = h / 2;

    for (const node of nodes) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = "rgba(80,180,255,.18)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    const colors=[
"#8eeaff",
"#7dffda",
"#fff27b",
"#ffb347",
"#ff6b9c"
];

ctx.fillStyle=
colors[
Math.min(combo,4)
];
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#43d7ff";
    ctx.fill();
    ctx.shadowBlur = 0;


    for (const node of nodes) {
        const glow =
    node.active
        ? Math.sin(performance.now()/180)*5+5
        : 0;

const size = 27 + node.pulse * 8 + glow;

        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);

        ctx.fillStyle = node.active
            ? "#43d7ff"
            : "#16253d";

        ctx.shadowBlur = node.active ? 25 : 5;
        ctx.shadowColor = "#43d7ff";
        ctx.fill();
        ctx.shadowBlur = 0;

        }
        if (node.active) {

    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 10, 0, Math.PI * 2);

    ctx.strokeStyle = "rgba(90,220,255,.45)";
    ctx.lineWidth = 3;
    ctx.stroke();

}
    

function drawPulses() {
    const cx = w / 2;
    const cy = h / 2;

    for (const pulse of pulses) {
        const target = nodes[pulse.target];

        const x =
            cx + (target.x - cx) * pulse.progress;

        const y =
            cy + (target.y - cy) * pulse.progress;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);

        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#7be7ff";
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function drawLives() {
    if (!running) return;

    ctx.font = "18px sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText(
        "◆ ".repeat(lives),
        w - 20,
        35
    );
}

function loop(time) {
    const dt = Math.min(
        (time - lastTime) / 1000 || 0,
        0.05
    );

    lastTime = time;

    update(dt);
    drawBackground();
    drawNetwork();
    drawPulses();
    drawLives();


    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
