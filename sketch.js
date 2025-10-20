// 全域變數
let bubbles = []; // 存放所有氣球物件的陣列
let particles = []; // 存放所有粒子物件的陣列
let colors = [
  '#eae4e9', '#fff1e6', '#fde2e4', '#fad2e1', '#e2ece9', // #e2ece9 是得分顏色
  '#bee1e6', '#f0efeb', '#dfe7fd', '#cddafd'
]; 
const backgroundColor = '#f0f0f0';

// ****** 新增分數變數和目標顏色 ******
let score = 0;
const BONUS_COLOR = '#e2ece9'; // 加分顏色：淺綠色/薄荷綠

// 音效變數
let popSound; 
const SOUND_FILE_PATH = 'pop.mp3'; 

// 文字顯示設定
const TEXT_COLOR = [200]; // 淺灰色 (RGB: 200, 200, 200)
const TEXT_SIZE = 32;

// 使用 preload() 確保音效在 setup() 運行前載入
function preload() {
  // 載入音效 (假設 pop.mp3 檔案存在)
  popSound = loadSound(SOUND_FILE_PATH);
}

// =========================================================================
// Particle 類別 (用於爆破碎片)
// =========================================================================
class Particle {
  constructor(x, y, color, size, velocityX, velocityY, lifeSpan) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.velocityX = velocityX; 
    this.velocityY = velocityY; 
    this.lifeSpan = lifeSpan;   
    this.initialLifeSpan = lifeSpan; 
    this.alpha = 255;           
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.lifeSpan--;
    this.alpha = map(this.lifeSpan, 0, this.initialLifeSpan, 0, 255); 
    
    this.velocityY += 0.05; 
    this.velocityX *= 0.98; 
    this.velocityY *= 0.98;
  }

  show() {
    if (this.lifeSpan <= 0) return; 
    
    noStroke();
    let particleColor = color(this.color);
    particleColor.setAlpha(this.alpha);
    fill(particleColor);
    circle(this.x, this.y, this.size); 
  }

  isDead() {
    return this.lifeSpan <= 0;
  }
}

// =========================================================================
// Bubble 類別 (氣球)
// =========================================================================
class Bubble {
  constructor(x, y, r, color, alpha, speed) {
    this.x = x;          
    this.y = y;          
    this.r = r;          
    this.color = color;  
    this.alpha = alpha;  
    this.speed = speed;  
    this.isPopping = false; 
  }

  isClicked(px, py) {
    if (this.isPopping) return false;
    
    let d = dist(this.x, this.y, px, py);
    return d < this.r;
  }
  
  move() {
    if (!this.isPopping) { 
      this.y -= this.speed; 
      
      if (this.y < -this.r) {
        this.reset(); 
      }
    }
  }

  show() {
    if (!this.isPopping) {
      noStroke(); 
      let bubbleColor = color(this.color);
      bubbleColor.setAlpha(this.alpha);
      fill(bubbleColor);
      circle(this.x, this.y, this.r * 2); 

      this.drawSquare();
    }
  }
  
  drawSquare() {
    let squareSize = this.r / 3.5; 
    
    fill(255, 255, 255, 120); 
    noStroke(); 

    let offsetX = this.r * 0.4; 
    let offsetY = -this.r * 0.4; 

    let squareX = this.x + offsetX - squareSize / 2;
    let squareY = this.y + offsetY - squareSize / 2;

    rectMode(CORNER); 
    rect(squareX, squareY, squareSize, squareSize); 
  }

  reset() {
    this.x = random(width); 
    this.r = random(25, 100); 
    this.color = random(colors); 
    this.alpha = random(100, 255); 
    this.speed = random(0.5, 3.5); 
    this.y = height + this.r; 
    this.isPopping = false; 
  }

  // ****** 核心修改：在爆破時判斷顏色並更新分數 ******
  startPopping() {
    this.isPopping = true;
    
    // 檢查顏色並更新分數
    if (this.color === BONUS_COLOR) {
        score += 1; // 加 1 分
    } else {
        score -= 1; // 扣 1 分
    }

    // 播放音效
    if (popSound && !popSound.isPlaying()) {
       popSound.setVolume(0.5); 
       popSound.play(); 
    }
    
    // 生成粒子
    let numParticles = floor(random(10, 25)); 
    for (let i = 0; i < numParticles; i++) {
      let particleSize = random(5, 15); 
      let angle = random(TWO_PI); 
      let speedFactor = random(2, 5); 
      
      let velocityX = cos(angle) * speedFactor;
      let velocityY = sin(angle) * speedFactor;
      
      let particleColor = this.color;
      let particleLifeSpan = floor(random(30, 60)); 
      
      particles.push(new Particle(this.x, this.y, particleColor, particleSize, velocityX, velocityY, particleLifeSpan));
    }
    
    // 氣球重置
    this.reset();
  }
}

// =========================================================================
// p5.js 基本設定和互動函數
// =========================================================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(backgroundColor); 
  rectMode(CORNER); 
  
  let numBubbles = 50; 
  for (let i = 0; i < numBubbles; i++) {
    let r = random(25, 100); 
    let x = random(width);
    let y = random(height, height * 2); 
    let colorHex = random(colors);
    let alpha = random(100, 255);
    let speed = random(0.5, 3.5); 
    bubbles.push(new Bubble(x, y, r, colorHex, alpha, speed));
  }
}

function draw() {
  background(backgroundColor); 

  // ----- 更新和繪製 Bubbles -----
  for (let bubble of bubbles) {
    bubble.move();
    bubble.show();
  }

  // ----- 更新和繪製 Particles -----
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.update();
    particle.show();
    
    if (particle.isDead()) {
      particles.splice(i, 1); 
    }
  }

  // ****** 繪製左上角和右上角文字 ******
  
  // 設定文字樣式 (淺灰色, 32px)
  textSize(TEXT_SIZE);
  fill(TEXT_COLOR); 
  noStroke();

  // 1. 左上角文字
  textAlign(LEFT, TOP);
  text("414730142", 10, 10); // 10px 邊距

  // 2. 右上角得分
  textAlign(RIGHT, TOP);
  text("得分分數: " + score, width - 10, 10); // 10px 邊距
  // ===================================
}

// ****** 滑鼠點擊事件處理 (爆破) ******
function mousePressed() {
  // 由於瀏覽器音訊限制，確保音訊環境啟動
  userStartAudio(); 
  
  for (let bubble of bubbles) {
    if (bubble.isClicked(mouseX, mouseY)) {
      bubble.startPopping();
      return; 
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(backgroundColor); 
}