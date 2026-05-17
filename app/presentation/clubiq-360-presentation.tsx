"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { PresentationConfig } from "@/app/presentation/types";

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;

type PathChoice = "backoffice" | "website" | "mobile" | null;
type MomentKey = "fev" | "mar-a" | "mar-b" | "abr-a" | "abr-b" | "mai";

type ThemeStyle = React.CSSProperties & {
  [key: `--${string}`]: string;
};

interface SlideDescriptor {
  id: string;
  label: string;
}

const timelineMoments: Record<
  MomentKey,
  { month: string; title: string; detail: string }
> = {
  fev: {
    month: "Fevereiro",
    title: "Lançamento da primeira app",
    detail: "A.D.Oeiras Official App",
  },
  "mar-a": {
    month: "Março",
    title: "Constituição da empresa",
    detail: "Estrutura oficial ClubIQ",
  },
  "mar-b": {
    month: "Março",
    title: "Contratação de colaboradores",
    detail: "Reforço da equipa de entrega",
  },
  "abr-a": {
    month: "Abril",
    title: "Registo na União Europeia",
    detail: "Consolidação legal da marca",
  },
  "abr-b": {
    month: "Abril",
    title: "Desenvolvimento do site do GRF Murches",
    detail: "Projeto web em execução para o clube",
  },
  mai: {
    month: "Maio",
    title: "Desenvolvimento e lançamento do nosso site",
    detail: "Site ClubIQ publicado e ativo",
  },
};

const timelineTrack = [
  { id: "jan", label: "Janeiro", monthIndex: 0, momentKey: null },
  { id: "fev", label: "Fevereiro", monthIndex: 1, momentKey: "fev" as const },
  { id: "mar-a", label: "Março", monthIndex: 2, momentKey: "mar-a" as const },
  { id: "mar-b", label: "Março", monthIndex: 2, momentKey: "mar-b" as const },
  { id: "abr-a", label: "Abril", monthIndex: 3, momentKey: "abr-a" as const },
  { id: "abr-b", label: "Abril", monthIndex: 3, momentKey: "abr-b" as const },
  { id: "mai", label: "Maio", monthIndex: 4, momentKey: "mai" as const },
] as const;

const momentMonthByKey: Record<MomentKey, number> = {
  fev: 1,
  "mar-a": 2,
  "mar-b": 2,
  "abr-a": 3,
  "abr-b": 3,
  mai: 4,
};

const monthNamesPt = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const currentMonthIndex = new Date().getMonth();

function getAvailableMomentsUntilCurrentMonth(): MomentKey[] {
  const order: MomentKey[] = ["fev", "mar-a", "mar-b", "abr-a", "abr-b", "mai"];
  return order.filter((key) => momentMonthByKey[key] <= currentMonthIndex);
}

function getInitialMoment(): MomentKey {
  const available = getAvailableMomentsUntilCurrentMonth();
  return available[0] ?? "fev";
}

export default function ClubIQ360Presentation({
  config,
}: {
  config: PresentationConfig;
}) {
  const [scale, setScale] = useState(1);
  const [currentSlideId, setCurrentSlideId] = useState("parte-1");
  const [pathChoice, setPathChoice] = useState<PathChoice>(null);
  const [activeMoment, setActiveMoment] = useState<MomentKey>(getInitialMoment);

  useEffect(() => {
    const updateScale = () => {
      const width = Math.max(window.innerWidth, 320);
      const height = Math.max(window.innerHeight, 320);
      setScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const slides = useMemo(() => buildSlides(pathChoice), [pathChoice]);
  const slideIds = slides.map((slide) => slide.id);
  const resolvedSlideId = slideIds.includes(currentSlideId)
    ? currentSlideId
    : "parte-1";
  const currentIndex = Math.max(slideIds.indexOf(resolvedSlideId), 0);
  const currentSlide = slides[currentIndex];
  const availableMoments = getAvailableMomentsUntilCurrentMonth();

  const navigate = (delta: 1 | -1) => {
    if (resolvedSlideId === "parte-3" && availableMoments.length > 0) {
      const momentIndex = availableMoments.indexOf(activeMoment);
      if (delta === 1 && momentIndex < availableMoments.length - 1) {
        const nextMoment = availableMoments[momentIndex + 1];
        if (nextMoment) {
          setActiveMoment(nextMoment);
          return;
        }
      }

      if (delta === -1 && momentIndex > 0) {
        const prevMoment = availableMoments[momentIndex - 1];
        if (prevMoment) {
          setActiveMoment(prevMoment);
          return;
        }
      }
    }

    moveSlide(delta, currentIndex, slideIds, setCurrentSlideId);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        navigate(1);
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeMoment, currentIndex, resolvedSlideId, slideIds]);

  const themeStyle = buildThemeStyle(config);
  const sortedFounders = [...config.companyConfig.founders].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="relative h-dvh overflow-hidden bg-[var(--brand-navy)] text-white" style={themeStyle}>
      <ClickNavigationZones
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
      />

      <section className="relative h-full w-full overflow-hidden">
        <SlideBackground config={config} />
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <LogoHeader logoSrc={config.companyConfig.logoSrc} />
          <TopRightClubSymbol symbolSrc={config.clubConfig.logoSrc} clubName={config.clubConfig.shortName} />
          <RightSymbol symbolSrc={config.companyConfig.symbolSrc} />
          <main className="h-full px-16 pb-14 pt-32">
            {currentSlide.id === "parte-1" ? (
              <Part1Cover config={config} />
            ) : null}
            {currentSlide.id === "parte-2" ? (
              <Part2Who config={config} founders={sortedFounders} />
            ) : null}
            {currentSlide.id === "parte-3" ? (
              <Part3Timeline
                activeMoment={activeMoment}
                onSetMoment={setActiveMoment}
              />
            ) : null}
            {currentSlide.id === "parte-4a" ? <Part4Importance /> : null}
            {currentSlide.id === "parte-4b" ? <Part4Decline /> : null}
            {currentSlide.id === "parte-5a" ? <Part5Archaic /> : null}
            {currentSlide.id === "parte-5b" ? <Part5Limits /> : null}
            {currentSlide.id === "parte-6" ? (
              <Part6SolutionsFoldersV2
                pathChoice={pathChoice}
                clubName={config.clubConfig.shortName}
                clubLogoSrc={config.clubConfig.logoSrc}
                onChoose={(choice) => {
                  setPathChoice(choice);
                  if (choice === "backoffice") {
                    setCurrentSlideId("parte-7");
                  }
                  if (choice === "website") {
                    setCurrentSlideId("parte-8");
                  }
                  if (choice === "mobile") {
                    setCurrentSlideId("parte-9");
                  }
                }}
              />
            ) : null}
            {currentSlide.id === "parte-7" ? <Part7BackOffice /> : null}
            {currentSlide.id === "parte-8" ? <Part8Website /> : null}
            {currentSlide.id === "parte-9" ? <Part9Mobile /> : null}
          </main>
        </div>
      </section>
    </div>
  );
}

function TopRightClubSymbol({
  symbolSrc,
  clubName,
}: {
  symbolSrc: string;
  clubName: string;
}) {
  return (
    <div className="absolute right-8 top-6 z-20 flex h-[84px] w-[84px] items-start justify-center">
      <Image
        src={symbolSrc}
        alt={`Símbolo ${clubName}`}
        width={84}
        height={84}
        priority
        className="h-[84px] w-[84px] object-contain object-top"
      />
    </div>
  );
}

function RightSymbol({ symbolSrc }: { symbolSrc: string }) {
  return (
    <div className="absolute bottom-6 right-8 z-20">
      <Image src={symbolSrc} alt="Símbolo ClubIQ" width={128} height={36} priority />
    </div>
  );
}

function ClickNavigationZones({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      <button
        type="button"
        aria-label="Slide anterior"
        onClick={onPrev}
        className="pointer-events-auto absolute inset-y-0 left-0 w-16 cursor-w-resize appearance-none border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      />
      <button
        type="button"
        aria-label="Slide seguinte"
        onClick={onNext}
        className="pointer-events-auto absolute inset-y-0 right-0 w-16 cursor-e-resize appearance-none border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      />
    </div>
  );
}

function buildSlides(pathChoice: PathChoice): SlideDescriptor[] {
  const base: SlideDescriptor[] = [
    { id: "parte-1", label: "Parte 1" },
    { id: "parte-2", label: "Parte 2" },
    { id: "parte-3", label: "Parte 3" },
    { id: "parte-4a", label: "Parte 4.1" },
    { id: "parte-4b", label: "Parte 4.2" },
    { id: "parte-5a", label: "Parte 5.1" },
    { id: "parte-5b", label: "Parte 5.2" },
    { id: "parte-6", label: "Parte 6" },
  ];

  if (pathChoice === "backoffice") {
    return [...base, { id: "parte-7", label: "Parte 7" }];
  }

  if (pathChoice === "website") {
    return [...base, { id: "parte-8", label: "Parte 8" }];
  }

  if (pathChoice === "mobile") {
    return [...base, { id: "parte-9", label: "Parte 9" }];
  }

  return base;
}

function buildThemeStyle(config: PresentationConfig): ThemeStyle {
  return {
    "--brand-navy": config.brandPalette.navy,
    "--brand-orange": config.brandPalette.orange,
    "--brand-white": config.brandPalette.white,
    "--club-primary": config.clubConfig.clubColors.primary,
    "--club-secondary": config.clubConfig.clubColors.secondary,
    "--club-accent": config.clubConfig.clubColors.accent,
    "--club-surface": config.clubConfig.clubColors.surface,
    "--club-contrast": config.clubConfig.clubColors.contrast,
  };
}

function moveSlide(
  delta: number,
  currentIndex: number,
  slideIds: string[],
  setCurrentSlideId: (id: string) => void
) {
  const nextIndex = Math.min(
    Math.max(currentIndex + delta, 0),
    slideIds.length - 1
  );
  const next = slideIds[nextIndex];
  if (next) {
    setCurrentSlideId(next);
  }
}

function SlideBackground({ config }: { config: PresentationConfig }) {
  const bgLogo = config.clubConfig.backgroundLogoSrc;
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#091120_0%,#0f172a_100%)]" />
      <div className="absolute inset-0 deck-noise opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(242,116,39,0.14),transparent_20%),radial-gradient(circle_at_84%_78%,rgba(255,255,255,0.05),transparent_18%)]" />
      {bgLogo ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-[86vh] w-[86vh] max-h-[1300px] max-w-[1300px] rotate-12 opacity-[0.08]">
            <Image src={bgLogo} alt="" fill className="object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}

function LogoHeader({ logoSrc }: { logoSrc: string }) {
  return (
    <div className="absolute left-8 top-6 z-20">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-orange)]/14 blur-2xl" />
      <Image src={logoSrc} alt="ClubIQ" width={102} height={30} priority />
    </div>
  );
}

function TopBar({
  current,
  total,
  onHub,
}: {
  current: number;
  total: number;
  onHub: () => void;
}) {
  return (
    <div className="pointer-events-none fixed right-6 top-5 z-40 flex items-center gap-3">
      <div className="pointer-events-auto rounded-full border border-white/12 bg-[#0d1728]/70 px-4 py-2 text-sm font-semibold backdrop-blur-[30px]">
        {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <button
        type="button"
        onClick={onHub}
        className="pointer-events-auto rounded-full border border-white/12 bg-[#0d1728]/70 px-4 py-2 text-sm font-semibold backdrop-blur-[30px]"
      >
        Parte 6
      </button>
    </div>
  );
}

function BottomDots({
  slides,
  currentSlideId,
  onSelect,
}: {
  slides: SlideDescriptor[];
  currentSlideId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="pointer-events-none fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 xl:block">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/12 bg-[#0d1728]/70 px-3 py-2 backdrop-blur-[30px]">
        {slides.map((slide) => {
          const active = currentSlideId === slide.id;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelect(slide.id)}
              className={`h-3 w-3 rounded-full transition ${
                active ? "bg-[var(--brand-orange)]" : "bg-white/30 hover:bg-white/55"
              }`}
              aria-label={slide.label}
            />
          );
        })}
      </div>
    </aside>
  );
}

function Part1Cover({ config }: { config: PresentationConfig }) {
  return (
    <div className="grid h-full grid-cols-[0.95fr_1.05fr] gap-10">
      <div className="flex flex-col">
        <div className="flex flex-1 items-center">
          <div className="space-y-5">
          <h1 className="huge-title text-[72px] text-white">
            O Universo Digital do{" "}
            <span className="text-[var(--club-primary)]">
              {config.clubConfig.shortName}
            </span>
          </h1>
          <p className="max-w-[680px] text-[25px] font-semibold leading-[1.28] text-slate-200">
            O próximo passo para a Modernidade, Estabilidade e Grandeza
          </p>
          </div>
        </div>
        <div className="flex items-center gap-4 pb-2">
          <Image
            src="/AppStoreIcon.jpg"
            alt="App Store"
            width={58}
            height={58}
            className="rounded-xl object-contain"
          />
          <Image
            src="/PlayStoreIcon.jpg"
            alt="Play Store"
            width={58}
            height={58}
            className="rounded-xl object-contain"
          />
          <Image
            src="/WWWLogo.png"
            alt="Website"
            width={58}
            height={58}
            className="rounded-xl"
          />
          <Image
            src="/BackOfficeLogo.png"
            alt="BackOffice"
            width={68}
            height={68}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="relative h-[420px] w-[420px]">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-9 rounded-full border border-white/16" />
          <div className="absolute inset-[72px] rounded-full border border-white/12" />
          <div className="absolute left-1/2 top-1/2 z-20 h-[286px] w-[286px] -translate-x-1/2 -translate-y-1/2 rotate-12">
            <Image
              src={config.clubConfig.logoSrc}
              alt={config.clubConfig.shortName}
              width={286}
              height={286}
              className="h-full w-full object-contain"
            />
          </div>

          <OrbitCard label="BackOffice" position="top" />
          <OrbitCard label="Website" position="left" />
              <OrbitCard label="Aplicação Móvel" position="right" />
        </div>
      </div>
    </div>
  );
}

function OrbitCard({
  label,
  position,
}: {
  label: string;
  position: "top" | "left" | "right";
}) {
  const positionClass =
    position === "top"
      ? "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
      : position === "left"
        ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
        : "right-0 top-1/2 translate-x-1/2 -translate-y-1/2";

  return (
    <div className={`absolute z-10 ${positionClass}`}>
      <div className="glass-card-soft rounded-2xl px-4 py-3">
        <p className="text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--club-secondary)]">
          {label}
        </p>
      </div>
    </div>
  );
}

function Part2Who({
  config,
  founders,
}: {
  config: PresentationConfig;
  founders: PresentationConfig["companyConfig"]["founders"];
}) {
  return (
    <div className="grid h-full grid-rows-[0.72fr_0.28fr] gap-4">
      <div className="grid h-full grid-rows-[auto_1fr]">
        <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">Quem Somos</h2>
        <div className="grid h-full content-center grid-cols-3 gap-4">
          {founders.map((founder) => (
            <article key={founder.name} className="p-2">
              <div className="relative flex h-[255px] items-end justify-center overflow-hidden px-3 pt-3">
                <div className="pointer-events-none absolute left-1/2 top-0 h-[92%] w-[92%] -translate-x-1/2 rounded-t-[180px] border-x border-t border-white/35" />
                <Image
                  src={founder.imageSrc}
                  alt={founder.name}
                  width={260}
                  height={260}
                  className="h-full w-auto object-contain object-bottom"
                />
              </div>
              <p className="mt-4 text-center text-[24px] font-semibold text-white">
                {founder.name}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 items-start gap-3">
        <ValueCard
          title="Compromisso"
          text="Com o crescimento e acompanhamento dos clubes."
        />
        <ValueCard
          title="Proximidade"
          text="Contacto rápido e resolução de problemas."
        />
        <ValueCard
          title="Antecipação Estratégica"
          text="Procuramos problemas e resolvemos antes de chegarem ao clube."
        />
      </div>
    </div>
  );
}

function ValueCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="glass-card-soft h-[108px] rounded-[20px] p-3">
      <p className="eyebrow-label font-display text-[11px] text-[var(--brand-orange)]">{title}</p>
      <p className="mt-1.5 text-[15px] font-semibold leading-[1.25] text-white">{text}</p>
    </div>
  );
}

function Part3Timeline({
  activeMoment,
  onSetMoment,
}: {
  activeMoment: MomentKey;
  onSetMoment: (key: MomentKey) => void;
}) {
  const active = timelineMoments[activeMoment];
  const maxMonthIndex = Math.max(currentMonthIndex, 1);
  const activeMonth = momentMonthByKey[activeMoment];
  const progressPercent = (activeMonth / maxMonthIndex) * 100;
  const currentMonthLabel = monthNamesPt[currentMonthIndex] ?? "Mês Atual";
  const visibleMoments = timelineTrack.filter(
    (item) =>
      item.momentKey &&
      item.monthIndex <= currentMonthIndex
  );
  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-6">
      <div className="space-y-5">
        <h2 className="huge-title -mt-20 pl-28 text-[58px] whitespace-nowrap text-white">O NOSSO ANO</h2>
        <div className="mt-14 pr-8">
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-[2px] bg-white/30" />
            <div
              className="absolute left-0 top-5 h-[2px] bg-[var(--brand-orange)] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="relative h-16">
              {visibleMoments.map((item) => {
                if (!item.momentKey) return null;
                const isActive = item.momentKey === activeMoment;
                const index = visibleMoments.findIndex((moment) => moment.id === item.id);
                const denominator = Math.max(visibleMoments.length - 1, 1);
                const startInset = 10;
                const endInset = 10;
                const usableWidth = 100 - startInset - endInset;
                const baseLeft = startInset + (index / denominator) * usableWidth;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => onSetMoment(item.momentKey!)}
                    onFocus={() => onSetMoment(item.momentKey!)}
                    onClick={() => onSetMoment(item.momentKey!)}
                    className={`absolute top-0 h-10 w-10 -translate-x-1/2 rounded-full border-2 transition ${
                      isActive
                        ? "border-[var(--brand-orange)] bg-[var(--brand-orange)] shadow-[0_0_0_5px_rgba(242,116,39,0.18)]"
                        : "border-white/70 bg-[#12203a] hover:border-[var(--brand-orange)]"
                    }`}
                    style={{ left: `${baseLeft}%` }}
                    aria-label={item.label}
                  >
                    <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-white" />
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[14px] font-bold tracking-wide text-slate-100">Janeiro</p>
              <p className="text-[14px] font-bold tracking-wide text-slate-100">{currentMonthLabel}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="section-shell mt-2 rounded-[34px] p-7">
        <p className="eyebrow-label font-display text-[var(--brand-orange)]">
          Destaque
        </p>
        <p className="mt-2 text-[18px] font-bold uppercase tracking-[0.12em] text-slate-300">
          {active.month}
        </p>
        <h3 className="mt-4 text-[42px] font-semibold text-white">{active.title}</h3>
        <p className="mt-4 text-[26px] font-semibold text-slate-100">{active.detail}</p>
      </div>
    </div>
  );
}

function Part4Importance() {
  return (
    <div className="flex h-full items-center">
      <div className="grid w-full grid-cols-[1.2fr_0.8fr] items-center gap-8">
        <div className="relative flex h-full items-center p-2">
          <h2 className="huge-title text-[64px] leading-[1.05] text-white">
            Os Sócios são o motor{" "}
            <span className="text-[var(--club-primary)]">Emocional</span> e{" "}
            <span className="text-[var(--club-secondary)]">Financeiro</span> de um clube
          </h2>
        </div>

        <div className="relative flex h-full items-center justify-center">
          <div className="relative h-[360px] w-[360px]">
            <Image
              src="/SimboloBSad.png"
              alt="Símbolo BSAD"
              fill
              className="object-contain opacity-75"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-14deg] rounded-xl border-4 border-red-500/90 bg-red-600/25 px-7 py-3 backdrop-blur-sm">
              <p className="text-[42px] font-black uppercase tracking-[0.08em] text-red-100">
                Extinto
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Part4Decline() {
  return (
    <div className="flex h-full items-center">
      <div className="grid w-full grid-cols-[1.2fr_0.8fr] items-center gap-8">
        <div className="relative flex h-full items-center p-2">
          <h2 className="huge-title text-[56px] leading-[1.08] text-white">
            O clube não está a perder pessoas, está a perder a ligação com elas.
          </h2>
        </div>

        <div className="relative flex h-full items-center justify-center">
          <div className="relative h-[360px] w-[520px] rounded-[28px] border border-white/14 bg-white/[0.02] p-6 backdrop-blur-md">
            <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_18%_20%,rgba(198,32,50,0.16),transparent_34%),radial-gradient(circle_at_84%_22%,rgba(34,197,94,0.16),transparent_30%)]" />
            <div className="absolute left-6 right-6 top-6 bottom-6 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:52px_52px]" />

            <svg
              viewBox="0 0 520 320"
              className="relative z-10 h-full w-full"
              aria-label="Evolução do número de sócios"
            >
              <defs>
                <linearGradient id="declineRiseLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--club-primary)" />
                  <stop offset="58%" stopColor="var(--brand-orange)" />
                  <stop offset="100%" stopColor="var(--club-secondary)" />
                </linearGradient>
              </defs>

              <path
                d="M20 70 C95 95, 140 170, 205 208 C228 223, 246 228, 260 228"
                fill="none"
                stroke="url(#declineRiseLine)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M260 228 C300 224, 338 188, 372 150 C410 108, 450 78, 498 62"
                fill="none"
                stroke="url(#declineRiseLine)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              <circle cx="260" cy="228" r="18" fill="rgba(15,23,42,0.9)" stroke="var(--brand-orange)" strokeWidth="5" />
              <circle cx="260" cy="228" r="16" fill="#0f172a" />
              <image
                href="/logos/ClubIQLogo.png"
                x="242"
                y="214"
                width="36"
                height="28"
                preserveAspectRatio="xMidYMid meet"
              />

              <circle cx="20" cy="70" r="6" fill="var(--club-primary)" />
              <circle cx="498" cy="62" r="6" fill="var(--club-secondary)" />
            </svg>

            <p className="absolute bottom-4 left-6 text-[12px] font-bold uppercase tracking-[0.12em] text-white/65">
              Número de Sócios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Part5Archaic() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <div>
        <h2 className="huge-title -mt-20 pl-28 text-[64px] leading-[1.05] text-white">
          Queda e Retorno
        </h2>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.02] p-6 backdrop-blur-md">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />

        <svg viewBox="0 0 1460 560" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="dropRise" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--club-primary)" />
              <stop offset="52%" stopColor="var(--brand-orange)" />
              <stop offset="100%" stopColor="var(--club-secondary)" />
            </linearGradient>
          </defs>
          <path
            d="M70 120 C240 170, 380 260, 560 320 C640 350, 700 362, 760 360"
            fill="none"
            stroke="url(#dropRise)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M760 360 C860 350, 940 305, 1030 240 C1140 165, 1260 115, 1390 88"
            fill="none"
            stroke="url(#dropRise)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 grid h-full grid-cols-12 grid-rows-6">
          <div className="col-span-3 col-start-1 row-start-2 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            Mecanismos Arcaicos
          </div>
          <div className="col-span-3 col-start-3 row-start-3 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            Imagem Débil
          </div>
          <div className="col-span-3 col-start-5 row-start-4 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            Comunicação Fraca
          </div>

          <div className="col-span-2 col-start-7 row-start-4 flex items-center self-center pt-5">
            <div className="flex items-center gap-3 rounded-full border border-[var(--brand-orange)]/50 bg-[#0f172a]/85 px-4 py-2">
              <Image src="/logos/ClubIQLogo.png" alt="ClubIQ" width={56} height={24} />
            </div>
          </div>

          <div className="col-span-4 col-start-8 row-start-4 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            BackOffice - Organização
          </div>
          <div className="z-20 col-span-4 col-start-9 row-start-3 mt-3 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            Website - Imagem
          </div>
          <div className="z-10 col-span-4 col-start-10 row-start-2 mt-2 h-fit w-fit justify-self-start rounded-2xl border border-white/12 bg-[#0f172a]/70 px-5 py-2 text-[20px] font-semibold text-white">
            App - Comunicação
          </div>
        </div>
      </div>
    </div>
  );
}

function Part5Limits() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-6">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] leading-[1.05] text-white">
        Crescimento sem bloqueios
      </h2>

      <div className="relative flex h-full items-center px-6">
        <div className="relative mx-auto h-[460px] w-[1460px]">
        <svg
          viewBox="0 0 1460 460"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <g stroke="rgba(255,255,255,0.45)" strokeWidth="4" fill="none" strokeLinecap="round">
            <path d="M170 230 H330" />
            <path d="M330 230 V120" />
            <path d="M330 230 V230" />
            <path d="M330 230 V340" />
            <path d="M330 120 H520" />
            <path d="M330 230 H520" />
            <path d="M330 340 H520" />

            <path d="M650 120 H760" />
            <path d="M760 120 V80" />
            <path d="M760 120 V160" />
            <path d="M760 80 H930" />
            <path d="M760 160 H930" />

            <path d="M650 230 H760" />
            <path d="M760 230 V230" />
            <path d="M760 230 H930" />

            <path d="M650 340 H760" />
            <path d="M760 340 V300" />
            <path d="M760 340 V380" />
            <path d="M760 300 H930" />
            <path d="M760 380 H930" />

            <path d="M1060 80 H1240" />
            <path d="M1060 160 H1240" />
            <path d="M1060 230 H1240" />
            <path d="M1060 300 H1240" />
            <path d="M1060 380 H1240" />
          </g>
        </svg>

        <div className="relative h-full w-full">
          <GrowthLeaf label="" className="" style={{ left: 20, top: 202 }} />

          <GrowthLeaf label="" className="" style={{ left: 410, top: 92 }} />
          <GrowthLeaf label="" className="" style={{ left: 410, top: 202 }} />
          <GrowthLeaf label="" className="" style={{ left: 410, top: 312 }} />

          <GrowthLeaf label="" className="" style={{ left: 820, top: 52 }} />
          <GrowthLeaf label="" className="" style={{ left: 820, top: 132 }} />
          <GrowthLeaf label="" className="" style={{ left: 820, top: 202 }} />
          <GrowthLeaf label="" className="" style={{ left: 820, top: 272 }} />
          <GrowthLeaf label="" className="" style={{ left: 820, top: 352 }} />

          <GrowthLeaf label="" className="" style={{ left: 1130, top: 52 }} />
          <GrowthLeaf label="" className="" style={{ left: 1130, top: 132 }} />
          <GrowthLeaf label="" className="" style={{ left: 1130, top: 202 }} />
          <GrowthLeaf label="" className="" style={{ left: 1130, top: 272 }} />
          <GrowthLeaf label="" className="" style={{ left: 1130, top: 352 }} />
        </div>
        </div>
      </div>
    </div>
  );
}

function GrowthLeaf({
  label,
  className,
  style,
}: {
  label: string;
  className: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`absolute h-[56px] w-[220px] rounded-2xl border border-white/16 bg-[#0f172a]/55 ${className}`}
    >
      {label ? (
        <span className="block px-4 py-2 text-[18px] font-semibold text-white">{label}</span>
      ) : null}
    </div>
  );
}

function SimpleStatement({
  title,
  text,
  variant = "default",
}: {
  title: string;
  text: string;
  variant?: "default" | "club-glass";
}) {
  const isClubGlass = variant === "club-glass";
  return (
    <div className="flex h-full items-center justify-center">
      <article
        className={`relative overflow-hidden rounded-[38px] ${
          isClubGlass
            ? "w-[95%] border border-white/14 bg-white/[0.02] p-10 backdrop-blur-xl"
            : "section-shell max-w-[1180px] p-12"
        }`}
      >
        {isClubGlass ? (
          <>
            <div className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[var(--club-primary)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-[var(--club-secondary)]/18 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01)_38%,rgba(255,255,255,0.04)_72%,rgba(255,255,255,0.01))]" />
          </>
        ) : null}
        <h2 className={`huge-title mt-2 text-[64px] text-white ${isClubGlass ? "text-center" : ""}`}>
          {title}
        </h2>
        <p
          className={`mt-6 text-[30px] font-semibold leading-[1.3] text-slate-200 ${
            isClubGlass ? "mx-auto max-w-[1320px] text-center" : ""
          }`}
        >
          {text}
        </p>
      </article>
    </div>
  );
}

function Part6Solutions({
  pathChoice,
  onChoose,
}: {
  pathChoice: PathChoice;
  onChoose: (choice: PathChoice) => void;
}) {
  return (
    <div className="grid h-full grid-cols-[0.95fr_1.05fr] gap-8">
      <div className="space-y-5">
        <h2 className="huge-title text-[58px] text-white">As nossas soluções</h2>
        <p className="text-[25px] font-semibold text-slate-200">
          BackOffice = Organização / Website = Imagem / App = Conexão.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <SolutionPathButton
          label="BackOffice"
          subtitle="Organização"
          active={pathChoice === "backoffice"}
          onClick={() => onChoose("backoffice")}
        />
        <SolutionPathButton
          label="Website"
          subtitle="Imagem"
          active={pathChoice === "website"}
          onClick={() => onChoose("website")}
        />
        <SolutionPathButton
          label="Aplicação Móvel"
          subtitle="Conexão"
          active={pathChoice === "mobile"}
          onClick={() => onChoose("mobile")}
        />
      </div>
    </div>
  );
}

function Part6SolutionsFolders({
  pathChoice,
  onChoose,
}: {
  pathChoice: PathChoice;
  onChoose: (choice: PathChoice) => void;
}) {
  const [hovered, setHovered] = useState<PathChoice>("backoffice");
  const activePreview = hovered ?? pathChoice ?? "backoffice";

  const previewMap: Record<Exclude<PathChoice, null>, { title: string; image: string }> = {
    backoffice: { title: "BackOffice", image: "/presentation/backoffice-preview.svg" },
    website: { title: "Website", image: "/presentation/website-preview.svg" },
    mobile: { title: "Aplicação Móvel", image: "/presentation/app-preview.svg" },
  };

  const tabs: Array<{ key: Exclude<PathChoice, null>; label: string; color: string }> = [
    { key: "backoffice", label: "BackOffice", color: "var(--club-primary)" },
    { key: "website", label: "Website", color: "var(--brand-orange)" },
    { key: "mobile", label: "Aplicação Móvel", color: "var(--club-secondary)" },
  ];

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">As nossas soluções</h2>

      <div className="relative overflow-hidden rounded-[30px] border border-white/14 bg-[#0f172a]/35 p-5">
        <div className="relative z-20 flex items-end gap-3">
          {tabs.map((tab, index) => {
            const isActive = activePreview === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onMouseEnter={() => setHovered(tab.key)}
                onFocus={() => setHovered(tab.key)}
                onMouseLeave={() => setHovered(pathChoice ?? "backoffice")}
                onClick={() => onChoose(tab.key)}
                className={`relative rounded-t-2xl border border-white/20 px-7 py-3 text-[24px] font-semibold transition ${
                  isActive ? "z-30 text-white" : "z-10 -mb-1 text-white/75 hover:text-white"
                }`}
                style={{
                  background: isActive ? `linear-gradient(180deg, ${tab.color}55, #0f172ae6)` : "#0f172ab3",
                  transform: isActive ? "translateY(0)" : `translateY(${6 + index * 2}px)`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative -mt-[1px] h-[430px] rounded-[26px] border border-white/18 bg-[#091120]/82 p-6">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative z-10 h-full">
            <p className="text-[14px] font-bold uppercase tracking-[0.14em] text-white/70">
              {previewMap[activePreview].title}
            </p>
            {activePreview === "backoffice" ? (
              <div className="mt-4 h-[360px] overflow-hidden rounded-2xl border border-white/16 bg-[#0b1528]">
                <BackOfficeProgrammedMock />
              </div>
            ) : (
              <div className="mt-4 h-[360px] overflow-hidden rounded-2xl border border-white/16 bg-[#0b1528]">
                <Image
                  src={previewMap[activePreview].image}
                  alt={previewMap[activePreview].title}
                  width={1200}
                  height={720}
                  className="h-full w-full object-cover transition duration-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Part6SolutionsFoldersV2({
  pathChoice,
  clubName,
  clubLogoSrc,
  onChoose,
}: {
  pathChoice: PathChoice;
  clubName: string;
  clubLogoSrc: string;
  onChoose: (choice: PathChoice) => void;
}) {
  const [hovered, setHovered] = useState<PathChoice>("backoffice");
  const activePreview = hovered ?? pathChoice ?? "backoffice";

  const tabs: Array<{ key: Exclude<PathChoice, null>; label: string; color: string }> = [
    { key: "backoffice", label: "BackOffice", color: "var(--club-primary)" },
    { key: "website", label: "Website", color: "var(--brand-orange)" },
    { key: "mobile", label: "Aplicação Móvel", color: "var(--club-secondary)" },
  ];

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">As nossas soluções</h2>

      <div className="relative h-full">
        <div className="relative z-20 flex items-end gap-3">
          {tabs.map((tab, index) => {
            const isActive = activePreview === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onMouseEnter={() => setHovered(tab.key)}
                onFocus={() => setHovered(tab.key)}
                onMouseLeave={() => setHovered(pathChoice ?? "backoffice")}
                onClick={() => onChoose(tab.key)}
                className={`relative rounded-t-2xl border border-white/20 px-7 py-3 text-[24px] font-semibold transition ${
                  isActive ? "z-30 text-white" : "z-10 -mb-1 text-white/75 hover:text-white"
                }`}
                style={{
                  background: isActive ? `linear-gradient(180deg, ${tab.color}55, #0f172ae6)` : "#0f172ab3",
                  transform: isActive ? "translateY(0)" : `translateY(${6 + index * 2}px)`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative -mt-[1px] h-[560px] overflow-hidden rounded-[26px] border border-white/18 bg-[#091120]/86">
          <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative z-10 h-full">
            {activePreview === "backoffice" ? (
              <BackOfficeFolderMockV2 clubName={clubName} />
            ) : activePreview === "website" ? (
              <WebsiteFolderMock clubName={clubName} clubLogoSrc={clubLogoSrc} />
            ) : (
              <MobileFolderMockV2 clubName={clubName} clubLogoSrc={clubLogoSrc} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackOfficeFolderMock({ clubName }: { clubName: string }) {
  return (
    <div className="flex h-full">
      <aside className="w-[220px] border-r border-white/10 bg-[#0d1a30] p-4">
        <div className="rounded-xl bg-[var(--brand-orange)]/18 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--brand-orange)]">
          {clubName} Office
        </div>
        <div className="mt-4 grid gap-2">
          {["Dashboard", "Sócios", "Pagamentos", "Eventos", "Relatórios"].map((item, idx) => (
            <div key={item} className={`rounded-lg px-3 py-2 text-[14px] font-semibold ${idx === 0 ? "bg-white/12 text-white" : "text-white/70"}`}>
              {item}
            </div>
          ))}
        </div>
      </aside>
      <section className="flex-1 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[22px] font-semibold text-white">Painel de gestão</p>
          <div className="rounded-full border border-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-white/75">Atualizado hoje</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MetricCard label="Sócios ativos" value="1.248" delta="+6.1%" />
          <MetricCard label="Pagamentos" value="€ 8.340" delta="+12.4%" />
          <MetricCard label="Pendentes" value="94" delta="-8.0%" />
        </div>
        <div className="mt-4 rounded-2xl border border-white/12 bg-[#0f1f38] p-4">
          <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-white/70">Últimos movimentos</p>
          <div className="mt-3 grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-2 text-[13px]">
            {["Nome", "Estado", "Valor"].map((h) => <p key={h} className="font-bold text-white/75">{h}</p>)}
            <p className="text-white/85">João Silva</p><p className="text-emerald-300">Pago</p><p className="text-white/85">25 €</p>
            <p className="text-white/85">Ana Costa</p><p className="text-amber-300">Pendente</p><p className="text-white/85">30 €</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function WebsiteFolderMock({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  return (
    <div className="h-full bg-[var(--brand-navy)]">
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/12 bg-[color:color-mix(in_oklab,var(--brand-navy)_82%,black)]">
        <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-[var(--club-primary)]/22 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-16 h-44 w-44 rounded-full bg-[var(--club-secondary)]/20 blur-3xl" />

        <header className="relative z-20 flex h-16 items-center justify-between border-b border-white/10 bg-black/45 px-6">
          <nav className="flex gap-7 text-[12px] font-bold uppercase tracking-[0.22em] text-white/75">
            <span className="text-white">Home</span>
            <span>História</span>
            <span>Jogos</span>
            <span>Agenda</span>
            <span>Modalidades</span>
          </nav>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src={clubLogoSrc} alt={clubName} width={56} height={56} className="h-14 w-14 object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/75">Contactos</span>
            <button className="rounded-full bg-[var(--club-secondary)] px-5 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--brand-navy)]">
              Faz-te Sócio
            </button>
          </div>
        </header>

        <section className="relative h-[122px] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/presentation/club-hero.svg')] bg-cover bg-center opacity-55" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
            <span className="h-1.5 w-14 rounded-full bg-white/35" />
            <span className="h-1.5 w-14 rounded-full bg-white/35" />
            <span className="h-1.5 w-14 rounded-full bg-white" />
          </div>
        </section>

        <section className="relative h-[calc(100%-186px)] bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.72))] px-6 pt-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_48%_34%,var(--club-primary),transparent_52%)] opacity-20" />
          <p className="relative z-10 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--club-secondary)]">
            Passado e Futuro
          </p>
          <h3 className="relative z-10 mt-1 text-center text-[52px] font-semibold italic leading-none text-white">
            PRÓXIMOS JOGOS.
          </h3>

          <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
            {[
              { state: "Vitória", score: "1 — 6", place: "Fora", comp: "Campeonato" },
              { state: "Derrota", score: "3 — 7", place: "Em Casa", comp: "Campeonato" },
              { state: "Agendado", score: "18:00", place: "Fora", comp: "Taça" },
            ].map((game, idx) => (
              <article
                key={idx}
                className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(160deg,rgba(0,0,0,0.6),color-mix(in_oklab,var(--club-primary)_52%,black))]"
              >
                <div className="px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/60">{game.comp}</p>
                  <p className="mt-2 text-[36px] font-semibold italic leading-none text-white/95">{game.state}</p>
                  <p className="mt-3 text-[44px] font-semibold italic leading-none text-white/92">{game.score}</p>
                </div>
                <div className="border-t border-white/10 bg-black/25 px-4 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--club-secondary)]">{game.place}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/80">Estádio</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MobileFolderMock({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  return (
    <div className="flex h-full items-center justify-center gap-8 bg-[#0b1528] p-4">
      <div className="h-[390px] w-[190px] rounded-[34px] border border-white/20 bg-[#0f1f38] p-3 shadow-[0_18px_34px_rgba(0,0,0,0.35)]">
        <div className="h-full rounded-[24px] bg-white p-4">
          <div className="flex items-center gap-2">
            <Image src={clubLogoSrc} alt={clubName} width={26} height={26} className="h-6 w-6 object-contain" />
            <p className="text-[13px] font-bold text-[#0f172a]">{clubName}</p>
          </div>
          <div className="mt-4 rounded-xl bg-[var(--club-primary)] px-3 py-2 text-[12px] font-bold text-white">Cartão de Sócio</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#f1f5f9] p-2 text-[11px] font-semibold text-[#0f172a]">Pagamentos</div>
            <div className="rounded-lg bg-[#f1f5f9] p-2 text-[11px] font-semibold text-[#0f172a]">Jogos</div>
            <div className="rounded-lg bg-[#f1f5f9] p-2 text-[11px] font-semibold text-[#0f172a]">Eventos</div>
            <div className="rounded-lg bg-[#f1f5f9] p-2 text-[11px] font-semibold text-[#0f172a]">Perfil</div>
          </div>
        </div>
      </div>
      <div className="max-w-[560px]">
        <p className="text-[42px] font-semibold leading-[1.06] text-white">Aplicação móvel personalizada para {clubName}</p>
        <p className="mt-4 text-[18px] font-medium text-slate-300">Comunicação direta, notificações e serviços do clube no bolso do sócio.</p>
      </div>
    </div>
  );
}

function MobileFolderMockV2({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#0b1528] p-2">
      <div className="absolute h-[620px] w-[322px] rotate-[16deg] rounded-[58px] border border-white/45 bg-[#d1d5db] p-[10px] shadow-[0_34px_60px_rgba(0,0,0,0.5)]">
        <div className="relative h-full rounded-[50px] border-[8px] border-black bg-[#f4f5f7] px-5 pt-12">
          <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-black/15" />

          <div className="flex flex-col items-center">
            <Image src={clubLogoSrc} alt={clubName} width={52} height={52} className="h-12 w-12 object-contain" />
            <p className="mt-2 text-[30px] font-semibold italic leading-none text-[#1f2937]">Junta-te à equipa</p>
            <p className="mt-2 text-[20px] font-medium text-[#9ca3af]">Cria a tua conta</p>
          </div>

          <div className="mt-4 space-y-3 text-[#1f2937]">
            <div>
              <p className="text-[10px] font-bold">Email <span className="text-[var(--club-primary)]">*</span></p>
              <div className="mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[9px] text-gray-400">Exemplo@gmail.com</div>
            </div>
            <div>
              <p className="text-[10px] font-bold">Palavra-passe <span className="text-[var(--club-primary)]">*</span></p>
              <div className="mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[9px] text-gray-400">Palavra-passe</div>
            </div>
            <div className="flex items-center gap-2 text-[8px] text-gray-500">
              <span className="h-3.5 w-3.5 rounded border border-gray-300" />
              <span>Concordo com os <strong className="text-gray-700">Termos e Condições</strong></span>
            </div>
            <div className="rounded-xl bg-[#2a2513] py-2 text-center text-[12px] font-semibold text-white">Criar Conta</div>
            <p className="pt-1 text-center text-[8px] text-gray-500">← Voltar ao Início de Sessão</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SolutionPathButton({
  label,
  subtitle,
  active,
  onClick,
}: {
  label: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[28px] border p-6 text-left transition ${
        active
          ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/20"
          : "glass-card-soft hover:border-white/30"
      }`}
    >
      <p className="text-[34px] font-semibold text-white">{label}</p>
      <p className="mt-2 text-[22px] font-semibold text-slate-200">{subtitle}</p>
    </button>
  );
}

function Part7BackOffice() {
  return (
    <OptionsPart
      title="Escolha o modelo de BackOffice"
      options={["Com pagamentos", "Sem pagamentos"]}
    />
  );
}

function BackOfficeProgrammedMock() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/14 bg-[#0a1323] shadow-[0_24px_60px_rgba(2,8,23,0.5)]">
      <div className="flex h-full">
        <aside className="w-[220px] border-r border-white/10 bg-[#0d1a30] p-4">
          <div className="rounded-xl bg-[var(--brand-orange)]/18 px-3 py-2 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--brand-orange)]">
            ClubIQ Office
          </div>
          <div className="mt-4 grid gap-2">
            {["Dashboard", "Sócios", "Pagamentos", "Eventos", "Relatórios"].map((item, idx) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-[14px] font-semibold ${
                  idx === 0 ? "bg-white/12 text-white" : "text-white/70"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[22px] font-semibold text-white">Painel de gestão</p>
            <div className="rounded-full border border-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-white/75">
              Atualizado hoje
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MetricCard label="Sócios ativos" value="1.248" delta="+6.1%" />
            <MetricCard label="Pagamentos" value="€ 8.340" delta="+12.4%" />
            <MetricCard label="Pendentes" value="94" delta="-8.0%" />
          </div>

          <div className="mt-4 grid grid-cols-[1fr_0.95fr] gap-3">
            <div className="rounded-2xl border border-white/12 bg-[#0f1f38] p-4">
              <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-white/70">
                Evolução de quotas
              </p>
              <div className="mt-3 h-[128px] rounded-xl bg-[linear-gradient(180deg,rgba(242,116,39,0.22),rgba(34,197,94,0.08))]" />
            </div>
            <div className="rounded-2xl border border-white/12 bg-[#0f1f38] p-4">
              <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-white/70">
                Ações rápidas
              </p>
              <div className="mt-3 grid gap-2">
                {["Criar sócio", "Enviar cobrança", "Exportar relatório"].map((action) => (
                  <div key={action} className="rounded-lg bg-white/8 px-3 py-2 text-[13px] font-semibold text-white">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/12 bg-[#0f1f38] p-4">
            <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-white/70">
              Últimos movimentos
            </p>
            <div className="mt-3 grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-2 text-[13px]">
              {["Nome", "Estado", "Valor"].map((head) => (
                <p key={head} className="font-bold text-white/75">
                  {head}
                </p>
              ))}
              <p className="text-white/85">João Silva</p>
              <p className="text-emerald-300">Pago</p>
              <p className="text-white/85">25 €</p>
              <p className="text-white/85">Ana Costa</p>
              <p className="text-amber-300">Pendente</p>
              <p className="text-white/85">30 €</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-[#0f1f38] p-4">
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/60">{label}</p>
      <p className="mt-2 text-[28px] font-semibold text-white">{value}</p>
      <p className="mt-1 text-[13px] font-semibold text-[var(--club-secondary)]">{delta}</p>
    </div>
  );
}

function BackOfficeFolderMockV2({ clubName }: { clubName: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#0f1218]">
      <header className="h-12 border-b border-white/10 bg-[var(--club-primary)] px-4">
        <div className="flex h-full items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-[18px]">☰</span>
            <p className="text-[24px] font-bold leading-none">{clubName}</p>
            <p className="text-[16px] font-semibold opacity-90">Demonstração</p>
          </div>
          <div className="flex items-center gap-5 text-[15px] opacity-95">
            <span>?</span>
            <span>⚙</span>
            <span>●</span>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100%-48px)]">
        <aside className="w-[180px] border-r border-white/10 bg-[#1c1f24] py-3">
          {["Dashboard", "Sócios", "Pagamentos", "Gestão Desportiva", "Eventos", "App", "Administração"].map((item, idx) => (
            <div
              key={item}
              className={`flex items-center gap-3 px-4 py-3 text-[20px] font-semibold ${
                item === "Eventos" ? "bg-[#262d33] text-white" : "text-white/88"
              }`}
            >
              <span className="text-[16px] opacity-90">{["▦", "👥", "▭", "⛶", "🗓", "▦", "⬢"][idx]}</span>
              <span>{item}</span>
            </div>
          ))}
          <div className="mt-auto px-4 pt-4">
            <div className="rounded-2xl bg-white px-4 py-3 text-center text-[34px] font-black text-[#0f172a]">
              Club<span className="text-[var(--brand-orange)]">IQ</span>
            </div>
          </div>
        </aside>

        <section className="flex-1 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-bold text-white/95">
            {[
              ["Todos", "#6c8ea6"],
              ["Jogo", "#3b82f6"],
              ["Treino", "#10b981"],
              ["Reunião", "#f59e0b"],
              ["Evento Social", "#8b5cf6"],
              ["Outro", "#ec4899"],
            ].map(([label, color]) => (
              <div key={label} className="rounded-full border px-3 py-1" style={{ borderColor: `${color}70`, color }}>
                {label} <span className="text-white/85">3</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[40px] font-semibold text-white">maio 2026</p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-[14px] font-semibold text-white">Vista Mensal</button>
              <button className="rounded-lg border border-white/20 px-3 py-1 text-[14px] font-semibold text-white/85">Vista Semanal</button>
              <button className="rounded-lg border border-white/20 px-3 py-1 text-[14px] font-semibold text-white/85">Filtros</button>
              <button className="rounded-lg bg-[#6f8ea1] px-3 py-1 text-[14px] font-semibold text-white">Criar Novo Evento</button>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-[#23252b] p-3">
            <div className="grid grid-cols-7 gap-2 text-center text-[22px] font-semibold text-white/70">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((d) => <p key={d}>{d}</p>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-[74px] rounded-md border border-white/10 bg-[#202227] p-1 text-[14px] text-white/80">
                  <p className="font-bold">{(i % 31) + 1}</p>
                  {i === 10 ? <div className="mt-1 rounded bg-[#10b981] px-1 text-[10px] font-bold text-white">09:00 Bobm</div> : null}
                  {i === 13 ? <div className="mt-1 rounded bg-[#3b82f6] px-1 text-[10px] font-bold text-white">09:00 GRF Murches</div> : null}
                  {i === 14 ? <div className="mt-1 rounded bg-[#f59e0b] px-1 text-[10px] font-bold text-white">09:00 test</div> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Part8Website() {
  return (
    <OptionsPart
      title="Escolha o modelo de Website"
      options={["Com BackOffice", "Sem BackOffice"]}
    />
  );
}

function Part9Mobile() {
  return (
    <OptionsPart
      title="Escolha o modelo de App"
      options={["Com website", "Sem website"]}
    />
  );
}

function OptionsPart({
  title,
  options,
}: {
  title: string;
  options: string[];
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <article className="section-shell w-full max-w-[1160px] rounded-[36px] p-10">
        <h2 className="huge-title mt-1 text-[56px] text-white">{title}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {options.map((option) => (
            <div key={option} className="glass-card-soft rounded-[26px] p-6">
              <p className="text-[28px] font-semibold text-white">{option}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
