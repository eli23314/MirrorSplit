import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const width = 1920;
const height = 1080;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Light cream/beige background
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#faf8f3');
gradient.addColorStop(0.5, '#f5f1eb');
gradient.addColorStop(1, '#f0ebe4');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Orange accent circles (light, behind text)
ctx.fillStyle = 'rgba(255, 140, 40, 0.08)';
ctx.beginPath();
ctx.arc(200, 200, 300, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = 'rgba(255, 100, 20, 0.06)';
ctx.beginPath();
ctx.arc(width - 150, height - 150, 400, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = 'rgba(255, 150, 50, 0.07)';
ctx.beginPath();
ctx.arc(width / 2, height / 2, 350, 0, Math.PI * 2);
ctx.fill();

// Subtle gradient lines (orange accent)
ctx.strokeStyle = 'rgba(255, 120, 30, 0.05)';
ctx.lineWidth = 2;
for (let i = 0; i < 5; i++) {
  const y = (height / 5) * i;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.quadraticCurveTo(width / 2, y + 30, width, y);
  ctx.stroke();
}

// Large "MirrorSplit" text - light but visible
ctx.font = 'bold 200px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Text shadow for depth
ctx.fillStyle = 'rgba(255, 100, 20, 0.12)';
ctx.fillText('MirrorSplit', width / 2 + 4, height / 2 + 4);

// Main text (orange, more visible)
ctx.fillStyle = 'rgba(255, 100, 20, 0.25)';
ctx.fillText('MirrorSplit', width / 2, height / 2);

// Ensure directory exists
const dir = path.join(__dirname, '../public/images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Save image
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync(path.join(dir, 'bg-theme.jpg'), buffer);

console.log('✓ Background theme created: public/images/bg-theme.jpg');
