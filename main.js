import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

// ======================
// CONSOLE VISUAL (mostra informações na tela)
// ======================
const consoleDiv = document.createElement('div');
consoleDiv.style.position = 'fixed';
consoleDiv.style.bottom = '10px';
consoleDiv.style.left = '10px';
consoleDiv.style.right = '10px';
consoleDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
consoleDiv.style.color = '#0f0';
consoleDiv.style.fontFamily = 'monospace';
consoleDiv.style.fontSize = '11px';
consoleDiv.style.padding = '8px';
consoleDiv.style.borderRadius = '5px';
consoleDiv.style.zIndex = '9999';
consoleDiv.style.maxHeight = '150px';
consoleDiv.style.overflow = 'auto';
consoleDiv.style.border = '1px solid #0f0';
document.body.appendChild(consoleDiv);

function logToScreen(msg, type = 'info') {
    const color = type === 'error' ? '#f00' : (type === 'success' ? '#0f0' : '#0ff');
    const div = document.createElement('div');
    div.style.color = color;
    div.style.borderBottom = '1px solid #333';
    div.style.padding = '2px 0';
    div.style.fontSize = '10px';
    div.textContent = new Date().toLocaleTimeString().slice(0,8) + ' | ' + msg;
    consoleDiv.appendChild(div);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
    console.log(msg);
}

window.onerror = function(msg, url, line) {
    logToScreen(`ERRO: ${msg} (linha ${line})`, 'error');
    return false;
};

logToScreen('🚀 Holograma iniciado!', 'success');

// ======================
// CENA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000000, 0.003);
logToScreen('✅ Cena criada');

// ======================
// CÂMERA (posição ideal para ver o holograma)
// ======================
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.2, 4.5);
camera.lookAt(0, 1, 0);
logToScreen('✅ Câmera posicionada');

// ======================
// RENDERER
// ======================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
logToScreen('✅ Renderer criado');

// ======================
// CONTROLES (permite navegar com o mouse/dedo)
// ======================
import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.enableZoom = true;
controls.enablePan = true;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 1.0;
controls.target.set(0, 1, 0);
logToScreen('✅ Controles ativados (use o dedo/mouse para navegar!)', 'success');

// ======================
// GRADE DE REFERÊNCIA (opcional, ajuda a ver o chão)
// ======================
const gridHelper = new THREE.GridHelper(8, 20, 0x2266aa, 0x114466);
gridHelper.position.y = -0.8;
scene.add(gridHelper);

// ======================
// CARREGAR IMAGEM E CRIAR HOLOGRAMA
// ======================
logToScreen('📷 Carregando atena.png...');

const img = new Image();
img.crossOrigin = "Anonymous";
img.src = "./atena.png";

img.onload = () => {
    logToScreen(`✅ Imagem carregada: ${img.width}x${img.height}`, 'success');
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    
    const positions = [];
    const step = 3;  // ← AJUSTE AQUI: 2=detalhado, 3=balanceado, 4=espaçado
    
    for (let y = 0; y < img.height; y += step) {
        for (let x = 0; x < img.width; x += step) {
            const index = (y * img.width + x) * 4;
            const r = data[index];
            const g = data[index+1];
            const b = data[index+2];
            const brightness = r + g + b;
            
            // Só pega pixels claros (ignora fundo escuro)
            if (brightness > 80) {
                // Mapeia posição X (largura da imagem → largura do holograma)
                const px = (x / img.width) * 4.5 - 2.25;
                // Mapeia posição Y (altura da imagem → altura do holograma)
                const py = 2.2 - (y / img.height) * 3.8;
                // Profundidade aleatória pequena (dá volume)
                const pz = (Math.random() - 0.5) * 0.35;
                positions.push(px, py, pz);
            }
        }
    }
    
    logToScreen(`✨ ${(positions.length / 3).toLocaleString()} pontos gerados`, 'success');
    
    // Geometria dos pontos
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    
    // Material do holograma (azul brilhante)
    const material = new THREE.PointsMaterial({
        color: 0x3399ff,
        size: 0.055,        // ← AJUSTE AQUI: tamanho dos pontos
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const hologram = new THREE.Points(geometry, material);
    scene.add(hologram);
    
    logToScreen('✅ Holograma criado! Use o dedo para girar e zoom', 'success');
    
    // ======================
    // PARTÍCULAS FLUTUANTES (efeito mágico)
    // ======================
    const floatingCount = 1200;
    const floatingPos = [];
    for (let i = 0; i < floatingCount; i++) {
        floatingPos.push((Math.random() - 0.5) * 7);
        floatingPos.push((Math.random() - 0.5) * 4 + 0.5);
        floatingPos.push((Math.random() - 0.5) * 5);
    }
    const floatingGeo = new THREE.BufferGeometry();
    floatingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(floatingPos), 3));
    const floatingMat = new THREE.PointsMaterial({
        color: 0x66ccff,
        size: 0.025,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const floatingPoints = new THREE.Points(floatingGeo, floatingMat);
    scene.add(floatingPoints);
    logToScreen('✨ Partículas flutuantes adicionadas', 'success');
    
    // ======================
    // ANIMAÇÃO
    // ======================
    let time = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;
        
        // Movimento suave do holograma (flutua)
        hologram.rotation.y = Math.sin(time * 0.15) * 0.1;
        hologram.position.y = Math.sin(time * 0.8) * 0.02;
        
        // Partículas flutuantes giram lentamente
        floatingPoints.rotation.y += 0.0015;
        floatingPoints.rotation.x = Math.sin(time * 0.1) * 0.05;
        
        // Atualiza controles e renderiza
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
    logToScreen('🎬 Animação rodando!', 'success');
};

img.onerror = () => {
    logToScreen('❌ ERRO: Imagem atena.png não encontrada!', 'error');
    logToScreen('📁 Verifique se o arquivo está na mesma pasta', 'error');
};

// ======================
// AJUSTAR TAMANHO DA TELA
// ======================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    logToScreen('📱 Tela redimensionada');
});