var canvas = document.getElementById('cherryBlossomCanvas');
var ctx = canvas.getContext('2d');



function adjustCanvasForHighDPI() {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr); // 调整绘图比例
}

// 初始化时调整Canvas大小
adjustCanvasForHighDPI();

var blossoms = [];

function Blossom(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.rotating = false;
    this.rotationSpeed = 0;
    this.maxSpeed = Math.PI / 64; // 最大旋转速度
    this.speedIncrement = this.maxSpeed / 20; // 加速度
    this.emitMist = false;
    this.mistOpacity = 0; // 雾气的不透明度
    this.mistMaxOpacity = 0.5; // 雾气的最大不透明度
    this.mistFadeSpeed = 0.01; // 雾气渐变速度
 
    this.mistSize = 40; // 初始辉光更大
    this.mistFadeDelay = 4000; // 辉光开始收缩前的延迟时间（单位：毫秒）
    this.mistFadeStartTime = 0; 
}

Blossom.prototype.draw = function() {
    var petalCount = 5;
    var petalRadius = 15;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    for (var i = 0; i < petalCount; i++) {
        ctx.lineTo(0, petalRadius);
        ctx.rotate((Math.PI * 2) / petalCount);
    }
    ctx.closePath();
    ctx.fillStyle = '#FFB7C5';
    ctx.fill();
    ctx.restore();

    if (this.emitMist && this.mistOpacity > 0) {
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.mistSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, ' + this.mistOpacity + ')');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.mistSize, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
};

Blossom.prototype.update = function() {
    if (this.rotating) {
        this.angle += this.rotationSpeed;
        // 减速逻辑
        if (Date.now() - this.startTime > 5000) { // 7秒后开始减速
            this.rotationSpeed -= this.rotationSpeed > 0 ? this.speedIncrement / 2 : 0;
            if (this.rotationSpeed <= 0) {
                this.rotating = false;
                this.angle = 0;
                this.rotationSpeed = 0;
            }
        } else {
            // 正常加速至最大速度，然后维持
            this.rotationSpeed += (this.rotationSpeed < this.maxSpeed) ? this.speedIncrement : 0;
        }
    }
    
    if (this.emitMist) {
        // 处理辉光动画
        this.mistOpacity += (this.mistOpacity < this.mistMaxOpacity) ? this.mistFadeSpeed : -this.mistFadeSpeed;

        if (!this.mistFadeStartTime && this.mistOpacity >= this.mistMaxOpacity) {
            this.mistFadeStartTime = Date.now(); // 记录开始收缩的时间
        }

        if (this.mistFadeStartTime && Date.now() - this.mistFadeStartTime > this.mistFadeDelay) {
            this.mistSize = Math.max(this.mistSize - 0.2, 0); // 辉光开始收缩
        }
    } else if (this.mistOpacity > 0) {
        this.mistOpacity -= this.mistFadeSpeed; // 渐隐
    }
};

function generateBlossoms() {
    for (var i = 0; i < 50; i++) {
        var x = Math.random() * canvas.width;
        var y = Math.random() * canvas.height;
        var blossom = new Blossom(x, y);
        blossoms.push(blossom);
    }
}

canvas.addEventListener('click', function(event) {
    var x = event.clientX;
    var y = event.clientY;
    blossoms.forEach(function(blossom) {
        var dx = blossom.x - x;
        var dy = blossom.y - y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 && !blossom.rotating) {
            blossom.rotating = true;
            blossom.rotationSpeed = blossom.speedIncrement;
            blossom.startTime = Date.now();
            blossom.emitMist = true;
            blossom.mistOpacity = 0;
            blossom.mistSize = 30;
            blossom.mistFadeStartTime = 0;


            setTimeout(function() {
                blossom.rotating = false;
                blossom.emitMist = false;
            }, 6000);
        }
    });
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blossoms.forEach(function(blossom) {
        blossom.update();
        blossom.draw();
    });
    requestAnimationFrame(animate);
}

function init() {
    generateBlossoms();
    animate();
}


function startAllBlossomsRotating() {
    blossoms.forEach(function(blossom) {
        if (!blossom.rotating) {
            blossom.rotating = true;
            blossom.rotationSpeed = blossom.speedIncrement;
            blossom.startTime = Date.now(); // 设置开始旋转的时间

            // 激活辉光效果
            blossom.emitMist = true;
            blossom.mistOpacity = 0;
            blossom.mistSize = 30; // 辉光大小
            blossom.mistFadeStartTime = 0; // 重置辉光动画计时器

            // 设置辉光效果在6秒后开始消失
            setTimeout(function() {
                blossom.emitMist = false;
            }, 6000);
        }
    });
}

// 确保canvas元素和按钮元素已在DOM中
document.getElementById('rotateButton').addEventListener('click', function() {
    startAllBlossomsRotating(); // 启动所有樱花的旋转和辉光效果
});

init();

var originalWidth = window.innerWidth;
var originalHeight = window.innerHeight;
window.addEventListener('resize', function() {
    adjustCanvasForHighDPI();
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;

    var widthScale = newWidth / originalWidth;
    var heightScale = newHeight / originalHeight;

    blossoms.forEach(function(blossom) {
        blossom.x *= widthScale;
        blossom.y *= heightScale;
    });

    originalWidth = newWidth;
    originalHeight = newHeight;
});
