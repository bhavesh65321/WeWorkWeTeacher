"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Textarea } from "@wtws/ui";
import {
  JOB_TYPES,
  LEVELS,
  TEACHING_MODES,
  MODE_LABELS,
  WHEN_NEEDED,
  WHEN_NEEDED_LABELS,
  JOB_FREQUENCIES,
  FREQUENCY_LABELS,
  BUDGET_TYPES,
  BUDGET_TYPE_LABELS,
  CURRENCIES,
  GENDER_PREFS,
  GENDER_PREF_LABELS,
  type JobCard,
  type TeachingMode,
} from "@wtws/shared";
import { apiClient } from "@/lib/client";
import type { Me } from "@/lib/api";

const STEPS = ["Need", "Where", "Budget"];

function buildTitle(form: { title: string; subject: string; modes: TeachingMode[]; city: string }) {
  if (form.title.trim().length >= 8) return form.title.trim();
  const mode = form.modes.includes("HOME") ? "Home" : form.modes.includes("ONLINE") ? "Online" : "";
  const loc = form.city ? ` in ${form.city}` : "";
  return `${form.subject} ${mode} tutor needed${loc}`.replace(/\s+/g, " ").trim();
}

export function JobRequirementForm({ job, prefillSubject }: { job?: JobCard; prefillSubject?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({
    type: (job?.type ?? "TUTORING") as "TUTORING" | "ASSIGNMENT",
    title: job?.title ?? "",
    description: job?.description ?? "",
    subject: job?.subject ?? prefillSubject ?? "",
    level: job?.level ?? "High school",
    modes: (job?.modes ?? ["ONLINE"]) as TeachingMode[],
    visibility: (job?.visibility ?? "PUBLIC") as "PUBLIC" | "PRIVATE",
    city: job?.city ?? "",
    country: job?.country ?? "India",
    budgetMin: job?.budgetMin != null ? String(job.budgetMin / 100) : "",
    budgetMax: job?.budgetMax != null ? String(job.budgetMax / 100) : "",
    whenNeeded: job?.whenNeeded ?? "FLEXIBLE",
    frequency: job?.frequency ?? "WEEKLY",
    budgetType: job?.budgetType ?? "HOURLY",
    genderPref: job?.genderPref ?? "ANY",
    currency: job?.currency ?? "INR",
  });

  useEffect(() => {
    if (job) return;
    apiClient<Me>("/auth/me")
      .then((me) => {
        setPhone(me.phone ?? "");
        setForm((f) => ({
          ...f,
          city: f.city || me.city || "",
          country: f.country || me.country || "India",
          visibility: (me.defaultVisibility as "PUBLIC" | "PRIVATE") || f.visibility,
        }));
      })
      .catch(() => undefined);
  }, [job]);

  function toggleMode(mode: TeachingMode) {
    setForm((f) => ({
      ...f,
      modes: f.modes.includes(mode) ? f.modes.filter((m) => m !== mode) : [...f.modes, mode],
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (phone && phone.length >= 10) {
        await apiClient("/auth/profile", { method: "PATCH", body: JSON.stringify({ phone }) }).catch(() => undefined);
      }
      const body = {
        type: form.type,
        title: buildTitle(form),
        description: form.description,
        subject: form.subject,
        level: form.level,
        modes: form.modes,
        visibility: form.visibility,
        city: form.city || undefined,
        country: form.country || undefined,
        budgetMin: form.budgetType === "FREE" ? undefined : form.budgetMin ? Math.round(Number(form.budgetMin) * 100) : undefined,
        budgetMax: form.budgetType === "FREE" ? undefined : form.budgetMax ? Math.round(Number(form.budgetMax) * 100) : undefined,
        whenNeeded: form.whenNeeded,
        frequency: form.frequency,
        budgetType: form.budgetType,
        genderPref: form.genderPref,
        currency: form.currency,
      };
      if (job) {
        await apiClient(`/jobs/${job.id}`, { method: "PATCH", body: JSON.stringify(body) });
        router.push(`/jobs/${job.id}`);
      } else {
        await apiClient<{ id: string }>("/jobs", { method: "POST", body: JSON.stringify(body) });
        router.push("/jobs/mine?posted=1");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Log in first.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">{job ? "Edit requirement" : "Request a tutor"}</h1>
      <p className="mt-2 text-[rgb(var(--muted-foreground))]">
        Short steps. Tutors apply in WTWS — never put your phone in the post.
      </p>
      <div className="mt-6 flex gap-2 text-sm font-semibold">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 ${i === step ? "bg-[rgb(var(--wtws-blue))] text-white" : "bg-[rgb(var(--muted))]"}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {step === 0 ? (
          <>
            <label className="block text-sm font-medium">
              I want
              <Select
                className="mt-1"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "TUTORING" | "ASSIGNMENT" })}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "TUTORING" ? "Tutoring" : "Assignment help"}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-medium">
              Subject / skill
              <Input
                className="mt-1"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Any skill — Chemistry, Python, Guitar, IELTS…"
              />
            </label>
            <label className="block text-sm font-medium">
              Title (optional)
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Leave blank to auto-fill from subject and city"
              />
            </label>
            <p className="text-sm font-medium text-red-600">
              Please don&apos;t share any contact details (phone, email, website) here.
            </p>
            <label className="block text-sm font-medium">
              Details of your requirement
              <Textarea
                className="mt-1 min-h-28"
                required
                minLength={20}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Required experience, expectations, budget, time, task details."
              />
            </label>
            <label className="block text-sm font-medium">
              Your level
              <Select className="mt-1" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </label>
          </>
        ) : null}
        {step === 1 ? (
          <>
            {!job ? (
              <label className="block text-sm font-medium">
                Phone
                <Input
                  className="mt-1"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                />
              </label>
            ) : null}
            <p className="text-sm font-medium">Meeting options</p>
            <div className="flex flex-wrap gap-2">
              {TEACHING_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMode(m)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    form.modes.includes(m) ? "bg-[rgb(var(--wtws-blue))] text-white" : "bg-[rgb(var(--muted))]"
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
            <label className="block text-sm font-medium">
              Location
              <Input
                className="mt-1"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City, region"
              />
            </label>
            <label className="block text-sm font-medium">
              Country
              <Input className="mt-1" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </label>
            <label className="block text-sm font-medium">
              Who can see this?
              <Select
                className="mt-1"
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as "PUBLIC" | "PRIVATE" })}
              >
                <option value="PUBLIC">Public — tutors can apply</option>
                <option value="PRIVATE">Private — I will contact tutors</option>
              </Select>
            </label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <label className="block text-sm font-medium">
              When do you need this?
              <Select className="mt-1" value={form.whenNeeded} onChange={(e) => setForm({ ...form, whenNeeded: e.target.value })}>
                {WHEN_NEEDED.map((v) => (
                  <option key={v} value={v}>
                    {WHEN_NEEDED_LABELS[v]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-medium">
              How often?
              <Select className="mt-1" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {JOB_FREQUENCIES.map((v) => (
                  <option key={v} value={v}>
                    {FREQUENCY_LABELS[v]}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-medium">
              Currency
              <Select
                className="mt-1"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block text-sm font-medium">
              Budget type
              <Select className="mt-1" value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })}>
                {BUDGET_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {BUDGET_TYPE_LABELS[v]}
                  </option>
                ))}
              </Select>
            </label>
            {form.budgetType !== "FREE" ? (
              <>
                <label className="block text-sm font-medium">
                  Budget from ({form.currency})
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Budget to ({form.currency})
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.budgetMax}
                    onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  />
                </label>
              </>
            ) : (
              <p className="text-sm text-[rgb(var(--muted-foreground))]">This request is listed as free.</p>
            )}
            <label className="block text-sm font-medium">
              Teacher preference
              <Select className="mt-1" value={form.genderPref} onChange={(e) => setForm({ ...form, genderPref: e.target.value })}>
                {GENDER_PREFS.map((v) => (
                  <option key={v} value={v}>
                    {GENDER_PREF_LABELS[v]}
                  </option>
                ))}
              </Select>
            </label>
          </>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : null}
          <Button type="submit" disabled={loading}>
            {step < 2 ? "Continue" : loading ? "Saving…" : job ? "Save changes" : "Post requirement and get teachers"}
          </Button>
        </div>
      </form>
    </div>
  );
}
