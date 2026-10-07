# DashHAN

Kişisel Gemini kontrol merkezi: perspektifli bağlantı haritası, görevler, projeler, ajanda, notlar, dosyalar, finans ve hızlı linkler.

## Çalıştırma

Mevcut pnpm kilidini koruyun. Gerekli sunucu değişkenleri `GEMINI_API_KEY` ve `GEMINI_MODEL`dir. Yerel çalışma için `.dev.vars` oluşturun; gerçek değerleri Git'e eklemeyin. Örnek değişken adları `.env.example` içindedir.

Bu Site owner-private platform erişimi ile korunur. Kayıtlar tek kişisel çalışma alanına aittir. Erişim modelini herkese açık hale getirmeden önce sunucu tarafında kullanıcı sahipliği ve yetkilendirme ekleyin.

Kayıtlar D1, yüklenen dosyalar R2 üzerinde saklanır. Şema değişikliklerinden sonra `pnpm db:generate` ile migration üretin. Yerel preview için README'deki starter talimatı yerine `dist/server/wrangler.json` üzerinden migrations uygulayın. Yayında migrations platform tarafından uygulanır.

`pnpm build` dağıtılabilir Worker oluşturur. `pnpm exec tsc --noEmit` TypeScript kontrolünü çalıştırır.

## Gemini

Sunucu, bu anahtarla erişilebilen modelleri sorgular. Yapılandırılan modeli destekleniyorsa seçer; yoksa `gemini-flash-latest` veya erişilebilen Flash modellerinden birini kullanır. Yapılandırılmış cevap ilgili düğümü açar. Yeni kayıt önerileri önce taslak olarak gösterilir; kaydetme kullanıcı tarafından onaylanır. Gemini'ye çalışma alanındaki kayıtlar ve mevcut sohbetin son mesajları gönderilir; dosya içeriği gönderilmez. Bu sürümde canlı web araması ve tarayıcılar arasında sohbet geçmişi kaydı yoktur.

## Tasarım

Manuel düzenleme için DESIGN.md dosyasını kullanın. Canvas haritası perspektif, pan ve Shift+sürükle ile döndürme sunar; ayrıca yakınlaştırma, sıfırlama ve animasyonu durdurma kontrolleri vardır. API anahtarı tarayıcıya gönderilmez.
