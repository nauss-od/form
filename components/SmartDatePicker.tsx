'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

interface QuickBtn {
  label: string;
  offsetYears: number;
  offsetMonths?: number;
}

interface SmartDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  quickButtons?: QuickBtn[];
  label?: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtISO(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function displayDate(s: string) {
  const p = s.split('-');
  if (p.length !== 3) return s;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

export default function SmartDatePicker({ value, onChange, min, max, placeholder, quickButtons }: SmartDatePickerProps) {
  const today = new Date();

  // Derive initial viewYear/viewMonth from value or today
  const initDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Keep view in sync if value changes externally (e.g. from passport scan)
  const prevVal = useRef(value);
  if (prevVal.current !== value) {
    prevVal.current = value;
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }
  }

  // Close on outside click (desktop) or Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // --- helpers ---
  function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function isDisabled(y: number, m: number, d: number) {
    const ts = new Date(y, m, d).getTime();
    if (min && ts < new Date(min + 'T00:00:00').getTime()) return true;
    if (max && ts > new Date(max + 'T00:00:00').getTime()) return true;
    return false;
  }

  function isSelected(y: number, m: number, d: number) {
    return value === fmtISO(new Date(y, m, d));
  }

  function isToday(y: number, m: number, d: number) {
    return y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
  }

  function selectDay(y: number, m: number, d: number) {
    if (isDisabled(y, m, d)) return;
    onChange(fmtISO(new Date(y, m, d)));
    setOpen(false);
  }

  function applyQuick(offsetYears: number, offsetMonths = 0) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + offsetYears);
    if (offsetMonths) d.setMonth(d.getMonth() + offsetMonths);
    onChange(fmtISO(d));
    setOpen(false);
  }

  // Build year range
  const minYear = min ? new Date(min).getFullYear() : 1930;
  const maxYear = max ? new Date(max).getFullYear() : today.getFullYear() + 15;
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  // Build calendar grid
  const dim = daysInMonth(viewYear, viewMonth);
  const start = firstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let i = 1; i <= dim; i++) cells.push(i);
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      {/* Trigger input */}
      <div className="dp-wrap" onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        <input
          className={`dp-input ${value ? 'dp-input-filled' : ''}`}
          value={displayDate(value)}
          placeholder={placeholder || 'اختر تاريخ'}
          readOnly
          style={{ cursor: 'pointer' }}
        />
        <svg className="dp-cal-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
          <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="6" y="1" width="2" height="4" rx="1" fill="currentColor"/>
          <rect x="12" y="1" width="2" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>

      {/* Full-screen overlay via Portal — renders on document.body, above ALL stacking contexts */}
      {open && mounted && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          {/* Bottom sheet panel */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '20px 20px 0 0',
              width: '100%',
              maxWidth: 420,
              padding: '0 0 env(safe-area-inset-bottom,0)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
              animation: 'dpSlideUp 0.22s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#d0dada' }} />
            </div>

            {/* Month + Year selectors */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px 10px', alignItems: 'center' }}>
              <select
                value={viewMonth}
                onChange={e => setViewMonth(+e.target.value)}
                style={selectStyle}
              >
                {MONTHS.map((m, i) => (
                  <option key={i} value={i}>{pad(i + 1)} — {m}</option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={e => setViewYear(+e.target.value)}
                style={{ ...selectStyle, flex: '0 0 auto', width: 90 }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => setOpen(false)} style={closeBtnStyle}>✕</button>
            </div>

            {/* Quick buttons */}
            {quickButtons && quickButtons.length > 0 && (
              <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', flexWrap: 'wrap' }}>
                {quickButtons.map((q, i) => (
                  <button key={i} onClick={() => applyQuick(q.offsetYears, q.offsetMonths)}
                    style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid #b2d8d7', background: '#f0faf9', color: '#014948', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 12px', borderTop: '1px solid #eef3f3' }}>
              {DAYS_AR.map(d => (
                <div key={d} style={{ textAlign: 'center', padding: '8px 0 4px', fontSize: '0.72rem', fontWeight: 700, color: '#889f9f' }}>{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '2px 12px 16px', gap: '2px 0' }}>
              {cells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const disabled = isDisabled(viewYear, viewMonth, d);
                const selected = isSelected(viewYear, viewMonth, d);
                const todayCell = isToday(viewYear, viewMonth, d);
                return (
                  <button
                    key={i}
                    onClick={() => selectDay(viewYear, viewMonth, d)}
                    disabled={disabled}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: '50%', border: 'none',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem', fontWeight: selected ? 800 : todayCell ? 700 : 400,
                      background: selected ? '#014948' : 'transparent',
                      color: disabled ? '#c8d8d8' : selected ? '#fff' : todayCell ? '#016564' : '#2d4141',
                      outline: todayCell && !selected ? '2px solid #b2d8d7' : 'none',
                      outlineOffset: -2,
                      transition: 'background 0.12s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: 40,
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes dpSlideUp {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

const selectStyle: React.CSSProperties = {
  flex: 1, padding: '9px 10px', borderRadius: 10, border: '1.5px solid #b2d8d7',
  background: '#f0faf9', color: '#014948', fontWeight: 700, fontSize: '0.85rem',
  cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%23016564' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'left 8px center', backgroundSize: 16,
  paddingLeft: 28,
};

const closeBtnStyle: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e0eaea',
  background: '#f5fafa', color: '#667777', fontSize: '0.85rem', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
