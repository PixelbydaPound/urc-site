// Star Tunnel Background Animation
// Vanilla JavaScript implementation for HTML site

class StarTunnel {
    constructor(options = {}) {
        this.speed = options.speed || 1.0;
        this.density = Math.min(Math.max(options.density || 300, 250), 600);
        this.interactive = options.interactive !== false;
        this.noise = options.noise !== false;
        
        this.canvas = document.getElementById('starTunnelCanvas');
        this.noiseCanvas = document.getElementById('noiseCanvas');
        this.ctx = null;
        this.noiseCtx = null;
        this.stars = [];
        this.animationFrame = null;
        this.mousePos = { x: 0.5, y: 0.5 };
        this.isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
        
        this.init();
    }
    
    init() {
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        if (this.noiseCanvas) {
            this.noiseCtx = this.noiseCanvas.getContext('2d');
        }
        
        this.resize();
        this.createStars();
        this.generateNoise();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        if (this.interactive && !this.isMobile) {
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        }
    }
    
    resize() {
        if (!this.canvas) return;
        
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.noiseCanvas) {
            this.noiseCanvas.width = rect.width;
            this.noiseCanvas.height = rect.height;
            if (this.noise) {
                this.generateNoise();
            }
        }
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.density; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2,
                z: Math.random(),
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.5 + 0.5,
                speed: (Math.random() * 0.003 + 0.001) * this.speed
            });
        }
    }
    
    generateNoise() {
        if (!this.noiseCanvas || !this.noiseCtx || !this.noise) return;
        
        const imageData = this.noiseCtx.createImageData(
            this.noiseCanvas.width,
            this.noiseCanvas.height
        );
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 20;
            data[i] = value;     // R
            data[i + 1] = value; // G
            data[i + 2] = value; // B
            data[i + 3] = 15;    // Alpha - very subtle
        }
        
        this.noiseCtx.putImageData(imageData, 0, 0);
    }
    
    handleMouseMove(e) {
        if (!this.interactive || this.isMobile) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = (e.clientX - rect.left) / rect.width;
        this.mousePos.y = (e.clientY - rect.top) / rect.height;
    }
    
    drawStars() {
        if (!this.ctx || !this.canvas) return;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Clear canvas with black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate parallax offset
        const parallaxX = this.interactive && !this.isMobile
            ? (this.mousePos.x - 0.5) * 0.3
            : 0;
        const parallaxY = this.interactive && !this.isMobile
            ? (this.mousePos.y - 0.5) * 0.3
            : 0;
        
        // Draw stars
        this.stars.forEach(star => {
            // Move star forward
            star.z += star.speed;
            
            // Reset star if too far
            if (star.z > 1) {
                star.z = 0;
                star.x = (Math.random() - 0.5) * 2;
                star.y = (Math.random() - 0.5) * 2;
                star.size = Math.random() * 2 + 0.5;
                star.brightness = Math.random() * 0.5 + 0.5;
            }
            
            // Calculate position with parallax
            const x = centerX + (star.x + parallaxX) * (star.z * this.canvas.width * 0.5);
            const y = centerY + (star.y + parallaxY) * (star.z * this.canvas.height * 0.5);
            
            // Calculate size and opacity
            const size = star.size * (1 - star.z) * 2;
            const opacity = star.brightness * (1 - star.z);
            
            // Fade out toward edges
            const distFromCenter = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
            );
            const maxDist = Math.sqrt(
                Math.pow(this.canvas.width / 2, 2) + Math.pow(this.canvas.height / 2, 2)
            );
            const edgeFade = Math.max(0, 1 - distFromCenter / maxDist * 1.5);
            
            const finalOpacity = opacity * edgeFade;
            const glowSize = size * 2;
            
            // Draw outer glow
            this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw main star
            this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    animate() {
        this.drawStars();
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is ready
let starTunnelInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('starTunnelCanvas')) {
        starTunnelInstance = new StarTunnel({
            speed: 0.15, // Very slow movement
            density: 300,
            interactive: true,
            noise: true
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (starTunnelInstance) {
        starTunnelInstance.destroy();
    }
});

