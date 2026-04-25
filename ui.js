/**
 * Canon Shooter - Tactical UI Interactivity
 * Integrated with "Kinetic Architect" Design System
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI System Initializing...');

    // Screen Elements
    const screens = {
        mainMenu: document.getElementById('main-menu'),
        gameHUD: document.getElementById('game-hud'),
        settingsScreen: document.getElementById('settings-screen'),
        reviveScreen: document.getElementById('revive-screen'),
        gameOverScreen: document.getElementById('game-over-screen')
    };

    // Buttons
    const buttons = {
        play: document.getElementById('play-btn'),
        settings: document.getElementById('settings-btn'),
        menuSettings: document.getElementById('menu-settings-btn'),
        exit: document.getElementById('exit-btn'),
        pause: document.getElementById('pause-btn'),
        backHome: document.getElementById('back-home-btn'),
        settingsBack: document.getElementById('settings-back-btn'),
        retry: document.getElementById('retry-btn'),
        mainMenu: document.getElementById('main-menu-btn'),
        toggleHUD: document.getElementById('toggle-hud-btn'), // Might be missing
        hudSettings: document.getElementById('hud-settings-btn'),
        watchAd: document.getElementById('watch-ad-btn'),
        skipRevive: document.getElementById('skip-revive-btn'),
        bgDaylight: document.getElementById('bg-daylight-btn'),
        bgDark: document.getElementById('bg-dark-btn')
    };

    // Volume sliders
    const sliders = {
        music: document.getElementById('music-volume'),
        master: document.getElementById('master-volume')
    };

    // UI HUD Elements for toggling
    const hudElements = document.querySelectorAll('.glass-hud, #mission-objective');

    // --- HUD TOGGLE LOGIC ---
    if (buttons.toggleHUD) {
        buttons.toggleHUD.onclick = () => {
            console.log('Event: Toggle HUD Clicked');
            hudElements.forEach(el => el.classList.toggle('opacity-0'));
        };
    }

    // --- VOLUME SLIDER LISTENERS ---
    if (sliders.music) {
        sliders.music.addEventListener('input', () => {
            const val = parseInt(sliders.music.value, 10);
            if (window.Game) window.Game.setMusicVolume(val);
            const label = document.getElementById('music-volume-label');
            if (label) label.textContent = val + '%';
        });
    }

    if (sliders.master) {
        sliders.master.addEventListener('input', () => {
            const val = parseInt(sliders.master.value, 10);
            if (window.Game) window.Game.setMasterVolume(val);
            const label = document.getElementById('master-volume-label');
            if (label) label.textContent = val + '%';
        });
    }

    // --- VISUALS/BACKGROUND TOGGLE ---
    const bgLayerImg = document.querySelector('#game-bg-layer img');
    if (buttons.bgDaylight && buttons.bgDark && bgLayerImg) {
        // Init load
        const savedView = localStorage.getItem('cannon_bg_view') || 'daylight';
        if (savedView === 'dark') {
            bgLayerImg.src = 'game_bg_dark.jpg';
            buttons.bgDark.className = 'py-3 px-4 rounded-xl border border-primary text-primary font-bold text-sm bg-primary/10 transition-colors';
            buttons.bgDaylight.className = 'py-3 px-4 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-highest transition-colors';
        }

        buttons.bgDaylight.onclick = () => {
            bgLayerImg.src = 'game_bg.png?v=2';
            localStorage.setItem('cannon_bg_view', 'daylight');
            buttons.bgDaylight.className = 'py-3 px-4 rounded-xl border border-primary text-primary font-bold text-sm bg-primary/10 transition-colors';
            buttons.bgDark.className = 'py-3 px-4 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-highest transition-colors';
        };

        buttons.bgDark.onclick = () => {
            bgLayerImg.src = 'game_bg_dark.jpg';
            localStorage.setItem('cannon_bg_view', 'dark');
            buttons.bgDark.className = 'py-3 px-4 rounded-xl border border-primary text-primary font-bold text-sm bg-primary/10 transition-colors';
            buttons.bgDaylight.className = 'py-3 px-4 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-highest transition-colors';
        };
    }

    // UI Stats Display
    const displays = {
        score: document.getElementById('score-val'),
        healthBar: document.getElementById('health-bar'), // Might be missing
        healthText: document.getElementById('health-text'), // Might be missing
        powerFill: document.getElementById('power-fill'), // Might be missing
        powerText: document.getElementById('power-text'), // Might be missing
        finalScore: document.getElementById('final-score-val'),
        accuracy: document.getElementById('accuracy-val'),
        time: document.getElementById('time-val')
    };

    // Internal State
    let state = {
        score: 0,
        power: 0,
        health: 100,
        isPaused: false,
        hasRevived: false,
        adReady: false,
        adMobInstance: null
    };

    // --- ADMOB INITIALIZATION ---
    async function initAdMob() {
        try {
            if (window.Capacitor && window.Capacitor.Plugins.AdMob) {
                state.adMobInstance = window.Capacitor.Plugins.AdMob;
                await state.adMobInstance.initialize();
                console.log('AdMob Initialized');

                state.adMobInstance.addListener('onRewardedVideoAdLoaded', () => {
                    console.log('Reward Ad Loaded');
                    state.adReady = true;
                });

                state.adMobInstance.addListener('onRewardedVideoAdDismissed', () => {
                    console.log('Reward Ad Dismissed');
                    // If dismissed without reward, trigger standard game over
                    if (!state.hasRevived) endGame(window.Game ? window.Game.getStats() : {});
                });

                // Load the first ads
                loadRewardAd();
                showBannerAd();
            }
        } catch (e) {
            console.warn('AdMob not available or failed to init:', e);
        }
    }

    async function showBannerAd() {
        if (!state.adMobInstance) return;
        try {
            await state.adMobInstance.showBanner({
                adId: 'ca-app-pub-6602754762079317/8736409171',
                adSize: 'BANNER',
                position: 'BOTTOM_CENTER',
                margin: 0,
                isTesting: false
            });
        } catch (e) {
            console.error('Failed to show Banner Ad', e);
        }
    }

    async function loadRewardAd() {
        if (!state.adMobInstance) return;
        state.adReady = false;
        try {
            await state.adMobInstance.prepareRewardVideoAd({
                adId: 'ca-app-pub-6602754762079317/6712881063', // Your Production ID
                isTesting: false
            });
        } catch (e) {
            console.error('Failed to load Reward Ad', e);
        }
    }

    initAdMob();

    // --- SCREEN NAVIGATION ---
    let previousScreen = screens.mainMenu;

    function showScreen(targetScreen) {
        if (!targetScreen) return;
        
        // Remember where we came from if we are going to settings
        if (targetScreen === screens.settingsScreen) {
            Object.values(screens).forEach(screen => {
                if (screen && !screen.classList.contains('hidden') && screen !== screens.settingsScreen) {
                    previousScreen = screen;
                }
            });
        }

        Object.values(screens).forEach(screen => {
            if (screen) {
                if (screen === targetScreen) {
                    screen.classList.remove('hidden');
                } else {
                    screen.classList.add('hidden');
                }
            }
        });
    }

    // --- MAIN NAVIGATION LISTENERS ---

    if (buttons.play) {
        buttons.play.onclick = () => {
            console.log('Event: Play Clicked');
            resetGameState();
            showScreen(screens.gameHUD);
            setTimeout(() => {
                if (window.GodotBridge) window.GodotBridge.startGame();
            }, 200);
        };
    }

    // --- REVIVE LOGIC ---
    let reviveTimerInterval;
    function startReviveTimer(stats) {
        let timeLeft = 5;
        const timerEl = document.getElementById('revive-timer');
        if (timerEl) timerEl.innerText = timeLeft;

        reviveTimerInterval = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(reviveTimerInterval);
                endGame(stats);
            }
        }, 1000);
    }

    if (buttons.watchAd) {
        buttons.watchAd.onclick = async () => {
            clearInterval(reviveTimerInterval); // Stop timer
            
            if (state.adMobInstance && state.adReady) {
                try {
                    const rewardItem = await state.adMobInstance.showRewardVideoAd();
                    console.log('User watched ad, reward:', rewardItem);
                    // Successfully watched ad, trigger revive!
                    state.hasRevived = true;
                    showScreen(screens.gameHUD);
                    if (window.Game) window.Game.revivePlayer();
                } catch (e) {
                    console.error('Ad show failed:', e);
                    endGame(window.Game ? window.Game.getStats() : {});
                }
            } else {
                console.log('Ad not ready or unavailable. Faking revive for web Dev mode.');
                // Fallback for Web browser testing
                setTimeout(() => {
                    state.hasRevived = true;
                    showScreen(screens.gameHUD);
                    if (window.Game) window.Game.revivePlayer();
                }, 1000);
            }
        };
    }

    if (buttons.skipRevive) {
        buttons.skipRevive.onclick = () => {
            clearInterval(reviveTimerInterval);
            endGame(window.Game ? window.Game.getStats() : {});
        };
    }

    if (buttons.settings) {
        buttons.settings.onclick = () => {
            console.log('Event: Settings Clicked');
            showScreen(screens.settingsScreen);
        };
    }

    if (buttons.menuSettings) {
        buttons.menuSettings.onclick = () => showScreen(screens.settingsScreen);
    }

    if (buttons.hudSettings) {
        buttons.hudSettings.onclick = () => {
            console.log('Event: HUD Settings Clicked');
            if (window.Game && !state.isPaused) {
                state.isPaused = true;
                if (buttons.pause) buttons.pause.innerText = 'play_arrow';
                if (window.GodotBridge) window.GodotBridge.togglePause(true);
            }
            showScreen(screens.settingsScreen);
        };
    }

    if (buttons.backHome) {
        buttons.backHome.onclick = () => showScreen(previousScreen);
    }

    if (buttons.settingsBack) {
        buttons.settingsBack.onclick = () => showScreen(previousScreen);
    }

    if (buttons.pause) {
        buttons.pause.onclick = () => {
            console.log('Event: Pause Clicked');
            state.isPaused = !state.isPaused;
            buttons.pause.innerText = state.isPaused ? 'play_arrow' : 'pause';
            if (window.GodotBridge) window.GodotBridge.togglePause(state.isPaused);
        };
    }

    if (buttons.retry) {
        buttons.retry.onclick = () => {
            console.log('Event: Retry Clicked');
            resetGameState();
            showScreen(screens.gameHUD);
            setTimeout(() => {
                if (window.GodotBridge) window.GodotBridge.startGame();
            }, 200);
        };
    }

    if (buttons.mainMenu) {
        buttons.mainMenu.onclick = () => showScreen(screens.mainMenu);
    }

    if (buttons.exit) {
        buttons.exit.onclick = () => {
            alert('Terminating Session...');
            if (window.GodotBridge && typeof window.GodotBridge.exitApp === 'function') {
                window.GodotBridge.exitApp();
            }
        };
    }

    // --- HUD UPDATES ---

    function updateHUD() {
        if (displays.score) displays.score.innerText = state.score.toString().padStart(6, '0');
        if (displays.healthBar) displays.healthBar.style.width = `${state.health}%`;
        if (displays.healthText) displays.healthText.innerText = `${Math.round(state.health)}%`;
        if (displays.powerFill) displays.powerFill.style.width = `${state.power}%`;
        if (displays.powerText) displays.powerText.innerText = `${Math.round(state.power)}%`;
    }

    function resetGameState() {
        state.score = 0;
        state.power = 0;
        state.health = 100;
        state.isPaused = false;
        state.hasRevived = false;
        if (buttons.pause) buttons.pause.innerText = 'pause';
        updateHUD();
        // Load a fresh ad for the next run
        loadRewardAd();
    }

    function endGame(stats = {}) {
        if (displays.finalScore) displays.finalScore.innerText = stats.score || state.score;
        if (displays.accuracy) displays.accuracy.innerText = (stats.accuracy || 0) + '%';
        if (displays.time) displays.time.innerText = stats.duration || '0:00';
        
        showScreen(screens.gameOverScreen);
        if (window.GodotBridge) window.GodotBridge.stopGame();
    }

    // --- GODOT BRIDGE ---
    window.GodotBridge = {
        startGame: () => {
            if (window.Game) window.Game.start();
        },
        stopGame: () => {
            if (window.Game) window.Game.isRunning = false;
        },
        togglePause: (paused) => {
            if (window.Game) window.Game.pause(paused);
        },
        exitApp: () => console.log('[Game] Exit Application'),

        updateScore: (newScore) => {
            state.score = newScore;
            updateHUD();
        },
        requestRevive: (stats) => {
            if (state.hasRevived) {
                // Already revived once, just end it
                endGame(stats);
            } else {
                showScreen(screens.reviveScreen);
                startReviveTimer(stats);
            }
        },
        onGameOver: (stats) => {
            endGame(stats);
        }
    };

    // Initial Setup
    showScreen(screens.mainMenu);
    updateHUD();
    console.log('UI System Ready.');
});
