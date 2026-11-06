// Ashi vs Zombie - Particles & Visual FX System

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.suns = [];
        this.mowers = [];
        this.explosions = [];
        this.laneFires = [];
    }

    reset() {
        this.particles = [];
        this.floatingTexts = [];
        this.suns = [];
        this.explosions = [];
        this.laneFires = [];
    }

    addSun(x, y, targetY, isFromPlant = false) {
        this.suns.push({
            x: x,
            y: y,
            targetY: targetY,
            vy: isFromPlant ? -120 : 65,
            vx: isFromPlant ? (Math.random() - 0.5) * 40 : 0,
            isFromPlant: isFromPlant,
            life: 14.0, // seconds before despawning
            collected: false,
            collectProgress: 0,
            collectStartX: 0,
            collectStartY: 0,
            scale: 1.0,
            bobble: Math.random() * Math.PI * 2
        });
    }

    addText(x, y, text, color = '#ffffff', size = 18) {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            size: size,
            alpha: 1.0,
            vy: -45,
            life: 1.2
        });
    }

    addSparks(x, y, count = 8, color = '#ffcc00') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2.5 + Math.random() * 3.5,
                alpha: 1.0,
                life: 0.4 + Math.random() * 0.3
            });
        }
    }

    addPlantDust(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI - Math.PI;
            const speed = 20 + Math.random() * 50;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + 30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 15,
                color: '#654321',
                size: 3 + Math.random() * 4,
                alpha: 0.9,
                life: 0.5
            });
        }
    }

    addBigExplosion(col, row, game) {
        const cx = (col + 0.5) * 90 + 200; // estimated tile
        const cy = (row + 0.5) * 95 + 100;
        this.explosions.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: 130,
            alpha: 1.0,
            life: 0.6
        });
        this.addText(cx, cy - 30, "KABOOOOM!", "#ff2200", 28);
        this.addSparks(cx, cy, 35, '#ff4400');
        this.addSparks(cx, cy, 25, '#ffff00');
    }

    addSlamEffect(row, col) {
        const cx = (col + 0.5) * 90 + 200;
        const cy = (row + 0.5) * 95 + 100;
        this.addText(cx, cy - 20, "SQUASH!", "#33cc33", 24);
        this.addSparks(cx, cy, 20, '#55aa33');
    }

    addLaneFire(row) {
        this.laneFires.push({
            row: row,
            x: 200,
            speed: 900,
            life: 1.2
        });
    }

    addFireworks(w, h) {
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * w;
            const y = Math.random() * (h * 0.6);
            const colors = ['#ff0055', '#00ffcc', '#ffcc00', '#ff00ff', '#ffffff'];
            const col = colors[Math.floor(Math.random() * colors.length)];
            this.addSparks(x, y, 40, col);
        }
    }

    update(dt, game) {
        // 1. Suns
        for (let i = this.suns.length - 1; i >= 0; i--) {
            const s = this.suns[i];
            s.bobble += dt * 4;

            if (s.collected) {
                s.collectProgress += dt * 2.2;
                // Move towards sun counter HUD (top-left: x=40, y=40)
                const targetHUDX = 65;
                const targetHUDY = 45;
                s.x = s.collectStartX + (targetHUDX - s.collectStartX) * Math.min(1.0, s.collectProgress);
                s.y = s.collectStartY + (targetHUDY - s.collectStartY) * Math.min(1.0, s.collectProgress);
                s.scale = 1.0 - s.collectProgress * 0.5;

                if (s.collectProgress >= 1.0) {
                    game.addSun(25);
                    this.suns.splice(i, 1);
                    continue;
                }
            } else {
                if (s.isFromPlant) {
                    s.vy += 320 * dt; // gravity
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    if (s.y >= s.targetY) {
                        s.y = s.targetY;
                        s.vy = 0;
                        s.vx = 0;
                    }
                } else {
                    if (s.y < s.targetY) {
                        s.y += s.vy * dt;
                    }
                }

                s.life -= dt;
                if (s.life <= 0) {
                    this.suns.splice(i, 1);
                    continue;
                }
            }
        }

        // 2. Floating combat text
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= dt;
            ft.alpha = Math.max(0, ft.life / 1.2);
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // 3. Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / 0.5);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 4. Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const ex = this.explosions[i];
            ex.life -= dt;
            const progress = 1.0 - (ex.life / 0.6);
            ex.radius = progress * ex.maxRadius;
            ex.alpha = 1.0 - progress;
            if (ex.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }

        // 5. Lane fires (Jalapeno)
        for (let i = this.laneFires.length - 1; i >= 0; i--) {
            const lf = this.laneFires[i];
            lf.x += lf.speed * dt;
            lf.life -= dt;
            if (lf.life <= 0) {
                this.laneFires.splice(i, 1);
            }
        }
    }

    collectSun(sun) {
        if (sun.collected) return;
        sun.collected = true;
        sun.collectStartX = sun.x;
        sun.collectStartY = sun.y;
        window.AudioMgr.playSun();
    }
}

window.ParticleSystem = ParticleSystem;

