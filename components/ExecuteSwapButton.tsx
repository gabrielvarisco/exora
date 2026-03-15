import type { RouteCandidate } from '@/lib/types';

export function ExecuteSwapButton({ route }: { route: RouteCandidate }) {
  const href = route.url ?? '#';
  return (
    <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer">
      Execute via source
    </a>
  );
}
