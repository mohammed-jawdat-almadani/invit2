/**
 * محرك المؤثرات الصوتية الكريستالية الفاخرة (Web Audio API Crystal Chimes Synthesizer)
 * يولد رنات بلورية نقية خالية من أي تأخير استجابة ومناسبة لكافة أجهزة الهاتف
 */
const AudioEngine = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    // توليد نغمة جرس كريستالي نقي مع اضمحلال ناعم
    playChime(freq, timeOffset = 0, duration = 1.2, gainLevel = 0.22) {
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime + timeOffset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // تدرج تنازلي أسي يعطي صدى الرنين الزجاجي الكريستالي
            gain.gain.setValueAtTime(gainLevel, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            console.warn('Audio chime warning:', e);
        }
    },
    // لحن كورد الفتح الملكي عند فتح بطاقة الدعوة (C6 -> E6 -> G6 -> C7)
    playOpenChord() {
        this.playChime(1046.50, 0.0, 1.8, 0.22); // C6
        this.playChime(1318.51, 0.12, 1.8, 0.20); // E6
        this.playChime(1567.98, 0.24, 2.0, 0.22); // G6
        this.playChime(2093.00, 0.38, 2.5, 0.25); // C7
    },
    // نقرة كريستالية خفيفة للأزرار وعناصر التحكم
    playTap() {
        this.playChime(1318.51, 0.0, 0.5, 0.12);
        this.playChime(1760.00, 0.05, 0.7, 0.14);
    },
    // كورد الاحتفال الذهبي عند تأكيد الحضور أو كتابة تهنئة
    playCelebrationChord() {
        this.playChime(880.00, 0.0, 2.0, 0.18);   // A5
        this.playChime(1108.73, 0.1, 2.0, 0.20);  // C#6
        this.playChime(1318.51, 0.2, 2.2, 0.22);  // E6
        this.playChime(1760.00, 0.32, 2.5, 0.25); // A6
        this.playChime(2217.46, 0.46, 2.8, 0.22); // C#7
    },
    // تخليق هدير أمواج البحر الطبيعي إجرائياً بنقاء فائق وبدون استهلاك للبيانات
    oceanNode: null,
    oceanGain: null,
    startOceanWaves() {
        try {
            this.init();
            if (!this.ctx || this.oceanNode) return;

            const bufferSize = this.ctx.sampleRate * 4;
            const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
            const left = buffer.getChannelData(0);
            const right = buffer.getChannelData(1);

            let b0_l = 0, b1_l = 0;
            let b0_r = 0, b1_r = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white_l = Math.random() * 2 - 1;
                const white_r = Math.random() * 2 - 1;
                b0_l = 0.96 * b0_l + 0.04 * white_l;
                b1_l = 0.96 * b1_l + 0.04 * b0_l;
                left[i] = b1_l * 0.4;

                b0_r = 0.96 * b0_r + 0.04 * white_r;
                b1_r = 0.96 * b1_r + 0.04 * b0_r;
                right[i] = b1_r * 0.4;
            }

            this.oceanNode = this.ctx.createBufferSource();
            this.oceanNode.buffer = buffer;
            this.oceanNode.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(420, this.ctx.currentTime);

            this.oceanGain = this.ctx.createGain();
            this.oceanGain.gain.setValueAtTime(0.24, this.ctx.currentTime);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
            lfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(this.oceanGain.gain);
            lfo.start();

            this.oceanNode.connect(filter);
            filter.connect(this.oceanGain);
            this.oceanGain.connect(this.ctx.destination);

            this.oceanNode.start();
        } catch (e) {
            console.warn('Ocean waves synth error:', e);
        }
    },
    stopOceanWaves() {
        if (this.oceanGain && this.ctx) {
            try {
                this.oceanGain.gain.setValueAtTime(0, this.ctx.currentTime);
                if (this.oceanNode) {
                    this.oceanNode.stop();
                    this.oceanNode.disconnect();
                    this.oceanNode = null;
                }
            } catch (e) {}
        }
    }
};
window.AudioEngine = AudioEngine;

document.addEventListener('DOMContentLoaded', function() {
    // 1. تهيئة البيانات والتطبيق
    initApp();

    // 2. التحكم بشاشة الإنترو السينمائية وانتقال أمواج البحر
    initOceanVideoIntro();

    // 3. تهيئة محرك فيديو الخلفية الحية المستمرة لكامل الموقع
    initLivingVideoBackground();

    // 4. التحكم بالصوت والموسيقى المزدوجة البحرية
    initMediaControls();

    // 5. العدادات التنازلية الثلاثية (أيام، ساعات، دقائق)
    initCountdown();

    // 6. معرض الذكريات واللايت بوكس (Overlapping Zig-Zag Layout)
    initMemoriesGallery();

    // 7. نموذج تأكيد الحضور وحائط الأمنيات المباشر
    initRSVPAndWishes();

    // 8. التكامل مع التقويم والمشاركة وخرائط جوجل
    initCalendarAndShare();

    // 9. توجيه ومراقبة مسار الإدارة (#admin)
    initRouting();
});

let isAudioPlaying = false;
let weddingData = null;

function initApp() {
    weddingData = window.WeddingStorage.getInfo();
    applyWeddingData();
}

// تطبيق وعرض بيانات الحفل على عناصر الصفحة
function applyWeddingData() {
    weddingData = window.WeddingStorage.getInfo();

    // أسماء العروسين
    const groomEl = document.getElementById('text-groom-name');
    const brideEl = document.getElementById('text-bride-name');
    if (groomEl) groomEl.textContent = weddingData.groomName || 'محمد';
    if (brideEl) brideEl.textContent = weddingData.brideName || 'حنين';

    // العائلات والألقاب
    const groomFamEl = document.getElementById('text-groom-family');
    const brideFamEl = document.getElementById('text-bride-family');
    if (groomFamEl) groomFamEl.textContent = weddingData.groomFamily || 'عائلة السيد عبد الرحمن آل الشريف';
    if (brideFamEl) brideFamEl.textContent = weddingData.brideFamily || 'عائلة السيد مصطفى آل الأحمد';

    // المونوغرام (للترويسة والإنترو)
    const monoEnEl = document.getElementById('monogram-letters-en');
    const monoArEl = document.getElementById('monogram-letters-ar');
    if (monoEnEl) monoEnEl.textContent = weddingData.monogramEn || 'M & H';
    if (monoArEl) monoArEl.textContent = weddingData.monogramAr || 'م & ح';

    const introMonoEnEl = document.getElementById('intro-monogram-letters-en');
    const introMonoArEl = document.getElementById('intro-monogram-letters-ar');
    if (introMonoEnEl) introMonoEnEl.textContent = weddingData.monogramEn || 'M & H';
    if (introMonoArEl) introMonoArEl.textContent = weddingData.monogramAr || 'م & ح';

    // رسالة الترحيب والآية الكريمة
    const welcomeEl = document.getElementById('text-welcome-phrase');
    if (welcomeEl) welcomeEl.textContent = weddingData.welcomePhrase;

    const verseEl = document.getElementById('text-quran-verse');
    if (verseEl) verseEl.textContent = weddingData.quranVerse;

    // تفاصيل المكان والتاريخ
    const venueNameEl = document.getElementById('text-venue-name');
    const venueCityEl = document.getElementById('text-venue-city');
    const venueAddressEl = document.getElementById('text-venue-address');
    const dateFormattedEl = document.getElementById('text-wedding-date');

    if (venueNameEl) venueNameEl.textContent = weddingData.venueName;
    if (venueCityEl) venueCityEl.textContent = weddingData.venueCity;
    if (venueAddressEl) venueAddressEl.textContent = weddingData.venueAddress;
    if (dateFormattedEl) dateFormattedEl.textContent = weddingData.weddingDateFormatted + ' - ' + weddingData.weddingTimeFormatted;

    // تحديث خط سير برنامج الحفل
    renderItinerary();

    // تحديث حائط الأمنيات
    renderWishesWall();
}
window.applyWeddingData = applyWeddingData;

// ==========================================================================
// 1. التحكم بشاشة الإنترو وانتقال أمواج البحر (Ocean Intro & Wave Curtain)
// ==========================================================================
function initOceanVideoIntro() {
    const introScreen = document.getElementById('intro-screen');
    const video = document.getElementById('intro-video-player');
    const progressBar = document.getElementById('intro-progress-bar');
    const btnOpen = document.getElementById('btn-open-invitation');
    const btnSkip = document.getElementById('btn-intro-skip');
    const btnSound = document.getElementById('btn-intro-sound');
    const soundLabel = document.getElementById('intro-sound-label');
    const curtain = document.getElementById('wave-curtain-transition');
    const btnReplay = document.getElementById('btn-replay-intro');

    if (!introScreen || !video) return;

    // محاولة تشغيل الفيديو بصوت أو صامت لتجاوز قيود المتصفح
    video.muted = true;
    video.play().catch(() => {
        console.log('Video auto-play awaiting user gesture');
    });

    // تحديث شريط التقدم للإنترو
    video.addEventListener('timeupdate', function() {
        if (video.duration) {
            const pct = (video.currentTime / video.duration) * 100;
            if (progressBar) progressBar.style.width = pct + '%';
        }
    });

    // زر التحكم بالصوت في شاشة الإنترو
    if (btnSound) {
        btnSound.addEventListener('click', function(e) {
            e.stopPropagation();
            if (video.muted) {
                video.muted = false;
                video.play().catch(() => {});
                btnSound.innerHTML = '<i class="fas fa-volume-up"></i> <span>كتم الصوت</span>';
                isAudioPlaying = true;
                updateAudioButtonUI(true);
            } else {
                video.muted = true;
                btnSound.innerHTML = '<i class="fas fa-volume-mute"></i> <span>صوت أمواج البحر</span>';
                isAudioPlaying = false;
                updateAudioButtonUI(false);
            }
        });
    }

    // دالة الانتقال الساحر من الإنترو إلى بطاقة الدعوة بواسطة تموج البحر
    function openInvitation() {
        // 1. عزف كورد الفتح الكريستالي الملكي الفاخر
        AudioEngine.playOpenChord();

        // 2. تشغيل فيديو الخلفية الحية المستمرة لكامل الموقع
        ensureLivingVideoPlaying();

        // 3. تشغيل نظام الصوت المزدوج (المقطوعة الرومانسية + أمواج البحر)
        playDualAudio();

        if (curtain) {
            curtain.classList.add('active');
            setTimeout(() => {
                introScreen.classList.add('hidden');
                video.pause();

                setTimeout(() => {
                    curtain.classList.add('sweep-out');
                    setTimeout(() => {
                        curtain.classList.remove('active', 'sweep-out');
                    }, 900);
                }, 400);
            }, 500);
        } else {
            introScreen.classList.add('hidden');
            video.pause();
        }
    }

    if (btnOpen) {
        btnOpen.addEventListener('click', openInvitation);
    }

    if (btnSkip) {
        btnSkip.addEventListener('click', openInvitation);
    }

    // انتهاء مدة الفيديو تلقائياً يفتح الدعوة بسلاسة
    video.addEventListener('ended', function() {
        openInvitation();
    });

    // زر إعادة مشاهدة الإنترو في أي وقت
    if (btnReplay) {
        btnReplay.addEventListener('click', function() {
            AudioEngine.playTap();
            introScreen.classList.remove('hidden');
            video.currentTime = 0;
            video.play().catch(() => {});
            if (progressBar) progressBar.style.width = '0%';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ==========================================================================
// 2. محرك فيديو الخلفية الحية المستمرة (Living Video Background Engine)
// ==========================================================================
function initLivingVideoBackground() {
    const siteVideo = document.getElementById('site-ambient-video');
    const overlay = document.getElementById('ambient-video-overlay');
    if (!siteVideo) return;

    siteVideo.muted = true;
    siteVideo.play().catch(() => {
        console.log('Ambient site video waiting for interaction');
    });

    // مراقبة الأقسام وتغيير السمة اللونية والإضاءة تلقائياً مع التمرير
    const sections = [
        { id: 'hero-section', theme: 'theme-hero' },
        { id: 'countdown-section', theme: 'theme-hero' },
        { id: 'itinerary-section', theme: 'theme-itinerary' },
        { id: 'gallery-section', theme: 'theme-gallery' },
        { id: 'venue-section', theme: 'theme-venue' },
        { id: 'rsvp-section', theme: 'theme-rsvp' }
    ];

    if ('IntersectionObserver' in window && overlay) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
                    const match = sections.find(s => s.id === entry.target.id);
                    if (match) {
                        overlay.className = 'ambient-video-overlay ' + match.theme;
                    }
                }
            });
        }, { threshold: [0.2, 0.45] });

        sections.forEach(s => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
    }
}

function ensureLivingVideoPlaying() {
    const siteVideo = document.getElementById('site-ambient-video');
    if (siteVideo && siteVideo.paused) {
        siteVideo.muted = true;
        siteVideo.play().catch(() => {});
    }
}

// ==========================================================================
// 3. نظام الصوت المزدوج والتحكم بدورة حياة الصوت عند الخروج
// ==========================================================================
let wasAudioPlayingBeforeHide = false;

function playDualAudio() {
    const bgAudio = document.getElementById('bg-audio');

    if (bgAudio) {
        bgAudio.volume = 0.75;
        bgAudio.play().then(() => {
            isAudioPlaying = true;
            updateAudioButtonUI(true);
        }).catch(() => {});
    }
    AudioEngine.startOceanWaves();
}

function pauseDualAudio() {
    const bgAudio = document.getElementById('bg-audio');
    if (bgAudio) bgAudio.pause();
    AudioEngine.stopOceanWaves();
    isAudioPlaying = false;
    updateAudioButtonUI(false);
}

function initMediaControls() {
    const audioBtn = document.getElementById('btn-toggle-audio');

    if (audioBtn) {
        audioBtn.addEventListener('click', function() {
            toggleAudioPlayback();
        });
    }

    // ربط مستمعات دورة حياة الصوت لضمان انطفائه عند الخروج من المتصفح أو قفل الشاشة
    initAudioLifecycle();
}

function initAudioLifecycle() {
    const audio = document.getElementById('bg-audio');
    const video = document.getElementById('intro-video-player');
    const siteVideo = document.getElementById('site-ambient-video');

    // 1. مراقبة مغادرة الصفحة أو تصغير المتصفح أو إقفال الشاشة (Page Visibility API)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // المستخدم خرج من المتصفح أو بدل التطبيق: إيقاف الصوت فوراً وبشكل حاسم
            if (isAudioPlaying) {
                wasAudioPlayingBeforeHide = true;
                pauseDualAudio();
            } else {
                wasAudioPlayingBeforeHide = false;
            }
            if (video && !video.paused) video.pause();
            if (siteVideo && !siteVideo.paused) siteVideo.pause();
        } else {
            // عودة المستخدم للمتصفح: استئناف تشغيل الصوت إذا كان يعمل قبل المغادرة
            if (wasAudioPlayingBeforeHide) {
                playDualAudio();
            }
            if (siteVideo && siteVideo.paused) {
                siteVideo.play().catch(() => {});
            }
        }
    });

    // 2. حدث مغادرة الصفحة كلياً أو إغلاق التبويب على الهواتف (pagehide)
    window.addEventListener('pagehide', function() {
        pauseDualAudio();
        if (video) video.pause();
        if (siteVideo) siteVideo.pause();
    });

    // 3. حدث قبل تفريغ الصفحة (beforeunload)
    window.addEventListener('beforeunload', function() {
        pauseDualAudio();
        if (video) video.pause();
        if (siteVideo) siteVideo.pause();
    });

    // 4. حدث فقدان التركيز على النافذة (blur) على متصفحات الهواتف
    window.addEventListener('blur', function() {
        if (document.hidden && isAudioPlaying) {
            wasAudioPlayingBeforeHide = true;
            pauseDualAudio();
        }
    });
}

function toggleAudioPlayback() {
    AudioEngine.playTap();
    if (isAudioPlaying) {
        pauseDualAudio();
        showToast('تم كتم الصوت');
    } else {
        playDualAudio();
        showToast('تم تشغيل صوت أمواج البحر والأنغام الملكية');
    }
}

function updateAudioButtonUI(playing) {
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (!audioBtn) return;

    if (playing) {
        audioBtn.classList.add('audio-playing');
        audioBtn.setAttribute('title', 'كتم الصوت');
    } else {
        audioBtn.classList.remove('audio-playing');
        audioBtn.setAttribute('title', 'تشغيل الصوت');
    }
}

// ==========================================================================
// 3. العدادات التنازلية الثلاثية (Three Countdown Units)
// ==========================================================================
function initCountdown() {
    const targetDate = new Date(weddingData.weddingDateISO || '2026-10-15T19:30:00').getTime();

    function update() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds-val');

        if (diff <= 0) {
            if (daysEl) daysEl.textContent = '00';
            if (hoursEl) hoursEl.textContent = '00';
            if (minutesEl) minutesEl.textContent = '00';
            if (secondsEl) secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (daysEl) daysEl.textContent = days < 10 ? '0' + days : days;
        if (hoursEl) hoursEl.textContent = hours < 10 ? '0' + hours : hours;
        if (minutesEl) minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
        if (secondsEl) secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
    }

    update();
    setInterval(update, 1000);
}

// ==========================================================================
// 4. مسار برنامج الحفل (Event Itinerary Timeline)
// ==========================================================================
function renderItinerary() {
    const container = document.getElementById('itinerary-timeline-container');
    if (!container || !weddingData.schedule) return;

    container.innerHTML = '';

    const iconMap = {
        coffee: 'fa-mug-hot',
        crown: 'fa-crown',
        rings: 'fa-gem',
        dinner: 'fa-utensils',
        camera: 'fa-camera-retro'
    };

    weddingData.schedule.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';

        const iconClass = iconMap[item.icon] || 'fa-water';

        itemEl.innerHTML = `
            <div class="timeline-badge"><i class="fas ${iconClass}"></i></div>
            <div class="timeline-content">
                <span class="timeline-time-badge">${item.time}</span>
                <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
                <p class="timeline-desc">${escapeHtml(item.desc)}</p>
            </div>
        `;

        container.appendChild(itemEl);
    });
}

// ==========================================================================
// 5. معرض الذكريات بنمط التخطيط المتعرج المتداخل (Overlapping Zig-Zag)
// ==========================================================================
function initMemoriesGallery() {
    const container = document.getElementById('zigzag-gallery-container');
    const toggleBtn = document.getElementById('btn-toggle-gallery');
    const gallerySection = document.getElementById('gallery-section-content');

    if (!container || !weddingData.memories) return;

    container.innerHTML = '';

    weddingData.memories.forEach(mem => {
        const item = document.createElement('div');
        item.className = 'zigzag-item';

        item.innerHTML = `
            <div class="zigzag-image-wrapper" data-img="${mem.image}" data-title="${escapeHtml(mem.title)}">
                <img src="${mem.image}" alt="${escapeHtml(mem.title)}" class="zigzag-img" loading="lazy">
                <div class="zigzag-img-overlay">
                    <span class="zoom-hint"><i class="fas fa-search-plus"></i> تكبير الصورة</span>
                </div>
            </div>
            <div class="zigzag-card-info">
                <span class="zigzag-tag">${escapeHtml(mem.tag || 'لحظات شاطئية')}</span>
                <h3 class="zigzag-title">${escapeHtml(mem.title)}</h3>
                <div class="zigzag-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(mem.date)}</div>
                <p class="zigzag-desc">${escapeHtml(mem.caption)}</p>
            </div>
        `;

        container.appendChild(item);
    });

    // ربط ميزة اللايت بوكس لتكبير الصور
    container.querySelectorAll('.zigzag-image-wrapper').forEach(wrap => {
        wrap.addEventListener('click', function() {
            AudioEngine.playTap();
            const imgSrc = this.getAttribute('data-img');
            openLightbox(imgSrc);
        });
    });

    // زر إظهار / إخفاء المعرض الاختياري
    if (toggleBtn && gallerySection) {
        toggleBtn.addEventListener('click', function() {
            AudioEngine.playTap();
            const isHidden = gallerySection.style.display === 'none';
            if (isHidden) {
                gallerySection.style.display = 'block';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> إخفاء المعرض';
            } else {
                gallerySection.style.display = 'none';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> استعراض الصور';
            }
        });
    }

    initLightboxModal();
}

function initLightboxModal() {
    const modal = document.getElementById('lightbox-modal');
    const closeBtn = document.getElementById('lightbox-close-btn');

    if (!modal) return;

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function openLightbox(src) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-image');
    if (modal && img) {
        img.src = src;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================================================
// 6. تأكيد الحضور وحائط الأمنيات (RSVP & Wall of Wishes)
// ==========================================================================
function initRSVPAndWishes() {
    const form = document.getElementById('wedding-rsvp-form');
    if (!form) return;

    const radioOptions = form.querySelectorAll('input[name="attendance_status"]');
    const companionsGroup = document.getElementById('companions-form-group');

    radioOptions.forEach(r => {
        r.addEventListener('change', function() {
            if (this.value === 'attending') {
                if (companionsGroup) companionsGroup.style.display = 'block';
            } else {
                if (companionsGroup) companionsGroup.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nameInput = document.getElementById('rsvp-guest-name');
        const phoneInput = document.getElementById('rsvp-guest-phone');
        const companionsInput = document.getElementById('rsvp-companions-count');
        const notesInput = document.getElementById('rsvp-notes');
        const statusSelected = form.querySelector('input[name="attendance_status"]:checked');

        const guestName = nameInput ? nameInput.value.trim() : '';
        if (!guestName) {
            showToast('يرجى التكرم بكتابة الاسم الكريم');
            return;
        }

        const status = statusSelected ? statusSelected.value : 'attending';
        const companions = (status === 'attending' && companionsInput) ? parseInt(companionsInput.value, 10) : 0;
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const notes = notesInput ? notesInput.value.trim() : '';

        // حفظ الرد محلياً
        window.WeddingStorage.addRSVP({
            name: guestName,
            phone: phone,
            status: status,
            companions: companions,
            notes: notes
        });

        // عزف كورد الاحتفال الكريستالي الملكي الفاخر
        AudioEngine.playCelebrationChord();

        // مؤثرات احتفالية بلآلئ البحر والذهب
        triggerConfettiCelebration();

        // تحديث حائط الأمنيات فوراً
        renderWishesWall();

        // رسالة تأكيد للضيف
        const successModal = document.getElementById('rsvp-success-modal');
        if (successModal) {
            const isAttending = status === 'attending';
            const msgEl = document.getElementById('success-modal-message');
            if (msgEl) {
                msgEl.innerHTML = isAttending
                    ? `أهلاً وسهلاً بك <strong>${escapeHtml(guestName)}</strong>! تسعدنا وتشرفنا مشاركتكم لنا فرحة العمر على شاطئ البحر.`
                    : `شكراً لك <strong>${escapeHtml(guestName)}</strong> على لطفك ومشاركتنا التهنئة، قلوبكم معنا دائماً.`;
            }

            const btnWhatsapp = document.getElementById('btn-send-whatsapp-confirm');
            if (btnWhatsapp) {
                const targetPhone = (weddingData.whatsappNumber || '+963933112233').replace(/\D/g, '');
                const formattedWaMsg = encodeURIComponent(
                    `السلام عليكم ورحمة الله،\nأنا: ${guestName}\nحالة الحضور: ${isAttending ? 'يشرفني الحضور بكل سرور' : 'أعتذر بكل محبة'}\n` +
                    (isAttending && companions > 0 ? `عدد المرافقين: +${companions}\n` : '') +
                    (notes ? `الكلمة الطيبة: "${notes}"\n` : '') +
                    `ألف مبارك للعروسين الغاليين محمد وحنين!`
                );
                btnWhatsapp.href = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${formattedWaMsg}`;
            }

            successModal.style.display = 'flex';
        }

        form.reset();
        showToast('تم تسجيل ردكم الكريم بنجاح، دمتم ودامت أفراحكم!');
    });

    const btnCloseSuccess = document.getElementById('btn-close-success-modal');
    if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', function() {
            const successModal = document.getElementById('rsvp-success-modal');
            if (successModal) successModal.style.display = 'none';
        });
    }
}

function renderWishesWall() {
    const container = document.getElementById('wishes-wall-grid');
    if (!container) return;

    const wishes = window.WeddingStorage.getWishesList();
    container.innerHTML = '';

    if (wishes.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">كن أول من يشارك العروسين كلماته الطيبة ودعواته المباركة!</p>`;
        return;
    }

    wishes.forEach(item => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `
            <div class="wish-card-header">
                <span class="wish-author"><i class="fas fa-heart" style="color:var(--color-seafoam-bright); font-size:0.85rem; margin-left:6px;"></i> ${escapeHtml(item.name)}</span>
                <span class="wish-time">${escapeHtml(item.date || 'مؤخراً')}</span>
            </div>
            <p class="wish-body">${escapeHtml(item.message)}</p>
        `;
        container.appendChild(card);
    });
}
window.renderWishesWall = renderWishesWall;

// ==========================================================================
// 7. التقويم والمشاركة وخرائط جوجل (Calendar, Share & Maps)
// ==========================================================================
function initCalendarAndShare() {
    const btnMap = document.getElementById('btn-open-map');
    if (btnMap) {
        btnMap.addEventListener('click', function(e) {
            e.preventDefault();
            const mapUrl = weddingData.googleMapsUrl || `https://maps.google.com/?q=${weddingData.venueCoordinates.lat},${weddingData.venueCoordinates.lng}`;
            window.open(mapUrl, '_blank');
        });
    }

    const btnCalendar = document.getElementById('btn-add-calendar');
    if (btnCalendar) {
        btnCalendar.addEventListener('click', function(e) {
            e.preventDefault();
            AudioEngine.playTap();
            downloadICalendarFile();
        });
    }

    const btnShare = document.getElementById('btn-share-invite');
    if (btnShare) {
        btnShare.addEventListener('click', function() {
            AudioEngine.playTap();
            shareInvitation();
        });
    }
}

function downloadICalendarFile() {
    const title = `حفل زفاف محمد وحنين المبارك`;
    const description = `نتشرف بحضوركم لمشاركتنا فرحة العمر في ${weddingData.venueName} - ${weddingData.venueAddress}`;
    const location = `${weddingData.venueName}, ${weddingData.venueCity}`;

    const startDate = '20261015T163000Z'; // 19:30 Damascus time
    const endDate = '20261015T223000Z';

    const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Muhammad & Haneen Wedding//Wedding Invitation//AR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `حفل_زفاف_محمد_وحنين.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('تم تنزيل موعد الحفل لحفظه في تقويم هاتفك بنجاح');
}

function shareInvitation() {
    const shareTitle = `دعوة لحضور حفل زفاف محمد وحنين`;
    const shareText = `يتشرف كلٌّ من والد العريس ووالد العروس بدعوتكم الكريمة لحضور حفل زفاف نجليهما محمد وحنين على شاطئ البحر في اللاذقية. يسعدنا اطلاعكم على بطاقة الدعوة وتأكيد الحضور:`;
    const shareUrl = window.location.href.split('#')[0];

    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
            showToast('تم نسخ رابط الدعوة بنجاح، يمكنك مشاركته مع الأحباب');
        }).catch(() => {
            prompt('انسخ رابط الدعوة التالي:', shareUrl);
        });
    }
}

// ==========================================================================
// 8. التوجيه ومراقبة مسار الإدارة (#admin)
// ==========================================================================
function initRouting() {
    function checkHashRoute() {
        const hash = window.location.hash;
        const adminView = document.getElementById('admin-view');
        const introScreen = document.getElementById('intro-screen');

        if (hash === '#admin') {
            if (introScreen) introScreen.classList.add('hidden');
            if (adminView) {
                adminView.style.display = 'block';
                if (window.initAdmin) window.initAdmin();
            }
        } else {
            if (adminView) {
                adminView.style.display = 'none';
            }
        }
    }

    window.addEventListener('hashchange', checkHashRoute);
    checkHashRoute();
}

// احتفالية لآلئ البحر والذهب
function triggerConfettiCelebration() {
    for (let i = 0; i < 40; i++) {
        createFloatingConfettiPiece();
    }
}

function createFloatingConfettiPiece() {
    const piece = document.createElement('div');
    const colors = ['#2dd4bf', '#06b6d4', '#99f6e4', '#ffffff', '#fde047', '#38bdf8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 9 + 5;

    piece.style.position = 'fixed';
    piece.style.zIndex = '999999';
    piece.style.top = '50%';
    piece.style.left = '50%';
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = color;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
    piece.style.pointerEvents = 'none';

    const destX = (Math.random() - 0.5) * window.innerWidth * 0.85;
    const destY = (Math.random() - 0.5) * window.innerHeight * 0.85;

    document.body.appendChild(piece);

    piece.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 360}deg) scale(0)`, opacity: 0 }
    ], {
        duration: 2000,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }).onfinish = () => {
        piece.remove();
    };
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-water" style="color:var(--color-seafoam-bright)"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.4s ease reverse forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
window.showToast = showToast;

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
