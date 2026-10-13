"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
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
  SKILL_SUGGESTIONS,
  LANGUAGE_OPTIONS,
  COUNTRY_OPTIONS,
  type JobCard,
  type TeachingMode,
} from "@wtws/shared";
import { apiClient } from "@/lib/client";
import type { Me } from "@/lib/api";
import { SearchableSelect, MultiSelect } from "./ui/searchable-select";

const STEPS = ["Requirement", "Location & Preferences", "Budget & Schedule"];

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
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [form, setForm] = useState({
    type: (job?.type ?? "TUTORING") as "TUTORING" | "ASSIGNMENT",
    title: job?.title ?? "",
    description: job?.description ?? "",
    subjects: job?.subject ? [job.subject] : prefillSubject ? [prefillSubject] : [] as string[],
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
    languages: [] as string[],
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

  async function detectLocation() {
    setDetectingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
              );
              const data = await res.json();
              const city = data.address?.city || data.address?.town || data.address?.village || "";
              const country = data.address?.country || "";
              setForm((f) => ({ ...f, city, country }));
            } catch {
              setError("Could not detect location. Please enter manually.");
            }
            setDetectingLocation(false);
          },
          () => {
            setError("Location access denied. Please enter manually.");
            setDetectingLocation(false);
          }
        );
      } else {
        setError("Geolocation not supported. Please enter manually.");
        setDetectingLocation(false);
      }
    } catch {
      setDetectingLocation(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError("Some files were too large (max 5MB each)");
    }
    setAttachments((prev) => [...prev, ...validFiles].slice(0, 3));
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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
        title: buildTitle({ ...form, subject: form.subjects[0] || "" }),
        description: form.description,
        subject: form.subjects[0] || "",
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
        languages: form.languages,
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
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{job ? "Edit requirement" : "Request a tutor"}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Short steps. Tutors apply in WTWS — never put your phone in the post.
      </p>
      
      {/* Progress Steps */}
      <div className="mt-6 flex gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              i === step
                ? "bg-[rgb(var(--wtws-blue))] text-white"
                : i < step
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {/* Step 1: Requirement Details */}
        {step === 0 && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">I want</label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "TUTORING" | "ASSIGNMENT" })}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "TUTORING" ? "Tutoring" : "Assignment help"}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Subject / Skills <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={[...SKILL_SUGGESTIONS]}
                selected={form.subjects}
                onChange={(subjects) => setForm({ ...form, subjects })}
                placeholder="Search or add subjects..."
                allowCustom
              />
              <p className="mt-1 text-xs text-slate-400">
                If not in options above, add a new subject
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title (optional)</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Leave blank to auto-fill from subject and city"
              />
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">
                ⚠️ Please don&apos;t share any contact details (phone, email, website) here.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Details of your requirement <span className="text-red-500">*</span>
              </label>
              <Textarea
                className="min-h-32"
                required
                minLength={20}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Required experience, expectations, budget, time, task details."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Your level</label>
              <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </Select>
            </div>

            {/* Attachment Upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Supporting Documents (optional)
              </label>
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                />
                <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">
                  Click to upload syllabus, assignment, or reference materials
                </p>
                <p className="mt-1 text-xs text-slate-400">PDF, DOC, JPG, PNG (max 5MB each, up to 3 files)</p>
              </div>
              {attachments.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {attachments.map((file, i) => (
                    <li key={i} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
                      <span className="truncate text-slate-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="ml-2 text-slate-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {/* Step 2: Location & Preferences */}
        {step === 1 && (
          <>
            {!job && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Meeting options</label>
              <div className="flex flex-wrap gap-2">
                {TEACHING_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMode(m)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      form.modes.includes(m) 
                        ? "bg-[rgb(var(--wtws-blue))] text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {detectingLocation ? "Detecting..." : "Auto-detect"}
                </button>
              </div>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City, region"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Get tutors from (Country)</label>
              <SearchableSelect
                options={[...COUNTRY_OPTIONS]}
                value={form.country}
                onChange={(country) => setForm({ ...form, country })}
                placeholder="Search country..."
                allowCustom
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Communicate in (Languages)</label>
              <MultiSelect
                options={[...LANGUAGE_OPTIONS]}
                selected={form.languages}
                onChange={(languages) => setForm({ ...form, languages })}
                placeholder="Select languages..."
                allowCustom
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Who can see this?</label>
              <Select
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value as "PUBLIC" | "PRIVATE" })}
              >
                <option value="PUBLIC">Public — tutors can apply</option>
                <option value="PRIVATE">Private — I will contact tutors</option>
              </Select>
            </div>
          </>
        )}

        {/* Step 3: Budget & Schedule */}
        {step === 2 && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">When do you need this?</label>
              <Select value={form.whenNeeded} onChange={(e) => setForm({ ...form, whenNeeded: e.target.value })}>
                {WHEN_NEEDED.map((v) => (
                  <option key={v} value={v}>
                    {WHEN_NEEDED_LABELS[v]}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">How often?</label>
              <Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                {JOB_FREQUENCIES.map((v) => (
                  <option key={v} value={v}>
                    {FREQUENCY_LABELS[v]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Currency</label>
                <Select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget type</label>
                <Select value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })}>
                  {BUDGET_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {BUDGET_TYPE_LABELS[v]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {form.budgetType !== "FREE" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget from ({form.currency})</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget to ({form.currency})</label>
                  <Input
                    type="number"
                    min={0}
                    value={form.budgetMax}
                    onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                    placeholder="Max"
                  />
                </div>
              </div>
            )}

            {form.budgetType === "FREE" && (
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-sm text-emerald-700">✓ This request is listed as free.</p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Teacher preference</label>
              <Select value={form.genderPref} onChange={(e) => setForm({ ...form, genderPref: e.target.value })}>
                {GENDER_PREFS.map((v) => (
                  <option key={v} value={v}>
                    {GENDER_PREF_LABELS[v]}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep(step - 1)} className="px-6">
              Back
            </Button>
          )}
          <Button type="submit" disabled={loading} className="flex-1">
            {step < 2 ? "Continue" : loading ? "Saving…" : job ? "Save changes" : "Post requirement and get teachers"}
          </Button>
        </div>
      </form>
    </div>
  );
}
