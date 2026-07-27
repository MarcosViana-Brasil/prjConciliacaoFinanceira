'use client';

type ZoomLogoProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function ZoomLogo({ compact = false, inverted = false }: ZoomLogoProps) {
  return (
    <div className="leading-none" aria-label="Zoom Education for Life">
      <div className={`font-black tracking-normal ${compact ? 'text-2xl' : 'text-5xl'} ${inverted ? 'text-white' : 'text-[#0877bd]'}`}>
        <span>z</span>
        <span className="text-[#9ccb32]">o</span>
        <span className="text-[#ffcf00]">o</span>
        <span className="text-[#f26322]">m</span>
      </div>
      <div className={`mt-1 text-right font-medium ${compact ? 'text-[8px]' : 'text-xs'} ${inverted ? 'text-[#55a7e3]' : 'text-[#0c66a3]'}`}>
        education for life
      </div>
    </div>
  );
}
