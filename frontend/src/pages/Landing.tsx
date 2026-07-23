import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/Logo";

const whyCards = [
  {
    title: "Planlama ve yürütme, tek yerde",
    body: "Organizasyon, proje ve görev hiyerarşisi; Kanban panosu, deadline ve atamalar — klasik bir proje yönetim aracının sunduğu her şey tek ekranda.",
  },
  {
    title: "Gerçek bir asistan gibi çalışan AI",
    body: "Proje açıklamasını görevlere böler, gecikme riskini önceden haber verir, ekip üyesinin çalışma tarzına göre atama önerir.",
  },
  {
    title: "Modüler ve genişletilebilir",
    body: "Kullanmadığınız yapay zeka önerilerini kapatabilir, ekibinizin çalışma biçimine göre esnetebilirsiniz.",
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

function WaveBars({ count = 80 }: { count?: number }) {
  const heights = useMemo(() => Array.from({ length: count }, () => 20 + Math.random() * 80), [count]);

  return (
    <div className="wave-bars h-32 w-full sm:h-40">
      {heights.map((h, i) => (
        <span key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="dark-theme min-h-screen bg-[#0a0e1a] text-white">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-base text-white/80 hover:text-[#ff6b5b]">
              Giriş yap
            </Link>
            <Link
              to="/signup"
              className="rounded-[3px] border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
            >
              Hemen Başla
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff6b5b]/15 blur-3xl" />
        <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
          <h1 className="text-4xl leading-[1.05] font-bold text-balance sm:text-6xl lg:text-7xl">
            Ekibiniz nereye odaklanmalı, siz belirleyin.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Ekibiniz projelerini Kanban panosunda planlasın, görevleri atasın ve ilerlemeyi tek yerden
            takip etsin — yapay zeka görev üretir, gecikme riskini önceden haber verir.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="rounded-[3px] bg-[#ff6b5b] px-5 py-2.5 text-sm font-semibold text-[#0a0e1a] hover:bg-[#ff8577]"
            >
              Ücretsiz başla
            </Link>
            <Link to="/login" className="text-sm text-white/70 hover:text-white">
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>
        </div>

        <div className="relative px-6 pb-4 sm:px-10">
          <WaveBars />
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <span className="mb-5 block text-sm font-semibold tracking-[0.1em] text-white/50 uppercase">
            Neden Vantage
          </span>
          <div>
            {whyCards.map((card) => (
              <details key={card.title} className="group border-b border-white/10 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-semibold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                  {card.title}
                  <ChevronDown className="size-6 shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">{card.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16">
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
                <li
                  key={feature}
                  className="border-l-2 border-white/15 pl-4 text-[15px] leading-relaxed text-white/75"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 mb-2.5 text-base font-semibold">Yapay zeka katmanı</h3>
            <ul className="space-y-2.5">
              {aiFeatures.map((feature) => (
                <li
                  key={feature}
                  className="border-l-2 border-[#ff6b5b] pl-4 text-[15px] leading-relaxed text-white/75"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <figure className="m-0 overflow-hidden rounded-[4px] border border-white/10">
            <img
              src="/mockups/kanban-board.png"
              alt="Vantage Kanban panosu ekran görüntüsü"
              className="block w-full"
            />
          </figure>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <h3 className="text-3xl font-semibold tracking-tight">Ekibinizle hemen başlayın</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/70">
            Kayıt olun, organizasyonunuzu kurun ve ilk projenizi dakikalar içinde oluşturun.
          </p>
          <div className="mt-7 flex max-w-md gap-4">
            <input
              type="email"
              placeholder="isim@sirket.com"
              aria-label="İş e-postası"
              className="min-h-9 flex-1 rounded-[3px] border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-[#ff6b5b] focus:outline-none"
            />
            <Link
              to="/signup"
              className="flex min-h-9 items-center rounded-[3px] bg-[#ff6b5b] px-4 text-sm font-semibold text-[#0a0e1a] hover:bg-[#ff8577]"
            >
              Kayıt ol
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-white/50 sm:px-10">© 2026 Vantage.</div>
      </footer>
    </div>
  );
}
