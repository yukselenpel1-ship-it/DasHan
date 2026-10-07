# DashHAN — Vercel

Kişisel Gemini kontrol merkezi. Mevcut Exo 2 tasarımı, logo, harita etkileşimleri, sohbet, arama ve pencere animasyonları korunur.

## Vercel kurulumu

1. `yukselenpel1-ship-it/DasHan` deposunun `main` dalını Vercel'e bağla. Framework **Next.js**, Root Directory boş, Node.js **22.x**, Build Command `pnpm build`. Eski Vinext/Vite build ve output ayarlarını kaldır; Output Directory varsayılan kalsın.
2. Vercel Marketplace üzerinden bu projeye bir **Neon PostgreSQL** veritabanı bağla. Entegrasyon `DATABASE_URL` değişkenini ekler. Bu sürüm dosya sistemi veya geçici SQLite veritabanı kullanmaz.
3. Bu projeye **Private** erişimli bir Vercel Blob deposu bağla. Vercel `BLOB_STORE_ID`/OIDC veya `BLOB_READ_WRITE_TOKEN` sağlar. Public depo seçme.
4. Vercel Environment Variables'a `BETTER_AUTH_SECRET`, `DASHHAN_SETUP_CODE`, `DASHHAN_OWNER_EMAIL`, `GEMINI_API_KEY` ve `GEMINI_MODEL` ekle. Production için `BETTER_AUTH_URL` değerini sitenin gerçek HTTPS adresi yap. Preview ortamında bu değişkeni boş bırak; adres istekten belirlenir. Anahtarları GitHub'a ekleme.
5. İki **farklı** rastgele değer oluşturmak için aşağıdaki komutu kendi terminalinde iki kez çalıştır. Birini `BETTER_AUTH_SECRET`, diğerini `DASHHAN_SETUP_CODE` olarak kaydet. Değerleri sohbetlere veya GitHub'a yapıştırma.

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

6. Redeploy yap. Build komutu veritabanı ve Better Auth tablolarını hazırlar; eşzamanlı dağıtımlar PostgreSQL advisory lock ile sıraya girer. Bağlantı hatası varsa build durur. Veritabanı henüz bağlı değilse derleme tamamlanabilir, fakat site kapalı bir hazırlık ekranı gösterir; hiçbir veri/API açılmaz.
7. Sitedeki **Kayıt ol** sekmesinde `DASHHAN_OWNER_EMAIL` ile belirlediğin e-postayı, en az 12 karakterli bir şifreyi ve kurulum kodunu gir. İlk hesaptan sonra kurulum kodunu Environment Variables'tan kaldırıp yeniden dağıtabilirsin; mevcut hesabınla giriş devam eder.

Girişler Better Auth ile yönetilir. Parolalar kütüphanenin şifreleme algoritmasıyla hashlenir; oturumlar HttpOnly çerezlerde, hız limitleri PostgreSQL'de tutulur. Çalışma alanı yalnızca izin verilen e-postaya açıktır. Tüm kayıt, dosya, Gemini ve özel not API'leri oturumu sunucuda doğrular; eski ChatGPT kimlik başlıkları kabul edilmez.

## Yerel çalıştırma

```bash
pnpm install --frozen-lockfile
# .env.example dosyasını .env.local olarak kopyala ve kendi bağlantılarını ekle.
pnpm db:migrate
pnpm dev
```

`pnpm build` Next.js üretim çıktısını, `pnpm start` yerel üretim sunucusunu oluşturur. `pnpm test`, geçici PostgreSQL/PGlite ile gerçek Next.js HTTP uçlarını kontrol eder; canlı veritabanına veya dosya deposuna dokunmaz.

## Dosyalar ve özel notlar

Dosyalar tarayıcıdan doğrudan **özel** Blob deposuna yüklenir. Sunucu yükleme yetkisini, kullanıcıya ait dosya yolunu ve 10 MB boyut sınırını kontrol eder; tamamlanan dosyanın metadata kaydı ayrıca doğrulanır. İndirmeler oturum kontrolünden sonra sunucu üzerinden aktarılır. Gemini dosya içeriğini almaz.

Özel notların PBKDF2/AES-GCM şifrelemesi korunur. Özel alan şifresi sunucuya gönderilmez. Notlar kullanıcıya bağlıdır ve revision kontrolü başka penceredeki değişikliklerin ezilmesini önler.

## Mevcut veriler

Cloudflare/Sites sürümü kendi veritabanında çalışmaya devam eder. Bu uyarlama kodu taşır; eski D1 kayıtlarını, R2 dosyalarını veya özel notları otomatik olarak yeni depolara kopyalamaz. Veri aktarımı tamamlanmadan eski yayını kaldırma. Yeni PostgreSQL veritabanı ilk açıldığında boş olacaktır. Şifreli özel notları aktarırken yeni hesap kimliğiyle eşlemek gerekir; şifreleme içeriğini çözmek gerekmez.
