// Ashi vs Zombie - Zombie Engine & Definitions

const ZOMBIE_TYPES = {
    basic: {
        id: 'basic',
        name: 'Ashi Zombie',
        nameTh: 'ซอมบี้อชิชุดขาด',
        maxHp: 160,
        speed: 20,
        eatDps: 65,
        sprite: 'assets/sprites/zombie_basic.png',
        points: 10
    },
    cone: {
        id: 'cone',
        name: 'Conehead Ashi',
        nameTh: 'ซอมบี้อชิกรวยส้ม',
        maxHp: 400,
        armorHp: 240,
        armorType: 'cone',
        speed: 20,
        eatDps: 65,
        sprite: 'assets/sprites/zombie_cone.png',
        points: 20
    },
    bucket: {
        id: 'bucket',
        name: 'Buckethead Ashi',
        nameTh: 'ซอมบี้อชิถังเหล็ก',
        maxHp: 750,
        armorHp: 550,
        armorType: 'metal',
        speed: 18,
        eatDps: 70,
        sprite: 'assets/sprites/zombie_bucket.png',
        points: 35
    },
    shield: {
        id: 'shield',
        name: 'Pizza Box Ashi',
        nameTh: 'ซอมบี้อชิโล่กล่องพิซซ่า',
        maxHp: 500,
        shieldHp: 340,
        speed: 18,
        eatDps: 70,
        sprite: 'assets/sprites/zombie_shield.png',
        hasShield: true,
        points: 30
    },
    gigachad: {
        id: 'gigachad',
        name: 'GigaChad Ashi',
        nameTh: 'ซอมบี้อชิกิกะแชด (นักกระโดดค้ำ)',
        maxHp: 280,
        speed: 46,
        normalSpeed: 20,
        eatDps: 80,
        sprite: 'assets/sprites/zombie_gigachad.png',
        canVault: true,
        points: 40
    },
    couch: {
        id: 'couch',
        name: 'Couch Tank Ashi',
        nameTh: 'ซอมบี้อชิโซฟาขี้เกียจ (แทงก์)',
        maxHp: 1100,
        speed: 12,
        eatDps: 110,
        sprite: 'assets/sprites/zombie_couch.png',
        isHeavy: true,
        points: 60
    },
    boss: {
        id: 'boss',
        name: 'EMPEROR ASHI (BOSS)',
        nameTh: 'จักรพรรดิอชิร่างยักษ์ (บอสใหญ่)',
        maxHp: 4200,
        speed: 8,
        eatDps: 180,
        sprite: 'assets/sprites/zombie_boss.png',
        isBoss: true,
        points: 500
    }
};

class ZombieInstance {
    constructor(typeId, row, startX) {
        this.type = ZOMBIE_TYPES[typeId];
        this.typeId = typeId;
        this.row = row;
        this.x = startX;
        this.hp = this.type.maxHp;
        this.maxHp = this.type.maxHp;
        this.speed = this.type.speed;
        this.baseSpeed = this.type.speed;

        // Shields & armor
        this.shieldHp = this.type.shieldHp || 0;
        this.armorHp = this.type.armorHp || 0;
        this.hasPole = !!this.type.canVault;

        // States
        this.isEating = false;
        this.eatingTarget = null;
        this.isHypnotized = false;
        this.freezeTimer = 0;
        this.groanTimer = 4.0 + Math.random() * 12.0;

        // Vaulting state
        this.isVaulting = false;
        this.vaultTimer = 0;
        this.vaultStartX = 0;
        this.vaultTargetX = 0;

        // Boss abilities
        this.bossSummonTimer = 18.0;
        this.bossStompTimer = 15.0;

        // Animation
        this.wobble = Math.random() * Math.PI * 2;
        this.flashRed = 0;
        this.headPopped = false;
        this.isDead = false;
    }

    update(dt, game) {
        if (this.isDead) return false;

        this.wobble += dt * 4.0;
        if (this.flashRed > 0) this.flashRed -= dt;

        // Freeze / Slow management
        if (this.freezeTimer > 0) {
            this.freezeTimer -= dt;
            this.speed = this.baseSpeed * 0.5;
        } else {
            this.speed = this.baseSpeed;
        }

        // Zombie groan sound
        this.groanTimer -= dt;
        if (this.groanTimer <= 0) {
            window.AudioMgr.playZombieGroan();
            this.groanTimer = 12.0 + Math.random() * 16.0;
        }

        // Boss special attacks
        if (this.type.isBoss) {
            this.bossSummonTimer -= dt;
            if (this.bossSummonTimer <= 0) {
                this.bossSummonTimer = 18.0;
                game.spawnBossReinforcements();
            }

            this.bossStompTimer -= dt;
            if (this.bossStompTimer <= 0) {
                this.bossStompTimer = 15.0;
                game.bossStompRandomLane(this);
            }
        }

        // Vaulting animation
        if (this.isVaulting) {
            this.vaultTimer -= dt;
            const progress = 1.0 - (this.vaultTimer / 0.6);
            this.x = this.vaultStartX - progress * (this.vaultStartX - this.vaultTargetX);
            this.vaultYOffset = -Math.sin(progress * Math.PI) * 45;
            if (this.vaultTimer <= 0) {
                this.isVaulting = false;
                this.vaultYOffset = 0;
                this.speed = this.type.normalSpeed || 20;
                this.baseSpeed = this.speed;
            }
            return true;
        }

        // Hypnotized zombie moves right!
        if (this.isHypnotized) {
            this.x += this.speed * dt;
            const enemyZombie = game.findEnemyZombieInLane(this.row, this.x);
            if (enemyZombie) {
                enemyZombie.takeDamage(this.type.eatDps * dt, 'flesh', game);
                window.AudioMgr.playChomp();
            }
            if (this.x > game.gridLeft + game.gridCols * game.tileWidth + 100) {
                return false;
            }
            return this.hp > 0;
        }

        // Regular zombie eating / moving left
        const col = Math.floor((this.x - game.gridLeft) / game.tileWidth);
        const plant = game.getPlantAt(this.row, col);

        // Can we vault over this plant?
        if (this.hasPole && plant && !plant.type.isFloor) {
            this.hasPole = false;
            this.isVaulting = true;
            this.vaultTimer = 0.6;
            this.vaultStartX = this.x;
            this.vaultTargetX = this.x - game.tileWidth * 1.35;
            game.particles.addText(this.x, this.row * game.tileHeight + 30, "VAULT!", "#ffff00");
            return true;
        }

        if (plant && !plant.type.isFloor) {
            this.isEating = true;
            plant.takeDamage(this.type.eatDps * dt);
            if (Math.random() < 0.08) {
                window.AudioMgr.playChomp();
            }

            if (plant.typeId === 'hypno' && plant.hp <= 0) {
                this.hypnotize(game);
            }
        } else {
            this.isEating = false;
            this.x -= this.speed * dt;
        }

        return this.hp > 0;
    }

    takeDamage(amount, damageType = 'pea', game) {
        this.flashRed = 0.12;

        // Check shield absorption (direct bullets hitting front)
        if (this.shieldHp > 0 && damageType !== 'web' && damageType !== 'bomb' && damageType !== 'fire') {
            this.shieldHp -= amount;
            window.AudioMgr.playHit('metal');
            if (game && game.particles) game.particles.addSparks(this.x, this.row * game.tileHeight + 50);
            if (this.shieldHp <= 0) {
                if (game && game.particles) game.particles.addText(this.x, this.row * game.tileHeight + 20, "SHIELD BROKEN!", "#ff9900");
            }
            return;
        }

        // Check armor (Bucket or Cone)
        if (this.armorHp > 0 && damageType !== 'bomb' && damageType !== 'fire') {
            this.armorHp -= amount;
            window.AudioMgr.playHit(this.type.armorType === 'metal' ? 'metal' : 'splat');
            if (game && game.particles) game.particles.addSparks(this.x, this.row * game.tileHeight + 50);
            if (this.armorHp <= 0) {
                if (this.typeId === 'bucket' || this.typeId === 'cone') {
                    this.currentCustomSprite = 'assets/sprites/zombie_basic.png';
                }
            }
        } else {
            this.hp -= amount;
            window.AudioMgr.playHit('splat');
        }

        if (damageType === 'ice') {
            this.freezeTimer = 4.5;
        }

        if (this.hp <= 0 && !this.isDead) {
            this.isDead = true;
            if (game) game.onZombieKilled(this);
        }
    }

    hypnotize(game) {
        this.isHypnotized = true;
        this.isEating = false;
        if (game && game.particles) game.particles.addText(this.x, this.row * game.tileHeight + 20, "HYPNOTIZED!", "#ff66cc");
    }
}

window.ZOMBIE_TYPES = ZOMBIE_TYPES;
window.ZombieInstance = ZombieInstance;
