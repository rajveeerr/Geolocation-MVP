export const HeroBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
      <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
      <div className="absolute left-0 right-0 top-[4%] h-0.5 bg-brand-primary-200/40 md:top-[5%]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary-200/40"></div>
    </div>
  );
};