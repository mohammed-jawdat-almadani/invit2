/**
 * لوحة التحكم الاحترافية لإدارة المدعوين وحائط التهاني
 * Admin Dashboard Logic - Muhammad & Haneen Wedding
 */

(function() {
    let enteredPin = '';
    let currentFilter = 'all';
    let currentTab = 'rsvps';
    let searchQuery = '';

    // التحقق من حالة تسجيل الدخول في الجلسة الحالية
    function isAuthenticated() {
        return sessionStorage.getItem('admin_authenticated') === 'true';
    }

    function setAuthenticated(status) {
        if (status) {
            sessionStorage.setItem('admin_authenticated', 'true');
        } else {
            sessionStorage.removeItem('admin_authenticated');
        }
    }

    // تهيئة لوحة التحكم
    function initAdmin() {
        bindPinKeypad();
        bindAdminNavigation();
        bindControls();

        // دعم الدخول السريع عبر رابط الإدارة الخاص بالعروسين (?pin=1234)
        if (window.location.search.includes('pin=' + window.WeddingStorage.getAdminPIN())) {
            setAuthenticated(true);
        }

        if (isAuthenticated()) {
            showDashboard();
        } else {
            showPinModal();
        }
    }

    // ربط أحداث لوحة إدخال رمز المرور (PIN)
    function bindPinKeypad() {
        const keypadButtons = document.querySelectorAll('.btn-keypad');
        const pinErrorText = document.getElementById('pin-error-text');

        keypadButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const key = this.getAttribute('data-key');
                if (key === 'clear') {
                    enteredPin = '';
                    updatePinDots();
                    if (pinErrorText) pinErrorText.textContent = '';
                } else if (key === 'enter') {
                    validatePin();
                } else if (enteredPin.length < 4) {
                    enteredPin += key;
                    updatePinDots();
                    if (enteredPin.length === 4) {
                        setTimeout(validatePin, 200);
                    }
                }
            });
        });

        // دعم لوحة المفاتيح الفعلية
        document.addEventListener('keydown', function(e) {
            const adminView = document.getElementById('admin-view');
            if (!adminView || adminView.style.display === 'none' || isAuthenticated()) return;

            if (e.key >= '0' && e.key <= '9') {
                if (enteredPin.length < 4) {
                    enteredPin += e.key;
                    updatePinDots();
                    if (enteredPin.length === 4) {
                        setTimeout(validatePin, 200);
                    }
                }
            } else if (e.key === 'Backspace') {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
            } else if (e.key === 'Enter') {
                validatePin();
            }
        });

        // زر العودة للدعوة من شاشة القفل
        const btnBackSite = document.getElementById('btn-back-to-site');
        if (btnBackSite) {
            btnBackSite.addEventListener('click', function() {
                window.location.hash = '';
            });
        }
    }

    function updatePinDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((dot, index) => {
            if (index < enteredPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function validatePin() {
        const realPin = window.WeddingStorage.getAdminPIN();
        const pinErrorText = document.getElementById('pin-error-text');
        const loginCard = document.querySelector('.pin-login-card');

        if (enteredPin === realPin) {
            setAuthenticated(true);
            enteredPin = '';
            updatePinDots();
            if (pinErrorText) pinErrorText.textContent = '';
            showDashboard();
            if (window.showToast) {
                window.showToast('مرحباً بك! تم تسجيل الدخول إلى لوحة التحكم بنجاح');
            }
        } else {
            if (pinErrorText) pinErrorText.textContent = 'رمز المرور غير صحيح، يرجى المحاولة مرة أخرى';
            if (loginCard) {
                loginCard.classList.add('shake-error');
                setTimeout(() => loginCard.classList.remove('shake-error'), 500);
            }
            enteredPin = '';
            updatePinDots();
        }
    }

    function showPinModal() {
        const loginOverlay = document.getElementById('admin-login-overlay');
        const dashboardContent = document.getElementById('admin-dashboard-content');
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (dashboardContent) dashboardContent.style.display = 'none';
        enteredPin = '';
        updatePinDots();
    }

    function showDashboard() {
        const loginOverlay = document.getElementById('admin-login-overlay');
        const dashboardContent = document.getElementById('admin-dashboard-content');
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (dashboardContent) dashboardContent.style.display = 'block';

        renderMetrics();
        renderTable();
        renderWishesModeration();
        populateSettingsForm();
    }

    // ربط أزرار التنقل والتبويبات
    function bindAdminNavigation() {
        const btnLogout = document.getElementById('btn-admin-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                setAuthenticated(false);
                showPinModal();
                if (window.showToast) {
                    window.showToast('تم تسجيل الخروج بنجاح');
                }
            });
        }

        const btnPreview = document.getElementById('btn-admin-preview');
        if (btnPreview) {
            btnPreview.addEventListener('click', function() {
                window.location.hash = '';
            });
        }

        // التبديل بين التبويبات
        const tabButtons = document.querySelectorAll('.admin-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                tabButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentTab = this.getAttribute('data-tab');

                document.getElementById('tab-content-rsvps').style.display = (currentTab === 'rsvps') ? 'block' : 'none';
                document.getElementById('tab-content-wishes').style.display = (currentTab === 'wishes') ? 'block' : 'none';
                document.getElementById('tab-content-settings').style.display = (currentTab === 'settings') ? 'block' : 'none';

                if (currentTab === 'rsvps') renderTable();
                if (currentTab === 'wishes') renderWishesModeration();
            });
        });
    }

    // ربط أدوات البحث والفلترة والتصدير
    function bindControls() {
        const searchInput = document.getElementById('admin-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchQuery = this.value.trim().toLowerCase();
                renderTable();
            });
        }

        const filterPills = document.querySelectorAll('.btn-filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', function() {
                filterPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                renderTable();
            });
        });

        // زر تصدير CSV للإكسل
        const btnExportCsv = document.getElementById('btn-export-csv');
        if (btnExportCsv) {
            btnExportCsv.addEventListener('click', exportToCSV);
        }

        // زر الطباعة
        const btnPrint = document.getElementById('btn-print-sheet');
        if (btnPrint) {
            btnPrint.addEventListener('click', function() {
                window.print();
            });
        }

        // نموذج حفظ الإعدادات
        const settingsForm = document.getElementById('admin-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveSettings();
            });
        }
    }

    // حساب وعرض المؤشرات الرقمية (Metrics)
    function renderMetrics() {
        const list = window.WeddingStorage.getRSVPList();
        const total = list.length;
        const attendingList = list.filter(r => r.status === 'attending');
        const attending = attendingList.length;
        const declined = list.filter(r => r.status === 'declined').length;

        // إجمالي الحضور بالأفراد (المدعو + المرافقين)
        const totalHeadcount = attendingList.reduce((sum, r) => sum + 1 + (parseInt(r.companions, 10) || 0), 0);

        const attendingPct = total > 0 ? Math.round((attending / total) * 100) : 0;
        const declinedPct = total > 0 ? Math.round((declined / total) * 100) : 0;

        document.getElementById('metric-total-count').textContent = total;
        document.getElementById('metric-attending-count').textContent = attending;
        document.getElementById('metric-attending-pct').textContent = `${attendingPct}% نسبة التأكيد`;
        document.getElementById('metric-declined-count').textContent = declined;
        document.getElementById('metric-declined-pct').textContent = `${declinedPct}% نسبة الاعتذار`;
        document.getElementById('metric-headcount-count').textContent = totalHeadcount;
    }

    // عرض جدول المدعوين
    function renderTable() {
        const list = window.WeddingStorage.getRSVPList();
        const tbody = document.getElementById('admin-table-body');
        const emptyState = document.getElementById('admin-table-empty');

        if (!tbody) return;

        // تطبيق الفلترة والبحث
        let filtered = list.filter(item => {
            const matchesFilter = (currentFilter === 'all') || (item.status === currentFilter);
            const matchesSearch = !searchQuery ||
                (item.name && item.name.toLowerCase().includes(searchQuery)) ||
                (item.phone && item.phone.toLowerCase().includes(searchQuery)) ||
                (item.notes && item.notes.toLowerCase().includes(searchQuery));
            return matchesFilter && matchesSearch;
        });

        tbody.innerHTML = '';

        if (filtered.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        } else {
            if (emptyState) emptyState.style.display = 'none';
        }

        filtered.forEach((r, idx) => {
            const tr = document.createElement('tr');

            const isAttending = r.status === 'attending';
            const statusBadge = isAttending
                ? `<span class="status-badge status-attending"><i class="fas fa-check-circle"></i> حاضر ومؤكد</span>`
                : `<span class="status-badge status-declined"><i class="fas fa-times-circle"></i> معتذر بلطف</span>`;

            const companionsDisplay = isAttending && r.companions > 0
                ? `<span class="companions-count-badge">+${r.companions} مرافق</span>`
                : (isAttending ? '<span style="color:var(--text-muted)">بدون مرافقين</span>' : '-');

            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString('ar-SY', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'غير محدد';

            tr.innerHTML = `
                <td style="font-weight:700; color:var(--gold-light)">${idx + 1}</td>
                <td>
                    <div style="font-weight:700; color:#fff">${escapeHtml(r.name)}</div>
                    ${r.phone ? `<div style="font-size:0.82rem; color:var(--text-muted); direction:ltr; text-align:right">${escapeHtml(r.phone)}</div>` : ''}
                </td>
                <td>${statusBadge}</td>
                <td>${companionsDisplay}</td>
                <td style="max-width:280px; font-size:0.88rem; color:var(--text-secondary)">
                    ${r.notes ? escapeHtml(r.notes) : '<span style="color:var(--text-muted)">-</span>'}
                </td>
                <td style="font-size:0.82rem; color:var(--text-muted)">${dateStr}</td>
                <td>
                    <div class="table-actions-cell">
                        <button class="btn-table-action" title="تبديل الحالة" data-id="${r.id}" data-action="toggle">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="btn-table-action delete" title="حذف الرد" data-id="${r.id}" data-action="delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;

            tbody.appendChild(tr);
        });

        // ربط أحداث الإجراءات بالجدول
        tbody.querySelectorAll('.btn-table-action').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const action = this.getAttribute('data-action');

                if (action === 'delete') {
                    if (confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) {
                        window.WeddingStorage.deleteRSVP(id);
                        renderMetrics();
                        renderTable();
                        if (window.renderWishesWall) window.renderWishesWall();
                        if (window.showToast) window.showToast('تم حذف السجل بنجاح');
                    }
                } else if (action === 'toggle') {
                    const item = window.WeddingStorage.getRSVPList().find(x => x.id === id);
                    if (item) {
                        const newStatus = item.status === 'attending' ? 'declined' : 'attending';
                        window.WeddingStorage.updateRSVPStatus(id, newStatus);
                        renderMetrics();
                        renderTable();
                        if (window.showToast) window.showToast('تم تحديث حالة الحضور بنجاح');
                    }
                }
            });
        });
    }

    // عرض وإدارة حائط التهاني في لوحة التحكم
    function renderWishesModeration() {
        const wishes = window.WeddingStorage.getWishesList();
        const container = document.getElementById('admin-wishes-container');
        if (!container) return;

        container.innerHTML = '';

        if (wishes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px; color:var(--text-muted)">
                    <i class="fas fa-envelope-open" style="font-size:2rem; color:var(--gold-primary); margin-bottom:10px"></i>
                    <p>لا توجد تهاني مسجلة حتى الآن</p>
                </div>
            `;
            return;
        }

        wishes.forEach(wish => {
            const card = document.createElement('div');
            card.className = 'admin-wish-card';
            card.innerHTML = `
                <div class="admin-wish-header">
                    <div class="admin-wish-author">${escapeHtml(wish.name)}</div>
                    <div class="admin-wish-time">${escapeHtml(wish.date || 'مؤخراً')}</div>
                </div>
                <div class="admin-wish-text">${escapeHtml(wish.message)}</div>
                <div class="admin-wish-footer">
                    <button class="btn-table-action delete" title="حذف الرسالة" data-id="${wish.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            card.querySelector('.btn-table-action.delete').addEventListener('click', function() {
                if (confirm('هل ترغب في حذف هذه الرسالة من حائط التهاني؟')) {
                    window.WeddingStorage.deleteWish(wish.id);
                    renderWishesModeration();
                    if (window.renderWishesWall) window.renderWishesWall();
                    if (window.showToast) window.showToast('تم حذف رسالة التهنئة بنجاح');
                }
            });

            container.appendChild(card);
        });
    }

    // تعبئة نموذج الإعدادات
    function populateSettingsForm() {
        const info = window.WeddingStorage.getInfo();
        const pin = window.WeddingStorage.getAdminPIN();

        const groomInput = document.getElementById('set-groom-name');
        const brideInput = document.getElementById('set-bride-name');
        const dateInput = document.getElementById('set-wedding-date');
        const venueInput = document.getElementById('set-venue-name');
        const addressInput = document.getElementById('set-venue-address');
        const whatsappInput = document.getElementById('set-whatsapp');
        const pinInput = document.getElementById('set-admin-pin');

        if (groomInput) groomInput.value = info.groomName || '';
        if (brideInput) brideInput.value = info.brideName || '';
        if (dateInput) dateInput.value = info.weddingDateFormatted || '';
        if (venueInput) venueInput.value = info.venueName || '';
        if (addressInput) addressInput.value = info.venueAddress || '';
        if (whatsappInput) whatsappInput.value = info.whatsappNumber || '';
        if (pinInput) pinInput.value = pin || '';
    }

    // حفظ تعديلات الإعدادات
    function saveSettings() {
        const info = window.WeddingStorage.getInfo();

        info.groomName = document.getElementById('set-groom-name').value.trim();
        info.brideName = document.getElementById('set-bride-name').value.trim();
        info.weddingDateFormatted = document.getElementById('set-wedding-date').value.trim();
        info.venueName = document.getElementById('set-venue-name').value.trim();
        info.venueAddress = document.getElementById('set-venue-address').value.trim();
        info.whatsappNumber = document.getElementById('set-whatsapp').value.trim();

        const newPin = document.getElementById('set-admin-pin').value.trim();
        if (newPin.length >= 4) {
            window.WeddingStorage.setAdminPIN(newPin);
        }

        window.WeddingStorage.saveInfo(info);

        if (window.applyWeddingData) {
            window.applyWeddingData();
        }

        if (window.showToast) {
            window.showToast('تم حفظ كافة إعدادات المناسبة بنجاح');
        }
    }

    // تصدير جدول الحضور إلى ملف CSV يدعم اللغة العربية والإكسل بنسبة 100%
    function exportToCSV() {
        const list = window.WeddingStorage.getRSVPList();
        if (list.length === 0) {
            alert('لا توجد بيانات متاحة للتصدير حالياً');
            return;
        }

        // استخدام UTF-8 BOM لضمان قراءة الحروف العربية في Microsoft Excel مباشرة
        let csvContent = '\uFEFF';
        csvContent += '"الرقم","اسم المدعو","رقم الهاتف","حالة الحضور","عدد المرافقين","الكلمة الطيبة / الملاحظات","تاريخ التسجيل"\n';

        list.forEach((r, idx) => {
            const statusText = r.status === 'attending' ? 'مؤكد الحضور' : 'معتذر';
            const cleanName = (r.name || '').replace(/"/g, '""');
            const cleanPhone = (r.phone || '').replace(/"/g, '""');
            const cleanNotes = (r.notes || '').replace(/"/g, '""');
            const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString('ar-SY') : '';

            csvContent += `"${idx + 1}","${cleanName}","${cleanPhone}","${statusText}","${r.companions || 0}","${cleanNotes}","${dateStr}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `كشف_مدعوي_زفاف_محمد_وحنين_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (window.showToast) {
            window.showToast('تم تصدير ملف الإكسل (CSV) بنجاح');
        }
    }

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

    window.initAdmin = initAdmin;
    window.showDashboard = showDashboard;
})();
