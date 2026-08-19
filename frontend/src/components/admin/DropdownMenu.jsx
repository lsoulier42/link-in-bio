import { useEffect, useRef, useState } from 'react';

export default function DropdownMenu({ trigger, items, align = 'right', label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          className={`glass-elevated absolute z-30 mt-1 min-w-[10rem] rounded-[var(--radius-md)] py-1.5 anim-pop-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
              className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                item.danger
                  ? 'text-red-300 hover:bg-red-500/15 hover:text-red-200'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
