// web/src/components/common/SectionDivider.tsx

export const SectionDivider = () => {
  return (
    <div className="bg-neutral-100/70">
      <div className="container mx-auto px-4">
        {/* This div is the visual line */}
        <div className="h-px w-full bg-neutral-200/80" />
      </div>
    </div>
  );
};
