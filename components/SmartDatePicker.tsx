'use client';

import { useEffect, useRef, useState } from 'react';

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

interface SmartDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  quickButtons?: { label: string; offsetYears: number; offsetMonths?: number }[];
}

export default function SmartDatePicker({ value, onChange, min, max, placeholder, quickButtons }: SmartDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  if (viewYear === 0) {
    const init = value ? new Date(value) : new Date();
    setViewYear(init.getFullYear());
    setViewMonth(init.getMonth());
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
  function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }

  function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function displayDate(d: string): string {
    if (!d) return '';
    const p = d.split('-');
    if (p.length !== 3) return d;
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  function isDisabled(y: number, m: number, d: number): boolean {
    const date = new Date(y, m, d);
    const ts = date.getTime();
    if (min && ts < new Date(min).getTime()) return true;
    if (max && ts > new Date(max).getTime()) return true;
    return false;
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

  const dim = daysInMonth(viewYear, viewMonth);
  const start = firstDay(viewYear, viewMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < start; i++) days.push(null);
  for (let i = 1; i <= dim; i++) days.push(i);

  const selectedValue = displayDate(value);

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="input"
        style={{ cursor: 'pointer', direction: 'ltr', textAlign: 'center', fontFamily: 'monospace' }}
        value={selectedValue}
        placeholder={placeholder || 'YYYY-MM-DD'}
        onFocus={() => { setOpen(true); }}
        readOnly
      />
      {open && (
        <div ref={panelRef} className="datepicker-panel">
          {/* Header */}
          <div className="datepicker-header">
            <div className="datepicker-nav">
              <button className="datepicker-nav-btn" onClick={prevYear} title="السنة السابقة">«</button>
              <button className="datepicker-nav-btn" onClick={prevMonth} title="الشهر السابق">‹</button>
            </div>
            <div className="datepicker-title">{MONTHS[viewMonth]} {viewYear}</div>
            <div className="datepicker-nav">
              <button className="datepicker-nav-btn" onClick={nextMonth} title="الشهر التالي">›</button>
              <button className="datepicker-nav-btn" onClick={nextYear} title="السنة التالية">»</button>
            </div>
          </div>

          {/* Day names */}
          <div className="datepicker-weekdays">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          {/* Calendar grid */}
          <div className="datepicker-grid">
            {days.map((d, i) =>
              d === null ? <span key={i} /> : (
                <button
                  key={i}
                  className={`datepicker-day ${isDisabled(viewYear, viewMonth, d) ? 'disabled' : ''} ${value === formatDate(new Date(viewYear, viewMonth, d)) ? 'selected' : ''}`}
                  onClick={() => selectDate(viewYear, viewMonth, d)}
                  disabled={isDisabled(viewYear, viewMonth, d)}
                >
                  {d}
                </button>
              )
            )}
          </div>

          {/* Quick buttons */}
          {quickButtons && quickButtons.length > 0 && (
            <div className="datepicker-quick">
              {quickButtons.map((q, i) => (
                <button key={i} className="datepicker-quick-btn" onClick={() => applyQuick(q.offsetYears, q.offsetMonths)}>
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
