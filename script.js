// ========== TYPEWRITER EFFECT ==========
const typeText = document.getElementById('typeText');
const phrases = [
  'Android Developer',
  'Full-Stack Developer',
  'Problem Solver',
  'Tech Enthusiast'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function typeWriter() {
  const currentPhrase = phrases[phraseIndex];
  
  if (isDeleting) {
    typeText.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 50;
  } else {
    typeText.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 100;
  }
  
  if (!isDeleting && charIndex === currentPhrase.length) {
    // Pause at end
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500;
  }
  
  setTimeout(typeWriter, typeSpeed);
}

// Start typewriter effect
typeWriter();

  /* ---------- THEME TOGGLE ---------- */
  const toggle=document.getElementById("themeToggle");
  const html=document.documentElement;
  toggle.onclick=()=>{html.dataset.theme= html.dataset.theme==="dark"?"":"dark";};

  /* ---------- SCROLL REVEAL ---------- */
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("visible");});
  },{threshold:.2});
  document.querySelectorAll(".fade-up").forEach(el=>observer.observe(el));

  /* ---------- CONTACT FORM ---------- */
  document.getElementById("contactForm").addEventListener("submit",e=>{
    e.preventDefault();
    alert("Thanks for reaching out! I'll get back to you shortly.");
    e.target.reset();
  });

  /* ---------- PROJECT CARD EXPANSION ---------- */
  document.querySelectorAll(".project-details").forEach(details=>{
    details.removeAttribute("hidden");
  });

  /* ---------- DYNAMIC YEAR ---------- */
  document.getElementById("year").textContent=new Date().getFullYear();

  /* ---------- CELESTIAL SPHERE ---------- */
  class CelestialSphere {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        console.error('WebGL not supported');
        return;
      }

      // Configuration
      this.hue = options.hue || 210.0;
      this.speed = options.speed || 0.4;
      this.zoom = options.zoom || 1.2;
      this.particleSize = options.particleSize || 4.0;

      // State
      this.time = 0;
      this.mouse = { x: 0.5, y: 0.5 };
      
      this.init();
      this.addEventListeners();
      this.animate();
    }

    init() {
      const gl = this.gl;

      // Vertex shader
      const vertexShaderSource = `
        attribute vec2 a_position;
        varying vec2 vUv;
        void main() {
          vUv = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // Fragment shader
      const fragmentShaderSource = `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform float u_hue;
        uniform float u_zoom;
        uniform float u_particle_size;

        // HSL to RGB conversion
        vec3 hsl2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
        }

        // 2D Random function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // 2D Noise function
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
        }

        // Fractional Brownian Motion
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
          uv *= u_zoom;

          // Warp effect based on mouse
          vec2 mouse_normalized = u_mouse / u_resolution;
          uv += (mouse_normalized - 0.5) * 0.8;

          // Time-varying noise for nebula clouds
          float f = fbm(uv + vec2(u_time * 0.1, u_time * 0.05));
          float t = fbm(uv + f + vec2(u_time * 0.05, u_time * 0.02));
          
          // Final color calculation
          float nebula = pow(t, 2.0);
          vec3 color = hsl2rgb(vec3(u_hue / 360.0 + nebula * 0.2, 0.7, 0.5));
          color *= nebula * 2.5;

          // Starfield
          float star_val = random(vUv * 500.0);
          if (star_val > 0.998) {
            float star_brightness = (star_val - 0.998) / 0.002;
            color += vec3(star_brightness * u_particle_size);
          }

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      // Compile shaders
      const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

      // Create program
      this.program = gl.createProgram();
      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error('Program link failed:', gl.getProgramInfoLog(this.program));
        return;
      }

      gl.useProgram(this.program);

      // Create buffer with full-screen quad
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Get uniform locations
      this.uniforms = {
        u_time: gl.getUniformLocation(this.program, 'u_time'),
        u_resolution: gl.getUniformLocation(this.program, 'u_resolution'),
        u_mouse: gl.getUniformLocation(this.program, 'u_mouse'),
        u_hue: gl.getUniformLocation(this.program, 'u_hue'),
        u_zoom: gl.getUniformLocation(this.program, 'u_zoom'),
        u_particle_size: gl.getUniformLocation(this.program, 'u_particle_size'),
      };

      // Set initial uniforms
      gl.uniform1f(this.uniforms.u_hue, this.hue);
      gl.uniform1f(this.uniforms.u_zoom, this.zoom);
      gl.uniform1f(this.uniforms.u_particle_size, this.particleSize);

      this.resize();
    }

    compileShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    resize() {
      const displayWidth = this.canvas.clientWidth;
      const displayHeight = this.canvas.clientHeight;

      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        this.gl.viewport(0, 0, displayWidth, displayHeight);
        this.gl.uniform2f(this.uniforms.u_resolution, displayWidth, displayHeight);
      }
    }

    addEventListeners() {
      window.addEventListener('resize', () => this.resize());
      
      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
    }

    animate() {
      this.time += 0.005 * this.speed;

      const gl = this.gl;
      gl.uniform1f(this.uniforms.u_time, this.time);
      gl.uniform2f(this.uniforms.u_mouse, this.mouse.x, this.canvas.height - this.mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(() => this.animate());
    }
  }

  // Initialize the celestial sphere
  const canvas = document.getElementById('celestialCanvas');
  if (canvas) {
    new CelestialSphere(canvas, {
      hue: 210.0,
      speed: 0.4,
      zoom: 1.2,
      particleSize: 4.0
    });
  }

  /* ---------- SHOOTING STARS ON SECTIONS ---------- */
  class ShootingStar {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width * 0.6;
      this.y = Math.random() * this.canvas.height * 0.3;
      this.speed = 2 + Math.random() * 4;
      this.angle = Math.PI / 4;
      this.vx = Math.cos(this.angle) * this.speed;
      this.vy = Math.sin(this.angle) * this.speed;
      this.length = 60 + Math.random() * 100;
      this.opacity = 0.6 + Math.random() * 0.3;
      this.thickness = 1 + Math.random() * 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x > this.canvas.width + 100 || this.y > this.canvas.height + 100) {
        this.reset();
      }
    }

    draw(ctx) {
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;
      const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      gradient.addColorStop(0, `rgba(0, 194, 255, 0)`);
      gradient.addColorStop(0.3, `rgba(0, 194, 255, ${this.opacity * 0.2})`);
      gradient.addColorStop(0.7, `rgba(0, 194, 255, ${this.opacity * 0.6})`);
      gradient.addColorStop(1, `rgba(0, 194, 255, ${this.opacity})`);
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 194, 255, ${this.opacity})`;
      ctx.arc(this.x, this.y, this.thickness * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Initialize shooting stars on all sections
  document.querySelectorAll('.section-canvas').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;
    const rect = section.getBoundingClientRect();
    
    canvas.width = window.innerWidth;
    canvas.height = section.offsetHeight;

    const shootingStars = [];
    for (let i = 0; i < 3; i++) {
      const star = new ShootingStar(canvas);
      star.x += i * 200;
      star.y += i * 150;
      shootingStars.push(star);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shootingStars.forEach(star => {
        star.update();
        star.draw(ctx);
      });
      requestAnimationFrame(animate);
    };

    animate();

    setInterval(() => {
      if (Math.random() > 0.7 && shootingStars.length < 6) {
        shootingStars.push(new ShootingStar(canvas));
      }
    }, 2000);

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = section.offsetHeight;
    });
  });

/* ---------- CERTIFICATION CARD SPOTLIGHT EFFECT ---------- */
  /**
   * DotMatrixEffect Class
   * Creates an animated dot pattern that appears on canvas when hovering over certification cards.
   * The dots animate in a wave pattern from the center, creating a futuristic nebula-like effect.
   */
  class DotMatrixEffect {
    constructor(container, options = {}) {
      // Store reference to the container element
      this.container = container;
      // Create a canvas element programmatically
      this.canvas = document.createElement('canvas');
      // Get 2D drawing context for rendering
      this.ctx = this.canvas.getContext('2d');
      // Add canvas to the container
      this.container.appendChild(this.canvas);
      
      // Configuration options with defaults
      this.colors = options.colors || [[59, 130, 246], [139, 92, 246]]; // Blue and purple RGB values
      this.dotSize = options.dotSize || 3; // Size of each dot in pixels
      this.totalSize = options.totalSize || 4; // Grid spacing between dots
      this.animationSpeed = options.animationSpeed || 5; // How fast the animation plays
      this.opacities = options.opacities || [0.1, 0.1, 0.15, 0.15, 0.2, 0.2, 0.25, 0.3, 0.35, 0.4]; // Range of opacity values for dots
      
      // Animation state
      this.startTime = Date.now(); // Track when animation started
      this.isAnimating = false; // Whether the animation is currently running
      
      // Initialize canvas sizing and set up resize handling
      this.setupCanvas();
      this.setupResizeObserver();
    }

    /**
     * Sets up the canvas dimensions to match its container
     * Uses 2x resolution for sharper rendering on high-DPI displays
     */
    setupCanvas() {
      const rect = this.container.getBoundingClientRect();
      this.canvas.width = rect.width * 2; // Double resolution for clarity
      this.canvas.height = rect.height * 2;
      this.canvas.style.width = '100%'; // CSS fills container
      this.canvas.style.height = '100%';
    }

    /**
     * Watches for container size changes and updates canvas accordingly
     * Ensures canvas stays properly sized if window is resized
     */
    setupResizeObserver() {
      const resizeObserver = new ResizeObserver(() => {
        this.setupCanvas();
      });
      resizeObserver.observe(this.container);
    }

    /**
     * Pseudo-random number generator based on coordinates
     * Creates consistent "random" values for the same x,y position
     * This ensures dots at the same position always get the same random properties
     */
    random(x, y) {
      const PHI = 1.61803398874989484820459; // Golden ratio for better distribution
      const dx = x * PHI - x;
      const dy = y * PHI - y;
      const dist = Math.sqrt(dx * dx + dy * dy) * 0.5;
      return Math.abs(Math.sin(dist * x) * 43758.5453123) % 1; // Generate value between 0-1
    }

    /**
     * Starts the animation loop
     * Called when user hovers over the certification card
     */
    start() {
      if (this.isAnimating) return; // Don't start if already animating
      this.isAnimating = true;
      this.startTime = Date.now(); // Reset start time
      this.animate(); // Begin animation loop
    }

    /**
     * Stops the animation loop
     * Called when user stops hovering over the card
     */
    stop() {
      this.isAnimating = false;
    }

    /**
     * Main animation loop - called repeatedly via requestAnimationFrame
     * Calculates current time and triggers the draw function
     */
    animate() {
      if (!this.isAnimating) return; // Exit if animation was stopped
      
      const currentTime = (Date.now() - this.startTime) / 1000; // Convert to seconds
      this.draw(currentTime); // Draw the current frame
      
      requestAnimationFrame(() => this.animate()); // Schedule next frame
    }

    /**
     * Draws the dot matrix pattern on the canvas
     * @param {number} time - Current animation time in seconds
     * 
     * The algorithm:
     * 1. Loop through grid positions across the entire canvas
     * 2. For each position, calculate when that dot should appear (wave effect from center)
     * 3. If it's time for the dot to appear, calculate its opacity
     * 4. Draw the dot with appropriate color and opacity
     */
    draw(time) {
      const { width, height } = this.canvas;
      this.ctx.clearRect(0, 0, width, height); // Clear previous frame
      
      // Calculate center point for wave animation
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Loop through every grid position where a dot could appear
      for (let x = 0; x < width; x += this.totalSize) {
        for (let y = 0; y < height; y += this.totalSize) {
          // Get grid coordinates (used for consistent randomization)
          const gridX = Math.floor(x / this.totalSize);
          const gridY = Math.floor(y / this.totalSize);
          
          // Calculate distance from center (for wave effect)
          const dx = (x - centerX) / this.totalSize;
          const dy = (y - centerY) / this.totalSize;
          const distance = Math.sqrt(dx * dx + dy * dy) * 0.01;
          
          // Determine when this dot should start appearing
          const showOffset = this.random(gridX, gridY); // Random offset per dot
          const introOffset = distance + (showOffset * 0.15); // Dots further from center appear later
          
          // Skip if this dot hasn't started appearing yet
          if (time * this.animationSpeed < introOffset) continue;
          
          // Calculate opacity with flickering effect
          const frequency = 5.0;
          const timeIndex = Math.floor((time / frequency) + showOffset + frequency);
          const rand = this.random(gridX * timeIndex, gridY * timeIndex);
          
          // Get opacity from the array based on random value
          let opacity = this.opacities[Math.floor(rand * 10)];
          
          // Fade in effect when dot first appears
          const fadeIn = Math.min((time * this.animationSpeed - introOffset) / 0.1, 1);
          opacity *= Math.min(fadeIn * 1.25, 1.25); // Slightly boost maximum opacity
          
          // Skip if opacity is too low to be visible
          if (opacity <= 0) continue;
          
          // Select color based on position (creates gradient effect)
          const colorIndex = Math.floor(showOffset * this.colors.length);
          const color = this.colors[colorIndex];
          
          // Draw the dot
          this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
          this.ctx.fillRect(x, y, this.dotSize, this.dotSize);
        }
      }
    }
  }

  /**
   * CertificationCardSpotlight Class
   * Manages the spotlight effect for a single certification card
   * Handles mouse movement tracking and coordinates the radial gradient + dot animation
   */
  class CertificationCardSpotlight {
    constructor(cardElement) {
      // Store references to DOM elements
      this.card = cardElement;
      this.radius = 350; // Size of the spotlight circle
      
      // Create spotlight overlay element
      this.spotlightBg = document.createElement('div');
      this.spotlightBg.className = 'cert-spotlight-bg';
      this.card.appendChild(this.spotlightBg);
      
      // Create container for the canvas effect
      this.canvasContainer = document.createElement('div');
      this.canvasContainer.className = 'cert-canvas-container';
      this.spotlightBg.appendChild(this.canvasContainer);
      
      // Initialize the dot matrix animation
      this.dotMatrix = new DotMatrixEffect(this.canvasContainer, {
        colors: [[59, 130, 246], [139, 92, 246]], // Blue to purple gradient
        dotSize: 3,
        totalSize: 4,
        animationSpeed: 5,
        opacities: [0.1, 0.1, 0.15, 0.15, 0.2, 0.2, 0.25, 0.3, 0.35, 0.4]
      });
      
      // Set up mouse event listeners
      this.setupEventListeners();
    }

    /**
     * Attaches event listeners for mouse interactions
     */
    setupEventListeners() {
      // Update spotlight position as mouse moves
      this.card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      // Start animation when mouse enters card
      this.card.addEventListener('mouseenter', () => this.handleMouseEnter());
      // Stop animation when mouse leaves card
      this.card.addEventListener('mouseleave', () => this.handleMouseLeave());
    }

    /**
     * Updates the radial gradient position to follow the mouse cursor
     * @param {MouseEvent} e - The mouse move event
     */
    handleMouseMove(e) {
      // Get card position on screen
      const rect = this.card.getBoundingClientRect();
      // Calculate mouse position relative to card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create radial gradient centered on mouse position
      // Gradient goes from dark gray (#262626) at center to transparent at edges
      const gradient = `radial-gradient(${this.radius}px circle at ${x}px ${y}px, #262626, transparent 80%)`;
      this.spotlightBg.style.background = gradient;
    }

    /**
     * Starts the dot animation when hovering
     */
    handleMouseEnter() {
      this.dotMatrix.start();
    }

    /**
     * Stops the dot animation when not hovering
     */
    handleMouseLeave() {
      this.dotMatrix.stop();
    }
  }

  /**
   * Initialize spotlight effect on all certification cards
   * Loops through each card and creates a new spotlight instance
   */
  document.querySelectorAll('.certification-card').forEach(card => {
    new CertificationCardSpotlight(card);
  });

/* ---------- END OF SCRIPT ---------- */