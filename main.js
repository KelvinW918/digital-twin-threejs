import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.008);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Guardar posición original para reset view
const ORIGINAL_CAMERA_POS = { x: 12, y: 10, z: 12 };
const ORIGINAL_TARGET = { x: 0, y: 0, z: 0 };
camera.position.set(ORIGINAL_CAMERA_POS.x, ORIGINAL_CAMERA_POS.y, ORIGINAL_CAMERA_POS.z);
camera.lookAt(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.5;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.target.set(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);

// ============================================
// LUCES
// ============================================

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.receiveShadow = true;
scene.add(directionalLight);

const backLight = new THREE.PointLight(0x4466cc, 0.3);
backLight.position.set(-3, 5, -5);
scene.add(backLight);

const fillLight = new THREE.PointLight(0xffaa66, 0.2);
fillLight.position.set(0, -2, 0);
scene.add(fillLight);

// ============================================
// PISO
// ============================================

const gridHelper = new THREE.GridHelper(20, 20, 0x00ff88, 0x333333);
gridHelper.position.y = -1.5;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.4;
scene.add(gridHelper);

const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ opacity: 0.4, color: 0x000000, transparent: true, side: THREE.DoubleSide })
);
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.position.y = -1.5;
floorPlane.receiveShadow = true;
scene.add(floorPlane);

// ============================================
// GENERACIÓN DE PRODUCTOS
// ============================================

const products = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const RACKS_PER_SIDE = 5;
const RACK_SPACING = 2.2;
const LEVELS = 3;
const SLOTS_PER_LEVEL = 4;

const START_X = -4.4;
const START_Z = -4.4;
const LEVEL_HEIGHTS = [-0.5, 0.6, 1.7];
const SLOT_OFFSETS = [-0.8, -0.25, 0.25, 0.8];

const getColorByStock = (stock) => {
    if (stock >= 70) return 0x00ff00;
    if (stock >= 30) return 0xffaa00;
    return 0xff3333;
};

for (let rackX = 0; rackX < RACKS_PER_SIDE; rackX++) {
    for (let rackZ = 0; rackZ < RACKS_PER_SIDE; rackZ++) {
        const posX = START_X + rackX * RACK_SPACING;
        const posZ = START_Z + rackZ * RACK_SPACING;
        
        const rackStructure = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 2.5, 1.6),
            new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.4, metalness: 0.7 })
        );
        rackStructure.position.set(posX, 0, posZ);
        rackStructure.castShadow = true;
        rackStructure.receiveShadow = true;
        scene.add(rackStructure);
        
        for (let level = 0; level < LEVELS; level++) {
            for (let slot = 0; slot < SLOTS_PER_LEVEL; slot++) {
                const initialStock = Math.floor(Math.random() * 101);
                
                const product = {
                    id: `R${rackX+1}-N${level+1}-P${slot+1}`,
                    rackX, rackZ, level, slot,
                    stock: initialStock,
                    mesh: null,
                    position: {
                        x: posX + SLOT_OFFSETS[slot],
                        y: LEVEL_HEIGHTS[level],
                        z: posZ
                    }
                };
                
                const geometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
                const material = new THREE.MeshStandardMaterial({
                    color: getColorByStock(initialStock),
                    roughness: 0.3,
                    metalness: 0.1,
                    emissive: initialStock < 30 ? 0x330000 : 0x000000
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(product.position.x, product.position.y, product.position.z);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.userData = product;
                
                scene.add(cube);
                product.mesh = cube;
                products.push(product);
            }
        }
    }
}

// ============================================
// ESTADÍSTICAS
// ============================================

function updateStats() {
    let high = 0, medium = 0, low = 0;
    
    products.forEach(p => {
        if (p.stock >= 70) high++;
        else if (p.stock >= 30) medium++;
        else low++;
    });
    
    const total = products.length;
    const fillRate = Math.round((high / total) * 100);
    
    document.getElementById('high-count').textContent = high;
    document.getElementById('medium-count').textContent = medium;
    document.getElementById('low-count').textContent = low;
    document.getElementById('total-count').textContent = total;
    document.getElementById('fill-rate').textContent = fillRate;
}

// ============================================
// SIMULACIÓN
// ============================================

function updateStockSimulation() {
    products.forEach(product => {
        let change = Math.floor(Math.random() * 21) - 10;
        let newStock = product.stock + change;
        newStock = Math.max(0, min(100, newStock));
        product.stock = newStock;
        
        const newColor = getColorByStock(product.stock);
        product.mesh.material.color.setHex(newColor);
        product.mesh.material.emissiveIntensity = product.stock < 30 ? 0.3 : 0;
    });
    
    updateStats();
}

setInterval(updateStockSimulation, 5000);
updateStats();

// ============================================
// CLICK
// ============================================

const tooltipDiv = document.getElementById('tooltip');

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(products.map(p => p.mesh));
    
    if (intersects.length > 0) {
        const product = intersects[0].object.userData;
        
        let stockLevel = '';
        if (product.stock >= 70) stockLevel = '🟢 High';
        else if (product.stock >= 30) stockLevel = '🟡 Medium';
        else stockLevel = '🔴 Low';
        
        tooltipDiv.style.display = 'block';
        tooltipDiv.style.left = (event.clientX + 15) + 'px';
        tooltipDiv.style.top = (event.clientY - 30) + 'px';
        tooltipDiv.innerHTML = `
            📦 <strong>${product.id}</strong><br>
            📊 Stock: ${product.stock}%<br>
            ${stockLevel}
        `;
        
        setTimeout(() => {
            tooltipDiv.style.display = 'none';
        }, 2000);
    }
});

// ============================================
// RESET VIEW BUTTON
// ============================================

// Crear botón de reset view
const resetButton = document.createElement('button');
resetButton.textContent = '🎥 Reset View';
resetButton.id = 'reset-view-btn';
resetButton.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff88;
    border: 1px solid #00ff88;
    border-radius: 6px;
    padding: 8px 16px;
    font-family: monospace;
    font-size: 12px;
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: all 0.2s ease;
`;

resetButton.onmouseenter = () => {
    resetButton.style.background = '#00ff88';
    resetButton.style.color = '#0a0a0a';
};
resetButton.onmouseleave = () => {
    resetButton.style.background = 'rgba(0, 0, 0, 0.8)';
    resetButton.style.color = '#00ff88';
};

resetButton.onclick = () => {
    camera.position.set(ORIGINAL_CAMERA_POS.x, ORIGINAL_CAMERA_POS.y, ORIGINAL_CAMERA_POS.z);
    controls.target.set(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);
    controls.update();
    
    // Feedback visual
    resetButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        resetButton.style.transform = 'scale(1)';
    }, 150);
};

document.body.appendChild(resetButton);

// ============================================
// LIVE FEED INDICATOR
// ============================================

// Crear indicador de live feed en el panel de estadísticas
const liveFeedIndicator = document.createElement('div');
liveFeedIndicator.id = 'live-feed';
liveFeedIndicator.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #333;
    font-size: 11px;
    font-family: monospace;
`;

const ledDot = document.createElement('span');
ledDot.style.cssText = `
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #00ff00;
    box-shadow: 0 0 5px #00ff00;
    animation: pulse 1.5s infinite;
`;

const ledText = document.createElement('span');
ledText.textContent = 'SYSTEM LIVE · RECEIVING DATA';
ledText.style.color = '#00ff88';

liveFeedIndicator.appendChild(ledDot);
liveFeedIndicator.appendChild(ledText);

// Agregar animación CSS para el parpadeo
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.8); }
        100% { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Insertar en el panel de estadísticas
const statsPanel = document.getElementById('stats-panel');
if (statsPanel) {
    statsPanel.appendChild(liveFeedIndicator);
}

// Opcional: Simular recepción de datos (cambio de texto cada 3 segundos)
let feedMessages = ['RECEIVING DATA', 'PARSING TELEMETRY', 'UPDATING INVENTORY', 'SYNC COMPLETE'];
let msgIndex = 0;
setInterval(() => {
    msgIndex = (msgIndex + 1) % feedMessages.length;
    ledText.textContent = `SYSTEM LIVE · ${feedMessages[msgIndex]}`;
}, 3000);

// ============================================
// ANIMACIÓN
// ============================================

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

console.log('✅ Digital Twin inicializado. Total productos:', products.length);