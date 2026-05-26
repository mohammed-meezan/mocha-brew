import React, { useState, useEffect, useRef } from 'react';

const TOTAL_FRAMES = 210;

// Recipe data configuration
const RECIPES = {
  classic: {
    name: "Classic Mocha",
    cocoaColor: "var(--color-cocoa)",
    basePrice: 5.45,
    layers: { cocoa: 25, espresso: 30, milk: 35, foam: 10 },
    stats: { intensity: 65, sweetness: 50, creaminess: 70 },
    defaults: { strength: "2", milk: "whole", sweetness: "50", temp: "hot" }
  },
  white: {
    name: "White Velvet Mocha",
    cocoaColor: "var(--color-white-cocoa)",
    basePrice: 5.95,
    layers: { cocoa: 35, espresso: 20, milk: 35, foam: 10 },
    stats: { intensity: 45, sweetness: 80, creaminess: 85 },
    defaults: { strength: "1", milk: "whole", sweetness: "100", temp: "hot" }
  },
  caramel: {
    name: "Salted Caramel Mocha",
    cocoaColor: "var(--color-caramel)",
    basePrice: 6.25,
    layers: { cocoa: 20, espresso: 30, milk: 40, foam: 10 },
    stats: { intensity: 60, sweetness: 75, creaminess: 75 },
    defaults: { strength: "2", milk: "oat", sweetness: "50", temp: "hot" }
  }
};

export default function App() {
  // Preloader State
  const [loadedCount, setLoadedCount] = useState(0);
  const [preloaderActive, setPreloaderActive] = useState(true);
  const [preloaderFadeOut, setPreloaderFadeOut] = useState(false);

  // Active Section navigation state
  const [activeSection, setActiveSection] = useState('scroll-section');

  // Customizer State
  const [activeRecipe, setActiveRecipe] = useState('classic');
  const [settings, setSettings] = useState({
    strength: "2",
    milk: "whole",
    sweetness: "50",
    temp: "hot"
  });

  // Newsletter State
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [successMessageActive, setSuccessMessageActive] = useState(false);

  // Refs for Scroll & Canvas Animation
  const canvasRef = useRef(null);
  const scrollSectionRef = useRef(null);
  const imagesRef = useRef([]);
  const animationFrameIdRef = useRef(null);
  
  // Track current frame for lerping
  const stateRef = useRef({
    currentFrame: 1,
    targetFrame: 1,
    imagesLoaded: false
  });

  // Helper to zero-pad frame index (e.g. 1 -> "001")
  const padNumber = (num) => String(num).padStart(3, '0');

  // 1. Preload Animation Frames on Mount
  useEffect(() => {
    let active = true;
    let localLoadedCount = 0;

    // Body overflow hidden during preload
    document.body.style.overflowY = 'hidden';

    const handleImageLoad = () => {
      if (!active) return;
      localLoadedCount++;
      setLoadedCount(localLoadedCount);

      if (localLoadedCount >= TOTAL_FRAMES) {
        stateRef.current.imagesLoaded = true;
        // Smooth delay for preloader exit
        setTimeout(() => {
          setPreloaderFadeOut(true);
          setTimeout(() => {
            setPreloaderActive(false);
            document.body.style.overflowY = 'auto';
          }, 800);
        }, 600);
      }
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // Resolve asset URL dynamically from public/frames via Vite base URL
      img.src = `${import.meta.env.BASE_URL}frames/ezgif-frame-${padNumber(i)}.jpg`;
      
      img.onload = handleImageLoad;
      img.onerror = () => {
        console.warn(`Failed to load frame: ${img.src}`);
        handleImageLoad(); // Skip to avoid locks
      };
      imagesRef.current[i] = img;
    }

    return () => {
      active = false;
      document.body.style.overflowY = 'auto';
    };
  }, []);

  // 2. Setup Canvas Resize and Scroll Tracking Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const renderFrame = (img) => {
      if (!img || !img.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      
      const currentImg = imagesRef.current[Math.round(stateRef.current.currentFrame)];
      if (currentImg) {
        renderFrame(currentImg);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Scroll Handler
    const handleScroll = () => {
      const scrollSection = scrollSectionRef.current;
      if (!scrollSection) return;

      const scrollTop = window.scrollY;
      const scrollHeight = scrollSection.scrollHeight;
      const viewportHeight = window.innerHeight;
      const maxScroll = scrollHeight - viewportHeight;

      let progress = scrollTop / maxScroll;
      progress = Math.max(0, Math.min(1, progress));

      stateRef.current.targetFrame = Math.floor(progress * (TOTAL_FRAMES - 1)) + 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Butter smooth lerp render loop
    const updateLoop = () => {
      const state = stateRef.current;
      const diff = state.targetFrame - state.currentFrame;

      if (Math.abs(diff) > 0.01) {
        state.currentFrame += diff * 0.08;
        let frameToDraw = Math.round(state.currentFrame);
        frameToDraw = Math.max(1, Math.min(TOTAL_FRAMES, frameToDraw));

        const img = imagesRef.current[frameToDraw];
        if (img && img.complete) {
          renderFrame(img);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(updateLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateLoop);

    // Initial render of first frame once loaded
    const checkFirstFrame = setInterval(() => {
      const firstImg = imagesRef.current[1];
      if (firstImg && firstImg.complete) {
        renderFrame(firstImg);
        clearInterval(checkFirstFrame);
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameIdRef.current);
      clearInterval(checkFirstFrame);
    };
  }, []);

  // 3. Navigation link highlight observer
  useEffect(() => {
    const handleNavHighlight = () => {
      const sections = ['scroll-section', 'menu', 'timeline', 'newsletter'];
      let currentSec = 'scroll-section';

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (window.scrollY >= top - window.innerHeight / 3) {
            currentSec = id;
          }
        }
      }
      setActiveSection(currentSec);
    };

    window.addEventListener('scroll', handleNavHighlight, { passive: true });
    return () => window.removeEventListener('scroll', handleNavHighlight);
  }, []);

  // 4. Update preset blend selections
  const handleRecipeChange = (recipeId) => {
    setActiveRecipe(recipeId);
    setSettings({ ...RECIPES[recipeId].defaults });
  };

  // 5. Customizer formula calculations
  const recipe = RECIPES[activeRecipe];
  
  // Layer heights
  let cocoaPct = recipe.layers.cocoa;
  let espressoPct = recipe.layers.espresso;
  let milkPct = recipe.layers.milk;
  let foamPct = recipe.layers.foam;

  if (settings.strength === "1") {
    espressoPct = 15;
    milkPct += 15;
  } else if (settings.strength === "3") {
    espressoPct = 45;
    milkPct = Math.max(10, milkPct - 15);
  }

  if (settings.sweetness === "0") {
    cocoaPct = 0;
    milkPct += recipe.layers.cocoa;
  } else if (settings.sweetness === "25") {
    cocoaPct = 12;
    milkPct += (recipe.layers.cocoa - 12);
  } else if (settings.sweetness === "100") {
    cocoaPct = 45;
    milkPct = Math.max(10, milkPct - (45 - recipe.layers.cocoa));
  }

  // Live Recipe Stats
  let intensity = recipe.stats.intensity;
  let sweetness = recipe.stats.sweetness;
  let creaminess = recipe.stats.creaminess;

  if (settings.strength === "1") intensity -= 20;
  if (settings.strength === "3") intensity += 20;

  if (settings.sweetness === "0") sweetness = 5;
  if (settings.sweetness === "25") sweetness = 30;
  if (settings.sweetness === "100") sweetness = 95;

  if (settings.milk === "oat") {
    creaminess += 5;
    sweetness += 5;
  } else if (settings.milk === "almond") {
    creaminess -= 10;
  }

  intensity = Math.max(5, Math.min(100, intensity));
  sweetness = Math.max(5, Math.min(100, sweetness));
  creaminess = Math.max(5, Math.min(100, creaminess));

  // Pricing calculations
  let price = recipe.basePrice;
  if (settings.strength === "3") price += 0.80;
  if (settings.milk === "oat" || settings.milk === "almond") price += 0.50;
  if (settings.sweetness === "100") price += 0.25;

  // Active strength, milk, sweetness and temp labels
  const strengthLabels = { "1": "Single Shot", "2": "Double Shot", "3": "Triple Shot" };
  const milkLabels = { "whole": "Whole Milk", "oat": "Oat Milk", "almond": "Almond Milk" };
  const sweetnessLabels = { "0": "Unsweetened (0%)", "25": "Light Cocoa (25%)", "50": "Medium Cocoa (50%)", "100": "Sweet Indulgence (100%)" };
  const tempLabels = { "iced": "Chilled (Over Ice)", "hot": "Steamed Warm", "extra": "Extra Hot" };

  // Handlers
  const handleOrder = () => {
    alert(`☕ Order Placed!\nYour customized ${recipe.name} (${strengthLabels[settings.strength]}, made with ${milkLabels[settings.milk]}, ${sweetnessLabels[settings.sweetness]}, served ${tempLabels[settings.temp]}) is brewing now!`);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
    setSuccessMessageActive(true);
    setEmail('');
    
    // Auto-hide success banner after 5 seconds
    setTimeout(() => {
      setSuccessMessageActive(false);
      setTimeout(() => {
        setSubscribed(false);
      }, 400);
    }, 5000);
  };

  // Helper for scroll overlays animation active states
  const getScrollOverlayClass = (minProgress, maxProgress) => {
    const state = stateRef.current;
    const progress = (state.currentFrame - 1) / (TOTAL_FRAMES - 1);
    return progress >= minProgress && progress < maxProgress ? 'scroll-text active' : 'scroll-text';
  };

  return (
    <>
      {/* Premium Loading Screen */}
      {preloaderActive && (
        <div id="preloader" className={preloaderFadeOut ? 'loaded' : ''}>
          <div className="loader-content">
            <div className="coffee-cup-svg">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <path className="steam steam-1" d="M 35 25 C 33 15, 38 10, 35 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path className="steam steam-2" d="M 50 25 C 48 12, 53 8, 50 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path className="steam steam-3" d="M 65 25 C 63 15, 68 10, 65 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path className="cup-body" d="M 25 35 L 75 35 C 75 35, 75 70, 50 70 C 25 70, 25 35, 25 35 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                <path className="cup-handle" d="M 75 42 C 85 42, 85 58, 75 58" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <line className="cup-plate" x1="15" y1="78" x2="85" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="loader-title">Mocha Brew</h1>
            <p className="loader-subtitle">Grinding & roasting the finest beans...</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${Math.round((loadedCount / TOTAL_FRAMES) * 100)}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round((loadedCount / TOTAL_FRAMES) * 100)}%</div>
          </div>
        </div>
      )}

      {/* Sticky Glass Navbar */}
      <header className="glass-nav">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span className="logo-gold">Mocha</span> Brew
          </a>
          <nav className="nav-links">
            <a 
              href="#scroll-section" 
              className={`nav-link ${activeSection === 'scroll-section' ? 'active' : ''}`}
            >Home</a>
            <a 
              href="#menu" 
              className={`nav-link ${activeSection === 'menu' ? 'active' : ''}`}
            >Our Menu</a>
            <a 
              href="#timeline" 
              className={`nav-link ${activeSection === 'timeline' ? 'active' : ''}`}
            >Our Journey</a>
            <a 
              href="#newsletter" 
              className={`nav-link ${activeSection === 'newsletter' ? 'active' : ''}`}
            >Subscribe</a>
          </nav>
          <a href="#menu" className="nav-cta">Customize Brew</a>
        </div>
      </header>

      {/* Scroll Canvas Section */}
      <section id="scroll-section" ref={scrollSectionRef}>
        <div className="canvas-sticky-wrapper">
          <canvas id="animation-canvas" ref={canvasRef}></canvas>
          
          {/* Canvas Ambient Glow Overlays */}
          <div className="ambient-glow glow-1"></div>
          <div className="ambient-glow glow-2"></div>
          
          {/* Cinematic Scroll Text Overlays */}
          <div className="scroll-overlays">
            <div className={getScrollOverlayClass(0.03, 0.23)} id="text-1">
              <span className="text-tag">The Art of Espresso</span>
              <h2>Brewed with Passion</h2>
              <p>Every frame captures the liquid harmony of premium dark roast espresso mixing with artisan cocoa.</p>
            </div>
            <div className={getScrollOverlayClass(0.28, 0.48)} id="text-2">
              <span className="text-tag">Single-Origin Roast</span>
              <h2>Rich Chocolate Undertones</h2>
              <p>We blend single-origin Arabica beans with organic dark chocolate to create an unforgettable mocha profile.</p>
            </div>
            <div className={getScrollOverlayClass(0.53, 0.73)} id="text-3">
              <span className="text-tag">Velvety Smoothness</span>
              <h2>Crafted for Coffee Lovers</h2>
              <p>Witness the precise texture, rich crema, and smooth temperature consistency poured in every single cup.</p>
            </div>
            <div className={getScrollOverlayClass(0.78, 0.95)} id="text-4">
              <span className="text-tag">Your Turn</span>
              <h2>Customize Your Experience</h2>
              <p>Scroll down to choose your blend, adjust your shots, and craft your signature cup of Mocha Brew.</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span className="scroll-indicator-text">Scroll to Brew</span>
            <div className="scroll-indicator-mouse">
              <div className="scroll-indicator-wheel"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Menu Section */}
      <section id="menu" className="content-section">
        <div className="section-header">
          <span className="section-tag">Interactive Barista</span>
          <h2>Choose & Customize Your Brew</h2>
          <p>Select one of our signature blends, then adjust the parameters to visualize your perfect coffee combination.</p>
        </div>

        <div className="customizer-container">
          {/* Left Side: Coffee Selection and Controls */}
          <div className="customizer-controls glass-card">
            <h3>Select Blend</h3>
            <div className="blend-selector">
              <button 
                className={`blend-btn ${activeRecipe === 'classic' ? 'active' : ''}`}
                onClick={() => handleRecipeChange('classic')}
              >
                <span className="blend-title">Classic Mocha</span>
                <span className="blend-desc">Smooth espresso, signature cocoa, and steamed milk.</span>
              </button>
              <button 
                className={`blend-btn ${activeRecipe === 'white' ? 'active' : ''}`}
                onClick={() => handleRecipeChange('white')}
              >
                <span className="blend-title">White Velvet Mocha</span>
                <span className="blend-desc">Espresso paired with decadent white chocolate cocoa.</span>
              </button>
              <button 
                className={`blend-btn ${activeRecipe === 'caramel' ? 'active' : ''}`}
                onClick={() => handleRecipeChange('caramel')}
              >
                <span className="blend-title">Salted Caramel Mocha</span>
                <span className="blend-desc">House cocoa, salted caramel drizzle, and a hint of sea salt.</span>
              </button>
            </div>

            <hr className="divider" />

            <h3>Fine Tune Your Recipe</h3>
            <div className="parameter-controls">
              {/* Strength Control */}
              <div className="control-group">
                <div className="control-header">
                  <span className="control-label">Espresso Strength</span>
                  <span className="control-value">{strengthLabels[settings.strength]}</span>
                </div>
                <div className="toggle-pills">
                  {["1", "2", "3"].map((val) => (
                    <button 
                      key={val}
                      className={`pill-btn ${settings.strength === val ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, strength: val }))}
                    >
                      {val === "1" ? "Single" : val === "2" ? "Double" : "Triple"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Control */}
              <div className="control-group">
                <div className="control-header">
                  <span className="control-label">Milk Base</span>
                  <span className="control-value">{milkLabels[settings.milk]}</span>
                </div>
                <div className="toggle-pills">
                  {["whole", "oat", "almond"].map((val) => (
                    <button 
                      key={val}
                      className={`pill-btn ${settings.milk === val ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, milk: val }))}
                    >
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness Control */}
              <div className="control-group">
                <div className="control-header">
                  <span className="control-label">Cocoa Sweetness</span>
                  <span className="control-value">{sweetnessLabels[settings.sweetness]}</span>
                </div>
                <div className="toggle-pills">
                  {["0", "25", "50", "100"].map((val) => (
                    <button 
                      key={val}
                      className={`pill-btn ${settings.sweetness === val ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, sweetness: val }))}
                    >
                      {val === "0" ? "None" : val === "25" ? "Light" : val === "50" ? "Medium" : "Extra"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature Control */}
              <div className="control-group">
                <div className="control-header">
                  <span className="control-label">Temperature</span>
                  <span className="control-value">{tempLabels[settings.temp]}</span>
                </div>
                <div className="toggle-pills">
                  {["iced", "hot", "extra"].map((val) => (
                    <button 
                      key={val}
                      className={`pill-btn ${settings.temp === val ? 'active' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, temp: val }))}
                    >
                      {val === "iced" ? "Over Ice" : val === "hot" ? "Steamed Warm" : "Extra Hot"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Representation of the Coffee Cup Layers */}
          <div className="customizer-preview glass-card">
            <div className="cup-canvas-wrapper">
              <div className="preview-cup">
                {/* Foam Layer */}
                <div className="cup-layer layer-foam" style={{ height: `${foamPct}%` }}>
                  <span>Milk Foam</span>
                </div>
                {/* Steamed Milk Layer */}
                <div 
                  className="cup-layer layer-milk" 
                  style={{ 
                    height: `${milkPct}%`,
                    backgroundColor: settings.temp === 'iced' ? 'rgba(235, 215, 195, 0.75)' : 'var(--color-milk)'
                  }}
                >
                  <span>Steamed Milk</span>
                </div>
                {/* Espresso Layer */}
                <div className="cup-layer layer-espresso" style={{ height: `${espressoPct}%` }}>
                  <span>Espresso Shot(s)</span>
                </div>
                {/* Chocolate/Cocoa Layer */}
                <div 
                  className="cup-layer layer-cocoa" 
                  style={{ 
                    height: `${cocoaPct}%`,
                    backgroundColor: recipe.cocoaColor
                  }}
                >
                  {cocoaPct > 0 && <span>Decadent Cocoa</span>}
                </div>
                {/* Ice Cubes Overlay */}
                <div className={`ice-cubes ${settings.temp === 'iced' ? 'visible' : ''}`}>
                  <div className="ice-cube ice-1"></div>
                  <div className="ice-cube ice-2"></div>
                  <div className="ice-cube ice-3"></div>
                </div>
              </div>
              <div className="cup-reflection"></div>
            </div>

            {/* Live Recipe Stats */}
            <div className="recipe-stats">
              <h4>Flavor Profile</h4>
              <div className="stat-bars">
                <div className="stat-bar-group">
                  <div className="stat-info"><span>Bitterness / Intensity</span><span>{intensity}%</span></div>
                  <div className="stat-track"><div className="stat-fill" style={{ width: `${intensity}%` }}></div></div>
                </div>
                <div className="stat-bar-group">
                  <div className="stat-info"><span>Sweetness</span><span>{sweetness}%</span></div>
                  <div className="stat-track"><div className="stat-fill" style={{ width: `${sweetness}%` }}></div></div>
                </div>
                <div className="stat-bar-group">
                  <div className="stat-info"><span>Creaminess</span><span>{creaminess}%</span></div>
                  <div className="stat-track"><div className="stat-fill" style={{ width: `${creaminess}%` }}></div></div>
                </div>
              </div>
              <div className="checkout-footer">
                <div className="price-container">
                  <span className="price-label">Price</span>
                  <span className="price-value">${price.toFixed(2)}</span>
                </div>
                <button className="order-btn" onClick={handleOrder}>Order This Brew</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Journey Section */}
      <section id="timeline" className="content-section">
        <div className="section-header">
          <span className="section-tag">Crafting Process</span>
          <h2>Our Coffee Journey</h2>
          <p>From rich volcanic soils to your ceramic mug, witness the milestones behind every single drop of Mocha Brew.</p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          {/* Step 1 */}
          <div className="timeline-card-wrapper left">
            <div className="timeline-node">1</div>
            <div className="timeline-card glass-card">
              <div className="card-icon">🌱</div>
              <h3>Ethical Harvesting</h3>
              <p>We source single-origin Arabica beans from organic micro-lots in Ethiopia and Colombia, supporting local farmers with fair wages.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="timeline-card-wrapper right">
            <div className="timeline-node">2</div>
            <div className="timeline-card glass-card">
              <div className="card-icon">🔥</div>
              <h3>Precision Roasting</h3>
              <p>Beans are roasted at precise temperatures in small batches to draw out deep chocolatey profiles without burning the delicate acidity.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="timeline-card-wrapper left">
            <div className="timeline-node">3</div>
            <div className="timeline-card glass-card">
              <div className="card-icon">🍫</div>
              <h3>Cocoa Fusion</h3>
              <p>We melt 72% organic dark chocolate directly into the brewing chamber, blending it seamlessly with freshly pulled double shots.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="timeline-card-wrapper right">
            <div className="timeline-node">4</div>
            <div className="timeline-card glass-card">
              <div className="card-icon">☕</div>
              <h3>Poured & Crafted</h3>
              <p>Hand-poured under ideal conditions to guarantee the velvet texture, rich microfoam, and perfect temperature in every cup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription & Newsletter Section */}
      <section id="newsletter" className="content-section">
        <div className="newsletter-card glass-card">
          <div className="newsletter-glow"></div>
          <span className="section-tag">Newsletter</span>
          <h2>Join the Coffee Club</h2>
          <p>Subscribe to receive exclusive coffee tasting notes, secret barista recipes, and 15% off your first online order.</p>
          
          <form className="subscribe-form" onSubmit={handleSubscribe}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="submit-btn">
                <span>Subscribe</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
            {subscribed && (
              <p 
                className="success-message" 
                style={{ 
                  display: 'block', 
                  opacity: successMessageActive ? 1 : 0 
                }}
              >🎉 Success! Check your inbox for your 15% discount code.</p>
            )}
          </form>
        </div>
      </section>

      {/* Premium Footer */}
      <footer>
        <div className="footer-container">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <span className="logo-gold">Mocha</span> Brew
            </a>
            <p>An immersive digital coffee house dedicated to the art of crafting the ultimate dark chocolate mocha.</p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
          
          <div className="footer-links-group">
            <h4>Explore</h4>
            <ul>
              <li><a href="#scroll-section">Scroll Blend</a></li>
              <li><a href="#menu">Customizer</a></li>
              <li><a href="#timeline">Process</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Hours</h4>
            <ul>
              <li>Mon - Fri: 6AM - 8PM</li>
              <li>Sat - Sun: 7AM - 9PM</li>
              <li>Online Orders: 24/7</li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4>Locations</h4>
            <ul>
              <li>Downtown - 102 Bean St.</li>
              <li>Soho - 44 Crema Ave.</li>
              <li>Seattle - 99 Foam Blvd.</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 Mocha Brew Coffee Co. All rights reserved. Crafted with care for the ultimate scroll experience.</p>
        </div>
      </footer>
    </>
  );
}
