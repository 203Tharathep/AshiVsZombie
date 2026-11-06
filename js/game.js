// Ashi vs Zombie - Core Game Engine & Loop

class AshiVsZombieGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Dimensions
        this.canvasWidth = 1060;
        this.canvasHeight = 600;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        // Grid Configuration
        this.gridRows = 5;
        this.gridCols = 9;
        this.tileWidth = 85;
        this.tileHeight = 95;
        this.gridLeft = 220;
        this.gridTop = 105;

        // Game State
        this.isRunning = false;
        this.isPaused = false;
        this.gameSpeed = 1;
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.sun = 0;

        // Entities
        this.plants = [];
        this.zombies = [];
        this.bullets = [];
        this.mowers = [];
        this.graves = [];

        // Systems
        this.particles = new ParticleSystem();
        this.ui = new UIManager(this);

        // Assets cache
        this.images = {};
        this.assetsLoaded = false;

        // Wave tracking
        this.levelTime = 0;
        this.waveIndex = 0;
        this.totalWaves = 0;
        this.hugeWaveActive = false;
        this.hugeWaveTimer = 0;
        this.skySunTimer = 7.0;

        // Stats
        this.stats = {
            zombiesKilled: 0,
            sunCollected: 0,
            plantsPlanted: 0
        };

        // Mouse & Hover
        this.mouseX = 0;
        this.mouseY = 0;
        this.hoverRow = -1;
        this.hoverCol = -1;

        // Screen Shake
        this.shakeTimer = 0;
        this.shakeMagnitude = 0;

        // Boss reference
        this.bossInstance = null;

        // Environment anim
        this.envAnim = 0;
        this.lightningTimer = 0;
        this.lightningAlpha = 0;
    }

    async init() {
        await this.preloadSprites();
        this.setupEventListeners();
        this.startLevel(this.ui.currentLevelIndex || 0);
        this.ui.initUI();

        // Main animation loop
        let lastTime = performance.now();
        const loop = (time) => {
            const rawDt = (time - lastTime) / 1000;
            lastTime = time;
            const dt = Math.min(rawDt, 0.1) * this.gameSpeed;

            if (this.isRunning && !this.isPaused) {
                this.update(dt);
            }
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    async preloadSprites() {
        const spriteList = [
            'assets/sprites/plant_sunflower.png',
            'assets/sprites/plant_peashooter.png',
            'assets/sprites/plant_repeater.png',
            'assets/sprites/plant_wallnut.png',
            'assets/sprites/plant_bomb.png',
            'assets/sprites/plant_icepea.png',
            'assets/sprites/plant_squash.png',
            'assets/sprites/plant_chomper.png',
            'assets/sprites/plant_hypno.png',
            'assets/sprites/plant_spikeweed.png',
            'assets/sprites/plant_lilypad.png',
            'assets/sprites/plant_catapult.png',
            'assets/sprites/plant_jalapeno.png',
            'assets/sprites/plant_gatling.png',
            'assets/sprites/mower_ashi.png',
            'assets/sprites/zombie_basic.png',
            'assets/sprites/zombie_cone.png',
            'assets/sprites/zombie_bucket.png',
            'assets/sprites/zombie_shield.png',
            'assets/sprites/zombie_gigachad.png',
            'assets/sprites/zombie_couch.png',
            'assets/sprites/zombie_boss.png',
            'assets/sprites/sun_token.png',
            'assets/sprites/bullet_pea.png',
            'assets/sprites/bullet_ice.png',
            'assets/sprites/bullet_web.png',
            'assets/sprites/ui_shovel.png'
        ];

        const promises = spriteList.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    this.images[src] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn('Could not load sprite:', src);
                    resolve();
                };
            });
        });

        await Promise.all(promises);
        this.assetsLoaded = true;
    }

    startLevel(levelIdx) {
        if (!window.LEVELS_CONFIG || window.LEVELS_CONFIG.length === 0) return;
        if (levelIdx >= window.LEVELS_CONFIG.length || levelIdx < 0) {
            levelIdx = 0;
        }
        this.currentLevelIndex = levelIdx;
        if (this.ui) {
            this.ui.currentLevelIndex = levelIdx;
            this.ui.saveProgress();
        }

        this.currentLevel = window.LEVELS_CONFIG[levelIdx];
        this.sun = (this.currentLevel && this.currentLevel.startingSun !== undefined) ? this.currentLevel.startingSun : 0;
        if (this.ui) this.ui.updateSunDisplay(this.sun);

        // Reset entities
        this.plants = [];
        this.zombies = [];
        this.bullets = [];
        this.particles.reset();
        this.bossInstance = null;

        // Reset stats
        this.stats = {
            zombiesKilled: 0,
            sunCollected: 0,
            plantsPlanted: 0
        };

        // Initialize lawnmowers (Flying Ashi)
        this.mowers = [];
        for (let r = 0; r < this.gridRows; r++) {
            if (this.currentLevel.activeRows.includes(r)) {
                this.mowers.push({
                    row: r,
                    x: this.gridLeft - 60,
                    active: false,
                    used: false,
                    speed: 750
                });
            }
        }

        // Initialize night gravestones
        this.graves = [];
        if (this.currentLevel.graves) {
            this.currentLevel.graves.forEach(pos => {
                this.graves.push({ row: pos[0], col: pos[1], hp: 300 });
            });
        }

        // Waves setup
        this.levelTime = 0;
        this.waveIndex = 0;
        this.totalWaves = this.currentLevel.waves.length;
        this.hugeWaveActive = false;
        this.hugeWaveTimer = 0;
        this.skySunTimer = 1.0; // first sun drops almost immediately

        // UI & BGM
        if (this.ui) {
            this.ui.renderSeedBank();
            this.ui.updateWaveProgress(0);
        }
        const titleEl = document.getElementById('current-level-title');
        if (titleEl) titleEl.textContent = this.currentLevel.nameTh;

        window.AudioMgr.startBGM(this.currentLevel.theme);
        this.isRunning = true;
        this.isPaused = false;
    }

    restartLevel() {
        this.startLevel(this.currentLevelIndex);
    }

    nextLevel() {
        this.startLevel(this.currentLevelIndex + 1);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const modal = document.getElementById('pause-modal');
        if (modal) {
            if (this.isPaused) {
                modal.classList.remove('hidden');
            } else {
                modal.classList.add('hidden');
            }
        }
    }

    // --- Core Update Loop ---
    update(dt) {
        this.envAnim += dt;
        this.levelTime += dt;

        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        // Lightning in Boss stage
        if (this.currentLevel && this.currentLevel.theme === 'boss') {
            this.lightningTimer -= dt;
            if (this.lightningTimer <= 0) {
                this.lightningTimer = 6.0 + Math.random() * 8.0;
                this.lightningAlpha = 0.8;
                this.shakeScreen(0.3, 8);
            }
            if (this.lightningAlpha > 0) {
                this.lightningAlpha -= dt * 2.5;
            }
        }

        // 1. Sky Sun Falling (Day / Pool / Roof / Boss)
        if (this.currentLevel && this.currentLevel.skySunInterval > 0) {
            this.skySunTimer -= dt;
            if (this.skySunTimer <= 0) {
                this.skySunTimer = this.currentLevel.skySunInterval + Math.random() * 0.8;
                this.spawnSkySun();
            }
        }

        // 2. Wave Spawner
        this.updateWaveSpawner(dt);

        // 3. Update Plants
        for (let i = this.plants.length - 1; i >= 0; i--) {
            const p = this.plants[i];
            const alive = p.update(dt, this);
            if (!alive) {
                this.plants.splice(i, 1);
            }
        }

        // 4. Update Zombies
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const z = this.zombies[i];
            const alive = z.update(dt, this);
            if (!alive) {
                this.zombies.splice(i, 1);
                continue;
            }

            // Check if zombie reached the house
            if (!z.isHypnotized && z.x <= this.gridLeft - 10) {
                const mower = this.mowers.find(m => m.row === z.row && !m.used);
                if (mower && !mower.active) {
                    mower.active = true;
                    window.AudioMgr.playMower();
                } else if (!mower || mower.used) {
                    if (z.x < this.gridLeft - 110) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        // 5. Update Lawnmowers (Flying Ashi)
        this.mowers.forEach(mower => {
            if (mower.active && !mower.used) {
                mower.x += mower.speed * dt;
                this.zombies.forEach(z => {
                    if (z.row === mower.row && Math.abs(z.x - mower.x) < 70) {
                        z.takeDamage(9999, 'bomb', this);
                    }
                });
                if (mower.x > this.canvasWidth + 100) {
                    mower.used = true;
                    mower.active = false;
                }
            }
        });

        // 6. Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.speed * dt;

            // Lob arc (Spidey Catapult)
            if (b.lob) {
                const totalDist = (b.targetCol + 0.5) * this.tileWidth + this.gridLeft - b.startX;
                const currentDist = b.x - b.startX;
                const progress = Math.min(1.0, currentDist / Math.max(1, totalDist));
                b.arcY = -Math.sin(progress * Math.PI) * 75;
            }

            // Check collision with zombies
            let hit = false;
            for (let z of this.zombies) {
                if (z.row === b.row && !z.isHypnotized && !z.isDead) {
                    const hitDist = b.lob ? 35 : 45;
                    if (Math.abs(z.x - b.x) < hitDist) {
                        z.takeDamage(b.damage, b.type, this);
                        hit = true;
                        break;
                    }
                }
            }

            if (hit || b.x > this.canvasWidth + 50) {
                this.bullets.splice(i, 1);
            }
        }

        // 7. Update Particles & UI Cooldowns
        this.particles.update(dt, this);
        if (this.ui) this.ui.updateCooldowns(dt);

        // Huge Wave Banner countdown (always runs regardless of spawner status)
        if (this.hugeWaveActive) {
            this.hugeWaveTimer -= dt;
            if (this.hugeWaveTimer <= 0) {
                this.hugeWaveActive = false;
            }
        }

        // 8. Check Level Completion
        if (this.waveIndex >= this.totalWaves && this.zombies.length === 0 && !this.hugeWaveActive) {
            this.victory();
        }
    }

    updateWaveSpawner(dt) {
        if (!this.currentLevel || this.waveIndex >= this.totalWaves) return;

        const nextWave = this.currentLevel.waves[this.waveIndex];
        if (!nextWave) return;

        if (this.levelTime >= nextWave.delay) {
            if (nextWave.isFlag) {
                this.hugeWaveActive = true;
                this.hugeWaveTimer = 2.8; // 2.8 seconds banner duration
                window.AudioMgr.playHugeWave();
                this.shakeScreen(0.6, 5);

                if (this.currentLevel.theme === 'night' && this.graves.length > 0) {
                    this.graves.forEach(g => {
                        this.spawnZombie('basic', g.row, (g.col + 0.5) * this.tileWidth + this.gridLeft);
                        this.particles.addPlantDust((g.col + 0.5) * this.tileWidth + this.gridLeft, (g.row + 0.5) * this.tileHeight + this.gridTop);
                    });
                }
            }

            // Spawn configured zombies
            nextWave.zombies.forEach((zConf, idx) => {
                setTimeout(() => {
                    const spawnX = this.canvasWidth + 20 + Math.random() * 80;
                    this.spawnZombie(zConf.type, zConf.row, spawnX);
                }, idx * 850);
            });

            this.waveIndex++;
            const pct = (this.waveIndex / this.totalWaves) * 100;
            if (this.ui) this.ui.updateWaveProgress(pct);
        }
    }

    spawnZombie(typeId, row, x) {
        if (!window.ZOMBIE_TYPES[typeId]) return;
        const zombie = new window.ZombieInstance(typeId, row, x);
        this.zombies.push(zombie);
        if (typeId === 'boss') {
            this.bossInstance = zombie;
        }
    }

    spawnSkySun() {
        const randCol = Math.floor(Math.random() * this.gridCols);
        const randRow = Math.floor(Math.random() * this.gridRows);
        const x = this.gridLeft + (randCol + 0.5) * this.tileWidth;
        const targetY = this.gridTop + (randRow + 0.5) * this.tileHeight;
        this.particles.addSun(x, -30, targetY, false);
    }

    spawnSunFromPlant(plant) {
        const x = this.gridLeft + (plant.col + 0.5) * this.tileWidth;
        const y = this.gridTop + (plant.row + 0.3) * this.tileHeight;
        this.particles.addSun(x, y, y + 20, true);
    }

    addSun(amount) {
        this.sun += amount;
        this.stats.sunCollected += amount;
        if (this.ui) this.ui.updateSunDisplay(this.sun);
    }

    addBullet(bullet) {
        bullet.startX = bullet.x;
        this.bullets.push(bullet);
    }

    shakeScreen(duration = 0.4, magnitude = 6) {
        this.shakeTimer = duration;
        this.shakeMagnitude = magnitude;
    }

    // --- Entity Query & Helpers ---
    hasZombiesInRow(row, col) {
        const minX = this.gridLeft + col * this.tileWidth;
        return this.zombies.some(z => z.row === row && !z.isHypnotized && z.x >= minX);
    }

    getFirstZombieCol(row) {
        let nearestCol = 8;
        let minX = 9999;
        this.zombies.forEach(z => {
            if (z.row === row && !z.isHypnotized && z.x < minX) {
                minX = z.x;
                nearestCol = Math.floor((z.x - this.gridLeft) / this.tileWidth);
            }
        });
        return nearestCol;
    }

    getPlantAt(row, col) {
        return this.plants.find(p => p.row === row && p.col === col);
    }

    damageZombiesAt(row, col, amount) {
        const tileLeft = this.gridLeft + col * this.tileWidth;
        const tileRight = tileLeft + this.tileWidth;
        this.zombies.forEach(z => {
            if (z.row === row && !z.isHypnotized && z.x >= tileLeft - 25 && z.x <= tileRight + 25) {
                z.takeDamage(amount, 'bomb', this);
            }
        });
    }

    damageZombiesInLane(row, amount) {
        this.zombies.forEach(z => {
            if (z.row === row && !z.isHypnotized) {
                z.takeDamage(amount, 'fire', this);
            }
        });
    }

    damageZombiesOverSpike(row, col, amount) {
        const tileLeft = this.gridLeft + col * this.tileWidth;
        const tileRight = tileLeft + this.tileWidth;
        this.zombies.forEach(z => {
            if (z.row === row && !z.isHypnotized && z.x >= tileLeft && z.x <= tileRight) {
                z.takeDamage(amount, 'spike', this);
            }
        });
    }

    findSquashTarget(row, col) {
        const tileLeft = this.gridLeft + col * this.tileWidth;
        return this.zombies.find(z => z.row === row && !z.isHypnotized && Math.abs(z.x - (tileLeft + 40)) < 90);
    }

    findChomperTarget(row, col) {
        const tileLeft = this.gridLeft + col * this.tileWidth;
        return this.zombies.find(z => z.row === row && !z.isHypnotized && z.x >= tileLeft && z.x <= tileLeft + this.tileWidth * 1.4);
    }

    findEnemyZombieInLane(row, x) {
        return this.zombies.find(z => z.row === row && !z.isHypnotized && Math.abs(z.x - x) < 50);
    }

    killZombie(zombie) {
        zombie.isDead = true;
        this.onZombieKilled(zombie);
    }

    onZombieKilled(zombie) {
        this.stats.zombiesKilled++;
        this.particles.addText(zombie.x, zombie.row * this.tileHeight + 110, `+${zombie.type.points} PTS`, '#00ffcc');
        this.particles.addSparks(zombie.x, zombie.row * this.tileHeight + 130, 15, '#ff4444');
    }

    bossStompRandomLane(boss) {
        const randRow = Math.floor(Math.random() * this.gridRows);
        this.shakeScreen(0.5, 10);
        window.AudioMgr.playBoom();
        this.particles.addText(this.gridLeft + 4 * this.tileWidth, randRow * this.tileHeight + 110, "BOSS STOMP!", "#ff0000", 26);
        this.plants = this.plants.filter(p => !(p.row === randRow && p.col >= 6));
    }

    spawnBossReinforcements() {
        this.particles.addText(this.canvasWidth - 160, 120, "SUMMON HORDE!", "#ff00ff", 24);
        window.AudioMgr.playHugeWave();
        // Spawn 2-3 minions smoothly
        for (let r = 1; r <= 3; r++) {
            const types = ['basic', 'cone'];
            const t = types[Math.floor(Math.random() * types.length)];
            this.spawnZombie(t, r, this.canvasWidth + 20 + Math.random() * 50);
        }
    }

    // --- Victory & Game Over ---
    victory() {
        this.isRunning = false;
        window.AudioMgr.stopBGM();
        this.particles.addFireworks(this.canvasWidth, this.canvasHeight);

        const reward = this.currentLevel ? this.currentLevel.rewardPlant : null;
        if (reward && this.ui && !this.ui.unlockedPlants.includes(reward)) {
            this.ui.unlockPlant(reward);
            this.ui.showNewPlantModal(reward, () => {
                this.ui.showVictoryModal(this.stats, () => this.nextLevel(), () => this.restartLevel());
            });
        } else if (this.ui) {
            this.ui.showVictoryModal(this.stats, () => this.nextLevel(), () => this.restartLevel());
        }
    }

    gameOver() {
        this.isRunning = false;
        window.AudioMgr.stopBGM();
        if (this.ui) this.ui.showGameOverModal(() => this.restartLevel());
    }

    // --- Input & Grid Interaction ---
    setupEventListeners() {
        const handleMove = (clientX, clientY) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width ? (this.canvasWidth / rect.width) : 1;
            const scaleY = rect.height ? (this.canvasHeight / rect.height) : 1;
            this.mouseX = (clientX - rect.left) * scaleX;
            this.mouseY = (clientY - rect.top) * scaleY;

            // Calculate grid cell
            if (this.mouseX >= this.gridLeft && this.mouseX < this.gridLeft + this.gridCols * this.tileWidth &&
                this.mouseY >= this.gridTop && this.mouseY < this.gridTop + this.gridRows * this.tileHeight) {
                this.hoverCol = Math.floor((this.mouseX - this.gridLeft) / this.tileWidth);
                this.hoverRow = Math.floor((this.mouseY - this.gridTop) / this.tileHeight);
            } else {
                this.hoverCol = -1;
                this.hoverRow = -1;
            }

            // Auto collect suns on hover with magnetic attraction!
            this.particles.suns.forEach(sun => {
                const dist = Math.hypot(this.mouseX - sun.x, this.mouseY - sun.y);
                if (dist < 65 && !sun.collected) {
                    this.particles.collectSun(sun);
                } else if (dist < 110 && !sun.collected) {
                    sun.x += (this.mouseX - sun.x) * 0.08;
                    sun.y += (this.mouseY - sun.y) * 0.08;
                }
            });
        };

        this.canvas.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        const handleClick = () => {
            window.AudioMgr.init();

            // 1. Check if clicked a Sun token
            let sunClicked = false;
            this.particles.suns.forEach(sun => {
                const dist = Math.hypot(this.mouseX - sun.x, this.mouseY - sun.y);
                if (dist < 55 && !sun.collected) {
                    this.particles.collectSun(sun);
                    sunClicked = true;
                }
            });
            if (sunClicked) return;

            // 2. Check if inside grid
            if (this.hoverRow >= 0 && this.hoverCol >= 0 && this.currentLevel) {
                const row = this.hoverRow;
                const col = this.hoverCol;

                if (!this.currentLevel.activeRows.includes(row)) return;

                // Shovel active: dig plant
                if (this.ui.shovelActive) {
                    const existingPlant = this.getPlantAt(row, col);
                    if (existingPlant) {
                        this.plants = this.plants.filter(p => p !== existingPlant);
                        window.AudioMgr.playShovel();
                        this.particles.addPlantDust(
                            this.gridLeft + (col + 0.5) * this.tileWidth,
                            this.gridTop + (row + 0.5) * this.tileHeight
                        );
                        this.ui.deselectAll();
                    }
                    return;
                }

                // Plant selected: place plant
                if (this.ui.selectedSeed) {
                    const plantType = window.PLANT_TYPES[this.ui.selectedSeed];
                    if (!plantType) return;

                    const existingPlant = this.getPlantAt(row, col);
                    const isWaterRow = this.currentLevel.waterRows && this.currentLevel.waterRows.includes(row);

                    if (isWaterRow) {
                        if (plantType.id === 'lilypad') {
                            if (existingPlant) return;
                        } else {
                            if (!existingPlant || existingPlant.typeId !== 'lilypad') return;
                            this.plants = this.plants.filter(p => p !== existingPlant);
                        }
                    } else {
                        if (plantType.id === 'lilypad') return;
                        if (existingPlant) return;
                    }

                    if (this.sun < plantType.cost) return;

                    this.sun -= plantType.cost;
                    this.stats.plantsPlanted++;
                    this.ui.updateSunDisplay(this.sun);
                    this.ui.startCooldown(plantType.id);

                    const newPlant = new window.PlantInstance(plantType.id, row, col);
                    this.plants.push(newPlant);

                    window.AudioMgr.playPlant();
                    this.particles.addPlantDust(
                        this.gridLeft + (col + 0.5) * this.tileWidth,
                        this.gridTop + (row + 0.5) * this.tileHeight
                    );

                    this.ui.deselectAll();
                }
            }
        };

        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClick();
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.ui.deselectAll();
        });
    }

    // --- Rendering Engine ---
    render() {
        const ctx = this.ctx;
        ctx.save();

        // Screen Shake
        if (this.shakeTimer > 0) {
            const sx = (Math.random() - 0.5) * this.shakeMagnitude;
            const sy = (Math.random() - 0.5) * this.shakeMagnitude;
            ctx.translate(sx, sy);
        }

        // 1. Draw Stage Environment & Lawn Grid
        this.renderEnvironment(ctx);

        // 2. Lawnmowers (Flying Ashi)
        this.renderMowers(ctx);

        // 3. Gravestones (Night stage)
        this.renderGraves(ctx);

        // 4. Plants
        this.renderPlants(ctx);

        // 5. Zombies
        this.renderZombies(ctx);

        // 6. Projectiles
        this.renderBullets(ctx);

        // 7. Visual FX, Particles, Suns, Combat Text
        this.renderParticles(ctx);

        // 8. Hover Highlight & Plant Preview
        this.renderHoverPreview(ctx);

        // 9. Boss Health Bar (if boss stage)
        this.renderBossHealthBar(ctx);

        // 10. Huge Wave Banner
        if (this.hugeWaveActive) {
            this.renderHugeWaveBanner(ctx);
        }

        // Lightning flash
        if (this.lightningAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        ctx.restore();
    }

    renderEnvironment(ctx) {
        const theme = this.currentLevel ? this.currentLevel.theme : 'day';

        // Background Base
        if (theme === 'night') {
            ctx.fillStyle = '#0a1020';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 40; i++) {
                const sx = (i * 137) % this.canvasWidth;
                const sy = (i * 79) % 95;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (theme === 'roof' || theme === 'boss') {
            ctx.fillStyle = theme === 'boss' ? '#200a15' : '#1e2840';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        } else {
            ctx.fillStyle = '#3a7bd5';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }

        // Campus Building Wall on Left
        ctx.fillStyle = '#b58b4c';
        ctx.fillRect(0, 0, this.gridLeft - 30, this.canvasHeight);
        ctx.strokeStyle = '#947035';
        ctx.lineWidth = 1;
        for (let y = 0; y < this.canvasHeight; y += 22) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.gridLeft - 30, y);
            ctx.stroke();
        }

        // Sidewalk / Road on Right
        const roadX = this.gridLeft + this.gridCols * this.tileWidth;
        ctx.fillStyle = '#4a4a52';
        ctx.fillRect(roadX, this.gridTop, this.canvasWidth - roadX, this.gridRows * this.tileHeight);

        // Render Grid Lawn Cells
        for (let r = 0; r < this.gridRows; r++) {
            const isInactive = this.currentLevel && !this.currentLevel.activeRows.includes(r);
            const isWater = this.currentLevel && this.currentLevel.waterRows && this.currentLevel.waterRows.includes(r);

            for (let c = 0; c < this.gridCols; c++) {
                const x = this.gridLeft + c * this.tileWidth;
                const y = this.gridTop + r * this.tileHeight;

                if (isInactive) {
                    ctx.fillStyle = '#263820';
                    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                    continue;
                }

                if (isWater) {
                    const waveOffset = Math.sin(this.envAnim * 3 + r + c) * 3;
                    ctx.fillStyle = ((r + c) % 2 === 0) ? '#1e75b3' : '#156196';
                    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.beginPath();
                    ctx.arc(x + 40, y + 50 + waveOffset, 20, 0, Math.PI);
                    ctx.stroke();
                } else if (theme === 'roof' || theme === 'boss') {
                    ctx.fillStyle = ((r + c) % 2 === 0) ? (theme === 'boss' ? '#602820' : '#b24c28') : (theme === 'boss' ? '#501e18' : '#9b3e1e');
                    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.strokeRect(x, y, this.tileWidth, this.tileHeight);
                } else if (theme === 'night') {
                    ctx.fillStyle = ((r + c) % 2 === 0) ? '#1f6524' : '#174f1b';
                    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                } else {
                    ctx.fillStyle = ((r + c) % 2 === 0) ? '#4caf50' : '#43a047';
                    ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                }

                ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.strokeRect(x, y, this.tileWidth, this.tileHeight);
            }
        }
    }

    renderMowers(ctx) {
        const mowerImg = this.images['assets/sprites/mower_ashi.png'];
        this.mowers.forEach(m => {
            if (m.used) return;
            const y = this.gridTop + (m.row + 0.15) * this.tileHeight;
            if (mowerImg) {
                // Drop shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.ellipse(m.x + 36, y + 48, 30, 8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.drawImage(mowerImg, m.x, y, 75, 60);
            } else {
                ctx.fillStyle = '#ff3333';
                ctx.fillRect(m.x, y, 50, 40);
            }
        });
    }

    renderGraves(ctx) {
        this.graves.forEach(g => {
            const x = this.gridLeft + g.col * this.tileWidth + 15;
            const y = this.gridTop + g.row * this.tileHeight + 15;
            ctx.fillStyle = '#778899';
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x, y + 15, 55, 65, [25, 25, 5, 5]);
            } else {
                ctx.rect(x, y + 15, 55, 65);
            }
            ctx.fill();
            ctx.strokeStyle = '#334455';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#223344';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('R.I.P', x + 27, y + 45);
            ctx.fillText('ASHI', x + 27, y + 60);
        });
    }

    renderPlants(ctx) {
        this.plants.forEach(p => {
            const cx = this.gridLeft + (p.col + 0.5) * this.tileWidth;
            const cy = this.gridTop + (p.row + 0.5) * this.tileHeight + (p.squashYOffset || 0);
            const img = this.images[p.type.sprite];

            ctx.save();
            ctx.translate(cx, cy);

            // Ground shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.beginPath();
            ctx.ellipse(0, 32, 28, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            if (p.flashRed > 0) {
                ctx.filter = 'brightness(2.0) saturate(2.5)';
            }

            const scale = p.scale * (1.0 + Math.sin(p.bobble) * 0.035);
            ctx.scale(scale, scale);

            if (img) {
                const w = 75;
                const h = 75;
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
            } else {
                ctx.fillStyle = '#00cc66';
                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fill();
            }

            if (p.typeId === 'wallnut') {
                const hpPct = p.hp / p.maxHp;
                if (hpPct < 0.66) {
                    ctx.strokeStyle = '#442200';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-15, -15);
                    ctx.lineTo(-5, 5);
                    ctx.lineTo(-12, 18);
                    ctx.stroke();
                }
                if (hpPct < 0.33) {
                    ctx.beginPath();
                    ctx.moveTo(15, -10);
                    ctx.lineTo(5, 8);
                    ctx.lineTo(10, 22);
                    ctx.stroke();
                }
            }

            if (p.typeId === 'chomper' && p.isDigesting) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(-25, 28, 50, 7);
                ctx.fillStyle = '#ffcc00';
                const chewPct = 1.0 - (p.digestLeft / p.type.digestTime);
                ctx.fillRect(-25, 28, 50 * chewPct, 7);
            }

            ctx.restore();
        });
    }

    renderZombies(ctx) {
        this.zombies.forEach(z => {
            const cx = z.x;
            const cy = this.gridTop + (z.row + 0.45) * this.tileHeight + (z.vaultYOffset || 0);
            const spritePath = z.currentCustomSprite || z.type.sprite;
            const img = this.images[spritePath];

            ctx.save();
            ctx.translate(cx, cy);

            // Zombie ground shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
            ctx.beginPath();
            ctx.ellipse(0, 36, z.type.isBoss ? 55 : (z.type.isHeavy ? 42 : 26), 10, 0, 0, Math.PI * 2);
            ctx.fill();

            if (z.isHypnotized) {
                ctx.scale(-1, 1);
                ctx.shadowColor = '#ff66cc';
                ctx.shadowBlur = 15;
            }

            if (z.freezeTimer > 0) {
                ctx.filter = 'hue-rotate(180deg) saturate(2.0)';
            } else if (z.flashRed > 0) {
                ctx.filter = 'brightness(2.2) sepia(1) hue-rotate(-50deg)';
            }

            const wobbleAngle = Math.sin(z.wobble) * 0.08;
            ctx.rotate(wobbleAngle);

            if (img) {
                const w = z.type.isBoss ? 160 : (z.type.isHeavy ? 110 : 75);
                const h = z.type.isBoss ? 180 : (z.type.isHeavy ? 90 : 85);
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
            } else {
                ctx.fillStyle = '#883333';
                ctx.fillRect(-25, -40, 50, 80);
            }

            if (z.hp < z.maxHp && !z.type.isBoss) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(-25, -55, 50, 6);
                ctx.fillStyle = z.freezeTimer > 0 ? '#00ccff' : '#44ff44';
                const hpPct = Math.max(0, z.hp / z.maxHp);
                ctx.fillRect(-25, -55, 50 * hpPct, 6);
            }

            ctx.restore();
        });
    }

    renderBullets(ctx) {
        this.bullets.forEach(b => {
            const y = b.y + (b.arcY || 0);
            let img = this.images['assets/sprites/bullet_pea.png'];
            if (b.type === 'ice') img = this.images['assets/sprites/bullet_ice.png'];
            if (b.type === 'web') img = this.images['assets/sprites/bullet_web.png'];

            if (img) {
                ctx.drawImage(img, b.x - 12, y - 12, 24, 24);
            } else {
                ctx.fillStyle = b.type === 'ice' ? '#00ccff' : '#44ff44';
                ctx.beginPath();
                ctx.arc(b.x, y, 9, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    renderParticles(ctx) {
        ctx.fillStyle = 'rgba(255, 100, 0, 0.7)';
        this.particles.laneFires.forEach(lf => {
            const y = this.gridTop + lf.row * this.tileHeight;
            ctx.fillRect(this.gridLeft, y, lf.x, this.tileHeight);
        });

        this.particles.explosions.forEach(ex => {
            const grad = ctx.createRadialGradient(ex.x, ex.y, 10, ex.x, ex.y, ex.radius);
            grad.addColorStop(0, `rgba(255, 255, 200, ${ex.alpha})`);
            grad.addColorStop(0.4, `rgba(255, 120, 0, ${ex.alpha * 0.8})`);
            grad.addColorStop(1, `rgba(180, 0, 0, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex.x, ex.y, ex.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.particles.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        const sunImg = this.images['assets/sprites/sun_token.png'];
        this.particles.suns.forEach(sun => {
            ctx.save();
            ctx.translate(sun.x, sun.y);
            const scale = (sun.scale || 1.0) * (1.0 + Math.sin(sun.bobble) * 0.08);
            ctx.scale(scale, scale);

            if (sunImg) {
                ctx.drawImage(sunImg, -28, -28, 56, 56);
            } else {
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath();
                ctx.arc(0, 0, 24, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        this.particles.floatingTexts.forEach(ft => {
            ctx.font = `bold ${ft.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = ft.alpha;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1.0;
    }

    renderHoverPreview(ctx) {
        if (this.hoverRow >= 0 && this.hoverCol >= 0) {
            const x = this.gridLeft + this.hoverCol * this.tileWidth;
            const y = this.gridTop + this.hoverRow * this.tileHeight;

            if (this.ui && this.ui.shovelActive) {
                ctx.fillStyle = 'rgba(255, 60, 60, 0.35)';
                ctx.fillRect(x, y, this.tileWidth, this.tileHeight);
                const shovelImg = this.images['assets/sprites/ui_shovel.png'];
                if (shovelImg) ctx.drawImage(shovelImg, x + 15, y + 15, 50, 50);
            } else if (this.ui && this.ui.selectedSeed) {
                const plant = window.PLANT_TYPES[this.ui.selectedSeed];
                if (plant) {
                    ctx.strokeStyle = '#00ffcc';
                    ctx.lineWidth = 2.5;
                    ctx.setLineDash([6, 4]);
                    ctx.strokeRect(x + 2, y + 2, this.tileWidth - 4, this.tileHeight - 4);
                    ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(0, 255, 200, 0.15)';
                    ctx.fillRect(x + 2, y + 2, this.tileWidth - 4, this.tileHeight - 4);

                    const img = this.images[plant.sprite];
                    if (img) {
                        ctx.globalAlpha = 0.72;
                        ctx.drawImage(img, x + 8, y + 8, 68, 68);
                        ctx.globalAlpha = 1.0;
                    }
                }
            }
        }
    }

    renderBossHealthBar(ctx) {
        if (!this.bossInstance || this.bossInstance.isDead) return;

        const bx = 320;
        const by = 25;
        const bw = 420;
        const bh = 22;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(bx - 4, by - 4, bw + 8, bh + 8);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx - 4, by - 4, bw + 8, bh + 8);

        const hpPct = Math.max(0, this.bossInstance.hp / this.bossInstance.maxHp);
        const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
        grad.addColorStop(0, '#ff1100');
        grad.addColorStop(0.5, '#ff6600');
        grad.addColorStop(1, '#ffcc00');
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, bw * hpPct, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`👑 EMPEROR ASHI: ${Math.max(0, Math.round(this.bossInstance.hp))} / ${this.bossInstance.maxHp}`, bx + bw / 2, by + 16);
    }

    renderHugeWaveBanner(ctx) {
        ctx.save();
        const totalDur = 2.8;
        const remaining = Math.max(0, this.hugeWaveTimer);
        const elapsed = totalDur - remaining;

        let alpha = 1.0;
        let scale = 1.0;

        if (elapsed < 0.25) {
            const t = elapsed / 0.25;
            alpha = t;
            scale = 0.6 + t * 0.45;
        } else if (remaining < 0.4) {
            alpha = remaining / 0.4;
            scale = 1.0 + (1.0 - alpha) * 0.1;
        } else {
            scale = 1.0 + Math.sin(this.envAnim * 8) * 0.02;
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(this.canvasWidth / 2, 275);
        ctx.scale(scale, scale);

        const bannerW = 760;
        const bannerH = 88;

        const grad = ctx.createLinearGradient(0, -bannerH / 2, 0, bannerH / 2);
        grad.addColorStop(0, '#5a0505');
        grad.addColorStop(0.2, '#9a0d0d');
        grad.addColorStop(0.5, '#c61a1a');
        grad.addColorStop(0.8, '#9a0d0d');
        grad.addColorStop(1, '#5a0505');

        ctx.shadowColor = 'rgba(255, 30, 0, 0.7)';
        ctx.shadowBlur = 18;

        ctx.fillStyle = grad;
        ctx.beginPath();
        const hw = bannerW / 2;
        const hh = bannerH / 2;
        ctx.moveTo(-hw, -hh);
        ctx.lineTo(hw, -hh);
        ctx.lineTo(hw - 15, 0);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.lineTo(-hw + 15, 0);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.strokeStyle = '#ffeaa7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-hw + 8, -hh + 5);
        ctx.lineTo(hw - 8, -hh + 5);
        ctx.lineTo(hw - 20, 0);
        ctx.lineTo(hw - 8, hh - 5);
        ctx.lineTo(-hw + 8, hh - 5);
        ctx.lineTo(-hw + 20, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.font = '900 27px "Segoe UI", Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('⚠️ กองทัพซอมบี้อชิกำลังบุกเข้ามาเป็นฝูงใหญ่! ⚠️', 0, -12);

        ctx.font = '800 16px "Segoe UI", Tahoma, sans-serif';
        ctx.fillStyle = '#ffeb3b';
        ctx.fillText('A HUGE WAVE OF ZOMBIES IS APPROACHING!', 0, 20);

        ctx.restore();
    }
}

window.AshiVsZombieGame = AshiVsZombieGame;
