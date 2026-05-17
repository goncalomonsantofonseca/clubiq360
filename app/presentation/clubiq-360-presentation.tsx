"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

type MobileFeatureKey =
  | "payment-demo"
  | "closed-office"
  | "quota-notifications"
  | "retention-calculator"
  | "mobile-commerce-gap"
  | "partner-scan"
  | "sponsor-showcase"
  | "sponsor-data"
  | "oeiras-results"
  | "final-benefits";

interface MobileAppSlide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  feature: MobileFeatureKey;
}

const mobileAppSlides: MobileAppSlide[] = [
  { id: "parte-9-1", eyebrow: "A Solução", title: "Reduzimos o atrito administrativo em 99%", body: "", feature: "payment-demo" },
  { id: "parte-9-2", eyebrow: "A Solução", title: "Reduzimos o atrito administrativo em 99%", body: "", feature: "closed-office" },
  { id: "parte-9-3", eyebrow: "A Solução", title: "Se não há entraves aos pagamentos, o clube não perde quotas", body: "", feature: "quota-notifications" },
  { id: "parte-9-4", eyebrow: "Retorno do Investimento", title: "Sabia que ao reduzir a desistência de sócios de 25% para 5% está a poupar 9.600€ por ano?", body: "", feature: "retention-calculator" },
  { id: "parte-9-5", eyebrow: "", title: "", body: "", feature: "mobile-commerce-gap" },
  { id: "parte-9-6", eyebrow: "A quota paga-se a si própria", title: "Transformação da quota numa decisão financeira inteligente", body: "", feature: "partner-scan" },
  { id: "parte-9-7", eyebrow: "Montra diária", title: "A app cria uma nova montra de exposição no clube para patrocinadores", body: "", feature: "sponsor-showcase" },
  { id: "parte-9-8", eyebrow: "Dados reais", title: "Com dados reais, o patrocinador deixa de comprar visibilidade e passa a comprar resultado", body: "", feature: "sponsor-data" },
  { id: "parte-9-9", eyebrow: "Caso Real", title: "A experiência com a AD Oeiras", body: "", feature: "oeiras-results" },
  { id: "parte-9-10", eyebrow: "Calculadora Final", title: "Calculadora final de benefícios", body: "", feature: "final-benefits" },
];

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
  const mainContentRef = useRef<HTMLElement | null>(null);
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
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

    if (delta === 1 && resolvedSlideId === "parte-4b") {
      if (!isGraphExpanded) {
        setIsGraphExpanded(true);
        return;
      }

      if (slideIds.includes("parte-5b")) {
        setCurrentSlideId("parte-5b");
        return;
      }
    }

    if (delta === -1 && resolvedSlideId === "parte-4b" && isGraphExpanded) {
      setIsGraphExpanded(false);
      return;
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
  }, [activeMoment, currentIndex, isGraphExpanded, resolvedSlideId, slideIds]);

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
          <main
            ref={mainContentRef}
            className="h-full px-16 pb-14 pt-32"
          >
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
            {currentSlide.id === "parte-4b" ? (
              isGraphExpanded ? <Part5Archaic /> : <Part4Decline isExpanded={isGraphExpanded} />
            ) : null}
            {currentSlide.id === "parte-5b" ? <Part5Limits /> : null}
            {currentSlide.id === "parte-6" ? (
              <Part6SolutionsFoldersV2
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
                    setCurrentSlideId("parte-9-1");
                  }
                }}
              />
            ) : null}
            {currentSlide.id === "parte-7" ? <Part7BackOffice /> : null}
            {currentSlide.id === "parte-7b" ? <Part7BackOfficeModel /> : null}
            {currentSlide.id === "parte-8" ? <Part8Website /> : null}
            {currentSlide.id === "parte-8b" ? <Part8WebsiteModel /> : null}
            {currentSlide.id.startsWith("parte-9-") ? (
              <Part9MobileDeck
                slide={mobileAppSlides.find((item) => item.id === currentSlide.id) ?? mobileAppSlides[0]}
                clubName={config.clubConfig.shortName}
                clubLogoSrc={config.clubConfig.logoSrc}
              />
            ) : null}
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
    { id: "parte-5b", label: "Parte 5.2" },
    { id: "parte-6", label: "Parte 6" },
  ];

  if (pathChoice === "backoffice") {
    return [...base, { id: "parte-7", label: "Parte 7" }, { id: "parte-7b", label: "Parte 7.2" }];
  }

  if (pathChoice === "website") {
    return [...base, { id: "parte-8", label: "Parte 8" }, { id: "parte-8b", label: "Parte 8.2" }];
  }

  if (pathChoice === "mobile") {
    return [
      ...base,
      ...mobileAppSlides.map((slide, index) => ({
        id: slide.id,
        label: `Parte 9.${index + 1}`,
      })),
    ];
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
        <h2 className="huge-title -mt-20 pl-28 text-[58px] whitespace-nowrap text-white">A StartUp</h2>
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

function Part4Decline({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="flex h-full items-center">
      <div className="grid w-full grid-cols-[1.2fr_0.8fr] items-center gap-8">
        <div className="relative flex h-full items-center p-2">
          <h2 className="huge-title text-[56px] leading-[1.08] text-white">
            O clube não está a perder pessoas, está a perder a ligação com elas.
          </h2>
        </div>

        <div className={`relative flex h-full items-center justify-center ${isExpanded ? "mt-2" : ""}`}>
          <div className={`relative rounded-[28px] border border-white/14 bg-white/[0.02] p-6 backdrop-blur-md ${isExpanded ? "h-[620px] w-[1320px]" : "h-[360px] w-[520px]"}`}>
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
    <div className="grid h-full grid-rows-[auto_1fr] gap-6">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">Queda e Retorno</h2>

      <div className="relative h-full">
      <div className="relative h-full overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.02] p-6 backdrop-blur-md">
        <div className="part5-graph-stage">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:56px_56px]" />

          <svg viewBox="0 0 520 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id="dropRise" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--club-primary)" />
              <stop offset="52%" stopColor="var(--brand-orange)" />
              <stop offset="100%" stopColor="var(--club-secondary)" />
            </linearGradient>
          </defs>
          <path
            d="M20 70 C95 95, 140 170, 205 208 C228 223, 246 228, 260 228"
            fill="none"
            stroke="url(#dropRise)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M260 228 C300 224, 338 188, 372 150 C410 108, 450 78, 498 62"
            fill="none"
            stroke="url(#dropRise)"
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
  clubName,
  clubLogoSrc,
  onChoose,
}: {
  clubName: string;
  clubLogoSrc: string;
  onChoose: (choice: PathChoice) => void;
}) {
  const rotationOrder: Exclude<PathChoice, null>[] = ["backoffice", "website", "mobile"];
  const [autoIndex, setAutoIndex] = useState(0);
  const [hovered, setHovered] = useState<PathChoice>(null);
  const autoPreview = rotationOrder[autoIndex] ?? "backoffice";
  const activePreview = hovered ?? autoPreview;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % rotationOrder.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

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
                onMouseLeave={() => setHovered(null)}
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

        <button
          type="button"
          onClick={() => onChoose(activePreview)}
          className="absolute bottom-4 left-4 z-30 rounded-full px-7 py-3 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(120deg,var(--club-primary),var(--club-secondary))",
          }}
        >
          Ver mais
        </button>
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
  return <RouteIntro title="BackOffice" subtitle="Organização e controlo operacional do clube." />;
}

function Part7BackOfficeModel() {
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
  return <RouteIntro title="Website" subtitle="Imagem moderna e comunicação institucional." />;
}

function Part8WebsiteModel() {
  return (
    <OptionsPart
      title="Escolha o modelo de Website"
      options={["Com BackOffice", "Sem BackOffice"]}
    />
  );
}

function Part9Mobile({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">Aplicação Móvel</h2>
      <div className="grid h-full grid-cols-[1.05fr_0.95fr] items-center gap-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--club-secondary)]/90">
            A Solução
          </p>
          <h3 className="mt-3 text-[64px] font-semibold leading-[1.02] text-white">
            Reduzimos o atrito administrativo em 99%
          </h3>
          <p className="mt-5 max-w-[760px] text-[26px] font-semibold leading-[1.24] text-slate-200">
            O utilizador torna-se sócio ou renova as quotas no seu primeiro impulso.
          </p>
          <p className="mt-5 max-w-[760px] text-[18px] font-semibold leading-[1.3] text-slate-300">
            Fluxo completo de quota replicado da app real: decisão, checkout, MB WAY e cartão ativo em segundos.
          </p>
        </div>
        <div className="relative h-[430px] rounded-[30px]">
          <PaymentQuotaQuickDemo clubName={clubName} clubLogoSrc={clubLogoSrc} />
        </div>
      </div>
    </div>
  );
}

function Part9MobileContinuation() {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">Aplicação Móvel</h2>
      <div className="grid h-full grid-cols-[1.05fr_0.95fr] items-center gap-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--club-secondary)]/90">
            A Solução
          </p>
          <h3 className="mt-3 text-[58px] font-semibold leading-[1.03] text-white">
            Se não há entraves aos pagamentos, o clube não perde quotas
          </h3>
          <p className="mt-5 max-w-[760px] text-[23px] font-semibold leading-[1.28] text-slate-200">
            60% dos pagamentos acontecem quando a secretaria física está fechada.
          </p>
          <div className="mt-6 grid max-w-[760px] grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/14 bg-white/[0.04] p-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--club-secondary)]">
                Para o Sócio
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.35] text-slate-200">
                Regulariza quotas fora de horas, sem chamadas ou deslocações.
              </p>
            </div>
            <div className="rounded-xl border border-white/14 bg-white/[0.04] p-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--club-secondary)]">
                Para o Clube
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.35] text-slate-200">
                Menos burocracia e maior previsibilidade de receita recorrente.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[30px] border border-white/14 bg-[#0b1528] p-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#0f172a] p-4 text-center">
              <p className="text-[36px] font-semibold text-[var(--club-secondary)]">22h</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">Pico</p>
            </div>
            <div className="rounded-xl bg-[#0f172a] p-4 text-center">
              <p className="text-[36px] font-semibold text-[var(--club-secondary)]">23h</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">2º Pico</p>
            </div>
            <div className="rounded-xl bg-white/95 p-4 text-center">
              <p className="text-[36px] font-semibold text-[#0f172a]">00h</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#334155]">Quotas</p>
            </div>
          </div>
          <p className="mt-5 text-[16px] font-semibold text-slate-300">
            A receita continua a entrar fora de horas.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentQuotaQuickDemoLegacy({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  const steps = [
    "home",
    "plans",
    "summary",
    "checkout",
    "mbway",
    "success",
  ] as const;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 1400);
    return () => window.clearInterval(t);
  }, []);

  const step = steps[index];

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden p-4">
      <div className="absolute left-6 top-6 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-[13px] font-bold text-emerald-300">
        Tempo médio de pagamento: <span className="text-white">&lt; 20s</span>
      </div>

      <div className="h-[410px] w-[220px] rounded-[36px] border border-white/28 bg-[#d1d5db] p-[9px] shadow-[0_24px_46px_rgba(0,0,0,0.45)]">
        <div className="relative h-full rounded-[28px] border-[7px] border-black bg-[#f4f5f7] px-4 pt-11">
          <div className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />

          {step === "home" ? (
            <div className="text-center">
              <Image src={clubLogoSrc} alt={clubName} width={46} height={46} className="mx-auto h-11 w-11 object-contain" />
              <p className="mt-2 text-[23px] font-semibold italic text-[#1f2937]">Junta-te à equipa</p>
              <p className="text-[13px] text-gray-400">Cria a tua conta</p>
              <button className="mt-6 w-full rounded-xl bg-[var(--club-primary)] py-2 text-[12px] font-bold text-white">
                Iniciar pagamento
              </button>
            </div>
          ) : null}

          {step === "plans" ? (
            <div>
              <p className="text-[12px] font-bold text-[#0f172a]">Tipo de Pagamento</p>
              <div className="mt-3 space-y-2">
                {["1 Mês 2,50€", "3 Meses 7,50€", "6 Meses 15,00€", "1 Ano 30,00€"].map((p, i) => (
                  <div key={p} className={`rounded-lg border px-2 py-1 text-[10px] ${i === 2 ? "border-[var(--club-primary)] bg-[var(--club-primary)]/10 text-[#0f172a]" : "border-gray-200 bg-white text-gray-500"}`}>
                    {p}
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl bg-[#1f2937] py-2 text-[11px] font-bold text-white">Continuar</button>
            </div>
          ) : null}

          {step === "summary" ? (
            <div>
              <p className="text-[12px] font-bold text-[#0f172a]">Resumo do pagamento</p>
              <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2 text-[10px] text-[#334155]">
                <div className="flex justify-between"><span>6 Meses</span><span>15,00€</span></div>
                <div className="mt-1 flex justify-between"><span>Jóia</span><span>5,00€</span></div>
                <div className="mt-2 flex justify-between font-bold text-[#0f172a]"><span>Total</span><span>20,00€</span></div>
              </div>
              <button className="mt-4 w-full rounded-xl bg-[#1f2937] py-2 text-[11px] font-bold text-white">Confirmar pagamento</button>
            </div>
          ) : null}

          {step === "checkout" ? (
            <div>
              <p className="text-[12px] font-bold text-[#0f172a]">Checkout</p>
              <div className="mt-3 grid grid-cols-3 gap-1 text-[9px]">
                <span className="rounded bg-white px-1 py-1 text-center">VISA</span>
                <span className="rounded bg-[var(--club-primary)] px-1 py-1 text-center font-bold text-white">MB WAY</span>
                <span className="rounded bg-white px-1 py-1 text-center">MB</span>
              </div>
              <button className="mt-4 w-full rounded-xl bg-[#1f2937] py-2 text-[11px] font-bold text-white">Confirmar telemóvel</button>
            </div>
          ) : null}

          {step === "mbway" ? (
            <div className="text-center">
              <div className="mx-auto h-11 w-11 rounded-full bg-[var(--club-primary)]/12 text-[12px] font-bold leading-[44px] text-[var(--club-primary)]">MB</div>
              <p className="mt-3 text-[11px] font-semibold text-[#0f172a]">Aguardando confirmação MB WAY</p>
              <p className="mt-1 text-[9px] text-gray-500">Expira em 03:48</p>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="text-center">
              <div className="mx-auto h-11 w-11 rounded-full bg-emerald-500 text-[26px] leading-[44px] text-white">✓</div>
              <p className="mt-3 text-[12px] font-bold text-[#0f172a]">Quota regularizada com sucesso</p>
              <p className="mt-1 text-[9px] text-gray-500">Cartão de sócio ativado</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PaymentQuotaQuickDemo({
  clubName,
  clubLogoSrc,
}: {
  clubName: string;
  clubLogoSrc: string;
}) {
  const paymentFlowDurations = [1600, 2200, 1500, 1600, 1400, 1200, 1600, 1800, 1600, 1800, 1800];
  const [paymentStep, setPaymentStep] = useState(0);
  const [isRunningPayment, setIsRunningPayment] = useState(false);
  const [paymentElapsedMs, setPaymentElapsedMs] = useState(0);
  const [isPaymentFinished, setIsPaymentFinished] = useState(false);
  const [showPaymentResultOverlay, setShowPaymentResultOverlay] = useState(false);
  const [activePaymentPress, setActivePaymentPress] = useState("");
  const timersRef = useRef<number[]>([]);
  const paymentIntervalRef = useRef<number | null>(null);

  const formatPaymentTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}s`;
  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };
  const queue = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  };
  const resetPaymentDemo = () => {
    if (paymentIntervalRef.current) {
      window.clearInterval(paymentIntervalRef.current);
      paymentIntervalRef.current = null;
    }
    setPaymentStep(0);
    setIsRunningPayment(false);
    setPaymentElapsedMs(0);
    setIsPaymentFinished(false);
    setShowPaymentResultOverlay(false);
    setActivePaymentPress("");
  };
  const pulsePaymentPress = (name: string, delay: number, duration = 220) => {
    queue(() => setActivePaymentPress(name), delay);
    queue(() => setActivePaymentPress((current) => (current === name ? "" : current)), delay + duration);
  };
  const startPaymentDemo = () => {
    if (isRunningPayment) return;
    clearTimers();
    resetPaymentDemo();
    setShowPaymentResultOverlay(false);
    setIsRunningPayment(true);
    const startedAt = Date.now();
    paymentIntervalRef.current = window.setInterval(() => {
      setPaymentElapsedMs(Date.now() - startedAt);
    }, 100);

    let cumulativeDelay = 0;
    pulsePaymentPress("start", 1150);
    paymentFlowDurations.forEach((duration, index) => {
      cumulativeDelay += duration;
      queue(() => setPaymentStep(index + 1), cumulativeDelay);
    });

    pulsePaymentPress("plan-6", 3100);
    pulsePaymentPress("plan-continue", 4700);
    pulsePaymentPress("confirm-payment", 6200);
    pulsePaymentPress("checkout-continue", 7700);
    pulsePaymentPress("select-mbway", 9000);
    pulsePaymentPress("confirm-phone", 11800);
    pulsePaymentPress("mbway-pay", 15100, 320);

    queue(() => {
      if (paymentIntervalRef.current) {
        window.clearInterval(paymentIntervalRef.current);
        paymentIntervalRef.current = null;
      }
      setPaymentElapsedMs(Date.now() - startedAt);
      setIsRunningPayment(false);
      setIsPaymentFinished(true);
      setShowPaymentResultOverlay(true);
    }, cumulativeDelay + 200);

    queue(() => setShowPaymentResultOverlay(false), cumulativeDelay + 6500);
  };

  useEffect(() => {
    return () => {
      clearTimers();
      if (paymentIntervalRef.current) window.clearInterval(paymentIntervalRef.current);
    };
  }, []);

  return (
    <div className="clubiq-payment-exact relative h-full w-full p-4">
      <div
        className="hero-phone h-full cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          startPaymentDemo();
        }}
      >
        <div className="phone-showcase">
          <div className="phone-stage">
            <div className="phone-shadow" aria-hidden="true" />
            <div className={`phone-shell payment-shell ${isRunningPayment ? "phone-shell-animating" : ""}`}>
              <div className="phone-metal" />
              <div className="phone-screen payment-screen">
                <div className="phone-notch" />
                <div className="status-bar payment-status-bar"><span>10:29</span><span>5G</span></div>
                <div className={`payment-app payment-step-${paymentStep}`}>
                  <div className="payment-topbar"><span className="payment-back">&larr;</span><strong>{paymentStep <= 3 ? "Quotas" : "Checkout"}</strong><span /></div>
                  {paymentStep === 0 ? (
                    <div className="payment-home">
                      <div className="payment-brand-row"><Image src={clubLogoSrc} alt={clubName} width={24} height={24} /><span>{clubName}</span></div>
                      <h3>João Silva</h3>
                      <div className="payment-member-card"><div className="payment-member-overlay"><Image src={clubLogoSrc} alt={clubName} width={34} height={34} /><strong>Exclusivo Sócios</strong></div></div>
                      <div className="payment-callout"><p>Está quase lá! Paga a primeira quota para ativares o teu cartão de sócio.</p><button type="button" className={`payment-primary ${activePaymentPress === "start" ? "is-pressed" : ""}`} onClick={startPaymentDemo}>Iniciar pagamento</button></div>
                    </div>
                  ) : null}
                  {paymentStep >= 1 && paymentStep <= 2 ? (
                    <div className="payment-plan-screen">
                      <h3>Tipo de Pagamento</h3><p>Escolha como pretende pagar a sua quota</p>
                      <div className="plan-card"><div className="plan-card-head"><strong>Pagamento Único</strong></div><div className="plan-scroll-area"><div className="plan-option">1 Mês <span>2.50€</span></div><div className="plan-option">3 Meses <span>7.50€</span></div><div className={`plan-option ${paymentStep === 2 ? "plan-option-selected" : ""} ${activePaymentPress === "plan-6" ? "is-pressed" : ""}`}>6 Meses <span>15.00€</span></div><div className="plan-option">1 Ano <span>30.00€</span></div></div></div>
                      <button type="button" className={`payment-primary payment-fixed-button ${activePaymentPress === "plan-continue" ? "is-pressed" : ""}`}>Continuar</button>
                    </div>
                  ) : null}
                  {paymentStep === 3 ? (
                    <div className="payment-confirm-screen">
                      <div className="payment-summary-card"><strong>Resumo do pagamento</strong><div className="summary-row"><span>6 Meses</span><span>15.00€</span></div><div className="summary-row"><span>Pagamento único</span><span>5.00€ Jóia</span></div><div className="summary-row summary-total"><span>Total</span><span>20.00€</span></div></div>
                      <div className="payment-footer-actions"><button type="button" className="payment-secondary">Cancelar</button><button type="button" className={`payment-primary ${activePaymentPress === "confirm-payment" ? "is-pressed" : ""}`}>Confirmar pagamento</button></div>
                    </div>
                  ) : null}
                  {paymentStep >= 4 && paymentStep <= 8 ? (
                    <div className="payment-checkout-screen">
                      <div className="checkout-brand"><Image src={clubLogoSrc} alt={clubName} width={20} height={20} /><div className="checkout-cart">20,00 €</div></div>
                      <div className="checkout-steps"><span className={paymentStep >= 4 ? "is-done" : ""}>1</span><span className={paymentStep >= 6 ? "is-done" : ""}>2</span></div>
                      {paymentStep === 4 ? <div className="checkout-form"><input value="João Silva" readOnly /><input value="joao.silva@oclube.pt" readOnly /><input value="+351 925 312 513" readOnly /><button type="button" className={`payment-primary ${activePaymentPress === "checkout-continue" ? "is-pressed" : ""}`}>Continuar</button></div> : null}
                      {paymentStep === 5 || paymentStep === 6 ? <div className="checkout-methods"><h4>Escolha como pagar</h4><div className="method-grid"><span>VISA</span><span className={`${paymentStep === 6 ? "is-selected" : ""} ${activePaymentPress === "select-mbway" ? "is-pressed" : ""}`}>MB WAY</span><span>MULTIBANCO</span></div></div> : null}
                      {paymentStep === 7 ? <div className="checkout-form"><h4>Confirme o telemóvel</h4><input value="+351 925 312 513" readOnly /><button type="button" className={`payment-primary ${activePaymentPress === "confirm-phone" ? "is-pressed" : ""}`}>Confirmar</button></div> : null}
                      {paymentStep === 8 ? <div className="checkout-processing"><div className="payment-notification-banner"><span className="payment-notification-icon">MB</span><div className="payment-notification-copy"><strong>Pagamento</strong><span>Pagamento Pendente.</span></div></div><h4>O seu pagamento está a ser processado</h4><p>Por favor aceite o pedido MB Way no seu telemóvel para concluir o pagamento.</p><div className="processing-spinner" /><span>Expira em 5 minutos</span></div> : null}
                    </div>
                  ) : null}
                  {paymentStep === 9 || paymentStep === 10 ? (
                    <div className="mbway-screen">
                      <div className="mbway-notification-open">Notificação MB WAY aberta</div><div className="mbway-card"><span className="mbway-card-icon">MB</span><strong>20 €</strong><span>EASYPAY</span><small>Quota de 6 meses</small></div><div className="mbway-expiry"><span>Expira em</span><div className="mbway-circle">03:48</div></div>
                      <div className="mbway-actions"><button type="button" className="mbway-decline">Recusar</button><button type="button" className={`mbway-pay ${paymentStep === 10 ? "is-processing" : ""} ${activePaymentPress === "mbway-pay" ? "is-pressed" : ""}`}>{paymentStep === 10 ? "A pagar..." : "Pagar"}</button></div>
                      {paymentStep === 10 ? <div className="mbway-processing-bar" /> : null}
                    </div>
                  ) : null}
                  {paymentStep === 11 ? (
                    <div className="payment-home payment-final-card-screen">
                      <div className="payment-brand-row"><Image src={clubLogoSrc} alt={clubName} width={24} height={24} /><span>{clubName}</span></div>
                      <h3>João Silva</h3>
                      <div className="final-member-card"><div className="final-member-card-header"><div><strong>{clubName}</strong><span>#{clubName.toUpperCase().replace(/\s+/g, "")}</span></div><Image src={clubLogoSrc} alt={clubName} width={34} height={34} /></div><div className="final-member-card-body"><div className="final-member-avatar" aria-hidden="true">JS</div><div className="final-member-qr"><span /></div></div><div className="final-member-details"><span>SÓCIO N.º 7</span><strong>João Silva</strong><small>Válido até 04/27</small></div><div className="final-member-footer"><span>Membro desde</span><strong>26/01/2026</strong></div></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`payment-result-overlay ${showPaymentResultOverlay ? "is-visible" : ""}`} aria-hidden={!showPaymentResultOverlay}>
        <div className="payment-overlay-toast">Quotas de Sócio atualizadas com sucesso</div>
        <div className="payment-overlay-time"><span>Tempo de pagamento de uma quota:</span><strong>{formatPaymentTime(paymentElapsedMs)}</strong></div>
      </div>
    </div>
  );
}

function Part9MobileDeck({
  slide,
  clubName,
  clubLogoSrc,
}: {
  slide: MobileAppSlide;
  clubName: string;
  clubLogoSrc: string;
}) {
  const isClosedOfficeSlide = slide.feature === "closed-office";
  const isCommerceSlide = slide.feature === "mobile-commerce-gap";
  const isShowcaseSlide = slide.feature === "sponsor-showcase";
  const isOeirasSlide = slide.feature === "oeiras-results";
  const isSponsorDataSlide = slide.feature === "sponsor-data";
  const isFinalBenefitsSlide = slide.feature === "final-benefits";
  const resolvedTitle =
    slide.feature === "intro"
      ? `Universo Digital do ${clubName}`
      : slide.title;

  if (isFinalBenefitsSlide) {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] gap-8">
        <h2 className="huge-title -mt-20 text-center text-[58px] text-white">
          CALCULADORA FINAL DE BENEFÍCIOS
        </h2>
        <div className="relative h-full">
          <MobileFeatureVisual feature={slide.feature} clubName={clubName} clubLogoSrc={clubLogoSrc} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">Aplicação Móvel</h2>
      <div
        className={`grid h-full gap-8 ${
          isClosedOfficeSlide
            ? "grid-rows-[auto_1fr]"
            : isCommerceSlide || isShowcaseSlide || isOeirasSlide
              ? "grid-cols-1 items-center"
              : isSponsorDataSlide
                ? "grid-cols-[1.05fr_0.95fr] items-center"
                : "grid-cols-[1.05fr_0.95fr] items-center"
        }`}
      >
        {!isCommerceSlide && !isShowcaseSlide && !isOeirasSlide ? (
        <div>
          {slide.eyebrow ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--club-secondary)]/90">
              {slide.eyebrow}
            </p>
          ) : null}
          {resolvedTitle ? (
            <h3
              className={`mt-3 font-semibold uppercase tracking-[-0.02em] text-white ${
                slide.feature === "payment-demo"
                  ? "text-[78px] leading-[1]"
                  : "text-[68px] leading-[1.02]"
              }`}
            >
              {resolvedTitle}
            </h3>
          ) : null}
          {slide.body ? (
            <p className="mt-5 max-w-[760px] text-[22px] font-semibold leading-[1.28] text-slate-200">
              {slide.body}
            </p>
          ) : null}
        </div>
        ) : null}
        {isClosedOfficeSlide ? (
          <div className="relative h-full">
            <MobileFeatureVisual feature={slide.feature} clubName={clubName} clubLogoSrc={clubLogoSrc} />
          </div>
        ) : isCommerceSlide || isShowcaseSlide || isOeirasSlide ? (
          <div className="relative h-full">
            <MobileFeatureVisual feature={slide.feature} clubName={clubName} clubLogoSrc={clubLogoSrc} />
          </div>
        ) : (
          <div
            className={`relative rounded-[30px] ${
              slide.feature === "payment-demo" ? "h-[660px]" : "h-[430px]"
            } ${slide.feature === "payment-demo" ? "app-payment-boost" : ""} ${
              slide.feature === "retention-calculator" ? "flex items-center" : ""
            } ${slide.feature === "sponsor-data" ? "translate-y-2" : ""}
            }`}
          >
            <MobileFeatureVisual feature={slide.feature} clubName={clubName} clubLogoSrc={clubLogoSrc} />
          </div>
        )}
      </div>
    </div>
  );
}

function MobileFeatureVisual({
  feature,
  clubName,
  clubLogoSrc,
}: {
  feature: MobileFeatureKey;
  clubName: string;
  clubLogoSrc: string;
}) {
  const [members, setMembers] = useState("1000");
  const [quota, setQuota] = useState("4");
  const [newMembers, setNewMembers] = useState("10");
  const [oeirasCounters, setOeirasCounters] = useState({
    newMembers: 0,
    upToDate: 0,
    registeredInApp: 0,
    usedAtEntry: 0,
  });

  const parsedMembers = Math.max(0, Number.parseInt(members.replace(/\D/g, ""), 10) || 0);
  const parsedQuota = Math.max(0, Number.parseFloat(quota.replace(",", ".").replace(/[^\d.]/g, "")) || 0);
  const parsedNewMembers = Math.max(0, Number.parseInt(newMembers.replace(/\D/g, ""), 10) || 0);
  const annualLossValue = Math.round(parsedMembers * parsedQuota * 12 * (0.25 - 0.05));
  const extraAnnualNewMemberRevenue = Math.round(parsedNewMembers * 0.3 * 12 * parsedQuota * 12);
  const annualAdminSavings = 20 * 12 * 12;
  const totalAnnualBenefitBeforeSponsors = annualLossValue + extraAnnualNewMemberRevenue + annualAdminSavings;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  const formatEuroValue = (value: number) =>
    `${Math.round(value).toLocaleString("pt-PT")} €`;
  const quotaNotifications = [
    { name: "João Silva", action: "pagou 1 mês de quotas" },
    { name: "Ana Costa", action: "pagou 3 meses de quotas" },
    { name: "Pedro Santos", action: "pagou 6 meses de quotas" },
    { name: "Mariana Lopes", action: "pagou 1 ano de quotas" },
    { name: "Rui Ferreira", action: "pagou 1 mês de quotas" },
    { name: "Inês Martins", action: "pagou 3 meses de quotas" },
  ];
  const [notificationIndex, setNotificationIndex] = useState(0);

  useEffect(() => {
    if (feature !== "quota-notifications") return;
    const id = window.setInterval(() => {
      setNotificationIndex((prev) => (prev + 1) % quotaNotifications.length);
    }, 9000);
    return () => window.clearInterval(id);
  }, [feature, quotaNotifications.length]);

  useEffect(() => {
    if (feature !== "oeiras-results") return;

    const DURATION_MS = 5000;
    const targets = {
      newMembers: 200,
      upToDate: 250,
      registeredInApp: 80,
      usedAtEntry: 95,
    };

    let frameId = 0;
    let startTs: number | null = null;

    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min((ts - startTs) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setOeirasCounters({
        newMembers: Math.round(targets.newMembers * eased),
        upToDate: Math.round(targets.upToDate * eased),
        registeredInApp: Math.round(targets.registeredInApp * eased),
        usedAtEntry: Math.round(targets.usedAtEntry * eased),
      });

      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [feature]);

  if (feature === "payment-demo") return <PaymentQuotaQuickDemo clubName={clubName} clubLogoSrc={clubLogoSrc} />;

  if (feature === "closed-office") {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] gap-4">
        <div className="relative w-full rounded-2xl border border-white/14 bg-white/[0.04] p-5">
          <div className="pointer-events-none absolute right-6 top-4 rotate-[-12deg] rounded-md border-2 border-red-500/90 bg-red-500/12 px-3 py-1">
            <span className="text-[20px] font-black uppercase tracking-[0.14em] text-red-500">Closed</span>
          </div>
          <div className="flex items-center gap-3">
            <Image src={clubLogoSrc} alt={clubName} width={56} height={56} className="h-14 w-14 object-contain" />
            <p className="text-[28px] font-extrabold uppercase tracking-[0.03em] text-white">Secretaria Física</p>
          </div>
          <p className="mt-4 text-[17px] font-semibold leading-[1.3] text-slate-200">
            60% dos pagamentos são realizados num horário em que a secretaria física está fechada.
          </p>
        </div>

        <div className="grid grid-cols-2 items-start gap-4">
        <div className="self-start rounded-2xl border border-white/14 bg-white/[0.04] p-4">
          <div className="mb-3 mt-1 grid grid-cols-[118px_1fr] items-center gap-3">
            <div className="member-visual member-visual-small shrink-0">
              <span className="member-halo" />
              <span className="member-scarf-top" />
              <span className="member-arm member-arm-left" />
              <span className="member-arm member-arm-right" />
              <span className="member-head" />
              <span className="member-body" />
            </div>
            <p className="relative z-20 text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--club-secondary)] whitespace-nowrap">Para o Sócio</p>
          </div>
          <p className="mt-2 text-[14px] font-semibold leading-[1.25] text-slate-100">
            Paga quotas no momento em que decide, sem ficar preso ao horário da secretaria.
          </p>
        </div>
        <div className="self-start rounded-2xl border border-white/14 bg-white/[0.04] p-4">
          <div className="mb-3 mt-1 grid grid-cols-[118px_1fr] items-center gap-3">
            <div className="staff-visual staff-visual-small shrink-0">
              <span className="staff-head" />
              <span className="staff-body" />
              <span className="staff-arm staff-arm-left" />
              <span className="staff-arm staff-arm-right" />
              <span className="staff-desk" />
            </div>
            <p className="relative z-20 text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--club-secondary)] whitespace-nowrap">Para o Staff</p>
          </div>
          <p className="mt-2 text-[14px] font-semibold leading-[1.25] text-slate-100">
            Menos atendimento repetitivo e mais tempo para crescimento, acompanhamento e estratégia.
          </p>
        </div>
        </div>
      </div>
    );
  }

  if (feature === "quota-notifications") {
    const currentNotification = quotaNotifications[notificationIndex] ?? quotaNotifications[0];

    return (
      <div className="h-full rounded-[30px] border border-white/14 bg-[#0b1528] p-6">
        <div className="quota-phone-mock mx-auto">
          <div className="quota-phone-notch" />
          <div className="quota-phone-topbar">
            <div className="flex items-center gap-2">
              <Image src={clubLogoSrc} alt={clubName} width={22} height={22} className="h-[22px] w-[22px] object-contain" />
              <span className="text-[12px] font-bold">{clubName}</span>
            </div>
            <span className="text-[11px] font-semibold text-white/80">23:41 · 5G</span>
          </div>

          <div className="quota-app-content">
            <div className="quota-final-screen">
              <div className="quota-final-card">
                <div className="quota-final-head">
                  <div>
                    <strong>{clubName}</strong>
                    <span>CARTÃO DE SÓCIO</span>
                  </div>
                  <Image src={clubLogoSrc} alt={clubName} width={28} height={28} className="h-7 w-7 object-contain" />
                </div>
                <div className="quota-final-body">
                  <div className="quota-avatar">JS</div>
                  <div className="quota-qr" />
                </div>
                <div className="quota-final-meta">
                  <p className="text-[10px] text-white/80">Sócio Nº 7</p>
                  <p className="text-[15px] font-bold text-white">João Silva</p>
                  <p className="text-[10px] text-white/80">Válido até 04/27</p>
                </div>
              </div>
            </div>
          </div>

          <div className="quota-live-layer">
            <article key={notificationIndex} className="quota-live-notification">
              <div className="quota-push-head">
                <div className="flex items-center gap-2">
                  <Image src={clubLogoSrc} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-700">ClubIQ</p>
                </div>
                <p className="text-[10px] font-semibold text-slate-500">agora</p>
              </div>
              <p className="mt-1 text-[12px] font-bold text-[#0f172a]">{currentNotification.name}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#334155]">{currentNotification.action}</p>
            </article>
          </div>

          <div className="quota-phone-footer">
            <span className="text-[11px] font-semibold text-white/85">Entradas de quotas em tempo real</span>
          </div>
        </div>
      </div>
    );
  }

  if (feature === "retention-calculator") {
    return (
      <div className="rounded-[30px] border border-white/14 bg-white/[0.04] p-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--club-secondary)]">Calculadora de perda anual</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-[12px] font-semibold text-slate-200">Número de sócios
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white" value={members} onChange={(e) => setMembers(e.target.value.replace(/[^\d]/g, ""))} />
          </label>
          <label className="text-[12px] font-semibold text-slate-200">Quota mensal (€)
            <input className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white" value={quota} onChange={(e) => setQuota(e.target.value.replace(/[^\d,.]/g, ""))} />
          </label>
        </div>
        <div className="mt-4 rounded-xl bg-[var(--club-primary)] px-4 py-3 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90">Perda anual esperada</p>
          <p className="text-[34px] font-bold text-white">{formatCurrency(annualLossValue)}</p>
        </div>
      </div>
    );
  }

  if (feature === "mobile-commerce-gap") {
    return (
      <div className="relative h-full px-6 pt-4 text-center">
        <p className="mx-auto max-w-[1280px] text-[24px] font-semibold leading-[1.3] text-slate-300">
            60% dos processos de compra iniciam-se e terminam no telemóvel. Estar fora é perder a oportunidade de multiplicar a quantidade de novos sócios no clube.
        </p>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <p className="text-[42px] font-semibold leading-[1.2] text-white">
            O adepto pode comprar um carro, roupa, comida, jantar ou aparelhos tecnológicos pelo telemóvel...
          </p>
          <p className="mt-4 w-full text-center text-[112px] font-black uppercase leading-[0.95] tracking-[-0.03em] text-white">
            MAS NÃO CONSEGUE <span className="text-[var(--club-primary)]">TORNAR-SE SÓCIO</span>?!
          </p>
        </div>
      </div>
    );
  }

  if (feature === "partner-scan") {
    return (
      <div className="grid h-full grid-cols-[0.82fr_1.18fr] gap-1">
        <div className="flex h-full items-center">
          <div />
        </div>
        <div className="grid h-full grid-rows-3 gap-3 pl-0">
          <article className="rounded-2xl border border-white/14 bg-white/[0.04] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--club-secondary)]">Restaurante</p>
            <p className="mt-2 text-[26px] font-black text-white">10%</p>
            <p className="text-[14px] font-semibold text-slate-200">Desconto em refeições</p>
          </article>
          <article className="rounded-2xl border border-white/14 bg-white/[0.04] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--club-secondary)]">Oficina</p>
            <p className="mt-2 text-[26px] font-black text-white">15%</p>
            <p className="text-[14px] font-semibold text-slate-200">Desconto em serviços</p>
          </article>
          <article className="rounded-2xl border border-white/14 bg-white/[0.04] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--club-secondary)]">Pastelaria</p>
            <p className="mt-2 text-[26px] font-black text-white">LEVE 3 PAGUE 2</p>
            <p className="text-[14px] font-semibold text-slate-200">Campanha para sócios</p>
          </article>
        </div>
      </div>
    );
  }

  if (feature === "sponsor-showcase") {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-8">
        <p className="mb-5 text-[18px] font-semibold leading-[1.25] text-slate-300">
          A montra diária que os patrocinadores vão querer ocupar
        </p>
        <p className="max-w-[1460px] text-[88px] font-black uppercase leading-[1.01] tracking-[-0.03em] text-white">
          A APP CRIA UMA <span className="text-[var(--club-primary)]">NOVA MONTRA DE EXPOSIÇÃO</span> NO CLUBE PARA <span className="text-[var(--club-primary)]">PATROCINADORES</span>.
        </p>
        <p className="mt-7 max-w-[1420px] text-[20px] font-semibold leading-[1.3] text-slate-300">
          centenas de sócios a abrir a app diariamente dão ao clube um novo espaço de visibilidade, presença diária e valor comercial para vender a patrocinadores e parceiros
        </p>
      </div>
    );
  }

  if (feature === "sponsor-data") {
    return (
      <div className="rounded-[30px] border border-white/20 bg-[linear-gradient(140deg,color-mix(in_srgb,var(--club-primary)_28%,#0f172a),color-mix(in_srgb,var(--club-secondary)_18%,#0f172a))] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/80">Dados reais do sistema</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
            <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--club-secondary)]">Presença em jogo</p>
            <p className="mt-1 text-[19px] font-extrabold text-white">100 sócios foram ao jogo do domingo passado</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
            <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--club-secondary)]">Uso de benefícios</p>
            <p className="mt-1 text-[19px] font-extrabold text-white">10 sócios usaram o cartão de sócio no Restaurante Carne na Brasa</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-3">
            <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--club-secondary)]">Estado de cobrança</p>
            <p className="mt-1 text-[19px] font-extrabold text-white">Há 10 sócios em dívida</p>
          </div>
        </div>
      </div>
    );
  }

  if (feature === "oeiras-results") {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] items-center">
        <h3 className="text-center text-[46px] font-black uppercase tracking-[0.03em] text-white">
          A Experiência com a A.D. Oeiras
        </h3>

        <article className="mx-auto mt-4 w-full max-w-[1260px] rounded-[24px] border border-white/20 bg-[#fbece8]/28 px-14 py-16 shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
          <header className="text-center">
            <p className="text-[22px] font-semibold text-[#d7dbe1]">
              Resultado na primeira semana após o lançamento
            </p>
          </header>

          <section className="mt-9 grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-[22px] font-extrabold uppercase tracking-[0.02em] text-white">
                Novos Sócios
              </p>
              <p className="mt-2 text-[92px] font-black leading-[0.92] text-emerald-500">{oeirasCounters.newMembers}%</p>
              <p className="mt-2 text-[15px] font-semibold text-[#7b8088]">
                Em relação ao ano todo anterior
              </p>
            </div>
            <div>
              <p className="text-[22px] font-extrabold uppercase tracking-[0.02em] text-white">
                Sócios com quotas em dia
              </p>
              <p className="mt-2 text-[92px] font-black leading-[0.92] text-emerald-500">{oeirasCounters.upToDate}%</p>
              <p className="mt-2 text-[15px] font-semibold text-[#7b8088]">
                Em relação ao dia antes do lançamento
              </p>
            </div>
          </section>

          <div className="my-7 h-px w-full bg-[#e8d5d2]" />

          <section className="grid grid-cols-2 gap-10">
            <div className="flex items-center justify-center gap-4">
              <p className="text-[64px] font-black leading-none text-[var(--club-primary)]">{oeirasCounters.registeredInApp}%</p>
              <p className="text-[24px] font-extrabold uppercase leading-[1.1] text-white">
                Dos sócios registados na app
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <p className="text-[64px] font-black leading-none text-[var(--club-secondary)]">{oeirasCounters.usedAtEntry}%</p>
              <p className="text-[24px] font-extrabold uppercase leading-[1.1] text-white">
                Dos sócios usaram a app à entrada
              </p>
            </div>
          </section>
        </article>
      </div>
    );
  }

  if (feature === "final-benefits") {
    const extraMembersPerMonth = Math.round(parsedNewMembers * 0.3);
    return (
      <article className="relative mx-auto mt-4 w-full max-w-[1360px] overflow-hidden rounded-[24px] border border-white/12 bg-[#151c27] px-10 py-9 shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(199,210,254,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(199,210,254,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:radial-gradient(circle_at_center,rgba(148,163,184,0.45)_1px,transparent_1px)] [background-size:26px_26px]" />

        <h3 className="relative text-center text-[38px] font-black uppercase tracking-[0.06em] text-white">
          Calculadora Final de Benefícios
        </h3>

        <div className="relative mt-6 grid grid-cols-3 gap-4">
          <label className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-300">Número de sócios atual</p>
            <input className="mt-2 w-full bg-transparent text-[28px] font-black text-white outline-none" value={members} onChange={(e) => setMembers(e.target.value.replace(/[^\d]/g, ""))} />
          </label>
          <label className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-300">Valor da quota mensal</p>
            <input className="mt-2 w-full bg-transparent text-[28px] font-black text-white outline-none" value={quota} onChange={(e) => setQuota(e.target.value.replace(/[^\d,.]/g, ""))} />
          </label>
          <label className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-slate-300">Novos sócios por mês atualmente</p>
            <input className="mt-2 w-full bg-transparent text-[28px] font-black text-white outline-none" value={newMembers} onChange={(e) => setNewMembers(e.target.value.replace(/[^\d]/g, ""))} />
          </label>
        </div>

        <section className="relative mt-5 grid grid-cols-4 gap-4">
          <article className="rounded-xl border border-emerald-400/45 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">Poupança por reduzir a desistência</p>
            <p className="mt-2 text-[38px] font-black leading-none text-emerald-400">{formatEuroValue(annualLossValue)}</p>
            <p className="mt-2 text-[12px] text-slate-300">Diferença entre 25% e 5% de taxa de desistência.</p>
          </article>
          <article className="rounded-xl border border-cyan-400/50 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">30% mais novos sócios por mês</p>
            <p className="mt-2 text-[38px] font-black leading-none text-cyan-400">+{extraMembersPerMonth} por mês</p>
            <p className="mt-2 text-[12px] text-slate-300">Impacto anual estimado: {formatEuroValue(extraAnnualNewMemberRevenue)}</p>
          </article>
          <article className="rounded-xl border border-slate-400/40 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">Poupança administrativa</p>
            <p className="mt-2 text-[38px] font-black leading-none text-slate-100">{formatEuroValue(annualAdminSavings)}</p>
            <p className="mt-2 text-[12px] text-slate-300">20 horas por mês poupadas em tarefas administrativas a 12€ por hora.</p>
          </article>
          <article className="rounded-xl border border-orange-400/60 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-300">Benefício anual antes dos patrocinadores</p>
            <p className="mt-2 text-[44px] font-black leading-none text-orange-400">{formatEuroValue(totalAnnualBenefitBeforeSponsors)}</p>
            <p className="mt-2 text-[12px] text-slate-300">A este valor soma-se ainda a nova receita gerada com patrocinadores.</p>
          </article>
        </section>

        <div className="relative my-5 h-px w-full bg-slate-500/35" />

        <section className="relative grid grid-cols-3 gap-4">
          <article className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[16px] font-bold text-white">Mais valor para patrocinadores</p>
            <p className="mt-1 text-[13px] text-slate-300">Dados e visibilidade que ajudam o clube a vender melhor a app.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[16px] font-bold text-white">Menos balcão, mais tempo útil</p>
            <p className="mt-1 text-[13px] text-slate-300">A secretaria deixa de estar presa a pagamentos e validações repetitivas.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-[#0f1623]/90 px-4 py-3">
            <p className="text-[16px] font-bold text-white">Menos custo de substituir sócios perdidos</p>
            <p className="mt-1 text-[13px] text-slate-300">Reduz a necessidade de recuperar receita que saiu por atrito.</p>
          </article>
        </section>

        <div className="sr-only">
          Benefício total: {formatCurrency(totalAnnualBenefitBeforeSponsors)} / ano
        </div>
      </article>
    );
  }

  return <PaymentQuotaQuickDemo clubName={clubName} clubLogoSrc={clubLogoSrc} />;
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/14 bg-white/[0.04] p-4">
      <p className="text-[34px] font-bold text-[var(--club-secondary)]">{value}</p>
      <p className="mt-2 text-[14px] font-semibold text-slate-200">{label}</p>
    </div>
  );
}

function BenefitRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0f172a]/65 px-3 py-2">
      <span className="text-[14px] font-semibold text-slate-200">{label}</span>
      <strong className="text-[18px] text-white">{value}</strong>
    </div>
  );
}

function Part9MobileModel() {
  return (
    <OptionsPart
      title="Escolha o modelo de App"
      options={["Com website", "Sem website"]}
    />
  );
}

function RouteIntro({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-8">
      <h2 className="huge-title -mt-20 pl-28 text-[58px] text-white">{title}</h2>
      <div className="flex h-full items-center">
        <div className="max-w-[980px]">
          <p className="text-[32px] font-semibold text-slate-200">{subtitle}</p>
        </div>
      </div>
    </div>
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
