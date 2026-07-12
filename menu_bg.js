/**
 * Cannon Shooter – Animated Main Menu Background
 * Renders: blue sky, parallax mountains, drifting clouds,
 *          flying balls, rising smoke, soft particles, moving lights.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('menu-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    let animId = null;

    function resize() {
        W = canvas.width = canvas.parentElement.clientWidth;
        H = canvas.height = canvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    /* ── helpers ─────────────────────────────────────────── */
    const rand = (a, b) => a + Math.random() * (b - a);
    const lerp = (a, b, t) => a + (b - a) * t;

    /* ── colour palette ─────────────────────────────────── */
    const SKY_TOP    = '#1a3a5c';
    const SKY_MID    = '#3b7dd8';
    const SKY_BOT    = '#87ceeb';
    const SUN_COLOR  = '#ffe588';

    /* ── MOUNTAINS (3 parallax layers) ──────────────────── */
    function buildMountainLayer(peaks, baseY, maxH, color) {
        const pts = [];
        const segW = W / peaks;
        for (let i = 0; i <= peaks; i++) {
            pts.push({
                x: i * segW,
                y: baseY - rand(maxH * 0.3, maxH)
            });
        }
        return { pts, baseY, color };
    }

    let mountains = [];
    function initMountains() {
        mountains = [
            buildMountainLayer(5, H * 0.78, H * 0.28, 'rgba(30,60,90,0.9)'),
            buildMountainLayer(7, H * 0.85, H * 0.22, 'rgba(50,90,130,0.85)'),
            buildMountainLayer(9, H * 0.92, H * 0.15, 'rgba(70,120,160,0.8)')
        ];
    }
    initMountains();
    window.addEventListener('resize', initMountains);

    function drawMountains(t) {
        mountains.forEach((layer, li) => {
            const drift = Math.sin(t * 0.0001 * (li + 1)) * 6;
            ctx.beginPath();
            ctx.moveTo(-10, H + 10);
            layer.pts.forEach((p, i) => {
                const px = p.x + drift;
                const py = p.y + Math.sin(t * 0.0003 + i) * 3;
                if (i === 0) ctx.lineTo(px, py);
                else {
                    const prev = layer.pts[i - 1];
                    const cpx = (prev.x + drift + px) / 2;
                    const cpy = Math.min(prev.y, py) - 10;
                    ctx.quadraticCurveTo(cpx, cpy, px, py);
                }
            });
            ctx.lineTo(W + 10, H + 10);
            ctx.closePath();
            ctx.fillStyle = layer.color;
            ctx.fill();
        });
    }

    /* ── CLOUDS ──────────────────────────────────────────── */
    class Cloud {
        constructor() { this.reset(true); }
        reset(init) {
            this.y = rand(H * 0.05, H * 0.45);
            this.w = rand(120, 300);
            this.h = rand(30, 60);
            this.speed = rand(0.15, 0.6);
            this.opacity = rand(0.25, 0.6);
            this.x = init ? rand(-this.w, W + this.w) : -this.w - 20;
        }
        update() {
            this.x += this.speed;
            if (this.x > W + this.w + 20) this.reset(false);
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#ffffff';
            const cx = this.x + this.w / 2;
            const cy = this.y + this.h / 2;
            // composite ellipses for soft cloud shape
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                const ox = (i - 2) * this.w * 0.18;
                const oy = Math.abs(i - 2) * this.h * 0.15;
                const rw = this.w * (0.28 - Math.abs(i - 2) * 0.04);
                const rh = this.h * (0.6 - Math.abs(i - 2) * 0.08);
                ctx.ellipse(cx + ox, cy - oy, rw, rh, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const clouds = Array.from({ length: 8 }, () => new Cloud());

    /* ── FLYING BALLS ───────────────────────────────────── */
    const BALL_COLORS = ['#ff5f5f', '#5fff5f', '#5f5fff', '#ffff5f', '#ff5fff', '#ff8844', '#44ffcc'];

    class FlyingBall {
        constructor() { this.reset(true); }
        reset(init) {
            this.radius = rand(10, 30);
            this.x = init ? rand(0, W) : rand(-80, -20);
            this.y = rand(H * 0.15, H * 0.75);
            this.vx = rand(0.3, 1.2);
            this.vy = rand(-0.5, 0.5);
            this.baseY = this.y;
            this.amp = rand(15, 50);
            this.freq = rand(0.001, 0.004);
            this.phase = rand(0, Math.PI * 2);
            this.color = BALL_COLORS[Math.floor(rand(0, BALL_COLORS.length))];
            this.opacity = rand(0.35, 0.7);
            this.rotation = 0;
            this.rotSpeed = rand(-0.02, 0.02);
            this.health = Math.floor(rand(5, 50));
        }
        update(t) {
            this.x += this.vx;
            this.y = this.baseY + Math.sin(t * this.freq + this.phase) * this.amp;
            this.baseY += this.vy * 0.1;
            this.rotation += this.rotSpeed;
            if (this.x > W + this.radius + 40) this.reset(false);
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // glow
            const grd = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius * 1.6);
            grd.addColorStop(0, this.color + '55');
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.fillRect(-this.radius * 2, -this.radius * 2, this.radius * 4, this.radius * 4);

            // ball body
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // health label
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `bold ${Math.max(9, this.radius * 0.55)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.health, 0, 1);

            ctx.restore();
        }
    }

    const flyingBalls = Array.from({ length: 6 }, () => new FlyingBall());

    /* ── SMOKE PUFFS ────────────────────────────────────── */
    class SmokePuff {
        constructor() { this.reset(); }
        reset() {
            this.x = rand(W * 0.1, W * 0.9);
            this.y = H + rand(10, 40);
            this.radius = rand(15, 45);
            this.vy = -rand(0.2, 0.7);
            this.vx = rand(-0.2, 0.2);
            this.life = 1;
            this.decay = rand(0.001, 0.004);
            this.grow = rand(0.05, 0.15);
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.radius += this.grow;
            this.life -= this.decay;
            if (this.life <= 0) this.reset();
        }
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life * 0.3;
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            g.addColorStop(0, 'rgba(200,210,220,0.6)');
            g.addColorStop(1, 'rgba(200,210,220,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const smokePuffs = Array.from({ length: 14 }, () => new SmokePuff());

    /* ── SOFT PARTICLES ─────────────────────────────────── */
    class Particle {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = rand(0, W);
            this.y = init ? rand(0, H) : H + 10;
            this.radius = rand(1.5, 4);
            this.vy = -rand(0.15, 0.5);
            this.vx = rand(-0.15, 0.15);
            this.life = 1;
            this.decay = rand(0.0005, 0.002);
            this.twinkleSpeed = rand(0.003, 0.008);
            this.twinklePhase = rand(0, Math.PI * 2);
            const hue = rand(190, 220);
            this.color = `hsla(${hue}, 80%, 80%, `;
        }
        update(t) {
            this.x += this.vx + Math.sin(t * 0.001 + this.twinklePhase) * 0.1;
            this.y += this.vy;
            this.life -= this.decay;
            if (this.life <= 0 || this.y < -10) this.reset(false);
        }
        draw(t) {
            const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * this.twinkleSpeed + this.twinklePhase));
            const alpha = this.life * twinkle;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + alpha.toFixed(3) + ')';
            ctx.fill();
        }
    }

    const particles = Array.from({ length: 40 }, () => new Particle());

    /* ── MOVING LIGHTS / LIGHT BEAMS ────────────────────── */
    class LightBeam {
        constructor() { this.reset(); }
        reset() {
            this.x = rand(-W * 0.2, W * 1.2);
            this.w = rand(60, 200);
            this.speed = rand(0.2, 0.8);
            this.angle = rand(-0.3, 0.3);
            this.opacity = rand(0.03, 0.09);
            this.hue = rand(190, 230);
        }
        update() {
            this.x += this.speed;
            if (this.x > W + this.w + 100) {
                this.x = -this.w - rand(50, 200);
                this.reset();
                this.x = -this.w - rand(50, 200);
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, 0);
            ctx.rotate(this.angle);

            const g = ctx.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, `hsla(${this.hue}, 90%, 85%, 0.6)`);
            g.addColorStop(0.5, `hsla(${this.hue}, 80%, 75%, 0.15)`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(-this.w / 2, -20, this.w, H + 40);

            ctx.restore();
        }
    }

    const lightBeams = Array.from({ length: 4 }, () => new LightBeam());

    /* ── SUN ─────────────────────────────────────────────── */
    function drawSun(t) {
        const sx = W * 0.82;
        const sy = H * 0.12;
        const pulse = 1 + 0.05 * Math.sin(t * 0.001);

        // outer glow
        const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, 160 * pulse);
        g.addColorStop(0, 'rgba(255,229,136,0.6)');
        g.addColorStop(0.4, 'rgba(255,200,80,0.15)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(sx - 200, sy - 200, 400, 400);

        // sun disc
        ctx.beginPath();
        ctx.arc(sx, sy, 32 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = SUN_COLOR;
        ctx.fill();
    }

    /* ── SKY GRADIENT ───────────────────────────────────── */
    function drawSky() {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, SKY_TOP);
        g.addColorStop(0.45, SKY_MID);
        g.addColorStop(1, SKY_BOT);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    /* ── MAIN LOOP ──────────────────────────────────────── */
    function frame(t) {
        ctx.clearRect(0, 0, W, H);

        // 1 – sky
        drawSky();

        // 2 – sun
        drawSun(t);

        // 3 – light beams (behind clouds)
        lightBeams.forEach(l => { l.update(); l.draw(); });

        // 4 – clouds
        clouds.forEach(c => { c.update(); c.draw(); });

        // 5 – mountains
        drawMountains(t);

        // 6 – smoke rising from ground
        smokePuffs.forEach(s => { s.update(); s.draw(); });

        // 7 – flying balls
        flyingBalls.forEach(b => { b.update(t); b.draw(); });

        // 8 – soft particles
        particles.forEach(p => { p.update(t); p.draw(t); });

        animId = requestAnimationFrame(frame);
    }

    /* ── visibility: only animate when main-menu is visible ── */
    function startAnim() {
        if (!animId) animId = requestAnimationFrame(frame);
    }
    function stopAnim() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
    }

    // Observe main-menu visibility
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        const obs = new MutationObserver(() => {
            if (mainMenu.classList.contains('hidden')) stopAnim();
            else { resize(); startAnim(); }
        });
        obs.observe(mainMenu, { attributes: true, attributeFilter: ['class'] });
    }

    startAnim();
})();
