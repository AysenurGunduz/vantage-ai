<!-- Logo eklenince: <p align="center"><img src="./docs/logo.png" width="120" alt="Vantage logo" /></p> -->

# Vantage

**Yapay Zeka Destekli Proje Yönetim Platformu**

Vantage, ekiplerin proje ve görev süreçlerini planlayıp Kanban panosu üzerinden takip edebildiği; buna ek olarak yapay zeka desteğiyle proje açıklamasından otomatik görev üretimi, öncelik/gecikme riski analizi, ekip üyesi çalışma tarzı analizi ve otomatik ilerleme özetleri sunan modüler bir web platformudur.

> Bu proje bir yazılım stajı kapsamında, 20 iş günü boyunca aşamalı olarak geliştirilmektedir. Danışman: Ümit Bey.
> Detaylı teknik plan ve 20 günlük takvim için: [implementation_plan.md](./implementation_plan.md)

---

## Özellikler

**Çekirdek proje yönetimi**
- Organizasyon / proje / görev hiyerarşisi, rol tabanlı ekip üyeliği
- Kanban panosu üzerinde sürükle-bırak ile durum takibi (canlı senkronizasyon)
- Görevlere atama, öncelik, deadline, etiket
- Proje dashboard'u: durum istatistikleri, geciken görev takibi

**Yapay zeka katmanı**
- **Otomatik görev bölme:** Doğal dilde yazılan proje/özellik açıklaması, önerilen görev listesine dönüştürülür (inceleyip düzenleyerek onaylanır)
- **Önceliklendirme & gecikme riski:** Kural tabanlı risk skoru + LLM tarafından üretilen doğal dil açıklaması
- **Çalışma tarzı analizi:** Ekip üyelerinin görev geçmişine dayalı kişiye özel profil çıkarımı, atama önerilerinde kullanılır
- **Otomatik ilerleme özetleri:** Belirli aralıklarla proje durumunun özetlenmesi

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React, TypeScript, Vite, TailwindCSS, shadcn/ui, dnd-kit, Recharts |
| Backend | Node.js, Express, TypeScript |
| Veritabanı / Auth / Realtime | Supabase (Postgres) |
| Yapay zeka | Local LLM ([Ollama](https://ollama.com)) — sağlayıcıdan bağımsız `AIProvider` soyutlaması ile |

## Proje Yapısı

```
vantage/
├── frontend/     # React + Vite istemci uygulaması
├── backend/      # Express API + AI orkestrasyonu
├── docs/         # Mimari kararlar ve ek dokümantasyon
└── implementation_plan.md
```

## Kurulum

> Bu bölüm, kod iskeleti oluşturuldukça (Gün 2'den itibaren) doldurulacaktır.

## Geliştirme Durumu

Proje aktif geliştirme aşamasındadır. Güncel ilerleme ve gün gün plan için [implementation_plan.md](./implementation_plan.md) dosyasına bakınız.

## Lisans

Bu depo [LICENSE](./LICENSE) dosyasında belirtilen lisans altındadır.
