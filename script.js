// Global variables
let bgMusic;
let musicBtn;
let playIcon;
let pauseIcon;
let isPlaying = false;
let guestMessages = [];

// Wedding date: 16 July 2026 08:00:00
const weddingDate = new Date('July 16, 2026 08:00:00').getTime();

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Get music elements
    bgMusic = document.getElementById('bgMusic');
    musicBtn = document.getElementById('musicBtn');
    playIcon = document.getElementById('playIcon');
    pauseIcon = document.getElementById('pauseIcon');
    
    // Get guest name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const formattedGuestName = guestName ? guestName.replace(/-/g, ' ') : 'Tamu Undangan';
    
    // Set guest name on cover
    const guestElement = document.getElementById('guestName');
    if (guestElement) {
        guestElement.textContent = formattedGuestName;
    }
    
    // Set guest name on envelope
    const envelopeGuestName = document.getElementById('envelopeGuestName');
    if (envelopeGuestName) {
        envelopeGuestName.textContent = formattedGuestName;
    }
    
    // Open button functionality
    const openBtn = document.getElementById('openBtn');
    if (openBtn) {
        openBtn.addEventListener('click', openInvitation);
    }
    
    // Music button functionality
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Initialize envelope functionality
    initEnvelope();
    
    // Initialize navbar scroll effect
    initNavbar();
    
    // Initialize countdown
    initCountdown();
    
    // Initialize guest book
    initGuestBook();
    
    // Initialize animations
    initAnimations();
    
    // Create floating decorations
    createFloatingDecorations();
});

// Initialize everything when page fully loads
window.addEventListener('load', () => {
    hidePreloader();
});

// Handle scroll events for back to top button and parallax
window.addEventListener('scroll', () => {
    handleBackToTop();
    handleParallax();
});

// Parallax effect for floating decorations
function handleParallax() {
    const scrollY = window.scrollY;
    const decorations = document.querySelectorAll('.floating-item');
    
    decorations.forEach((item, index) => {
        const speed = 0.05 + (index * 0.01);
        const yPos = scrollY * speed;
        item.style.transform = `translateY(${yPos}px)`;
    });
}

// Initialize envelope functionality
function initEnvelope() {
    const envelopeMain = document.getElementById('envelopeMain');
    const confettiContainer = document.getElementById('confettiContainer');
    
    if (envelopeMain) {
        envelopeMain.addEventListener('click', function() {
            if (!this.classList.contains('opened')) {
                this.classList.add('opened');
                createConfetti(confettiContainer);
            }
        });
    }
}

// Create confetti
function createConfetti(container) {
    if (!container) return;
    
    const colors = ['#8BDFDD', '#F48F68', '#FFE394', '#A7E8E6', '#FFF6DE'];
    const numConfetti = 60;
    
    for (let i = 0; i < numConfetti; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random size
        const size = Math.random() * 10 + 6;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Random animation
        const animDuration = Math.random() * 2 + 2.5;
        const spreadX = (Math.random() - 0.5) * 400;
        const spreadY = Math.random() * -300 - 100;
        
        confetti.style.animation = `confettiAnim ${animDuration}s ease-out forwards`;
        confetti.style.setProperty('--spreadX', spreadX + 'px');
        confetti.style.setProperty('--spreadY', spreadY + 'px');
        confetti.style.setProperty('--delay', (Math.random() * 0.3) + 's');
        
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, animDuration * 1000 + 500);
    }
}

// Initialize navbar scroll effect
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Initialize countdown timer
function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;
    
    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// Initialize guest book
function initGuestBook() {
    // Load saved messages from localStorage
    const savedMessages = localStorage.getItem('weddingGuestMessages');
    if (savedMessages) {
        guestMessages = JSON.parse(savedMessages);
        renderMessages();
    }
    
    // Character counter
    const messageInput = document.getElementById('guestMessage');
    const charCount = document.getElementById('charCount');
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }
    
    // Form submission
    const form = document.getElementById('guestbookForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('guestName').value.trim();
    const message = document.getElementById('guestMessage').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    
    if (!name || !message) return;
    
    const newMessage = {
        id: Date.now(),
        name,
        message,
        attendance,
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    guestMessages.unshift(newMessage);
    localStorage.setItem('weddingGuestMessages', JSON.stringify(guestMessages));
    
    // Reset form
    e.target.reset();
    document.getElementById('charCount').textContent = '0';
    
    renderMessages();
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = guestMessages.map(msg => `
        <div class="message-card fade-in-up">
            <p class="message-name">${escapeHtml(msg.name)}</p>
            <p class="message-text">${escapeHtml(msg.message)}</p>
            <p class="message-meta">${msg.attendance === 'hadir' ? '🎉 Akan hadir' : '🙏 Tidak bisa hadir'} · ${msg.timestamp}</p>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to clipboard function with toast
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show toast notification
function showToast() {
    const toast = document.getElementById('toastNotification');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Create floating decorations
function createFloatingDecorations() {
    const container = document.getElementById('floatingDecorations');
    const decorSymbols = ['✦', '❀', '✧', '♡', '❁', '✽', '❋'];
    
    for (let i = 0; i < 20; i++) {
        const decor = document.createElement('div');
        decor.className = 'floating-item';
        decor.textContent = decorSymbols[Math.floor(Math.random() * decorSymbols.length)];
        decor.style.left = Math.random() * 100 + '%';
        decor.style.top = Math.random() * 100 + '%';
        decor.style.fontSize = (15 + Math.random() * 25) + 'px';
        decor.style.animationDelay = Math.random() * 10 + 's';
        decor.style.animationDuration = (12 + Math.random() * 8) + 's';
        decor.style.color = Math.random() > 0.5 ? 'var(--primary-color)' : 'var(--accent-color)';
        
        container.appendChild(decor);
    }
}

// Handle preloader
function hidePreloader() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1200);
}

// Handle back to top button visibility
function handleBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

// Initialize Intersection Observer for animations
function initAnimations() {
    // Observer untuk sections
    const sectionObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    // Variasi animasi untuk masing-masing section
    const animationVariants = ['visible', 'fade-in-up', 'scale-in', 'visible', 'fade-in-up', 'scale-in', 'visible', 'fade-in-up', 'scale-in', 'visible', 'fade-in-up'];
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const sectionIndex = Array.from(document.querySelectorAll('.section')).indexOf(entry.target);
                const animationClass = animationVariants[sectionIndex % animationVariants.length];
                
                setTimeout(() => {
                    entry.target.classList.add(animationClass);
                }, sectionIndex * 150);
                
                sectionObserver.unobserve(entry.target);
                
                // Setelah section muncul, animasikan item di dalamnya
                const animateItems = entry.target.querySelectorAll('.animate-item');
                animateItems.forEach((item, itemIndex) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 300 + itemIndex * 150);
                });
            }
        });
    }, sectionObserverOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('mainContent');
    
    // Try to play music
    if (bgMusic && !isPlaying) {
        bgMusic.play().then(() => {
            isPlaying = true;
            updateMusicButton();
        }).catch(err => {
            console.log('Music autoplay blocked');
        });
    }
    
    // Hide cover and show main content with smooth animation
    if (cover && mainContent) {
        cover.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        cover.style.opacity = '0';
        cover.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            cover.style.display = 'none';
            mainContent.style.display = 'block';
            
            // Animate first section immediately
            const firstSection = document.querySelectorAll('.section')[0];
            if (firstSection) {
                firstSection.classList.add('visible');
                const firstItems = firstSection.querySelectorAll('.animate-item');
                firstItems.forEach((item, itemIndex) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 200 + itemIndex * 100);
                });
            }
            
            // Scroll to top of main content
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    }
}

function toggleMusic() {
    if (!bgMusic) return;
    
    if (isPlaying) {
        bgMusic.pause();
    } else {
        bgMusic.play().catch(err => {
            console.log('Play failed');
        });
    }
    
    isPlaying = !isPlaying;
    updateMusicButton();
}

function updateMusicButton() {
    if (playIcon && pauseIcon && musicBtn) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            musicBtn.classList.add('playing');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            musicBtn.classList.remove('playing');
        }
    }
}
