/**
 * Cannon Shooter - Core Game Engine
 * Handles physics, collision, and rendering.
 */

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = 14;
        this.active = true;
    }

    update(dt) {
        this.y -= this.speed * dt;
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
    constructor(canvas, x, y, size, health, vx, vy) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.size = size; // radius
        this.maxHealth = health;
        this.health = health;
        this.vx = vx || (Math.random() - 0.5) * 4;
        this.vy = vy !== undefined ? vy : 2.5; // Starts with downward momentum
        this.gravity = 0.35; // Snappy, arcade-paced gravity (was 0.15)
        this.active = true;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = ['#ff5f5f', '#5fff5f', '#5f5fff', '#ffff5f', '#ff5fff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(dt) {
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Ground collision: Perpetual energetic bounce
        if (this.y + this.size > this.canvas.height) {
            this.y = this.canvas.height - this.size;
            // Bounce up to ~78% of screen height so balls cycle quickly and don't linger at ceiling
            const bounceHeight = (this.canvas.height - this.size) * 0.78;
            this.vy = -Math.sqrt(2 * this.gravity * bounceHeight);
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

    update(dt) {
        if (!this.isOnGround) {
            this.y += this.vy * dt;
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

    update(dt) {
        if (!this.isOnGround) {
            this.y += this.vy * dt;
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

class BombDrop {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.x = x;
        this.y = -30;
        this.radius = 25;
        this.vy = 2.2;
        this.active = true;
        this.isOnGround = false;
        this.groundTime = 0;
    }

    update(dt) {
        if (!this.isOnGround) {
            this.y += this.vy * dt;
            if (this.y + this.radius >= this.canvas.height) {
                this.y = this.canvas.height - this.radius;
                this.isOnGround = true;
                this.groundTime = Date.now();
            }
        } else {
            // Disappear after 5.5 seconds on the ground
            if (Date.now() - this.groundTime > 5500) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#ff3333';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.radius * 0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('💣', this.x, this.y + (this.radius * 0.3));
    }
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cannonSprite = new Image();
        this.cannonSprite.src = 'cannon_sprite.png';
        
        const isAndroid = (typeof window !== 'undefined' && (
            (window.Capacitor && (window.Capacitor.getPlatform?.() === 'android' || window.Capacitor.isNativePlatform?.())) ||
            /Android/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth <= 768))
        ));
        const initialCannonSize = isAndroid ? 112 : 115;

        this.cannon = {
            x: 0,
            y: 0,
            width: initialCannonSize,
            height: initialCannonSize,
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
        
        // Bomb System
        this.bombDrops = [];
        this.lastBombTime = Date.now() + 40000; // Offset initial drop
        this.bombInterval = 120000; // ~2 mins
        this.hasBomb = false; // Whether player has a bomb ready to use
        this.bombExplosionParticles = []; // Visual explosion effect
        
        // Stats Tracking
        this.totalShots = 0;
        this.hits = 0;           // Number of balls destroyed
        this.totalHits = 0;      // Number of bullet contacts
        this.startTime = 0;
        this.gameTimeMs = 0;     // Active gameplay time
        this.lastUpdate = 0;
        this.difficulty = 1.0;
        
        // Mode & Challenge properties
        this.gameMode = 'classic'; 
        this.activeChallengeId = null; 
        this.challengeTarget = 0;
        this.challengeProgress = 0;
        this.challengeCompleted = false;

        // Audio
        this.audioCtx = null;
        this.shootBuffer = null;     // Decoded AudioBuffer for the shoot MP3
        this.shootRawBuffer = null;  // Raw ArrayBuffer fetched from shoot.mp3
        this.hitNoiseBuffer = null;  // Pre-allocated AudioBuffer for hit sound
        this.destroyNoiseBuffer = null; // Pre-allocated AudioBuffer for destroy sound
        this.bombNoiseBuffer = null; // Pre-allocated AudioBuffer for bomb sound
        this.musicVolume = 0.6;      // Cannon shoot sound volume (Music slider, default 60%)
        this.masterVolume = 0.8;     // Hit/destroy sound volume (Master Volume slider, default 80%)
        this.loadShootAudio();       // Pre-fetch immediately

        // HUD Elements Cache (avoids DOM lookups and layout thrashing in render loop)
        this.hudElements = {
            shield: null,
            shieldTimer: null,
            doubleFire: null,
            doubleFireTimer: null,
            bomb: null,
            goalCard: null,
            goalTitle: null,
            goalVal: null,
            lastShieldSec: -1,
            lastDoubleSec: -1,
            lastGoalText: ''
        };

        this.init();
    }

    /** Pre-allocate static noise buffers once so sound effects never trigger GC */
    _initStaticAudioBuffers() {
        if (!this.audioCtx) return;
        const ctx = this.audioCtx;

        if (!this.hitNoiseBuffer) {
            const size = Math.floor(ctx.sampleRate * 0.06);
            this.hitNoiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
            const data = this.hitNoiseBuffer.getChannelData(0);
            for (let i = 0; i < size; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 3);
            }
        }

        if (!this.destroyNoiseBuffer) {
            const size = Math.floor(ctx.sampleRate * 0.22);
            this.destroyNoiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
            const data = this.destroyNoiseBuffer.getChannelData(0);
            for (let i = 0; i < size; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 1.5);
            }
        }

        if (!this.bombNoiseBuffer) {
            const size = Math.floor(ctx.sampleRate * 0.4);
            this.bombNoiseBuffer = ctx.createBuffer(1, size, ctx.sampleRate);
            const data = this.bombNoiseBuffer.getChannelData(0);
            for (let i = 0; i < size; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 1.2);
            }
        }
    }

    /** Cache HUD DOM references once */
    _cacheHUDElements() {
        if (!this.hudElements.shield) {
            this.hudElements.shield = document.getElementById('hud-buff-shield');
            this.hudElements.shieldTimer = this.hudElements.shield ? this.hudElements.shield.querySelector('.buff-timer') : null;
            this.hudElements.doubleFire = document.getElementById('hud-buff-doublef');
            this.hudElements.doubleFireTimer = this.hudElements.doubleFire ? this.hudElements.doubleFire.querySelector('.buff-timer') : null;
            this.hudElements.bomb = document.getElementById('hud-buff-bomb');
            this.hudElements.goalCard = document.getElementById('hud-goal-card');
            this.hudElements.goalTitle = document.getElementById('hud-goal-title');
            this.hudElements.goalVal = document.getElementById('hud-goal-val');
        }
    }

    /**
     * Returns the shared AudioContext, resuming it if suspended.
     * Must be first CREATED inside handlePointerDown (a true user gesture).
     */
    getAudioCtx() {
        if (!this.audioCtx) {
            // Fallback creation (shouldn't normally happen)
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this._initStaticAudioBuffers();
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
        if (!this.audioCtx) return;
        this._initStaticAudioBuffers();
        if (this.shootBuffer || !this.shootRawBuffer) return;
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
     * ZERO GC ALLOCATIONS: Uses pre-allocated static noise buffer.
     */
    playHitSound() {
        if (!this.audioCtx) return; // Not yet initialized
        try {
            const ctx = this.getAudioCtx();
            const now = ctx.currentTime;
            if (!this.hitNoiseBuffer) this._initStaticAudioBuffers();

            const noise = ctx.createBufferSource();
            noise.buffer = this.hitNoiseBuffer;

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
     * ZERO GC ALLOCATIONS: Uses pre-allocated static noise buffer.
     */
    playDestroySound() {
        if (!this.audioCtx) return; // Not yet initialized
        try {
            const ctx = this.getAudioCtx();
            const now = ctx.currentTime;
            if (!this.destroyNoiseBuffer) this._initStaticAudioBuffers();

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

            // Layered noise explosion burst from pre-allocated buffer
            const noise = ctx.createBufferSource();
            noise.buffer = this.destroyNoiseBuffer;

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

        // Keyboard state tracking
        this.keysPressed = new Set();
        this.keyMoveSpeed = 8; // pixels per frame

        // Input Handling — Mouse / Touch
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

        // Input Handling — Keyboard (A/D, Arrow Keys, F)
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        this.loop();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        const isAndroid = (typeof window !== 'undefined' && (
            (window.Capacitor && (window.Capacitor.getPlatform?.() === 'android' || window.Capacitor.isNativePlatform?.())) ||
            /Android/i.test(navigator.userAgent) ||
            (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth <= 768))
        ));
        const cannonSize = isAndroid ? 112 : 115;
        this.cannon.width = cannonSize;
        this.cannon.height = cannonSize;

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

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        // Unlock AudioContext on first keyboard interaction too
        if (!this.audioCtx && (key === 'f' || key === 'a' || key === 'd' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.decodeShootAudio();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        if (!this.isRunning) return;

        // Track held keys for movement
        if (key === 'a' || e.key === 'ArrowLeft') {
            this.keysPressed.add('left');
        }
        if (key === 'd' || e.key === 'ArrowRight') {
            this.keysPressed.add('right');
        }
        // Fire with F key
        if (key === 'f') {
            this.isFiring = true;
        }

        // Prevent default for arrow keys to avoid page scrolling
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (key === 'a' || e.key === 'ArrowLeft') {
            this.keysPressed.delete('left');
        }
        if (key === 'd' || e.key === 'ArrowRight') {
            this.keysPressed.delete('right');
        }
        if (key === 'f') {
            this.isFiring = false;
        }
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


        const elapsed = this.gameTimeMs / 1000;
        const progress = Math.min(elapsed / 180, 1);
        
        let spawnThreshold;
        if (this.gameMode === 'challenge' && this.activeChallengeId === 'iron_dome') {
            // High spawn rate for Iron Dome challenge
            spawnThreshold = 0.990 - (progress * 0.015);
        } else if (this.gameMode === 'challenge') {
            // Slightly faster spawns for other challenges
            spawnThreshold = 0.994 - (progress * 0.012);
        } else {
            // Classic mode progressive spawn rate
            spawnThreshold = 0.997 - (progress * 0.012); 
        }

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
            this.balls.push(new Ball(this.canvas, ball.x - newSize, ball.y, newSize, newHealth, -3.5, -3));
            this.balls.push(new Ball(this.canvas, ball.x + newSize, ball.y, newSize, newHealth, 3.5, -3));
        }
    }

    checkCollisions() {
        // Bullet vs Ball (Optimized squared distance check - avoids Math.sqrt)
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.balls.length - 1; j >= 0; j--) {
                const ball = this.balls[j];
                const dx = bullet.x - ball.x;
                const dy = bullet.y - ball.y;
                const distSq = dx * dx + dy * dy;
                const hitRadius = ball.size + bullet.radius;

                if (distSq < hitRadius * hitRadius) {
                    bullet.active = false;
                    ball.health -= 5;
                    this.totalHits++; // Increment total hits for accuracy tracking
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

        // Ball vs Cannon (Circle-to-Rectangle collision fitted to visible sprite)
        for (let ball of this.balls) {
            // cannon_sprite.png has ~31% transparent top and ~18% side margins.
            // Fit the hitbox tightly to the visible cannon artwork:
            const cx = this.cannon.x + (this.cannon.width * 0.20);
            const cy = this.cannon.y + (this.cannon.height * 0.33);
            const cw = this.cannon.width * 0.60;
            const ch = this.cannon.height * 0.48;

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
        const cannonCenterX = this.cannon.x + this.cannon.width / 2;
        const cannonCenterY = this.cannon.y + this.cannon.height / 2;
        const cannonPickupRadius = this.cannon.width / 2;

        for (let shield of this.shieldDrops) {
            const dx = cannonCenterX - shield.x;
            const dy = cannonCenterY - shield.y;
            const distSq = dx * dx + dy * dy;
            const pickupDist = shield.radius + cannonPickupRadius;

            if (distSq < pickupDist * pickupDist) {
                shield.active = false;
                this.cannon.isShielded = true;
                this.cannon.shieldEndTime = Date.now() + 14000; // ~14 seconds
            }
        }

        // Cannon vs DoubleFireDrop
        for (let drop of this.doubleFireDrops) {
            const dx = cannonCenterX - drop.x;
            const dy = cannonCenterY - drop.y;
            const distSq = dx * dx + dy * dy;
            const pickupDist = drop.radius + cannonPickupRadius;

            if (distSq < pickupDist * pickupDist) {
                drop.active = false;
                this.cannon.isDoubleFire = true;
                this.cannon.doubleFireEndTime = Date.now() + 12000; // ~12 seconds
            }
        }

        // Cannon vs BombDrop
        for (let bomb of this.bombDrops) {
            const dx = cannonCenterX - bomb.x;
            const dy = cannonCenterY - bomb.y;
            const distSq = dx * dx + dy * dy;
            const pickupDist = bomb.radius + cannonPickupRadius;

            if (distSq < pickupDist * pickupDist) {
                bomb.active = false;
                this.hasBomb = true;
            }
        }

        // In-place Cleanup (zero-allocation array compaction - eliminates GC pause spikes)
        this._compactArray(this.bullets);
        this._compactArray(this.balls);
        this._compactArray(this.shieldDrops);
        this._compactArray(this.doubleFireDrops);
        this._compactArray(this.bombDrops);
    }

    /** In-place zero-allocation array compaction */
    _compactArray(arr) {
        let write = 0;
        for (let read = 0; read < arr.length; read++) {
            if (arr[read].active) {
                arr[write++] = arr[read];
            }
        }
        arr.length = write;
    }

    gameOver() {
        if (!this.isRunning) return; // Prevent multiple calls
        this.isRunning = false;
        
        // Draw one last frame to show the collision clearly
        this.draw();

        // Check if we can revive
        setTimeout(() => {
            if (this.gameMode === 'challenge') {
                // In challenge mode, no revive allowed! Go straight to game over / failure.
                const stats = this.getStats();
                stats.win = false;
                if (window.GodotBridge) window.GodotBridge.onGameOver(stats);
            } else {
                if (window.GodotBridge) {
                    window.GodotBridge.requestRevive(this.getStats());
                }
            }
        }, 1500); // Shorter delay so revive screen shows quickly
    }

    challengeWin() {
        this.challengeCompleted = true;
        this.isRunning = false;
        
        // Save status in localStorage
        const key = `cs_challenge_${this.activeChallengeId}`;
        if (this.activeChallengeId === 'time_attack') {
            const timeSec = (this.gameTimeMs / 1000).toFixed(1);
            const best = localStorage.getItem(key);
            if (!best || parseFloat(timeSec) < parseFloat(best)) {
                localStorage.setItem(key, timeSec);
            }
        } else {
            localStorage.setItem(key, 'Cleared');
        }

        setTimeout(() => {
            if (window.GodotBridge) {
                window.GodotBridge.onGameOver(this.getStats());
            }
        }, 1500);
    }

    getStats() {
        const durationSeconds = Math.floor(this.gameTimeMs / 1000);
        const accuracy = this.totalShots > 0 ? (this.totalHits / this.totalShots) * 100 : 0;
        return {
            score: this.score,
            accuracy: accuracy.toFixed(1),
            duration: this.formatTime(durationSeconds),
            win: this.challengeCompleted,
            isChallenge: this.gameMode === 'challenge',
            challengeId: this.activeChallengeId,
            rawTimeMs: this.gameTimeMs
        };
    }

    revivePlayer() {
        // Clear balls near the cannon center to prevent instant collision upon respawn
        const safeRadius = 350;
        const cannonCenterX = this.cannon.x + this.cannon.width / 2;
        const cannonCenterY = this.cannon.y + this.cannon.height / 2;
        this.balls = this.balls.filter(ball => {
            const dx = ball.x - cannonCenterX;
            const dy = ball.y - cannonCenterY;
            return Math.sqrt(dx * dx + dy * dy) > safeRadius;
        });

        // Grant 3-second invulnerability shield so any falling balls explode safely
        this.cannon.isShielded = true;
        this.cannon.shieldEndTime = Date.now() + 3000;

        // Reset input and frame timers so physics resumes smoothly without time jumps
        this.isFiring = false;
        this.isRunning = true;
        this.isPaused = false;
        this._lastFrameTime = performance.now();
        this._smoothDt = 1.0;

        // Resume audio context if suspended while viewing the ad
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
    }

    /** Use the bomb power-up: destroy all balls on screen with a big explosion. */
    useBomb() {
        if (!this.hasBomb || !this.isRunning) return;
        this.hasBomb = false;

        // Create explosion particles at each ball's position
        for (const ball of this.balls) {
            for (let i = 0; i < 8; i++) {
                this.bombExplosionParticles.push({
                    x: ball.x,
                    y: ball.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    radius: Math.random() * 6 + 3,
                    life: 1.0,
                    color: `hsl(${Math.random() * 60}, 100%, 50%)` // red-orange-yellow
                });
            }
            this.score += ball.maxHealth;
            this.hits++;
        }
        this.balls = [];
        if (window.GodotBridge) window.GodotBridge.updateScore(this.score);

        // Play a big explosion sound
        this.playBombSound();
    }

    /** Deep heavy explosion sound for the bomb. */
    playBombSound() {
        if (!this.audioCtx) return;
        try {
            const ctx = this.getAudioCtx();
            const now = ctx.currentTime;

            // Sub-bass boom — deeper than destroy sound
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(1.5 * this.masterVolume, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.55);

            // Big noise blast from pre-allocated buffer
            if (!this.bombNoiseBuffer) this._initStaticAudioBuffers();
            const noise = ctx.createBufferSource();
            noise.buffer = this.bombNoiseBuffer;

            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.value = 800;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(1.2 * this.masterVolume, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            noise.connect(lp);
            lp.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
            noise.stop(now + 0.4);
        } catch (e) {
            console.warn('Bomb sound error:', e);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    start(mode = 'classic', challengeId = null) {
        setTimeout(() => this.resize(), 50); // wait for UI to render
        this.gameMode = mode;
        this.activeChallengeId = challengeId;
        this.challengeCompleted = false;
        this.challengeProgress = 0;

        this.score = 0;
        this.totalShots = 0;
        this.hits = 0;
        this.totalHits = 0;
        this.startTime = Date.now();
        this.gameTimeMs = 0;
        this.lastUpdate = Date.now();
        this.difficulty = 1.0;
        this.balls = [];
        this.bullets = [];
        this.shieldDrops = [];
        this.doubleFireDrops = [];
        this.bombDrops = [];
        this.bombExplosionParticles = [];
        this.hasBomb = false;
        this.cannon.isShielded = false;
        this.cannon.isDoubleFire = false;
        this.isRunning = true;
        this.isPaused = false;
        this._lastFrameTime = performance.now();
        this._smoothDt = 1.0;

        // Custom setup per challenge mode
        if (this.gameMode === 'challenge') {
            if (this.activeChallengeId === 'time_attack') {
                this.challengeTarget = 30; // 30 balls
            } else if (this.activeChallengeId === 'iron_dome') {
                this.challengeTarget = 60; // 60 seconds
            }
        }
    }

    pause(paused) {
        this.isPaused = paused;
        if (!paused) {
            this._lastFrameTime = performance.now();
            this._smoothDt = 1.0;
        }
    }

    loop(timestamp) {
        if (!this._lastFrameTime) {
            this._lastFrameTime = timestamp || performance.now();
        }
        const currentFrameTime = timestamp || performance.now();
        const elapsedMs = currentFrameTime - this._lastFrameTime;
        this._lastFrameTime = currentFrameTime;

        // Delta time normalized so that dt=1.0 at 60fps (16.667ms per frame).
        // Capped between 0.1 and 2.5 to prevent micro-freezes or huge physics jumps
        let dt = elapsedMs / 16.667;
        if (isNaN(dt) || dt <= 0) dt = 1.0;
        else if (dt > 2.5) dt = 2.5;

        // Smooth delta time with rolling average to filter timer jitter on mobile WebViews
        if (!this._smoothDt) this._smoothDt = 1.0;
        this._smoothDt = this._smoothDt * 0.75 + dt * 0.25;

        if (this.isRunning && !this.isPaused) {
            this.gameTimeMs += elapsedMs;
            this.update(this._smoothDt);
            this.draw();
        }
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Keyboard-driven movement (A/D, Arrow Keys)
        if (this.keysPressed.has('left')) {
            this.cannon.targetX = Math.max(0, this.cannon.targetX - this.keyMoveSpeed * dt);
        }
        if (this.keysPressed.has('right')) {
            this.cannon.targetX = Math.min(this.canvas.width - this.cannon.width, this.cannon.targetX + this.keyMoveSpeed * dt);
        }

        // Cannon smooth movement with NaN safety (frame-rate independent lerp)
        const lerpFactor = 1 - Math.pow(0.8, dt);
        const dx = (this.cannon.targetX - this.cannon.x) * lerpFactor;
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
        if (this.gameMode !== 'challenge' || this.activeChallengeId === 'time_attack') {
            if (Date.now() - this.lastShieldTime > this.shieldInterval) {
                const shieldX = Math.random() * (this.canvas.width - 50) + 25;
                this.shieldDrops.push(new ShieldDrop(this.canvas, shieldX));
                this.lastShieldTime = Date.now();
                this.shieldInterval = Math.floor(Math.random() * 30000) + 90000; // 90 to 120 seconds
            }
        }

        if (this.cannon.isShielded && Date.now() > this.cannon.shieldEndTime) {
            this.cannon.isShielded = false;
        }

        // Double Fire Logic
        if (this.gameMode !== 'challenge' || this.activeChallengeId === 'time_attack') {
            if (Date.now() - this.lastDoubleFireTime > this.doubleFireInterval) {
                const doubleX = Math.random() * (this.canvas.width - 50) + 25;
                this.doubleFireDrops.push(new DoubleFireDrop(this.canvas, doubleX));
                this.lastDoubleFireTime = Date.now();
                this.doubleFireInterval = Math.floor(Math.random() * 30000) + 80000; // 80 to 110 seconds
            }
        }

        if (this.cannon.isDoubleFire && Date.now() > this.cannon.doubleFireEndTime) {
            this.cannon.isDoubleFire = false;
        }

        // Bomb Drop Logic
        if (this.gameMode !== 'challenge' || this.activeChallengeId === 'time_attack') {
            if (Date.now() - this.lastBombTime > this.bombInterval) {
                const bombX = Math.random() * (this.canvas.width - 50) + 25;
                this.bombDrops.push(new BombDrop(this.canvas, bombX));
                this.lastBombTime = Date.now();
                this.bombInterval = Math.floor(Math.random() * 30000) + 90000; // 90 to 120 seconds
            }
        }

        // Update explosion particles (in-place compaction - zero GC allocation)
        let particleWrite = 0;
        for (let i = 0; i < this.bombExplosionParticles.length; i++) {
            const p = this.bombExplosionParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 0.03 * dt;
            p.radius *= Math.pow(0.97, dt);
            if (p.life > 0) {
                this.bombExplosionParticles[particleWrite++] = p;
            }
        }
        this.bombExplosionParticles.length = particleWrite;

        for (let i = 0; i < this.bullets.length; i++) this.bullets[i].update(dt);
        for (let i = 0; i < this.balls.length; i++) this.balls[i].update(dt);
        for (let i = 0; i < this.shieldDrops.length; i++) this.shieldDrops[i].update(dt);
        for (let i = 0; i < this.doubleFireDrops.length; i++) this.doubleFireDrops[i].update(dt);
        for (let i = 0; i < this.bombDrops.length; i++) this.bombDrops[i].update(dt);
        
        this.spawnBall();
        this.checkCollisions();

        // Check Challenge Win Conditions
        if (this.gameMode === 'challenge' && !this.challengeCompleted) {
            const elapsedSec = this.gameTimeMs / 1000;
            if (this.activeChallengeId === 'time_attack') {
                this.challengeProgress = this.hits; // number of balls destroyed
                if (this.challengeProgress >= this.challengeTarget) {
                    this.challengeWin();
                }
            } else if (this.activeChallengeId === 'iron_dome') {
                this.challengeProgress = elapsedSec;
                if (this.challengeProgress >= this.challengeTarget) {
                    this.challengeWin();
                }
            }
        }
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
        this._syncGoalHUD();

        this.shieldDrops.forEach(s => s.draw(this.ctx));
        this.doubleFireDrops.forEach(d => d.draw(this.ctx));
        this.bombDrops.forEach(b => b.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.balls.forEach(b => b.draw(this.ctx));

        // Draw bomb explosion particles
        for (const p of this.bombExplosionParticles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
            this.ctx.closePath();
        }
        this.ctx.globalAlpha = 1;
    }

    /** Push active power-up state to the HUD element each frame without DOM layout thrashing */
    _syncBuffHUD() {
        this._cacheHUDElements();
        const hud = this.hudElements;

        // Only toggle display if state changed
        const shieldActive = this.cannon.isShielded;
        if (hud.shield) {
            const desired = shieldActive ? 'flex' : 'none';
            if (hud.shield.style.display !== desired) hud.shield.style.display = desired;
        }

        const dfActive = this.cannon.isDoubleFire;
        if (hud.doubleFire) {
            const desired = dfActive ? 'flex' : 'none';
            if (hud.doubleFire.style.display !== desired) hud.doubleFire.style.display = desired;
        }

        const bombActive = this.hasBomb;
        if (hud.bomb) {
            const desired = bombActive ? 'flex' : 'none';
            if (hud.bomb.style.display !== desired) hud.bomb.style.display = desired;
        }

        // Timer countdowns - update text ONLY when second changes (not 60x/sec)
        if (hud.shieldTimer && shieldActive) {
            const secs = Math.max(0, Math.ceil((this.cannon.shieldEndTime - Date.now()) / 1000));
            if (secs !== hud.lastShieldSec) {
                hud.lastShieldSec = secs;
                hud.shieldTimer.textContent = secs + 's';
            }
        } else {
            hud.lastShieldSec = -1;
        }

        if (hud.doubleFireTimer && dfActive) {
            const secs = Math.max(0, Math.ceil((this.cannon.doubleFireEndTime - Date.now()) / 1000));
            if (secs !== hud.lastDoubleSec) {
                hud.lastDoubleSec = secs;
                hud.doubleFireTimer.textContent = secs + 's';
            }
        } else {
            hud.lastDoubleSec = -1;
        }
    }

    _syncGoalHUD() {
        this._cacheHUDElements();
        const hud = this.hudElements;
        if (!hud.goalCard) return;

        if (this.gameMode === 'challenge') {
            if (hud.goalCard.classList.contains('hidden')) {
                hud.goalCard.classList.remove('hidden');
            }

            if (this.activeChallengeId === 'time_attack') {
                if (hud.goalTitle && hud.goalTitle.textContent !== 'BLITZ TARGET') {
                    hud.goalTitle.textContent = 'BLITZ TARGET';
                }
                const remaining = Math.max(0, this.challengeTarget - this.challengeProgress);
                const text = `${remaining} LEFT`;
                if (hud.goalVal && hud.lastGoalText !== text) {
                    hud.lastGoalText = text;
                    hud.goalVal.textContent = text;
                }
            } else if (this.activeChallengeId === 'iron_dome') {
                if (hud.goalTitle && hud.goalTitle.textContent !== 'DEFEND TIME') {
                    hud.goalTitle.textContent = 'DEFEND TIME';
                }
                const remaining = Math.max(0, this.challengeTarget - this.challengeProgress);
                const text = `${remaining.toFixed(1)}s`;
                if (hud.goalVal && hud.lastGoalText !== text) {
                    hud.lastGoalText = text;
                    hud.goalVal.textContent = text;
                }
            }
        } else if (!hud.goalCard.classList.contains('hidden')) {
            hud.goalCard.classList.add('hidden');
        }
    }
}

// Global instance for UI to interact with
window.Game = new GameEngine();
