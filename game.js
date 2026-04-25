/**
 * Cannon Shooter - Core Game Engine
 * Handles physics, collision, and rendering.
 */

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = 10;
        this.active = true;
    }

    update() {
        this.y -= this.speed;
        if (this.y < 0) this.active = false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0070ea';
        ctx.fill();
        ctx.closePath();
    }
}

class Ball {
    constructor(canvas, x, y, size, health, vx) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.size = size; // radius
        this.maxHealth = health;
        this.health = health;
        this.vx = vx || (Math.random() - 0.5) * 4;
        this.vy = 0;
        this.gravity = 0.15;
        this.active = true;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#ff5f5f', '#5fff5f', '#5f5fff', '#ffff5f', '#ff5fff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Ground collision: Reset velocity for perpetual bounce
        if (this.y + this.size > this.canvas.height) {
            this.y = this.canvas.height - this.size;
            // Calculate velocity needed to reach the top of the screen (y = 0)
            // v = sqrt(2 * gravity * distance)
            const distance = this.canvas.height - this.size;
            this.vy = -Math.sqrt(2 * this.gravity * distance);
        }

        // Wall collision
        if (this.x - this.size < 0) {
            this.x = this.size;
            this.vx *= -1;
        } else if (this.x + this.size > this.canvas.width) {
            this.x = this.canvas.width - this.size;
            this.vx *= -1;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw health percentage
        ctx.fillStyle = 'white';
        ctx.font = `${this.size * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(this.health), this.x, this.y + (this.size * 0.2));
    }
}

class ShieldDrop {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.x = x;
        this.y = -30;
        this.radius = 25;
        this.vy = 2; // Slow fall
        this.active = true;
        this.isOnGround = false;
        this.groundTime = 0;
    }

    update() {
        if (!this.isOnGround) {
            this.y += this.vy;
            if (this.y + this.radius >= this.canvas.height) {
                this.y = this.canvas.height - this.radius;
                this.isOnGround = true;
                this.groundTime = Date.now();
            }
        } else {
            // Disappear after 6 seconds on the ground
            if (Date.now() - this.groundTime > 6000) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = 'rgba(0, 150, 255, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#00bbff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.radius * 0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🛡️', this.x, this.y + (this.radius * 0.3));
    }
}

class DoubleFireDrop {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.x = x;
        this.y = -30;
        this.radius = 25;
        this.vy = 2.5; // Slightly faster fall
        this.active = true;
        this.isOnGround = false;
        this.groundTime = 0;
    }

    update() {
        if (!this.isOnGround) {
            this.y += this.vy;
            if (this.y + this.radius >= this.canvas.height) {
                this.y = this.canvas.height - this.radius;
                this.isOnGround = true;
                this.groundTime = Date.now();
            }
        } else {
            // Disappear after 5 seconds on the ground
            if (Date.now() - this.groundTime > 5000) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = 'rgba(255, 165, 0, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.radius * 0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⚡', this.x, this.y + (this.radius * 0.3));
    }
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cannonSprite = new Image();
        this.cannonSprite.src = 'cannon_sprite.png';
        
        this.cannon = {
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            targetX: 0
        };

        this.bullets = [];
        this.balls = [];
        this.score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.lastFireTime = 0;
        this.fireRate = 150; // ms
        this.isFiring = false;
        
        // Shield System
        this.shieldDrops = [];
        this.lastShieldTime = Date.now();
        this.shieldInterval = 100000; // ~1.6 mins
        this.cannon.isShielded = false;
        this.cannon.shieldEndTime = 0;
        
        // Double Fire System
        this.doubleFireDrops = [];
        this.lastDoubleFireTime = Date.now() + 20000; // Offset initial drop
        this.doubleFireInterval = 110000; 
        this.cannon.isDoubleFire = false;
        this.cannon.doubleFireEndTime = 0;
        
        // Stats Tracking
        this.totalShots = 0;
        this.hits = 0;
        this.startTime = 0;
        this.difficulty = 1.0;

        // Audio
        this.audioCtx = null;
        this.shootBuffer = null;     // Decoded AudioBuffer for the shoot MP3
        this.shootRawBuffer = null;  // Raw ArrayBuffer fetched from shoot.mp3
        this.musicVolume = 0.6;      // Cannon shoot sound volume (Music slider, default 60%)
        this.masterVolume = 0.8;     // Hit/destroy sound volume (Master Volume slider, default 80%)
        this.loadShootAudio();       // Pre-fetch immediately

        this.init();
    }

    /**
     * Returns the shared AudioContext, resuming it if suspended.
     * Must be first CREATED inside handlePointerDown (a true user gesture).
     */
    getAudioCtx() {
        if (!this.audioCtx) {
            // Fallback creation (shouldn't normally happen)
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if browser suspended it
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    /** Pre-fetch the shoot MP3 as a raw ArrayBuffer (no AudioContext needed yet). */
    async loadShootAudio() {
        try {
            const response = await fetch('shoot.mp3');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.shootRawBuffer = await response.arrayBuffer();
        } catch (e) {
            console.warn('Could not load shoot.mp3:', e);
        }
    }

    /** Decode the raw buffer into an AudioBuffer once the AudioContext exists. */
    async decodeShootAudio() {
        if (this.shootBuffer || !this.shootRawBuffer || !this.audioCtx) return;
        try {
            // slice(0) so the original ArrayBuffer stays intact if needed again
            this.shootBuffer = await this.audioCtx.decodeAudioData(this.shootRawBuffer.slice(0));
        } catch (e) {
            console.warn('Could not decode shoot.mp3:', e);
        }
    }

    /** Play a short burst of the machine-gun sound each time a bullet fires. */
    playShootSound() {
        if (!this.audioCtx || !this.shootBuffer) return;
        try {
            const ctx = this.audioCtx;
            const source = ctx.createBufferSource();
            source.buffer = this.shootBuffer;

            // Volume driven by the Music slider
            const gain = ctx.createGain();
            gain.gain.value = this.musicVolume;

            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(ctx.currentTime);
            // Play only a short burst (150 ms) matching the fire rate
            source.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.warn('Shoot sound error:', e);
        }
    }

    /** Set shoot (music) volume — called by the Music slider (0–100). */
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value / 100));
    }

    /** Set hit/destroy (master) volume — called by the Master Volume slider (0–100). */
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value / 100));
    }

    /**
     * Sharp metallic "ping/pop" when a bullet grazes a ball.
     */
    playHitSound() {
        if (!this.audioCtx) return; // Not yet initialized
        try {
            const ctx = this.getAudioCtx();
            const now = ctx.currentTime;

            // Noise burst for impact texture
            const bufferSize = Math.floor(ctx.sampleRate * 0.06);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Band-pass filter to shape the noise into a crisp "thwack"
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1800;
            filter.Q.value = 0.8;

            // Gain envelope: instant attack, fast decay — scaled by master volume
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.7 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.08);
        } catch (e) {
            console.warn('Audio hit error:', e);
        }
    }

    /**
     * Deep punchy "boom" when a ball is fully destroyed.
     */
    playDestroySound() {
        if (!this.audioCtx) return; // Not yet initialized
        try {
            const ctx = this.getAudioCtx();
            const now = ctx.currentTime;

            // Sub-bass thump: sine oscillator sweeping down fast
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.25);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(1.2 * this.masterVolume, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);

            // Layered noise explosion burst
            const bufferSize = Math.floor(ctx.sampleRate * 0.22);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 1200;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.9 * this.masterVolume, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            noise.connect(lp);
            lp.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.22);
        } catch (e) {
            console.warn('Audio destroy error:', e);
        }
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Input Handling
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        window.addEventListener('mouseup', () => this.handlePointerUp());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        }, { passive: false });
        window.addEventListener('touchend', () => this.handlePointerUp());

        this.loop();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.cannon.x = this.canvas.width / 2 - this.cannon.width / 2;
        this.cannon.y = this.canvas.height - this.cannon.height - 20;
        this.cannon.targetX = this.cannon.x;
    }

    handlePointerDown(e) {
        // Initialize & unlock AudioContext on the very first user gesture
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // Now that we have a context, decode the pre-fetched shoot sound
            this.decodeShootAudio();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        if (!this.isRunning) return;
        this.isFiring = true;
        this.updateCannonTarget(e);
    }

    handlePointerMove(e) {
        if (!this.isRunning) return;
        this.updateCannonTarget(e);
    }

    handlePointerUp() {
        this.isFiring = false;
    }

    updateCannonTarget(e) {
        if (!e) return;
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        
        if (clientX === null) return;

        const x = clientX - rect.left;
        const newTarget = Math.max(0, Math.min(this.canvas.width - this.cannon.width, x - this.cannon.width / 2));
        
        if (!isNaN(newTarget)) {
            this.cannon.targetX = newTarget;
        }
    }

    spawnBall() {
        // Progressive spawn rate: starts at 0.997 (very slow) and scales to 0.985 (hard)
        // Hardness increases over 3 minutes (180s)
        const elapsed = (Date.now() - this.startTime) / 1000;
        const progress = Math.min(elapsed / 180, 1);
        
        // Difficulty multiplier 1.0 down to 1.0 (actually we want the threshold to lower)
        const spawnThreshold = 0.997 - (progress * 0.012); 

        if (Math.random() > spawnThreshold) {
            // Difficulty scaling for size and health
            const baseSize = 25 + (progress * 15); // Starts smaller (25), grows to 40
            const size = baseSize + Math.random() * 30;
            
            // Health scales with progress: 3x-10x size initially, then more
            const healthMultiplier = 1 + (progress * 2); 
            const health = Math.floor((size / 5) * healthMultiplier);
            
            const xPos = Math.random() * this.canvas.width;
            // Add horizontal velocity for bounce-around effect
            const vx = (Math.random() - 0.5) * (4 + progress * 4); 
            
            this.balls.push(new Ball(this.canvas, xPos, -size, size, health, vx));
        }
    }

    splitBall(ball) {
        // Only split if the ball's health was high (prevents clutter)
        if (ball.maxHealth > 60) {
            const newSize = ball.size / 1.5;
            const newHealth = Math.ceil(ball.maxHealth / 2);
            this.balls.push(new Ball(this.canvas, ball.x - newSize, ball.y, newSize, newHealth, -3));
            this.balls.push(new Ball(this.canvas, ball.x + newSize, ball.y, newSize, newHealth, 3));
        }
    }

    checkCollisions() {
        // Bullet vs Ball
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.balls.length - 1; j >= 0; j--) {
                const ball = this.balls[j];
                const dx = bullet.x - ball.x;
                const dy = bullet.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < ball.size + bullet.radius) {
                    bullet.active = false;
                    ball.health -= 5;
                    if (ball.health <= 0) {
                        this.score += ball.maxHealth;
                        this.hits++;
                        this.splitBall(ball);
                        ball.active = false;
                        if (window.GodotBridge) window.GodotBridge.updateScore(this.score);
                        this.playDestroySound(); // 💥 Ball destroyed
                    } else {
                        this.playHitSound(); // 🎯 Bullet hit
                    }
                    break;
                }
            }
        }

        // Ball vs Cannon (Circle-to-Rectangle collision)
        for (let ball of this.balls) {
            // Shrink cannon hitbox slightly, but leave a tiny bit of space
            const padding = 10;
            const cx = this.cannon.x + padding;
            const cy = this.cannon.y + padding;
            const cw = this.cannon.width - (padding * 2);
            const ch = this.cannon.height - (padding * 2);

            const closestX = Math.max(cx, Math.min(ball.x, cx + cw));
            const closestY = Math.max(cy, Math.min(ball.y, cy + ch));
            
            const distanceX = ball.x - closestX;
            const distanceY = ball.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            // Use full ball radius for visual touch
            if (distanceSquared < (ball.size * ball.size)) {
                if (this.cannon.isShielded) {
                    // Shield active - Explode the ball!
                    this.score += ball.maxHealth;
                    this.hits++;
                    this.splitBall(ball);
                    ball.active = false;
                    if (window.GodotBridge) window.GodotBridge.updateScore(this.score);
                    this.playDestroySound();
                } else {
                    this.gameOver();
                    break;
                }
            }
        }

        // Cannon vs ShieldDrop
        for (let shield of this.shieldDrops) {
            const cx = this.cannon.x + this.cannon.width / 2;
            const cy = this.cannon.y + this.cannon.height / 2;
            const dx = cx - shield.x;
            const dy = cy - shield.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < shield.radius + this.cannon.width / 2) {
                shield.active = false;
                this.cannon.isShielded = true;
                this.cannon.shieldEndTime = Date.now() + 14000; // ~14 seconds
            }
        }

        // Cannon vs DoubleFireDrop
        for (let drop of this.doubleFireDrops) {
            const cx = this.cannon.x + this.cannon.width / 2;
            const cy = this.cannon.y + this.cannon.height / 2;
            const dx = cx - drop.x;
            const dy = cy - drop.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < drop.radius + this.cannon.width / 2) {
                drop.active = false;
                this.cannon.isDoubleFire = true;
                this.cannon.doubleFireEndTime = Date.now() + 12000; // ~12 seconds
            }
        }

        // Cleanup
        this.bullets = this.bullets.filter(b => b.active);
        this.balls = this.balls.filter(b => b.active);
        this.shieldDrops = this.shieldDrops.filter(s => s.active);
        this.doubleFireDrops = this.doubleFireDrops.filter(d => d.active);
    }

    gameOver() {
        if (!this.isRunning) return; // Prevent multiple calls
        this.isRunning = false;
        
        // Draw one last frame to show the collision clearly
        this.draw();

        // Check if we can revive
        setTimeout(() => {
            if (window.GodotBridge) {
                window.GodotBridge.requestRevive(this.getStats());
            }
        }, 1500); // Shorter delay so revive screen shows quickly
    }

    getStats() {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        const accuracy = this.totalShots > 0 ? (this.hits / this.totalShots) * 100 : 0;
        return {
            score: this.score,
            accuracy: accuracy.toFixed(1),
            duration: this.formatTime(duration)
        };
    }

    revivePlayer() {
        // Clear balls near the player to prevent instant death again
        const safeRadius = 300;
        this.balls = this.balls.filter(ball => {
            const dx = ball.x - this.cannon.x;
            const dy = ball.y - this.cannon.y;
            return Math.sqrt(dx * dx + dy * dy) > safeRadius;
        });

        // Resume game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    start() {
        setTimeout(() => this.resize(), 50); // wait for UI to render
        this.score = 0;
        this.totalShots = 0;
        this.hits = 0;
        this.startTime = Date.now();
        this.difficulty = 1.0;
        this.balls = [];
        this.bullets = [];
        this.shieldDrops = [];
        this.doubleFireDrops = [];
        this.cannon.isShielded = false;
        this.cannon.isDoubleFire = false;
        this.isRunning = true;
        this.isPaused = false;
    }

    pause(paused) {
        this.isPaused = paused;
    }

    loop() {
        if (this.isRunning && !this.isPaused) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Cannon smooth movement with NaN safety
        const dx = (this.cannon.targetX - this.cannon.x) * 0.2;
        if (!isNaN(dx)) {
            this.cannon.x += dx;
        }

        // Auto fire
        if (this.isFiring && Date.now() - this.lastFireTime > this.fireRate) {
            if (this.cannon.isDoubleFire) {
                this.bullets.push(new Bullet(this.cannon.x + this.cannon.width * 0.25, this.cannon.y));
                this.bullets.push(new Bullet(this.cannon.x + this.cannon.width * 0.75, this.cannon.y));
                this.totalShots += 2;
            } else {
                this.bullets.push(new Bullet(this.cannon.x + this.cannon.width / 2, this.cannon.y));
                this.totalShots++;
            }
            this.lastFireTime = Date.now();
            this.playShootSound(); // 🔫 Machine-gun fire sound
        }

        // Shield Logic
        if (Date.now() - this.lastShieldTime > this.shieldInterval) {
            const shieldX = Math.random() * (this.canvas.width - 50) + 25;
            this.shieldDrops.push(new ShieldDrop(this.canvas, shieldX));
            this.lastShieldTime = Date.now();
            this.shieldInterval = Math.floor(Math.random() * 30000) + 90000; // 90 to 120 seconds
        }

        if (this.cannon.isShielded && Date.now() > this.cannon.shieldEndTime) {
            this.cannon.isShielded = false;
        }

        // Double Fire Logic
        if (Date.now() - this.lastDoubleFireTime > this.doubleFireInterval) {
            const doubleX = Math.random() * (this.canvas.width - 50) + 25;
            this.doubleFireDrops.push(new DoubleFireDrop(this.canvas, doubleX));
            this.lastDoubleFireTime = Date.now();
            this.doubleFireInterval = Math.floor(Math.random() * 30000) + 80000; // 80 to 110 seconds
        }

        if (this.cannon.isDoubleFire && Date.now() > this.cannon.doubleFireEndTime) {
            this.cannon.isDoubleFire = false;
        }

        this.bullets.forEach(b => b.update());
        this.balls.forEach(b => b.update());
        this.shieldDrops.forEach(s => s.update());
        this.doubleFireDrops.forEach(d => d.update());
        
        this.spawnBall();
        this.checkCollisions();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Cannon
        if (this.cannonSprite.complete) {
            this.ctx.drawImage(this.cannonSprite, this.cannon.x, this.cannon.y, this.cannon.width, this.cannon.height);
        } else {
            this.ctx.fillStyle = '#0059bb';
            this.ctx.fillRect(this.cannon.x, this.cannon.y, this.cannon.width, this.cannon.height);
        }

        // Draw Shield effect
        if (this.cannon.isShielded) {
            this.ctx.beginPath();
            const cx = this.cannon.x + this.cannon.width / 2;
            const cy = this.cannon.y + this.cannon.height / 2;
            this.ctx.arc(cx, cy, this.cannon.width * 0.75, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
            this.ctx.fill();
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.closePath();
        }

        // Draw Double Fire effect
        if (this.cannon.isDoubleFire) {
            const cx = this.cannon.x + this.cannon.width / 2;
            const cy = this.cannon.y + this.cannon.height / 2;

            // Outer pulsing glow ring
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, this.cannon.width * 0.82, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 160, 0, 0.15)';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffcc00';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([6, 4]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.closePath();

            // Dual barrel markers — two yellow dots showing where bullets come from
            [0.25, 0.75].forEach(frac => {
                this.ctx.beginPath();
                this.ctx.arc(this.cannon.x + this.cannon.width * frac, this.cannon.y + 6, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffdd00';
                this.ctx.fill();
                this.ctx.strokeStyle = '#ff8800';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.closePath();
            });
        }

        // Sync active buffs to HUD overlay
        this._syncBuffHUD();

        this.shieldDrops.forEach(s => s.draw(this.ctx));
        this.doubleFireDrops.forEach(d => d.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.balls.forEach(b => b.draw(this.ctx));
    }

    /** Push active power-up state to the HUD element each frame. */
    _syncBuffHUD() {
        const shieldEl = document.getElementById('hud-buff-shield');
        const dfEl     = document.getElementById('hud-buff-doublef');
        if (shieldEl) shieldEl.style.display = this.cannon.isShielded  ? 'flex' : 'none';
        if (dfEl)     dfEl.style.display     = this.cannon.isDoubleFire ? 'flex' : 'none';

        // Timer countdowns
        if (shieldEl && this.cannon.isShielded) {
            const secs = Math.max(0, Math.ceil((this.cannon.shieldEndTime - Date.now()) / 1000));
            const t = shieldEl.querySelector('.buff-timer');
            if (t) t.textContent = secs + 's';
        }
        if (dfEl && this.cannon.isDoubleFire) {
            const secs = Math.max(0, Math.ceil((this.cannon.doubleFireEndTime - Date.now()) / 1000));
            const t = dfEl.querySelector('.buff-timer');
            if (t) t.textContent = secs + 's';
        }
    }
}

// Global instance for UI to interact with
window.Game = new GameEngine();
