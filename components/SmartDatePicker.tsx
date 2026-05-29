'use client';

import { useEffect, useRef, useState } from 'react';

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

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

export default function SmartDatePicker({ value, onChange, min, max, placeholder, quickButtons, label }: SmartDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  if (viewYear === 0) {
    const init = value ? new Date(value) : new Date();
    setViewYear(init.getFullYear());
    setViewMonth(init.getMonth());
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => setAnimIn(true));
    else setAnimIn(false);
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function pad(n: number) { return String(n).padStart(2, '0'); }
  function formatDate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  function displayDate(d: string): string {
    if (!d) return '';
    const p = d.split('-');
    if (p.length !== 3) return d;
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  function parseDate(s: string): Date | null {
    const p = s.split('-');
    if (p.length !== 3) return null;
    const d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  function isDisabled(y: number, m: number, d: number): boolean {
    const date = new Date(y, m, d);
    const ts = date.getTime();
    if (min && ts < new Date(min).getTime()) return true;
    if (max && ts > new Date(max).getTime()) return true;
    return false;
  }

  function isToday(y: number, m: number, d: number): boolean {
    return y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
  }

  function selectDate(y: number, m: number, d: number) {
    if (isDisabled(y, m, d)) return;
    onChange(formatDate(new Date(y, m, d)));
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  function prevYear() { setViewYear(viewYear - 1); }
  function nextYear() { setViewYear(viewYear + 1); }

  function applyQuick(offsetYears: number, offsetMonths = 0) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + offsetYears);
    if (offsetMonths) d.setMonth(d.getMonth() + offsetMonths);
    onChange(formatDate(d));
    setOpen(false);
  }

  function jumpToYear() {
    const y = prompt('أدخل السنة:', String(viewYear));
    if (y && /^\d{4}$/.test(y)) setViewYear(+y);
  }

  const dim = daysInMonth(viewYear, viewMonth);
  const start = firstDay(viewYear, viewMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < start; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);

  const selectedValue = displayDate(value);
  const selDate = parseDate(value);
  const displayLabel = label || '';

  return (
    <div ref={wrapRef} className="dp-wrap">
      <input
        className={`dp-input ${value ? 'dp-input-filled' : ''}`}
        value={selectedValue}
        placeholder={placeholder || 'اختر تاريخ'}
        onFocus={() => setOpen(true)}
        readOnly
      />
      <svg className="dp-cal-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="1" width="2" height="4" rx="1" fill="currentColor"/>
        <rect x="12" y="1" width="2" height="4" rx="1" fill="currentColor"/>
      </svg>

      {open && (
        <div ref={panelRef} className={`dp-panel ${animIn ? 'dp-panel-open' : ''}`}>
          <div className="dp-header" dir="rtl">
            <div className="dp-nav">
              <button className="dp-nav-btn" onClick={nextYear} title="السنة التالية">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="dp-nav-btn" onClick={nextMonth} title="الشهر التالي">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="dp-title" onClick={jumpToYear} title="انقر لتغيير السنة">
              <span className="dp-month-name">{MONTHS[viewMonth]}</span>
              <span className="dp-year-name">{viewYear}</span>
            </div>
            <div className="dp-nav">
              <button className="dp-nav-btn" onClick={prevMonth} title="الشهر السابق">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="dp-nav-btn" onClick={prevYear} title="السنة السابقة">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div className="dp-weekdays">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="dp-grid">
            {days.map((d, i) =>
              d === null ? <span key={i} /> : (
                <button
                  key={i}
                  className={
                    `dp-day` +
                    (isDisabled(viewYear, viewMonth, d) ? ' dp-day-disabled' : '') +
                    (value === formatDate(new Date(viewYear, viewMonth, d)) ? ' dp-day-selected' : '') +
                    (isToday(viewYear, viewMonth, d) ? ' dp-day-today' : '')
                  }
                  onClick={() => selectDate(viewYear, viewMonth, d)}
                  disabled={isDisabled(viewYear, viewMonth, d)}
                >
                  {d}
                </button>
              )
            )}
          </div>

          {quickButtons && quickButtons.length > 0 && (
            <div className="dp-quick">
              {quickButtons.map((q, i) => (
                <button key={i} className="dp-quick-btn" onClick={() => applyQuick(q.offsetYears, q.offsetMonths)}>
                  {q.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
