"use strict";
var canvas, ctx;
var radius = 4;
var maxV = 10;
var particles = [];
var amplitude = 40;
var mouse = { x: 0, y: 0, click: false };
var playerSize = 10;
var playerSpeed = 1.4;
var playerPos = { x: 300, y: 300 };
var cvsX, cvsY, cvsW, cvsH;
var projectiles = [];
var wallsCoors = [
  { x: 0.25, y: 0.25, w: 0.02, h: 0.52 },
  { x: 0.25, y: 0.25, w: 0.52, h: 0.02 },
  { x: 0.75, y: 0.25, w: 0.02, h: 0.52 },
  { x: 0.25, y: 0.75, w: 0.52, h: 0.02 }];
var wallKill = [
  { x: 0.1, y: 0.9, w: 0.1, h: 0.02 }];
var walls = [];
var disloc = 0;
var dislocAll = { x: 0, y: 0 };
var dislocAllValue = 0;
var timer;
var deltaTime = 0;
var keys = { c: false, w: false, a: false, s: false, d: false };


window.onload = function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  setWindow();
  document.addEventListener("mousemove", updateMouse);
  document.addEventListener("mousedown", function (e) { mouse.click = true; clickMouse(e); });
  document.addEventListener("mouseup", function () { mouse.click = false; });
  document.addEventListener("keydown", keyDown);
  document.addEventListener("keyup", keyUp);

  window.addEventListener("resize", setWindow);
  for (var i = 0; i < wallsCoors.length; i++) {
    walls.push(new Wall(wallsCoors[i].x, wallsCoors[i].y, wallsCoors[i].w, wallsCoors[i].h, canvas, false));
  }
  for (var i = 0; i < wallKill.length; i++) {
    walls.push(new Wall(wallKill[i].x, wallKill[i].y, wallKill[i].w, wallKill[i].h, canvas, true));
  }
  timer = Date.now();
  update();
  animate();
};

function setWindow() {
  cvsW = window.innerWidth * .95;
  cvsH = window.innerHeight * .95;
  canvas.width = cvsW;
  canvas.height = cvsH;
  var canvasRect = canvas.getBoundingClientRect();
  cvsX = canvasRect.left;
  cvsY = canvasRect.top;
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].reCanvas(canvas);
  }
  for (var j = 0; j < walls.length; j++) {
    walls[j].reCanvas(canvas);
  }
}

function clickMouse(e) {
  projectiles.push(new Projectile(playerPos.x, playerPos.y, mouse.x, mouse.y, radius, "#fff", canvas));
}


function updateMouse(e) {
  mouse.x = e.clientX - cvsX;
  mouse.y = e.clientY - cvsY;
}

function update() {
  deltaTime = Math.min(Date.now() - timer, 30);
  timer = Date.now();
  for (var i = 0; i < projectiles.length; i++) {
    for (var j = 0; j < walls.length; j++) {
      walls[j].collide(projectiles[i], deltaTime);
    }
    projectiles[i].update(deltaTime);
    if (projectiles[i].dead) {
      projectiles.splice(i, 1);
      i--;
    }
  }
  setTimeout(update, 10);
}

function animate(ts) {
  if (keys.c) clickMouse(null);
  moveCharacter();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = "#f00";
  ctx.rect(playerPos.x, playerPos.y, playerSize, playerSize);
  ctx.fill();
  ctx.beginPath();
  ctx.setLineDash([10, 3]);
  ctx.strokeStyle = "#faf";
  ctx.moveTo(playerPos.x, playerPos.y);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.stroke();
  var mX = (mouse.x - playerPos.x) / (mouse.y - playerPos.y);
  var mY = 1 / mX;
  var x2 = 0, y2 = 0;
  if (mouse.x > playerPos.x) x2 = cvsW;
  if (mouse.y > playerPos.y) y2 = cvsH;
  var tX2 = mouse.x + (y2 - mouse.y) * mX;
  var tY2 = mouse.y + (x2 - mouse.x) * mY;
  if (tX2 < 0 || tX2 > cvsW) {
    y2 = tY2;
  } else x2 = tX2;
  ctx.beginPath();
  ctx.setLineDash([5, 10]);
  ctx.strokeStyle = "#95f";
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].draw();
  }
  for (var i = 0; i < walls.length; i++) {
    walls[i].draw();
  }
  requestAnimationFrame(animate);
}

function moveCharacter() {
  if (keys.a && playerPos.x > playerSpeed) playerPos.x -= playerSpeed;
  if (keys.d && playerPos.x < (cvsW + playerSize + playerSpeed)) playerPos.x += playerSpeed;
  if (keys.w && playerPos.y > playerSpeed) playerPos.y -= playerSpeed;
  if (keys.s && playerPos.y < (cvsH + playerSize + playerSpeed)) playerPos.y += playerSpeed;
}

function updateScreen() {
  setTimeout(updateScreen, 1);
}

function keyDown(e) {
  keys[e.key] = true;
  console.log(keys);
}

function keyUp(e) {
  if (e.key == 'c') keys.c = false;
  keys[e.key] = false;
}

class Wall {
  constructor(x, y, w, h, canvas, killer = false) {
    this.origX = x;
    this.origY = y;
    this.origW = w;
    this.origH = h;
    this.reCanvas(canvas);
    this.killer = killer;
  }
  reCanvas(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvW = canvas.width;
    this.canvH = canvas.height;
    this.x = Math.round(this.origX * this.canvW);
    this.y = Math.round(this.origY * this.canvH);
    this.w = Math.round(this.origW * this.canvW);
    this.h = Math.round(this.origH * this.canvH);
  }

  draw() {
    this.ctx.strokeStyle = "#0f0";
    if (this.killer) this.ctx.strokeStyle = "#f00";
    ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.w, this.h);
    this.ctx.stroke();
    this.x = Math.round(this.origX * this.canvW + dislocAll.x);
    this.y = Math.round(this.origY * this.canvH + dislocAll.y);
  }

  collide(obj) {
    this.x = Math.round(this.origX * this.canvW + dislocAll.x);
    this.y = Math.round(this.origY * this.canvH + dislocAll.y);
    var res = false;
    if (obj.dead) return res;
    if (((obj.y + obj.r) >= this.y && (obj.y - obj.r) <= (this.y + this.h)) || ((obj.y + obj.r + obj.vy * (deltaTime / 20)) >= this.y && (obj.y - obj.r + obj.vy * (deltaTime / 20)) <= (this.y + this.h))) {
      if (obj.vx > 0 && ((obj.x + obj.r) <= (this.x)) && (obj.x + obj.r + obj.vx * (deltaTime / 20)) >= this.x) {
        obj.vx = -Math.abs(obj.vx);
        obj.x = this.x - obj.r - 1 + obj.vx * (deltaTime / 20);
        if (this.x > (1 + 10 * disloc) && this.x < (cvsW - (1 + 10 * disloc + this.w))) {
          this.x += obj.vx;
          dislocAll.x += dislocAllValue;
        }
        res = true;
      } else if (obj.vx < 0 && (obj.x - obj.r) >= (this.x + this.w) && (obj.x - obj.r + obj.vx * (deltaTime / 20)) <= (this.x + this.w)) {
        obj.vx = Math.abs(obj.vx);
        obj.x = this.x + this.w + obj.r + 1 + obj.vx * (deltaTime / 20);
        if (this.x > (1 + 10 * disloc) && this.x < (cvsW - (1 + 10 * disloc + this.w))) {
          this.x -= obj.vx;
          dislocAll.x -= dislocAllValue;
        }
        res = true;
      }
    }

    if (((obj.x + obj.r) >= this.x && (obj.x - obj.r) <= (this.x + this.w)) || ((obj.x + obj.r + obj.vx * (deltaTime / 20)) >= this.x && (obj.x - obj.r + obj.vx * (deltaTime / 20)) <= (this.x + this.w))) {
      if (obj.vy > 0 && ((obj.y + obj.r) <= (this.y)) && (obj.y + obj.r + obj.vy * (deltaTime / 20)) >= this.y) {
        obj.vy = -Math.abs(obj.vy);
        obj.y = this.y - obj.r - 1 + obj.vy * (deltaTime / 20);
        if (this.y > (1 + 10 * disloc) && this.y < (cvsH - (1 + 10 * disloc + this.h))) {
          this.y += obj.vy;
          dislocAll.y += dislocAllValue;
        }
        res = true;
      } else if (obj.vy < 0 && (obj.y - obj.r) >= (this.y + this.h) && (obj.y - obj.r + obj.vy * (deltaTime / 20)) <= (this.y + this.h)) {
        obj.vy = Math.abs(obj.vy);
        obj.y = this.y + this.h + obj.r + 1 + obj.vy * (deltaTime / 20);
        if (this.y > (1 + 10 * disloc) && this.y < (cvsH - (1 + 10 * disloc + this.h))) {
          this.y -= obj.vy;
          dislocAll.y -= dislocAllValue;
        }
        res = true;
      }
    }
    if (res && this.killer) obj.dead = true;
    this.x = Math.round(this.origX * this.canvW + dislocAll.x);
    this.y = Math.round(this.origY * this.canvH + dislocAll.y);
    return res;
  }
}


class Projectile {
  constructor(x0, y0, x1, y1, radius, color, canvas) {
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
    this.x = x0;
    this.y = y0;
    this.r = radius;
    this.c = color;
    var dx = x1 - x0;
    var dy = y1 - y0;
    var vel = maxV / Math.sqrt(this.w * this.w + this.h * this.h);
    this.vx = dx * vel;
    this.vy = dy * vel;
    this.dead = false;
  }

  reCanvas(canvas) {
    this.ctx = canvas.getContext("2d");
    this.w = canvas.width;
    this.h = canvas.height;
  }

  update() {
    if (this.dead) return;
    if (Math.abs(this.vx) < 0.001) this.vx += (0.0001) * Math.sign(this.vx);
    if (Math.abs(this.vy) < 0.001) this.vy += (0.0001) * Math.sign(this.vy);

    this.x += this.vx * (deltaTime / 20);
    this.y += this.vy * (deltaTime / 20);
    //Bounce
    if (this.x > (this.w - this.r)) {
      this.vx = - Math.abs(this.vx);
      this.x += (2 * this.vx);
    } else if (this.x < this.r) {
      this.vx = Math.abs(this.vx);
      this.x += (2 * this.vx);
    }
    if (this.y > (this.h - this.r)) {
      this.vy = - Math.abs(this.vy);
      this.y += (2 * this.vy);
    } else if (this.y < this.r) {
      this.vy = Math.abs(this.vy);
      this.y += (2 * this.vy);
    }
    //Wrap
    // if (this.x > (this.w - this.r)) {
    //   this.x -= (this.w - this.r);
    // } else if (this.x < this.r) {
    //   this.x += (this.w - this.r)
    // }
    // if (this.y > (this.h - this.r)) {
    //   this.y -= (this.h - this.r);
    // } else if (this.y < this.r) {
    //   this.y += (this.h - this.r);
    // }
  }

  draw() {
    if (this.dead) return;
    this.ctx.fillStyle = this.c;
    this.ctx.beginPath();
    this.ctx.arc(Math.round(this.x), Math.round(this.y), this.r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  limit(x, min, max = true) {
    if (max) {
      max = Math.abs(min);
      min = -max;
    } else {
      let temp = max;
      max = Math.max(min, max);
      min = Math.min(min, temp);
    }
    return Math.min(max, Math.max(min, x));
  }

}