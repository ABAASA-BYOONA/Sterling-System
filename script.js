// Sterling Dental Clinic Management System JavaScript
// Advanced functionality with 3D tooth model, charts, and dynamic content

// Global variables
let currentDate = new Date();
let currentSection = 'dashboard';
let appointmentsChart, revenueChart;
let tooth3DScene, tooth3DCamera, tooth3DRenderer, tooth3DModel;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize 3D tooth model
    init3DTooth();
    
    // Initialize charts
    initializeCharts();
    
    // Initialize calendar
    initializeCalendar();
    
    // Initialize period selectors
    initializePeriodSelectors();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize service animations
    setTimeout(() => {
        initializeServiceAnimations();
        initializeStaffAnimations();
    }, 1000); // Delay to ensure DOM is fully rendered
    
    // Load initial data
    loadDashboardData();
    
    console.log('Sterling Dental Clinic System initialized successfully!');
}

// 3D Tooth Model Implementation
function init3DTooth() {
    const container = document.getElementById('tooth3d');
    if (!container) return;
    
    // Scene setup
    tooth3DScene = new THREE.Scene();
    tooth3DCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    tooth3DRenderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    tooth3DRenderer.setSize(container.clientWidth, container.clientHeight);
    tooth3DRenderer.setClearColor(0x000000, 0);
    
    // Create tooth geometry (simplified tooth shape)
    const toothGeometry = createToothGeometry();
    
    // Create materials
    const toothMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    
    tooth3DModel = new THREE.Mesh(toothGeometry, toothMaterial);
    tooth3DScene.add(tooth3DModel);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    tooth3DScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    directionalLight.position.set(1, 1, 1);
    tooth3DScene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x7c3aed, 0.5);
    pointLight.position.set(-1, -1, 1);
    tooth3DScene.add(pointLight);
    
    // Camera position
    tooth3DCamera.position.z = 3;
    
    // Start animation
    animate3DTooth();
    
    // Handle resize
    window.addEventListener('resize', onTooth3DResize);
}

function createToothGeometry() {
    // Create a simplified tooth shape using CylinderGeometry and SphereGeometry
    const group = new THREE.Group();
    
    // Crown (main part)
    const crownGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.2, 8);
    const crown = new THREE.Mesh(crownGeometry, new THREE.MeshBasicMaterial());
    crown.position.y = 0.2;
    group.add(crown);
    
    // Root
    const rootGeometry = new THREE.CylinderGeometry(0.15, 0.25, 0.8, 6);
    const root = new THREE.Mesh(rootGeometry, new THREE.MeshBasicMaterial());
    root.position.y = -0.6;
    group.add(root);
    
    // Combine geometries
    const mergedGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    
    // Add crown vertices
    const crownVertices = crownGeometry.attributes.position.array;
    for (let i = 0; i < crownVertices.length; i += 3) {
        vertices.push(crownVertices[i], crownVertices[i + 1] + 0.2, crownVertices[i + 2]);
    }
    
    // Add root vertices
    const rootVertices = rootGeometry.attributes.position.array;
    const crownVertexCount = crownVertices.length / 3;
    for (let i = 0; i < rootVertices.length; i += 3) {
        vertices.push(rootVertices[i], rootVertices[i + 1] - 0.6, rootVertices[i + 2]);
    }
    
    // Create indices
    const crownIndices = crownGeometry.index ? crownGeometry.index.array : [];
    const rootIndices = rootGeometry.index ? rootGeometry.index.array : [];
    
    indices.push(...crownIndices);
    for (let i = 0; i < rootIndices.length; i++) {
        indices.push(rootIndices[i] + crownVertexCount);
    }
    
    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    mergedGeometry.setIndex(indices);
    mergedGeometry.computeVertexNormals();
    
    return mergedGeometry;
}

function animate3DTooth() {
    requestAnimationFrame(animate3DTooth);
    
    if (tooth3DModel) {
        tooth3DModel.rotation.y += 0.01;
        tooth3DModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    if (tooth3DRenderer && tooth3DScene && tooth3DCamera) {
        tooth3DRenderer.render(tooth3DScene, tooth3DCamera);
    }
}

function onTooth3DResize() {
    const container = document.getElementById('tooth3d');
    if (!container || !tooth3DCamera || !tooth3DRenderer) return;
    
    tooth3DCamera.aspect = container.clientWidth / container.clientHeight;
    tooth3DCamera.updateProjectionMatrix();
    tooth3DRenderer.setSize(container.clientWidth, container.clientHeight);
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        themeIcon.className = 'fas fa-moon';
    } else {
        themeIcon.className = 'fas fa-sun';
    }
    
    // Update charts with new theme
    updateChartsTheme();
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('page-title');
    pageTitle.textContent = capitalizeFirst(sectionName);
    
    currentSection = sectionName;
    
    // Load section-specific data
    loadSectionData(sectionName);
}

// Initialize Charts
function initializeCharts() {
    // Appointments Chart
    const appointmentsCtx = document.getElementById('appointmentsChart');
    if (appointmentsCtx) {
        appointmentsChart = new Chart(appointmentsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Cancelled', 'Confirmed'],
                datasets: [{
                    data: [45, 12, 3, 25],
                    backgroundColor: [
                        '#00d4ff',
                        '#ffc107',
                        '#ea5455',
                        '#28c76f'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 15000, 13000, 17000, 16000, 18000, 19000, 22000, 20000, 24000, 23000, 25000],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

// Update Charts Theme
function updateChartsTheme() {
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    
    if (appointmentsChart) {
        appointmentsChart.options.plugins.legend.labels.color = textColor;
        appointmentsChart.update();
    }
    
    if (revenueChart) {
        revenueChart.options.scales.x.ticks.color = textColor;
        revenueChart.options.scales.y.ticks.color = textColor;
        revenueChart.update();
    }
}

// Period Selector Functionality
function initializePeriodSelectors() {
    // Get all period buttons
    const periodButtons = document.querySelectorAll('.period-btn');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from siblings
            const siblings = this.parentElement.querySelectorAll('.period-btn');
            siblings.forEach(sibling => sibling.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the period and chart type
            const period = this.dataset.period;
            const chartCard = this.closest('.chart-card');
            
            if (chartCard.classList.contains('appointments-card')) {
                updateAppointmentsChart(period);
            } else if (chartCard.classList.contains('revenue-card')) {
                updateRevenueChart(period);
            }
        });
    });
}

// Update Appointments Chart based on period
function updateAppointmentsChart(period) {
    if (!appointmentsChart) return;
    
    let data, labels;
    
    switch(period) {
        case 'today':
            data = [45, 12, 3, 25];
            labels = ['Completed', 'Pending', 'Cancelled', 'Confirmed'];
            updateStatValues([45, 12, 25, 3]); // completed, pending, confirmed, cancelled
            break;
        case 'week':
            data = [165, 28, 8, 42];
            labels = ['Completed', 'Pending', 'Cancelled', 'Confirmed'];
            updateStatValues([165, 28, 42, 8]);
            break;
        case 'month':
            data = [520, 85, 15, 120];
            labels = ['Completed', 'Pending', 'Cancelled', 'Confirmed'];
            updateStatValues([520, 85, 120, 15]);
            break;
    }
    
    appointmentsChart.data.datasets[0].data = data;
    appointmentsChart.update('active');
}

// Update Revenue Chart based on period
function updateRevenueChart(period) {
    if (!revenueChart) return;
    
    let data, labels;
    
    switch(period) {
        case '6m':
            data = [18000, 19000, 22000, 20000, 24000, 25000];
            labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            updateRevenueStats('$25,000', '$24,000', '$21,000');
            break;
        case 'year':
            data = [12000, 15000, 13000, 17000, 16000, 18000, 19000, 22000, 20000, 24000, 23000, 25000];
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            updateRevenueStats('$25,000', '$23,000', '$18,500');
            break;
        case 'all':
            data = [8000, 12000, 15000, 13000, 17000, 16000, 18000, 19000, 22000, 20000, 24000, 23000, 25000, 28000, 26000];
            labels = ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
            updateRevenueStats('$25,000', '$23,000', '$19,200');
            break;
    }
    
    revenueChart.data.labels = labels;
    revenueChart.data.datasets[0].data = data;
    revenueChart.update('active');
}

// Update stat values in appointments card
function updateStatValues(values) {
    const statItems = document.querySelectorAll('.appointments-card .stat-value');
    if (statItems.length >= 4) {
        statItems[0].textContent = values[0]; // completed
        statItems[1].textContent = values[1]; // pending
        statItems[2].textContent = values[2]; // confirmed
        statItems[3].textContent = values[3]; // cancelled
    }
}

// Update revenue stats
function updateRevenueStats(thisMonth, lastMonth, average) {
    const revenueAmounts = document.querySelectorAll('.revenue-card .revenue-amount');
    if (revenueAmounts.length >= 3) {
        revenueAmounts[0].textContent = thisMonth;
        revenueAmounts[1].textContent = lastMonth;
        revenueAmounts[2].textContent = average;
    }
}

// Service Animation Variables
let serviceAnimations = {};

// Initialize Service Animations
function initializeServiceAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const canvas = card.querySelector('.service-canvas');
        const serviceType = card.dataset.service;
        
        if (canvas && serviceType) {
            serviceAnimations[serviceType] = createServiceAnimation(canvas, serviceType);
        }
    });
}

// Create specific animation for each service
function createServiceAnimation(canvas, serviceType) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Common lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x7c3aed, 0.6);
    pointLight.position.set(-2, -2, 2);
    scene.add(pointLight);
    
    let animationObjects = [];
    
    switch(serviceType) {
        case 'cleaning':
            animationObjects = createCleaningAnimation(scene);
            break;
        case 'filling':
            animationObjects = createFillingAnimation(scene);
            break;
        case 'root-canal':
            animationObjects = createRootCanalAnimation(scene);
            break;
        case 'crown':
            animationObjects = createCrownAnimation(scene);
            break;
        case 'extraction':
            animationObjects = createExtractionAnimation(scene);
            break;
        case 'whitening':
            animationObjects = createWhiteningAnimation(scene);
            break;
    }
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Animate objects based on service type
        animationObjects.forEach((obj, index) => {
            if (obj.rotation) {
                obj.rotation.x += 0.01;
                obj.rotation.y += 0.005;
            }
            
            if (obj.position) {
                obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    function onResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    window.addEventListener('resize', onResize);
    
    return { scene, camera, renderer, animationObjects };
}

// Cleaning Animation - Sparkling tooth with brush
function createCleaningAnimation(scene) {
    const objects = [];
    
    // Create tooth
    const toothGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8);
    const toothMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100
    });
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    tooth.position.set(0, 0, 0);
    scene.add(tooth);
    objects.push(tooth);
    
    // Create sparkles
    for (let i = 0; i < 15; i++) {
        const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.8
        });
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2
        );
        scene.add(sparkle);
        objects.push(sparkle);
    }
    
    return objects;
}

// Filling Animation - Tooth with filling material
function createFillingAnimation(scene) {
    const objects = [];
    
    // Create tooth with cavity
    const toothGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8);
    const toothMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5dc });
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    scene.add(tooth);
    objects.push(tooth);
    
    // Create filling material drops
    for (let i = 0; i < 8; i++) {
        const dropGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const dropMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xc0c0c0,
            metalness: 0.8,
            roughness: 0.2
        });
        const drop = new THREE.Mesh(dropGeometry, dropMaterial);
        drop.position.set(
            (Math.random() - 0.5) * 1,
            Math.random() * 2 + 1,
            (Math.random() - 0.5) * 1
        );
        scene.add(drop);
        objects.push(drop);
    }
    
    return objects;
}

// Root Canal Animation - Tooth with root system
function createRootCanalAnimation(scene) {
    const objects = [];
    
    // Create tooth crown
    const crownGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.5;
    scene.add(crown);
    objects.push(crown);
    
    // Create roots
    for (let i = 0; i < 3; i++) {
        const rootGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5, 6);
        const rootMaterial = new THREE.MeshPhongMaterial({ color: 0xf0e68c });
        const root = new THREE.Mesh(rootGeometry, rootMaterial);
        root.position.set(
            (i - 1) * 0.3,
            -0.75,
            0
        );
        root.rotation.z = (i - 1) * 0.2;
        scene.add(root);
        objects.push(root);
    }
    
    // Create infection particles
    for (let i = 0; i < 10; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4444,
            transparent: true,
            opacity: 0.6
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 1
        );
        scene.add(particle);
        objects.push(particle);
    }
    
    return objects;
}

// Crown Animation - Crown placement on tooth
function createCrownAnimation(scene) {
    const objects = [];
    
    // Create prepared tooth
    const toothGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
    const toothMaterial = new THREE.MeshPhongMaterial({ color: 0xf5deb3 });
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    tooth.position.y = -0.5;
    scene.add(tooth);
    objects.push(tooth);
    
    // Create crown
    const crownGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8);
    const crownMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 100,
        metalness: 0.1
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = 0.5;
    scene.add(crown);
    objects.push(crown);
    
    // Create golden accent
    const accentGeometry = new THREE.TorusGeometry(0.5, 0.05, 8, 16);
    const accentMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.y = 0.8;
    accent.rotation.x = Math.PI / 2;
    scene.add(accent);
    objects.push(accent);
    
    return objects;
}

// Extraction Animation - Tooth being removed
function createExtractionAnimation(scene) {
    const objects = [];
    
    // Create tooth
    const toothGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 8);
    const toothMaterial = new THREE.MeshPhongMaterial({ color: 0xfffff0 });
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    scene.add(tooth);
    objects.push(tooth);
    
    // Create extraction tool
    const toolGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const toolMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.8
    });
    const tool = new THREE.Mesh(toolGeometry, toolMaterial);
    tool.position.set(1.5, 1, 0);
    tool.rotation.z = -Math.PI / 4;
    scene.add(tool);
    objects.push(tool);
    
    // Create gum tissue
    const gumGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 8);
    const gumMaterial = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
    const gum = new THREE.Mesh(gumGeometry, gumMaterial);
    gum.position.y = -0.9;
    scene.add(gum);
    objects.push(gum);
    
    return objects;
}

// Whitening Animation - Tooth getting whiter with light rays
function createWhiteningAnimation(scene) {
    const objects = [];
    
    // Create tooth
    const toothGeometry = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 8);
    const toothMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        shininess: 200,
        transparent: true,
        opacity: 0.9
    });
    const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
    scene.add(tooth);
    objects.push(tooth);
    
    // Create light rays
    for (let i = 0; i < 12; i++) {
        const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 4);
        const rayMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.6
        });
        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        const angle = (i / 12) * Math.PI * 2;
        ray.position.set(
            Math.cos(angle) * 2,
            0,
            Math.sin(angle) * 2
        );
        ray.lookAt(0, 0, 0);
        scene.add(ray);
        objects.push(ray);
    }
    
    // Create shine effect
    const shineGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const shineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    const shine = new THREE.Mesh(shineGeometry, shineMaterial);
    scene.add(shine);
    objects.push(shine);
    
    return objects;
}

// Book Service Function
function bookService(serviceType) {
    const serviceNames = {
        'cleaning': 'Routine Cleaning',
        'filling': 'Dental Filling',
        'root-canal': 'Root Canal Treatment',
        'crown': 'Dental Crown',
        'extraction': 'Tooth Extraction',
        'whitening': 'Teeth Whitening'
    };
    
    const serviceName = serviceNames[serviceType] || 'Dental Service';
    
    // Pre-populate the appointment modal with the selected service
    const appointmentModal = document.getElementById('appointmentModal');
    const treatmentSelect = appointmentModal.querySelector('select');
    
    if (treatmentSelect) {
        // Find and select the option that matches the service
        const options = treatmentSelect.querySelectorAll('option');
        for (let option of options) {
            if (option.textContent.toLowerCase().includes(serviceType.replace('-', ' '))) {
                option.selected = true;
                break;
            }
        }
    }
    
    // Open the appointment modal
    openModal('appointmentModal');
    
    // Show confirmation notification
    showNotification(`Booking ${serviceName}. Please complete the appointment form.`, 'info');
}

// Staff Animation Variables
let staffAnimations = {};

// Initialize Staff Animations
function initializeStaffAnimations() {
    const staffCards = document.querySelectorAll('.staff-card');
    
    staffCards.forEach(card => {
        const canvas = card.querySelector('.staff-canvas');
        const staffType = card.dataset.staff;
        
        if (canvas && staffType) {
            staffAnimations[staffType] = createStaffAnimation(canvas, staffType);
        }
    });
}

// Create specific animation for each staff member
function createStaffAnimation(canvas, staffType) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Common lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.6);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x7c3aed, 0.5);
    pointLight.position.set(-3, -3, 3);
    scene.add(pointLight);
    
    const spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(0, 5, 0);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
    
    let animationObjects = [];
    
    switch(staffType) {
        case 'dr-yajnik':
            animationObjects = createDoctorAnimation(scene);
            break;
        case 'nurse-edith':
            animationObjects = createNurseAnimation(scene);
            break;
        case 'pamela':
            animationObjects = createReceptionAnimation(scene);
            break;
        case 'dr-smith':
            animationObjects = createOrthodontistAnimation(scene);
            break;
    }
    
    camera.position.z = 6;
    camera.position.y = 1;
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Animate objects based on staff type
        animationObjects.forEach((obj, index) => {
            if (obj.rotation) {
                obj.rotation.x += 0.005;
                obj.rotation.y += 0.01;
            }
            
            if (obj.position && obj.userData && obj.userData.floats) {
                obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.003;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    function onResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    window.addEventListener('resize', onResize);
    
    return { scene, camera, renderer, animationObjects };
}

// Doctor Animation - Medical tools and symbols
function createDoctorAnimation(scene) {
    const objects = [];
    
    // Create stethoscope
    const stethoscopeGroup = new THREE.Group();
    
    // Stethoscope tube
    const tubeGeometry = new THREE.TorusGeometry(1.5, 0.05, 8, 16);
    const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.rotation.x = Math.PI / 2;
    stethoscopeGroup.add(tube);
    
    // Stethoscope chest piece
    const chestGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const chestMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.2
    });
    const chestPiece = new THREE.Mesh(chestGeometry, chestMaterial);
    chestPiece.position.y = -1.5;
    stethoscopeGroup.add(chestPiece);
    
    stethoscopeGroup.position.set(0, 0, 0);
    stethoscopeGroup.userData = { floats: true };
    scene.add(stethoscopeGroup);
    objects.push(stethoscopeGroup);
    
    // Create medical cross symbols
    for (let i = 0; i < 6; i++) {
        const crossGroup = new THREE.Group();
        
        // Vertical bar
        const vBarGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.05);
        const vBarMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff });
        const vBar = new THREE.Mesh(vBarGeometry, vBarMaterial);
        crossGroup.add(vBar);
        
        // Horizontal bar
        const hBarGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.05);
        const hBarMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff });
        const hBar = new THREE.Mesh(hBarGeometry, hBarMaterial);
        crossGroup.add(hBar);
        
        const angle = (i / 6) * Math.PI * 2;
        crossGroup.position.set(
            Math.cos(angle) * 3,
            Math.sin(angle) * 2,
            Math.sin(angle) * 1
        );
        crossGroup.userData = { floats: true };
        scene.add(crossGroup);
        objects.push(crossGroup);
    }
    
    // Create medical capsules
    for (let i = 0; i < 8; i++) {
        const capsuleGroup = new THREE.Group();
        
        // Capsule body
        const bodyGeometry = new THREE.CapsuleGeometry(0.1, 0.3, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: i % 2 === 0 ? 0xff6b6b : 0x4ecdc4,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        capsuleGroup.add(body);
        
        capsuleGroup.position.set(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3
        );
        capsuleGroup.userData = { floats: true };
        scene.add(capsuleGroup);
        objects.push(capsuleGroup);
    }
    
    return objects;
}

// Nurse Animation - Care symbols and hearts
function createNurseAnimation(scene) {
    const objects = [];
    
    // Create nurse cap
    const capGroup = new THREE.Group();
    
    const capGeometry = new THREE.CylinderGeometry(0.8, 0.6, 0.2, 8);
    const capMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    
    const crossGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.05);
    const crossMaterial = new THREE.MeshPhongMaterial({ color: 0x28c76f });
    const cross1 = new THREE.Mesh(crossGeometry, crossMaterial);
    const cross2 = new THREE.Mesh(crossGeometry, crossMaterial);
    cross2.rotation.z = Math.PI / 2;
    
    capGroup.add(cap);
    capGroup.add(cross1);
    capGroup.add(cross2);
    
    capGroup.position.set(0, 1, 0);
    capGroup.userData = { floats: true };
    scene.add(capGroup);
    objects.push(capGroup);
    
    // Create heart shapes
    for (let i = 0; i < 10; i++) {
        const heartGroup = new THREE.Group();
        
        // Create heart using spheres
        const sphere1Geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const sphere2Geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const triangleGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
        
        const heartMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff69b4,
            transparent: true,
            opacity: 0.8
        });
        
        const sphere1 = new THREE.Mesh(sphere1Geometry, heartMaterial);
        const sphere2 = new THREE.Mesh(sphere2Geometry, heartMaterial);
        const triangle = new THREE.Mesh(triangleGeometry, heartMaterial);
        
        sphere1.position.set(-0.1, 0.1, 0);
        sphere2.position.set(0.1, 0.1, 0);
        triangle.position.set(0, -0.15, 0);
        triangle.rotation.z = Math.PI;
        
        heartGroup.add(sphere1);
        heartGroup.add(sphere2);
        heartGroup.add(triangle);
        
        const angle = (i / 10) * Math.PI * 2;
        heartGroup.position.set(
            Math.cos(angle) * 2.5,
            Math.sin(angle) * 2,
            Math.sin(angle * 2) * 1
        );
        heartGroup.userData = { floats: true };
        scene.add(heartGroup);
        objects.push(heartGroup);
    }
    
    // Create medical syringes
    for (let i = 0; i < 4; i++) {
        const syringeGroup = new THREE.Group();
        
        // Syringe body
        const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf0f0f0,
            transparent: true,
            opacity: 0.9
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Needle
        const needleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6);
        const needleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xc0c0c0,
            metalness: 0.8
        });
        const needle = new THREE.Mesh(needleGeometry, needleMaterial);
        needle.position.y = 0.75;
        
        syringeGroup.add(body);
        syringeGroup.add(needle);
        
        syringeGroup.position.set(
            (i - 2) * 1.5,
            -1.5,
            Math.sin(i) * 0.5
        );
        syringeGroup.rotation.z = Math.PI / 4;
        syringeGroup.userData = { floats: true };
        scene.add(syringeGroup);
        objects.push(syringeGroup);
    }
    
    return objects;
}

// Reception Animation - Communication symbols
function createReceptionAnimation(scene) {
    const objects = [];
    
    // Create phone
    const phoneGroup = new THREE.Group();
    
    const phoneBodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.1);
    const phoneBodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const phoneBody = new THREE.Mesh(phoneBodyGeometry, phoneBodyMaterial);
    
    const screenGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.02);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,
        emissive: 0x1a1a1a
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.06;
    
    phoneGroup.add(phoneBody);
    phoneGroup.add(screen);
    
    phoneGroup.position.set(0, 0, 0);
    phoneGroup.userData = { floats: true };
    scene.add(phoneGroup);
    objects.push(phoneGroup);
    
    // Create calendar pages
    for (let i = 0; i < 6; i++) {
        const calendarGroup = new THREE.Group();
        
        // Calendar base
        const baseGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        // Calendar header
        const headerGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.06);
        const headerMaterial = new THREE.MeshPhongMaterial({ color: 0xffc107 });
        const header = new THREE.Mesh(headerGeometry, headerMaterial);
        header.position.y = 0.325;
        
        calendarGroup.add(base);
        calendarGroup.add(header);
        
        const angle = (i / 6) * Math.PI * 2;
        calendarGroup.position.set(
            Math.cos(angle) * 2.5,
            Math.sin(angle) * 1.5,
            Math.cos(angle * 0.5) * 1
        );
        calendarGroup.userData = { floats: true };
        scene.add(calendarGroup);
        objects.push(calendarGroup);
    }
    
    // Create speech bubbles
    for (let i = 0; i < 8; i++) {
        const bubbleGroup = new THREE.Group();
        
        // Bubble body
        const bubbleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const bubbleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x95a5a6,
            transparent: true,
            opacity: 0.7
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        
        // Bubble tail
        const tailGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
        const tail = new THREE.Mesh(tailGeometry, bubbleMaterial);
        tail.position.set(-0.25, -0.25, 0);
        tail.rotation.z = Math.PI / 4;
        
        bubbleGroup.add(bubble);
        bubbleGroup.add(tail);
        
        bubbleGroup.position.set(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2
        );
        bubbleGroup.userData = { floats: true };
        scene.add(bubbleGroup);
        objects.push(bubbleGroup);
    }
    
    return objects;
}

// Orthodontist Animation - Braces and dental tools
function createOrthodontistAnimation(scene) {
    const objects = [];
    
    // Create dental braces
    const bracesGroup = new THREE.Group();
    
    // Upper jaw
    const upperJawGeometry = new THREE.TorusGeometry(1, 0.1, 8, 16, Math.PI);
    const jawMaterial = new THREE.MeshPhongMaterial({ color: 0xf5f5dc });
    const upperJaw = new THREE.Mesh(upperJawGeometry, jawMaterial);
    upperJaw.rotation.x = Math.PI;
    upperJaw.position.y = 0.2;
    
    // Lower jaw
    const lowerJaw = new THREE.Mesh(upperJawGeometry, jawMaterial);
    lowerJaw.position.y = -0.2;
    
    // Braces wire
    const wireGeometry = new THREE.TorusGeometry(1, 0.02, 4, 16, Math.PI);
    const wireMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xc0c0c0,
        metalness: 0.8
    });
    const upperWire = new THREE.Mesh(wireGeometry, wireMaterial);
    upperWire.rotation.x = Math.PI;
    upperWire.position.y = 0.2;
    
    const lowerWire = new THREE.Mesh(wireGeometry, wireMaterial);
    lowerWire.position.y = -0.2;
    
    bracesGroup.add(upperJaw);
    bracesGroup.add(lowerJaw);
    bracesGroup.add(upperWire);
    bracesGroup.add(lowerWire);
    
    bracesGroup.userData = { floats: true };
    scene.add(bracesGroup);
    objects.push(bracesGroup);
    
    // Create dental tools
    for (let i = 0; i < 5; i++) {
        const toolGroup = new THREE.Group();
        
        // Tool handle
        const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        
        // Tool tip
        const tipGeometry = new THREE.ConeGeometry(0.02, 0.3, 6);
        const tipMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xc0c0c0,
            metalness: 0.9
        });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.y = 0.65;
        
        toolGroup.add(handle);
        toolGroup.add(tip);
        
        const angle = (i / 5) * Math.PI * 2;
        toolGroup.position.set(
            Math.cos(angle) * 2.5,
            Math.sin(angle) * 2,
            Math.sin(angle) * 0.5
        );
        toolGroup.rotation.z = angle;
        toolGroup.userData = { floats: true };
        scene.add(toolGroup);
        objects.push(toolGroup);
    }
    
    // Create aligners
    for (let i = 0; i < 4; i++) {
        const alignerGeometry = new THREE.TorusGeometry(0.8, 0.05, 6, 12);
        const alignerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x7c3aed,
            transparent: true,
            opacity: 0.6
        });
        const aligner = new THREE.Mesh(alignerGeometry, alignerMaterial);
        
        aligner.position.set(
            (i - 2) * 1.2,
            -1.5,
            Math.sin(i * 0.5) * 0.3
        );
        aligner.rotation.x = Math.PI / 2;
        aligner.userData = { floats: true };
        scene.add(aligner);
        objects.push(aligner);
    }
    
    return objects;
}

// Staff Management Functions
function viewStaffSchedule(staffId) {
    console.log(`Viewing schedule for: ${staffId}`);
    showNotification(`Loading schedule for ${getStaffName(staffId)}...`, 'info');
    // Implement schedule view logic
}

function editStaff(staffId) {
    console.log(`Editing staff: ${staffId}`);
    showNotification(`Opening edit form for ${getStaffName(staffId)}...`, 'info');
    // Implement staff edit logic
}

function getStaffName(staffId) {
    const staffNames = {
        'dr-yajnik': 'Dr. Biren N. Yajnik',
        'nurse-edith': 'Nurse Edith',
        'pamela': 'Pamela',
        'dr-smith': 'Dr. Sarah Smith'
    };
    return staffNames[staffId] || 'Staff Member';
}

// Calendar Functions
function initializeCalendar() {
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function generateCalendar(year, month) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    
    if (!calendarGrid || !currentMonthElement) return;
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous calendar
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = '600';
        dayHeader.style.color = 'var(--text-muted)';
        dayHeader.style.padding = '10px';
        dayHeader.style.textAlign = 'center';
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if it's today
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Add some random appointments for demo
        if (Math.random() > 0.7) {
            dayElement.classList.add('has-appointment');
            dayElement.title = 'Has appointments';
        }
        
        dayElement.addEventListener('click', () => selectCalendarDay(year, month, day));
        calendarGrid.appendChild(dayElement);
    }
}

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

function selectCalendarDay(year, month, day) {
    console.log(`Selected date: ${year}-${month + 1}-${day}`);
    // Here you would typically load appointments for the selected day
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Event Listeners
function initializeEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
            event.target.style.display = 'none';
        }
    });
    
    // Search functionality
    const patientSearch = document.getElementById('patientSearch');
    if (patientSearch) {
        patientSearch.addEventListener('input', function(e) {
            searchPatients(e.target.value);
        });
    }
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal.active');
            activeModals.forEach(modal => {
                modal.classList.remove('active');
                modal.style.display = 'none';
            });
        }
    });
}

// Data Loading Functions
function loadDashboardData() {
    // Simulate loading dashboard data
    animateStatNumbers();
}

function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'appointments':
            loadAppointments();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'treatments':
            loadTreatments();
            break;
        case 'billing':
            loadBilling();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'services':
            loadServices();
            break;
        case 'communications':
            loadCommunications();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function loadAppointments() {
    console.log('Loading appointments...');
    // Implement appointment loading logic
}

function loadPatients() {
    console.log('Loading patients...');
    // Implement patient loading logic
}

function loadTreatments() {
    console.log('Loading treatments...');
    // Implement treatment loading logic
}

function loadBilling() {
    console.log('Loading billing...');
    // Implement billing loading logic
}

function loadStaff() {
    console.log('Loading staff...');
    // Implement staff loading logic
}

function loadServices() {
    console.log('Loading services...');
    // Implement services loading logic
}

function loadCommunications() {
    console.log('Loading communications...');
    // Implement communications loading logic
}

function loadReports() {
    console.log('Loading reports...');
    // Implement reports loading logic
}

// Search Functions
function searchPatients(query) {
    const tableRows = document.querySelectorAll('#patientsTableBody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(query.toLowerCase());
        row.style.display = isVisible ? '' : 'none';
    });
}

// Patient Functions
function viewPatient(patientId) {
    console.log(`Viewing patient: ${patientId}`);
    // Implement patient view logic
}

function editPatient(patientId) {
    console.log(`Editing patient: ${patientId}`);
    // Implement patient edit logic
}

// Animation Functions
function animateStatNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(element => {
        const finalValue = parseInt(element.textContent.replace(/[^\d]/g, ''));
        animateNumber(element, 0, finalValue, 1500);
    });
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const prefix = element.textContent.replace(/[\d,]/g, '');
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutQuart(progress));
        element.textContent = prefix + current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        padding: 15px 20px;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        min-width: 300px;
        box-shadow: var(--shadow-secondary);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .notification button:hover {
        color: var(--text-primary);
    }
`;
document.head.appendChild(notificationStyles);

// Demo Functions - Remove in production
function addSampleAppointment() {
    showNotification('Sample appointment added successfully!', 'success');
}

function addSamplePatient() {
    showNotification('Sample patient added successfully!', 'success');
}

// Initialize tooltips and other UI enhancements
function initializeUIEnhancements() {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add focus outlines for accessibility
    const style = document.createElement('style');
    style.textContent = `
        *:focus {
            outline: 2px solid var(--accent-color) !important;
            outline-offset: 2px !important;
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

// Call UI enhancements on load
document.addEventListener('DOMContentLoaded', initializeUIEnhancements);

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`Sterling Dental Clinic System loaded in ${Math.round(loadTime)}ms`);
});

// Export functions for global access
window.SterlingDental = {
    toggleTheme,
    toggleSidebar,
    showSection,
    openModal,
    closeModal,
    prevMonth,
    nextMonth,
    viewPatient,
    editPatient,
    showNotification
};

