import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ExpoDropdown = ({
  expos = [],
  selectedExpoId,
  onSelect,
  label = "Expo:",
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedExpo =
    expos.find((ex) => ex._id === selectedExpoId) || expos[0];

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxViewportWidth = window.innerWidth - 32;
    const menuWidth = Math.min(Math.max(rect.width, 280), maxViewportWidth);
    const left = Math.min(
      Math.max(16, rect.right - menuWidth),
      window.innerWidth - menuWidth - 16,
    );
    setCoords({
      top: rect.bottom + 8,
      left,
      width: menuWidth,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, updatePosition]);

  if (!expos.length) return null;

  return (
    <div className="relative w-full md:w-auto">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updatePosition();
          setOpen((prev) => !prev);
        }}
        className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 shrink-0">
          {label}
        </span>
        <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[230px]">
          {selectedExpo?.title || "Select Expo"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-1 max-h-72 overflow-y-auto"
          >
            {expos.map((ex) => {
              const isSelected = ex._id === selectedExpoId;
              return (
                <button
                  key={ex._id}
                  type="button"
                  onClick={() => {
                    onSelect(ex._id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">
                      {ex.title}
                    </div>
                    {ex.location?.city && (
                      <div
                        className={`text-xs truncate ${
                          isSelected ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {ex.location.venueName || ex.location.city}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ExpoDropdown;
