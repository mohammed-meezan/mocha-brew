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

  // Reviews State
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Marcus Sterling",
      rating: 5,
      date: "May 25, 2026",
      tag: "Classic Mocha",
      orderedOnline: true,
      title: "Seamless online customizer!",
      text: "The web customizer is a game changer. I adjusted my espresso shots and sweetness level, ordered from my phone, and it was ready for pickup in 5 minutes. Tastes absolutely perfect!"
    },
    {
      id: 2,
      name: "Sophia Chen",
      rating: 5,
      date: "May 22, 2026",
      tag: "White Velvet Mocha",
      orderedOnline: true,
      title: "Incredibly fast & delicious",
      text: "I usually get overwhelmed with ordering customized drinks online, but this was so visual. Selected Oat Milk and Light Cocoa, placed the order in seconds. The white mocha is rich and smooth!"
    },
    {
      id: 3,
      name: "Liam O'Connor",
      rating: 4,
      date: "May 20, 2026",
      tag: "Salted Caramel Shake",
      orderedOnline: true,
      title: "Perfect cold shake for summer",
      text: "Ordering online was a breeze. The interface shows you exactly what goes into your shake. The salted caramel has the perfect balance, only docked a star because the pickup line was a bit long."
    },
    {
      id: 4,
      name: "Amara Adebayo",
      rating: 5,
      date: "May 18, 2026",
      tag: "White Velvet Mocha",
      orderedOnline: true,
      title: "Simplest checkout ever",
      text: "Literally took me 3 clicks to order my afternoon mocha brew. The payment integration is flawless, and the drink was piping hot when I walked in. 5 stars for the digital experience!"
    },
    {
      id: 5,
      name: "Elena Rostova",
      rating: 4,
      date: "May 15, 2026",
      tag: "Classic Mocha",
      orderedOnline: true,
      title: "Superb custom control",
      text: "Love how I can slide and toggle my milk base and temperature. Ordering from the train and grabbing it hot at Soho is my new daily routine. Highly recommend!"
    }
  ]);
  const [filterRating, setFilterRating] = useState('all');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    tag: 'Classic Mocha',
    title: '',
    text: ''
  });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const reviewToAdd = {
      id: Date.now(),
      name: newReview.name,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      tag: newReview.tag,
      orderedOnline: true,
      title: newReview.title,
      text: newReview.text
    };
    setReviews(prev => [reviewToAdd, ...prev]);
    setNewReview({ name: '', rating: 5, tag: 'Classic Mocha', title: '', text: '' });
    setIsWritingReview(false);
  };

  // --- NEW FEATURES STATES ---

  // 1. Find Your Brew Quiz State
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({ strength: '', sweetness: '', temp: '' });

  // 2. Order Drawer / Payments / Brewing Progress State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStage, setCartStage] = useState('summary'); // 'summary' | 'payment' | 'brewing'
  const [paymentMethod, setPaymentMethod] = useState(''); // 'upi' | 'netbanking' | 'razorpay'
  const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'processing' | 'success'
  
  // UPI specific state
  const [upiId, setUpiId] = useState('');
  
  // Netbanking specific state
  const [selectedBank, setSelectedBank] = useState('');
  const [bankLoginState, setBankLoginState] = useState('login'); // 'login' | 'otp' | 'success'
  const [bankUser, setBankUser] = useState('');
  const [bankPassword, setBankPassword] = useState('');
  const [bankOtp, setBankOtp] = useState('');

  // Razorpay simulated state
  const [razorpayOpen, setRazorpayOpen] = useState(false);

  // Brewing countdown timer state
  const [brewingTimeLeft, setBrewingTimeLeft] = useState(15);
  const [brewingStage, setBrewingStage] = useState('Grinding Fresh Beans ☕'); // stages

  // 3. Customizer Blending Shake State
  const [isBlending, setIsBlending] = useState(false);

  // 4. Roaster Slider State
  const [roastLevel, setRoastLevel] = useState('medium'); // 'light' | 'medium' | 'dark'

  // 5. Social Proof Toasts State
  const [toasts, setToasts] = useState([]);

  // --- NEW HANDLERS ---

  // Quiz submission & slider auto-configuration
  const handleQuizAnswer = (question, answer) => {
    setQuizAnswers(prev => {
      const updated = { ...prev, [question]: answer };
      
      // If we finished step 3, auto-configure settings and close quiz
      if (quizStep === 3) {
        let strengthVal = "2";
        if (updated.strength === 'mild') strengthVal = "1";
        if (updated.strength === 'bold') strengthVal = "3";

        let sweetnessVal = "50";
        if (updated.sweetness === 'none') sweetnessVal = "0";
        if (updated.sweetness === 'light') sweetnessVal = "25";
        if (updated.sweetness === 'sweet') sweetnessVal = "100";

        let tempVal = "hot";
        if (updated.temp === 'iced') tempVal = "iced";
        if (updated.temp === 'extra') tempVal = "extra";

        // Auto-select recipe based on sweetness
        let matchedRecipe = 'classic';
        if (updated.sweetness === 'sweet') {
          matchedRecipe = 'white';
        } else if (updated.temp === 'iced') {
          matchedRecipe = 'caramel';
        }

        setActiveRecipe(matchedRecipe);
        setSettings({
          strength: strengthVal,
          milk: 'whole',
          sweetness: sweetnessVal,
          temp: tempVal
        });

        setTimeout(() => {
          setQuizOpen(false);
          setQuizStep(1);
          setQuizAnswers({ strength: '', sweetness: '', temp: '' });
          triggerBlending();
        }, 800);
      } else {
        setQuizStep(prevStep => prevStep + 1);
      }
      return updated;
    });
  };

  // Blending shake visual animation trigger
  const triggerBlending = () => {
    setIsBlending(true);
    setTimeout(() => {
      setIsBlending(false);
    }, 2500);
  };

  // Toast Notification Queue Manager
  useEffect(() => {
    const mockToasts = [
      "Sarah in Soho just ordered an Iced White Velvet Mocha! 📱",
      "Marcus rated the Salted Caramel Shake ★★★★★! 🌟",
      "David in Seattle just ordered a Triple Shot Oat Mocha! ☕",
      "Emma in Downtown grabbed her Classic Mocha in 3 minutes! ⚡",
      "Liam rated the Customizer Blend ★★★★★ - 'Easiest checkout!' 👍",
      "Elena in Soho ordered a Chilled Caramel Coffee Shake! 🥤"
    ];

    const interval = setInterval(() => {
      const randomText = mockToasts[Math.floor(Math.random() * mockToasts.length)];
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, text: randomText }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // Brewing countdown timer loop
  useEffect(() => {
    let timer;
    if (cartOpen && cartStage === 'brewing' && brewingTimeLeft > 0) {
      timer = setTimeout(() => {
        setBrewingTimeLeft(prev => prev - 1);
        
        const elapsed = 15 - brewingTimeLeft;
        if (elapsed < 3) {
          setBrewingStage('Grinding Fresh Beans ☕');
        } else if (elapsed < 6) {
          setBrewingStage('Extracting Double Shot Espresso ☕');
        } else if (elapsed < 9) {
          setBrewingStage('Frothing Steamed Milk 🥛');
        } else if (elapsed < 12) {
          setBrewingStage('Blending Cocoa & Caramel Fusion 🍫');
        } else {
          setBrewingStage('Ready for Pick-up! 🎉');
        }
      }, 1000);
    } else if (brewingTimeLeft === 0) {
      setBrewingStage('Ready for Pick-up! 🎉');
    }
    return () => clearTimeout(timer);
  }, [cartOpen, cartStage, brewingTimeLeft]);

  // Payment triggers
  const startPaymentProcess = (method) => {
    setPaymentMethod(method);
    setPaymentState('processing');

    if (method === 'razorpay') {
      setRazorpayOpen(true);
    } else {
      setCartStage('payment');
    }
  };

  const handleUPISubmit = (e) => {
    e.preventDefault();
    if (!upiId.includes('@')) {
      alert('Please enter a valid UPI ID (e.g. user@okaxis)');
      return;
    }
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        setCartStage('brewing');
        setBrewingTimeLeft(15);
      }, 1000);
    }, 2000);
  };

  const handleNetbankingSubmit = (e) => {
    e.preventDefault();
    if (bankLoginState === 'login') {
      if (!bankUser || !bankPassword) {
        alert('Please fill in login details');
        return;
      }
      setBankLoginState('otp');
    } else if (bankLoginState === 'otp') {
      if (!bankOtp) {
        alert('Please enter OTP');
        return;
      }
      setPaymentState('processing');
      setTimeout(() => {
        setBankLoginState('success');
        setPaymentState('success');
        setTimeout(() => {
          setCartStage('brewing');
          setBrewingTimeLeft(15);
        }, 1000);
      }, 2000);
    }
  };

  const handleRazorpayPay = () => {
    setRazorpayOpen(false);
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
      setTimeout(() => {
        setCartStage('brewing');
        setBrewingTimeLeft(15);
      }, 1000);
    }, 1500);
  };

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
      const sections = ['scroll-section', 'menu', 'reviews', 'timeline', 'newsletter'];
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
    setCartStage('summary');
    setPaymentMethod('');
    setPaymentState('idle');
    setUpiId('');
    setSelectedBank('');
    setBankLoginState('login');
    setBankUser('');
    setBankPassword('');
    setBankOtp('');
    setCartOpen(true);
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
                <path className="steam steam-1" d="M 35 25 C 33 15, 38 10, 35 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path className="steam steam-2" d="M 50 25 C 48 12, 53 8, 50 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path className="steam steam-3" d="M 65 25 C 63 15, 68 10, 65 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path className="cup-body" d="M 25 35 L 75 35 C 75 35, 75 70, 50 70 C 25 70, 25 35, 25 35 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                <path className="cup-handle" d="M 75 42 C 85 42, 85 58, 75 58" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line className="cup-plate" x1="15" y1="78" x2="85" y2="78" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
              href="#reviews"
              className={`nav-link ${activeSection === 'reviews' ? 'active' : ''}`}
            >Reviews</a>
            <a
              href="#timeline"
              className={`nav-link ${activeSection === 'timeline' ? 'active' : ''}`}
            >Our Journey</a>
            <a
              href="#newsletter"
              className={`nav-link ${activeSection === 'newsletter' ? 'active' : ''}`}
            >Subscribe</a>
          </nav>
          <div className="nav-actions">
            <button className="quiz-trigger-btn" onClick={() => setQuizOpen(true)}>Find Your Brew 🔍</button>
            <a href="#menu" className="nav-cta">Customize Brew</a>
          </div>
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
              <p>Scroll down to choose your blend, or take our custom flavor match quiz to find your ideal recipe.</p>
              <button className="quiz-trigger-btn-text" onClick={() => setQuizOpen(true)}>Take Flavor Quiz ⚡</button>
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
                {/* Blending Swirl Animation Overlay */}
                <div className={`blending-overlay ${isBlending ? 'blending' : ''}`}>
                  <div className="swirl swirl-1"></div>
                  <div className="swirl swirl-2"></div>
                  <div className="swirl swirl-3"></div>
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
                <div className="footer-actions-row">
                  <button className="blend-trigger-btn" onClick={triggerBlending} disabled={isBlending}>
                    {isBlending ? 'Blending...' : 'Blend Shake 🌀'}
                  </button>
                  <button className="order-btn" onClick={handleOrder}>Order This Brew</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="content-section">
        <div className="section-header">
          <span className="section-tag">Guest Experiences</span>
          <h2>Reviews from our Coffee Club</h2>
          <p>Read honest reviews from coffee shake enthusiasts who customized and ordered their drinks online.</p>
        </div>

        <div className="reviews-dashboard glass-card">
          <div className="rating-summary">
            <div className="average-rating">
              <span className="rating-number">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </span>
              <div className="stars">
                {'★'.repeat(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)) + '☆'.repeat(5 - Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
              </div>
              <span className="rating-count">Based on {reviews.length} reviews</span>
            </div>
            <div className="rating-bars">
              <div className="rating-bar-row">
                <span className="bar-label">5 Stars</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(reviews.filter(r => r.rating === 5).length / reviews.length) * 100}%` }}></div>
                </div>
                <span className="bar-value">{reviews.filter(r => r.rating === 5).length}</span>
              </div>
              <div className="rating-bar-row">
                <span className="bar-label">4 Stars</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(reviews.filter(r => r.rating === 4).length / reviews.length) * 100}%` }}></div>
                </div>
                <span className="bar-value">{reviews.filter(r => r.rating === 4).length}</span>
              </div>
              <div className="rating-bar-row">
                <span className="bar-label">3 Stars</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(reviews.filter(r => r.rating === 3).length / reviews.length) * 100}%` }}></div>
                </div>
                <span className="bar-value">{reviews.filter(r => r.rating === 3).length}</span>
              </div>
            </div>
          </div>

          <div className="reviews-filter-actions">
            <div className="filter-group">
              <button 
                className={`filter-btn ${filterRating === 'all' ? 'active' : ''}`}
                onClick={() => setFilterRating('all')}
              >All Reviews</button>
              <button 
                className={`filter-btn ${filterRating === 5 ? 'active' : ''}`}
                onClick={() => setFilterRating(5)}
              >5 Stars Only</button>
              <button 
                className={`filter-btn ${filterRating === 4 ? 'active' : ''}`}
                onClick={() => setFilterRating(4)}
              >4 Stars Only</button>
            </div>
            <button 
              className="write-review-btn"
              onClick={() => setIsWritingReview(!isWritingReview)}
            >
              {isWritingReview ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {isWritingReview && (
            <form className="write-review-form" onSubmit={handleReviewSubmit}>
              <h3>Share Your Feedback</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newReview.name} 
                    onChange={e => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <select 
                    value={newReview.rating} 
                    onChange={e => setNewReview(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ordered Blend / Shake</label>
                  <select 
                    value={newReview.tag} 
                    onChange={e => setNewReview(prev => ({ ...prev, tag: e.target.value }))}
                  >
                    <option value="Classic Mocha">Classic Mocha</option>
                    <option value="White Velvet Mocha">White Velvet Mocha</option>
                    <option value="Salted Caramel Mocha">Salted Caramel Mocha</option>
                    <option value="Salted Caramel Shake">Salted Caramel Shake</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Review Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newReview.title} 
                    onChange={e => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Amazingly quick online pickup!"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Describe your experience ordering online</label>
                  <textarea 
                    required 
                    rows="3"
                    value={newReview.text} 
                    onChange={e => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="How easy was the online customizer? How was the taste?"
                  ></textarea>
                </div>
              </div>
              <button type="submit" className="submit-review-btn">Submit Feedback</button>
            </form>
          )}
        </div>

        <div className="reviews-grid">
          {reviews
            .filter(r => filterRating === 'all' || r.rating === filterRating)
            .map(r => (
              <div className="review-card glass-card" key={r.id}>
                <div className="review-card-header">
                  <div className="user-avatar">
                    {r.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="user-meta">
                    <span className="user-name">{r.name}</span>
                    <div className="verification-badge">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Verified Orderer
                    </div>
                  </div>
                  <span className="review-date">{r.date}</span>
                </div>
                <div className="review-rating-stars">
                  {'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                </div>
                <h4 className="review-title">{r.title}</h4>
                <p className="review-text">"{r.text}"</p>
                <div className="review-footer">
                  <span className="ordered-tag">Ordered: {r.tag}</span>
                  <span className="delivery-method">📱 Online Order</span>
                </div>
              </div>
            ))
          }
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

          {/* Step 2 (Roasting - Interactive) */}
          <div className="timeline-card-wrapper right">
            <div className="timeline-node">2</div>
            <div className="timeline-card glass-card roaster-card">
              <div className="card-icon">🔥</div>
              <h3>Interactive Roasting</h3>
              <p>Adjust the slider to see how bean colors and flavor notes shift during precision small-batch roasting.</p>
              
              <div className="roast-visualizer">
                <div className={`bean-display ${roastLevel}`}>
                  <span className="coffee-bean">🫘</span>
                </div>
                <div className="roast-details">
                  <span className="roast-title">
                    {roastLevel === 'light' ? 'Light Roast (Cinnamon)' : roastLevel === 'medium' ? 'Medium Roast (City)' : 'Dark Roast (French)'}
                  </span>
                  <span className="roast-desc">
                    {roastLevel === 'light' && 'Bright acidity, floral aromas, herbal & tea-like body.'}
                    {roastLevel === 'medium' && 'Balanced acidity and body, notes of rich brown sugar & caramel.'}
                    {roastLevel === 'dark' && 'Low acidity, heavy full body, bold notes of dark cocoa & toasted nuts.'}
                  </span>
                </div>
              </div>

              <div className="roast-slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  value={roastLevel === 'light' ? 0 : roastLevel === 'medium' ? 1 : 2}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setRoastLevel(val === 0 ? 'light' : val === 1 ? 'medium' : 'dark');
                  }}
                  className="roast-range-slider"
                />
                <div className="roast-range-labels">
                  <span>Light</span>
                  <span>Medium</span>
                  <span>Dark</span>
                </div>
              </div>
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
              <li><a href="#reviews">Reviews</a></li>
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

      {/* 1. Find Your Brew Quiz Modal */}
      {quizOpen && (
        <div className="quiz-overlay">
          <div className="quiz-card glass-card animate-zoom">
            <button className="quiz-close-btn" onClick={() => setQuizOpen(false)}>&times;</button>
            <div className="quiz-progress">
              <span className="quiz-progress-step">Step {quizStep} of 3</span>
              <div className="progress-dots">
                <span className={`dot ${quizStep >= 1 ? 'active' : ''}`}></span>
                <span className={`dot ${quizStep >= 2 ? 'active' : ''}`}></span>
                <span className={`dot ${quizStep >= 3 ? 'active' : ''}`}></span>
              </div>
            </div>

            {quizStep === 1 && (
              <div className="quiz-question">
                <h3>How strong do you like your coffee flavor?</h3>
                <div className="quiz-options">
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('strength', 'mild')}>
                    <span className="option-icon">🥛</span>
                    <span className="option-title">Mild & Creamy</span>
                    <span className="option-desc">Just a hint of espresso, milk forward.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('strength', 'medium')}>
                    <span className="option-icon">☕</span>
                    <span className="option-title">Classic Balanced</span>
                    <span className="option-desc">The perfect harmony of espresso and cocoa.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('strength', 'bold')}>
                    <span className="option-icon">🔥</span>
                    <span className="option-title">Bold & Strong</span>
                    <span className="option-desc">Extra shot of espresso, rich and deep.</span>
                  </button>
                </div>
              </div>
            )}

            {quizStep === 2 && (
              <div className="quiz-question">
                <h3>What is your sweetness level preference?</h3>
                <div className="quiz-options">
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('sweetness', 'none')}>
                    <span className="option-icon">🥜</span>
                    <span className="option-title">Unsweetened</span>
                    <span className="option-desc">No sugar, focus on bean notes.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('sweetness', 'light')}>
                    <span className="option-icon">🌾</span>
                    <span className="option-title">Lightly Sweet</span>
                    <span className="option-desc">Subtle touch of sweet cocoa.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('sweetness', 'medium')}>
                    <span className="option-icon">🍯</span>
                    <span className="option-title">Standard Medium</span>
                    <span className="option-desc">Sweetness of a classic dark chocolate mocha.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('sweetness', 'sweet')}>
                    <span className="option-icon">🧁</span>
                    <span className="option-title">Extra Indulgent</span>
                    <span className="option-desc">Decadent cocoa, dessert in a cup.</span>
                  </button>
                </div>
              </div>
            )}

            {quizStep === 3 && (
              <div className="quiz-question">
                <h3>How would you like your beverage served?</h3>
                <div className="quiz-options">
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('temp', 'iced')}>
                    <span className="option-icon">❄️</span>
                    <span className="option-title">Chilled Shake (Over Ice)</span>
                    <span className="option-desc">Iced shake for hot days.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('temp', 'hot')}>
                    <span className="option-icon">☀️</span>
                    <span className="option-title">Steamed Warm</span>
                    <span className="option-desc">Comforting, perfect temperature.</span>
                  </button>
                  <button className="quiz-option-btn" onClick={() => handleQuizAnswer('temp', 'extra')}>
                    <span className="option-icon">🌋</span>
                    <span className="option-title">Extra Hot</span>
                    <span className="option-desc">Keeps warm for the commute.</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Order Cart Drawer */}
      <div className={`cart-drawer-overlay ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)}>
        <div className="cart-drawer glass-card" onClick={e => e.stopPropagation()}>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)}>&times;</button>
          
          {cartStage === 'summary' && (
            <div className="cart-stage-summary">
              <h2>Your Custom Brew</h2>
              <div className="cart-item-details">
                <div className="cart-recipe-icon">☕</div>
                <h3>{recipe.name}</h3>
                <ul className="cart-recipe-summary-list">
                  <li><strong>Strength:</strong> {strengthLabels[settings.strength]}</li>
                  <li><strong>Milk:</strong> {milkLabels[settings.milk]}</li>
                  <li><strong>Sweetness:</strong> {sweetnessLabels[settings.sweetness]}</li>
                  <li><strong>Temperature:</strong> {tempLabels[settings.temp]}</li>
                </ul>
                <div className="cart-price-tag">
                  <span>Total Due:</span>
                  <span className="cart-price-val">${price.toFixed(2)}</span>
                </div>
              </div>
              <button className="checkout-proceed-btn" onClick={() => setCartStage('payment')}>
                Proceed to Checkout
              </button>
            </div>
          )}

          {cartStage === 'payment' && (
            <div className="cart-stage-payment">
              <h2>Select Payment Method</h2>
              
              <div className="payment-options-grid">
                <button 
                  className={`payment-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => startPaymentProcess('upi')}
                >
                  <span className="pay-icon">📱</span>
                  <span>UPI Payment</span>
                </button>
                <button 
                  className={`payment-method-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => startPaymentProcess('netbanking')}
                >
                  <span className="pay-icon">🏦</span>
                  <span>Net Banking</span>
                </button>
                <button 
                  className={`payment-method-btn ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                  onClick={() => startPaymentProcess('razorpay')}
                >
                  <span className="pay-icon">💳</span>
                  <span>Razorpay Checkout</span>
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <form className="payment-form upi-form animate-fade" onSubmit={handleUPISubmit}>
                  <h3>UPI Transfer</h3>
                  <div className="form-group">
                    <label>Enter UPI ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="username@bank"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                    />
                  </div>
                  <div className="upi-qr-section">
                    <div className="mock-qr-code">
                      <div className="qr-box">
                        <div className="qr-corner top-left"></div>
                        <div className="qr-corner top-right"></div>
                        <div className="qr-corner bottom-left"></div>
                        <div className="qr-center-dot"></div>
                      </div>
                    </div>
                    <p>Or scan this QR code using GPay, PhonePe, or Paytm</p>
                  </div>
                  <button type="submit" className="payment-submit-btn" disabled={paymentState === 'processing'}>
                    {paymentState === 'processing' ? 'Verifying Payment...' : `Pay $${price.toFixed(2)}`}
                  </button>
                </form>
              )}

              {paymentMethod === 'netbanking' && (
                <form className="payment-form netbanking-form animate-fade" onSubmit={handleNetbankingSubmit}>
                  <h3>Secure Net Banking</h3>
                  
                  {bankLoginState === 'login' && (
                    <div className="bank-login-fields">
                      <div className="form-group">
                        <label>Select Bank</label>
                        <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} required>
                          <option value="">-- Choose your Bank --</option>
                          <option value="sbi">State Bank of India (SBI)</option>
                          <option value="hdfc">HDFC Bank</option>
                          <option value="icici">ICICI Bank</option>
                          <option value="axis">Axis Bank</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>User ID</label>
                        <input type="text" required placeholder="User ID" value={bankUser} onChange={e => setBankUser(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input type="password" required placeholder="Password" value={bankPassword} onChange={e => setBankPassword(e.target.value)} />
                      </div>
                      <button type="submit" className="payment-submit-btn">Continue Login</button>
                    </div>
                  )}

                  {bankLoginState === 'otp' && (
                    <div className="bank-otp-fields">
                      <p className="otp-alert">🔒 A 6-digit OTP has been sent to your registered mobile number ending in 8890.</p>
                      <div className="form-group">
                        <label>Enter One-Time Password (OTP)</label>
                        <input type="text" required maxLength="6" placeholder="******" value={bankOtp} onChange={e => setBankOtp(e.target.value)} />
                      </div>
                      <button type="submit" className="payment-submit-btn" disabled={paymentState === 'processing'}>
                        {paymentState === 'processing' ? 'Authorizing...' : 'Authorize Transaction'}
                      </button>
                    </div>
                  )}
                </form>
              )}

              <button className="checkout-back-btn" onClick={() => setCartStage('summary')}>
                ← Back to Order Summary
              </button>
            </div>
          )}

          {cartStage === 'brewing' && (
            <div className="cart-stage-brewing text-center">
              <h2>Now Brewing</h2>
              <div className="brewing-tracker-visual">
                <div className="progress-ring-container">
                  <svg className="progress-ring" width="120" height="120">
                    <circle className="progress-ring-bg" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" r="50" cx="60" cy="60" />
                    <circle 
                      className="progress-ring-fill" 
                      stroke="var(--color-gold)" 
                      strokeWidth="8" 
                      fill="transparent" 
                      r="50" 
                      cx="60" 
                      cy="60" 
                      style={{
                        strokeDasharray: '314.16',
                        strokeDashoffset: (314.16 - (314.16 * (15 - brewingTimeLeft)) / 15).toString()
                      }}
                    />
                  </svg>
                  <div className="progress-ring-timer">{brewingTimeLeft}s</div>
                </div>
                <h3 className="brewing-status-text">{brewingStage}</h3>
              </div>

              {brewingTimeLeft > 0 ? (
                <div className="brewing-infographics">
                  <p>Our baristas are preparing your custom recipe at the pickup counter.</p>
                  <div className="brewing-steps-indicator">
                    <span className={`step-dot ${brewingTimeLeft <= 15 ? 'active' : ''}`}>Grind</span>
                    <span className={`step-dot ${brewingTimeLeft <= 12 ? 'active' : ''}`}>Brew</span>
                    <span className={`step-dot ${brewingTimeLeft <= 9 ? 'active' : ''}`}>Froth</span>
                    <span className={`step-dot ${brewingTimeLeft <= 6 ? 'active' : ''}`}>Blend</span>
                    <span className={`step-dot ${brewingTimeLeft === 0 ? 'active' : ''}`}>Ready</span>
                  </div>
                </div>
              ) : (
                <div className="brewing-ready-infographics animate-zoom">
                  <div className="ready-cup-icon">🎁</div>
                  <h3>Your order is ready!</h3>
                  <p>Proceed to pickup counter <strong>#3 (Barista Station)</strong> at your selected location.</p>
                  <p className="order-ticket-id">Order Ticket: <strong>#MB-{Math.floor(1000 + Math.random() * 9000)}</strong></p>
                  <button className="order-done-btn" onClick={() => { setCartOpen(false); setCartStage('summary'); }}>
                    Done & Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Razorpay Mock Checkout Modal */}
      {razorpayOpen && (
        <div className="razorpay-overlay">
          <div className="razorpay-modal animate-zoom">
            <div className="razorpay-header">
              <div className="razorpay-logo">
                <span className="rzp-blue">Razor</span>pay
              </div>
              <button className="rzp-close" onClick={() => { setRazorpayOpen(false); setPaymentState('idle'); }}>&times;</button>
            </div>
            
            <div className="razorpay-body">
              <div className="merchant-info">
                <h3>Mocha Brew Coffee Co.</h3>
                <p>Order custom coffee brew shake</p>
                <div className="rzp-amount">${price.toFixed(2)}</div>
              </div>

              <div className="rzp-mock-cards">
                <h4>Simulated Secure Payments</h4>
                <div className="rzp-payment-option" onClick={handleRazorpayPay}>
                  <span className="rzp-pay-icon">🏦</span>
                  <div className="rzp-pay-txt">
                    <strong>Netbanking</strong>
                    <span>Pay using pre-authorized demo bank account</span>
                  </div>
                </div>
                <div className="rzp-payment-option" onClick={handleRazorpayPay}>
                  <span className="rzp-pay-icon">📱</span>
                  <div className="rzp-pay-txt">
                    <strong>UPI/QR</strong>
                    <span>Pay using any demo UPI app</span>
                  </div>
                </div>
                <div className="rzp-payment-option" onClick={handleRazorpayPay}>
                  <span className="rzp-pay-icon">💳</span>
                  <div className="rzp-pay-txt">
                    <strong>Debit/Credit Card</strong>
                    <span>Pay with simulated demo Visa/Mastercard</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="razorpay-footer">
              <span>🔒 Secured by Razorpay</span>
              <span>Test Mode</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Social Proof Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div className="social-toast animate-slide-in" key={t.id}>
            <div className="toast-bell">🔔</div>
            <p className="toast-text">{t.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
