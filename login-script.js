// Sterling Dental Clinic - Login Page JavaScript

// Valid login credentials
const VALID_CREDENTIALS = {
    username: 'sterlingdentalclinic',
    password: 'rootcanal'
};

// DOM elements
let loginForm;
let usernameInput;
let passwordInput;
let passwordToggleIcon;
let loginButton;
let errorMessage;
let btnText;
let btnLoader;
let rememberMeCheckbox;

// 3D Background Animation
let scene, camera, renderer;
let particles = [];
let mouseX = 0, mouseY = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    initializeBackground();
    checkRememberedUser();
    
    console.log('Sterling Dental Login System initialized');
});

// Initialize DOM elements
function initializeElements() {
    loginForm = document.getElementById('loginForm');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    passwordToggleIcon = document.getElementById('passwordToggleIcon');
    loginButton = document.querySelector('.login-btn');
    errorMessage = document.getElementById('errorMessage');
    btnText = document.querySelector('.btn-text');
    btnLoader = document.querySelector('.btn-loader');
    rememberMeCheckbox = document.getElementById('rememberMe');
}

// Initialize event listeners
function initializeEventListeners() {
    // Form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Input field events
    usernameInput.addEventListener('input', clearErrorMessage);
    passwordInput.addEventListener('input', clearErrorMessage);
    
    // Enter key support
    usernameInput.addEventListener('keypress', handleEnterKey);
    passwordInput.addEventListener('keypress', handleEnterKey);
    
    // Mouse movement for background animation
    document.addEventListener('mousemove', onMouseMove);
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize);
    
    // Prevent context menu on canvas
    const canvas = document.getElementById('backgroundCanvas');
    if (canvas) {
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Clear any existing error messages
    clearErrorMessage();
    
    // Validate inputs
    if (!username || !password) {
        showErrorMessage('Please enter both username and password');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check credentials
        if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
            // Successful login
            handleSuccessfulLogin();
        } else {
            // Failed login
            handleFailedLogin();
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('An error occurred during login. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Handle successful login
function handleSuccessfulLogin() {
    // Store authentication status
    sessionStorage.setItem('sterling_authenticated', 'true');
    sessionStorage.setItem('sterling_login_time', Date.now().toString());
    
    // Store remember me preference
    if (rememberMeCheckbox.checked) {
        localStorage.setItem('sterling_remember_user', 'true');
        localStorage.setItem('sterling_username', usernameInput.value.trim());
    } else {
        localStorage.removeItem('sterling_remember_user');
        localStorage.removeItem('sterling_username');
    }
    
    // Show success feedback
    showSuccessMessage('Login successful! Redirecting...');
    
    // Redirect to main application
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Handle failed login
function handleFailedLogin() {
    showErrorMessage('Invalid username or password');
    
    // Clear password field
    passwordInput.value = '';
    passwordInput.focus();
    
    // Add shake animation to the form
    loginForm.style.animation = 'none';
    loginForm.offsetHeight; // Trigger reflow
    loginForm.style.animation = 'shake 0.5s ease-in-out';
}

// Set loading state
function setLoadingState(isLoading) {
    loginButton.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        loginButton.style.cursor = 'not-allowed';
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        loginButton.style.cursor = 'pointer';
    }
}

// Show error message
function showErrorMessage(message) {
    errorMessage.querySelector('span').textContent = message;
    errorMessage.style.display = 'flex';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        clearErrorMessage();
    }, 5000);
}

// Show success message
function showSuccessMessage(message) {
    // Create or update success message element
    let successMessage = document.getElementById('successMessage');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'successMessage';
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span></span>
        `;
        
        // Add success message styles
        successMessage.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 8px;
            color: #10b981;
            font-size: 14px;
            margin-top: 15px;
        `;
        
        loginForm.appendChild(successMessage);
    }
    
    successMessage.querySelector('span').textContent = message;
    successMessage.style.display = 'flex';
}

// Clear error message
function clearErrorMessage() {
    errorMessage.style.display = 'none';
}

// Handle Enter key press
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        if (event.target === usernameInput && passwordInput.value === '') {
            passwordInput.focus();
        } else {
            handleLogin(event);
        }
    }
}

// Toggle password visibility
function togglePassword() {
    const isPassword = passwordInput.type === 'password';
    
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggleIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    
    // Keep focus on password input
    passwordInput.focus();
}

// Check for remembered user
function checkRememberedUser() {
    const rememberUser = localStorage.getItem('sterling_remember_user');
    const rememberedUsername = localStorage.getItem('sterling_username');
    
    if (rememberUser === 'true' && rememberedUsername) {
        usernameInput.value = rememberedUsername;
        rememberMeCheckbox.checked = true;
        passwordInput.focus();
    } else {
        usernameInput.focus();
    }
}

// Check if user is already authenticated
function checkExistingAuth() {
    const isAuthenticated = sessionStorage.getItem('sterling_authenticated');
    const loginTime = sessionStorage.getItem('sterling_login_time');
    
    if (isAuthenticated === 'true' && loginTime) {
        // Check if session is still valid (24 hours)
        const currentTime = Date.now();
        const sessionDuration = currentTime - parseInt(loginTime);
        const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionDuration < maxSessionDuration) {
            // Redirect to main application
            window.location.href = 'index.html';
            return true;
        } else {
            // Clear expired session
            sessionStorage.removeItem('sterling_authenticated');
            sessionStorage.removeItem('sterling_login_time');
        }
    }
    
    return false;
}

// Initialize 3D background animation
function initializeBackground() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) return;
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    // Create particles
    createParticles();
    
    // Position camera
    camera.position.z = 1000;
    
    // Start animation loop
    animate();
}

// Create floating particles
function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 1000;
        
        // Color (cyan to purple gradient)
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
            // Cyan
            colors[i3] = 0.0;     // R
            colors[i3 + 1] = 0.83; // G
            colors[i3 + 2] = 1.0;  // B
        } else {
            // Purple
            colors[i3] = 0.49;     // R
            colors[i3 + 1] = 0.23; // G
            colors[i3 + 2] = 0.93; // B
        }
        
        // Size
        sizes[i] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material
    const material = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    // Create particles system
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    particles.push(particleSystem);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles
    particles.forEach((particle, index) => {
        particle.rotation.x += 0.001;
        particle.rotation.y += 0.002;
        
        // Mouse interaction
        particle.rotation.x += mouseY * 0.00001;
        particle.rotation.y += mouseX * 0.00001;
    });
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle mouse movement
function onMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
}

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add input validation
function validateInput(input, type) {
    const value = input.value.trim();
    
    switch (type) {
        case 'username':
            return value.length >= 3;
        case 'password':
            return value.length >= 6;
        default:
            return value.length > 0;
    }
}

// Enhanced error handling
window.addEventListener('error', function(event) {
    console.error('Login page error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Login page unhandled promise rejection:', event.reason);
});

// Check authentication on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay to prevent flash
        setTimeout(checkExistingAuth, 100);
    });
} else {
    setTimeout(checkExistingAuth, 100);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogin,
        validateInput,
        togglePassword
    };
}

console.log('Sterling Dental Login System loaded successfully!');

