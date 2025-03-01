// Get all parallax elements and the main container
const parallax_el = document.querySelectorAll(".parallax");
const main = document.querySelector("main");
const bgImage = document.querySelector(".bg-img");

// Variables for tracking mouse/touch position
let xValue = 0;
let yValue = 0;
let rotateDegree = 0;
let isMobile = false;

// Check if device is mobile
function checkMobile() {
  isMobile = window.innerWidth <= 768 || 
             ('ontouchstart' in window) || 
             navigator.maxTouchPoints > 0;
  
  // Apply specific optimizations for mobile
  if (isMobile) {
    // Apply mobile-specific styles to fix white space and improve appearance
    document.body.classList.add('mobile-view');
    
    // Adjust each parallax element for mobile
    parallax_el.forEach(el => {
      // Store original positions for desktop mode
      if (!el.dataset.originalLeft && el.style.left) {
        el.dataset.originalLeft = el.style.left;
      }
      
      // Adjust speed for mobile
      const currentSpeedX = parseFloat(el.dataset.speedx || 0);
      const currentSpeedY = parseFloat(el.dataset.speedy || 0);
      
      if (!el.dataset.originalSpeedx) {
        el.dataset.originalSpeedx = currentSpeedX;
        el.dataset.originalSpeedy = currentSpeedY;
      }
      
      // Apply reduced speeds for mobile
      el.dataset.speedx = currentSpeedX * 0.7;
      el.dataset.speedy = currentSpeedY * 0.7;
      
      // Adjust positioning for text elements to improve mobile appearance
      if (el.classList.contains('text')) {
        el.style.top = 'calc(40% - 130px)'; // Move text up slightly on mobile
      }
      
      // Scale down fog elements slightly on mobile to prevent overflow
      if (el.classList.contains('fog-1') || 
          el.classList.contains('fog-2') || 
          el.classList.contains('fog-3')) {
        el.style.transform = 'translate(-50%, -50%) scale(0.9)';
      }
    });
  } else {
    // Remove mobile-specific styles
    document.body.classList.remove('mobile-view');
    
    // Restore original speeds and positions
    parallax_el.forEach(el => {
      if (el.dataset.originalSpeedx) {
        el.dataset.speedx = el.dataset.originalSpeedx;
        el.dataset.speedy = el.dataset.originalSpeedy;
      }
      
      if (el.dataset.originalLeft) {
        el.style.left = el.dataset.originalLeft;
      }
      
      // Reset text positioning
      if (el.classList.contains('text')) {
        el.style.top = 'calc(50% - 130px)';
      }
      
      // Reset fog element scaling
      if (el.classList.contains('fog-1') || 
          el.classList.contains('fog-2') || 
          el.classList.contains('fog-3')) {
        el.style.transform = '';
      }
    });
  }
}

// Handle responsive layout
function setResponsiveLayout() {
  // Set main container height based on screen width
  if (window.innerWidth >= 725) {
    main.style.maxHeight = `${window.innerWidth * 0.6}px`;
  } else {
    // Increase height for mobile to eliminate white space
    main.style.maxHeight = `${window.innerWidth * 2.2}px`; // Increased from 1.6 to 2.2
    
    // Add CSS to ensure the body and html extend to full height
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    // Ensure main fills at least the full viewport height
    main.style.minHeight = '100vh';
  }
  
  // Check mobile status
  checkMobile();
  
  // Add CSS to fix the background color
  const style = document.createElement('style');
  style.textContent = `
    body.mobile-view {
      background-color: #353; /* Match main background */
    }
    body.mobile-view main {
      overflow: hidden;
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
    .mobile-view .text h1 {
      font-size: calc(4rem + 2vw) !important;
    }
    .mobile-view .text h2 {
      font-size: calc(2rem + 2vw) !important;
    }
    @media (max-width: 520px) {
      body.mobile-view main {
        min-height: 100vh;
        height: auto;
      }
    }
  `;
  
  // Only add the style once
  if (!document.querySelector('#mobile-fix-style')) {
    style.id = 'mobile-fix-style';
    document.head.appendChild(style);
  }
}

// Preload background image
if (bgImage) {
  // If background image isn't loaded yet
  if (!bgImage.complete) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #353;
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 24px;
    `;
    loadingOverlay.innerHTML = '<div>Loading...</div>';
    document.body.appendChild(loadingOverlay);
    
    // Hide all parallax elements until background is ready
    parallax_el.forEach(el => {
      el.style.opacity = "0";
    });
    
    // When background loads, show everything and start animations
    bgImage.onload = function() {
      // Fade out loading overlay
      loadingOverlay.style.transition = 'opacity 0.5s ease';
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        if (loadingOverlay.parentNode) {
          document.body.removeChild(loadingOverlay);
        }
      }, 500);
      
      // Make elements visible
      parallax_el.forEach(el => {
        el.style.opacity = "1";
      });
      
      // Now initialize all the animations
      initParallax();
    };
    
    // If there's an error loading the background, still show content
    bgImage.onerror = function() {
      if (loadingOverlay.parentNode) {
        document.body.removeChild(loadingOverlay);
      }
      
      parallax_el.forEach(el => {
        el.style.opacity = "1";
      });
      initParallax();
    };
  } else {
    // Background already loaded, proceed normally
    initParallax();
  }
} else {
  // No background image found, proceed normally
  initParallax();
}

// Update transforms based on cursor/touch position
function update(cursorPosition) {
  // Skip if elements aren't ready yet
  if (!parallax_el.length) return;
  
  parallax_el.forEach((el) => {
    const speedx = parseFloat(el.dataset.speedx || 0);
    const speedy = parseFloat(el.dataset.speedy || 0);
    const speedz = parseFloat(el.dataset.speedz || 0);
    const rotateSpeed = parseFloat(el.dataset.rotation || 0);

    const isInLeft =
      parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1;
    const zValue = 
      (cursorPosition - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.1;

    // For mobile, use a slightly different transform to improve appearance
    if (isMobile) {
      el.style.transform = `translateX(calc(-50% + ${
        -xValue * speedx
      }px)) translateY(calc(-50% + ${
        yValue * speedy
      }px)) perspective(2300px) translateZ(${zValue * speedz * 0.7}px) rotateY(${rotateDegree * rotateSpeed * 0.5}deg)`;
    } else {
      el.style.transform = `translateX(calc(-50% + ${
        -xValue * speedx
      }px)) translateY(calc(-50% + ${
        yValue * speedy
      }px)) perspective(2300px) translateZ(${zValue * speedz}px) rotateY(${rotateDegree * rotateSpeed}deg)`;
    }
  });
}

// Handle mouse movement
function handleMouseMove(e) {
  if (window.timeline && window.timeline.isActive()) return;

  xValue = e.clientX - window.innerWidth / 2;
  yValue = e.clientY - window.innerHeight / 2;
  
  rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

  update(e.clientX);
}

// Handle touch movement (mobile)
function handleTouchMove(e) {
  if (window.timeline && window.timeline.isActive()) return;
  if (e.touches.length > 0) {
    xValue = e.touches[0].clientX - window.innerWidth / 2;
    yValue = e.touches[0].clientY - window.innerHeight / 2;
    
    rotateDegree = (xValue / (window.innerWidth / 2)) * 10; // Reduced rotation for mobile
    
    update(e.touches[0].clientX);
  }
}

// Handle device orientation changes (mobile)
function handleDeviceOrientation(e) {
  if (window.timeline && window.timeline.isActive()) return;
  if (!e.gamma || !e.beta) return;
  
  // Convert orientation data to x,y values
  const maxTilt = 15;
  const xTilt = Math.min(Math.max(e.gamma, -maxTilt), maxTilt);
  const yTilt = Math.min(Math.max(e.beta - 45, -maxTilt), maxTilt);
  
  // Scale tilt to screen coordinates
  xValue = (xTilt / maxTilt) * (window.innerWidth / 4);
  yValue = (yTilt / maxTilt) * (window.innerHeight / 4);
  
  rotateDegree = (xTilt / maxTilt) * 10;
  
  update(window.innerWidth / 2 + xValue);
}

// Init all animations and interactions
function initParallax() {
  // Set the responsive layout
  setResponsiveLayout();
  
  // Initial update
  update(window.innerWidth / 2);
  
  // Add event listeners
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("resize", setResponsiveLayout);
  
  // Add device orientation support for mobile
  if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  }

  // GSAP Animations
  window.timeline = gsap.timeline();

  // Get non-text elements and create animations
  const nonTextElements = Array.from(parallax_el)
    .filter((el) => !el.classList.contains("text"));

  // Create animations for parallax elements
  nonTextElements.forEach((el) => {
    window.timeline.from(
      el, 
      {
        top: `${el.offsetHeight / 2 + +el.dataset.distance}px`,
        duration: isMobile ? 2.5 : 3.5, // Slightly faster on mobile
        ease: "power3.out",
      },
      "1"
    );
  });

  // Add text animations
  const h1Element = document.querySelector(".text h1");
  if (h1Element) {
    window.timeline.from(".text h1", {
      y: window.innerHeight - h1Element.getBoundingClientRect().top + 200,
      duration: isMobile ? 1.5 : 2, // Slightly faster on mobile
    }, "2.5");
  }
  
  window.timeline.from(
    ".text h2",
    {
      y: -150,
      opacity: 0,
      duration: 1.5,
    },
    "3"
  )
  .from(
    ".hide", 
    {
      opacity: 0,
      duration: 1.5,
    },
    "3"
  );
  
  // Apply a fix for iOS Safari viewport height issues
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    function fixIOSViewport() {
      document.documentElement.style.height = `${window.innerHeight}px`;
      document.body.style.height = `${window.innerHeight}px`;
      main.style.height = `${window.innerHeight}px`;
    }
    
    window.addEventListener('resize', fixIOSViewport);
    fixIOSViewport();
  }
}

// Apply initial check for mobile
checkMobile();