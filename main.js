import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

// ======================
// CENA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.008); // névoa sutil pra dar profundidade

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
controls.autoRotateSpeed = 1.5;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(0, 0.5, 0);

// ======================
// GRADE (OPCIONAL - COMENTE SE QUISER SÓ OS PONTOS)
// ======================
const grid = new THREE.GridHelper(30, 30, 0x00ffff, 0x003333);
grid.position.y = -1.5;
scene.add(grid);

// ======================
// HOLOGRAMA DE PONTOS (BASEADO NA IMAGEM)
// ======================
let hologramPoints = null;
let floatingPoints = null; // pontos extras flutuantes

function createHologramFromImage(imageUrl) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
        console.log("🎨 Gerando holograma de pontos a partir da imagem...");
        
        // Configurar canvas para ler pixels
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Ler os pixels
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        // Arrays para diferentes cores (simulando profundidade)
        const mainPositions = [];
        const highlightPositions = [];
        
        const step = 2; // Qualidade vs performance (1 = máximo, 2 = bom, 3 = rápido)
        const brightnessThreshold = 40;
        
        for (let y = 0; y < img.height; y += step) {
            for (let x = 0; x < img.width; x += step) {
                const index = (y * img.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const brightness = r + g + b;
                
                if (brightness > brightnessThreshold) {
                    // Mapeia coordenadas da imagem para o mundo 3D
                    const px = (x / img.width) * 5 - 2.5; // -2.5 a 2.5
                    const py = 2.5 - (y / img.height) * 4; // 2.5 a -1.5
                    
                    // Profundidade baseada no brilho (mais brilhante = mais próximo)
                    const depthFactor = (brightness / 765) * 0.8;
                    const pz = (Math.random() - 0.5) * 0.6 + depthFactor * 0.5;
                    
                    mainPositions.push(px, py, pz);
                    
                    // Pontos especiais para áreas mais brilhantes (cabelo, olhos, etc)
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
        
        console.log(`✨ Pontos gerados: ${mainPositions.length / 3} principais + ${highlightPositions.length / 3} de destaque`);
        
        // Remover pontos antigos se existirem
        if (hologramPoints) scene.remove(hologramPoints);
        
        // Criar geometria principal
        const mainGeometry = new THREE.BufferGeometry();
        mainGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mainPositions), 3));
        
        // Material principal (azul holográfico)
        const mainMaterial = new THREE.PointsMaterial({
            color: 0x3388ff,
            size: 0.045,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const mainPoints = new THREE.Points(mainGeometry, mainMaterial);
        
        // Criar pontos de destaque (mais brilhantes)
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
        
        // Agrupar todos os pontos
        hologramPoints = new THREE.Group();
        hologramPoints.add(mainPoints);
        if (highlightPoints) hologramPoints.add(highlightPoints);
        
        hologramPoints.position.y = -0.2;
        scene.add(hologramPoints);
        
        // Adicionar pontos flutuantes ao redor (efeito de partículas holográficas)
        createFloatingParticles();
    };
    
    img.onerror = () => {
        console.error("❌ Erro ao carregar a imagem. Verifique o caminho: " + imageUrl);
        createFallbackHologram(); // Cria um holograma exemplo se a imagem não carregar
    };
}

// ======================
// PARTÍCULAS FLUTUANTES (EFEITO HOLOGRAMA)
// ======================
function createFloatingParticles() {
    if (floatingPoints) scene.remove(floatingPoints);
    
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        // Distribuição esférica ao redor da área do holograma
        const radius = 2.5 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
        positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.8 + 0.5;
        positions[i * 3 + 2] = Math.cos(phi) * radius;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x44aaff,
        size: 0.02,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    
    floatingPoints = new THREE.Points(geometry, material);
    scene.add(floatingPoints);
}

// ======================
// HOLOGRAMA FALLBACK (SE IMAGEM NÃO CARREGAR)
// ======================
function createFallbackHologram() {
    console.log("🔄 Criando holograma exemplo (formato feminino)");
    
    const positions = [];
    
    // Criar uma silhueta feminina procedural (contorno simples)
    for (let t = 0; t < Math.PI * 2; t += 0.05) {
        // Cabeça
        const headY = 1.8;
        const headR = 0.35;
        positions.push(Math.cos(t) * headR, headY + Math.sin(t) * headR * 1.2, (Math.random() - 0.5) * 0.3);
        
        // Corpo (formato ampulheta)
        for (let y = -0.5; y <= 1.3; y += 0.08) {
            const bodyWidth = 0.4 * (1 - Math.abs(y - 0.4) / 1.2);
            positions.push(Math.cos(t) * bodyWidth, y + 0.3, (Math.random() - 0.5) * 0.25);
        }
        
        // Cabelo (parte superior)
        for (let i = 0; i < 15; i++) {
            const angle = t + i * 0.2;
            const radius = 0.45 + Math.random() * 0.15;
            positions.push(Math.cos(angle) * radius, 1.9 + Math.random() * 0.3, (Math.random() - 0.5) * 0.35);
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x33aaff,
        size: 0.045,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    hologramPoints = new THREE.Points(geometry, material);
    hologramPoints.position.y = -0.3;
    scene.add(hologramPoints);
    
    createFloatingParticles();
}

// ======================
// RAIOS DE LUZ HOLOGRÁFICOS (OPCIONAL)
// ======================
function addLightBeams() {
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x2266aa,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const beamGeometry = new THREE.PlaneGeometry(0.15, 4);
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(Math.cos(angle) * 1.8, 0.5, Math.sin(angle) * 1.8);
        beam.lookAt(0, 0.5, 0);
        scene.add(beam);
    }
}

// ======================
// INICIAR HOLOGRAMA
// ======================
createHologramFromImage("./atena.png");
addLightBeams();

// ======================
// ANIMAÇÃO PRINCIPAL
// ======================
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    
    // Rotação suave do holograma
    if (hologramPoints) {
        hologramPoints.rotation.y = Math.sin(time * 0.2) * 0.3;
        hologramPoints.position.y = -0.2 + Math.sin(time * 1.2) * 0.05;
    }
    
    // Partículas flutuantes
    if (floatingPoints) {
        floatingPoints.rotation.y += 0.002;
        floatingPoints.rotation.x = Math.sin(time * 0.15) * 0.1;
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

console.log("🚀 Holograma 3D carregado! Use o mouse para girar a visualização.");