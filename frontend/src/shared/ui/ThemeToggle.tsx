import { Sun, Moon, Monitor } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setTheme, selectTheme } from "../../features/theme/themeSlice";
import { useState, useRef, useEffect } from "react";

export const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { value: "light" as const, icon: Sun, label: "Светлая" },
    { value: "dark" as const, icon: Moon, label: "Тёмная" },
    { value: "system" as const, icon: Monitor, label: "Системная" },
  ];

  const currentThemeInfo =
    themes.find((t) => t.value === currentTheme) || themes[0];
  const CurrentIcon = currentThemeInfo.icon;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        title="Тема оформления"
      >
        <CurrentIcon size={20} className="" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => {
                dispatch(setTheme(value));
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                currentTheme === value
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {currentTheme === value && (
                <span className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
