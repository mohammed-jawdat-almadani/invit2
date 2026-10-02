/**
 * السكربت الرئيسي لتشغيل وتفاعل موقع دعوة زفاف محمد وحنين
 * Main Application Logic - Wedding Invitation Platform
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. تهيئة البيانات والتطبيق
    initApp();

    // 2. التحكم بالفيديو والصوت
    initMediaControls();

    // 3. العدادات التنازلية الثلاثية
    initCountdown();

    // 4. معرض الذكريات واللايت بوكس
    initMemoriesGallery();

    // 5. نموذج تأكيد الحضور وحائط الأمنيات
    initRSVPAndWishes();

    // 6. التكامل مع التقويم والمشاركة
    initCalendarAndShare();

    // 7. توجيه ومراقبة مسار الإدارة (#admin)
    initRouting();
});

let isAudioPlaying = false;
let weddingData = null;

function initApp() {
    weddingData = window.WeddingStorage.getInfo();
    applyWeddingData();
    createSparkles();
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
    if (groomFamEl) groomFamEl.textContent = weddingData.groomFamily || 'عائلة آل الشريف';
    if (brideFamEl) brideFamEl.textContent = weddingData.brideFamily || 'عائلة آل الأحمد';

    // المونوغرام
    const monoEnEl = document.getElementById('monogram-letters-en');
    const monoArEl = document.getElementById('monogram-letters-ar');
    if (monoEnEl) monoEnEl.textContent = weddingData.monogramEn || 'M & H';
    if (monoArEl) monoArEl.textContent = weddingData.monogramAr || 'م & ح';

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
// التحكم بالفيديو والمؤثر الصوتي (Video & Audio Engine)
// ==========================================================================
function initMediaControls() {
    const video = document.getElementById('ocean-video');
    const audio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('btn-toggle-audio');

    if (!audioBtn) return;

    // محاولة تشغيل الفيديو بسلاسة مع كتم الصوت تلقائياً لتوافق المتصفحات
    if (video) {
        video.muted = true;
        video.play().catch(e => {
            console.log('Video autoplay waiting for interaction');
        });
    }

    // زر التحكم العائم بالصوت
    audioBtn.addEventListener('click', function() {
        toggleAudioPlayback();
    });

    // تفاعل تشغيل أولي ناعم عند أول نقرة في الصفحة إذا لم يكن الصوت قيد التشغيل
    const autoPlayOnFirstTouch = function() {
        if (!isAudioPlaying && audio) {
            audio.play().then(() => {
                isAudioPlaying = true;
                updateAudioButtonUI(true);
            }).catch(() => {});
        }
        document.removeEventListener('click', autoPlayOnFirstTouch);
    };
    document.addEventListener('click', autoPlayOnFirstTouch, { once: true });
}

function toggleAudioPlayback() {
    const audio = document.getElementById('bg-audio');
    if (!audio) return;

    if (isAudioPlaying) {
        audio.pause();
        isAudioPlaying = false;
        updateAudioButtonUI(false);
        showToast('تم كتم الصوت');
    } else {
        audio.play().then(() => {
            isAudioPlaying = true;
            updateAudioButtonUI(true);
            showToast('تم تشغيل الأنغام البحرية المصاحبة');
        }).catch(err => {
            console.error('Audio play error:', err);
        });
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
// العدادات التنازلية الثلاثية (Three Countdown Units)
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
// مسار برنامج الحفل (Event Itinerary Timeline)
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

        const iconClass = iconMap[item.icon] || 'fa-star';

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
// معرض الذكريات بنمط التخطيط المتعرج المتداخل (Overlapping Zig-Zag Layout)
// ==========================================================================
function initMemoriesGallery() {
    const container = document.getElementById('zigzag-gallery-container');
    const toggleBtn = document.getElementById('btn-toggle-gallery');
    const gallerySection = document.getElementById('gallery-section-content');

    if (!container || !weddingData.memories) return;

    container.innerHTML = '';

    weddingData.memories.forEach((mem, index) => {
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
                <span class="zigzag-tag">${escapeHtml(mem.tag || 'ذكرى خاصة')}</span>
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
            const imgSrc = this.getAttribute('data-img');
            openLightbox(imgSrc);
        });
    });

    // زر إظهار / إخفاء المعرض الاختياري
    if (toggleBtn && gallerySection) {
        toggleBtn.addEventListener('click', function() {
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

    // إعداد اللايت بوكس
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
// تأكيد الحضور وحائط التهاني (RSVP & Wall of Wishes)
// ==========================================================================
function initRSVPAndWishes() {
    const form = document.getElementById('wedding-rsvp-form');
    if (!form) return;

    // إظهار/إخفاء حقل المرافقين بناءً على خيار الحضور
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

        // حفظ الرد في قاعدة البيانات المحلية
        const newEntry = window.WeddingStorage.addRSVP({
            name: guestName,
            phone: phone,
            status: status,
            companions: companions,
            notes: notes
        });

        // إطلاق احتفالية القلوب والنجوم المبهجة
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
                    ? `أهلاً وسهلاً بك <strong>${escapeHtml(guestName)}</strong>! تسعدنا وتشرفنا مشاركتكم لنا فرحة العمر.`
                    : `شكراً لك <strong>${escapeHtml(guestName)}</strong> على لطفك ومشاركتنا التهنئة، قلوبكم معنا دائماً.`;
            }

            // إعداد رابط الواتساب الجاهز للإرسال
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

    // إغلاق مودال النجاح
    const btnCloseSuccess = document.getElementById('btn-close-success-modal');
    if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', function() {
            const successModal = document.getElementById('rsvp-success-modal');
            if (successModal) successModal.style.display = 'none';
        });
    }
}

// عرض حائط الأمنيات المباشر
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
                <span class="wish-author"><i class="fas fa-heart" style="color:var(--gold-light); font-size:0.8rem; margin-left:6px;"></i> ${escapeHtml(item.name)}</span>
                <span class="wish-time">${escapeHtml(item.date || 'مؤخراً')}</span>
            </div>
            <p class="wish-body">${escapeHtml(item.message)}</p>
        `;
        container.appendChild(card);
    });
}
window.renderWishesWall = renderWishesWall;

// ==========================================================================
// التكامل مع التقويم والمشاركة وخرائط جوجل (Calendar, Share & Maps)
// ==========================================================================
function initCalendarAndShare() {
    // زر خرائط جوجل
    const btnMap = document.getElementById('btn-open-map');
    if (btnMap) {
        btnMap.addEventListener('click', function(e) {
            e.preventDefault();
            const mapUrl = weddingData.googleMapsUrl || `https://maps.google.com/?q=${weddingData.venueCoordinates.lat},${weddingData.venueCoordinates.lng}`;
            window.open(mapUrl, '_blank');
        });
    }

    // زر إضافة التقويم
    const btnCalendar = document.getElementById('btn-add-calendar');
    if (btnCalendar) {
        btnCalendar.addEventListener('click', function(e) {
            e.preventDefault();
            downloadICalendarFile();
        });
    }

    // زر مشاركة الدعوة
    const btnShare = document.getElementById('btn-share-invite');
    if (btnShare) {
        btnShare.addEventListener('click', function() {
            shareInvitation();
        });
    }
}

// توليد وتحميل ملف التقويم (.ics)
function downloadICalendarFile() {
    const title = `حفل زفاف محمد وحنين المبارك`;
    const description = `نتشرف بحضوركم لمشاركتنا فرحة العمر في ${weddingData.venueName} - ${weddingData.venueAddress}`;
    const location = `${weddingData.venueName}, ${weddingData.venueCity}`;

    // صيغة التاريخ لملف iCal
    const startDate = '20261015T163000Z'; // 19:30 Damascus time (UTC+3)
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

// مشاركة رابط الدعوة عبر تطبيقات التواصل
function shareInvitation() {
    const shareTitle = `دعوة لحضور حفل زفاف محمد وحنين`;
    const shareText = `يتشرف كلٌّ من والد العريس ووالد العروس بدعوتكم الكريمة لحضور حفل زفاف نجليهما محمد وحنين في اللاذقية. يسعدنا اطلاعكم على تفاصيل الدعوة وتأكيد الحضور:`;
    const shareUrl = window.location.href.split('#')[0];

    if (navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        }).catch(() => {});
    } else {
        // نسخ الرابط للحافظة
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
            showToast('تم نسخ رابط الدعوة بنجاح، يمكنك مشاركته مع الأحباب');
        }).catch(() => {
            prompt('انسخ رابط الدعوة التالي:', shareUrl);
        });
    }
}

// ==========================================================================
// التوجيه ومراقبة مسار الإدارة (#admin)
// ==========================================================================
function initRouting() {
    function checkHashRoute() {
        const hash = window.location.hash;
        const adminView = document.getElementById('admin-view');

        if (hash === '#admin') {
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

// ==========================================================================
// المؤثرات البصرية ورسائل التنبيه (Visual Effects & Toasts)
// ==========================================================================
function createSparkles() {
    const container = document.getElementById('sparkles-container');
    if (!container) return;

    const sparkleCount = 20;
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const size = Math.random() * 4 + 2;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDuration = `${Math.random() * 8 + 6}s`;
        sparkle.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(sparkle);
    }
}

function triggerConfettiCelebration() {
    // رسم احتفالية قلوب ولمعان ذهبي خفيف
    for (let i = 0; i < 35; i++) {
        createFloatingConfettiPiece();
    }
}

function createFloatingConfettiPiece() {
    const piece = document.createElement('div');
    const colors = ['#fce494', '#d4af37', '#64dfdf', '#ffffff', '#e2be52'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;

    piece.style.position = 'fixed';
    piece.style.zIndex = '99999';
    piece.style.top = '50%';
    piece.style.left = '50%';
    piece.style.width = `${size}px`;
    piece.style.height = `${size}px`;
    piece.style.backgroundColor = color;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.pointerEvents = 'none';

    const destX = (Math.random() - 0.5) * window.innerWidth * 0.8;
    const destY = (Math.random() - 0.5) * window.innerHeight * 0.8;

    document.body.appendChild(piece);

    piece.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${destX}px, ${destY}px) rotate(${Math.random() * 360}deg) scale(0)`, opacity: 0 }
    ], {
        duration: 1800,
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
    toast.innerHTML = `<i class="fas fa-check-circle" style="color:var(--gold-light)"></i> <span>${escapeHtml(message)}</span>`;

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
