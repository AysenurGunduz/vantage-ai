import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

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

export default function Landing() {
  return (
    <div className="editorial-theme min-h-screen bg-[#f3f2f2] text-[#201e1d]">
      <nav className="sticky top-0 z-20 border-b border-[#201e1d]/10 bg-[#f3f2f2]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <img src="/logo.png" alt="Vantage" className="h-10 w-fit" />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-base hover:text-[#0088b0]">
              Giriş yap
            </Link>
            <Link
              to="/signup"
              className="rounded-[3px] border border-[#0088b0] px-4 py-2 text-sm font-semibold text-[#0088b0] hover:bg-[#0088b0]/10"
            >
              Kayıt ol
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24">
        <h1 className="cmyk-head text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          <span className="paper">Ekibiniz nereye odaklanmalı, siz belirleyin.</span>
          <span className="plate plate-c" aria-hidden="true">
            Ekibiniz nereye odaklanmalı, siz belirleyin.
          </span>
          <span className="plate plate-m" aria-hidden="true">
            Ekibiniz nereye odaklanmalı, siz belirleyin.
          </span>
          <span className="plate plate-y" aria-hidden="true">
            Ekibiniz nereye odaklanmalı, siz belirleyin.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#201e1d]/80">
          Ekibiniz projelerini Kanban panosunda planlasın, görevleri atasın ve ilerlemeyi tek yerden
          takip etsin — yapay zeka görev üretir, gecikme riskini önceden haber verir.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            className="rounded-[3px] border border-[#0088b0] px-5 py-2.5 text-sm font-semibold text-[#0088b0] hover:bg-[#0088b0]/10"
          >
            Ücretsiz başla
          </Link>
          <Link to="/login" className="text-sm text-[#0088b0] hover:text-[#1186ac]">
            Zaten hesabınız var mı? Giriş yapın
          </Link>
        </div>
      </section>

      <section className="border-t border-[#201e1d]/10 bg-[#eae9e9]/50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <span className="mb-5 block text-sm font-semibold tracking-[0.1em] text-[#201e1d]/60 uppercase">
            Neden Vantage
          </span>
          <div>
            {whyCards.map((card) => (
              <details key={card.title} className="group border-b border-[#201e1d]/10 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-2xl font-semibold tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                  {card.title}
                  <ChevronDown className="size-6 shrink-0 text-[#201e1d]/50 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#201e1d]/75">{card.body}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#201e1d]/10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="mb-5 block text-sm font-semibold tracking-[0.1em] text-[#201e1d]/60 uppercase">
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
                  className="border-l-2 border-[#201e1d]/15 pl-4 text-[15px] leading-relaxed text-[#201e1d]/80"
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
                  className="border-l-2 border-[#0088b0] pl-4 text-[15px] leading-relaxed text-[#201e1d]/80"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <figure className="m-0 overflow-hidden rounded-[4px]">
            <img
              src="/mockups/kanban-board.png"
              alt="Vantage Kanban panosu ekran görüntüsü"
              className="block w-full"
            />
          </figure>
        </div>
      </section>

      <section className="border-t border-[#201e1d]/10 bg-[#eae9e9]/50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <h3 className="text-3xl font-semibold tracking-tight">Ekibinizle hemen başlayın</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#201e1d]/75">
            Kayıt olun, organizasyonunuzu kurun ve ilk projenizi dakikalar içinde oluşturun.
          </p>
          <div className="mt-7 flex max-w-md gap-4">
            <input
              type="email"
              placeholder="isim@sirket.com"
              aria-label="İş e-postası"
              className="min-h-9 flex-1 rounded-[3px] border border-[#201e1d]/15 bg-[#f3f2f2] px-3 text-sm focus:border-[#0088b0] focus:outline-none"
            />
            <Link
              to="/signup"
              className="flex min-h-9 items-center rounded-[3px] border border-[#0088b0] px-4 text-sm font-semibold text-[#0088b0] hover:bg-[#0088b0]/10"
            >
              Kayıt ol
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#201e1d]/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-[#201e1d]/60 sm:px-10">
          © 2026 Vantage.
        </div>
      </footer>
    </div>
  );
}
