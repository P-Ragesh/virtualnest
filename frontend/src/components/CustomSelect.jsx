import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect — a fully styleable dropdown replacing native <select>.
 * Props:
 *   value        — currently selected value
 *   onChange     — called with the new value (same signature as e.target.value)
 *   options      — array of { value, label }
 *   className    — extra classes for the trigger button
 */
export default function CustomSelect({ value, onChange, options = [], className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label ?? value;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative select-none ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between gap-2 bg-surface border border-outline-variant text-body-md text-on-surface rounded-lg px-4 py-2.5 w-full cursor-pointer transition-all hover:border-[#536164] focus:border-[#536164] focus:shadow-[0_0_0_2px_rgba(83,97,100,0.15)]"
      >
        <span>{selectedLabel}</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-[#536164] transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#C8D5BB] rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map(opt => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 cursor-pointer text-body-md transition-colors
                    ${isSelected
                      ? 'bg-[#C8D5BB] text-[#2e3e40] font-semibold'
                      : 'text-[#3a4446] hover:bg-[#eef3eb]'
                    }`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
