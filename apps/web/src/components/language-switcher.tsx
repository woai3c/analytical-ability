import { cn } from "@/lib/utils";
import { useI18n, type Language } from "@/providers/i18n-provider";

const options: Array<{ value: Language; label: string }> = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5" aria-label={t("语言")}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "h-7 rounded px-2 text-[11px] text-muted-foreground outline-none transition focus-visible:ring-1 focus-visible:ring-ring",
            language === option.value && "bg-secondary text-secondary-foreground",
          )}
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
