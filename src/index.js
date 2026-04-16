import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './router';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { SecurityErrorBoundary, SecurityUtils } from './utils/Security';

/* ✅ 0. GLOBAL SCROLL REFRESH ON LOAD */
const handleInitialLoadRefresh = () => {
  window.addEventListener('load', () => {
    // Refresh AOS and ScrollTrigger after all resources (images, fonts, lottie) are fully loaded
    setTimeout(() => {
      if (window.gsap && window.gsap.utils) {
         const ScrollTrigger = window.gsap.utils.toArray(window.gsap.plugins).find(p => p.name === "ScrollTrigger");
         if (ScrollTrigger) ScrollTrigger.refresh();
      }
      
      // Refresh AOS if it exists
      if (window.AOS) {
         window.AOS.refresh();
      }

      // Final safety refresh after another delay to catch the slow Lottie renders
      setTimeout(() => {
        if (window.gsap && window.gsap.utils) {
          const ScrollTrigger = window.gsap.utils.toArray(window.gsap.plugins).find(p => p.name === "ScrollTrigger");
          if (ScrollTrigger) ScrollTrigger.refresh();
        }
      }, 1000);

    }, 500);
  });
};

handleInitialLoadRefresh();



/* ✅ 1. VERSION-BASED AUTOMATIC CACHE CLEARING */
const APP_VERSION = '1.0.5'; // Change this to force update

const handleVersionUpgrade = async () => {
  const savedVersion = localStorage.getItem('ssvm_version');

  // First-time visitor → just store version
  if (!savedVersion) {
    localStorage.setItem('ssvm_version', APP_VERSION);
    return;
  }

  // Version changed → clear cache + reload
  if (savedVersion !== APP_VERSION) {
    console.log(`Update detected: ${savedVersion} → ${APP_VERSION}. Clearing cache...`);

    await SecurityUtils.clearAppCache();

    localStorage.setItem('ssvm_version', APP_VERSION);

    window.location.reload();
  }
};

handleVersionUpgrade();

/* ✅ 2. PREVENT BACK/FORWARD CACHE ISSUES */
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('Page loaded from bfcache → reloading...');
    window.location.reload();
  }
});

/* ✅ 3. RENDER APP */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SecurityErrorBoundary>
      <Router />
    </SecurityErrorBoundary>
  </React.StrictMode>
);

/* ✅ 4. PERFORMANCE LOGGING */
reportWebVitals();