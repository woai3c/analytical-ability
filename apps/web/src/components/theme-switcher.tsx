import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { useTheme, type Theme } from "@/providers/theme-provider";

const options: Theme[] = ["light", "dark"];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5" aria-label={t("主题")}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "h-7 rounded px-2 text-[11px] text-muted-foreground outline-none transition focus-visible:ring-1 focus-visible:ring-ring",
            theme === option && "bg-secondary text-secondary-foreground",
          )}
          onClick={() => setTheme(option)}
          aria-pressed={theme === option}
        >
          {t(option === "light" ? "浅色" : "深色")}
        </button>
      ))}
    </div>
  );
}
