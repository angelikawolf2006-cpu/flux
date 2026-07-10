const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let w, h;

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const scoreText = document.getElementById("score");
const startButton = document.getElementById("startButton");

let running = false;
let score = 0;

const particles = [];

for (let i = 0; i < 80; i++) {
    particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        s: Math.random() * 0.5 + 0.2
    });
}

const nodes = [];

function createNodes() {
    nodes.length = 0;

    const radius = Math.min(w, h) * 0.28;

    for (let i = 0; i < 7; i++) {

        const a = (Math.PI * 2 / 7) * i - Math.PI / 2;

        nodes.push({
            x: w / 2 + Math.cos(a) * radius,
            y: h / 2 + Math.sin(a) * radius,
            active: false
        });
    }
}

createNodes();

let current = 0;

function chooseTarget() {

    nodes.forEach(n => n.active = false);

    current = Math.floor(Math.random() * nodes.length);

    nodes[current].active = true;

}

chooseTarget();

canvas.addEventListener("pointerdown", e => {

    if (!running) return;

    const x = e.clientX;
    const y = e.clientY;

    nodes.forEach((n, i) => {

        const d = Math.hypot(x - n.x, y - n.y);

        if (d < 35) {

            if (i === current) {

                score++;

                scoreText.textContent = score;

                chooseTarget();

            }

        }

    });

});

startButton.onclick = () => {

    running = true;

    menu.classList.add("hidden");

    hud.classList.remove("hidden");

};

function drawBackground() {

    ctx.fillStyle = "#050914";
    ctx.fillRect(0, 0, w, h);

    particles.forEach(p => {

        ctx.beginPath();
        ctx.fillStyle = "rgba(120,220,255,.5)";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.s;

        if (p.y < -5) {
            p.y = h + 5;
            p.x = Math.random() * w;
        }

    });

}

function drawNetwork() {

    ctx.strokeStyle = "rgba(100,180,255,.15)";

    for (let i = 0; i < nodes.length; i++) {

        for (let j = i + 1; j < nodes.length; j++) {

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

        }

    }

    nodes.forEach(n => {

        ctx.beginPath();

        ctx.arc(n.x, n.y, 28, 0, Math.PI * 2);

        ctx.fillStyle = n.active
            ? "#43d7ff"
            : "#16253d";

        ctx.fill();

    });

}

function loop() {

    drawBackground();

    drawNetwork();

    requestAnimationFrame(loop);

}

loop();
