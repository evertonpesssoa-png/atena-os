import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

console.log("Script iniciado");

// Criar cena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Criar camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Criar renderer e adicionar ao body
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // ← CRIA O CANVAS AUTOMATICAMENTE

// SILHUETA FEMININA SIMPLES (QUE FUNCIONA)
const positions = [];

// Cabeça
for(let i = 0; i < 360; i++) {
    const rad = i * Math.PI / 180;
    positions.push(Math.cos(rad) * 0.4, 1.8 + Math.sin(rad) * 0.5, (Math.random() - 0.5) * 0.2);
}

// Corpo
for(let y = 0; y <= 1.4; y += 0.05) {
    const width = 0.35;
    for(let i = 0; i < 20; i++) {
        const rad = i * Math.PI * 2 / 20;
        positions.push(Math.cos(rad) * width, y, (Math.random() - 0.5) * 0.2);
    }
}

// Braços
for(let side = -1; side <= 1; side += 2) {
    for(let y = 0.9; y <= 1.4; y += 0.08) {
        positions.push(side * 0.55, y, (Math.random() - 0.5) * 0.15);
    }
}

// Cabelo
for(let i = 0; i < 500; i++) {
    const ang = Math.random() * Math.PI * 2;
    const raio = 0.45 + Math.random() * 0.2;
    positions.push(Math.cos(ang) * raio, 1.9 + Math.random() * 0.4, (Math.random() - 0.5) * 0.25);
}

// Geometria dos pontos
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

// Material azul brilhante (efeito holograma)
const material = new THREE.PointsMaterial({
    color: 0x00aaff,
    size: 0.05,
    transparent: true,
    blending: THREE.AdditiveBlending
});

const pontos = new THREE.Points(geometry, material);
scene.add(pontos);

// Partículas flutuantes
const floatingCount = 1000;
const floatingPos = [];
for(let i = 0; i < floatingCount; i++) {
    floatingPos.push((Math.random() - 0.5) * 8);
    floatingPos.push((Math.random() - 0.5) * 4 + 0.5);
    floatingPos.push((Math.random() - 0.5) * 5);
}
const floatingGeo = new THREE.BufferGeometry();
floatingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(floatingPos), 3));
const floatingMat = new THREE.PointsMaterial({
    color: 0x44ccff,
    size: 0.02,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending
});
const flutuantes = new THREE.Points(floatingGeo, floatingMat);
scene.add(flutuantes);

// Animação
function animate() {
    requestAnimationFrame(animate);
    pontos.rotation.y += 0.005;
    pontos.position.y = Math.sin(Date.now() * 0.0015) * 0.03;
    flutuantes.rotation.y += 0.001;
    flutuantes.rotation.x = Math.sin(Date.now() * 0.0008) * 0.1;
    renderer.render(scene, camera);
}
animate();

// Ajustar tamanho da tela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});