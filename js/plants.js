// Ashi vs Zombie - Plants Engine & Definitions

const PLANT_TYPES = {
    sunflower: {
        id: 'sunflower',
        name: 'Sun-Ashi',
        nameTh: 'อชิบิกินี่พลังแสง',
        cost: 50,
        cooldown: 4.5,
        maxHp: 350,
        sprite: 'assets/sprites/plant_sunflower.png',
        desc: 'Produces Sun energy periodically to fuel your defense.',
        descTh: 'อชิชุดว่ายน้ำ ผลิตดวงอาทิตย์ 25 แต้ม ทุกๆ 7 วินาทีเพื่อใช้ปลูกตัวอื่น',
        unlockedAt: '1-1'
    },
    peashooter: {
        id: 'peashooter',
        name: 'Gekko-Ashi',
        nameTh: 'อชิมือปืนเก๊กโกะ',
        cost: 100,
        cooldown: 4.5,
        maxHp: 350,
        bulletType: 'pea',
        bulletDmg: 25,
        attackSpeed: 1.25,
        sprite: 'assets/sprites/plant_peashooter.png',
        desc: 'Shoots plasma peas at oncoming zombies in its lane.',
        descTh: 'อชิเกมเมอร์ ยิงกระสุนพลาสมา (แรง 25 ดาเมจ) ใส่ซอมบี้ในเลน',
        unlockedAt: '1-1'
    },
    repeater: {
        id: 'repeater',
        name: 'Pucker-Ashi',
        nameTh: 'อชิจูบเบิ้ล (Repeater)',
        cost: 175,
        cooldown: 5.5,
        maxHp: 350,
        bulletType: 'pea',
        bulletDmg: 25,
        attackSpeed: 1.25,
        burst: 2,
        sprite: 'assets/sprites/plant_repeater.png',
        desc: 'Fires two rapid peas at once. Double the firepower!',
        descTh: 'อชิปากจู๋ ยิงกระสุนคู่ 2 เม็ดพร้อมกัน พลังยิงคูณสอง',
        unlockedAt: '1-2'
    },
    wallnut: {
        id: 'wallnut',
        name: 'Fat-Ashi',
        nameTh: 'อชิบิ๊กเบิ้ม (กำแพงถึก)',
        cost: 50,
        cooldown: 10.0,
        maxHp: 4000,
        sprite: 'assets/sprites/plant_wallnut.png',
        desc: 'Extremely tough and blocks zombies from advancing.',
        descTh: 'อชิร่างอ้วน HP 4,000 หน่วย ยืนขวางซอมบี้อย่างทนทาน คูลดาวน์ไว',
        unlockedAt: '1-2'
    },
    bomb: {
        id: 'bomb',
        name: 'Bomb-Bird-Ashi',
        nameTh: 'อชินกระเบิด (Bomb Bird)',
        cost: 150,
        cooldown: 16.0,
        maxHp: 350,
        instant: true,
        fuseTime: 1.1,
        damage: 2000,
        range: 1.5, // 3x3 tiles
        sprite: 'assets/sprites/plant_bomb.png',
        desc: 'Swells up and detonates, obliterating zombies in 3x3 area!',
        descTh: 'อชิแองกรี้เบิร์ดสีดำ ระเบิดตูมตามระยะ 3x3 ซอมบี้แหลกสลาย (2,000 ดาเมจ)',
        unlockedAt: '1-3'
    },
    icepea: {
        id: 'icepea',
        name: 'Ghoul-Ashi',
        nameTh: 'อชิกูลตาแดง (Snow Pea)',
        cost: 150,
        cooldown: 5.5,
        maxHp: 350,
        bulletType: 'ice',
        bulletDmg: 25,
        attackSpeed: 1.25,
        slows: true,
        sprite: 'assets/sprites/plant_icepea.png',
        desc: 'Shoots chilling ghoul spikes that slow zombies by 50%.',
        descTh: 'อชิโตเกียวกูล ยิงกระสุนน้ำแข็ง แช่แข็งลดความเร็วซอมบี้ 50%',
        unlockedAt: '2-1'
    },
    squash: {
        id: 'squash',
        name: 'Shrek-Ashi',
        nameTh: 'อชิเชร็คบดขยี้ (Squash)',
        cost: 50,
        cooldown: 9.0,
        maxHp: 350,
        instant: true,
        damage: 2000,
        sprite: 'assets/sprites/plant_squash.png',
        desc: 'Leaps and squashes adjacent zombies with swamp fury!',
        descTh: 'อชิหน้าเขียว กระโดดทับซอมบี้ที่เข้าใกล้ 1 ช่องให้แบนติดดินทันที',
        unlockedAt: '2-1'
    },
    chomper: {
        id: 'chomper',
        name: 'Doggo-Ashi',
        nameTh: 'อชินีน่าคาเมร่า (Chomper)',
        cost: 150,
        cooldown: 7.5,
        maxHp: 450,
        digestTime: 12.0,
        sprite: 'assets/sprites/plant_chomper.png',
        desc: 'Devours an entire zombie in one big bite, then digests.',
        descTh: 'อชิลูกหมานีน่า งับกลืนซอมบี้ทั้งตัว เคี้ยวเร็วขึ้นเพียง 12 วินาที',
        unlockedAt: '2-2'
    },
    hypno: {
        id: 'hypno',
        name: 'Bald-Ashi',
        nameTh: 'อชิฟันเหยินสะกดจิต',
        cost: 50,
        cooldown: 10.0,
        maxHp: 250,
        sprite: 'assets/sprites/plant_hypno.png',
        desc: 'When eaten, brainwashes the zombie to fight for you!',
        descTh: 'อชิหัวโล้นฟันเหยิน เมื่อซอมบี้กินจะถูกสะกดจิตหันไปสู้ซอมบี้พวกเดียวกัน',
        unlockedAt: '2-2'
    },
    spikeweed: {
        id: 'spikeweed',
        name: 'Larva-Ashi',
        nameTh: 'อชิตัวหนอนลาวา (Spikeweed)',
        cost: 75,
        cooldown: 6.0,
        maxHp: 9999,
        isFloor: true,
        dps: 45,
        sprite: 'assets/sprites/plant_spikeweed.png',
        desc: 'Crawls on ground, damaging feet of all zombies that step on it.',
        descTh: 'อชิตัวหนอนคลานติดดิน ซอมบี้กินไม่ได้ โดนเหยียบแล้วบาดเท้าอย่างแรง',
        unlockedAt: '3-1'
    },
    lilypad: {
        id: 'lilypad',
        name: 'Lily-Ashi',
        nameTh: 'ใบบัวอชิ (Lily Pad)',
        cost: 25,
        cooldown: 3.5,
        maxHp: 350,
        isWaterPlatform: true,
        sprite: 'assets/sprites/plant_lilypad.png',
        desc: 'Floats on water lanes, allowing other plants to be placed on it.',
        descTh: 'ใบบัวลอยน้ำ สำหรับวางในด่านสระว่ายน้ำ เพื่อปลูกตัวอื่นทับ',
        unlockedAt: '3-1'
    },
    catapult: {
        id: 'catapult',
        name: 'Spidey-Ashi',
        nameTh: 'อชิสไปเดอร์แมน (Catapult)',
        cost: 100,
        cooldown: 8.0,
        maxHp: 350,
        bulletType: 'web',
        bulletDmg: 45,
        attackSpeed: 1.6,
        lobsOverShield: true,
        sprite: 'assets/sprites/plant_catapult.png',
        desc: 'Shoots webs directly over shields and obstacles at zombies.',
        descTh: 'อชิสไปเดอร์ ยิงใยแมงมุมวิถีโค้ง (แรง 45 ดาเมจ) ข้ามโล่กล่องพิซซ่าเข้าหัวซอมบี้ตรงๆ',
        unlockedAt: '3-2'
    },
    jalapeno: {
        id: 'jalapeno',
        name: 'Chuck-Ashi',
        nameTh: 'อชิชัคความเร็วแสง (Jalapeno)',
        cost: 100,
        cooldown: 16.0,
        maxHp: 350,
        instant: true,
        fuseTime: 0.7,
        laneClear: true,
        damage: 2000,
        sprite: 'assets/sprites/plant_jalapeno.png',
        desc: 'Dashes across the entire lane, incinerating all zombies!',
        descTh: 'อชินกเหลือง พุ่งทะลวงเผาผลาญซอมบี้หมดทั้งแถวในพริบตา (2,000 ดาเมจ)',
        unlockedAt: '4-1'
    },
    gatling: {
        id: 'gatling',
        name: 'Four-Arms-Ashi',
        nameTh: 'อชิโฟร์อาร์มส์ (Gatling)',
        cost: 200,
        cooldown: 10.0,
        maxHp: 450,
        bulletType: 'gatling',
        bulletDmg: 25,
        attackSpeed: 1.1,
        burst: 4,
        sprite: 'assets/sprites/plant_gatling.png',
        desc: 'Devastating 4-arm rapid gunner. Fires 4 heavy shots in a row!',
        descTh: 'อชิ 4 แขน รัวหมัดกระสุน 4 นัดซ้อน รวม 100 ดาเมจต่อชุด',
        unlockedAt: '4-1'
    }
};

class PlantInstance {
    constructor(typeId, row, col) {
        this.type = PLANT_TYPES[typeId];
        this.typeId = typeId;
        this.row = row;
        this.col = col;
        this.hp = this.type.maxHp;
        this.maxHp = this.type.maxHp;

        // Timers & State
        this.shootTimer = 0.2 + Math.random() * 0.3; // shoot fast initially
        this.sunTimer = 2.5 + Math.random() * 1.0; // produce first sun very promptly
        this.fuseTimer = this.type.fuseTime || 0;
        this.burstLeft = 0;
        this.burstTimer = 0;

        // Chomper state
        this.isDigesting = false;
        this.digestLeft = 0;

        // Squash state
        this.squashTarget = null;
        this.squashPhase = 'idle';
        this.squashYOffset = 0;

        // Visual animation
        this.bobble = Math.random() * Math.PI * 2;
        this.scale = 1.0;
        this.flashRed = 0;
    }

    update(dt, game) {
        this.bobble += dt * 3.5;
        if (this.flashRed > 0) this.flashRed -= dt;

        // 1. Sunflower Sun Production
        if (this.typeId === 'sunflower') {
            this.sunTimer -= dt;
            if (this.sunTimer <= 0) {
                this.sunTimer = 7.0; // 7 seconds between suns
                game.spawnSunFromPlant(this);
            }
        }

        // 2. Shooting plants (Peashooter, Repeater, Icepea, Gatling, Catapult)
        if (this.type.bulletType) {
            const hasZombiesInLane = game.hasZombiesInRow(this.row, this.col);

            if (this.burstLeft > 0) {
                this.burstTimer -= dt;
                if (this.burstTimer <= 0) {
                    this.fireBullet(game);
                    this.burstLeft--;
                    this.burstTimer = 0.12;
                }
            } else if (hasZombiesInLane) {
                this.shootTimer -= dt;
                if (this.shootTimer <= 0) {
                    this.shootTimer = this.type.attackSpeed;
                    if (this.type.burst && this.type.burst > 1) {
                        this.burstLeft = this.type.burst - 1;
                        this.burstTimer = 0.12;
                    }
                    this.fireBullet(game);
                }
            }
        }

        // 3. Bomb Bird fuse countdown
        if (this.typeId === 'bomb') {
            this.fuseTimer -= dt;
            this.scale = 1.0 + (1.1 - this.fuseTimer) * 0.5;
            if (this.fuseTimer <= 0) {
                this.explode(game);
                return false;
            }
        }

        // 4. Jalapeno fuse countdown
        if (this.typeId === 'jalapeno') {
            this.fuseTimer -= dt;
            if (this.fuseTimer <= 0) {
                this.triggerJalapeno(game);
                return false;
            }
        }

        // 5. Squash / Shrek
        if (this.typeId === 'squash') {
            if (this.squashPhase === 'idle') {
                const target = game.findSquashTarget(this.row, this.col);
                if (target) {
                    this.squashTarget = target;
                    this.squashPhase = 'jumping';
                    this.squashTimer = 0.35;
                    window.AudioMgr.playSquash();
                }
            } else if (this.squashPhase === 'jumping') {
                this.squashTimer -= dt;
                this.squashYOffset = -Math.sin((0.35 - this.squashTimer) / 0.35 * Math.PI) * 50;
                if (this.squashTimer <= 0) {
                    this.squashPhase = 'smashing';
                    game.damageZombiesAt(this.row, this.col, this.type.damage);
                    if (this.squashTarget) {
                        const targetCol = Math.round((this.squashTarget.x - game.gridLeft) / game.tileWidth);
                        game.damageZombiesAt(this.row, targetCol, this.type.damage);
                    }
                    game.particles.addSlamEffect(this.row, this.col);
                    return false;
                }
            }
        }

        // 6. Chomper
        if (this.typeId === 'chomper') {
            if (this.isDigesting) {
                this.digestLeft -= dt;
                if (this.digestLeft <= 0) {
                    this.isDigesting = false;
                }
            } else {
                const target = game.findChomperTarget(this.row, this.col);
                if (target) {
                    window.AudioMgr.playChomp();
                    if (target.type.isBoss || target.type.isHeavy) {
                        target.takeDamage(450, 'flesh', game);
                    } else {
                        game.killZombie(target);
                    }
                    this.isDigesting = true;
                    this.digestLeft = this.type.digestTime;
                    game.particles.addText((this.col + 0.5) * game.tileWidth + game.gridLeft, (this.row + 0.3) * game.tileHeight + game.gridTop, "CHOMP!", "#ff4444");
                }
            }
        }

        // 7. Spikeweed
        if (this.typeId === 'spikeweed') {
            game.damageZombiesOverSpike(this.row, this.col, this.type.dps * dt);
        }

        return this.hp > 0;
    }

    fireBullet(game) {
        window.AudioMgr.playShoot(this.type.bulletType);
        const startX = (this.col + 0.8) * game.tileWidth + game.gridLeft;
        const startY = (this.row + 0.45) * game.tileHeight + game.gridTop;

        game.addBullet({
            type: this.type.bulletType,
            row: this.row,
            x: startX,
            y: startY,
            damage: this.type.bulletDmg,
            speed: this.type.bulletType === 'gatling' ? 520 : 420,
            slows: !!this.type.slows,
            lob: !!this.type.lobsOverShield,
            arcY: 0,
            targetCol: this.type.lobsOverShield ? game.getFirstZombieCol(this.row) : null
        });

        this.scale = 0.88;
        setTimeout(() => { this.scale = 1.0; }, 80);
    }

    explode(game) {
        window.AudioMgr.playBoom();
        game.particles.addBigExplosion(this.col, this.row);
        for (let r = this.row - 1; r <= this.row + 1; r++) {
            for (let c = this.col - 1; c <= this.col + 1; c++) {
                game.damageZombiesAt(r, c, this.type.damage);
            }
        }
    }

    triggerJalapeno(game) {
        window.AudioMgr.playJalapeno();
        game.particles.addLaneFire(this.row);
        game.damageZombiesInLane(this.row, this.type.damage);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.flashRed = 0.12;
    }
}

window.PLANT_TYPES = PLANT_TYPES;
window.PlantInstance = PlantInstance;
