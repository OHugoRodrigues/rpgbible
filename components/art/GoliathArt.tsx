import { GOLIATH_BODY, GOLIATH_VIEWBOX } from './goliath';

export function Goliath({ className, title = 'Golias' }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox={GOLIATH_VIEWBOX}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: `<title>${title}</title>${GOLIATH_BODY}` }}
    />
  );
}
