import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

// ======================
// CENA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.008);

// ======================
// CAMERA
// ======================
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// ======================
// RENDER
// ======================
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene"),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// ======================
// CONTROLS
// ======================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(0, 0.8, 0);

// ======================
// GRADE
// ======================
const grid = new THREE.GridHelper(30, 30, 0x00ffff, 0x003333);
grid.position.y = -1.2;
scene.add(grid);

// ======================
// HOLOGRAMA DE PONTOS
// ======================
let hologramPoints = null;
let floatingPoints = null;

// ======================
// FALLBACK: SILHUETA FEMININA PERFEITA
// ======================
function createFemaleSilhouette() {
    console.log("👩 Criando silhueta feminina holográfica...");
    
    const positions = [];
    const highlightPositions = [];
    
    // CABEÇA (formato oval)
    for (let t = 0; t < Math.PI * 2; t += 0.03) {
        const headY = 1.85;
        const headW = 0.32;
        const headH = 0.42;
        const px = Math.cos(t) * headW;
        const py = headY + Math.sin(t) * headH;
        const pz = (Math.random() - 0.5) * 0.15;
        positions.push(px, py, pz);
        
        // Pontos extras para o rosto
        if (py > 1.7 && py < 2.0 && Math.abs(px) < 0.15) {
            highlightPositions.push(px, py, pz + 0.05);
        }
    }
    
    // PESCOÇO
    for (let y = 1.45; y <= 1.7; y += 0.04) {
        const neckW = 0.18;
        for (let t = 0; t < Math.PI * 2; t += 0.15) {
            const px = Math.cos(t) * neckW;
            const py = y;
            const pz = (Math.random() - 0.5) * 0.12;
            positions.push(px, py, pz);
        }
    }
    
    // OMBROS
    for (let t = -0.8; t <= 0.8; t += 0.04) {
        const shoulderY = 1.42;
        const curve = 1 - Math.abs(t) * 0.6;
        const px = t * 0.55;
        const py = shoulderY - Math.abs(t) * 0.12;
        const pz = (Math.random() - 0.5) * 0.12;
        positions.push(px, py, pz);
        
        // Pontos de destaque nos ombros
        if (Math.abs(t) > 0.5) {
            highlightPositions.push(px, py - 0.05, pz + 0.05);
        }
    }
    
    // BRAÇOS (descendo dos ombros)
    for (let side = -1; side <= 1; side += 2) {
        for (let y = 0.9; y <= 1.38; y += 0.045) {
            const armX = side * (0.52 - (1.38 - y) * 0.2);
            const px = armX;
            const py = y;
            const pz = (Math.random() - 0.5) * 0.12;
            positions.push(px, py, pz);
        }
    }
    
    // TRONCO (corpo feminino - curvas suaves)
    for (let y = 0.4; y <= 1.4; y += 0.035) {
        // Curva de ampulheta
        let bodyW = 0.32;
        if (y < 0.9) {
            bodyW = 0.28 + (y - 0.4) * 0.15; // alargando até a cintura
        } else if (y < 1.2) {
            bodyW = 0.48 - (y - 0.9) * 0.35; // afinando na cintura
        } else {
            bodyW = 0.32 + (y - 1.2) * 0.35; // alargando para o busto
        }
        
        for (let t = 0; t < Math.PI * 2; t += 0.08) {
            const px = Math.cos(t) * bodyW;
            const py = y;
            const pz = (Math.random() - 0.5) * 0.18;
            positions.push(px, py, pz);
        }
        
        // Pontos de destaque no busto (seios)
        if (y > 1.2 && y < 1.45) {
            highlightPositions.push(0.28, y, 0.12);
            highlightPositions.push(-0.28, y, 0.12);
        }
    }
    
    // QUADRIL
    for (let y = 0.2; y <= 0.45; y += 0.04) {
        const hipW = 0.44;
        for (let t = 0; t < Math.PI * 2; t += 0.08) {
            const px = Math.cos(t) * hipW;
            const py = y;
            const pz = (Math.random() - 0.5) * 0.15;
            positions.push(px, py, pz);
        }
    }
    
    // PERNAS
    for (let leg = -1; leg <= 1; leg += 2) {
        for (let y = -0.5; y <= 0.25; y += 0.045) {
            const legX = leg * 0.16;
            const px = legX;
            const py = y;
            const pz = (Math.random() - 0.5) * 0.1;
            positions.push(px, py, pz);
        }
    }
    
    // CABELO (mais volumoso)
    for (let i = 0; i < 800; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.38 + Math.random() * 0.18;
        const yOffset = 1.75 + Math.random() * 0.55;
        const px = Math.cos(angle) * radius * (1 - (yOffset - 1.75) * 0.3);
        const py = yOffset;
        const pz = (Math.random() - 0.5) * 0.28;
        positions.push(px, py, pz);
        highlightPositions.push(px, py + 0.03, pz + 0.04);
    }
    
    // VESTIDO/SAIA (efeito fluido)
    for (let i = 0; i < 600; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.48 + Math.random() * 0.22;
        const yPos = 0.15 + Math.random() * 0.45;
        const px = Math.cos(angle) * radius * (1 - (yPos - 0.15) * 0.5);
        const py = yPos;
        const pz = (Math.random() - 0.5) * 0.22;
        positions.push(px, py, pz);
    }
    
    console.log(`✨ Silhueta criada: ${positions.length / 3} pontos principais + ${highlightPositions.length / 3} de destaque`);
    
    // Geometria principal
    const mainGeometry = new THREE.BufferGeometry();
    mainGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    
    const mainMaterial = new THREE.PointsMaterial({
        color: 0x3388ff,
        size: 0.042,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
    });
    
    const mainPoints = new THREE.Points(mainGeometry, mainMaterial);
    
    // Pontos de destaque
    let highlightPoints = null;
    if (highlightPositions.length > 0) {
        const highlightGeometry = new THREE.BufferGeometry();
        highlightGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(highlightPositions), 3));
        
        const highlightMaterial = new THREE.PointsMaterial({
            color: 0x77ccff,
            size: 0.055,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        
        highlightPoints = new THREE.Points(highlightGeometry, highlightMaterial);
    }
    
    hologramPoints = new THREE.Group();
    hologramPoints.add(mainPoints);
    if (highlightPoints) hologramPoints.add(highlightPoints);
    hologramPoints.position.y = -0.15;
    scene.add(hologramPoints);
    
    createFloatingParticles();
}

// ======================
// TENTAR CARREGAR IMAGEM OU USAR FALLBACK
// ======================
function tryLoadImageOrFallback() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "./atena.png";
    
    img.onload = () => {
        console.log("🎨 Imagem encontrada! Gerando holograma a partir dela...");
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        const mainPositions = [];
        const highlightPositions = [];
        const step = 2;
        const brightnessThreshold = 40;
        
        for (let y = 0; y < img.height; y += step) {
            for (let x = 0; x < img.width; x += step) {
                const index = (y * img.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const brightness = r + g + b;
                
                if (brightness > brightnessThreshold) {
                    const px = (x / img.width) * 5 - 2.5;
                    const py = 2.5 - (y / img.height) * 4;
                    const depthFactor = (brightness / 765) * 0.8;
                    const pz = (Math.random() - 0.5) * 0.6 + depthFactor * 0.5;
                    
                    mainPositions.push(px, py, pz);
                    
                    if (brightness > 200) {
                        for (let i = 0; i < 2; i++) {
                            highlightPositions.push(
                                px + (Math.random() - 0.5) * 0.08,
                                py + (Math.random() - 0.5) * 0.08,
                                pz + 0.1
                            );
                        }
                    }
                }
            }
        }
        
        console.log(`✨ Pontos da imagem: ${mainPositions.length / 3} principais`);
        
        if (mainPositions.length < 100) {
            console.log("⚠️ Poucos pontos detectados na imagem. Usando fallback...");
            createFemaleSilhouette();
            return;
        }
        
        if (hologramPoints) scene.remove(hologramPoints);
        
        const mainGeometry = new THREE.BufferGeometry();
        mainGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mainPositions), 3));
        
        const mainMaterial = new THREE.PointsMaterial({
            color: 0x3388ff,
            size: 0.045,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const mainPoints = new THREE.Points(mainGeometry, mainMaterial);
        
        let highlightPoints = null;
        if (highlightPositions.length > 0) {
            const highlightGeometry = new THREE.BufferGeometry();
            highlightGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(highlightPositions), 3));
            
            const highlightMaterial = new THREE.PointsMaterial({
                color: 0x88ccff,
                size: 0.06,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            
            highlightPoints = new THREE.Points(highlightGeometry, highlightMaterial);
        }
        
        hologramPoints = new THREE.Group();
        hologramPoints.add(mainPoints);
        if (highlightPoints) hologramPoints.add(highlightPoints);
        hologramPoints.position.y = -0.2;
        scene.add(hologramPoints);
        
        createFloatingParticles();
    };
    
    img.onerror = () => {
        console.log("📷 Imagem não encontrada. Usando silhueta feminina holográfica...");
        createFemaleSilhouette();
    };
}

// ======================
// PARTÍCULAS FLUTUANTES
// ======================
function createFloatingParticles() {
    if (floatingPoints) scene.remove(floatingPoints);
    
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const radius = 2.8 + Math.random() * 1.8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
        positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.7 + 0.6;
        positions[i * 3 + 2] = Math.cos(phi) * radius;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x44aaff,
        size: 0.018,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    
    floatingPoints = new THREE.Points(geometry, material);
    scene.add(floatingPoints);
}

// ======================
// RAIOS DE LUZ
// ======================
function addLightBeams() {
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x2266aa,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const beamGeometry = new THREE.PlaneGeometry(0.12, 3.8);
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(Math.cos(angle) * 1.6, 0.6, Math.sin(angle) * 1.6);
        beam.lookAt(0, 0.8, 0);
        scene.add(beam);
    }
}

// ======================
// INICIAR
// ======================
tryLoadImageOrFallback();
addLightBeams();

// ======================
// ANIMAÇÃO
// ======================
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    
    if (hologramPoints) {
        hologramPoints.rotation.y = Math.sin(time * 0.25) * 0.25;
        hologramPoints.position.y = -0.15 + Math.sin(time * 1.3) * 0.04;
    }
    
    if (floatingPoints) {
        floatingPoints.rotation.y += 0.0015;
        floatingPoints.rotation.x = Math.sin(time * 0.12) * 0.08;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// ======================
// RESPONSIVO
// ======================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("🚀 Holograma 3D carregado! Use o mouse para interagir.");