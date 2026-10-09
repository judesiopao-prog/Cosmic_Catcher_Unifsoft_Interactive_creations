// ============================================================
// CANVAS & ASSETS
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const orbImage = new Image();
orbImage.src = 'coin.png';

const hazardImage = new Image();
hazardImage.src = 'asteroid.png';

// ============================================================
// DRAW / RENDERING
// ============================================================

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DRAW PLAYER (SPACESHIP)
    ctx.save();
    
    // Spaceship Hull / Body
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Nose cone (pointing up)
    ctx.moveTo(player.x + player.width / 2, player.y);
    // Bottom right wing
    ctx.lineTo(player.x + player.width, player.y + player.height);
    // Engine exhaust indentation in the center
    ctx.lineTo(player.x + player.width / 2, player.y + player.height * 0.75);
    // Bottom left wing
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Cockpit Window
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(
        player.x + player.width / 2, 
        player.y + player.height * 0.45, 
        Math.max(3, player.width * 0.12), 
        0, 
        Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    // DRAW COIN IMAGES
    collectibles.forEach((item) => {
        ctx.drawImage(
            orbImage,
            item.x - item.size / 2,
            item.y - item.size / 2,
            item.size,
            item.size
        );
    });

    // DRAW ASTEROID IMAGES
    hazards.forEach((hazard) => {
        ctx.drawImage(
            hazardImage,
            hazard.x - hazard.size / 2,
            hazard.y - hazard.size / 2,
            hazard.size,
            hazard.size
        );
    });
}
