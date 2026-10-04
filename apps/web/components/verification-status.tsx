"use client";

import { useState } from "react";
import { Button, Input } from "@wtws/ui";
import { apiClient } from "@/lib/client";
import type { Me } from "@/lib/api";

interface VerificationStatusProps {
  me: Me;
  onVerified?: () => void;
}

export function VerificationStatus({ me, onVerified }: VerificationStatusProps) {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAddPhone() {
    try {
      setLoading(true);
      setError(null);
      await apiClient("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone }),
      });
      setShowPhoneInput(false);
      setShowOtpInput(true);
      setSuccess("OTP sent to your phone");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add phone");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPhone() {
    try {
      setLoading(true);
      setError(null);
      await apiClient("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp, channel: "PHONE" }),
      });
      setShowOtpInput(false);
      setOtp("");
      setSuccess("Phone verified successfully!");
      onVerified?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmail() {
    try {
      setLoading(true);
      setError(null);
      await apiClient("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ channel: "EMAIL" }),
      });
      setSuccess("OTP sent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-[rgb(var(--border))] p-4">
      <h2 className="text-lg font-semibold">Account Verification</h2>

      {error && (
        <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Email Verification */}
      <div className="flex items-center justify-between rounded-lg bg-[rgb(var(--muted))] p-3">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${me.emailVerified ? "bg-green-500" : "bg-red-500"}`} />
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">{me.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {me.emailVerified ? "✓ Verified" : "✗ Not verified"}
          </span>
          {!me.emailVerified && (
            <Button
              variant="outline"
              onClick={handleVerifyEmail}
              disabled={loading}
              className="text-xs"
            >
              Verify
            </Button>
          )}
        </div>
      </div>

      {/* Phone Verification */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-[rgb(var(--muted))] p-3">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${me.phoneVerified ? "bg-green-500" : "bg-red-500"}`} />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                {me.phone ? `${me.phone}` : "Not added"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">
              {me.phoneVerified ? "✓ Verified" : "✗ Not verified"}
            </span>
            {!me.phoneVerified && (
              <Button
                variant="outline"
                onClick={() => setShowPhoneInput(!showPhoneInput)}
                disabled={loading}
                className="text-xs"
              >
                {me.phone ? "Verify" : "Add & Verify"}
              </Button>
            )}
          </div>
        </div>

        {/* Phone Input */}
        {showPhoneInput && (
          <div className="space-y-2 rounded-lg border border-[rgb(var(--border))] p-3">
            <Input
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddPhone}
                disabled={loading || !phone.trim()}
                className="text-xs"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPhoneInput(false)}
                disabled={loading}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* OTP Input */}
        {showOtpInput && (
          <div className="space-y-2 rounded-lg border border-[rgb(var(--border))] p-3">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Enter the OTP sent to {phone}
            </p>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              maxLength={6}
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleVerifyPhone}
                disabled={loading || otp.length !== 6}
                className="text-xs"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                }}
                disabled={loading}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Summary */}
      <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
        <p className="font-semibold">Why verify?</p>
        <ul className="mt-1 list-inside list-disc space-y-1">
          <li>Build trust with tutors and students</li>
          <li>Unlock contact information sharing</li>
          <li>Improve account security</li>
        </ul>
      </div>
    </div>
  );
}
