// ===== DOM Elements =====
const startSaHinhBtn = document.getElementById('startSaHinhBtn');
const startDuongTruongBtn = document.getElementById('startDuongTruongBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');
const ctaStartSaHinhBtn = document.getElementById('ctaStartSaHinhBtn');
const ctaStartDuongTruongBtn = document.getElementById('ctaStartDuongTruongBtn');

// ===== Audio Player =====
let currentAudio = null;

function playAudio(audioFile, title) {
    // Stop current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Create new audio instance
    currentAudio = new Audio(audioFile);

    // Show audio player modal
    showAudioPlayerModal(title, currentAudio);

    // Play audio
    currentAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Không thể phát âm thanh. Vui lòng thử lại!');
    });
}

// ===== Smooth Scroll to Sections =====
function smoothScrollTo(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Event Listeners =====
startSaHinhBtn.addEventListener('click', () => {
    startExam('thi-sa-hinh.html');
});

startDuongTruongBtn.addEventListener('click', () => {
    // TODO: Redirect to Đường Trường exam page when ready
    showComingSoonMessage('Phần thi đường trường');
});

ctaStartSaHinhBtn.addEventListener('click', () => {
    startExam('thi-sa-hinh.html');
});

ctaStartDuongTruongBtn.addEventListener('click', () => {
    // TODO: Redirect to Đường Trường exam page when ready
    showComingSoonMessage('Phần thi đường trường');
});

learnMoreBtn.addEventListener('click', () => {
    const featuresSection = document.querySelector('.features');
    smoothScrollTo(featuresSection);
});

// ===== Start Exam Function =====
function startExam(examPage) {
    // Set flag to indicate user started exam from homepage
    sessionStorage.setItem('examStarted', 'true');

    // Play audio
    const audio = new Audio('XUAT PHAT SA HINH.mp3');
    audio.play().catch(error => {
        console.log('Audio play failed, redirecting anyway...');
    });

    // Redirect after a short delay to ensure audio starts
    setTimeout(() => {
        window.location.href = examPage;
    }, 500);
}

// ===== Show Coming Soon Message =====
function showAudioPlayerModal(title, audio) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'audioPlayerOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, rgba(19, 20, 41, 0.95) 0%, rgba(10, 11, 30, 0.95) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
    `;

    const modalContent = `
        <div style="
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            position: relative;
            animation: pulse 2s ease-in-out infinite;
        ">
            <svg id="playPauseIcon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 60px; color: white;">
                <path d="M15.536 11.293L9.879 8.464C9.487 8.268 9 8.547 9 8.964V14.622C9 15.039 9.487 15.318 9.879 15.122L15.536 12.293C15.9279 12.097 15.9279 11.489 15.536 11.293Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
        </div>
        <h2 style="
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            color: white;
        ">
            ${title}
        </h2>
        <p style="
            font-size: 1rem;
            color: #a8a9c1;
            margin-bottom: 1.5rem;
        ">
            Đang phát âm thanh...
        </p>
        
        <!-- Progress Bar -->
        <div style="
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            margin-bottom: 0.75rem;
            overflow: hidden;
        ">
            <div id="audioProgress" style="
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                transition: width 0.1s linear;
                border-radius: 10px;
            "></div>
        </div>
        
        <!-- Time Display -->
        <div style="
            display: flex;
            justify-content: space-between;
            color: #6b6c8a;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
        ">
            <span id="currentTime">0:00</span>
            <span id="totalTime">0:00</span>
        </div>
        
        <!-- Control Buttons -->
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="playPauseBtn" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
                transition: all 0.3s ease;
            ">
                Tạm dừng
            </button>
            <button id="closeAudioModal" style="
                background: rgba(255, 255, 255, 0.05);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 0.75rem 2rem;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.3s ease;
            ">
                Đóng
            </button>
        </div>
    `;

    modal.innerHTML = modalContent;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Get elements
    const progressBar = document.getElementById('audioProgress');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const closeBtn = document.getElementById('closeAudioModal');

    // Format time helper
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update progress
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    // Play/Pause toggle
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = 'Tạm dừng';
            playPauseIcon.innerHTML = `
                <path d="M15.536 11.293L9.879 8.464C9.487 8.268 9 8.547 9 8.964V14.622C9 15.039 9.487 15.318 9.879 15.122L15.536 12.293C15.9279 12.097 15.9279 11.489 15.536 11.293Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            `;
        } else {
            audio.pause();
            playPauseBtn.textContent = 'Phát';
            playPauseIcon.innerHTML = `
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            `;
        }
    });

    // Audio ended
    audio.addEventListener('ended', () => {
        playPauseBtn.textContent = 'Phát lại';
        playPauseIcon.innerHTML = `
            <path d="M15.536 11.293L9.879 8.464C9.487 8.268 9 8.547 9 8.964V14.622C9 15.039 9.487 15.318 9.879 15.122L15.536 12.293C15.9279 12.097 15.9279 11.489 15.536 11.293Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        `;
    });

    // Close modal
    function closeModal() {
        audio.pause();
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Hover effects
    playPauseBtn.addEventListener('mouseenter', () => {
        playPauseBtn.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.6)';
        playPauseBtn.style.transform = 'translateY(-2px)';
    });

    playPauseBtn.addEventListener('mouseleave', () => {
        playPauseBtn.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        playPauseBtn.style.transform = 'translateY(0)';
    });

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
    });
}

function showComingSoonMessage(feature) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, rgba(19, 20, 41, 0.95) 0%, rgba(10, 11, 30, 0.95) 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 3rem;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: slideUp 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
        ">
            🚧
        </div>
        <h2 style="
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 1rem;
            color: white;
        ">
            ${feature} Sắp Ra Mắt!
        </h2>
        <p style="
            font-size: 1.125rem;
            color: #a8a9c1;
            margin-bottom: 2rem;
            line-height: 1.6;
        ">
            Chúng tôi đang phát triển tính năng này. Vui lòng quay lại sau!
        </p>
        <button id="closeModal" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        ">
            Đã Hiểu
        </button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px); 
            }
            to { 
                opacity: 1;
                transform: translateY(0); 
            }
        }
    `;
    document.head.appendChild(style);

    // Close modal on button click
    const closeBtn = document.getElementById('closeModal');
    closeBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        }, 300);
    });

    // Close modal on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeBtn.click();
        }
    });

    // Hover effect for button
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.6)';
        closeBtn.style.transform = 'translateY(-2px)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
        closeBtn.style.transform = 'translateY(0)';
    });

    // Add fadeOut animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyle);
}

// ===== Add Scroll Animation for Elements =====
function revealOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .section-header');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.feature-card, .section-header');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-visual');

    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== Navigation Active State =====
const navLinks = document.querySelectorAll('.nav-link');
const currentPath = window.location.pathname;

navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath ||
        (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
        link.classList.add('active');
    }
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('[style*="z-index: 9999"]');
        if (modal) {
            const closeBtn = document.getElementById('closeModal');
            if (closeBtn) closeBtn.click();
        }
    }
});

console.log('🚗 Website Thi Bằng Lái Xe đã được khởi tạo thành công!');
console.log('📝 Sẵn sàng để thêm các tính năng thi trong hình...');
