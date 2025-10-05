// CustomSelect.jsx — accessible, keyboard-friendly minimal implementation
import { useState, useRef, useEffect } from "react";

export default function CustomSelect({ options = [], value, onChange, placeholder = "Select" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const focusedIndexRef = useRef(-1);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const toggle = () => setOpen((s) => !s);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusedIndexRef.current = Math.min(focusedIndexRef.current + 1, options.length - 1);
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
      setOpen(true);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && focusedIndexRef.current >= 0) {
        onChange(options[focusedIndexRef.current].value);
        setOpen(false);
      } else {
        setOpen(true);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        type="button"
        className="custom-select-toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={handleKey}
      >
        <span className="cs-value">
          {options.find((o) => o.value === value)?.label || placeholder}
        </span>
        <span className="cs-chevron">▾</span>
      </button>

      {open && (
        <ul role="listbox" className="custom-select-list" tabIndex={-1}>
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-option ${opt.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
