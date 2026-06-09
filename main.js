import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";


// ======================
// CENA
// ======================

const scene = new THREE.Scene();

scene.fog = new THREE.FogExp2(0x000000, 0.03);


// ======================
// CAMERA
// ======================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.5, 5);


// ======================
// RENDER
// ======================

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("scene"),
    antialias: true,
    alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);


// ======================
// CONTROLS
// ======================

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;


// ======================
// LUZ
// ======================

const light = new THREE.PointLight(0x00ffff, 4);

light.position.set(0, 3, 3);

scene.add(light);


// ======================
// CHÃO GRID
// ======================

const grid = new THREE.GridHelper(
    30,
    30,
    0x00ffff,
    0x004444
);

grid.position.y = -1.5;

scene.add(grid);


// ======================
// TEXTURA DO HOLOGRAMA
// ======================

const textureLoader = new THREE.TextureLoader();

const texture = textureLoader.load("atena.png");


// ======================
// MATERIAL
// ======================

const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});


// ======================
// PLANO DO HOLOGRAMA
// ======================

const geometry = new THREE.PlaneGeometry(2.5, 4.5);

const hologram = new THREE.Mesh(geometry, material);

hologram.position.y = 0.5;

scene.add(hologram);


// ======================
// PARTÍCULAS
// ======================

const particlesGeometry = new THREE.BufferGeometry();

const particlesCount = 2000;

const positions = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++){

    positions[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.03,
    transparent: true,
    opacity: 0.8
});

const particles = new THREE.Points(
    particlesGeometry,
    particlesMaterial
);

scene.add(particles);


// ======================
// ANIMAÇÃO
// ======================

const clock = new THREE.Clock();

function animate(){

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // flutuação holograma
    hologram.position.y =
        0.5 + Math.sin(elapsed * 1.5) * 0.1;

    // leve rotação
    hologram.rotation.y =
        Math.sin(elapsed * 0.5) * 0.08;

    // partículas
    particles.rotation.y += 0.0008;

    controls.update();

    renderer.render(scene, camera);
}

animate();


// ======================
// RESPONSIVO
// ======================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});