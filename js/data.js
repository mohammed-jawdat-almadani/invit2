/**
 * نظام إدارة البيانات والتخزين المحلي لدعوة زفاف محمد وحنين
 * Wedding Invitation Data & LocalStorage Management
 */

const STORAGE_KEYS = {
    WEDDING_INFO: 'wedding_invitation_info_v1',
    RSVP_LIST: 'wedding_invitation_rsvp_v1',
    WISHES_LIST: 'wedding_invitation_wishes_v1',
    ADMIN_CONFIG: 'wedding_invitation_admin_v1'
};

// البيانات الافتراضية النموذجية للمناسبة
const DEFAULT_WEDDING_DATA = {
    groomName: 'محمد',
    brideName: 'حنين',
    groomFamily: 'عائلة السيد عبد الرحمن آل الشريف',
    brideFamily: 'عائلة السيد مصطفى آل الأحمد',
    monogramAr: 'م & ح',
    monogramEn: 'M & H',
    quranVerse: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    welcomePhrase: 'لا تكتمل فرحتنا وسعادتنا إلا بحضوركم ومشاركتكم أبهى لحظات العمر',
    honorificIntro: 'يتشرف كلٌّ من والد العريس ووالد العروس بدعوة سيادتكم الكريمة لحضور حفل زفاف نجليهما المبارك',
    weddingDateISO: '2026-10-15T19:30:00',
    weddingDateFormatted: 'الخميس، 15 تشرين الأول (أكتوبر) 2026',
    weddingTimeFormatted: 'الساعة 07:30 مساءً بتوقيت دمشق',
    venueName: 'فندق ومنتجع الشاطئ الأزرق الملكي - القاعة الكبرى',
    venueCity: 'اللاذقية، الجمهورية العربية السورية',
    venueAddress: 'الكورنيش البحري الشمالي، طريق الشاطئ الأزرق، الواجهة البحرية',
    venueCoordinates: { lat: 35.5892, lng: 35.7481 },
    googleMapsUrl: 'https://maps.google.com/?q=35.5892,35.7481',
    whatsappNumber: '+963933112233',
    dressCode: 'الزي الرسمي الفاخر (Formal Elegance / Black Tie)',
    schedule: [
        {
            time: '07:30 م',
            title: 'استقبال الضيوف الكرام',
            desc: 'الترحيب بالبخور الشامي الفاخر والقهوة العربية مع عزف أوتار العود',
            icon: 'coffee'
        },
        {
            time: '08:45 م',
            title: 'الزفة السورية الملكية',
            desc: 'دخول العروسين مع فرقة العراضة السورية الأصيلة وأنغام الفرح',
            icon: 'crown'
        },
        {
            time: '09:45 م',
            title: 'مراسم تبادل الخواتم',
            desc: 'لحظات توثيق العهد السعيد وتقطيع كعكة الزفاف الملكية',
            icon: 'rings'
        },
        {
            time: '10:30 م',
            title: 'مأدبة العشاء الفاخرة',
            desc: 'بوفيه مفتوح لأشهى المأكولات الشرقية والغربية مع إطلالة البحر',
            icon: 'dinner'
        },
        {
            time: '11:30 م',
            title: 'الصور التذكارية والختام',
            desc: 'تخليد أجمل اللقطات مع الأحباب والأصدقاء وإطلاق الألعاب النارية',
            icon: 'camera'
        }
    ],
    memories: [
        {
            id: 1,
            title: 'خطوات نحو الأبدية',
            date: 'صيف 2025',
            caption: 'على شاطئ البحر الهادئ حيث تلاقت القلوب وبدأت أجمل حكايات العمر',
            image: 'assets/images/memory_1.jpg',
            tag: 'بداية الرحلة'
        },
        {
            id: 2,
            title: 'عهد الوفاء والمحبة',
            date: 'ربيع 2026',
            caption: 'محبسان في صدفة البحر ولآلئ النقاء... رمزٌ لرباطٍ لا ينفصم بإذن الله',
            image: 'assets/images/memory_2.jpg',
            tag: 'خواتم الزفاف'
        },
        {
            id: 3,
            title: 'غروب في شرفة القصر',
            date: 'خريف 2026',
            caption: 'نظرة تملؤها السكينة والأمل بغدٍ مشرق نبنيه معاً حباً ومودة ورخاء',
            image: 'assets/images/memory_3.jpg',
            tag: 'لحظات لا تُنسى'
        }
    ]
};

// عينات أولية نموذجية لتأكيدات الحضور
const DEFAULT_RSVP_LIST = [
    {
        id: 'rsvp_001',
        name: 'الدكتور أنس المرادي وعائلته',
        phone: '+963944111222',
        status: 'attending', // 'attending' | 'declined'
        companions: 2,
        notes: 'يشرفنا ويسعدنا جداً الحضور لمشاركتكم هذه الليلة التاريخية',
        createdAt: '2026-09-24T18:30:00'
    },
    {
        id: 'rsvp_002',
        name: 'المهندس طارق الكيالي',
        phone: '+963955333444',
        status: 'attending',
        companions: 1,
        notes: 'ألف مبارك للأخ والصديق محمد، سنكون أول الحاضرين بإذن الله',
        createdAt: '2026-09-24T20:15:00'
    },
    {
        id: 'rsvp_003',
        name: 'الأستاذ سامر العلي',
        phone: '+963966555666',
        status: 'declined',
        companions: 0,
        notes: 'نعتذر بشدة لتواجدنا خارج القطر في هذا التوقيت، قلوبنا معكم ودعواتنا لكم بدوام التوفيق',
        createdAt: '2026-09-25T11:45:00'
    },
    {
        id: 'rsvp_004',
        name: 'السيدة ريم الصباغ وكريمتها',
        phone: '+963988777888',
        status: 'attending',
        companions: 1,
        notes: 'مبارك للعروسين الغاليين حنين ومحمد، جعل الله أيامكم كلها هناء وسرور',
        createdAt: '2026-09-25T14:10:00'
    }
];

// عينات أولية لحائط التهاني والأمنيات
const DEFAULT_WISHES_LIST = [
    {
        id: 'wish_001',
        name: 'الدكتور أنس المرادي',
        message: 'ألف ترليون مبارك للغالي محمد والعروس المصونة حنين، بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة دائمة.',
        date: 'منذ يومين'
    },
    {
        id: 'wish_002',
        name: 'المهندس طارق الكيالي',
        message: 'يا طير الفرح غرد بأحلى الألحان، مبارك لأجمل عريسين في الشام والساحل. زواج مبارك وحياة سعيدة ملؤها المودة والتوفيق.',
        date: 'منذ يوم'
    },
    {
        id: 'wish_003',
        name: 'عائلة آل النحاس',
        message: 'تهانينا الحارة لعائلتي آل الشريف وآل الأحمد الكريمتين بمناسبة قران نجليهما. دمتم ودامت دياركم عامرة بالأفراح والمسرات.',
        date: 'منذ 15 ساعة'
    },
    {
        id: 'wish_004',
        name: 'السيدة ريم الصباغ',
        message: 'ألف مبارك لحبيبتنا حنين، بدر أضاء ليلتنا، تمنياتنا لكِ ولمحمد بحياة زوجية هانئة تملؤها الرحمة والمحبة والذرية الصالحة.',
        date: 'منذ 8 ساعات'
    }
];

const DEFAULT_ADMIN_CONFIG = {
    pin: '1234'
};

// كائن إدارة التخزين
const WeddingStorage = {
    getInfo: function() {
        const data = localStorage.getItem(STORAGE_KEYS.WEDDING_INFO);
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.WEDDING_INFO, JSON.stringify(DEFAULT_WEDDING_DATA));
            return DEFAULT_WEDDING_DATA;
        }
        try {
            return JSON.parse(data);
        } catch(e) {
            return DEFAULT_WEDDING_DATA;
        }
    },

    saveInfo: function(info) {
        localStorage.setItem(STORAGE_KEYS.WEDDING_INFO, JSON.stringify(info));
    },

    getRSVPList: function() {
        const data = localStorage.getItem(STORAGE_KEYS.RSVP_LIST);
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.RSVP_LIST, JSON.stringify(DEFAULT_RSVP_LIST));
            return DEFAULT_RSVP_LIST;
        }
        try {
            return JSON.parse(data);
        } catch(e) {
            return DEFAULT_RSVP_LIST;
        }
    },

    addRSVP: function(entry) {
        const list = this.getRSVPList();
        const newEntry = {
            id: 'rsvp_' + Date.now(),
            name: entry.name,
            phone: entry.phone || '',
            status: entry.status, // 'attending' | 'declined'
            companions: parseInt(entry.companions, 10) || 0,
            notes: entry.notes || '',
            createdAt: new Date().toISOString()
        };
        list.unshift(newEntry);
        localStorage.setItem(STORAGE_KEYS.RSVP_LIST, JSON.stringify(list));

        if (entry.notes && entry.notes.trim().length > 0) {
            this.addWish({
                name: entry.name,
                message: entry.notes.trim()
            });
        }

        return newEntry;
    },

    updateRSVPStatus: function(id, newStatus) {
        const list = this.getRSVPList();
        const item = list.find(r => r.id === id);
        if (item) {
            item.status = newStatus;
            localStorage.setItem(STORAGE_KEYS.RSVP_LIST, JSON.stringify(list));
            return true;
        }
        return false;
    },

    deleteRSVP: function(id) {
        let list = this.getRSVPList();
        list = list.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.RSVP_LIST, JSON.stringify(list));
        return list;
    },

    getWishesList: function() {
        const data = localStorage.getItem(STORAGE_KEYS.WISHES_LIST);
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.WISHES_LIST, JSON.stringify(DEFAULT_WISHES_LIST));
            return DEFAULT_WISHES_LIST;
        }
        try {
            return JSON.parse(data);
        } catch(e) {
            return DEFAULT_WISHES_LIST;
        }
    },

    addWish: function(wish) {
        const list = this.getWishesList();
        const newWish = {
            id: 'wish_' + Date.now(),
            name: wish.name,
            message: wish.message,
            date: 'الآن'
        };
        list.unshift(newWish);
        localStorage.setItem(STORAGE_KEYS.WISHES_LIST, JSON.stringify(list));
        return newWish;
    },

    deleteWish: function(id) {
        let list = this.getWishesList();
        list = list.filter(w => w.id !== id);
        localStorage.setItem(STORAGE_KEYS.WISHES_LIST, JSON.stringify(list));
        return list;
    },

    getAdminPIN: function() {
        const config = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
        if (!config) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(DEFAULT_ADMIN_CONFIG));
            return DEFAULT_ADMIN_CONFIG.pin;
        }
        try {
            return JSON.parse(config).pin || DEFAULT_ADMIN_CONFIG.pin;
        } catch(e) {
            return DEFAULT_ADMIN_CONFIG.pin;
        }
    },

    setAdminPIN: function(newPin) {
        const cfg = { pin: newPin };
        localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(cfg));
    },

    resetAllData: function() {
        localStorage.setItem(STORAGE_KEYS.WEDDING_INFO, JSON.stringify(DEFAULT_WEDDING_DATA));
        localStorage.setItem(STORAGE_KEYS.RSVP_LIST, JSON.stringify(DEFAULT_RSVP_LIST));
        localStorage.setItem(STORAGE_KEYS.WISHES_LIST, JSON.stringify(DEFAULT_WISHES_LIST));
        localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(DEFAULT_ADMIN_CONFIG));
    }
};

window.WeddingStorage = WeddingStorage;
