# Vantage — Implementation Plan

> Yapay Zeka Destekli Proje Yönetim Platformu
> Staj süresi: 20 iş günü (4 hafta) · Danışman: Ümit Bey

Bu doküman, Vantage projesinin mimari kararlarını, teknik altyapısını ve 20 günlük geliştirme takvimini içerir. Yaşayan bir dokümandır — proje ilerledikçe güncellenecektir. Değişiklik geçmişi için Git history yeterlidir, bu dosya her zaman güncel durumu yansıtır.

---

## 1. Proje Özeti

Vantage; ekiplerin proje/görev yönetimi yapabildiği (Kanban, deadline, atama) **ve** yapay zeka desteğiyle proje açıklamasından otomatik görev üretimi, öncelik/gecikme riski analizi, ekip üyesi çalışma tarzı analizi ve otomatik ilerleme özetleri sunan modüler bir web platformudur.

**Tasarım ilkesi:** Tek senaryoya kilitli bir uygulama değil; PM çekirdeği ile AI katmanı birbirinden ayrık, AI sağlayıcısı değiştirilebilir (bugün local LLM, yarın istenirse cloud API) şekilde tasarlanacak.

---

## 2. Mimari Kararlar (ADR özeti)

| # | Karar | Gerekçe |
|---|-------|---------|
| 1 | **Frontend:** React + TypeScript + Vite | Hızlı DX, geniş ekosistem, staj sonunda taşınabilir bilgi |
| 2 | **UI katmanı:** TailwindCSS + shadcn/ui + dnd-kit (Kanban) + Recharts (grafikler) | Hızlı, tutarlı, erişilebilir bileşenler; dnd-kit sürükle-bırak için endüstri standardı |
| 3 | **Backend:** Node.js + Express + TypeScript (ayrı servis) | Supabase'in üzerine iş kuralları + AI orkestrasyonu için tam kontrol sağlayan ayrı katman (kullanıcı kararı) |
| 4 | **Veritabanı / Auth / Storage / Realtime:** Supabase (Postgres) | Auth, RLS, realtime subscriptions hazır; Kanban canlı senkron için realtime kritik |
| 5 | **AI çalıştırma:** **Local LLM (Ollama)** | Kullanıcı kararı — maliyetsiz, veri gizliliği, staj boyunca sınırsız deneme. Aşağıda detaylı. |
| 6 | **Repo yapısı:** Monorepo (`/frontend`, `/backend`, `/docs`) | Tek repo üzerinden PR akışı, staj takibi için sade |
| 7 | **AI soyutlama:** `AIProvider` interface (backend `src/ai/`) | Local model → ileride cloud API'ye geçiş tek dosya değişikliği ile mümkün olsun |

---

## 3. Local LLM Stratejisi

**Tespit edilen donanım:** NVIDIA RTX 3050 Laptop GPU (4GB VRAM), 16GB sistem RAM.

Bu VRAM bütçesiyle 7B+ modeller GPU'ya tam sığmayabilir (kısmi CPU offload gerekir → yavaşlar). Bu yüzden **fazlara göre farklı model** stratejisi öneriyorum:

| Faz | Kullanım | Önerilen model | Neden |
|-----|----------|----------------|-------|
| Runtime | Tüm fazlar | **Ollama** (Windows native, OpenAI-uyumlu `localhost:11434` API, `format: json` desteği) | Kurulumu en basit, model değişimi `ollama pull` kadar kolay |
| Faz 2 — Görev bölme, önceliklendirme (interaktif, hızlı yanıt gerekir) | `qwen2.5:3b-instruct-q4_K_M` (alternatif: `llama3.2:3b`) | ~2GB, VRAM'e tam sığar, JSON üretiminde tutarlı, hızlı |
| Faz 3 — Karakter analizi, ilerleme özeti (arka planda/zamanlanmış, gecikme tolere edilir) | `qwen2.5:7b-instruct-q4_K_M` (VRAM yetmezse fallback: aynı 3B model) | Daha nüanslı metin üretimi; gerçek zamanlı olmadığı için CPU offload kabul edilebilir |

**Gün 11'de** her iki model gerçek promptlarla (JSON şema uyumu, yanıt süresi, Türkçe kalite) benchmark edilip karar kesinleştirilecek. Model seçimi `.env` üzerinden konfigüre edilecek, kod değişikliği gerektirmeyecek.

**Kritik tasarım notu:** Gecikme riski tahmini gibi sayısal/istatistiksel işler LLM'e bırakılmayacak — bunun için basit kural tabanlı bir skor motoru (deadline yakınlığı, ilerleme yüzdesi, geçmiş hız) yazılacak; LLM sadece bu skoru **doğal dilde açıklamak** için kullanılacak. Saf LLM ile sayısal tahmin güvenilmez.

---

## 4. Veritabanı Şeması (taslak)

```
profiles                 (id, full_name, avatar_url, title, created_at)
organizations            (id, name, slug, owner_id, created_at)
organization_members     (org_id, user_id, role, joined_at)
projects                 (id, org_id, name, description, status, start_date, end_date, created_by)
project_members          (project_id, user_id, role_in_project)
tasks                    (id, project_id, title, description, status, priority,
                           assignee_id, estimated_hours, due_date, order_index,
                           parent_task_id, ai_generated, created_by, created_at, updated_at)
task_comments             (id, task_id, user_id, content, created_at)
task_activity_log         (id, task_id, user_id, action_type, from_value, to_value, created_at)
ai_task_suggestions       (id, project_id, source_description, suggested_tasks jsonb, status, created_by)
work_style_profiles       (id, user_id, traits jsonb, summary, model_used, generated_at)
progress_summaries        (id, project_id, period_start, period_end, summary, model_used, generated_at)
delay_risk_scores         (id, task_id, risk_score, risk_level, explanation, computed_at)
```

`task_activity_log`, hem audit trail hem de AI risk/hız analizinin veri kaynağı olacak — bu yüzden Faz 1'den itibaren tutulmaya başlanacak.

---

## 5. Klasör Yapısı

```
vantage/
├── frontend/                 # React + Vite + TS
│   └── src/
│       ├── pages/
│       ├── components/{kanban,dashboard,ai,ui}/
│       ├── hooks/
│       ├── lib/               # supabaseClient.ts, apiClient.ts
│       ├── store/
│       └── types/
├── backend/                  # Node + Express + TS
│   └── src/
│       ├── routes/ controllers/ services/
│       ├── ai/
│       │   ├── provider.interface.ts
│       │   ├── ollamaClient.ts
│       │   └── prompts/
│       ├── jobs/               # cron: progress summary üretimi
│       ├── middleware/         # auth.ts (Supabase JWT doğrulama)
│       └── db/
├── docs/
│   └── adr/                    # önemli kararlar (gerektikçe)
├── .github/workflows/          # CI (ileride)
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## 6. 20 Günlük Takvim

### Hafta 1 — Temel Altyapı (Gün 1-5)
| Gün | Hedef |
|-----|-------|
| 1 | Implementation plan + README ✅, Supabase projesi kurulumu, ERD netleştirme, repo iskeleti |
| 2 | Backend iskeleti (Express+TS, health-check), Frontend iskeleti (Vite+React+TS+Tailwind), Supabase client bağlantısı |
| 3 | Auth akışı uçtan uca (kayıt/giriş/çıkış), korumalı route'lar, Organization/Project oluşturma |
| 4 | Task modeli + CRUD API + liste görünümü (henüz drag-drop yok) |
| 5 | Kanban board (dnd-kit) + backend'e durum güncelleme, **Hafta 1 demo** |

### Hafta 2 — Çekirdek PM Özelliklerinin Tamamlanması (Gün 6-10)
| Gün | Hedef |
|-----|-------|
| 6 | Ekip üyesi davet + rol yönetimi (Admin/Member) |
| 7 | Deadline, öncelik, etiketler; filtreleme/sıralama |
| 8 | Dashboard: görev istatistikleri, grafikler (Recharts), geciken görev vurgusu |
| 9 | Supabase Realtime ile canlı Kanban senkronu, task activity log |
| 10 | Test geçişi, bug fix, **MVP demo & checkpoint** — AI fazına geçiş onayı |

### Hafta 3 — AI Katmanı: Local LLM Entegrasyonu (Gün 11-15)
| Gün | Hedef |
|-----|-------|
| 11 | Ollama kurulumu, aday modellerin benchmark'ı, `AIProvider` soyutlama katmanı, model kararının kesinleşmesi |
| 12 | AI Görev Bölme: prompt tasarımı, endpoint, öner→incele→düzenle→onayla UX akışı |
| 13 | Kural tabanlı gecikme riski skoru + LLM ile doğal dil açıklaması, dashboard'a entegrasyon |
| 14 | Prompt iyileştirme, JSON şema doğrulama, hata/fallback mekanizmaları |
| 15 | AI özellik testleri, **demo & geri bildirim** |

### Hafta 4 — İleri AI Özellikleri & Teslim (Gün 16-20)
| Gün | Hedef |
|-----|-------|
| 16 | Çalışma tarzı/karakter analizi: veri modeli, demo verisi seed, analiz prompt'u |
| 17 | Analiz sonucunu "önerilen atama" özelliğine bağlama |
| 18 | Zamanlanmış otomatik ilerleme özeti job'ı + bildirim/feed UI |
| 19 | Uçtan uca test, performans/UI cilası, bug fix |
| 20 | Final dokümantasyon, demo senaryosu, sunum hazırlığı, retrospektif |

---

## 7. Git / GitHub Akışı

- **`main`'e asla doğrudan push yok.** Tüm değişiklikler `feat/<konu>` / `fix/<konu>` branch'lerinde yapılır ve push edilir; main'e girişi yalnızca PR ile olur.
- **PR zamanlaması:** PR'lar her commit'te değil, bir iş parçası tamamlandığında (staj sonunda toparlanacak şekilde) açılır — ara aşamada branch'e push yeterli.
- **Branch stratejisi:** `main` (her zaman demo edilebilir, sadece PR merge ile güncellenir) + `feat/<konu>` / `fix/<konu>` feature branch'leri
- **Commit formatı:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`)
- **Commit dili:** Commit mesajları her zaman İngilizce; doküman içerikleri (README, plan) Türkçe kalabilir.
- **Günlük ritim:** her gün en az bir anlamlı commit, ilgili branch'e push
- **GitHub Issues:** yukarıdaki 20 günlük takvim, her gün için bir Issue olarak açılabilir (opsiyonel ama önerilir — ilerleme takibi + Ümit Bey'e şeffaflık için)
- **Secrets:** `.env` asla commit edilmeyecek; `.env.example` şablonları tutulacak (Supabase URL/anon key, backend service role key, `OLLAMA_HOST`)

---

## 8. Test Stratejisi

- **Backend:** Vitest — özellikle AI JSON parse/validation ve risk skor mantığı için birim testleri
- **Frontend:** React Testing Library — Kanban drag-drop, task formu gibi kritik bileşenler
- **E2E (stretch, zaman kalırsa):** Playwright ile 1-2 kritik senaryo (proje oluştur → görev ata → Kanban'da taşı)

---

## 9. Riskler & Önlemler

| Risk | Önlem |
|------|-------|
| 4GB VRAM'de local LLM yavaş/yetersiz kalabilir | Küçük model (3B) ile başla, Gün 11'de benchmark, `AIProvider` soyutlaması sayesinde gerekirse cloud API'ye geçiş kolay |
| "Karakter analizi" için gerçek kullanım verisi az olacak | Gerçekçi sentetik demo verisi (task history) seed edilecek |
| 20 günde kapsam taşması | Gün 10'da sert MVP checkpoint; AI özellikleri PM çekirdeğini bloklamayan katmanlar olarak eklenir |
| Backend + Supabase Auth'un birlikte JWT doğrulaması karmaşıklığı | Express middleware'de Supabase JWKS ile token doğrulama, service role key sadece backend'de |
| Realtime çakışmaları (iki kullanıcı aynı görevi taşırsa) | `order_index` + `updated_at` bazlı optimistic UI + last-write-wins |

---

## 10. Sonraki Adım

Bu plan onaylandıktan sonra: `README.md` yazılacak, ardından Gün 2'den itibaren repo iskeleti (frontend/backend) kurulmaya başlanacak.
