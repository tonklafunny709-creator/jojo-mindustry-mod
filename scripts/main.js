(() => {
    const STANDS = [
        {
            name: "Star Platinum",
            skillName: "Ora Barrage",
            cooldown: 4.5,
            color: Pal.accent,
            skill: (p, u) => {
                for (let i = 0; i < 10; i++) {
                    const ang = u.rotation + (Math.random() - 0.5) * 30;
                    const dist = 16 + Math.random() * 56;
                    const tx = u.x + Angles.trnsx(ang, dist);
                    const ty = u.y + Angles.trnsy(ang, dist);
                    Fx.hitBulletColor.at(tx, ty, Pal.accent);
                    Damage.damage(p.team(), tx, ty, 24, 40, false);
                }
            }
        },
        {
            name: "The World",
            skillName: "Time Stop Pulse",
            cooldown: 8,
            color: Color.gold,
            skill: (p, u) => {
                Fx.shockwave.at(u.x, u.y);
                Units.nearbyEnemies(p.team(), u.x, u.y, 200, (e) => {
                    e.apply(StatusEffects.unmoving, 150);
                    Fx.hitLaser.at(e.x, e.y);
                });
            }
        },
        {
            name: "Crazy Diamond",
            skillName: "Dora Repair",
            cooldown: 6,
            color: Color.pink,
            skill: (p, u) => {
                Fx.healWave.at(u.x, u.y, 160);
                Units.nearby(p.team(), u.x - 160, u.y - 160, 320, 320, (a) => {
                    a.heal(80);
                });
            }
        },
        {
            name: "Gold Experience",
            skillName: "Life Overdrive",
            cooldown: 6,
            color: Color.lime,
            skill: (p, u) => {
                Fx.heal.at(u.x, u.y);
                u.apply(StatusEffects.fast, 240);
                u.apply(StatusEffects.overdrive, 240);
                u.heal(60);
            }
        },
        {
            name: "Killer Queen",
            skillName: "First Bomb",
            cooldown: 6.5,
            color: Color.violet,
            skill: (p, u) => {
                const tx = p.mouseX || u.x;
                const ty = p.mouseY || u.y;
                Fx.explosion.at(tx, ty);
                Damage.damage(p.team(), tx, ty, 70, 160, true);
            }
        },
        {
            name: "Silver Chariot",
            skillName: "Armor Off Slash",
            cooldown: 4,
            color: Color.lightGray,
            skill: (p, u) => {
                u.apply(StatusEffects.fast, 120);
                for (let i = 1; i <= 5; i++) {
                    const tx = u.x + Angles.trnsx(u.rotation, i * 24);
                    const ty = u.y + Angles.trnsy(u.rotation, i * 24);
                    Fx.hitLaser.at(tx, ty);
                    Damage.damage(p.team(), tx, ty, 20, 55, false);
                }
            }
        },
        {
            name: "Magician's Red",
            skillName: "Crossfire Hurricane",
            cooldown: 6,
            color: Color.orange,
            skill: (p, u) => {
                for (let a = -20; a <= 20; a += 10) {
                    Bullets.fireball.create(u, p.team(), u.x, u.y, u.rotation + a, 1.5, 1.2);
                }
            }
        },
        {
            name: "Hierophant Green",
            skillName: "Emerald Splash",
            cooldown: 5,
            color: Color.green,
            skill: (p, u) => {
                for (let i = 0; i < 12; i++) {
                    const ang = u.rotation + (Math.random() - 0.5) * 36;
                    Bullets.artilleryPlastic.create(u, p.team(), u.x, u.y, ang, 1.4, 1);
                }
            }
        },
        {
            name: "King Crimson",
            skillName: "Time Erase Dash",
            cooldown: 7,
            color: Color.scarlet,
            skill: (p, u) => {
                const tx = u.x + Angles.trnsx(u.rotation, 120);
                const ty = u.y + Angles.trnsy(u.rotation, 120);
                Fx.teleport.at(u.x, u.y);
                u.set(tx, ty);
                Fx.teleport.at(tx, ty);
                u.apply(StatusEffects.invincible, 60);
            }
        },
        {
            name: "Sticky Fingers",
            skillName: "Ari Zipper",
            cooldown: 5,
            color: Color.royal,
            skill: (p, u) => {
                const tx = u.x + Angles.trnsx(u.rotation, 90);
                const ty = u.y + Angles.trnsy(u.rotation, 90);
                Fx.shockwave.at(tx, ty);
                Damage.damage(p.team(), tx, ty, 50, 110, false);
            }
        },
        {
            name: "Purple Haze",
            skillName: "Virus Capsule",
            cooldown: 7.5,
            color: Color.purple,
            skill: (p, u) => {
                const tx = p.mouseX || u.x;
                const ty = p.mouseY || u.y;
                Fx.greenCloud.at(tx, ty);
                Units.nearbyEnemies(p.team(), tx, ty, 110, (e) => {
                    e.apply(StatusEffects.corroded, 300);
                    e.apply(StatusEffects.sapped, 300);
                });
            }
        },
        {
            name: "Made in Heaven",
            skillName: "Time Acceleration",
            cooldown: 10,
            color: Color.white,
            skill: (p, u) => {
                Fx.wave.at(u.x, u.y);
                u.apply(StatusEffects.fast, 360);
                u.apply(StatusEffects.overclock, 360);
            }
        }
    ];

    const state = {
        idx: 0,
        active: false,
        cd: 0,
        built: false,
        label: null
    };

    const getStand = () => STANDS[state.idx];

    function refreshText() {
        if (!state.label) return;
        const s = getStand();
        const status = state.active ? "ON" : "OFF";
        const cdStr = state.cd > 0 ? state.cd.toFixed(1) + "s" : "READY";
        state.label.setText(s.name + " [" + status + "] - " + s.skillName + " (" + cdStr + ")");
    }

    function toggleStand() {
        state.active = !state.active;
        refreshText();
    }

    function nextStand() {
        state.idx = (state.idx + 1) % STANDS.length;
        state.cd = 0;
        refreshText();
    }

    function triggerSkill() {
        const p = Vars.player;
        if (!p || !p.unit() || !state.active || state.cd > 0) return;
        const s = getStand();
        s.skill(p, p.unit());
        state.cd = s.cooldown;
        refreshText();
    }

    function buildUI() {
        if (state.built || !Vars.ui || !Vars.ui.hudGroup) return;
        const root = new Table();
        root.bottom().left().padBottom(110).padLeft(14);

        const box = new Table(Tex.button);
        box.margin(8);
        state.label = box.add("").color(Color.white).colspan(3).row();
        box.button("Stand", toggleStand).size(85, 38).pad(2);
        box.button("Switch", nextStand).size(85, 38).pad(2);
        box.button("Skill", triggerSkill).size(85, 38).pad(2);

        root.add(box);
        Vars.ui.hudGroup.addChild(root);
        state.built = true;
        refreshText();
    }

    Events.on(EventType.ClientLoadEvent, buildUI);

    Events.run(Trigger.update, () => {
        if (!state.built) buildUI();

        if (state.cd > 0) {
            state.cd = Math.max(0, state.cd - Time.delta / 60);
            refreshText();
        }

        if (state.active && Vars.player && Vars.player.unit()) {
            const u = Vars.player.unit();
            const s = getStand();
            const sx = u.x + Angles.trnsx(u.rotation + 180, 20);
            const sy = u.y + Angles.trnsy(u.rotation + 180, 20);
            if (Math.random() < 0.4) {
                Fx.hitBulletColor.at(sx, sy, s.color);
            }
        }
    });
})();
