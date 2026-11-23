// Tiny endless runner starring Crusoe, the green square from Little Crusoe.
// Shared by the arcade cabinet (attract mode) and the playable widget in the games panel.

export class RunnerGame {
  constructor({ auto = false, w = 160, h = 72 } = {}) {
    this.auto = auto;
    this.w = w;
    this.h = h;
    this.best = 0;
    this.reset();
  }

  reset() {
    this.t = 0;
    this.speed = 62;
    this.score = 0;
    this.dead = false;
    this.started = this.auto;
    this.hero = { x: 22, y: 0, vy: 0, ground: true, squash: 0 };
    this.obstacles = [];
    this.hearts = [];
    this.spawnIn = 1.2;
    this.clouds = Array.from({ length: 4 }, (_, i) => ({ x: i * 50 + 10, y: 8 + ((i * 13) % 20), s: 0.4 + (i % 3) * 0.2 }));
    this.pops = [];
  }

  get groundY() {
    return this.h - 14;
  }

  jump() {
    if (this.dead) {
      this.reset();
      this.started = true;
      return 'restart';
    }
    if (!this.started) {
      this.started = true;
      return 'start';
    }
    if (this.hero.ground) {
      this.hero.vy = -178;
      this.hero.ground = false;
      return 'jump';
    }
    return null;
  }

  step(dt) {
    dt = Math.min(dt, 0.05);
    const events = [];
    this.t += dt;
    this.clouds.forEach((c) => {
      c.x -= this.speed * 0.15 * c.s * dt;
      if (c.x < -30) c.x = this.w + 10;
    });
    if (!this.started || this.dead) return events;

    this.speed = Math.min(130, this.speed + dt * 2.2);
    this.score += dt * 10;
    const hero = this.hero;
    hero.vy += 560 * dt;
    hero.y += hero.vy * dt;
    if (hero.y >= 0) {
      if (!hero.ground) hero.squash = 1;
      hero.y = 0;
      hero.vy = 0;
      hero.ground = true;
    }
    hero.squash = Math.max(0, hero.squash - dt * 6);

    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      const tall = Math.random() < 0.35;
      this.obstacles.push({ x: this.w + 4, w: tall ? 12 : 8, h: tall ? 12 : 8 });
      if (Math.random() < 0.45) this.hearts.push({ x: this.w + 40 + Math.random() * 30, y: 18 + Math.random() * 12, got: false });
      this.spawnIn = 0.9 + Math.random() * 1.1 - Math.min(0.35, this.t * 0.004);
    }
    const hx = hero.x;
    const hy = this.groundY - 10 + hero.y;
    this.obstacles.forEach((o) => (o.x -= this.speed * dt));
    this.hearts.forEach((o) => (o.x -= this.speed * dt));
    this.obstacles = this.obstacles.filter((o) => o.x > -20);
    this.hearts = this.hearts.filter((o) => o.x > -20 && !o.got);

    if (this.auto) {
      const next = this.obstacles.find((o) => o.x + o.w > hx);
      if (next && hero.ground && next.x - hx < 22 + this.speed * 0.08) this.jump();
    }

    for (const o of this.obstacles) {
      const ox0 = o.x + 2;
      const ox1 = o.x + o.w - 2;
      const oy0 = this.groundY - o.h + 3;
      if (hx + 9 > ox0 && hx + 1 < ox1 && hy + 10 > oy0) {
        this.dead = true;
        this.best = Math.max(this.best, Math.floor(this.score));
        events.push('dead');
        if (this.auto) setTimeout(() => this.reset(), 1400);
        break;
      }
    }
    for (const c of this.hearts) {
      if (!c.got && Math.abs(c.x - (hx + 5)) < 8 && Math.abs(c.y - (hy + 5)) < 9) {
        c.got = true;
        this.score += 25;
        this.pops.push({ x: c.x, y: c.y, life: 0.6 });
        events.push('heart');
      }
    }
    this.pops.forEach((p) => {
      p.life -= dt;
      p.y -= dt * 20;
    });
    this.pops = this.pops.filter((p) => p.life > 0);
    return events;
  }

  draw(ctx) {
    const { w, h } = this;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#3fb8ee');
    g.addColorStop(1, '#a6e3fb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // sun
    ctx.fillStyle = '#ffe36b';
    ctx.fillRect(w - 26, 6, 12, 12);
    ctx.fillStyle = 'rgba(255,227,107,0.35)';
    ctx.fillRect(w - 28, 4, 16, 16);
    // clouds
    ctx.fillStyle = '#ffffff';
    this.clouds.forEach((c) => {
      const x = Math.round(c.x);
      const y = Math.round(c.y);
      ctx.fillRect(x, y + 2, 18, 4);
      ctx.fillRect(x + 3, y, 10, 3);
    });
    // ground
    const gy = this.groundY;
    ctx.fillStyle = '#2fbf4a';
    ctx.fillRect(0, gy, w, h - gy);
    ctx.fillStyle = '#239a3a';
    const off = Math.floor((this.t * this.speed) % 8);
    for (let x = -off; x < w; x += 8) ctx.fillRect(x, gy + 4, 4, 2);
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(0, gy + 9, w, h - gy - 9);

    // spikes
    this.obstacles.forEach((o) => {
      const x = Math.round(o.x);
      ctx.fillStyle = '#c7cdd4';
      for (let i = 0; i < o.w; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, gy);
        ctx.lineTo(x + i + 2, gy - o.h);
        ctx.lineTo(x + i + 4, gy);
        ctx.fill();
      }
      ctx.fillStyle = '#7d8790';
      ctx.fillRect(x, gy - 1, o.w, 1);
    });
    // hearts
    this.hearts.forEach((c) => {
      const x = Math.round(c.x);
      const y = Math.round(c.y + Math.sin(this.t * 6 + c.x) * 1.5);
      ctx.fillStyle = '#ff4d6d';
      ctx.fillRect(x - 3, y - 2, 2, 2);
      ctx.fillRect(x + 1, y - 2, 2, 2);
      ctx.fillRect(x - 4, y - 1, 8, 2);
      ctx.fillRect(x - 3, y + 1, 6, 1);
      ctx.fillRect(x - 2, y + 2, 4, 1);
      ctx.fillRect(x - 1, y + 3, 2, 1);
    });
    // hero
    const hero = this.hero;
    const sq = hero.squash;
    const hw = 10 + sq * 2;
    const hh = 10 - sq * 2;
    const hx = Math.round(hero.x - sq);
    const hy = Math.round(gy - hh + hero.y);
    ctx.fillStyle = '#101418';
    ctx.fillRect(hx - 1, hy - 1, hw + 2, hh + 2);
    ctx.fillStyle = this.dead ? '#8fd19e' : '#4ee66a';
    ctx.fillRect(hx, hy, hw, hh);
    ctx.fillStyle = '#101418';
    if (this.dead) {
      ctx.fillRect(hx + 2, hy + 3, 2, 1);
      ctx.fillRect(hx + hw - 4, hy + 3, 2, 1);
    } else {
      ctx.fillRect(hx + 2, hy + 2, 2, 2);
      ctx.fillRect(hx + hw - 4, hy + 2, 2, 2);
    }
    ctx.fillRect(hx + 3, hy + hh - 3, hw - 6, 1);
    ctx.fillRect(hx + 2, hy + hh - 4, 1, 1);
    ctx.fillRect(hx + hw - 3, hy + hh - 4, 1, 1);

    ctx.font = '600 7px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    this.pops.forEach((p) => {
      ctx.fillStyle = `rgba(255,255,255,${p.life / 0.6})`;
      ctx.fillText('+25', p.x - 6, p.y - 10);
    });
    ctx.fillStyle = '#0d2a3a';
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.floor(this.score)).padStart(5, '0'), w - 4, h - 11);
    if (this.best && !this.auto) {
      ctx.textAlign = 'left';
      ctx.fillText('BEST ' + String(this.best).padStart(5, '0'), 4, h - 11);
    }
    ctx.textAlign = 'center';
    if (!this.started) {
      this.banner(ctx, 'LITTLE CRUSOE', 'space / tap: jump');
    } else if (this.dead && !this.auto) {
      this.banner(ctx, 'GAME OVER', 'space / tap to retry');
    }
    ctx.textAlign = 'left';
  }

  banner(ctx, title, sub) {
    const { w, h } = this;
    ctx.fillStyle = 'rgba(8, 20, 30, 0.55)';
    ctx.fillRect(0, h / 2 - 16, w, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillText(title, w / 2, h / 2 - 13);
    ctx.font = '500 6px "JetBrains Mono", monospace';
    ctx.fillStyle = '#bfe9ff';
    ctx.fillText(sub, w / 2, h / 2 - 1);
  }
}
