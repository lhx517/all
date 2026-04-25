
let seeds = [];
let myIframe;
let vinePoints = [];
let activeUrl = ""; // 追蹤當前啟用的網址

// 設定每週作業的網址清單
const weekUrls = [
  "https://lhx517.github.io/fffffish/", // 單元一
  "https://lhx517.github.io/colar/",    // 單元二
  "https://lhx517.github.io/school/",   // 單元三
  "https://lhx517.github.io/0425-grass/",// 單元四
  "https://lhx517.github.io/sheep/"     // 單元五
];

const unitLabels = [
  "單元一",
  "單元二",
  "單元三",
  "單元四",
  "單元五"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. 建立 iframe 展示區
  myIframe = createElement('iframe');
  updateIframeLayout();
  myIframe.style('border', 'none');
  myIframe.style('border-radius', '15px');
  myIframe.style('background', '#fff');
  myIframe.style('box-shadow', '0 10px 30px rgba(0,0,0,0.15)');
  myIframe.attribute('src', 'https://p5js.org'); // 預設引導頁

  // 2. 初始化生長路徑 (藤蔓)
  for (let i = 0; i < weekUrls.length; i++) {
    // 調整 sin(i * 1.0) * 60 增加彎曲感，height * 0.15 讓分布更高更均勻
    let x = width * 0.15 + sin(i * 1.0) * 60;
    let y = height * 0.85 - (i * height * 0.16); 
    vinePoints.push(createVector(x, y));
    
    // 3. 建立週次節點 (種子)
    let weekUrl = weekUrls[i]; 
    seeds.push(new Seed(x, y, unitLabels[i], weekUrl, i)); // 傳入索引 i
  }

  // 4. 加入心得說明區域
  let info = createDiv(`
    <h2 style="margin:0">時光記憶圖譜</h2>
    <p>點擊左側「程式種子」查看每週作業。<br>藤蔓象徵著知識的累積與成長。</p>
  `);
  info.addClass('p5-ui-text');
  info.position(30, 30);
  info.style('color', '#2d5a27');
}

function draw() {
  background(240, 245, 240); // 有機感的淺綠底色
  
  drawGallerySpace();
  drawGrowthContext();
  
  // 更新與顯示所有節點
  let hoveringAny = false;
  for (let seed of seeds) {
    seed.update();
    seed.display();
    if (seed.isHovered) hoveringAny = true;
  }
  
  // 根據是否有懸停改變游標
  if (hoveringAny) cursor(HAND); else cursor(ARROW);

  // 裝飾性的數位盆栽 (海草)
  drawDigitalPlant(width * 0.08, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateIframeLayout();
}

function updateIframeLayout() {
  // 讓 iframe 佔據右側 60% 的空間
  myIframe.position(width * 0.35, 40);
  myIframe.size(width * 0.62, height - 80);
}

function drawGallerySpace() {
  // 使用 vertex 營造地平線透視感
  noStroke();
  fill(225, 232, 225);
  beginShape();
  vertex(0, height);
  vertex(width, height);
  vertex(width * 0.8, height * 0.75);
  vertex(width * 0.2, height * 0.75);
  endShape(CLOSE);
}

function drawGrowthContext() {
  // 繪製主藤蔓
  noFill();
  stroke(100, 140, 100);
  strokeWeight(4);
  
  beginShape();
  // curveVertex 需要控制點
  if (vinePoints.length > 0) {
    let moveX = map(mouseX, 0, width, 5, -5);

    for (let i = 0; i < vinePoints.length; i++) {
      let p = vinePoints[i];
      // 加入隨時間變化的呼吸效果 (微小上下波動)
      // frameCount * 0.05 控制呼吸速度，i * 0.5 讓每個節點有先後順序，產生蠕動感
      let breathY = sin(frameCount * 0.05 + i * 0.5) * 5;

      // curveVertex 需要重複起點與終點作為控制點才能正確繪製曲線
      if (i === 0) curveVertex(p.x + moveX, p.y + breathY);
      curveVertex(p.x + moveX, p.y + breathY);
      if (i === vinePoints.length - 1) curveVertex(p.x + moveX, p.y + breathY);

      // 同步更新種子(Seed)的邏輯位置，讓滑鼠判斷與繪製位置一致
      if (seeds[i]) {
        seeds[i].pos.set(p.x + moveX, p.y + breathY);
      }
    }
  }
  endShape();
}

function drawDigitalPlant(x, y) {
  push();
  translate(x, y);
  stroke(120, 160, 120, 150);
  for (let i = 0; i < 3; i++) {
    noFill();
    beginShape();
    for (let j = 0; j < 8; j++) {
      let offset = sin(frameCount * 0.02 + i + j) * 15;
      vertex(offset + i * 25, -j * 30);
    }
    endShape();
  }
  pop();
}

class Seed {
  constructor(x, y, label, url, index) {
    this.pos = createVector(x, y);
    this.label = label;
    this.url = url;
    this.index = index; // 紀錄索引以產生顏色差異
    this.size = 60; // 基礎尺寸加倍
    this.isHovered = false;
  }

  update() {
    let isActive = (activeUrl === this.url);
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    // 判斷滑鼠是否在圓圈/葉子範圍內
    this.isHovered = d < this.size / 2;
    
    // 平滑縮放
    // 如果是當前選中的單元，也保持放大狀態
    this.size = lerp(this.size, (this.isHovered || isActive) ? 120 : 60, 0.1);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    let isActive = (activeUrl === this.url); // 判斷是否為當前觀看中

    // 設定漸層色彩
    let grad = drawingContext.createLinearGradient(-this.size/2, -this.size/2, this.size/2, this.size/2);
    
    if (isActive) {
      // 選中狀態：深紅漸層
      grad.addColorStop(0, '#ff4d6d');
      grad.addColorStop(1, '#800f2f');

      // 為當前選中的葉子加入淡淡的綠色光暈
      drawingContext.shadowBlur = 40;
      drawingContext.shadowColor = 'rgba(100, 255, 100, 0.8)';
    } else if (this.isHovered) {
      // 懸停狀態：亮粉漸層
      grad.addColorStop(0, '#ff9a9e');
      grad.addColorStop(1, '#fad0c4');
    } else {
      // 一般狀態：綠色漸層 (根據索引微調色偏)
      let rBase = 143 - this.index * 10;
      let gBase = 188 - this.index * 5;
      let bBase = 143 - this.index * 10;
      grad.addColorStop(0, `rgb(${rBase}, ${gBase}, ${bBase})`); // 較淺
      grad.addColorStop(1, `rgb(${rBase-60}, ${gBase-80}, ${bBase-60})`); // 較深
    }

    drawingContext.fillStyle = grad;
    stroke(255);
    strokeWeight(2);
    
    push();
    rotate(PI/4); // 讓葉子斜著生長
    beginShape();
    for (let a = 0; a < TWO_PI; a += PI / 20) {
      let r = this.size / 2;
      // 如果是 active 狀態，即便沒懸停也會有微小起伏
      if (this.isHovered || isActive) r += sin(frameCount * 0.1 + a) * 5;
      // 葉子數學公式：利用 cos(a) 調整 y 軸實現一端尖一端圓
      let x = r * cos(a);
      let y = r * sin(a) * (0.5 + 0.2 * cos(a)); 
      vertex(x, y);
    }
    endShape(CLOSE);

    // 繪製完葉子後重置陰影，避免影響到接下來文字的清晰度
    drawingContext.shadowBlur = 0;
    pop();

    // 文字標籤
    fill(isActive ? 255 : 50); 
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(this.size * 0.22); // 調整文字比例
    text(this.label, 0, 0);
    pop();
  }

  clicked() {
    if (this.isHovered) {
      myIframe.attribute('src', this.url);
      activeUrl = this.url; // 更新當前啟用的網址
    }
  }
}

function mousePressed() {
  for (let seed of seeds) {
    seed.clicked();
  }
}