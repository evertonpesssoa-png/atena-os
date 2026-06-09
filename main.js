import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";


// ======================
// CENA
// ======================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);


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
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(window.devicePixelRatio);


// ======================
// CONTROLS
// ======================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;


// ======================
// GRID
// ======================

const grid = new THREE.GridHelper(
    30,
    30,
    0x00ffff,
    0x003333
);

grid.position.y = -1.5;

scene.add(grid);


// ======================
// LUZ
// ======================

const light = new THREE.PointLight(
    0x00ffff,
    5
);

light.position.set(0, 5, 5);

scene.add(light);


// ======================
// TESTE DE CUBO
// ======================

const cubeGeometry = new THREE.BoxGeometry();

const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true
});

const cube = new THREE.Mesh(
    cubeGeometry,
    cubeMaterial
);

cube.position.y = 2;

scene.add(cube);


// ======================
// TEXTURA
// ======================

const loader = new THREE.TextureLoader();

loader.load(

    "./atena.png",

    (texture) => {

        console.log("Imagem carregada!");

        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({

            map: texture,

            transparent: true,

            side: THREE.DoubleSide,

            blending: THREE.AdditiveBlending,

            depthWrite: false
        });

        const geometry =
            new THREE.PlaneGeometry(3, 5);

        const hologram =
            new THREE.Mesh(
                geometry,
                material
            );

        hologram.position.y = 0.5;

        scene.add(hologram);


        // ======================
        // ANIMAÇÃO DO HOLOGRAMA
        // ======================

        function animateHologram(time){

            hologram.lookAt(camera.position);

            hologram.position.y =
                0.5 + Math.sin(time * 0.0015) * 0.15;
        }

        // guardar globalmente
        window.animateHologram =
            animateHologram;
    },

    undefined,

    (err) => {

        console.error(
            "ERRO AO CARREGAR:",
            err
        );
    }
);


// ======================
// PARTÍCULAS
// ======================

const particlesGeometry =
    new THREE.BufferGeometry();

const particlesCount = 2000;

const positions =
    new Float32Array(
        particlesCount * 3
    );

for(let i = 0; i < particlesCount * 3; i++){

    positions[i] =
        (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(
        positions,
        3
    )
);

const particlesMaterial =
    new THREE.PointsMaterial({

        color: 0x00ffff,

        size: 0.03,

        transparent: true,

        opacity: 0.8
    });

const particles =
    new THREE.Points(
        particlesGeometry,
        particlesMaterial
    );

scene.add(particles);


// ======================
// ANIMAÇÃO
// ======================

function animate(time){

    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    particles.rotation.y += 0.0008;

    if(window.animateHologram){

        window.animateHologram(time);
    }

    controls.update();

    renderer.render(scene, camera);
}

animate();


// ======================
// RESPONSIVO
// ======================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);