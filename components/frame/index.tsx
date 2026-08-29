import { BookOpen, Lock } from 'lucide-react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import styles from './Frame.module.css';

function cx(...values: (string | false | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

/** Painel de pergaminho. `rolled` adiciona as bordas enroladas da ref/1.png. */
export function ScrollPanel({
  children,
  rolled = false,
  torn = false,
  className,
  ...rest
}: { children: ReactNode; rolled?: boolean; torn?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(styles.scroll, rolled && styles.scrollRolled, torn && styles.scrollTorn, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Superfície de madeira escura — o tampo de mesa das referências. */
export function WoodPanel({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.wood, className)} {...rest}>
      {children}
    </div>
  );
}

/** Moldura dourada com rebites. `paper` troca o miolo por pergaminho. */
export function GoldFrame({
  children,
  paper = false,
  tight = false,
  className,
  innerClassName,
  ...rest
}: {
  children: ReactNode;
  paper?: boolean;
  tight?: boolean;
  innerClassName?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(styles.frame, tight && styles.frameTight, paper && styles.framePaper, className)}
      {...rest}
    >
      <div className={cx(styles.frameInner, innerClassName)}>{children}</div>
    </div>
  );
}

export function GoldButton({
  children,
  wide = false,
  className,
  ...rest
}: { children: ReactNode; wide?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(styles.goldButton, wide && styles.goldButtonWide, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cx(styles.ghostButton, className)} {...rest}>
      {children}
    </button>
  );
}

/** Divisor de losangos dourados — o separador do pôster da jornada. */
export function DiamondDivider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cx(styles.divider, className)} role="presentation">
      <span className={styles.dividerLine} />
      <span className={styles.dividerGem} />
      {label ? <span className={styles.dividerLabel}>{label}</span> : null}
      {label ? <span className={styles.dividerGem} /> : null}
      <span className={styles.dividerLine} />
    </div>
  );
}

/** Referência bíblica. Nunca deve aparecer sem o texto que ela sustenta. */
export function Cartouche({
  reference,
  onPaper = false,
  className,
}: {
  reference: string;
  onPaper?: boolean;
  className?: string;
}) {
  return (
    <span className={cx(styles.cartouche, onPaper && styles.cartouchePaper, className)}>
      <BookOpen aria-hidden="true" />
      {reference}
    </span>
  );
}

/** Sobreposição de cadeado para jornadas e capítulos ainda indisponíveis. */
export function LockBadge({ soon = 'Em breve' }: { soon?: string | false }) {
  return (
    <>
      <span className={styles.lockBadge} aria-hidden="true">
        <Lock />
      </span>
      {soon ? <span className={styles.soonTag}>{soon}</span> : null}
    </>
  );
}

export function Overline({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(styles.overline, className)}>{children}</span>;
}

export const frameStyles = styles;
