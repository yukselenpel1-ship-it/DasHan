# DashHAN tasarım kuralları

Referans: LINEAR-DESIGN.md. Linear’ın siyaha yakın tuvali (#010102), dört kademeli gri yüzeyleri, lavanta vurgusu (#5e6ad2) ve Inter tipografisi. DashHAN’a özgü yarı saydam cam paneller ve hafif 3D hareketler bu sisteme eklenir. Ana yüzey bağlantı haritasıdır; kart grid ile değiştirme.

- Temel ölçüler ve responsive düzen: app/globals.css. Tasarım tokenları ve cam yüzeyler: app/linear-glass.css (layout tarafından en son yüklenir). Bölüm renkleri: lib/dashhan.ts.
- LINEAR-DESIGN.md yüklenen kaynağın değiştirilmemiş kopyasıdır. Özgün markamız ve yüklenen D logosu korunur; Linear logosu veya özel fontu kullanılmaz.
- Cam yüzeyler blur(24px), 12px köşeler, ince kenarlık ve hafif üst kenar aydınlığı kullanır. Form alanları ve CTA’lar 8px köşelidir.
- 3D harita salınımı ve panel girişleri hafif olmalıdır. Hareket ayarı kapatıldığında harita salınımı ve panel girişleri durur; sistem reduced-motion tercihi bütün dekoratif hareketleri kapatır.
- Harita çizimi ve perspektif: components/dashboard/network-graph.tsx.
- Arayüz, formlar ve Gemini cevapları: components/dashboard/dashboard.tsx.
- İşlevleri koruyarak yalnız bu dosyalardaki görünümü düzenle.
- Masaüstü: ince sol ikon menüsü, geniş harita, sağ odak paneli, solda sabit sohbet alanı.
- Mobil: tam genişlik harita, altında odak ve komut alanı, sabit alt bölüm menüsü.
- Başlıklar sakin, kısa; ışık lavanta tonlarında ve ölçülü. Yeşil yalnız güncel bağlantı durumu, kırmızı yalnız hata ve silme uyarıları içindir.
- Harita düğümlerinin kayıt sayısı gerçek kayıtlarla eşleşmeli.
- Kontroller klavye ile kullanılmalı, reduced-motion tercihi korunmalı. Fare tekerleği imleç konumuna göre yakınlaştırıp uzaklaştırır; orta tuşla sürükleme haritayı taşır.
- API anahtarını client component, public dizini veya NEXT_PUBLIC değişkeni içine koyma.
- Görsel düzenleme kod üzerinden yapılır; bu sürüm sürükle-bırak sayfa editörü içermez.
