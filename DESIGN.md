# DashHAN tasarım kuralları

Referans: karanlık petrol yeşili çalışma alanı, altın çekirdek, turkuaz ve mor bağlantı düğümleri. Ana yüzey bağlantı haritasıdır; kart grid ile değiştirme.

- Renk ve ölçüler: app/globals.css. Bölüm renkleri: lib/dashhan.ts.
- Harita çizimi ve perspektif: components/dashboard/network-graph.tsx.
- Arayüz, formlar ve Gemini cevapları: components/dashboard/dashboard.tsx.
- İşlevleri koruyarak yalnız bu dosyalardaki görünümü düzenle.
- Masaüstü: ince sol ikon menüsü, geniş harita, sağ odak paneli, solda sabit sohbet alanı.
- Mobil: tam genişlik harita, altında odak ve komut alanı, sabit alt bölüm menüsü.
- Başlıklar sakin, kısa; glow yalnız bağlantılarda ve düğümlerde.
- Harita düğümlerinin kayıt sayısı gerçek kayıtlarla eşleşmeli.
- Kontroller klavye ile kullanılmalı, reduced-motion tercihi korunmalı. Fare tekerleği imleç konumuna göre yakınlaştırıp uzaklaştırır; orta tuşla sürükleme haritayı taşır.
- API anahtarını client component, public dizini veya NEXT_PUBLIC değişkeni içine koyma.
- Görsel düzenleme kod üzerinden yapılır; bu sürüm sürükle-bırak sayfa editörü içermez.
