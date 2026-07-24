import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Puzzle,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const whyCards = [
  {
    title: "Planlama ve yürütme, tek yerde",
    body: "Organizasyon, proje ve görev hiyerarşisi; Kanban panosu, deadline ve atamalar — klasik bir proje yönetim aracının sunduğu her şey tek ekranda.",
    icon: LayoutGrid,
  },
  {
    title: "Gerçek bir asistan gibi çalışan AI",
    body: "Proje açıklamasını görevlere böler, gecikme riskini önceden haber verir, ekip üyesinin çalışma tarzına göre atama önerir.",
    icon: Sparkles,
  },
  {
    title: "Modüler ve genişletilebilir",
    body: "Kullanmadığınız yapay zeka önerilerini kapatabilir, ekibinizin çalışma biçimine göre esnetebilirsiniz.",
    icon: Puzzle,
  },
];

const coreFeatures = [
  "Organizasyon / proje / görev hiyerarşisi, rol tabanlı ekip üyeliği",
  "Kanban panosunda sürükle-bırak ile canlı senkron durum takibi",
  "Görevlere atama, öncelik, deadline, etiket",
  "Durum istatistikleri ve geciken görev takibi içeren proje panosu",
];

const aiFeatures = [
  "Otomatik görev bölme: açıklamadan önerilen görev listesi",
  "Önceliklendirme ve gecikme riski skoru, doğal dil açıklamasıyla",
  "Çalışma tarzı analizine dayalı atama önerileri",
  "Belirli aralıklarla otomatik ilerleme özetleri",
];

const trustChips = ["Kanban panosu", "Yapay zeka görev bölme", "Gerçek zamanlı senkron"];

const previewColumns: { label: string; dot: string; cardWidths: string[] }[] = [
  { label: "Backlog", dot: "bg-white/30", cardWidths: ["70%", "45%"] },
  { label: "Todo", dot: "bg-sky-400", cardWidths: ["85%", "60%", "50%"] },
  { label: "Devam Ediyor", dot: "bg-amber-400", cardWidths: ["65%", "80%"] },
  { label: "İncelemede", dot: "bg-purple-400", cardWidths: ["55%"] },
  { label: "Tamamlandı", dot: "bg-emerald-400", cardWidths: ["75%", "40%", "60%"] },
];

function HeroKanbanPreview() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {previewColumns.map((column) => (
        <div key={column.label} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-2.5">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-white/50">
            <span className={`size-1.5 rounded-full ${column.dot}`} />
            {column.label}
          </div>
          <div className="space-y-1.5">
            {column.cardWidths.map((width, i) => (
              <div key={i} className="h-6 rounded-[3px] bg-white/[0.07]" style={{ width }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="dark-theme animated-gradient min-h-screen text-white">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1b3a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-base text-white/80 hover:text-[#ff6b5b]">
              Giriş yap
            </Link>
            <Link
              to="/signup"
              className="rounded-[3px] border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            >
              Hemen Başla
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff6b5b]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="page-fade-in relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
          <span className="mb-6 inline-block rounded-full bg-[#ff6b5b]/10 px-4 py-1.5 text-sm font-medium text-[#ff6b5b]">
            Yapay Zeka Destekli Proje Yönetimi
          </span>
          <h1 className="text-4xl leading-[1.05] font-bold text-balance sm:text-6xl lg:text-7xl">
            Ekibiniz nereye odaklanmalı, <span className="text-[#ff6b5b]">siz belirleyin.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Ekibiniz projelerini Kanban panosunda planlasın, görevleri atasın ve ilerlemeyi tek yerden
            takip etsin — yapay zeka görev üretir, gecikme riskini önceden haber verir.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-[3px] bg-[#ff6b5b] px-5 py-2.5 text-sm font-semibold text-[#0d1b3a] shadow-lg shadow-[#ff6b5b]/20 transition-all hover:bg-[#ff8577] hover:shadow-xl hover:shadow-[#ff6b5b]/30"
            >
              Ücretsiz başla
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login" className="text-sm text-white/70 transition-colors hover:text-white">
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {trustChips.map((chip) => (
              <span key={chip} className="flex items-center gap-1.5 text-sm text-white/50">
                <CheckCircle2 className="size-4 text-[#ff6b5b]/70" />
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-12 sm:px-10">
          <HeroKanbanPreview />
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <Reveal>
            <span className="mb-5 block text-sm font-semibold tracking-[0.1em] text-white/50 uppercase">
              Neden Vantage
            </span>
          </Reveal>
          <div>
            {whyCards.map((card) => (
              <Reveal key={card.title}>
                <details className="group border-b border-white/10 py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-semibold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3">
                      <card.icon className="size-6 shrink-0 text-[#ff6b5b]" />
                      {card.title}
                    </span>
                    <ChevronDown className="size-6 shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 max-w-2xl pl-9 text-[15px] leading-relaxed text-white/70">{card.body}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div>
              <span className="mb-5 block text-sm font-semibold tracking-[0.1em] text-white/50 uppercase">
                Özellikler
              </span>
              <h2 className="text-3xl font-semibold tracking-tight">
                Çekirdek yönetim, yapay zeka ile güçlendirilmiş
              </h2>

              <h3 className="mt-8 mb-2.5 text-base font-semibold">Çekirdek proje yönetimi</h3>
              <ul className="space-y-2.5">
                {coreFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/75">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-white/40" />
                    {feature}
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 mb-2.5 text-base font-semibold">Yapay zeka katmanı</h3>
              <ul className="space-y-2.5">
                {aiFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-white/75">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#ff6b5b]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal>
            <figure className="relative m-0">
              <div className="pointer-events-none absolute -inset-4 rounded-[8px] bg-[#ff6b5b]/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[4px] border border-white/10 bg-[#0a1530] shadow-2xl shadow-black/40">
                <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.02] px-3 py-2.5">
                  <span className="size-2.5 rounded-full bg-[#ff6b5b]/60" />
                  <span className="size-2.5 rounded-full bg-amber-400/60" />
                  <span className="size-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <img
                  src="/mockups/kanban-board.png"
                  alt="Vantage Kanban panosu ekran görüntüsü"
                  className="block w-full"
                />
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-[4px] border border-white/10 bg-white/[0.03] p-10 sm:p-14">
              <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#ff6b5b]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />

              <h3 className="relative text-3xl font-semibold tracking-tight">Ekibinizle hemen başlayın</h3>
              <p className="relative mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
                Kayıt olun, organizasyonunuzu kurun ve ilk projenizi dakikalar içinde oluşturun.
              </p>
              <div className="relative mt-7 flex max-w-md gap-4">
                <input
                  type="email"
                  placeholder="isim@sirket.com"
                  aria-label="İş e-postası"
                  className="min-h-9 flex-1 rounded-[3px] border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-[#ff6b5b] focus:outline-none"
                />
                <Link
                  to="/signup"
                  className="flex min-h-9 items-center rounded-[3px] bg-[#ff6b5b] px-4 text-sm font-semibold text-[#0d1b3a] transition-colors hover:bg-[#ff8577]"
                >
                  Kayıt ol
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-white/50 sm:px-10">
          <Logo className="scale-90 opacity-70" />
          <span>© 2026 Vantage.</span>
        </div>
      </footer>
    </div>
  );
}
