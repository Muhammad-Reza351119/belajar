// Global variables
let bgMusic;
let musicBtn;
let playIcon;
let pauseIcon;
let isPlaying = false;
let guestMessages = [];
let supabaseReady = false;

// Hitung mundur menuju resepsi: 18 Juli 2026 10:00:00
const weddingDate = new Date('July 18, 2026 10:00:00').getTime();
const DEFAULT_GUEST_NAME = 'Tamu Undangan';

function formatGuestName(raw) {
    if (!raw) return DEFAULT_GUEST_NAME;

    try {
        raw = decodeURIComponent(String(raw).trim());
    } catch (error) {
        raw = String(raw).trim();
    }

    const formatted = raw.replace(/[-_+]/g, ' ').replace(/\s+/g, ' ').trim();
    return formatted || DEFAULT_GUEST_NAME;
}

function getGuestNameFromUrl() {
    if (window.__GUEST_NAME__) {
        return window.__GUEST_NAME__;
    }

    const params = new URLSearchParams(window.location.search);
    return formatGuestName(params.get('to') || params.get('nama'));
}

function initGuestNameFromUrl() {
    const guestName = getGuestNameFromUrl();

    ['coverGuestName', 'envelopeGuestName'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = guestName;
        }
    });

    const guestbookInput = document.getElementById('guestbookName');
    if (guestbookInput && guestName !== DEFAULT_GUEST_NAME) {
        guestbookInput.value = guestName;
    }

    window.__GUEST_NAME__ = guestName;
}

function applyGuestNameEarly() {
    if (document.body) {
        initGuestNameFromUrl();
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Get music elements
    bgMusic = document.getElementById('bgMusic');
    musicBtn = document.getElementById('musicBtn');
    playIcon = musicBtn ? musicBtn.querySelector('.play-icon') : null;
    pauseIcon = musicBtn ? musicBtn.querySelector('.pause-icon') : null;
    
    // Personalisasi nama tamu dari URL (?to=Nama)
    initGuestNameFromUrl();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGuestNameEarly);
} else {
    applyGuestNameEarly();
}

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

// Supabase helpers
function getSupabaseConfig() {
    if (typeof window.SUPABASE_CONFIG !== 'undefined') {
        return window.SUPABASE_CONFIG;
    }

    if (typeof SUPABASE_CONFIG !== 'undefined') {
        return SUPABASE_CONFIG;
    }

    return null;
}

function isSupabaseConfigured() {
    const config = getSupabaseConfig();
    const placeholderKeys = [
        'PASTE_ANON_KEY_DISINI',
        'your_publishable_or_anon_key_here'
    ];

    return config
        && config.url
        && config.anonKey
        && !config.url.includes('your-project')
        && !placeholderKeys.includes(config.anonKey);
}

function getSupabaseHeaders(prefer) {
    const config = getSupabaseConfig();
    const headers = {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json'
    };

    if (prefer) {
        headers['Prefer'] = prefer;
    }

    return headers;
}

async function fetchGuestMessages() {
    const config = getSupabaseConfig();
    const response = await fetch(
        `${config.url}/rest/v1/guestbook?select=*&order=created_at.desc`,
        { headers: getSupabaseHeaders() }
    );

    if (!response.ok) {
        throw new Error('Gagal memuat ucapan');
    }

    return response.json();
}

async function saveGuestMessage(data) {
    const config = getSupabaseConfig();
    const response = await fetch(
        `${config.url}/rest/v1/guestbook`,
        {
            method: 'POST',
            headers: getSupabaseHeaders('return=representation'),
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        throw new Error('Gagal menyimpan ucapan');
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
}

function formatMessageDate(dateString) {
    return new Date(dateString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getAttendanceLabel(attendance) {
    return attendance === 'hadir' ? '🎉 Akan hadir' : '🙏 Tidak bisa hadir';
}

// Initialize guest book
function initGuestBook() {
    supabaseReady = isSupabaseConfigured();

    const messageInput = document.getElementById('guestMessage');
    const charCount = document.getElementById('charCount');
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
    }

    const form = document.getElementById('guestbookForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    initMessagesDraftToggle();
    loadGuestMessages();
}

function initMessagesDraftToggle() {
    const draft = document.getElementById('messagesDraft');
    const toggle = document.getElementById('messagesDraftToggle');

    if (!draft || !toggle) return;

    toggle.addEventListener('click', () => {
        const isCollapsed = draft.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    });
}

function openMessagesDraft() {
    const draft = document.getElementById('messagesDraft');
    const toggle = document.getElementById('messagesDraftToggle');

    if (!draft) return;

    draft.classList.remove('collapsed');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
    }
}

async function loadGuestMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    if (!supabaseReady) {
        container.innerHTML = '<p class="messages-empty">Koneksi database belum siap. Hubungi pemilik undangan.</p>';
        return;
    }

    container.innerHTML = '<p class="messages-loading">Memuat ucapan...</p>';

    try {
        guestMessages = await fetchGuestMessages();
        renderMessages();
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="messages-empty">Gagal memuat ucapan. Coba refresh halaman.</p>';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('guestbookName');
    const messageInput = document.getElementById('guestMessage');
    const submitBtn = document.getElementById('submitBtn');
    const attendanceInput = document.querySelector('input[name="attendance"]:checked');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const attendance = attendanceInput ? attendanceInput.value : 'hadir';

    if (!name || !message) return;

    if (!supabaseReady) {
        showToast('Koneksi database belum siap. Coba lagi nanti.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    try {
        const savedMessage = await saveGuestMessage({ name, message, attendance });
        guestMessages.unshift(savedMessage);
        renderMessages();
        openMessagesDraft();

        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = 0;
        }

        e.target.reset();
        document.getElementById('charCount').textContent = '0';
        showToast('Ucapan berhasil dikirim!');
    } catch (error) {
        console.error(error);
        showToast('Gagal mengirim ucapan. Coba lagi.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Ucapan';
    }
}

function updateMessagesCount() {
    const countEl = document.getElementById('messagesCount');
    if (!countEl) return;

    const total = guestMessages.length;
    countEl.textContent = total ? `${total} ucapan · ketuk` : 'ketuk untuk lihat';
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    updateMessagesCount();

    if (!guestMessages.length) {
        container.innerHTML = '<p class="messages-empty">Belum ada ucapan. Jadilah yang pertama!</p>';
        return;
    }

    container.innerHTML = guestMessages.map(msg => `
        <div class="message-card fade-in-up">
            <p class="message-name">${escapeHtml(msg.name)}</p>
            <p class="message-text">${escapeHtml(msg.message)}</p>
            <p class="message-meta">
                <span class="attendance-badge ${msg.attendance === 'hadir' ? 'attendance-hadir' : 'attendance-tidak'}">${getAttendanceLabel(msg.attendance)}</span>
                · ${formatMessageDate(msg.created_at)}
            </p>
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
        showToast('Rekening berhasil disalin!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    if (toastMessage) {
        toastMessage.textContent = message || 'Berhasil!';
    }

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
    if (!container) return;

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
