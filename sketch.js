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
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 將偵測到的 keypoint 座標從影片原始大小映射到畫布上縮放後的位置
          // 這樣才能確保圓圈能正確地對準手部位置
          let mappedX = map(keypoint.x, 0, video.width, displayX, displayX + displayWidth);
          let mappedY = map(keypoint.y, 0, video.height, displayY, displayY + displayHeight);

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }
}
