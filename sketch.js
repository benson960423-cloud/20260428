// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

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

  // 計算影像顯示的寬高，為畫布寬高的 50%
  let displayWidth = width * 0.5;
  let displayHeight = height * 0.5;

  // 計算影像置中的位置
  let displayX = (width - displayWidth) / 2;
  let displayY = (height - displayHeight) / 2;

  image(video, displayX, displayY, displayWidth, displayHeight);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 1. 先計算並儲存所有映射後的關鍵點座標
        let points = [];
        for (let kp of hand.keypoints) {
          let mx = map(kp.x, 0, video.width, displayX, displayX + displayWidth);
          let my = map(kp.y, 0, video.height, displayY, displayY + displayHeight);
          points.push({ x: mx, y: my });
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
