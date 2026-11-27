import { Language } from './types';

export interface WordEntry {
  id?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  words: Record<Language, string>;
}

/**
 * Creative expansion pack for DOUR:
 * - Fills previously empty categories: CAT_FEELINGS, CAT_TECH, CAT_ADJECTIVES
 * - Adds 3 brand-new creative categories: CAT_SCIENCE, CAT_MYTHOLOGY, CAT_CULTURE
 * - Balances Hard-tier words for CAT_JOBS so every category has Easy, Medium & Hard entries
 * All 9 languages (fa, en, nl, de, fr, ar, tr, pl, uk) are fully localized.
 */
export const EXTRA_WORDS: WordEntry[] = [
  // ==========================================
  // CAT_FEELINGS (احساسات و حالات) — EASY, MEDIUM, HARD
  // ==========================================
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "شادی", en: "Happiness", nl: "Blijdschap", de: "Freude", fr: "Bonheur", ar: "سعادة", tr: "Mutluluk", pl: "Radość", uk: "Щастя" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "خشم", en: "Anger", nl: "Woede", de: "Wut", fr: "Colère", ar: "غضب", tr: "Öfke", pl: "Gniew", uk: "Гнів" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "ترس", en: "Fear", nl: "Angst", de: "Angst", fr: "Peur", ar: "خوف", tr: "Korku", pl: "Strach", uk: "Страх" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "عشق", en: "Love", nl: "Liefde", de: "Liebe", fr: "Amour", ar: "حب", tr: "Aşk", pl: "Miłość", uk: "Любов" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "حسادت", en: "Jealousy", nl: "Jaloezie", de: "Eifersucht", fr: "Jalousie", ar: "غيرة", tr: "Kıskançlık", pl: "Zazdrość", uk: "Заздрість" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "امید", en: "Hope", nl: "Hoop", de: "Hoffnung", fr: "Espoir", ar: "أمل", tr: "Umut", pl: "Nadzieja", uk: "Надія" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "خجالت", en: "Shyness", nl: "Verlegenheid", de: "Schüchternheit", fr: "Timidité", ar: "خجل", tr: "Utangaçlık", pl: "Nieśmiałość", uk: "Сором'язливість" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "تعجب", en: "Surprise", nl: "Verrassing", de: "Überraschung", fr: "Surprise", ar: "مفاجأة", tr: "Şaşkınlık", pl: "Zaskoczenie", uk: "Здивування" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "آرامش", en: "Calmness", nl: "Kalmte", de: "Ruhe", fr: "Calme", ar: "هدوء", tr: "Huzur", pl: "Spokój", uk: "Спокій" } },
  { category: "CAT_FEELINGS", difficulty: "easy", words: { fa: "دلتنگی", en: "Homesickness", nl: "Heimwee", de: "Heimweh", fr: "Nostalgie", ar: "حنين", tr: "Özlem", pl: "Tęsknota", uk: "Туга" } },
  { category: "CAT_FEELINGS", difficulty: "medium", words: { fa: "استرس امتحان", en: "Exam Stress", nl: "Examenstress", de: "Prüfungsangst", fr: "Stress d'examen", ar: "توتر الامتحان", tr: "Sınav stresi", pl: "Stres egzaminacyjny", uk: "Екзаменаційний стрес" } },
  { category: "CAT_FEELINGS", difficulty: "medium", words: { fa: "لبخند رضایت", en: "Satisfied Smile", nl: "Tevreden glimlach", de: "Zufriedenes Lächeln", fr: "Sourire satisfait", ar: "ابتسامة رضا", tr: "Memnun gülümseme", pl: "Zadowolony uśmiech", uk: "Задоволена усмішка" } },
  { category: "CAT_FEELINGS", difficulty: "medium", words: { fa: "شوق سفر", en: "Wanderlust", nl: "Reislust", de: "Fernweh", fr: "Envie de voyager", ar: "شغف السفر", tr: "Gezme tutkusu", pl: "Żądza podróży", uk: "Жага до подорожей" } },
  { category: "CAT_FEELINGS", difficulty: "medium", words: { fa: "ترس از ارتفاع", en: "Fear of Heights", nl: "Hoogtevrees", de: "Höhenangst", fr: "Vertige", ar: "رهاب المرتفعات", tr: "Yükseklik korkusu", pl: "Lęk wysokości", uk: "Страх висоти" } },
  { category: "CAT_FEELINGS", difficulty: "medium", words: { fa: "خواب‌آلودگی صبحگاهی", en: "Morning Sleepiness", nl: "Ochtendslaperigheid", de: "Morgenmüdigkeit", fr: "Somnolence matinale", ar: "نعاس الصباح", tr: "Sabah mahmurluğu", pl: "Poranna senność", uk: "Ранкова сонливість" } },
  { category: "CAT_FEELINGS", difficulty: "hard", words: { fa: "پروانه‌های هیجان در دل", en: "Butterflies in your stomach", nl: "Vlinders in je buik", de: "Schmetterlinge im Bauch", fr: "Avoir des papillons dans le ventre", ar: "فراشات في المعدة من الحماس", tr: "Karnında kelebekler uçuşması", pl: "Motyle w brzuchu", uk: "Метелики в животі" } },
  { category: "CAT_FEELINGS", difficulty: "hard", words: { fa: "روی ابرها راه رفتن", en: "Walking on cloud nine", nl: "Op een roze wolk zitten", de: "Auf Wolke sieben schweben", fr: "Être sur un petit nuage", ar: "يطير من الفرح فوق السحاب", tr: "Mutluluktan havalara uçmak", pl: "Być w siódmym niebie", uk: "Бути на сьомому небі" } },
  { category: "CAT_FEELINGS", difficulty: "hard", words: { fa: "اشک شوق در چشم‌ها", en: "Tears of pure joy", nl: "Tranen van puur geluk", de: "Freudentränen in den Augen", fr: "Larmes de joie pure", ar: "دموع الفرح الصادق", tr: "Sevinç gözyaşları dökmek", pl: "Łzy czystej radości", uk: "Сльози щирої радості" } },

  // ==========================================
  // CAT_TECH (تکنولوژی و دیجیتال) — EASY, MEDIUM, HARD
  // ==========================================
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "لپ‌تاپ", en: "Laptop", nl: "Laptop", de: "Laptop", fr: "Ordinateur portable", ar: "حاسوب محمول", tr: "Dizüstü bilgisayar", pl: "Laptop", uk: "Ноутбук" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "هدفون", en: "Headphones", nl: "Koptelefoon", de: "Kopfhörer", fr: "Casque audio", ar: "سماعات رأس", tr: "Kulaklık", pl: "Słuchawki", uk: "Навушники" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "ربات", en: "Robot", nl: "Robot", de: "Roboter", fr: "Robot", ar: "روبوت", tr: "Robot", pl: "Robot", uk: "Робот" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "اینترنت", en: "Internet", nl: "Internet", de: "Internet", fr: "Internet", ar: "إنترنت", tr: "İnternet", pl: "Internet", uk: "Інтернет" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "وای‌فای", en: "Wi-Fi", nl: "Wifi", de: "WLAN", fr: "Wi-Fi", ar: "واي فاي", tr: "Wi-Fi", pl: "Wi-Fi", uk: "Wi-Fi" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "شارژر", en: "Charger", nl: "Oplader", de: "Ladegerät", fr: "Chargeur", ar: "شاحن", tr: "Şarj aleti", pl: "Ładowarka", uk: "Зарядка" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "دوربین", en: "Camera", nl: "Camera", de: "Kamera", fr: "Appareil photo", ar: "كاميرا", tr: "Kamera", pl: "Aparat", uk: "Камера" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "پهپاد", en: "Drone", nl: "Drone", de: "Drohne", fr: "Drone", ar: "طائرة مسيرة", tr: "Dron", pl: "Dron", uk: "Дрон" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "کیبورد", en: "Keyboard", nl: "Toetsenbord", de: "Tastatur", fr: "Clavier", ar: "لوحة مفاتيح", tr: "Klavye", pl: "Klawiatura", uk: "Клавіатура" } },
  { category: "CAT_TECH", difficulty: "easy", words: { fa: "میکروفون", en: "Microphone", nl: "Microfoon", de: "Mikrofon", fr: "Microphone", ar: "ميكروفون", tr: "Mikrofon", pl: "Mikrofon", uk: "Мікрофон" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "هوش مصنوعی", en: "Artificial Intelligence", nl: "Kunstmatige intelligentie", de: "Künstliche Intelligenz", fr: "Intelligence artificielle", ar: "الذكاء الاصطناعي", tr: "Yapay zeka", pl: "Sztuczna inteligencja", uk: "Штучний інтелект" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "ساعت هوشمند", en: "Smartwatch", nl: "Smartwatch", de: "Smartwatch", fr: "Montre connectée", ar: "ساعة ذكية", tr: "Akıllı saat", pl: "Smartwatch", uk: "Розумний годинник" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "واقعیت مجازی", en: "Virtual Reality", nl: "Virtuele realiteit", de: "Virtuelle Realität", fr: "Réalité virtuelle", ar: "الواقع الافتراضي", tr: "Sanal gerçeklik", pl: "Wirtualna rzeczywistość", uk: "Віртуальна реальність" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "باتری قابل‌شارژ", en: "Power Bank", nl: "Powerbank", de: "Powerbank", fr: "Batterie externe", ar: "شاحن متنقل", tr: "Taşınabilir şarj", pl: "Powerbank", uk: "Павербанк" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "چاپگر سه‌بعدی", en: "3D Printer", nl: "3D-printer", de: "3D-Drucker", fr: "Imprimante 3D", ar: "طابعة ثلاثية الأبعاد", tr: "3D Yazıcı", pl: "Drukarka 3D", uk: "3D-принтер" } },
  { category: "CAT_TECH", difficulty: "medium", words: { fa: "رمز عبور", en: "Password", nl: "Wachtwoord", de: "Passwort", fr: "Mot de passe", ar: "كلمة المرور", tr: "Şifre", pl: "Hasło", uk: "Пароль" } },
  { category: "CAT_TECH", difficulty: "hard", words: { fa: "فراموش کردن رمز وای‌فای خانه", en: "Forgetting the home Wi-Fi password", nl: "Het wifi-wachtwoord vergeten", de: "Das WLAN-Passwort vergessen", fr: "Oublier le mot de passe du Wi-Fi", ar: "نسيان كلمة مرور الواي فاي المنزلي", tr: "Ev Wi-Fi şifresini unutmak", pl: "Zapomnienie hasła do domowego Wi-Fi", uk: "Забути пароль від домашнього Wi-Fi" } },
  { category: "CAT_TECH", difficulty: "hard", words: { fa: "تمام شدن شارژ گوشی وسط تماس", en: "Phone battery dying mid-call", nl: "Lege batterij midden in een gesprek", de: "Akku leer mitten im Telefonat", fr: "Batterie vide en plein appel", ar: "نفاد بطارية الهاتف أثناء المكالمة", tr: "Konuşma ortasında telefonun şarjının bitmesi", pl: "Rozładowany telefon w trakcie rozmowy", uk: "Розряджений телефон посеред дзвінка" } },
  { category: "CAT_TECH", difficulty: "hard", words: { fa: "خودروی خودران برقی هوشمند", en: "Self-driving electric smart car", nl: "Zelfrijdende elektrische auto", de: "Selbstfahrendes Elektroauto", fr: "Voiture électrique autonome", ar: "سيارة كهربائية ذاتية القيادة", tr: "Otonom elektrikli akıllı araba", pl: "Autonomiczny samochód elektryczny", uk: "Безпілотний електромобіль" } },

  // ==========================================
  // CAT_ADJECTIVES (صفت‌های توصیفی) — EASY, MEDIUM, HARD
  // ==========================================
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "سریع", en: "Fast", nl: "Snel", de: "Schnell", fr: "Rapide", ar: "سريع", tr: "Hızlı", pl: "Szybki", uk: "Швидкий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "سنگین", en: "Heavy", nl: "Zwaar", de: "Schwer", fr: "Lourd", ar: "ثقيل", tr: "Ağır", pl: "Ciężki", uk: "Важкий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "شیرین", en: "Sweet", nl: "Zoet", de: "Süß", fr: "Sucré", ar: "حلو", tr: "Tatlı", pl: "Słodki", uk: "Солодкий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "ترش", en: "Sour", nl: "Zuur", de: "Sauer", fr: "Acide", ar: "حامض", tr: "Ekşi", pl: "Kwaśny", uk: "Кислий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "نامرئی", en: "Invisible", nl: "Onzichtbaar", de: "Unsichtbar", fr: "Invisible", ar: "غير مرئي", tr: "Görünmez", pl: "Niewidzialny", uk: "Невидимий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "درخشان", en: "Shiny", nl: "Glanzend", de: "Glänzend", fr: "Brillant", ar: "لامع", tr: "Parlak", pl: "Lśniący", uk: "Блискучий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "لغزنده", en: "Slippery", nl: "Glad", de: "Rutschig", fr: "Glissant", ar: "زلق", tr: "Kaygan", pl: "Śliski", uk: "Слизький" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "عجیب", en: "Strange", nl: "Vreemd", de: "Seltsam", fr: "Étrange", ar: "غريب", tr: "Garip", pl: "Dziwny", uk: "Дивний" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "شجاع", en: "Brave", nl: "Dapper", de: "Mutig", fr: "Courageux", ar: "شجاع", tr: "Cesur", pl: "Odważny", uk: "Хоробрий" } },
  { category: "CAT_ADJECTIVES", difficulty: "easy", words: { fa: "تنبل", en: "Lazy", nl: "Lui", de: "Faul", fr: "Paresseux", ar: "كسول", tr: "Tembel", pl: "Leniwy", uk: "Лінивий" } },
  { category: "CAT_ADJECTIVES", difficulty: "medium", words: { fa: "خوش‌قلب و مهربان", en: "Warm-hearted", nl: "Warmhartig", de: "Warmherzig", fr: "Au grand cœur", ar: "طيب القلب", tr: "İyi kalpli", pl: "Dobroduszny", uk: "Добросердий" } },
  { category: "CAT_ADJECTIVES", difficulty: "medium", words: { fa: "پرانرژی و سرزنده", en: "Full of Energy", nl: "Vol energie", de: "Voller Energie", fr: "Plein d'énergie", ar: "مليء بالحيوية", tr: "Enerji dolu", pl: "Pełen energii", uk: "Повний енергії" } },
  { category: "CAT_ADJECTIVES", difficulty: "medium", words: { fa: "ضدآب و مقاوم", en: "Waterproof", nl: "Waterdicht", de: "Wasserdicht", fr: "Imperméable", ar: "مقاوم للماء", tr: "Su geçirmez", pl: "Wodoodporny", uk: "Водонепроникний" } },
  { category: "CAT_ADJECTIVES", difficulty: "medium", words: { fa: "مرموز و اسرارآمیز", en: "Mysterious", nl: "Mysterieus", de: "Geheimnisvoll", fr: "Mystérieux", ar: "غامض", tr: "Gizemli", pl: "Tajemniczy", uk: "Таємничий" } },
  { category: "CAT_ADJECTIVES", difficulty: "medium", words: { fa: "سحرخیز و منظم", en: "Early Bird", nl: "Vroege vogel", de: "Frühaufsteher", fr: "Lève-tôt", ar: "نشيط في الصباح", tr: "Erkenci kuş", pl: "Ranny ptaszek", uk: "Рання пташка" } },
  { category: "CAT_ADJECTIVES", difficulty: "hard", words: { fa: "تند و تیز مثل فلفل قرمز", en: "Hot as a red chili pepper", nl: "Zo heet als een chilipeper", de: "Scharf wie eine Chilischote", fr: "Piquant comme un piment rouge", ar: "حار مثل الفلفل الأحمر", tr: "Kırmızı biber gibi acı", pl: "Ostry jak papryczka chili", uk: "Пекучий як червоний перець" } },
  { category: "CAT_ADJECTIVES", difficulty: "hard", words: { fa: "آرام مثل دریای بی‌موج", en: "Calm as a glassy sea", nl: "Zo kalm als een spiegelgladde zee", de: "Ruhig wie eine glatte See", fr: "Calme comme une mer d'huile", ar: "هادئ كبحر بلا أمواج", tr: "Dalğasız deniz gibi sakin", pl: "Spokojny jak tafla morza", uk: "Спокійний як тихе море" } },
  { category: "CAT_ADJECTIVES", difficulty: "hard", words: { fa: "سخت مثل الماس تراش‌خورده", en: "Hard as a cut diamond", nl: "Zo hard als een diamant", de: "Hart wie ein Diamant", fr: "Dur comme du diamant", ar: "صلب كالألماس المصقول", tr: "Elmas kadar sert", pl: "Twardy jak diament", uk: "Твердий як діамант" } },

  // ==========================================
  // CAT_SCIENCE (علم و فضا) — NEW CREATIVE CATEGORY
  // ==========================================
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "کهکشان", en: "Galaxy", nl: "Melkwegstelsel", de: "Galaxie", fr: "Galaxie", ar: "مجرة", tr: "Galaksi", pl: "Galaktyka", uk: "Галактика" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "تلسکوپ", en: "Telescope", nl: "Telescoop", de: "Teleskop", fr: "Télescope", ar: "تلسكوب", tr: "Teleskop", pl: "Teleskop", uk: "Телескоп" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "آتشفشان", en: "Volcano", nl: "Vulkaan", de: "Vulkan", fr: "Volcan", ar: "بركان", tr: "Yanardağ", pl: "Wulkan", uk: "Вулкан" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "آهنربا", en: "Magnet", nl: "Magneet", de: "Magnet", fr: "Aimant", ar: "مغناطيس", tr: "Mıknatıs", pl: "Magnes", uk: "Магніт" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "میکروسکوپ", en: "Microscope", nl: "Microscoop", de: "Mikroskop", fr: "Microscope", ar: "مجهر", tr: "Mikroskop", pl: "Mikroskop", uk: "Мікроскоп" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "ستاره", en: "Star", nl: "Ster", de: "Stern", fr: "Étoile", ar: "نجمة", tr: "Yıldız", pl: "Gwiazda", uk: "Зірка" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "جاذبه", en: "Gravity", nl: "Zwaartekracht", de: "Schwerkraft", fr: "Gravité", ar: "جاذبية", tr: "Yerçekimi", pl: "Grawitacja", uk: "Гравітація" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "موشک", en: "Rocket", nl: "Raket", de: "Rakete", fr: "Fusée", ar: "صاروخ", tr: "Roket", pl: "Rakieta", uk: "Ракета" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "اکسیژن", en: "Oxygen", nl: "Zuurstof", de: "Sauerstoff", fr: "Oxygène", ar: "أكسجين", tr: "Oksijen", pl: "Tlen", uk: "Кисень" } },
  { category: "CAT_SCIENCE", difficulty: "easy", words: { fa: "رنگین‌کمان", en: "Rainbow", nl: "Regenboog", de: "Regenbogen", fr: "Arc-en-ciel", ar: "قوس قزح", tr: "Gökkuşağı", pl: "Tęcza", uk: "Веселка" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "سیاه‌چاله فضایی", en: "Black Hole", nl: "Zwart gat", de: "Schwarzes Loch", fr: "Trou noir", ar: "ثقب أسود", tr: "Kara delik", pl: "Czarna dziura", uk: "Чорна діра" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "خورشیدگرفتگی کامل", en: "Solar Eclipse", nl: "Zonsverduistering", de: "Sonnenfinsternis", fr: "Éclipse solaire", ar: "كسوف الشمس", tr: "Güneş tutulması", pl: "Zaćmienie słońca", uk: "Сонячне затемнення" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "ایستگاه فضایی", en: "Space Station", nl: "Ruimtestation", de: "Raumstation", fr: "Station spatiale", ar: "محطة فضائية", tr: "Uzay istasyonu", pl: "Stacja kosmiczna", uk: "Космічна станція" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "انرژی خورشیدی", en: "Solar Energy", nl: "Zonne-energie", de: "Solarenergie", fr: "Énergie solaire", ar: "طاقة شمسية", tr: "Güneş enerjisi", pl: "Energia słoneczna", uk: "Сонячна енергія" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "شفق قطبی", en: "Northern Lights", nl: "Noorderlicht", de: "Polarlicht", fr: "Aurore boréale", ar: "الشفق القطبي", tr: "Kuzey ışıkları", pl: "Zorza polarna", uk: "Північне сяйво" } },
  { category: "CAT_SCIENCE", difficulty: "medium", words: { fa: "منظومه شمسی", en: "Solar System", nl: "Zonnestelsel", de: "Sonnensystem", fr: "Système solaire", ar: "النظام الشمسي", tr: "Güneş sistemi", pl: "Układ Słoneczny", uk: "Сонячна система" } },
  { category: "CAT_SCIENCE", difficulty: "hard", words: { fa: "قدم گذاشتن فضانورد روی سطح ماه", en: "Astronaut walking on the Moon", nl: "Astronaut wandelt op de maan", de: "Astronaut geht auf dem Mond", fr: "Un astronaute marche sur la Lune", ar: "رائد فضاء يمشي على سطح القمر", tr: "Astronotun Ay yüzeyinde yürümesi", pl: "Astronauta spacerujący po Księżycu", uk: "Астронавт іде по поверхні Місяця" } },
  { category: "CAT_SCIENCE", difficulty: "hard", words: { fa: "آزمایش شیمی در آزمایشگاه مدرسه", en: "Chemistry experiment in school lab", nl: "Scheikundeproef in het schoollab", de: "Chemieexperiment im Schullabor", fr: "Expérience de chimie au laboratoire", ar: "تجربة كيميائية في مختبر المدرسة", tr: "Okul laboratuvarında kimya deneyi", pl: "Eksperyment chemiczny w laboratorium", uk: "Хімічний дослід у шкільній лабораторії" } },
  { category: "CAT_SCIENCE", difficulty: "hard", words: { fa: "پرتاب ماهواره به مدار زمین", en: "Launching a satellite into Earth orbit", nl: "Satelliet lanceren in een baan om de aarde", de: "Start eines Satelliten in die Erdumlaufbahn", fr: "Lancement d'un satellite en orbite", ar: "إطلاق قمر صناعي إلى مدار الأرض", tr: "Dünya yörüngesine uydu fırlatmak", pl: "Wystrzelenie satelity na orbitę Ziemi", uk: "Запуск супутника на орбіту Землі" } },

  // ==========================================
  // CAT_MYTHOLOGY (اسطوره و فانتزی) — NEW CREATIVE CATEGORY
  // ==========================================
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "اژدها", en: "Dragon", nl: "Draak", de: "Drache", fr: "Dragon", ar: "تنين", tr: "Ejderha", pl: "Smok", uk: "Дракон" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "سیمرغ", en: "Phoenix", nl: "Feniks", de: "Phönix", fr: "Phénix", ar: "عنقاء", tr: "Anka kuşu", pl: "Feniks", uk: "Фенікс" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "جادوگر", en: "Wizard", nl: "Tovenaar", de: "Zauberer", fr: "Sorcier", ar: "ساحر", tr: "Büyücü", pl: "Czarodziej", uk: "Чарівник" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "پری", en: "Fairy", nl: "Fee", de: "Fee", fr: "Fée", ar: "جنية", tr: "Peri", pl: "Wróżka", uk: "Фея" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "تک‌شاخ", en: "Unicorn", nl: "Eenhoorn", de: "Einhorn", fr: "Licorne", ar: "أحادي القرن", tr: "Tek boynuzlu at", pl: "Jednorożec", uk: "Єдиноріг" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "خون‌آشام", en: "Vampire", nl: "Vampier", de: "Vampir", fr: "Vampire", ar: "مصاص دماء", tr: "Vampir", pl: "Wampir", uk: "Вампір" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "غول", en: "Giant", nl: "Reus", de: "Riese", fr: "Géant", ar: "عملاق", tr: "Dev", pl: "Olbrzym", uk: "Велетень" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "دزددریایی", en: "Pirate", nl: "Piraat", de: "Pirat", fr: "Pirate", ar: "قرصان", tr: "Korsan", pl: "Pirat", uk: "Пірат" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "گنج", en: "Treasure", nl: "Schat", de: "Schatz", fr: "Trésor", ar: "كنز", tr: "Hazine", pl: "Skarb", uk: "Скарб" } },
  { category: "CAT_MYTHOLOGY", difficulty: "easy", words: { fa: "قلعه", en: "Castle", nl: "Kasteel", de: "Schloss", fr: "Château", ar: "قلعة", tr: "Kale", pl: "Zamek", uk: "Замок" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "قالیچه پرنده", en: "Magic Carpet", nl: "Vliegend tapijt", de: "Fliegender Teppich", fr: "Tapis volant", ar: "بساط الريح", tr: "Uçan halı", pl: "Latający dywan", uk: "Килим-літак" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "چراغ جادو", en: "Magic Lamp", nl: "Wonderlamp", de: "Wunderlampe", fr: "Lampe magique", ar: "المصباح السحري", tr: "Sihirli lamba", pl: "Magiczna lampa", uk: "Чарівна лампа" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "پری دریایی", en: "Mermaid", nl: "Zeemeermin", de: "Meerjungfrau", fr: "Sirène", ar: "حورية البحر", tr: "Deniz kızı", pl: "Syrena", uk: "Русалка" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "ماشین زمان", en: "Time Machine", nl: "Tijdmachine", de: "Zeitmaschine", fr: "Machine à remonter le temps", ar: "آلة الزمن", tr: "Zaman makinesi", pl: "Wehikuł czasu", uk: "Машина часу" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "نقشه گنج", en: "Treasure Map", nl: "Schatkaart", de: "Schatzkarte", fr: "Carte au trésor", ar: "خريطة الكنز", tr: "Hazine haritası", pl: "Mapa skarbów", uk: "Карта скарбів" } },
  { category: "CAT_MYTHOLOGY", difficulty: "medium", words: { fa: "رستم و سهراب", en: "Mythical Hero", nl: "Mythische held", de: "Mythischer Held", fr: "Héros mythique", ar: "بطل أسطوري", tr: "Efsanevi kahraman", pl: "Mityczny bohater", uk: "Міфічний герой" } },
  { category: "CAT_MYTHOLOGY", difficulty: "hard", words: { fa: "جنگ شوالیه با اژدهای آتشین", en: "Knight battling a fire-breathing dragon", nl: "Ridder vecht tegen vuurspuwende draak", de: "Ritter kämpft gegen feuerspeienden Drachen", fr: "Chevalier contre un dragon cracheur de feu", ar: "فارس يقاتل تنينًا ينفث النار", tr: "Şövalyenin ateş püskürten ejderhayla savaşı", pl: "Rycerz walczący z ziejącym ogniem smokiem", uk: "Лицар б'ється з вогнедишним драконом" } },
  { category: "CAT_MYTHOLOGY", difficulty: "hard", words: { fa: "پیدا کردن جزیره گنج گمشده", en: "Discovering a lost treasure island", nl: "Een verborgen schateiland ontdekken", de: "Eine verlorene Schatzinsel entdecken", fr: "Découvrir une île au trésor perdue", ar: "اكتشاف جزيرة الكنز المفقودة", tr: "Kayıp hazine adasını keşfetmek", pl: "Odkrycie zaginionej wyspy skarbów", uk: "Відкриття загубленого острова скарбів" } },
  { category: "CAT_MYTHOLOGY", difficulty: "hard", words: { fa: "سفر به آینده با ماشین زمان", en: "Traveling to the future by time machine", nl: "Naar de toekomst reizen met een tijdmachine", de: "Mit der Zeitmaschine in die Zukunft reisen", fr: "Voyager dans le futur en machine à temps", ar: "السفر إلى المستقبل بآلة الزمن", tr: "Zaman makinesiyle geleceğe yolculuk", pl: "Podróż w przyszłość wehikułem czasu", uk: "Подорож у майбутнє машиною часу" } },

  // ==========================================
  // CAT_CULTURE (فرهنگ و هنر) — NEW CREATIVE CATEGORY
  // ==========================================
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "پیانو", en: "Piano", nl: "Piano", de: "Klavier", fr: "Piano", ar: "بيانو", tr: "Piyano", pl: "Pianino", uk: "Піаніно" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "گیتار", en: "Guitar", nl: "Gitaar", de: "Gitarre", fr: "Guitare", ar: "غيتار", tr: "Gitar", pl: "Gitara", uk: "Гітара" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "ویولن", en: "Violin", nl: "Viool", de: "Geige", fr: "Violon", ar: "كمان", tr: "Keman", pl: "Skrzypce", uk: "Скрипка" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "نقاشی", en: "Painting", nl: "Schilderij", de: "Gemälde", fr: "Peinture", ar: "لوحة فنية", tr: "Tablo", pl: "Obraz", uk: "Картина" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "مجسمه", en: "Statue", nl: "Standbeeld", de: "Statue", fr: "Statue", ar: "تمثال", tr: "Heykel", pl: "Posąg", uk: "Статуя" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "تئاتر", en: "Theater", nl: "Theater", de: "Theater", fr: "Théâtre", ar: "مسرح", tr: "Tiyatro", pl: "Teatr", uk: "Театр" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "شعر", en: "Poetry", nl: "Poëzie", de: "Poesie", fr: "Poésie", ar: "شعر", tr: "Şiir", pl: "Poezja", uk: "Поезія" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "موزه", en: "Museum", nl: "Museum", de: "Museum", fr: "Musée", ar: "متحف", tr: "Müze", pl: "Muzeum", uk: "Музей" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "رقص", en: "Dance", nl: "Dans", de: "Tanz", fr: "Danse", ar: "رقص", tr: "Dans", pl: "Taniec", uk: "Танець" } },
  { category: "CAT_CULTURE", difficulty: "easy", words: { fa: "نوروز", en: "Spring Festival", nl: "Lentefeest", de: "Frühlingsfest", fr: "Fête du printemps", ar: "عيد الربيع", tr: "Bahar bayramı", pl: "Święto wiosny", uk: "Свято весни" } },
  { category: "CAT_CULTURE", difficulty: "medium", words: { fa: "فرش دستباف", en: "Handmade Carpet", nl: "Handgeknoopt tapijt", de: "Handgeknüpfter Teppich", fr: "Tapis fait main", ar: "سجادة يدوية", tr: "El dokuması halı", pl: "Ręcznie tkany dywan", uk: "Килим ручної роботи" } },
  { category: "CAT_CULTURE", difficulty: "medium", words: { fa: "خطاطی سنتی", en: "Calligraphy", nl: "Kalligrafie", de: "Kalligrafie", fr: "Calligraphie", ar: "فن الخط", tr: "Hat sanatı", pl: "Kaligrafia", uk: "Каліграфія" } },
  { category: "CAT_CULTURE", difficulty: "medium", words: { fa: "سفالگری با چرخ", en: "Pottery Wheel", nl: "Pottenbakkersschijf", de: "Töpferscheibe", fr: "Tour de potier", ar: "صناعة الفخار", tr: "Çömlekçi çarkı", pl: "Koło garncarskie", uk: "Гончарне коло" } },
  { category: "CAT_CULTURE", difficulty: "medium", words: { fa: "ارکستر سمفونیک", en: "Symphony Orchestra", nl: "Symfonieorkest", de: "Sinfonieorchester", fr: "Orchestre symphonique", ar: "أوركسترا سيمفونية", tr: "Senfoni orkestrası", pl: "Orkiestra symfoniczna", uk: "Симфонічний оркестр" } },
  { category: "CAT_CULTURE", difficulty: "medium", words: { fa: "جشنواره فیلم", en: "Film Festival", nl: "Filmfestival", de: "Filmfestival", fr: "Festival de cinéma", ar: "مهرجان سينمائي", tr: "Film festivali", pl: "Festiwal filmowy", uk: "Кінофестиваль" } },
  { category: "CAT_CULTURE", difficulty: "hard", words: { fa: "نقاشی لبخند مرموز مونالیزا", en: "The mysterious smile of Mona Lisa", nl: "De mysterieuze glimlach van de Mona Lisa", de: "Das geheimnisvolle Lächeln der Mona Lisa", fr: "Le sourire mystérieux de la Joconde", ar: "الابتسامة الغامضة للوحة الموناليزا", tr: "Mona Lisa'nın gizemli gülümsemesi", pl: "Tajemniczy uśmiech Mony Lisy", uk: "Загадкова усмішка Мони Лізи" } },
  { category: "CAT_CULTURE", difficulty: "hard", words: { fa: "شب یلدا با انار و هندوانه", en: "Winter solstice night with pomegranates", nl: "Winterzonnewende met granaatappels", de: "Wintersonnenwende mit Granatäpfeln", fr: "Nuit du solstice d'hiver aux grenades", ar: "ليلة الانقلاب الشتوي بالرمان والبطيخ", tr: "Nar ve karpuzlu en uzun kış gecesi", pl: "Noc przesilenia zimowego z granatami", uk: "Ніч зимового сонцестояння з гранатами" } },
  { category: "CAT_CULTURE", difficulty: "hard", words: { fa: "اجرای زنده موسیقی در میدان شهر", en: "Live street music in town square", nl: "Livemuziek op het stadsplein", de: "Straßenmusik auf dem Marktplatz", fr: "Musique de rue sur la grande place", ar: "عزف موسيقي حي في ساحة المدينة", tr: "Şehir meydanında canlı sokak müziği", pl: "Muzyka na żywo na rynku miasta", uk: "Жива вулична музика на площі" } },

  // ==========================================
  // EXTRA HARD WORDS FOR CAT_JOBS (was 0 hard words)
  // ==========================================
  { category: "CAT_JOBS", difficulty: "hard", words: { fa: "سرآشپز معروف رستوران پنج‌ستاره", en: "Famous chef of a five-star restaurant", nl: "Beroemde chef in een vijfsterrenrestaurant", de: "Berühmter Koch im Fünf-Sterne-Restaurant", fr: "Chef célèbre d'un restaurant cinq étoiles", ar: "طاهٍ شهير في مطعم خمس نجوم", tr: "Beş yıldızlı restoranın ünlü şefi", pl: "Słynny szef kuchni restauracji pięciogwiazdkowej", uk: "Відомий шеф-кухар п'ятизіркового ресторану" } },
  { category: "CAT_JOBS", difficulty: "hard", words: { fa: "کارآگاه باهوش در حال حل معما", en: "Clever detective solving a mystery", nl: "Slimme detective lost een mysterie op", de: "Kluger Detektiv löst ein Rätsel", fr: "Détective malin résolvant une énigme", ar: "محقق ذكي يحل لغزًا غامضًا", tr: "Gizemi çözen zeki dedektif", pl: "Sprytny detektyw rozwiązujący zagadkę", uk: "Розумний детектив розгадує таємницю" } },
  { category: "CAT_JOBS", difficulty: "hard", words: { fa: "باستان‌شناس در حال کشف شهر باستانی", en: "Archaeologist uncovering an ancient city", nl: "Archeoloog ontdekt een oude stad", de: "Archäologe entdeckt eine antike Stadt", fr: "Archéologue découvrant une cité antique", ar: "عالم آثار يكتشف مدينة قديمة", tr: "Antik kenti keşfeden arkeolog", pl: "Archeolog odkrywający starożytne miasto", uk: "Археолог відкриває стародавнє місто" } }
];
