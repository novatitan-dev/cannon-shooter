/**
 * Canon Shooter - Tactical UI Interactivity
 * Integrated with "Kinetic Architect" Design System
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI System Initializing...');

    // Screen Elements
    const screens = {
        mainMenu: document.getElementById('main-menu'),
        modeSelection: document.getElementById('mode-selection'),
        challengeSelection: document.getElementById('challenge-selection'),
        gameHUD: document.getElementById('game-hud'),
        settingsScreen: document.getElementById('settings-screen'),

        reviveScreen: document.getElementById('revive-screen'),
        gameOverScreen: document.getElementById('game-over-screen')
    };

    // Buttons
    const buttons = {
        play: document.getElementById('play-btn'),
        settings: document.getElementById('settings-btn'),
        howToPlay: document.getElementById('how-to-play-btn'),

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
        bgDark: document.getElementById('bg-dark-btn'),

        modeBack: document.getElementById('mode-back-btn'),
        challengeBack: document.getElementById('challenge-back-btn'),
        launchClassic: document.getElementById('launch-classic-btn'),
        selectChallenges: document.getElementById('select-challenges-btn'),
        launchTimeAttack: document.getElementById('launch-challenge-time-attack'),
        launchIronDome: document.getElementById('launch-challenge-iron-dome'),
        launchPureSkill: document.getElementById('launch-challenge-pure-skill'),
        launchTitanBrawl: document.getElementById('launch-challenge-titan-brawl')
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
        adMobInstance: null,
        lastMode: 'classic',
        lastChallengeId: null
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

    function updateModeSelectionUI() {
        // Classic mode high score
        const classicHigh = localStorage.getItem('cs_classic_highscore');
        const hsBlock = document.getElementById('classic-highscore-block');
        const hsVal = document.getElementById('classic-highscore-val');
        if (hsBlock && hsVal) {
            if (classicHigh) {
                hsVal.textContent = parseInt(classicHigh, 10).toLocaleString() + ' PTS';
                hsBlock.classList.remove('hidden');
            } else {
                hsBlock.classList.add('hidden');
            }
        }

        // Challenge missions cleared count
        const challenges = ['time_attack', 'iron_dome', 'pure_skill', 'titan_brawl'];
        let clearedCount = 0;
        challenges.forEach(id => {
            if (localStorage.getItem(`cs_challenge_${id}`)) {
                clearedCount++;
            }
        });
        const statsBlock = document.getElementById('challenge-stats-block');
        const clearedVal = document.getElementById('challenge-cleared-val');
        if (statsBlock && clearedVal) {
            if (clearedCount > 0) {
                clearedVal.textContent = `${clearedCount}/4`;
                statsBlock.classList.remove('hidden');
            } else {
                statsBlock.classList.add('hidden');
            }
        }
    }

    if (buttons.play) {
        buttons.play.onclick = () => {
            console.log('Event: Play Clicked -> Show Mode Selection');
            updateModeSelectionUI();
            showScreen(screens.modeSelection);
        };
    }

    if (buttons.modeBack) {
        buttons.modeBack.onclick = () => {
            showScreen(screens.mainMenu);
        };
    }

    if (buttons.challengeBack) {
        buttons.challengeBack.onclick = () => {
            showScreen(screens.modeSelection);
        };
    }

    function launchClassicGame() {
        resetGameState('classic');
        showScreen(screens.gameHUD);
        setTimeout(() => {
            if (window.GodotBridge) window.GodotBridge.startGame('classic');
        }, 200);
    }

    if (buttons.launchClassic) {
        buttons.launchClassic.onclick = () => {
            console.log('Event: Launch Classic Clicked');
            launchClassicGame();
        };
    }

    function updateChallengeSelectionUI() {
        const challenges = ['time_attack', 'iron_dome', 'pure_skill', 'titan_brawl'];
        challenges.forEach(id => {
            const key = `cs_challenge_${id}`;
            const record = localStorage.getItem(key);
            const labelEl = document.getElementById(`record-${id.replace('_', '-')}`);
            const blockEl = document.getElementById(`record-block-${id.replace('_', '-')}`);
            if (labelEl) {
                if (record) {
                    if (id === 'time_attack' || id === 'titan_brawl') {
                        labelEl.textContent = `${record}s (Cleared)`;
                        labelEl.className = "font-black text-emerald-500";
                    } else {
                        labelEl.textContent = 'Cleared';
                        labelEl.className = "font-black text-emerald-500";
                    }
                    if (blockEl) blockEl.classList.remove('hidden');
                } else {
                    labelEl.textContent = id === 'time_attack' || id === 'titan_brawl' ? '--' : 'Not Cleared';
                    labelEl.className = "font-black text-slate-400 dark:text-slate-500";
                    if (blockEl) blockEl.classList.add('hidden');
                }
            }
        });
    }

    if (buttons.selectChallenges) {
        buttons.selectChallenges.onclick = () => {
            console.log('Event: Select Challenges Clicked');
            updateChallengeSelectionUI();
            showScreen(screens.challengeSelection);
        };
    }

    function startChallenge(challengeId) {
        console.log(`Event: Launch Challenge ${challengeId}`);
        resetGameState('challenge', challengeId);
        showScreen(screens.gameHUD);
        setTimeout(() => {
            if (window.GodotBridge) window.GodotBridge.startGame('challenge', challengeId);
        }, 200);
    }

    if (buttons.launchTimeAttack) {
        buttons.launchTimeAttack.onclick = () => startChallenge('time_attack');
    }
    if (buttons.launchIronDome) {
        buttons.launchIronDome.onclick = () => startChallenge('iron_dome');
    }
    if (buttons.launchPureSkill) {
        buttons.launchPureSkill.onclick = () => startChallenge('pure_skill');
    }
    if (buttons.launchTitanBrawl) {
        buttons.launchTitanBrawl.onclick = () => startChallenge('titan_brawl');
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

    if (buttons.howToPlay) {
        buttons.howToPlay.onclick = () => {
            console.log('Event: How to Play Clicked');
            const htpOverlay = document.getElementById('htp-overlay');
            if (htpOverlay) htpOverlay.classList.add('active');
        };
    }

    // How to Play popup close
    const htpOverlay = document.getElementById('htp-overlay');
    const htpCloseBtn = document.getElementById('htp-close-btn');
    if (htpOverlay && htpCloseBtn) {
        htpCloseBtn.addEventListener('click', () => htpOverlay.classList.remove('active'));
        htpOverlay.addEventListener('click', (e) => {
            if (e.target === htpOverlay) htpOverlay.classList.remove('active');
        });
    }

    if (buttons.menuSettings) {
        buttons.menuSettings.onclick = () => showScreen(screens.settingsScreen);
    }

    // Bomb power-up button
    const bombBtn = document.getElementById('hud-buff-bomb');
    if (bombBtn) {
        bombBtn.onclick = (e) => {
            e.stopPropagation(); // Don't trigger cannon movement
            if (window.Game) window.Game.useBomb();
        };
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
            if (state.lastMode === 'challenge') {
                startChallenge(state.lastChallengeId);
            } else {
                launchClassicGame();
            }
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

    function resetGameState(mode = 'classic', challengeId = null) {
        state.score = 0;
        state.power = 0;
        state.health = 100;
        state.isPaused = false;
        state.hasRevived = false;
        state.lastMode = mode;
        state.lastChallengeId = challengeId;
        if (buttons.pause) buttons.pause.innerText = 'pause';
        updateHUD();
        // Load a fresh ad for the next run
        loadRewardAd();
    }

    function endGame(stats = {}) {
        const titleEl = document.getElementById('game-over-title');
        const titleBarEl = document.getElementById('game-over-title-bar');
        const iconEl = document.getElementById('game-over-icon');
        const scoreLabelEl = document.getElementById('game-over-score-label');
        const scoreUnitEl = document.getElementById('game-over-score-unit');

        if (stats.isChallenge) {
            if (stats.win) {
                if (titleEl) {
                    titleEl.innerText = 'Mission Accomplished';
                    titleEl.className = 'text-[0.6875rem] font-bold text-emerald-500 tracking-widest uppercase';
                }
                if (titleBarEl) {
                    titleBarEl.className = 'h-1 w-8 bg-emerald-500 mt-1';
                }
                if (iconEl) {
                    iconEl.innerText = 'check_circle';
                    iconEl.className = 'material-symbols-outlined text-emerald-500';
                }
            } else {
                if (titleEl) {
                    titleEl.innerText = 'Mission Failed';
                    titleEl.className = 'text-[0.6875rem] font-bold text-red-500 tracking-widest uppercase';
                }
                if (titleBarEl) {
                    titleBarEl.className = 'h-1 w-8 bg-red-500 mt-1';
                }
                if (iconEl) {
                    iconEl.innerText = 'cancel';
                    iconEl.className = 'material-symbols-outlined text-red-500';
                }
            }

            if (stats.challengeId === 'time_attack' || stats.challengeId === 'titan_brawl') {
                if (scoreLabelEl) scoreLabelEl.innerText = 'COMPLETION TIME';
                if (displays.finalScore) {
                    const elapsed = stats.rawTimeMs ? (stats.rawTimeMs / 1000).toFixed(1) : (state.score / 1000).toFixed(1);
                    displays.finalScore.innerText = elapsed;
                }
                if (scoreUnitEl) scoreUnitEl.innerText = 'SEC';
            } else {
                if (scoreLabelEl) scoreLabelEl.innerText = 'FINAL SCORE';
                if (displays.finalScore) displays.finalScore.innerText = stats.score || state.score;
                if (scoreUnitEl) scoreUnitEl.innerText = 'PTS';
            }
        } else {
            if (titleEl) {
                titleEl.innerText = 'Combat Record';
                titleEl.className = 'text-[0.6875rem] font-bold text-primary tracking-widest uppercase';
            }
            if (titleBarEl) {
                titleBarEl.className = 'h-1 w-8 bg-primary mt-1';
            }
            if (iconEl) {
                iconEl.innerText = 'error';
                iconEl.className = 'material-symbols-outlined text-error';
            }
            if (scoreLabelEl) scoreLabelEl.innerText = 'FINAL SCORE';
            const finalScore = stats.score || state.score;
            if (displays.finalScore) displays.finalScore.innerText = finalScore;
            if (scoreUnitEl) scoreUnitEl.innerText = 'PTS';

            // Save classic high score to localStorage
            const currentHigh = parseInt(localStorage.getItem('cs_classic_highscore') || '0', 10);
            if (finalScore > currentHigh) {
                localStorage.setItem('cs_classic_highscore', finalScore.toString());
            }
        }

        if (displays.accuracy) displays.accuracy.innerText = (stats.accuracy || 0) + '%';
        if (displays.time) displays.time.innerText = stats.duration || '0:00';
        
        showScreen(screens.gameOverScreen);
        if (window.GodotBridge) window.GodotBridge.stopGame();
    }

    // --- GODOT BRIDGE ---
    window.GodotBridge = {
        startGame: (mode = 'classic', challengeId = null) => {
            if (window.Game) window.Game.start(mode, challengeId);
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
