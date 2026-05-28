import { RESTAURANTS_DATA, PHRASES_DATA } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // State Variables
  // ==========================================
  let currentRestaurantId = 1;
  let currentGalleryImages = [];
  let activeLightboxIndex = 0;

  // Clone database locally so reviews append in-session
  const restaurants = [...RESTAURANTS_DATA];

  // Section Curation Mapping based on updated 12-restaurant sheet
  const SECTIONS_CONFIG = {
    tourist: [1, 2, 3, 4, 5, 6, 7],     // 관광객이라면 가성비와 갬성을 한번에!
    luxury: [8, 9, 10, 11, 12, 13, 14],      // 베트남만의 고급 로컬 다이닝
    korean: [15, 16, 17, 18, 19, 20, 21],    // 한국인이 사랑하는 핫플레이스
    hotel: [22, 23, 24, 25, 26, 27, 28],     // 호텔 근처 럭셔리 맛집
    cafe: [29, 30, 31, 32, 33, 34, 35]       // 커피 & 디저트
  };

  // ==========================================
  // DOM Elements Selector
  // ==========================================
  const listView = document.getElementById('list-view');
  const detailView = document.getElementById('detail-view');
  
  // Section Grid Containers
  const gridTourist = document.getElementById('grid-tourist');
  const gridLuxury = document.getElementById('grid-luxury');
  const gridKorean = document.getElementById('grid-korean');
  const gridHotel = document.getElementById('grid-hotel');
  const gridCafe = document.getElementById('grid-cafe');

  // Calculator inputs
  const calcKrwInput = document.getElementById('calc-krw');
  const calcVndInput = document.getElementById('calc-vnd');

  // Detail Screen Elements
  const detailGallerySlider = document.getElementById('detail-gallery-slider');
  const galleryDotsContainer = document.getElementById('gallery-dots');
  
  const detailRestaurantName = document.getElementById('detail-restaurant-name');
  const detailRestaurantEng = document.getElementById('detail-restaurant-eng');
  const detailRatingScore = document.getElementById('detail-rating-score');
  const detailReviewsLink = document.getElementById('detail-reviews-link');
  const detailReviewsCnt = document.getElementById('detail-reviews-cnt');
  const detailTagsContainer = document.getElementById('detail-tags-container');
  const detailIntroText = document.getElementById('detail-intro-text');
  
  const detailInfoMenu = document.getElementById('detail-info-menu');
  const detailInfoHours = document.getElementById('detail-info-hours');
  const detailInfoPhone = document.getElementById('detail-info-phone');
  const phoneInfoRow = document.getElementById('phone-info-row');
  const detailInfoAddress = document.getElementById('detail-info-address');
  const detailInfoMapLink = document.getElementById('detail-info-map-link');
  
  // Reviews elements
  const detailReviewsList = document.getElementById('detail-reviews-list');

  // Hero & Floating Buttons (New)
  const heroTitle = document.getElementById('hero-title');
  const detailFabContainer = document.getElementById('detail-fab-container');
  const detailFabPhone = document.getElementById('detail-fab-phone');
  const detailFabMap = document.getElementById('detail-fab-map');
  
  // Lightbox elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxImg = document.getElementById('lightbox-img');

  // FAB Menu elements
  const fabMenuBtn = document.getElementById('fab-menu-btn');
  const fabMenuOverlay = document.getElementById('fab-menu-overlay');
  const fabMenuClose = document.getElementById('fab-menu-close');
  const fabMenuList = document.getElementById('fab-menu-list');

  // ==========================================
  // Core Functions
  // ==========================================

  // Initialize Application
  function init() {
    renderAllSections();
    setupCalculator();
    setupFabMenu();
    initPhrasesSlider();
    setupEventListeners();
  }

  // Render a specific section grid
  function renderSectionGrid(container, ids) {
    container.innerHTML = '';
    
    const sectionRestaurants = ids.map(id => restaurants.find(r => r.id === id)).filter(Boolean);

    // Sort by rating desc, then by review count (numeric) desc
    sectionRestaurants.sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      // Parse reviewsCount: remove commas and convert to number
      const countA = parseInt((a.reviewsCount || '0').replace(/,/g, ''), 10) || 0;
      const countB = parseInt((b.reviewsCount || '0').replace(/,/g, ''), 10) || 0;
      return countB - countA;
    });

    sectionRestaurants.forEach((r, index) => {
      const hashtagsHtml = r.tags.map(tag => `<span class="card-tag">${tag}</span>`).join(' ');
      
      const badgeHtml = index < 2 
        ? `<div class="card-badge-top-left"><i class="fa-solid fa-thumbs-up"></i> 강추</div>` 
        : '';

      const card = document.createElement('div');
      card.className = 'restaurant-card fade-in-up';
      card.innerHTML = `
        <div class="card-img-wrapper">
          ${r.images && r.images.length > 0 
            ? `<img class="card-img" src="${r.images[0]}" alt="${r.name}" loading="lazy" referrerpolicy="no-referrer">` 
            : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#e2e8f0; color:#94a3b8; font-size:2rem;"><i class="fa-solid fa-image"></i></div>`
          }
        </div>
        
        <!-- Recommendation Badge -->
        ${badgeHtml}
        
        <!-- Card Text Overlay -->
        <div class="card-overlay">
          <div class="card-short-intro">
            ${r.intro}
          </div>
          <h3 class="card-title">${r.name}</h3>
          
          <div class="card-rating-line">
            <i class="fa-solid fa-star"></i>
            <span>${r.rating}</span>
            ${r.reviewsCount ? `<span>· 리뷰 ${r.reviewsCount}개</span>` : ''}
          </div>
          
          <div class="card-hashtags">
            ${hashtagsHtml}
          </div>
        </div>
      `;
      
      // Click card to navigate to detail page
      card.addEventListener('click', () => {
        showDetailView(r.id);
      });
      
      container.appendChild(card);
    });
  }

  // Render all curation grids
  function renderAllSections() {
    renderSectionGrid(gridHotel, SECTIONS_CONFIG.hotel);
    renderSectionGrid(gridTourist, SECTIONS_CONFIG.tourist);
    renderSectionGrid(gridLuxury, SECTIONS_CONFIG.luxury);
    renderSectionGrid(gridKorean, SECTIONS_CONFIG.korean);
    renderSectionGrid(gridCafe, SECTIONS_CONFIG.cafe);
    setupPCSliders();
  }

  // ==========================================
  // PC Carousel Slider (4 cards visible, arrow nav, move one at a time)
  // ==========================================
  function setupPCSliders() {
    const wrappers = document.querySelectorAll('.slider-wrapper');

    wrappers.forEach(wrapper => {
      const grid = wrapper.querySelector('.restaurant-grid');
      const prevBtn = wrapper.querySelector('.prev-btn');
      const nextBtn = wrapper.querySelector('.next-btn');
      if (!grid || !prevBtn || !nextBtn) return;

      function getScrollStep() {
        const card = grid.querySelector('.restaurant-card');
        if (!card) return 0;
        const cardWidth = card.getBoundingClientRect().width;
        const style = window.getComputedStyle(grid);
        const gap = parseFloat(style.columnGap || style.gap) || 0;
        return cardWidth + gap;
      }

      function updateButtonStates() {
        // Disable prevBtn if we are at or near the start (scrollLeft <= 5)
        prevBtn.disabled = grid.scrollLeft <= 5;
        
        // Disable nextBtn if we are at or near the end (scrollLeft + clientWidth >= scrollWidth - 5)
        nextBtn.disabled = (grid.scrollLeft + grid.clientWidth) >= (grid.scrollWidth - 5);
      }

      prevBtn.addEventListener('click', () => {
        const step = getScrollStep();
        grid.scrollBy({ left: -step, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        const step = getScrollStep();
        grid.scrollBy({ left: step, behavior: 'smooth' });
      });

      // Listen to scroll events to update button states
      grid.addEventListener('scroll', updateButtonStates);

      // Listen to window resize to update button states
      window.addEventListener('resize', updateButtonStates);

      // Initial state check after rendering
      setTimeout(updateButtonStates, 100);
    });
  }

  // Show Detail View and Load Specific Restaurant Details
  function showDetailView(id) {
    currentRestaurantId = id;
    const r = restaurants.find(item => item.id === id);
    if (!r) return;
    
    // Toggle screen views
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');
    detailFabContainer.classList.remove('hidden');
    
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load base texts
    detailRestaurantName.innerHTML = `${r.name} <span style="font-size: 1.1rem; font-weight: 500; color: var(--text-secondary); margin-left: 8px;" id="detail-restaurant-eng">${r.englishName}</span>`;
    detailRestaurantEng.textContent = r.englishName;
    detailIntroText.innerHTML = r.intro;
    
    // Load rating details
    detailRatingScore.textContent = `${r.rating}/5`;
    if (r.reviewsCount) {
      detailReviewsLink.style.display = 'inline';
      detailReviewsCnt.textContent = r.reviewsCount;
    } else {
      detailReviewsLink.style.display = 'none';
    }
    
    // Populate hashtags/categories
    detailTagsContainer.innerHTML = '';
    const categoryTag = document.createElement('span');
    categoryTag.className = 'detail-tag';
    categoryTag.style.borderColor = 'var(--accent-color)';
    categoryTag.style.color = 'var(--accent-color)';
    categoryTag.innerHTML = `<i class="fa-solid fa-tag"></i> ${r.category}`;
    detailTagsContainer.appendChild(categoryTag);

    r.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'detail-tag';
      span.textContent = tag;
      detailTagsContainer.appendChild(span);
    });

    // Populate Detailed Spec Information Table
    const menuListHtml = r.menu.map(item => `<li>${item}</li>`).join('');
    detailInfoMenu.innerHTML = `<ul class="menu-list">${menuListHtml}</ul>`;
    
    detailInfoHours.innerHTML = `영업 중 &middot; 운영 시간: <strong>${r.hours}</strong>`;
    detailInfoAddress.textContent = r.address;
    
    // Handle phone number linking and visibility
    if (r.phone) {
      phoneInfoRow.classList.remove('hidden');
      detailFabPhone.classList.remove('hidden');
      
      const phoneUri = `tel:${r.phone.replace(/[^0-9+]/g, '')}`;
      detailInfoPhone.textContent = r.phone;
      detailInfoPhone.setAttribute('href', phoneUri);
      detailFabPhone.setAttribute('href', phoneUri);
    } else {
      phoneInfoRow.classList.add('hidden');
      detailFabPhone.classList.add('hidden');
    }
    
    // Links to Google Maps (Direct spreadsheet map links)
    detailInfoMapLink.setAttribute('href', r.googleMapLink);
    detailFabMap.setAttribute('href', r.googleMapLink);

    // Render photo gallery
    currentGalleryImages = r.images;
    renderGallery(r.images);

    // Render review list
    renderReviews(r.reviews);
  }

  // Render Auto-Rolling Image Gallery Slider
  let galleryInterval = null;
  let currentSlide = 0;

  function renderGallery(images) {
    if (!detailGallerySlider) return;
    detailGallerySlider.innerHTML = '';
    galleryDotsContainer.innerHTML = '';
    
    images.forEach((src, idx) => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'gallery-slide-img';
      img.referrerPolicy = 'no-referrer';
      img.addEventListener('click', () => openLightbox(idx));
      detailGallerySlider.appendChild(img);
      
      const dot = document.createElement('span');
      dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
      dot.onclick = () => goToSlide(idx);
      galleryDotsContainer.appendChild(dot);
    });

    currentSlide = 0;
    updateSlider();

    if (galleryInterval) clearInterval(galleryInterval);
    galleryInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % images.length;
      updateSlider();
    }, 3000);
  }

  function updateSlider() {
    if (!detailGallerySlider) return;
    detailGallerySlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    const dots = galleryDotsContainer.querySelectorAll('.gallery-dot');
    dots.forEach((dot, idx) => {
      dot.className = `gallery-dot ${idx === currentSlide ? 'active' : ''}`;
    });
  }

  function goToSlide(idx) {
    currentSlide = idx;
    updateSlider();
    if (galleryInterval) clearInterval(galleryInterval);
    galleryInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % currentGalleryImages.length;
      updateSlider();
    }, 3000);
  }

  // Render Reviews List
  function renderReviews(reviewsList) {
    detailReviewsList.innerHTML = '';
    
    if (reviewsList.length === 0) {
      detailReviewsList.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.9rem; padding: 20px 0;">후기가 없습니다.</p>`;
      return;
    }

    reviewsList.forEach(rev => {
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<i class="fa-${i <= rev.rating ? 'solid' : 'regular'} fa-star"></i>`;
      }

      const bubble = document.createElement('div');
      bubble.className = 'review-bubble fade-in';
      bubble.innerHTML = `
        <div class="review-header">
          <div class="review-user-info">
            <div class="review-avatar">${rev.username.charAt(0).toUpperCase()}</div>
            <div>
              <div class="review-username">${rev.username}</div>
              <div class="review-stars">${starsHtml}</div>
            </div>
          </div>
          <span class="review-date">${rev.date}</span>
        </div>
        <p class="review-text">${rev.text.replace(/\n/g, '<br>')}</p>
      `;
      
      detailReviewsList.appendChild(bubble);
    });
  }

  // Navigate back to List View
  function showListView() {
    detailView.classList.add('hidden');
    detailFabContainer.classList.add('hidden');
    listView.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Setup Exchange Rate Calculator Interactive Logic
  const RATE_KRW_TO_VND = 17.452;

  function setupCalculator() {
    calcKrwInput.addEventListener('input', (e) => {
      let rawVal = e.target.value.replace(/,/g, '');
      if (rawVal === '') {
        calcVndInput.value = '';
        return;
      }
      const krwVal = parseFloat(rawVal);
      if (isNaN(krwVal) || krwVal < 0) {
        calcVndInput.value = '';
        return;
      }
      calcKrwInput.value = krwVal.toLocaleString();
      calcVndInput.value = Math.round(krwVal * RATE_KRW_TO_VND).toLocaleString();
    });

    calcVndInput.addEventListener('input', (e) => {
      let rawVal = e.target.value.replace(/,/g, '');
      if (rawVal === '') {
        calcKrwInput.value = '';
        return;
      }
      const vndVal = parseFloat(rawVal);
      if (isNaN(vndVal) || vndVal < 0) {
        calcKrwInput.value = '';
        return;
      }
      calcVndInput.value = vndVal.toLocaleString();
      calcKrwInput.value = Math.round(vndVal / RATE_KRW_TO_VND).toLocaleString();
    });

    // Initialize calculator values dynamically on load
    const initialKrw = parseFloat(calcKrwInput.value.replace(/,/g, '')) || 10000;
    calcKrwInput.value = initialKrw.toLocaleString();
    calcVndInput.value = Math.round(initialKrw * RATE_KRW_TO_VND).toLocaleString();
  }

  // Setup FAB Menu List and Events
  function setupFabMenu() {
    if (!fabMenuBtn) return;
    
    fabMenuList.innerHTML = '';

    // Group restaurants by category (preserve section order)
    const sectionOrder = [
      '호텔 근처 럭셔리 맛집',
      '관광객이라면 가성비와 갬성을 한번에!',
      '베트남만의 고급 로컬 다이닝',
      '한국인이 사랑하는 핫플레이스',
      '커피 & 디저트'
    ];
    const sectionIcons = {
      '관광객이라면 가성비와 갬성을 한번에!': 'fa-wallet',
      '베트남만의 고급 로컬 다이닝': 'fa-award',
      '한국인이 사랑하는 핫플레이스': 'fa-heart',
      '호텔 근처 럭셔리 맛집': 'fa-bed',
      '커피 & 디저트': 'fa-mug-hot'
    };

    const grouped = {};
    restaurants.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push(r);
    });

    sectionOrder.forEach((category, idx) => {
      const items = grouped[category];
      if (!items || items.length === 0) return;

      // Section header
      const header = document.createElement('li');
      header.className = 'fab-section-header';
      const icon = sectionIcons[category] || 'fa-utensils';
      header.innerHTML = `<i class="fa-solid ${icon}"></i><span>${category}</span>`;
      fabMenuList.appendChild(header);

      // Chips container
      const chipsRow = document.createElement('li');
      chipsRow.className = 'fab-chips-row';
      items.forEach(r => {
        const chip = document.createElement('button');
        chip.className = 'fab-chip';
        chip.textContent = r.name;
        chip.addEventListener('click', () => {
          fabMenuOverlay.classList.add('hidden');
          showDetailView(r.id);
        });
        chipsRow.appendChild(chip);
      });
      fabMenuList.appendChild(chipsRow);

      // Divider (except after last section)
      if (idx < sectionOrder.length - 1) {
        const divider = document.createElement('li');
        divider.className = 'fab-divider';
        fabMenuList.appendChild(divider);
      }
    });

    fabMenuBtn.addEventListener('click', () => {
      fabMenuOverlay.classList.remove('hidden');
    });
    
    fabMenuClose.addEventListener('click', () => {
      fabMenuOverlay.classList.add('hidden');
    });
    
    fabMenuOverlay.addEventListener('click', (e) => {
      if (e.target === fabMenuOverlay) {
        fabMenuOverlay.classList.add('hidden');
      }
    });
  }

  // ==========================================
  // Phrases Slider Setup
  // ==========================================
  function initPhrasesSlider() {
    const slider = document.getElementById('phrases-slider');
    const dotsContainer = document.getElementById('phrases-dots');
    if (!slider || !dotsContainer || typeof PHRASES_DATA === 'undefined') return;

    slider.innerHTML = '';
    dotsContainer.innerHTML = '';

    const pageSize = 6;
    const totalPages = Math.ceil(PHRASES_DATA.length / pageSize);

    for (let i = 0; i < totalPages; i++) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'phrases-page';

      const pagePhrases = PHRASES_DATA.slice(i * pageSize, (i + 1) * pageSize);
      pagePhrases.forEach(p => {
        const row = document.createElement('div');
        row.className = 'phrase-row';
        row.innerHTML = `
          <div class="phrase-kr">${p.kr}</div>
          <div class="phrase-vn-wrapper">
            <span class="phrase-vn">${p.vn}</span>
            <span class="phrase-ko">[${p.ko}]</span>
          </div>
        `;
        pageDiv.appendChild(row);
      });

      slider.appendChild(pageDiv);

      const dot = document.createElement('span');
      dot.className = `phrase-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        slider.scrollTo({ left: slider.clientWidth * i, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    }

    slider.addEventListener('scroll', () => {
      const activeIdx = Math.round(slider.scrollLeft / slider.clientWidth);
      const dots = dotsContainer.querySelectorAll('.phrase-dot');
      dots.forEach((dot, idx) => {
        dot.className = `phrase-dot ${idx === activeIdx ? 'active' : ''}`;
      });
    });
  }

  // ==========================================
  // Lightbox Modal Controls
  // ==========================================
  function openLightbox(index) {
    activeLightboxIndex = index;
    lightboxImg.src = currentGalleryImages[activeLightboxIndex];
    lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
  }

  function navigateLightbox(dir) {
    activeLightboxIndex += dir;
    if (activeLightboxIndex < 0) {
      activeLightboxIndex = currentGalleryImages.length - 1;
    } else if (activeLightboxIndex >= currentGalleryImages.length) {
      activeLightboxIndex = 0;
    }
    lightboxImg.src = currentGalleryImages[activeLightboxIndex];
    
    document.querySelectorAll('.gallery-dot').forEach((dot, idx) => {
      dot.className = `gallery-dot ${idx === activeLightboxIndex ? 'active' : ''}`;
    });
  }

  // ==========================================
  // Setup Event Listeners
  // ==========================================
  function setupEventListeners() {

    heroTitle.addEventListener('click', () => {
      if (!listView.classList.contains('hidden')) return;
      showListView();
    });
    heroTitle.style.cursor = 'pointer';

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (lightboxModal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
  }

  // ==========================================
  // Trigger init on load
  // ==========================================
  init();
});
