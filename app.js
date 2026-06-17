document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
      menuToggle.setAttribute('aria-expanded', !expanded);
    });
  }

  // 2. Scroll Animation Observer
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  if (animateElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));
  }

  // 3. Before/After Image Slider
  const sliders = document.querySelectorAll('.slider-wrapper');
  
  sliders.forEach(slider => {
    const handle = slider.querySelector('.slider-handle');
    const afterImage = slider.querySelector('.slider-after');
    let isDragging = false;

    function moveSlider(x) {
      const rect = slider.getBoundingClientRect();
      let position = ((x - rect.left) / rect.width) * 100;
      
      // Keep within bounds
      if (position < 0) position = 0;
      if (position > 100) position = 100;

      afterImage.style.width = `${position}%`;
      handle.style.left = `${position}%`;
    }

    // Mouse Events
    slider.addEventListener('mousedown', (e) => {
      // Only drag if left click
      if (e.button !== 0) return;
      isDragging = true;
      moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      moveSlider(e.clientX);
    });

    // Touch Events (Mobile)
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      moveSlider(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      moveSlider(e.touches[0].clientX);
    });
  });

  // 4. HVAC Installation Price Calculator
  const calcHomeSize = document.getElementById('calc-home-size');
  const sizeValue = document.getElementById('size-value');
  const systemOptions = document.querySelectorAll('.calc-option[data-type]');
  const efficiencyOptions = document.querySelectorAll('.calc-option[data-efficiency]');
  const addOnChecks = document.querySelectorAll('.calc-checkboxes input[type="checkbox"]');
  
  // Results Elements
  const resEquip = document.getElementById('res-equip');
  const resAddons = document.getElementById('res-addons');
  const resTax = document.getElementById('res-tax');
  const resRebates = document.getElementById('res-rebates');
  const resTotal = document.getElementById('res-total');

  let selectedSystem = 'heat-pump';
  let selectedEfficiency = 'high';

  if (calcHomeSize && sizeValue) {
    // Update size text on slider change
    calcHomeSize.addEventListener('input', (e) => {
      sizeValue.textContent = Number(e.target.value).toLocaleString();
      calculateEstimates();
    });

    // System Selection
    systemOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        systemOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedSystem = opt.getAttribute('data-type');
        calculateEstimates();
      });
    });

    // Efficiency Selection
    efficiencyOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        efficiencyOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedEfficiency = opt.getAttribute('data-efficiency');
        calculateEstimates();
      });
    });

    // Add-ons Change
    addOnChecks.forEach(check => {
      check.addEventListener('change', calculateEstimates);
    });

    function calculateEstimates() {
      const sqft = Number(calcHomeSize.value);

      // Base Cost Multipliers per sqft
      const systemRates = {
        'ac-only': 2.75,
        'heat-pump': 3.75,
        'split-system': 4.25,
        'mini-split': 5.50
      };

      const efficiencyRates = {
        'standard': 1.0,
        'high': 1.25,
        'ultra': 1.55
      };

      // Calculate base cost
      const baseCost = sqft * systemRates[selectedSystem] * efficiencyRates[selectedEfficiency];

      // Add-on Cost Calculation
      let addonsCost = 0;
      addOnChecks.forEach(check => {
        if (check.checked) {
          addonsCost += Number(check.value);
        }
      });

      const subtotal = baseCost + addonsCost;

      // Tax Credit Calculation (IRA 25C)
      let taxCredit = 0;
      if (selectedSystem === 'heat-pump') {
        // Heat Pumps qualify for 30% up to $2000
        taxCredit = Math.min(subtotal * 0.30, 2000);
      } else if (selectedSystem === 'split-system' || selectedSystem === 'ac-only') {
        // High efficiency AC / Furnace qualifies up to $600 if High/Ultra
        if (selectedEfficiency !== 'standard') {
          taxCredit = Math.min(subtotal * 0.30, 600);
        }
      }

      // Utility Rebates
      let rebates = 0;
      if (selectedSystem === 'heat-pump') {
        rebates = selectedEfficiency === 'ultra' ? 1000 : (selectedEfficiency === 'high' ? 750 : 400);
      } else if (selectedEfficiency === 'ultra') {
        rebates = 500;
      } else if (selectedEfficiency === 'high') {
        rebates = 250;
      }

      const total = subtotal - taxCredit - rebates;

      // Update UI
      resEquip.textContent = `$${Math.round(baseCost).toLocaleString()}`;
      resAddons.textContent = `$${Math.round(addonsCost).toLocaleString()}`;
      resTax.textContent = `-$${Math.round(taxCredit).toLocaleString()}`;
      resRebates.textContent = `-$${Math.round(rebates).toLocaleString()}`;
      resTotal.textContent = `$${Math.round(total).toLocaleString()}`;
    }

    // Run initial calculation
    calculateEstimates();
  }

  // 5. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Collapse all others
        faqItems.forEach(el => el.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 6. Scroll Gear Background Animation
  if (!document.querySelector('.floating-svg-bg')) {
    const bgContainer = document.createElement('div');
    bgContainer.className = 'floating-svg-bg';
    bgContainer.innerHTML = `
      <svg viewBox="0 0 800 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" class="floating-svg">
        <path d="M0,300 C200,100 600,500 800,300" class="floating-path"/>
        <path d="M0,400 C200,200 600,600 800,400" class="floating-path"/>
        <path d="M0,200 C200,0 600,400 800,200" class="floating-path"/>
      </svg>
    `;
    document.body.insertBefore(bgContainer, document.body.firstChild);
  }

  if (!document.querySelector('.gear-background')) {
    const gearContainer = document.createElement('div');
    gearContainer.className = 'gear-background';
    
    const sideGears = [
      { top: '8%', side: 'left', offset: '-60px', size: 140, direction: 1 },
      { top: '18%', side: 'right', offset: '-50px', size: 120, direction: -1 },
      { top: '28%', side: 'left', offset: '-40px', size: 100, direction: 1 },
      { top: '38%', side: 'right', offset: '-60px', size: 150, direction: -1 },
      { top: '48%', side: 'left', offset: '-50px', size: 110, direction: 1 },
      { top: '58%', side: 'right', offset: '-40px', size: 130, direction: -1 },
      { top: '68%', side: 'left', offset: '-60px', size: 140, direction: 1 },
      { top: '78%', side: 'right', offset: '-50px', size: 120, direction: -1 },
      { top: '88%', side: 'left', offset: '-40px', size: 100, direction: 1 },
      { top: '95%', side: 'right', offset: '-60px', size: 150, direction: -1 }
    ];

    const midGears = [
      // Cluster 1 (top-middle) - Interlocking Group (Spread out)
      { left: 'calc(50vw - 270px)', top: '12%', size: 200, direction: 1 },
      { left: 'calc(50vw - 90px)', top: '9%', size: 170, direction: -1 },
      { left: 'calc(50vw + 70px)', top: '12%', size: 140, direction: 1 },
      { left: 'calc(50vw + 180px)', top: '7%', size: 110, direction: -1 },
      { left: 'calc(50vw - 200px)', top: '25%', size: 160, direction: -1 },
      { left: 'calc(50vw - 45px)', top: '28%', size: 140, direction: 1 },
      { left: 'calc(50vw + 90px)', top: '25%', size: 130, direction: -1 },

      // Cluster 2 (mid-middle) - Interlocking Group (Spread out)
      { left: 'calc(50vw - 200px)', top: '38%', size: 220, direction: 1 },
      { left: 'calc(50vw + 15px)', top: '35%', size: 190, direction: -1 },
      { left: 'calc(50vw - 340px)', top: '42%', size: 150, direction: -1 },
      { left: 'calc(50vw - 90px)', top: '54%', size: 180, direction: 1 },
      { left: 'calc(50vw + 80px)', top: '52%', size: 130, direction: 1 },
      { left: 'calc(50vw - 215px)', top: '61%', size: 160, direction: -1 },
      { left: 'calc(50vw + 25px)', top: '63%', size: 150, direction: -1 },

      // Cluster 3 (bottom-middle) - Interlocking Group (Spread out)
      { left: 'calc(50vw - 225px)', top: '68%', size: 240, direction: 1 },
      { left: 'calc(50vw + 15px)', top: '65%', size: 180, direction: -1 },
      { left: 'calc(50vw - 360px)', top: '72%', size: 150, direction: -1 },
      { left: 'calc(50vw - 80px)', top: '84%', size: 200, direction: 1 },
      { left: 'calc(50vw + 90px)', top: '82%', size: 130, direction: 1 },
      { left: 'calc(50vw - 200px)', top: '91%', size: 160, direction: -1 },
      { left: 'calc(50vw + 55px)', top: '93%', size: 150, direction: -1 }
    ];

    let gearHTML = '';
    
    // Render side gears
    sideGears.forEach((config, idx) => {
      gearHTML += `
        <div class="scroll-gear-wrapper gear-side-${idx + 1}" data-direction="${config.direction}" style="top: ${config.top}; ${config.side}: ${config.offset}; --direction: ${config.direction};">
          <svg class="scroll-gear" viewBox="0 0 100 100" width="${config.size}" height="${config.size}">
            <circle cx="50" cy="50" r="30" fill="none" stroke="var(--primary)" stroke-width="3" stroke-opacity="0.12" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="var(--primary)" stroke-width="3" stroke-opacity="0.12" />
            <g fill="var(--primary)" fill-opacity="0.12">
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(0 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(30 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(60 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(90 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(120 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(150 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(180 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(210 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(240 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(270 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(300 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(330 50 50)" />
            </g>
          </svg>
        </div>
      `;
    });

    // Render middle gears (More prominent 0.09 opacity)
    midGears.forEach((config, idx) => {
      gearHTML += `
        <div class="scroll-gear-wrapper gear-mid-${idx + 1}" data-direction="${config.direction}" style="top: ${config.top}; left: ${config.left}; --direction: ${config.direction};">
          <svg class="scroll-gear" viewBox="0 0 100 100" width="${config.size}" height="${config.size}">
            <circle cx="50" cy="50" r="30" fill="none" stroke="var(--primary)" stroke-width="3" stroke-opacity="0.09" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="var(--primary)" stroke-width="3" stroke-opacity="0.09" />
            <g fill="var(--primary)" fill-opacity="0.09">
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(0 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(30 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(60 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(90 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(120 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(150 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(180 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(210 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(240 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(270 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(300 50 50)" />
              <rect x="46" y="10" width="8" height="15" rx="2" transform="rotate(330 50 50)" />
            </g>
          </svg>
        </div>
      `;
    });

    gearContainer.innerHTML = gearHTML;
    document.body.appendChild(gearContainer);

    let lastScrollY = window.scrollY;
    let dropletTimer = 0;
    let ticking = false;

    // Set initial scroll variable
    document.documentElement.style.setProperty('--scroll-y', window.scrollY);

    window.addEventListener('scroll', () => {
      // Don't run calculations on mobile screens where gears are hidden
      if (window.innerWidth <= 768) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          document.documentElement.style.setProperty('--scroll-y', scrollY);

          const diff = scrollY - lastScrollY;
          lastScrollY = scrollY;

          if (Math.abs(diff) > 2) {
            dropletTimer += Math.abs(diff);
            if (dropletTimer > 160) {
              dropletTimer = 0;
              spawnDroplet(gearContainer);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function spawnDroplet(container) {
    const wrappers = container.querySelectorAll('.scroll-gear-wrapper');
    if (wrappers.length === 0) return;
    const randomWrapper = wrappers[Math.floor(Math.random() * wrappers.length)];
    const rect = randomWrapper.getBoundingClientRect();

    const droplet = document.createElement('div');
    droplet.className = 'water-droplet';
    
    // Calculate page coordinates
    const leftPos = rect.left + rect.width / 2;
    const topPos = rect.top + rect.height - 10;

    droplet.style.left = `${leftPos}px`;
    droplet.style.top = `${topPos + window.scrollY}px`;

    document.body.appendChild(droplet);

    droplet.addEventListener('animationend', () => {
      droplet.remove();
    });
  }

  // 7. Dynamic Reviews Widget IntersectionObserver Loader
  const widgetContainers = document.querySelectorAll('[data-lazy-widget]');
  if (widgetContainers.length > 0) {
    const loadWidget = (container) => {
      if (container.dataset.loaded) return;
      container.dataset.loaded = 'true';

      // Inject the reputation assets script if not already present in the head
      if (!document.querySelector('script[src*="review-widget.js"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://links.parkersonsheatingandair.com/reputation/assets/review-widget.js';
        script.async = true;
        document.head.appendChild(script);
      }

      // Create and lazy load the reviews iframe
      const iframe = document.createElement('iframe');
      iframe.className = 'lc_reviews_widget';
      iframe.src = 'https://links.parkersonsheatingandair.com/reputation/widgets/review_widget/LqwLZsneY7F7aDmRgp6y';
      iframe.frameBorder = '0';
      iframe.scrolling = 'no';
      iframe.style.minWidth = '100%';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.setAttribute('loading', 'lazy');

      // Fade-in when fully loaded
      iframe.addEventListener('load', () => {
        container.classList.add('iframe-loaded');
      });

      container.appendChild(iframe);

      // Backup fallback in case the load event does not trigger or is blocked
      setTimeout(() => {
        container.classList.add('iframe-loaded');
      }, 4000);
    };

    const widgetObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadWidget(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px' });

    widgetContainers.forEach(container => widgetObserver.observe(container));
  }
});
