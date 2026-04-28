// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let particles = []; // 儲存火花粒子的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background("#e7c6ff"); // 設定畫布背景顏色為 e7c6ff

  // 在畫布置中上方顯示文字
  fill(0); // 文字顏色設為黑色
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP);
  text("414730894呂承諺", width / 2, 20);

  // 計算影像顯示的寬高，為畫布寬高的 50%
  let displayWidth = width * 0.5;
  let displayHeight = height * 0.5;

  // 計算影像置中的位置
  let displayX = (width - displayWidth) / 2;
  let displayY = (height - displayHeight) / 2;

  image(video, displayX, displayY, displayWidth, displayHeight);

  // 更新並繪製所有火花粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 1. 先計算並儲存所有映射後的關鍵點座標
        let points = [];
        for (let j = 0; j < hand.keypoints.length; j++) {
          let kp = hand.keypoints[j];
          let mx = map(kp.x, 0, video.width, displayX, displayX + displayWidth);
          let my = map(kp.y, 0, video.height, displayY, displayY + displayHeight);
          points.push({ x: mx, y: my });

          // 針對 4, 8, 12, 16, 20 產生火花 (每 5 幀產生一個，避免過多)
          if ([4, 8, 12, 16, 20].includes(j) && frameCount % 5 === 0) {
            let pColor = hand.handedness == "Left" ? color(255, 0, 255) : color(255, 255, 0);
            particles.push(new Particle(mx, my, pColor));
          }
        }

        // 2. 設定顏色樣式（左手粉紅，右手黃）
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
          fill(255, 0, 255);
        } else {
          stroke(255, 255, 0);
          fill(255, 255, 0);
        }

        // 3. 串接指定的關鍵點編號：0-4, 5-8, 9-12, 13-16, 17-20
        let groups = [
          [0, 1, 2, 3, 4],    // 拇指區塊
          [5, 6, 7, 8],       // 食指區塊
          [9, 10, 11, 12],    // 中指區塊
          [13, 14, 15, 16],   // 無名指區塊
          [17, 18, 19, 20]    // 小指區塊
        ];

        strokeWeight(5); // 設定線條粗細
        for (let group of groups) {
          for (let i = 0; i < group.length - 1; i++) {
            let p1 = points[group[i]];
            let p2 = points[group[i + 1]];
            line(p1.x, p1.y, p2.x, p2.y);
          }
        }

        // 4. 繪製關鍵點圓圈
        noStroke();
        for (let p of points) {
          circle(p.x, p.y, 16);
        }
      }
    }
  }
}

// 火花粒子類別
class Particle {
  constructor(x, y, color, isFragment = false) {
    this.pos = createVector(x, y);
    this.color = color;
    this.isFragment = isFragment; // 是否為爆炸後的碎片
    this.exploded = false;
    
    if (this.isFragment) {
      this.vel = p5.Vector.random2D().mult(random(1, 3));
      this.lifespan = 255;
    } else {
      this.vel = createVector(random(-0.8, 0.8), random(-5, -3));
      this.targetY = y - random(60, 150); // 設定向上飛多久後「破掉」
    }
  }

  update() {
    this.pos.add(this.vel);
    
    if (this.isFragment) {
      this.lifespan -= 10;
      this.vel.mult(0.95); // 碎片逐漸減速
    } else {
      // 如果到達目標高度，觸發爆炸
      if (this.pos.y <= this.targetY) {
        this.exploded = true;
      }
    }
  }

  display() {
    push();
    noStroke();
    let alpha = this.isFragment ? this.lifespan : 255;
    let c = color(this.color);
    c.setAlpha(alpha);
    fill(c);
    
    if (this.isFragment) {
      circle(this.pos.x, this.pos.y, 4);
    } else {
      // 主火花繪製成小菱形或圓點
      circle(this.pos.x, this.pos.y, 8);
    }
    pop();
  }

  isDead() {
    if (this.isFragment) return this.lifespan <= 0;
    if (this.exploded) {
      // 當主火花破掉時，產生 6 個碎片
      for (let i = 0; i < 6; i++) {
        particles.push(new Particle(this.pos.x, this.pos.y, this.color, true));
      }
      return true;
    }
    return this.pos.y < 0;
  }
}
