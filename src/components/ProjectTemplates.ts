/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CodeFile } from '../types';

export interface ProjectTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  files: CodeFile[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'orbit-physics',
    name: 'Canvas Orbit Simulator',
    icon: 'Orbit',
    description: 'A mathematical orbit physics simulator drawing gravitational fields on HTML5 Canvas.',
    files: [
      {
        id: 'orbit-1',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background-color: #030712; color: #fff; font-family: sans-serif; overflow: hidden; }
    canvas { display: block; }
    #stats { position: absolute; top: 12px; left: 12px; background: rgba(17, 24, 39, 0.85); padding: 12px; border-radius: 8px; border: 1px solid #1f2937; pointer-events: none; }
    h3 { margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #3b82f6; }
    p { margin: 2px 0; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div id="stats">
    <h3>Gravitational System</h3>
    <p id="particle-count">Bodies: 0</p>
    <p id="fps">FPS: 60</p>
    <p>Double-click to create a heavy attractant anchor.</p>
  </div>
  <canvas id="sandboxCanvas"></canvas>
  <script src="/app.js"></script>
</body>
</html>`
      },
      {
        id: 'orbit-2',
        name: 'app.js',
        path: 'app.js',
        language: 'javascript',
        content: `// Codex High-Performance Gravity Math Core
const canvas = document.getElementById('sandboxCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let anchors = [];
let lastTime = performance.now();
let fps = 60;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Initial anchors in center
anchors.push({
  x: canvas.width / 2,
  y: canvas.height / 2,
  mass: 1200,
  color: '#3b82f6'
});

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4 + 2;
    this.vy = (Math.random() - 0.5) * 4 - 2;
    this.size = Math.random() * 2 + 1;
    this.color = \`hsl(\${Math.random() * 60 + 200}, 90%, 65%)\`;
    this.trail = [];
    this.maxTrail = 15;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();

    // Pull from all heavy gravity anchors
    for (const anchor of anchors) {
      const dx = anchor.x - this.x;
      const dy = anchor.y - this.y;
      const distSq = dx * dx + dy * dy + 100; // prevent divide by zero
      const dist = Math.sqrt(distSq);
      const force = (anchor.mass) / distSq;
      
      this.vx += (dx / dist) * force * 0.1;
      this.vy += (dy / dist) * force * 0.1;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Boundary damping bounds
    if (this.x < 0 || this.x > canvas.width) this.vx *= -0.95;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -0.95;
  }

  draw() {
    // Draw trail
    ctx.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const alpha = i / this.trail.length;
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = alpha * 0.15;
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw particle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 1;
    ctx.fill();
  }
}

// Generate stars
for (let i = 0; i < 150; i++) {
  particles.push(new Particle(
    Math.random() * canvas.width,
    Math.random() * canvas.height
  ));
}

// Interactive adding anchors
window.addEventListener('dblclick', (e) => {
  anchors.push({
    x: e.clientX,
    y: e.clientY,
    mass: 1800,
    color: '#ec4899'
  });
});

function animate() {
  const now = performance.now();
  fps = Math.round(1000 / (now - lastTime));
  lastTime = now;

  document.getElementById('particle-count').textContent = 'Bodies: ' + particles.length;
  document.getElementById('fps').textContent = 'FPS: ' + fps;

  ctx.fillStyle = 'rgba(3, 7, 18, 0.2)'; // trail backdrop
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw anchors
  for (const anchor of anchors) {
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = anchor.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = anchor.color;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }

  // Update and draw particles
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }

  requestAnimationFrame(animate);
}
animate();`
      }
    ]
  },
  {
    id: 'react-slider',
    name: '3D Carousel Banner',
    icon: 'LayoutGrid',
    description: 'A beautiful visual component using responsive transform animations and CSS grid layouts.',
    files: [
      {
        id: 'slider-1',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0c0a09; color: #f5f5f4; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; }
    .card-zoom:hover img { transform: scale(1.1); }
  </style>
</head>
<body>
  <div class="max-w-4xl w-full p-4 text-center">
    <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent mb-8">
      CODEX PRESENTATION DEEP FLOW
    </h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 p-6 card-zoom transition-all hover:border-teal-500/50 group">
        <div class="absolute top-4 right-4 bg-teal-500/10 text-teal-400 text-xs px-2.5 py-1 rounded-full border border-teal-500/20">
          Core VM
        </div>
        <h3 class="text-xl font-bold text-stone-100 mt-4 group-hover:text-teal-400 transition-colors">Codex Sandbox</h3>
        <p class="text-sm text-stone-400 mt-2">Execute multi-stack codebases inside zero-install edge processes.</p>
      </div>

      <div class="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 p-6 card-zoom transition-all hover:border-purple-500/50 group">
        <div class="absolute top-4 right-4 bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded-full border border-purple-500/20">
          Predictive
        </div>
        <h3 class="text-xl font-bold text-stone-100 mt-4 group-hover:text-purple-400 transition-colors">Ghost Completer</h3>
        <p class="text-sm text-stone-400 mt-2">Deep learning neural completion forecasts your intent inside raw text.</p>
      </div>

      <div class="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 p-6 card-zoom transition-all hover:border-pink-500/50 group">
        <div class="absolute top-4 right-4 bg-pink-500/10 text-pink-400 text-xs px-2.5 py-1 rounded-full border border-pink-500/20">
          Co-op
        </div>
        <h3 class="text-xl font-bold text-stone-100 mt-4 group-hover:text-pink-400 transition-colors">Quantum Link</h3>
        <p class="text-sm text-stone-400 mt-2">Real-time collaborative editing sessions with active typing state.</p>
      </div>
    </div>

    <!-- Active Indicator Bar -->
    <div class="mt-12 flex justify-center gap-2">
      <span class="w-8 h-1.5 rounded-full bg-teal-500"></span>
      <span class="w-2 h-1.5 rounded-full bg-stone-700"></span>
      <span class="w-2 h-1.5 rounded-full bg-stone-700"></span>
    </div>
  </div>
</body>
</html>`
      }
    ]
  }
];
