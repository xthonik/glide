"use client";

import { useCurveState } from "@/hooks/useCurveState";
import CurveGraph from "@/components/curve-editor/CurveGraph";
import EasingControls from "@/components/curve-editor/EasingControls";
import DurationSlider from "@/components/curve-editor/DurationSlider";
import CurveTypeSelector from "@/components/presets/CurveTypeSelector";
import PresetGrid from "@/components/presets/PresetGrid";
import AnimationPreview from "@/components/preview/AnimationPreview";
import CodePanel from "@/components/code-output/CodePanel";
import ShareButton from "@/components/shared/ShareButton";
import { DEFAULT_ACCURACY, DEFAULT_DELAY, DEFAULT_DURATION, getDefaultEasing } from "@/lib/easing";

export default function Home() {
  const initialState = {
    easing: getDefaultEasing("bezier"),
    duration: DEFAULT_DURATION,
    delay: DEFAULT_DELAY,
    accuracy: DEFAULT_ACCURACY,
  };
  const {
    easing,
    duration,
    delay,
    accuracy,
    setEasing,
    setType,
    setDuration,
    setDelay,
    setAccuracy,
    setControlPoint,
  } = useCurveState(initialState);

  const sectionTitleClass = "text-[10px] font-medium uppercase tracking-[0.15em] text-text-secondary";
  const cardClass = "min-w-0 rounded-[12px] border border-border p-6";

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col items-center gap-8 px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex w-full flex-col items-center gap-1 py-4">
          <h1 className="text-center text-[24px] font-bold leading-8 tracking-[-0.6px] text-text-primary">
            Easing Tool
          </h1>
          <p className="text-center text-[14px] leading-5 text-text-secondary">
            Visual easing curve editor with multi-platform code export
          </p>
        </header>

        <div className="flex h-10 w-full justify-center">
          <CurveTypeSelector value={easing.type} onChange={setType} />
        </div>

        <main className="grid w-full flex-1 grid-cols-1 gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <section className={`${cardClass} sm:col-span-2 lg:col-span-2 lg:min-h-[545px]`}>
            <h2 className={sectionTitleClass}>Presets</h2>
            <div className="mt-4">
              <PresetGrid easing={easing} accuracy={accuracy} onSelect={setEasing} />
            </div>
          </section>

          <section className={`${cardClass} min-h-[550px] sm:col-span-1 lg:col-span-2`}>
            <h2 className={sectionTitleClass}>Customize</h2>
            <div className="mt-[14px] flex flex-col gap-[14px]">
              <div className="mx-auto w-full max-w-[332px]">
                <CurveGraph easing={easing} accuracy={accuracy} onControlPointDrag={setControlPoint} />
              </div>
              <EasingControls
                easing={easing}
                accuracy={accuracy}
                onEasingChange={setEasing}
                onAccuracyChange={setAccuracy}
              />
            </div>
          </section>

          <section className={`${cardClass} min-h-[550px] sm:col-span-1 lg:col-span-2`}>
            <h2 className={sectionTitleClass}>Preview</h2>
            <div className="mt-[14px] flex flex-col gap-[14px]">
              <AnimationPreview easing={easing} duration={duration} delay={delay} accuracy={accuracy} />
              <DurationSlider label="Duration" value={duration} min={5} step={5} onChange={setDuration} />
              <DurationSlider label="Delay" value={delay} min={0} max={1000} onChange={setDelay} />
            </div>
          </section>

          <section className={`${cardClass} min-h-[192px] sm:col-span-2 lg:col-span-4`}>
            <h2 className={sectionTitleClass}>Code</h2>
            <div className="mt-3">
              <CodePanel easing={easing} duration={duration} delay={delay} accuracy={accuracy} />
            </div>
          </section>

          <section className={`${cardClass} min-h-[192px] sm:col-span-2 lg:col-span-2`}>
            <h2 className={sectionTitleClass}>Share</h2>
            <p className="mt-[14px] max-w-[266px] text-[12px] leading-[19.5px] text-text-secondary">
              Click the button below to copy the link to your current easing configuration for sharing.
            </p>
            <div className="mt-[14px]">
              <ShareButton easing={easing} duration={duration} delay={delay} accuracy={accuracy} />
            </div>
          </section>
        </main>

        <footer className="w-full py-6 text-center text-[12px] leading-4 text-text-secondary">
          Easing Tool {" "}— Internal Team Tool
        </footer>
      </div>
    </div>
  );
}
