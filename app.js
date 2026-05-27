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
    tourist: [1, 2, 3, 4],     // 관광객이라면 가성비와 갬성을 한번에! (짜까탕롱, 꽌안응온, 잠바가든, 멧)
    luxury: [5, 6, 7, 8],      // 베트남만의 고급 로컬 다이닝 (짜오반, 떰비, 룩락, 챕터 다이닝)
    korean: [9, 10, 11, 12]    // 한국인이 사랑하는 핫플레이스 (분짜 흐엉리엔, 분짜닥킴, 퍼텐리궉수, 분보남보백프응)
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

    sectionRestaurants.forEach((r, index) => {
      const hashtagsHtml = r.tags.map(tag => `<span class="card-tag">${tag}</span>`).join(' ');
      
      const recommendedIds = [1, 4, 5, 6];
      const badgeHtml = recommendedIds.includes(r.id) 
        ? `<div class="card-badge-top-left"><i class="fa-solid fa-thumbs-up"></i> 강추</div>` 
        : '';

      const card = document.createElement('div');
      card.className = 'restaurant-card fade-in-up';
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img class="card-img" src="${r.images[0]}" alt="${r.name}" loading="lazy">
        </div>
        
        <!-- Recommendation Badge -->
        ${badgeHtml}
        
        <!-- Card Text Overlay -->
        <div class="card-overlay">
          <div class="card-short-intro">
            ${r.shortIntro}
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

  // Render all three curation grids
  function renderAllSections() {
    renderSectionGrid(gridTourist, SECTIONS_CONFIG.tourist);
    renderSectionGrid(gridLuxury, SECTIONS_CONFIG.luxury);
    renderSectionGrid(gridKorean, SECTIONS_CONFIG.korean);
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
  const RATE_KRW_TO_VND = 17.5131;

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
  }

  // Setup FAB Menu List and Events
  function setupFabMenu() {
    if (!fabMenuBtn) return;
    
    fabMenuList.innerHTML = '';
    
    restaurants.forEach(r => {
      const li = document.createElement('li');
      li.className = 'fab-list-item';
      li.innerHTML = `
        <span class="fab-list-name">${r.name}</span>
        <span class="fab-list-rating"><i class="fa-solid fa-star"></i> ${r.rating}</span>
      `;
      li.addEventListener('click', () => {
        fabMenuOverlay.classList.add('hidden');
        showDetailView(r.id);
      });
      fabMenuList.appendChild(li);
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
