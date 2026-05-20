"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  market: z.string().optional(),
  project: z.string().optional(),
  message: z.string().min(10),
  intent: z.enum(["sample", "contact", "dealer"]).default("contact"),
  collection: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const t = useTranslations("form");
  const sp = useSearchParams();
  const intent = (sp.get("intent") as FormValues["intent"]) || "contact";
  const collection = sp.get("collection") || sp.get("book") || "";

  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { intent, collection },
  });

  const onSubmit = async (data: FormValues) => {
    setStatus("loading");
    const endpoint = data.intent === "sample" ? "/api/sample-request" : data.intent === "dealer" ? "/api/dealer" : "/api/contact";
    try {
      const r = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(r.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  };

  if (status === "ok") {
    return <div className="border border-moss text-moss p-8"><p className="text-lg">{t("success")}</p></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex gap-3 text-xs uppercase tracking-widest">
        {(["sample","contact","dealer"] as const).map(opt => (
          <label key={opt} className="cursor-pointer">
            <input type="radio" value={opt} {...register("intent")} className="peer sr-only" />
            <span className="px-4 py-2 border border-ink/20 peer-checked:bg-ink peer-checked:text-bone transition-colors block">
              {opt === "sample" ? "Sample" : opt === "dealer" ? "Dealer" : "General"}
            </span>
          </label>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs uppercase tracking-widest text-stone">{t("name")} *</label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-red-700 mt-1">Required</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone">{t("email")} *</label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-700 mt-1">Invalid</p>}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone">{t("company")}</label>
          <Input {...register("company")} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-stone">{t("phone")}</label>
          <Input {...register("phone")} />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-stone">Market</label>
        <Input {...register("market")} placeholder="Workplace, hospitality, residential…" />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-stone">{t("message")} *</label>
        <Textarea rows={5} {...register("message")} />
        {errors.message && <p className="text-xs text-red-700 mt-1">Minimum 10 characters</p>}
      </div>

      {collection && <input type="hidden" {...register("collection")} />}

      <Button type="submit" disabled={status === "loading"} size="lg">
        {status === "loading" ? t("submitting") : t("submit")}
      </Button>

      {status === "err" && <p className="text-sm text-red-700">{t("error")}</p>}
    </form>
  );
}
