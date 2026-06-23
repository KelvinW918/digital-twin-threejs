import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e1a);
scene.fog = new THREE.FogExp2(0x0a0e1a, 0.006);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Guardar posición original para reset view
const ORIGINAL_CAMERA_POS = { x: 14, y: 12, z: 14 };
const ORIGINAL_TARGET = { x: 0, y: 0.5, z: 0 };
camera.position.set(ORIGINAL_CAMERA_POS.x, ORIGINAL_CAMERA_POS.y, ORIGINAL_CAMERA_POS.z);
camera.lookAt(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);

// ============================================
// RENDERER - CONFIGURACIÓN CRÍTICA PARA INTERACCIÓN
// ============================================
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// IMPORTANTE: Configurar el canvas para que reciba eventos
renderer.domElement.style.display = 'block';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.touchAction = 'none';
renderer.domElement.style.pointerEvents = 'auto';

// Asegurar que el canvas está en el contenedor correcto
const container = document.getElementById('canvas-container');
if (container) {
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
} else {
    document.body.prepend(renderer.domElement);
}

// ============================================
// CONTROLES - CON INTERACCIÓN ASEGURADA
// ============================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;
controls.target.set(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);
controls.minDistance = 3;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2.1;
controls.update();

// ============================================
// LUCES MEJORADAS
// ============================================

const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.5);
directionalLight.position.set(8, 15, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 40;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.4);
fillLight1.position.set(-8, 6, -10);
scene.add(fillLight1);

const fillLight2 = new THREE.DirectionalLight(0xff8844, 0.2);
fillLight2.position.set(0, 4, -12);
scene.add(fillLight2);

const backLight = new THREE.PointLight(0x4466cc, 0.3);
backLight.position.set(-5, 6, -8);
scene.add(backLight);

const rimLight = new THREE.PointLight(0x00ff88, 0.1);
rimLight.position.set(0, 10, 0);
scene.add(rimLight);

// ============================================
// PISO MEJORADO CON REFLEXIONES
// ============================================

// Grid principal
const gridHelper = new THREE.GridHelper(22, 22, 0x00ff88, 0x2a3a4a);
gridHelper.position.y = -1.5;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.3;
scene.add(gridHelper);

// Segundo grid sutil
const gridHelper2 = new THREE.GridHelper(22, 44, 0x446688, 0x223344);
gridHelper2.position.y = -1.49;
gridHelper2.material.transparent = true;
gridHelper2.material.opacity = 0.08;
scene.add(gridHelper2);

// Plano de sombras
const floorPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ 
        opacity: 0.3, 
        color: 0x000000, 
        transparent: true, 
        side: THREE.DoubleSide 
    })
);
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.position.y = -1.5;
floorPlane.receiveShadow = true;
scene.add(floorPlane);

// ============================================
// PARTÍCULAS DE FONDO
// ============================================

const particleCount = 600;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 50;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20 + 5;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    const color = new THREE.Color().setHSL(0.5 + Math.random() * 0.2, 0.6, 0.3 + Math.random() * 0.2);
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
    
    particleSizes[i] = 0.02 + Math.random() * 0.05;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleTexture = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
})();

const particleMaterial = new THREE.PointsMaterial({
    size: 0.08,
    map: particleTexture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
    opacity: 0.5,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
particles.position.y = 0;
scene.add(particles);

// ============================================
// GENERACIÓN DE PRODUCTOS MEJORADA
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
    if (stock >= 70) return 0x34d399;
    if (stock >= 30) return 0xfbbf24;
    return 0xf87171;
};

const getEmissiveByStock = (stock) => {
    if (stock >= 70) return 0x000000;
    if (stock >= 30) return 0x442200;
    return 0x661111;
};

const getEmissiveIntensity = (stock) => {
    if (stock >= 70) return 0;
    if (stock >= 30) return 0.1;
    return 0.3 + (1 - stock / 30) * 0.3;
};

// Almacenar referencias a los racks para animaciones
const rackMeshes = [];

for (let rackX = 0; rackX < RACKS_PER_SIDE; rackX++) {
    for (let rackZ = 0; rackZ < RACKS_PER_SIDE; rackZ++) {
        const posX = START_X + rackX * RACK_SPACING;
        const posZ = START_Z + rackZ * RACK_SPACING;
        
        // Rack mejorado con bordes
        const rackStructure = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 2.8, 1.8),
            new THREE.MeshStandardMaterial({ 
                color: 0x4a5a6a, 
                roughness: 0.3, 
                metalness: 0.7,
                transparent: true,
                opacity: 0.8,
                emissive: 0x112233,
                emissiveIntensity: 0.05
            })
        );
        rackStructure.position.set(posX, 0, posZ);
        rackStructure.castShadow = true;
        rackStructure.receiveShadow = true;
        scene.add(rackStructure);
        rackMeshes.push(rackStructure);
        
        // Bordes iluminados del rack
        const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.82, 2.82, 1.82));
        const edgeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff88, 
            transparent: true, 
            opacity: 0.08 
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edges.position.copy(rackStructure.position);
        scene.add(edges);
        
        for (let level = 0; level < LEVELS; level++) {
            for (let slot = 0; slot < SLOTS_PER_LEVEL; slot++) {
                const initialStock = Math.floor(Math.random() * 101);
                
                const product = {
                    id: `R${String(rackX+1).padStart(2,'0')}-L${level+1}-P${String(slot+1).padStart(2,'0')}`,
                    rackX, rackZ, level, slot,
                    stock: initialStock,
                    mesh: null,
                    targetScale: 0.7 + (initialStock / 100) * 0.5,
                    currentScale: 0.7 + (initialStock / 100) * 0.5,
                    position: {
                        x: posX + SLOT_OFFSETS[slot],
                        y: LEVEL_HEIGHTS[level],
                        z: posZ
                    }
                };
                
                const geometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
                const material = new THREE.MeshStandardMaterial({
                    color: getColorByStock(initialStock),
                    roughness: 0.2,
                    metalness: 0.3,
                    emissive: getEmissiveByStock(initialStock),
                    emissiveIntensity: getEmissiveIntensity(initialStock),
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(product.position.x, product.position.y, product.position.z);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.userData = product;
                
                // Borde brillante para productos
                const glowEdge = new THREE.EdgesGeometry(geometry);
                const glowMaterial = new THREE.LineBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.05
                });
                const glowLines = new THREE.LineSegments(glowEdge, glowMaterial);
                cube.add(glowLines);
                
                scene.add(cube);
                product.mesh = cube;
                products.push(product);
            }
        }
    }
}

// ============================================
// ESTADÍSTICAS MEJORADAS CON BARRAS
// ============================================

function updateStats() {
    let high = 0, medium = 0, low = 0;
    
    products.forEach(p => {
        if (p.stock >= 70) high++;
        else if (p.stock >= 30) medium++;
        else low++;
    });
    
    const total = products.length;
    const fillRate = total > 0 ? Math.round((high / total) * 100) : 0;
    
    // Actualizar números
    const highEl = document.getElementById('high-count');
    const mediumEl = document.getElementById('medium-count');
    const lowEl = document.getElementById('low-count');
    const totalEl = document.getElementById('total-count');
    const fillEl = document.getElementById('fill-rate');
    const badgeEl = document.getElementById('total-badge');
    
    if (highEl) highEl.textContent = high;
    if (mediumEl) mediumEl.textContent = medium;
    if (lowEl) lowEl.textContent = low;
    if (totalEl) totalEl.textContent = total;
    if (fillEl) fillEl.textContent = fillRate + '%';
    if (badgeEl) badgeEl.textContent = total;
    
    // Actualizar barras de progreso
    const highBar = document.getElementById('high-bar');
    const mediumBar = document.getElementById('medium-bar');
    const lowBar = document.getElementById('low-bar');
    
    if (highBar) highBar.style.width = `${(high / total) * 100}%`;
    if (mediumBar) mediumBar.style.width = `${(medium / total) * 100}%`;
    if (lowBar) lowBar.style.width = `${(low / total) * 100}%`;
    
    // Actualizar timestamp
    const timestamp = document.getElementById('update-timestamp');
    if (timestamp) {
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString();
    }
}

// ============================================
// SIMULACIÓN MEJORADA CON ANIMACIONES
// ============================================

function updateStockSimulation() {
    products.forEach(product => {
        let change = Math.floor(Math.random() * 21) - 10;
        let newStock = product.stock + change;
        newStock = Math.max(0, Math.min(100, newStock));
        product.stock = newStock;
        
        const newColor = getColorByStock(product.stock);
        product.mesh.material.color.setHex(newColor);
        product.mesh.material.emissive.setHex(getEmissiveByStock(product.stock));
        product.mesh.material.emissiveIntensity = getEmissiveIntensity(product.stock);
        
        // Escala dinámica según stock
        product.targetScale = 0.6 + (newStock / 100) * 0.5;
        
        // Animación de "alerta" para bajo stock
        if (newStock < 15) {
            product.mesh.material.emissiveIntensity = 0.6 + Math.sin(Date.now() / 200) * 0.3;
        }
    });
    
    updateStats();
}

// Simulación cada 5 segundos
setInterval(updateStockSimulation, 5000);
updateStats();

// ============================================
// INTERACCIÓN MEJORADA - HOVER + CLICK
// ============================================

const tooltipDiv = document.getElementById('tooltip');
let hoveredProduct = null;

// Mouse move - Hover (usando pointermove para mejor compatibilidad)
renderer.domElement.addEventListener('pointermove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(products.map(p => p.mesh));
    
    // Resetear hover anterior
    if (hoveredProduct && hoveredProduct !== (intersects.length > 0 ? intersects[0].object : null)) {
        const prevProduct = hoveredProduct.userData;
        hoveredProduct.material.emissiveIntensity = getEmissiveIntensity(prevProduct.stock);
        hoveredProduct.scale.set(1, 1, 1);
        renderer.domElement.style.cursor = 'default';
        hoveredProduct = null;
    }
    
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const product = mesh.userData;
        
        // Efecto hover
        mesh.material.emissiveIntensity = 0.4;
        mesh.scale.set(1.1, 1.1, 1.1);
        renderer.domElement.style.cursor = 'pointer';
        hoveredProduct = mesh;
        
        // Tooltip mejorado
        const stock = Math.round(product.stock);
        let level, levelText;
        if (stock >= 70) {
            level = 'high';
            levelText = '🟢 High Stock';
        } else if (stock >= 30) {
            level = 'medium';
            levelText = '🟡 Medium Stock';
        } else {
            level = 'low';
            levelText = '🔴 Low Stock';
        }
        
        const idEl = document.getElementById('product-id');
        const stockEl = document.getElementById('product-stock');
        const levelEl = document.getElementById('product-level');
        
        if (idEl) idEl.textContent = product.id;
        if (stockEl) stockEl.textContent = `${stock}%`;
        if (levelEl) {
            levelEl.textContent = levelText;
            levelEl.setAttribute('data-level', level);
        }
        
        if (tooltipDiv) {
            tooltipDiv.style.display = 'block';
            tooltipDiv.style.left = (event.clientX + 15) + 'px';
            tooltipDiv.style.top = (event.clientY - 10) + 'px';
            tooltipDiv.classList.remove('tooltip-hidden');
        }
    } else {
        if (tooltipDiv) {
            tooltipDiv.classList.add('tooltip-hidden');
            setTimeout(() => {
                if (!hoveredProduct && tooltipDiv) {
                    tooltipDiv.style.display = 'none';
                }
            }, 200);
        }
    }
});

// Click - Selección con feedback
renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(products.map(p => p.mesh));
    
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const product = mesh.userData;
        
        // Feedback de selección - pulso
        const originalScale = mesh.scale.x;
        mesh.scale.set(1.3, 1.3, 1.3);
        mesh.material.emissiveIntensity = 0.8;
        
        setTimeout(() => {
            mesh.scale.set(originalScale, originalScale, originalScale);
            if (mesh !== hoveredProduct) {
                mesh.material.emissiveIntensity = getEmissiveIntensity(product.stock);
            }
        }, 500);
        
        // Log en consola
        console.log(`📦 Producto seleccionado: ${product.id} | Stock: ${Math.round(product.stock)}%`);
    }
});

// ============================================
// RESET VIEW BUTTON MEJORADO
// ============================================

// Eliminar botón existente si hay
const existingBtn = document.getElementById('reset-view-btn');
if (existingBtn) existingBtn.remove();

const resetButton = document.createElement('button');
resetButton.id = 'reset-view-btn';
resetButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9m0 0v6m0-6h-6"/>
    </svg>
    Reset View
`;
resetButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 24px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(10, 14, 26, 0.8);
    color: #34d399;
    border: 1px solid rgba(52, 211, 153, 0.3);
    border-radius: 8px;
    padding: 10px 18px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.3px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
`;

resetButton.onmouseenter = () => {
    resetButton.style.background = 'rgba(52, 211, 153, 0.15)';
    resetButton.style.borderColor = 'rgba(52, 211, 153, 0.6)';
    resetButton.style.transform = 'scale(1.02)';
    resetButton.style.boxShadow = '0 4px 30px rgba(52, 211, 153, 0.15)';
};
resetButton.onmouseleave = () => {
    resetButton.style.background = 'rgba(10, 14, 26, 0.8)';
    resetButton.style.borderColor = 'rgba(52, 211, 153, 0.3)';
    resetButton.style.transform = 'scale(1)';
    resetButton.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
};

resetButton.onclick = () => {
    camera.position.set(ORIGINAL_CAMERA_POS.x, ORIGINAL_CAMERA_POS.y, ORIGINAL_CAMERA_POS.z);
    controls.target.set(ORIGINAL_TARGET.x, ORIGINAL_TARGET.y, ORIGINAL_TARGET.z);
    controls.update();
    
    resetButton.style.transform = 'scale(0.9)';
    setTimeout(() => {
        resetButton.style.transform = 'scale(1)';
    }, 150);
};

document.body.appendChild(resetButton);

// ============================================
// LIVE FEED INDICATOR MEJORADO
// ============================================

// Eliminar live feed existente
const existingFeed = document.getElementById('live-feed');
if (existingFeed) existingFeed.remove();

const liveFeedIndicator = document.createElement('div');
liveFeedIndicator.id = 'live-feed';
liveFeedIndicator.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    padding: 8px 14px;
    background: rgba(52, 211, 153, 0.05);
    border: 1px solid rgba(52, 211, 153, 0.1);
    border-radius: 8px;
    font-size: 11px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const ledDot = document.createElement('span');
ledDot.style.cssText = `
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #34d399;
    box-shadow: 0 0 12px #34d399;
    animation: pulse-dot 1.5s ease-in-out infinite;
`;

const ledText = document.createElement('span');
ledText.textContent = '📡 SYSTEM LIVE · RECEIVING DATA';
ledText.style.color = '#34d399';
ledText.style.fontWeight = '400';
ledText.style.letterSpacing = '0.3px';

liveFeedIndicator.appendChild(ledDot);
liveFeedIndicator.appendChild(ledText);

// Insertar en el panel de estadísticas
const statsPanel = document.getElementById('stats-panel');
if (statsPanel) {
    statsPanel.appendChild(liveFeedIndicator);
}

// Rotación de mensajes del live feed
let feedMessages = [
    '📡 RECEIVING DATA',
    '🔄 PARSING TELEMETRY',
    '📊 UPDATING INVENTORY',
    '✅ SYNC COMPLETE',
    '📦 MONITORING STOCK',
    '⚡ REAL-TIME FEED'
];
let msgIndex = 0;
setInterval(() => {
    msgIndex = (msgIndex + 1) % feedMessages.length;
    ledText.textContent = `📡 SYSTEM LIVE · ${feedMessages[msgIndex]}`;
}, 3000);

// ============================================
// ANIMACIÓN DE PARTÍCULAS
// ============================================

let particleTime = 0;

function animateParticles() {
    particleTime += 0.001;
    const positions = particles.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(particleTime + i) * 0.0005;
        positions[i * 3] += Math.cos(particleTime * 0.5 + i * 0.01) * 0.0003;
        positions[i * 3 + 2] += Math.sin(particleTime * 0.5 + i * 0.01) * 0.0003;
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

// ============================================
// ANIMACIÓN PRINCIPAL MEJORADA
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    animateParticles();
    
    // Animar productos
    products.forEach((product, index) => {
        if (product.mesh) {
            const floatOffset = Math.sin(Date.now() / 2000 + index * 0.1) * 0.002;
            product.mesh.position.y = product.position.y + floatOffset;
            
            const currentScale = product.mesh.scale.x;
            const targetScale = product.targetScale || 0.8;
            const newScale = currentScale + (targetScale - currentScale) * 0.05;
            product.mesh.scale.set(newScale, newScale, newScale);
        }
    });
    
    // Animar racks
    rackMeshes.forEach((rack, index) => {
        const pulse = 0.85 + Math.sin(Date.now() / 3000 + index) * 0.15;
        if (rack.material) {
            rack.material.emissiveIntensity = 0.03 + (1 - pulse / 2) * 0.05;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// ============================================
// RESIZE HANDLER
// ============================================

window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ============================================
// CONSOLE LOG MEJORADO
// ============================================

console.log('🏭 Digital Twin Warehouse inicializado');
console.log(`📦 Total productos: ${products.length}`);
console.log(`✨ Partículas: ${particleCount}`);
console.log('🚀 Sistema listo para interacción');
console.log('🖱️ Click en productos para detalles');

// ============================================
// EXPOSICIÓN PARA DEBUG
// ============================================

window.__scene = scene;
window.__camera = camera;
window.__controls = controls;
window.__products = products;
window.__renderer = renderer;

console.log('🔧 Debug: window.__products disponible para inspección');
console.log('🔄 Prueba: Haz click y arrastra para rotar la vista');