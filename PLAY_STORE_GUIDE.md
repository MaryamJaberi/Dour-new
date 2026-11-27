# راهنمای گام‌به‌گام انتشار بازی «دور (Dour / Turn)» در Google Play Store

این پروژه با **Capacitor Android** بسته‌بندی شده است و به صورت **۱۰۰٪ آفلاین** (به همراه همگام‌سازی اختیاری Firebase) اجرا می‌شود.

---

## بخش ۱: چطور فایل اندروید (`.aab` و `.apk`) را از گیت برداری؟

### روش الف — ساخت خودکار در GitHub Actions (ساده‌ترین روش، بدون نیاز به Android Studio!)
1. اول شاخهٔ `feature/database-i18n-overhaul` را به `main` مرج کن (از طریق Pull Request در گیت‌هاب).
2. یک بار روی کامپیوتر خودت کلید امضای انتشار (`release.keystore`) بساز (این فایل **هرگز** نباید وارد گیت شود؛ یک جای امن مثل Google Drive شخصی نگهش دار!):
   ```bash
   keytool -genkey -v -keystore release.keystore -alias dour-release -keyalg RSA -keysize 2048 -validity 10000
   ```
   از تو یک رمز (`KEYSTORE_PASSWORD`) و نام و کشور می‌پرسد. رمزها را یادداشت کن.
3. فایل `release.keystore` را به Base64 تبدیل کن (در PowerShell):
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Set-Clipboard
   ```
4. در گیت‌هاب برو به **Settings → Secrets and variables → Actions → New repository secret** و این ۴ سکرت را اضافه کن:
   - `ANDROID_KEYSTORE_BASE64`: متن کپی‌شده از مرحله قبل
   - `ANDROID_KEYSTORE_PASSWORD`: رمز keystore
   - `ANDROID_KEY_ALIAS`: `dour-release`
   - `ANDROID_KEY_PASSWORD`: رمز کلید (معمولاً همان رمز keystore)
5. حالا در گیت‌هاب برو به تب **Actions → Build Android Release (AAB & APK) → Run workflow**.
6. بعد از حدود ۲–۳ دقیقه، پایین صفحه در بخش **Artifacts** دو فایل آمادهٔ دانلود می‌بینی:
   - **`dour-playstore-aab`**: فایل **`app-release.aab`** امضاشده و آمادهٔ آپلود مستقیم در Google Play Console!
   - **`dour-test-apk`**: فایل **`app-debug.apk`** برای نصب و تست مستقیم روی گوشی اندرویدی خودت.

### روش ب — ساخت روی کامپیوتر شخصی با Android Studio
```bash
git pull origin main
npm install
npm run android:sync
npm run android:open
```
در Android Studio از منوی **Build → Generate Signed App Bundle / APK → Android App Bundle (`.aab`)** فایل را با همان `release.keystore` بساز.

---

## بخش ۲: در Google Play Console به ترتیب چه کارهایی بکنی و چه چیزهایی بنویسی؟

وارد **[play.google.com/console](https://play.google.com/console)** شو و روی **Create app** کلیک کن:

### گام ۱ — ساخت اپلیکیشن (Create App)
- **App name (نام برنامه)**: `دور - Dour | بازی کلمات گروهی` (یا به انگلیسی: `Dour - Turn Party Word Game`)
- **Default language (زبان پیش‌فرض)**: `Persian (fa)` یا `English (en-US)` (بعداً می‌توانی هر دو زبان را در Store Listing اضافه کنی)
- **App or game**: **`Game`**
- **Free or paid**: **`Free`**
- تیک‌های Declarations (Developer Program Policies & US export laws) را بزن و **Create app** را بزن.

---

### گام ۲ — تکمیل بخش App Content (محتوای برنامه — اجباری)
از منوی سمت چپ برو به **Policy and programmes → App content** و همهٔ موارد زیر را تکمیل کن:

1. **Privacy Policy (سیاست حفظ حریم خصوصی)**:
   - لینک زیر را وارد کن (بعد از مرج به `main` خودکار روی سایتت منتشر می‌شود):
     `https://maryamjaberi.github.io/Dour/privacy-policy.html`

2. **App access (دسترسی به برنامه)**:
   - گزینهٔ **`All functionality in my app is available without any access restrictions`** را انتخاب کن (چون ورود با گوگل کاملاً اختیاری است و بازی بدون لاگین اجرا می‌شود).

3. **Ads (تبلیغات)**:
   - **`No, my app does not contain ads`**

4. **Content rating (رده‌بندی سنی - IARC)**:
   - ایمیل خودت را وارد کن → دسته: **`Game`** → به همهٔ سوالات خشونت، قمار، الفاظ رکیک و محتوای بزرگسال پاسخ **`No`** بده → نتیجه معمولاً **PEGI 3 / Everyone (E)** می‌شود → **Save & Submit**.

5. **Target audience (مخاطبان هدف)**:
   - پیشنهاد: **`13-15`، `16-17`، `18 and over`** (اگر زیر ۱۳ سال را انتخاب نکنی، فرآیند بررسی گوگل خیلی سریع‌تر و ساده‌تر است).
   - سوال *"Could your store listing unintentionally appeal to children?"* → **`No`** (بازی دورهمی دوستانه و خانوادگی).

6. **News apps / COVID-19 / Financial features / Government apps**:
   - برای همه **`No`** انتخاب کن.

7. **Data safety (ایمنی داده‌ها)**:
   - *"Does your app collect or share any of the required user data types?"* → **`Yes`** (به خاطر ورود اختیاری با گوگل در Firebase)
   - *"Is all of the user data collected by your app encrypted in transit?"* → **`Yes`** (Firebase از HTTPS/TLS استفاده می‌کند)
   - *"Do you provide a way for users to request that their data is deleted?"* → **`Yes`** (لینک حذف: `https://maryamjaberi.github.io/Dour/privacy-policy.html`)
   - در لیست انواع داده فقط این ۲ مورد را تیک بزن:
     - **Personal info → Name** (Collected, Optional, Purpose: App functionality / Account management)
     - **Personal info → Email address** (Collected, Optional, Purpose: App functionality / Account management)
   - برای **Shared with third parties** → **`No`** (هیچ داده‌ای به شخص ثالث فروخته یا اشتراک‌گذاری نمی‌شود).

---

### گام ۳ — تکمیل صفحهٔ فروشگاه (Main store listing)
از منوی سمت چپ برو به **Grow → Store presence → Main store listing**:

- **App name**:
  `دور - Dour | بازی گروهی کلمات`
- **Short description (توضیح کوتاه — حداکثر ۸۰ کاراکتر)**:
  - فارسی: `بازی دورهمی سریع و پرهیجان حدس کلمات با یک گوشی! ۹ زبان، آفلاین و بدون تبلیغ`
  - انگلیسی: `Fast-paced party word guessing game on one phone! 9 languages, offline & ad-free`
- **Full description (توضیح کامل)**:
  - **فارسی**:
    ```text
    «دور (Dour / Turn)» یک بازی گروهی، دورهمی و پرانرژی حدس کلمات است که فقط با یک گوشی موبایل انجام می‌شود!

    ✨ ویژگی‌های کلیدی:
    • بازی تیمی ۴، ۶ یا ۸ نفره (یارها روبه‌روی هم در دایره می‌نشینند)
    • پشتیبانی کامل از ۹ زبان زنده دنیا: فارسی، انگلیسی، هلندی، آلمانی، فرانسوی، عربی، ترکی، لهستانی و اوکراینی
    • ۳ سطح سختی هوشمند: آسان (تک‌کلمه‌ای)، متوسط (ترکیبی)، سخت (ضرب‌المثل‌ها و عبارات) + حالت ترکیبی
    • ۱۴ دسته‌بندی متنوع شامل علم و فضا، اسطوره و فانتزی، فرهنگ و هنر، خوراکی‌ها، حیوانات، تکنولوژی و...
    • امکان ساخت بسته کلمه اختصاصی و اشتراک‌گذاری کد آن با دوستان
    • چالش روزانه (Daily Challenge)، جدول برترین‌ها و ۱۰ دستاورد جذاب
    • ۱۰۰٪ آفلاین، بدون تبلیغات و با افکت‌های صوتی زنده
    ```
  - **انگلیسی**:
    ```text
    Dour (Turn) is a high-energy, pass-the-phone party word guessing game for 4, 6, or 8 players!

    ✨ Highlights:
    • Sit in a circle with teammates opposite each other and race the clock clockwise
    • Full 9-language support: English, Persian, Dutch, German, French, Arabic, Turkish, Polish & Ukrainian
    • 3 Smart Difficulty Levels: Easy single words, Medium compound phrases, Hard idioms & proverbs, plus Mixed mode
    • 14 rich categories including Science & Space, Mythology & Fantasy, Culture & Arts, Tech, Food, and more
    • Create & share Custom Word Packs with friends via offline share codes
    • Daily Challenge with streaks, Party Leaderboard, and 10 unlockable Achievements
    • 100% offline-ready and completely ad-free
    ```
- **App category**: `Games` → `Word` (یا `Party`)
- **Tags**: `Word`, `Party`, `Multiplayer`, `Offline`, `Casual`
- **Graphics (تصاویر مورد نیاز)**:
  - **App icon (`512×512 PNG`)**: فایل `public/icon-512.png`
  - **Feature graphic (`1024×500 PNG`)**: یک بنر `1024×500` با عنوان «دور - Dour» (می‌توانی در Canva یا از فایل `playstore-assets` بسازی)
  - **Phone screenshots**: حداقل ۲ اسکرین‌شات عمودی از گوشی (صفحه اول، انتخاب دسته‌بندی، صفحه بازی و صفحه برنده)

---

### گام ۴ — آپلود فایل `.aab` و انتشار (Testing → Production)
1. اگر حساب توسعه‌دهندهٔ شخصی جدید (بعد از نوامبر ۲۰۲۳) داری، گوگل‌پلی قبل از انتشار عمومی (Production) یک **Closed Testing با حداقل ۱۲ تستر به مدت ۱۴ روز** می‌خواهد.
2. برو به **Test and release → Testing → Closed testing** (یا اگر حسابت قدیمی/سازمانی است مستقیم **Production**):
   - روی **Create new release** کلیک کن.
   - فایل **`app-release.aab`** را که از GitHub Actions دانلود کردی آپلود کن.
   - **Release name**: `1.0.0`
   - **Release notes**:
     - فارسی: `انتشار نسخه اول بازی گروهی دور با پشتیبانی ۹ زبان، ۱۴ دسته‌بندی، بسته‌های کلمه اختصاصی، چالش روزانه و دستاوردها.`
     - انگلیسی: `Initial release of Dour (Turn) with 9 languages, 14 categories, custom word packs, daily challenges, and achievements.`
   - روی **Next → Save → Go to Publishing overview → Send changes for review** کلیک کن.
3. پس از تأیید گوگل (معمولاً ۱ تا ۳ روز کاری، و در Closed Testing پس از ۱۴ روز تست)، دکمهٔ **Apply for production** فعال می‌شود و بازی رسماً در Google Play Store منتشر می‌گردد!
