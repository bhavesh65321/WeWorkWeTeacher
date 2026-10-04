"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@wtws/ui";
import {
  LEVELS,
  SKILL_SUGGESTIONS,
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  TEACHING_MODES,
  MODE_LABELS,
  TUTOR_GENDERS,
  TUTOR_GENDER_LABELS,
  TUTOR_WORKS_AS,
  TUTOR_WORKS_AS_LABELS,
  LANGUAGE_OPTIONS,
  CURRENCIES,
  RATE_TYPES,
  RATE_TYPE_LABELS,
  type TeachingMode,
  type TutorGender,
  type TutorWorksAs,
  type SkillLevel,
  type RateType,
  type TutorSkill,
} from "@wtws/shared";
import { apiClient, apiUpload } from "@/lib/client";
import { TutorAvatar } from "@/components/tutor-avatar";

type TutorMe = {
  slug: string;
  name?: string;
  headline: string | null;
  bio: string | null;
  hourlyRateMinor: number | null;
  hourlyRateMaxMinor: number | null;
  currency: string;
  rateType?: string;
  photoUrl?: string | null;
  city: string | null;
  country: string | null;
  timezone: string;
  subjects: string[];
  skills?: TutorSkill[];
  languages: string[];
  levels: string[];
  modes: TeachingMode[];
  teachingApproach: string | null;
  experience: string | null;
  education: string | null;
  freeTrialMinutes: number;
  yearsTeaching: number | null;
  yearsOnline: number | null;
  gender: string | null;
  worksAs: string;
};

const chipOn = "bg-[rgb(var(--wtws-blue))] text-white";
const chipOff = "bg-[rgb(var(--muted))]";

export default function EditTutorProfilePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Tutor");
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    hourlyRate: "",
    hourlyRateMax: "",
    currency: "INR",
    rateType: "HOURLY" as RateType,
    city: "",
    country: "India",
    timezone: "UTC",
    skills: [] as TutorSkill[],
    languages: ["English"] as string[],
    levels: "High school",
    modes: ["ONLINE"] as TeachingMode[],
    teachingApproach: "",
    experience: "",
    education: "",
    freeTrialMinutes: "0",
    yearsTeaching: "",
    yearsOnline: "",
    gender: "UNDISCLOSED" as TutorGender,
    worksAs: "INDIVIDUAL" as TutorWorksAs,
  });
  const [subjectDraft, setSubjectDraft] = useState("");
  const [languageDraft, setLanguageDraft] = useState("");
  const [catalog, setCatalog] = useState<string[]>([...SKILL_SUGGESTIONS]);

  useEffect(() => {
    apiClient<{ subjects: string[] }>("/tutors/meta")
      .then((m) => {
        const extra = m.subjects.filter((s) => !SKILL_SUGGESTIONS.some((g) => g.toLowerCase() === s.toLowerCase()));
        setCatalog([...SKILL_SUGGESTIONS, ...extra].slice(0, 48));
      })
      .catch(() => undefined);
    apiClient<TutorMe>("/tutors/me")
      .then((t) => {
        const skills =
          t.skills?.length
            ? t.skills
            : t.subjects.map((name) => ({ name, level: "INTERMEDIATE" as SkillLevel }));
        setPhotoUrl(t.photoUrl ?? null);
        setDisplayName(t.name ?? "Tutor");
        setForm({
          headline: t.headline ?? "",
          bio: t.bio ?? "",
          hourlyRate: t.hourlyRateMinor != null ? String(t.hourlyRateMinor / 100) : "",
          hourlyRateMax: t.hourlyRateMaxMinor != null ? String(t.hourlyRateMaxMinor / 100) : "",
          currency: t.currency || "INR",
          rateType: ((t.rateType as RateType) || "HOURLY") as RateType,
          city: t.city ?? "",
          country: t.country ?? "",
          timezone: t.timezone,
          skills,
          languages: t.languages.length ? t.languages : ["English"],
          levels: t.levels.join(", ") || "High school",
          modes: t.modes.length ? t.modes : ["ONLINE"],
          teachingApproach: t.teachingApproach ?? "",
          experience: t.experience ?? "",
          education: t.education ?? "",
          freeTrialMinutes: String(t.freeTrialMinutes ?? 0),
          yearsTeaching: t.yearsTeaching != null ? String(t.yearsTeaching) : "",
          yearsOnline: t.yearsOnline != null ? String(t.yearsOnline) : "",
          gender: (t.gender as TutorGender) || "UNDISCLOSED",
          worksAs: (t.worksAs as TutorWorksAs) || "INDIVIDUAL",
        });
      })
      .catch(() => setError("Enable tutor role first, then edit your teaching profile"));
  }, []);

  function hasSkill(name: string) {
    return form.skills.some((s) => s.name.toLowerCase() === name.toLowerCase());
  }

  function toggleSkill(name: string) {
    const next = name.trim().replace(/\s+/g, " ");
    if (next.length < 2) return;
    setForm((f) => {
      if (f.skills.some((s) => s.name.toLowerCase() === next.toLowerCase())) {
        return { ...f, skills: f.skills.filter((s) => s.name.toLowerCase() !== next.toLowerCase()) };
      }
      if (f.skills.length >= 30) return f;
      return { ...f, skills: [...f.skills, { name: next, level: "INTERMEDIATE" }] };
    });
    setSubjectDraft("");
  }

  function setSkillLevel(name: string, level: SkillLevel) {
    setForm((f) => ({
      ...f,
      skills: f.skills.map((s) => (s.name === name ? { ...s, level } : s)),
    }));
  }

  function toggleLanguage(name: string) {
    const next = name.trim();
    if (next.length < 2) return;
    setForm((f) => {
      if (f.languages.some((s) => s.toLowerCase() === next.toLowerCase())) {
        const languages = f.languages.filter((s) => s.toLowerCase() !== next.toLowerCase());
        return { ...f, languages: languages.length ? languages : f.languages };
      }
      return { ...f, languages: [...f.languages, next] };
    });
    setLanguageDraft("");
  }

  function toggleMode(mode: TeachingMode) {
    setForm((f) => {
      const modes = f.modes.includes(mode) ? f.modes.filter((m) => m !== mode) : [...f.modes, mode];
      return { ...f, modes: modes.length ? modes : f.modes };
    });
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const saved = await apiUpload<{ photoUrl: string | null }>("/tutors/me/photo", file);
      setPhotoUrl(saved.photoUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.headline.trim().length < 8) {
      setError("Headline is required (at least 8 characters)");
      return;
    }
    if (form.bio.trim().length < 20) {
      setError("Bio is required (at least 20 characters)");
      return;
    }
    if (form.rateType !== "FREE" && !form.hourlyRate) {
      setError("Add a rate, or set pricing to Free");
      return;
    }
    if (form.skills.length < 1) {
      setError("Select at least one subject or skill");
      return;
    }
    if (!form.modes.length) {
      setError("Select how you teach");
      return;
    }
    if (!form.languages.length) {
      setError("Select at least one language");
      return;
    }
    if (!form.city.trim() || !form.country.trim()) {
      setError("City and country are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const saved = await apiClient<{ slug: string }>("/tutors/me", {
        method: "PATCH",
        body: JSON.stringify({
          headline: form.headline,
          bio: form.bio,
          currency: form.currency,
          rateType: form.rateType,
          hourlyRateMinor: form.rateType === "FREE" ? 0 : Math.round(Number(form.hourlyRate) * 100),
          hourlyRateMaxMinor:
            form.rateType === "FREE" || !form.hourlyRateMax ? undefined : Math.round(Number(form.hourlyRateMax) * 100),
          city: form.city,
          country: form.country,
          timezone: form.timezone,
          skills: form.skills,
          languages: form.languages,
          levels: form.levels
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          modes: form.modes,
          teachingApproach: form.teachingApproach,
          experience: form.experience,
          education: form.education,
          freeTrialMinutes: Number(form.freeTrialMinutes) || 0,
          yearsTeaching: form.yearsTeaching ? Number(form.yearsTeaching) : undefined,
          yearsOnline: form.yearsOnline ? Number(form.yearsOnline) : undefined,
          gender: form.gender,
          worksAs: form.worksAs,
        }),
      });
      router.push(`/tutors/${saved.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  }

  const rateLabel =
    form.rateType === "MONTHLY" ? "Monthly rate" : form.rateType === "COURSE" ? "Course fee" : "Hourly rate";

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Edit Profile
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Teaching profile</h1>
        <p className="mt-2 text-slate-600">
          Public page students see. Phone stays hidden until a student pays. Fields marked * are required.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <div className="mt-2 flex items-center gap-4">
            <TutorAvatar name={displayName} photoUrl={photoUrl} className="h-20 w-20 text-2xl" />
            <label className="cursor-pointer text-sm font-semibold text-[rgb(var(--wtws-blue))]">
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => onPhoto(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
        <label className="block text-sm font-medium">
          Headline *
          <Input
            className="mt-1"
            required
            minLength={8}
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            placeholder="AP Physics & IB Maths, evenings EST"
          />
        </label>
        <label className="block text-sm font-medium">
          Bio *
          <Textarea
            className="mt-1 min-h-28"
            required
            minLength={20}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Teaching approach (one point per line)
          <Textarea
            className="mt-1 min-h-24"
            value={form.teachingApproach}
            onChange={(e) => setForm({ ...form, teachingApproach: e.target.value })}
            placeholder={"Concept-first learning\nInteractive coding sessions"}
          />
        </label>
        <label className="block text-sm font-medium">
          Experience
          <Textarea
            className="mt-1 min-h-24"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Education
          <Textarea
            className="mt-1 min-h-20"
            value={form.education}
            onChange={(e) => setForm({ ...form, education: e.target.value })}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Currency *
            <select
              className="mt-1 min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Pricing *
            <select
              className="mt-1 min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm"
              value={form.rateType}
              onChange={(e) => setForm({ ...form, rateType: e.target.value as RateType })}
            >
              {RATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {RATE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {form.rateType !== "FREE" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              {rateLabel} from ({form.currency}) *
              <Input
                className="mt-1"
                type="number"
                required
                min={0}
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium">
              {rateLabel} to ({form.currency})
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={form.hourlyRateMax}
                onChange={(e) => setForm({ ...form, hourlyRateMax: e.target.value })}
              />
            </label>
          </div>
        ) : (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">This profile is listed as free.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Years teaching
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.yearsTeaching}
              onChange={(e) => setForm({ ...form, yearsTeaching: e.target.value })}
            />
          </label>
          <label className="block text-sm font-medium">
            Years online
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.yearsOnline}
              onChange={(e) => setForm({ ...form, yearsOnline: e.target.value })}
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Free trial (minutes, 0 = none)
          <Input
            className="mt-1"
            type="number"
            min={0}
            value={form.freeTrialMinutes}
            onChange={(e) => setForm({ ...form, freeTrialMinutes: e.target.value })}
          />
        </label>
        <div>
          <p className="text-sm font-medium">Subjects & skills *</p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
            Tap to select. Set a level for each skill (beginner to expert). You can also type your own.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {catalog.map((s) => (
              <button
                key={s}
                type="button"
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hasSkill(s) ? chipOn : chipOff}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={subjectDraft}
              onChange={(e) => setSubjectDraft(e.target.value)}
              placeholder="Add any skill (e.g. Python, Guitar, IELTS)"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                toggleSkill(subjectDraft);
              }}
            />
            <Button type="button" variant="secondary" onClick={() => toggleSkill(subjectDraft)}>
              Add
            </Button>
          </div>
          <ul className="mt-3 divide-y divide-[rgb(var(--border))] rounded-xl border border-[rgb(var(--border))]">
            {form.skills.map((s) => (
              <li key={s.name} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span className="font-medium">{s.name}</span>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg border border-[rgb(var(--border))] bg-white px-2 py-1 text-xs"
                    value={s.level}
                    onChange={(e) => setSkillLevel(s.name, e.target.value as SkillLevel)}
                  >
                    {SKILL_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {SKILL_LEVEL_LABELS[l]}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="text-red-600" onClick={() => toggleSkill(s.name)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {form.skills.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">Select at least one skill.</li>
            ) : null}
          </ul>
        </div>
        <p className="text-sm font-medium">How you teach *</p>
        <div className="flex flex-wrap gap-2">
          {TEACHING_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMode(m)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${form.modes.includes(m) ? chipOn : chipOff}`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <label className="block text-sm font-medium">
          Learner levels
          <Input className="mt-1" value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} />
          <span className="mt-1 block text-xs text-[rgb(var(--muted-foreground))]">{LEVELS.join(", ")}</span>
        </label>
        <div>
          <p className="text-sm font-medium">Languages *</p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">Select every language you teach in.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l}
                type="button"
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  form.languages.some((x) => x.toLowerCase() === l.toLowerCase()) ? chipOn : chipOff
                }`}
                onClick={() => toggleLanguage(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={languageDraft}
              onChange={(e) => setLanguageDraft(e.target.value)}
              placeholder="Add another language"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                toggleLanguage(languageDraft);
              }}
            />
            <Button type="button" variant="secondary" onClick={() => toggleLanguage(languageDraft)}>
              Add
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Gender (public)
            <select
              className="mt-1 min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as TutorGender })}
            >
              {TUTOR_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {TUTOR_GENDER_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Works as
            <select
              className="mt-1 min-h-11 w-full rounded-lg border border-[rgb(var(--border))] bg-white px-3 text-sm"
              value={form.worksAs}
              onChange={(e) => setForm({ ...form, worksAs: e.target.value as TutorWorksAs })}
            >
              {TUTOR_WORKS_AS.map((w) => (
                <option key={w} value={w}>
                  {TUTOR_WORKS_AS_LABELS[w]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-medium">
          City *
          <Input
            className="mt-1"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Country *
          <Input
            className="mt-1"
            required
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </label>
        <label className="block text-sm font-medium">
          Timezone
          <Input
            className="mt-1"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save and view profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
