import React from 'react';

/**
 * Section panel used by the Happy Hour editor. Matches the rest of the
 * merchant dashboard `panelClass` styling (rounded-1.45rem, single border,
 * bg-card/95 dark:bg-card, dashboard shadow) so it sits alongside SectionCard from the
 * other deal-create flows without looking different.
 */
export const FormSection: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => {
  return (
    <section className="rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
      <div className="mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </div>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
};

export default FormSection;
