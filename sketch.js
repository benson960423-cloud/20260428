// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 儲存水泡的陣列

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

  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isPopped()) {
      bubbles.splice(i, 1);
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

          // 針對指尖編號 4, 8, 12, 16, 20 產生水泡
          if ([4, 8, 12, 16, 20].includes(j) && frameCount % 10 === 0) {
            let bColor = hand.handedness == "Left" ? color(200, 100, 255, 150) : color(255, 255, 150, 150);
            bubbles.push(new Bubble(mx, my, bColor));
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

// 水泡類別
class Bubble {
  constructor(x, y, color) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-2, -1)); // 向上飄移
    this.color = color;
    this.radius = random(5, 12);
    this.popped = false;
    this.targetY = y - random(50, 150); // 隨機上升高度後破掉
    this.noiseOffset = random(1000); // 用於左右晃動的隨機偏移
  }

  update() {
    // 模擬左右晃動
    this.vel.x = map(noise(this.noiseOffset + frameCount * 0.02), 0, 1, -1, 1);
    this.pos.add(this.vel);
    
    // 到達指定高度或飛出畫布時破掉
    if (this.pos.y <= this.targetY || this.pos.y < -this.radius) {
      this.popped = true;
    }
  }

  display() {
    push();
    stroke(255, 200); // 白色描邊，增加水泡感
    strokeWeight(1);
    fill(this.color);
    
    // 畫出水泡主體
    circle(this.pos.x, this.pos.y, this.radius * 2);
    
    // 畫出水泡的反光點
    noStroke();
    fill(255, 180);
    circle(this.pos.x - this.radius * 0.3, this.pos.y - this.radius * 0.3, this.radius * 0.4);
    pop();
  }

  isPopped() {
    return this.popped;
  }
}
