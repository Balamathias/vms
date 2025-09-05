"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface AsyncOption {
  value: string;
  label: string;
  [key: string]: any;
}

interface AsyncSelectProps {
  value?: string | null;
  onChange: (value: string | null, option?: AsyncOption | null) => void;
  placeholder?: string;
  fetcher: (query: string, page: number) => Promise<{ results: AsyncOption[]; has_next: boolean }>;
  disabled?: boolean;
  className?: string;
  emptyText?: string;
  initialQuery?: string;
  renderOption?: (opt: AsyncOption) => React.ReactNode;
  debounceMs?: number;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  fetcher,
  disabled,
  className,
  emptyText = 'No results',
  initialQuery = '',
  renderOption,
  debounceMs = 300,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(initialQuery);
  const [page, setPage] = React.useState(1);
  const [options, setOptions] = React.useState<AsyncOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasNext, setHasNext] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const selected = options.find(o => o.value === value) || null;

  // Debounce
  const debounceRef = React.useRef<number | undefined>(undefined);
  const load = React.useCallback((reset=false) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    fetcher(query, currentPage).then(data => {
      setOptions(prev => reset ? data.results : [...prev, ...data.results.filter(n => !prev.some(p => p.value === n.value))]);
      setHasNext(data.has_next);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetcher, query, page]);

  React.useEffect(() => {
    if (!open) return; // only load when open
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      load(true);
    }, debounceMs);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [query, open]);

  const handleOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  React.useEffect(() => {
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const loadMore = () => {
    if (hasNext && !loading) {
      setPage(p => p + 1);
    }
  };

  React.useEffect(() => { if (page > 1) load(false); }, [page]);

  return (
    <div ref={containerRef} className={cn('relative text-sm', className)}>
      <button type="button" disabled={disabled} onClick={() => setOpen(o => !o)} className={cn('w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-left flex items-center justify-between gap-2 hover:bg-white/10 transition', disabled && 'opacity-50 cursor-not-allowed')}>
        <span className={cn(!selected && 'text-white/50')}>{selected ? selected.label : placeholder}</span>
        <svg className={cn('h-4 w-4 text-white/60 transition-transform', open && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-[#121212] border border-white/15 shadow-xl overflow-hidden">
          <div className="p-2">
            <input autoFocus value={query} onChange={e => { setQuery(e.target.value); setPage(1);} } placeholder={placeholder} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {options.length === 0 && !loading && (
              <div className="px-4 py-6 text-center text-white/40 text-xs">{emptyText}</div>
            )}
            {options.map(opt => (
              <button key={opt.value} type="button" onClick={() => { onChange(opt.value, opt); setOpen(false); }} className={cn('w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2', value === opt.value && 'bg-indigo-600/20 text-white')}>
                {renderOption ? renderOption(opt) : <span className="truncate">{opt.label}</span>}
              </button>
            ))}
            {hasNext && (
              <div className="p-2">
                <button disabled={loading} onClick={loadMore} className="w-full text-center px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs disabled:opacity-50">{loading ? 'Loading...' : 'Load more'}</button>
              </div>
            )}
          </div>
          {loading && <div className="px-3 py-2 text-xs text-white/40">Loading...</div>}
        </div>
      )}
    </div>
  );
};

export default AsyncSelect;