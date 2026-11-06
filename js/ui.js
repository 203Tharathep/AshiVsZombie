// Ashi vs Zombie - User Interface & HUD Manager

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedSeed = null;
        this.shovelActive = false;
        this.unlockedPlants = ['sunflower', 'peashooter'];
        this.plantCooldowns = {};
        this.currentLevelIndex = 0;
        this.loadProgress();
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('ashi_vs_zombie_progress');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedPlants = Array.isArray(data.unlockedPlants) ? data.unlockedPlants : ['sunflower', 'peashooter'];
                this.currentLevelIndex = typeof data.currentLevelIndex === 'number' ? data.currentLevelIndex : 0;
            }
        } catch (e) {
            this.unlockedPlants = ['sunflower', 'peashooter'];
            this.currentLevelIndex = 0;
        }

        // Guarantee basic starters
        if (!this.unlockedPlants.includes('sunflower')) this.unlockedPlants.push('sunflower');
        if (!this.unlockedPlants.includes('peashooter')) this.unlockedPlants.push('peashooter');
    }

    saveProgress() {
        try {
            localStorage.setItem('ashi_vs_zombie_progress', JSON.stringify({
                unlockedPlants: this.unlockedPlants,
                currentLevelIndex: this.currentLevelIndex
            }));
        } catch (e) {}
    }

    unlockPlant(plantId) {
        if (!this.unlockedPlants.includes(plantId)) {
            this.unlockedPlants.push(plantId);
            this.saveProgress();
        }
    }

    initUI() {
        this.bindEvents();
        if (this.game && this.game.currentLevel) {
            this.renderSeedBank();
        }
    }

    renderSeedBank() {
        const seedContainer = document.getElementById('seed-cards-container');
        if (!seedContainer) return;
        seedContainer.innerHTML = '';

        const level = this.game ? this.game.currentLevel : null;
        if (!level || !Array.isArray(level.allowedPlants)) return;

        // Plants available for this level
        const available = level.allowedPlants.filter(p => this.unlockedPlants.includes(p) || p === 'sunflower' || p === 'peashooter');

        available.forEach(plantId => {
            const plant = window.PLANT_TYPES[plantId];
            if (!plant) return;

            const card = document.createElement('div');
            card.className = 'seed-card';
            card.id = `seed-${plantId}`;
            card.dataset.plantId = plantId;

            card.innerHTML = `
                <div class="seed-cost">${plant.cost}</div>
                <div class="seed-img-wrap">
                    <img src="${plant.sprite}" alt="${plant.name}" />
                </div>
                <div class="seed-cooldown-overlay" id="cd-${plantId}"></div>
                <div class="seed-name-label">${plant.nameTh}</div>
            `;

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSeed(plantId);
            });

            seedContainer.appendChild(card);
        });
    }

    selectSeed(plantId) {
        const plant = window.PLANT_TYPES[plantId];
        if (!plant) return;

        // Check if on cooldown
        const cdLeft = this.plantCooldowns[plantId] || 0;
        if (cdLeft > 0) return;

        // Check if enough sun
        if (this.game.sun < plant.cost) {
            window.AudioMgr.playHit('splat');
            return;
        }

        if (this.selectedSeed === plantId) {
            this.deselectAll();
        } else {
            this.deselectAll();
            this.selectedSeed = plantId;
            const card = document.getElementById(`seed-${plantId}`);
            if (card) card.classList.add('selected');
        }
    }

    toggleShovel() {
        this.deselectAll();
        this.shovelActive = !this.shovelActive;
        const shovelBtn = document.getElementById('shovel-btn');
        if (shovelBtn) {
            if (this.shovelActive) {
                shovelBtn.classList.add('active');
            } else {
                shovelBtn.classList.remove('active');
            }
        }
    }

    deselectAll() {
        this.selectedSeed = null;
        this.shovelActive = false;
        document.querySelectorAll('.seed-card').forEach(c => c.classList.remove('selected'));
        const shovelBtn = document.getElementById('shovel-btn');
        if (shovelBtn) shovelBtn.classList.remove('active');
    }

    startCooldown(plantId) {
        const plant = window.PLANT_TYPES[plantId];
        if (plant) {
            this.plantCooldowns[plantId] = plant.cooldown;
        }
    }

    updateCooldowns(dt) {
        for (const [plantId, cd] of Object.entries(this.plantCooldowns)) {
            if (cd > 0) {
                const newCd = Math.max(0, cd - dt);
                this.plantCooldowns[plantId] = newCd;
                const plant = window.PLANT_TYPES[plantId];
                const cdOverlay = document.getElementById(`cd-${plantId}`);
                if (cdOverlay && plant) {
                    const pct = (newCd / plant.cooldown) * 100;
                    cdOverlay.style.height = `${pct}%`;
                }
            }
        }

        // Update card affordability classes
        document.querySelectorAll('.seed-card').forEach(card => {
            const plantId = card.dataset.plantId;
            const plant = window.PLANT_TYPES[plantId];
            const cd = this.plantCooldowns[plantId] || 0;
            if (plant && this.game) {
                if (this.game.sun < plant.cost || cd > 0) {
                    card.classList.add('disabled');
                } else {
                    card.classList.remove('disabled');
                }
            }
        });
    }

    updateSunDisplay(amount) {
        const sunEl = document.getElementById('sun-count');
        if (sunEl) sunEl.textContent = amount;
    }

    updateWaveProgress(percent) {
        const bar = document.getElementById('wave-progress-fill');
        const head = document.getElementById('wave-zombie-head');
        if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        if (head) head.style.left = `${Math.min(95, Math.max(0, percent))}%`;
    }

    showNewPlantModal(plantId, onProceed) {
        const plant = window.PLANT_TYPES[plantId];
        if (!plant) {
            if (onProceed) onProceed();
            return;
        }

        const modal = document.getElementById('reward-modal');
        const img = document.getElementById('reward-plant-img');
        const name = document.getElementById('reward-plant-name');
        const desc = document.getElementById('reward-plant-desc');
        const cost = document.getElementById('reward-plant-cost');

        if (img) img.src = plant.sprite;
        if (name) name.textContent = `${plant.name} (${plant.nameTh})`;
        if (desc) desc.textContent = plant.descTh;
        if (cost) cost.textContent = `Cost: ${plant.cost} ☀️`;

        if (modal) modal.classList.remove('hidden');
        window.AudioMgr.playWin();

        const btn = document.getElementById('reward-ok-btn');
        if (btn) {
            const clickHandler = () => {
                btn.removeEventListener('click', clickHandler);
                if (modal) modal.classList.add('hidden');
                if (onProceed) onProceed();
            };
            btn.addEventListener('click', clickHandler);
        }
    }

    showVictoryModal(stats, onNextLevel, onReplay) {
        const modal = document.getElementById('victory-modal');
        const zEl = document.getElementById('stat-zombies-killed');
        const sEl = document.getElementById('stat-sun-collected');
        const pEl = document.getElementById('stat-plants-planted');

        if (zEl) zEl.textContent = stats.zombiesKilled;
        if (sEl) sEl.textContent = stats.sunCollected;
        if (pEl) pEl.textContent = stats.plantsPlanted;

        if (modal) modal.classList.remove('hidden');
        window.AudioMgr.playWin();

        const nextBtn = document.getElementById('victory-next-btn');
        if (nextBtn) {
            nextBtn.onclick = () => {
                if (modal) modal.classList.add('hidden');
                if (onNextLevel) onNextLevel();
            };
        }

        const replayBtn = document.getElementById('victory-replay-btn');
        if (replayBtn) {
            replayBtn.onclick = () => {
                if (modal) modal.classList.add('hidden');
                if (onReplay) onReplay();
            };
        }
    }

    showGameOverModal(onReplay) {
        const modal = document.getElementById('gameover-modal');
        if (modal) modal.classList.remove('hidden');
        window.AudioMgr.playLose();

        const retryBtn = document.getElementById('gameover-retry-btn');
        if (retryBtn) {
            retryBtn.onclick = () => {
                if (modal) modal.classList.add('hidden');
                if (onReplay) onReplay();
            };
        }
    }

    openAlmanac() {
        const modal = document.getElementById('almanac-modal');
        if (modal) modal.classList.remove('hidden');
        this.renderAlmanacTab('plants');
    }

    closeAlmanac() {
        const modal = document.getElementById('almanac-modal');
        if (modal) modal.classList.add('hidden');
    }

    renderAlmanacTab(tab) {
        const listEl = document.getElementById('almanac-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        const tabPlantsBtn = document.getElementById('tab-plants-btn');
        const tabZombiesBtn = document.getElementById('tab-zombies-btn');

        if (tab === 'plants') {
            if (tabPlantsBtn) tabPlantsBtn.classList.add('active');
            if (tabZombiesBtn) tabZombiesBtn.classList.remove('active');

            Object.values(window.PLANT_TYPES).forEach(plant => {
                const isUnlocked = this.unlockedPlants.includes(plant.id);
                const item = document.createElement('div');
                item.className = `almanac-item ${isUnlocked ? '' : 'locked'}`;
                item.innerHTML = `
                    <img src="${plant.sprite}" alt="${plant.name}" />
                    <span>${isUnlocked ? plant.nameTh : '??? (ยังไม่ปลด)'}</span>
                `;
                item.onclick = () => {
                    this.showPlantDetail(plant, isUnlocked);
                };
                listEl.appendChild(item);
            });

            const first = Object.values(window.PLANT_TYPES)[0];
            this.showPlantDetail(first, true);

        } else {
            if (tabPlantsBtn) tabPlantsBtn.classList.remove('active');
            if (tabZombiesBtn) tabZombiesBtn.classList.add('active');

            Object.values(window.ZOMBIE_TYPES).forEach(zombie => {
                const item = document.createElement('div');
                item.className = 'almanac-item';
                item.innerHTML = `
                    <img src="${zombie.sprite}" alt="${zombie.name}" />
                    <span>${zombie.nameTh}</span>
                `;
                item.onclick = () => {
                    this.showZombieDetail(zombie);
                };
                listEl.appendChild(item);
            });

            const first = Object.values(window.ZOMBIE_TYPES)[0];
            this.showZombieDetail(first);
        }
    }

    showPlantDetail(plant, isUnlocked) {
        const detailEl = document.getElementById('almanac-detail');
        if (!detailEl) return;
        if (!isUnlocked) {
            detailEl.innerHTML = `
                <div class="detail-locked">
                    <h3>🔒 ยังไม่ปลดล็อก</h3>
                    <p>ผ่านด่าน ${plant.unlockedAt} เพื่อปลดล็อกตัวละครนี้!</p>
                </div>
            `;
            return;
        }

        detailEl.innerHTML = `
            <div class="detail-header">
                <img src="${plant.sprite}" class="detail-avatar" />
                <div class="detail-title">
                    <h2>${plant.name}</h2>
                    <h4>${plant.nameTh}</h4>
                    <span class="badge">☀️ ราคา: ${plant.cost} แต้ม</span>
                    <span class="badge">⏱️ คูลดาวน์: ${plant.cooldown} วินาที</span>
                    <span class="badge">❤️ HP: ${plant.maxHp}</span>
                </div>
            </div>
            <div class="detail-body">
                <p><strong>คุณสมบัติ:</strong> ${plant.descTh}</p>
                <p><strong>คำอธิบาย:</strong> ${plant.desc}</p>
            </div>
        `;
    }

    showZombieDetail(zombie) {
        const detailEl = document.getElementById('almanac-detail');
        if (!detailEl) return;
        detailEl.innerHTML = `
            <div class="detail-header">
                <img src="${zombie.sprite}" class="detail-avatar" />
                <div class="detail-title">
                    <h2>${zombie.name}</h2>
                    <h4>${zombie.nameTh}</h4>
                    <span class="badge red">❤️ เลือด: ${zombie.maxHp}</span>
                    <span class="badge">⚡ ความเร็ว: ${zombie.speed}</span>
                    <span class="badge">🍽️ กัดแรง: ${zombie.eatDps}/วิ</span>
                </div>
            </div>
            <div class="detail-body">
                <p><strong>ข้อมูลซอมบี้:</strong> ซอมบี้ร่างอชิที่หิวกระหายสมอง! บุกเข้ามาเพื่อยึดครองหอพักและมหาวิทยาลัย</p>
                <p><strong>คำแนะนำในการรับมือ:</strong> ${zombie.hasShield ? 'ซอมบี้ตัวนี้ถือโล่กล่องพิซซ่า! กระสุนตรงจะถูกกัน ใช้ใยสไปเดอร์หรือระเบิด!' : (zombie.canVault ? 'ระวัง! วิ่งเร็วและกระโดดข้ามพืชตัวแรกได้!' : 'รวมพลังพืชอชิต่างๆ ยิงสกัดกั้นให้อยู่หมัด')}</p>
            </div>
        `;
    }

    bindEvents() {
        const shovelBtn = document.getElementById('shovel-btn');
        if (shovelBtn) shovelBtn.onclick = () => this.toggleShovel();

        const speedBtn = document.getElementById('speed-btn');
        if (speedBtn) {
            speedBtn.onclick = () => {
                this.game.gameSpeed = this.game.gameSpeed === 1 ? 2 : 1;
                speedBtn.textContent = `${this.game.gameSpeed}x ⚡`;
                speedBtn.classList.toggle('active', this.game.gameSpeed === 2);
            };
        }

        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.onclick = () => {
                window.AudioMgr.setMusicEnabled(!window.AudioMgr.musicEnabled);
                musicBtn.textContent = window.AudioMgr.musicEnabled ? '🎵 ดนตรี: เปิด' : '🎵 ดนตรี: ปิด';
                musicBtn.classList.toggle('off', !window.AudioMgr.musicEnabled);
            };
        }

        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.onclick = () => {
                window.AudioMgr.setSoundEnabled(!window.AudioMgr.soundEnabled);
                soundBtn.textContent = window.AudioMgr.soundEnabled ? '🔊 เสียง: เปิด' : '🔊 เสียง: ปิด';
                soundBtn.classList.toggle('off', !window.AudioMgr.soundEnabled);
            };
        }

        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.onclick = () => {
                this.game.togglePause();
            };
        }

        const resumeBtn = document.getElementById('pause-resume-btn');
        if (resumeBtn) resumeBtn.onclick = () => this.game.togglePause();

        const restartBtn = document.getElementById('pause-restart-btn');
        if (restartBtn) {
            restartBtn.onclick = () => {
                const pauseModal = document.getElementById('pause-modal');
                if (pauseModal) pauseModal.classList.add('hidden');
                this.game.restartLevel();
            };
        }

        const levelSelectBtn = document.getElementById('pause-level-select-btn');
        if (levelSelectBtn) {
            levelSelectBtn.onclick = () => {
                const pauseModal = document.getElementById('pause-modal');
                if (pauseModal) pauseModal.classList.add('hidden');
                this.openLevelSelect();
            };
        }

        const almanacBtn = document.getElementById('almanac-btn');
        if (almanacBtn) almanacBtn.onclick = () => this.openAlmanac();

        const closeAlmanacBtn = document.getElementById('almanac-close-btn');
        if (closeAlmanacBtn) closeAlmanacBtn.onclick = () => this.closeAlmanac();

        const tabPlantsBtn = document.getElementById('tab-plants-btn');
        if (tabPlantsBtn) tabPlantsBtn.onclick = () => this.renderAlmanacTab('plants');

        const tabZombiesBtn = document.getElementById('tab-zombies-btn');
        if (tabZombiesBtn) tabZombiesBtn.onclick = () => this.renderAlmanacTab('zombies');

        const closeLvlBtn = document.getElementById('close-level-select-btn');
        if (closeLvlBtn) {
            closeLvlBtn.onclick = () => {
                const lvlModal = document.getElementById('level-select-modal');
                if (lvlModal) lvlModal.classList.add('hidden');
            };
        }
    }

    openLevelSelect() {
        const modal = document.getElementById('level-select-modal');
        const grid = document.getElementById('level-grid');
        if (!grid || !modal) return;
        grid.innerHTML = '';

        window.LEVELS_CONFIG.forEach((lvl, idx) => {
            const btn = document.createElement('div');
            btn.className = 'level-card';
            btn.innerHTML = `
                <div class="level-num">${lvl.id}</div>
                <div class="level-title">${lvl.nameTh}</div>
                <div class="level-badge">${lvl.theme.toUpperCase()}</div>
            `;
            btn.onclick = () => {
                modal.classList.add('hidden');
                this.game.startLevel(idx);
            };
            grid.appendChild(btn);
        });

        modal.classList.remove('hidden');
    }
}

window.UIManager = UIManager;
