import React, { useEffect, useRef, useState, useCallback } from "react";
import { addPropertyControls, ControlType } from "framer";

/**
 * StarTunnelBackground - A cosmic star tunnel animation component
 * Creates a hyperspace-like effect with interactive cursor parallax
 */
export default function StarTunnelBackground({
  speed = 1.0,
  density = 300,
  interactive = true,
  noise = true,
  children,
}) {
  const canvasRef = useRef(null);
  const noiseCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const starsRef = useRef([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);

  // Initialize stars
  const initStars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxStars = Math.min(Math.max(density, 250), 600);
    starsRef.current = [];

    for (let i = 0; i < maxStars; i++) {
      starsRef.current.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: Math.random(),
        size: Math.random() * 2 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        speed: (Math.random() * 0.02 + 0.01) * speed,
      });
    }
  };

  // Update canvas size
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const noiseCanvas = noiseCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (noiseCanvas) {
      noiseCanvas.width = rect.width;
      noiseCanvas.height = rect.height;
    }
  };

  // Generate noise texture
  const generateNoise = () => {
    const canvas = noiseCanvasRef.current;
    if (!canvas || !noise) return;

    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 20; // Very subtle noise
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 15; // Alpha - very subtle
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Draw stars
  const drawStars = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate parallax offset based on mouse position
    const parallaxX = interactive && !isMobile
      ? (mousePos.x - 0.5) * 0.3
      : 0;
    const parallaxY = interactive && !isMobile
      ? (mousePos.y - 0.5) * 0.3
      : 0;

    // Draw stars
    starsRef.current.forEach((star) => {
      // Move star forward
      star.z += star.speed;

      // Reset star if it's too far
      if (star.z > 1) {
        star.z = 0;
        star.x = (Math.random() - 0.5) * 2;
        star.y = (Math.random() - 0.5) * 2;
        star.size = Math.random() * 2 + 0.5;
        star.brightness = Math.random() * 0.5 + 0.5;
      }

      // Calculate position with parallax
      const x = centerX + (star.x + parallaxX) * (star.z * canvas.width * 0.5);
      const y = centerY + (star.y + parallaxY) * (star.z * canvas.height * 0.5);

      // Calculate size and opacity based on distance
      const size = star.size * (1 - star.z) * 2;
      const opacity = star.brightness * (1 - star.z);

      // Fade out toward edges
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const maxDist = Math.sqrt(
        Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
      );
      const edgeFade = Math.max(0, 1 - distFromCenter / maxDist * 1.5);

      // Draw star with glow effect
      const finalOpacity = opacity * edgeFade;
      const glowSize = size * 2;

      // Outer glow
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Main star
      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Animation loop
  const animate = () => {
    drawStars();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse move - memoized with useCallback
  const handleMouseMove = useCallback((e) => {
    if (!interactive || isMobile) return;

    const rect = canvasRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePos({ x, y });
  }, [interactive, isMobile]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize component
  useEffect(() => {
    resizeCanvas();
    initStars();
    generateNoise();
    animate();

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    
    if (interactive && !isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive && !isMobile) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, density, interactive, noise, isMobile, handleMouseMove]);

  // Regenerate stars when density changes
  useEffect(() => {
    initStars();
  }, [density]);

  // Regenerate noise when noise prop or size changes
  useEffect(() => {
    if (noise) {
      generateNoise();
    }
  }, [noise]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000000",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Star tunnel canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />

      {/* Noise overlay */}
      {noise && (
        <canvas
          ref={noiseCanvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            opacity: 0.3,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Children content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Framer Property Controls
addPropertyControls(StarTunnelBackground, {
  speed: {
    type: ControlType.Number,
    title: "Speed",
    defaultValue: 1.0,
    min: 0.1,
    max: 3.0,
    step: 0.1,
    displayStepper: true,
  },
  density: {
    type: ControlType.Number,
    title: "Star Density",
    defaultValue: 300,
    min: 250,
    max: 600,
    step: 10,
    displayStepper: true,
  },
  interactive: {
    type: ControlType.Boolean,
    title: "Interactive",
    defaultValue: true,
  },
  noise: {
    type: ControlType.Boolean,
    title: "Noise/Grain",
    defaultValue: true,
  },
  children: {
    type: ControlType.ComponentInstance,
    title: "Content",
  },
});

