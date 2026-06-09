import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

// ======================
// CONSOLE VISUAL (mostra erros na tela)
// ======================
const consoleDiv = document.createElement('div');
consoleDiv.style.position = 'fixed';
consoleDiv.style.bottom = '10px';
consoleDiv.style.left = '10px';
consoleDiv.style.right = '10px';
consoleDiv.style.backgroundColor = 'rgba(0,0,0,0.85)';
consoleDiv.style.color = '#0f0';
consoleDiv.style.fontFamily = 'monospace';
consoleDiv.style.fontSize = '12px';
consoleDiv.style.padding = '8px';
consoleDiv.style.borderRadius = '5px';
consoleDiv.style.zIndex = '9999';
consoleDiv.style.maxHeight = '200px';
consoleDiv.style.overflow = 'auto';
consoleDiv.style.border = '1px solid #0f0';
document.body.appendChild(consoleDiv);

function logToScreen(msg, type = 'info') {
    const color = type === 'error' ? '#f00' : (type === 'success' ? '#0f0' : '#0ff');
    const div = document.createElement('div');
    div.style.color = color;
    div.style.borderBottom = '1px solid #333';
    div.style.padding = '2px 0';
    div.textContent = new Date().toLocaleTimeString() + ' | ' + msg;
    consoleDiv.appendChild(div);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
    console.log(msg);
}

// Capturar erros globais
window.onerror = function(msg, url, line, col, error) {
    logToScreen(`ERRO: ${msg} (linha ${line})`, 'error');
    return false;
};

window.onunhandledrejection = function(e) {
    logToScreen(`PROMESSA REJEITADA: ${e.reason}`, 'error');
};

logToScreen('🚀 Script iniciado - console visual ativo');

// ======================
// TESTE INICIAL
// ======================
logToScreen('📦 Importando Three.js...');

try {
    logToScreen('✅ Three.js carregado. Versão: ' + THREE.REVISION);
} catch(e) {
    logToScreen('❌ Falha ao carregar Three.js', 'error');
}

// ======================
// CRIAR CENA
// ======================
logToScreen('🎨 Criando cena...');

try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    logToScreen('✅ Cena criada');
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);
    logToScreen('✅ Câmera criada');
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    logToScreen('✅ Renderer criado e adicionado ao body');
    
    // ADICIONAR UM CUBO DE TESTE VERMELHO
    logToScreen('🔴 Criando cubo de teste...');
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5;
    scene.add(cube);
    logToScreen('✅ Cubo vermelho adicionado - você DEVERIA ver ele', 'success');
    
    // TENTAR CARREGAR IMAGEM
    logToScreen('🖼️ Tentando carregar atena.png...');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "./atena.png";
    
    img.onload = () => {
        logToScreen('✅ Imagem carregada com sucesso! ' + img.width + 'x' + img.height, 'success');
        
        // Processar imagem em pontos
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        
        const positions = [];
        let pontosContados = 0;
        
        for (let y = 0; y < img.height; y += 2) {
            for (let x = 0; x < img.width; x += 2) {
                const index = (y * img.width + x) * 4;
                const brightness = data[index] + data[index+1] + data[index+2];
                
                if (brightness > 50) {
                    const px = (x / img.width) * 5 - 2.5;
                    const py = 2.5 - (y / img.height) * 4;
                    const pz = (Math.random() - 0.5) * 0.5;
                    positions.push(px, py, pz);
                    pontosContados++;
                }
            }
        }
        
        logToScreen(`✨ ${pontosContados} pontos gerados a partir da imagem`, 'success');
        
        if (positions.length > 0) {
            const pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            
            const pointsMaterial = new THREE.PointsMaterial({
                color: 0x3399ff,
                size: 0.045,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            
            const points = new THREE.Points(pointsGeometry, pointsMaterial);
            scene.add(points);
            logToScreen('✅ Pontos adicionados à cena!', 'success');
            
            // Remover o cubo de teste
            scene.remove(cube);
        }
    };
    
    img.onerror = (err) => {
        logToScreen('❌ ERRO: Não foi possível carregar atena.png', 'error');
        logToScreen('📁 Verifique se o arquivo está na mesma pasta que index.html', 'error');
        logToScreen('📁 Nome exato do arquivo: atena.png (minúsculo?)', 'error');
        logToScreen('🔄 Usando silhueta de fallback...');
        
        // Fallback: criar uma silhueta simples
        const fallbackPos = [];
        // Cabeça
        for(let i = 0; i < 360; i++) {
            const rad = i * Math.PI / 180;
            fallbackPos.push(Math.cos(rad) * 0.4, 1.8 + Math.sin(rad) * 0.5, (Math.random() - 0.5) * 0.2);
        }
        // Corpo
        for(let y = 0; y <= 1.4; y += 0.05) {
            for(let i = 0; i < 20; i++) {
                const rad = i * Math.PI * 2 / 20;
                fallbackPos.push(Math.cos(rad) * 0.35, y, (Math.random() - 0.5) * 0.2);
            }
        }
        
        const fallbackGeo = new THREE.BufferGeometry();
        fallbackGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(fallbackPos), 3));
        const fallbackMat = new THREE.PointsMaterial({ color: 0x33aaff, size: 0.05, blending: THREE.AdditiveBlending });
        const fallbackPoints = new THREE.Points(fallbackGeo, fallbackMat);
        scene.add(fallbackPoints);
        scene.remove(cube);
        logToScreen('✅ Fallback adicionado (silhueta genérica)', 'success');
    };
    
    // ======================
    // ANIMAÇÃO
    // ======================
    let time = 0;
    let objectsToAnimate = [];
    
    function animate() {
        requestAnimationFrame(animate);
        time += 0.016;
        
        // Rotacionar todos os pontos da cena
        scene.children.forEach(child => {
            if (child.isPoints) {
                child.rotation.y = Math.sin(time * 0.2) * 0.3;
                child.position.y = Math.sin(time * 1.2) * 0.05;
            }
            if (child.isMesh && child === cube) {
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    logToScreen('🎬 Animação iniciada');
    
    // ======================
    // RESPONSIVO
    // ======================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        logToScreen('📱 Tela redimensionada');
    });
    
    logToScreen('✅ Tudo pronto! Aguardando...', 'success');
    
} catch(e) {
    logToScreen(`❌ ERRO FATAL: ${e.message}`, 'error');
    logToScreen(`📄 Stack: ${e.stack}`, 'error');
}