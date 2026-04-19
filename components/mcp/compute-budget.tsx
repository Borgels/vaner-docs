'use client';

import { useMemo, useState } from 'react';

type ComputePreset = {
  id: 'background' | 'balanced' | 'dedicated';
  label: string;
  description: string;
  snippet: string;
};

const PRESETS: ComputePreset[] = [
  {
    id: 'background',
    label: 'Background',
    description: 'Safe default. Only ponders when your machine is idle; caps CPU and GPU.',
    snippet:
      '[compute]\nidle_only = true\ncpu_fraction = 0.2\ngpu_memory_fraction = 0.5\nexploration_concurrency = 2\nmax_parallel_precompute = 1\nmax_cycle_seconds = 300\n',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Runs even while you work, but bounded so it does not dominate the machine.',
    snippet:
      '[compute]\nidle_only = false\ncpu_fraction = 0.4\ngpu_memory_fraction = 0.6\nexploration_concurrency = 4\nmax_parallel_precompute = 2\nmax_cycle_seconds = 300\n',
  },
  {
    id: 'dedicated',
    label: 'Dedicated',
    description: 'Maxes out the local machine — best for dedicated hardware or overnight runs.',
    snippet:
      '[compute]\nidle_only = false\ncpu_fraction = 0.8\ngpu_memory_fraction = 0.9\nexploration_concurrency = 8\nmax_parallel_precompute = 4\nmax_cycle_seconds = 600\n',
  },
];

type Props = {
  initialPreset?: ComputePreset['id'];
  compact?: boolean;
};

export function ComputeBudget({ initialPreset, compact }: Props) {
  const [presetId, setPresetId] = useState<ComputePreset['id']>(initialPreset ?? 'background');
  const [minutes, setMinutes] = useState<number | ''>('');
  const [copied, setCopied] = useState(false);

  const active = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId]);
  const renderedSnippet = useMemo(() => {
    if (minutes === '' || Number(minutes) <= 0) return active.snippet;
    return `${active.snippet.trimEnd()}\nmax_session_minutes = ${Number(minutes)}\n`;
  }, [active, minutes]);

  return (
    <div className={`my-6 rounded-xl border border-border bg-card p-4 ${compact ? '' : ''}`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPresetId(p.id)}
            className={`rounded-md border px-2 py-1 text-xs ${
              p.id === active.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
            aria-pressed={p.id === active.id}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{active.description}</p>

      <label className="mb-3 block text-xs text-muted-foreground">
        <span className="mb-1 block font-medium text-foreground">Ponder session cap (minutes)</span>
        <input
          type="number"
          min={0}
          step={5}
          placeholder="leave empty for unbounded"
          value={minutes}
          onChange={(e) => {
            const v = e.target.value;
            setMinutes(v === '' ? '' : Math.max(0, Number(v)));
          }}
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
      </label>

      <div className="relative">
        <pre className="max-h-60 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
          <code>{renderedSnippet}</code>
        </pre>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(renderedSnippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              /* ignore */
            }
          }}
          className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {copied ? 'Copied' : 'Copy TOML'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        `max_cycle_seconds` bounds a single ponder cycle; `max_session_minutes` bounds a whole
        `vaner daemon` run. Both are safe to leave at their defaults.
      </p>
    </div>
  );
}
