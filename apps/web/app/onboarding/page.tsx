"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@wtws/ui";
import { TEACHING_MODES, MODE_LABELS } from "@wtws/shared";
import { apiClient } from "@/lib/client";

const STEPS = ["Where you are", "How you learn", "Ready"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [mode, setMode] = useState("ONLINE");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setError("");
    try {
      await apiClient("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ city, country }),
      });
      router.push(mode === "POST" ? "/jobs/new" : "/tutors");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Set up your account</h1>
      <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
        Three short steps. You can message tutors or post a job next.
      </p>
      <p className="mt-4 text-sm font-semibold">
        {step + 1}. {STEPS[step]}
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {step === 0 ? (
          <>
            <label className="block text-sm font-medium">
              City
              <Input className="mt-1" required value={city} onChange={(e) => setCity(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Country
              <Input className="mt-1" required value={country} onChange={(e) => setCountry(e.target.value)} />
            </label>
          </>
        ) : null}
        {step === 1 ? (
          <label className="block text-sm font-medium">
            I want to
            <Select className="mt-1" value={mode} onChange={(e) => setMode(e.target.value)}>
              {TEACHING_MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
              <option value="POST">Post a job and let tutors apply</option>
            </Select>
          </label>
        ) : null}
        {step === 2 ? (
          <p className="text-sm">
            You are in {city}, {country}. Next you can find a tutor or post a requirement. Phone and WhatsApp stay
            hidden until you pay for a session.
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : null}
          <Button type="submit">{step < 2 ? "Continue" : "Finish"}</Button>
        </div>
      </form>
    </div>
  );
}
