import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";

const choices = [
  { id: "fact", label: "事实" },
  { id: "hypothesis", label: "假设" },
  { id: "unknown", label: "未知" },
] as const;

export function TrainingPage() {
  const { t } = useI18n();
  const [answer, setAnswer] = useState<string | null>(null);
  const correct = answer === "hypothesis";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{t("轻量训练")}</div>
      <h1 className="mt-3 font-serif text-3xl tracking-tight">{t("用真实目标练分析，而不是背术语")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{t("每次目标分析会暴露一个具体能力缺口。训练中心据此生成 1—3 分钟练习，先让你判断，再给提示和反馈。")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{t("区分事实与假设")}</CardTitle>
              <Badge variant="outline">{t("约 1 分钟")}</Badge>
            </div>
            <CardDescription>{t("以下陈述属于哪一类？先独立判断，再查看解释。")}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <blockquote className="rounded-lg border-l-2 border-[var(--border-strong)] bg-muted p-5 text-base font-medium leading-7">{t("“只要我每周投入 10 小时，就一定能在六个月内成功转行。”")}</blockquote>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={cn(
                    "rounded-md border border-border px-3 py-3 text-sm transition hover:border-ring",
                    answer === choice.id && "border-primary bg-secondary text-secondary-foreground",
                  )}
                  onClick={() => setAnswer(choice.id)}
                >
                  {t(choice.label)}
                </button>
              ))}
            </div>
            {answer ? (
              <div className={cn("mt-5 rounded-md border p-4 text-sm leading-6", correct ? "border-[var(--success)]/35 bg-[var(--success)]/8" : "border-[var(--warning)]/35 bg-[var(--warning)]/8")}>
                <div className="font-medium">{t(correct ? "判断正确：这是假设" : "再想一步：这是尚未验证的假设")}</div>
                <p className="mt-1 text-muted-foreground">{t("“每周 10 小时”是投入条件，“六个月内成功转行”是结果。两者是否足够，需要岗位要求、能力基线、历史基准率和实际试验来验证。")}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("本轮训练目标")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label={t("事实与假设")} value={t("正在练习")} />
              <Row label={t("证据追溯")} value={t("下一项")} />
              <Row label={t("反例意识")} value={t("待评估")} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("与目标分析的连接")}</CardTitle></CardHeader>
            <CardContent className="text-xs leading-6 text-muted-foreground">{t("完成一次真实目标后，系统会从你修改最多、遗漏最多的环节生成下一道题，并把训练结果写回能力档案。")}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
