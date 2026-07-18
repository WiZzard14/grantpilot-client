"use client";

import { useQuery } from "@tanstack/react-query";
import { Camera, ImageUp, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";
import type { StudentProfile, User } from "@/types";

const initial: StudentProfile = {
  gpaScale: 4,
  workExperienceYears: 0,
  preferredCountries: [],
  preferredFields: [],
  fundingPreference: "any",
  englishTests: []
};

function ProfileContent() {
  const { refreshUser, setUser, user } = useAuth();
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<StudentProfile | null>("/profile").then((res) => res.data)
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<StudentProfile>(initial);
  const [countries, setCountries] = useState("");
  const [fields, setFields] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    if (query.data) {
      setForm({ ...initial, ...query.data });
      setCountries(query.data.preferredCountries?.join(", ") ?? "");
      setFields(query.data.preferredFields?.join(", ") ?? "");
    }
  }, [query.data]);

  const set = (key: keyof StudentProfile, value: unknown) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveAvatar = async (payload: { image?: string; useGoogle?: boolean; remove?: boolean }) => {
    const response = await apiFetch<User>("/profile/avatar", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    setUser(response.data);
    setAvatarUrl("");
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setAvatarBusy(true);
    try {
      const image = await uploadImageToImgBB(file);
      await saveAvatar({ image });
      toast.success("Custom profile photo saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload profile photo");
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveAvatarUrl = async () => {
    const image = avatarUrl.trim();
    if (!image) return toast.error("Paste a valid image URL first");

    setAvatarBusy(true);
    try {
      await saveAvatar({ image });
      toast.success("Custom profile photo saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile photo");
    } finally {
      setAvatarBusy(false);
    }
  };

  const useGooglePhoto = async () => {
    setAvatarBusy(true);
    try {
      await saveAvatar({ useGoogle: true });
      toast.success("Google profile photo restored");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore Google photo");
    } finally {
      setAvatarBusy(false);
    }
  };

  const removePhoto = async () => {
    setAvatarBusy(true);
    try {
      await saveAvatar({ remove: true });
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove profile photo");
    } finally {
      setAvatarBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          preferredCountries: countries
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          preferredFields: fields
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });
      await refreshUser();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-bold uppercase tracking-widest text-teal-700">Matching context</p>
          <h1 className="mt-2 text-4xl font-black">Academic profile</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Use factual information. The recommendation agent will treat incomplete fields as uncertainty, not invent missing evidence.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-6 py-4 text-white">
          <p className="text-xs uppercase tracking-wider text-slate-400">Completion</p>
          <p className="mt-1 text-3xl font-black text-teal-300">{user?.profileCompletion ?? 0}%</p>
        </div>
      </div>

      {user && (
        <section className="mt-10 rounded-[2rem] border bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              <UserAvatar name={user.name} image={user.image} size="xl" className="ring-4 ring-teal-50" />
              <span className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full border-4 border-white bg-teal-600 text-white">
                <Camera size={16} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black">Profile photo</h2>
              <p className="mt-1 text-sm text-slate-600">
                Current source: {user.imageSource === "custom" ? "Custom photo" : user.imageSource === "google" ? "Google account" : "Initials fallback"}.
                A custom photo is never overwritten when you sign in with Google again.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => void uploadAvatar(event.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-black text-white disabled:opacity-60"
                >
                  <ImageUp size={17} />
                  {avatarBusy ? "Updating…" : "Upload custom photo"}
                </button>

                {user.hasGoogleImage && user.imageSource !== "google" && (
                  <button
                    type="button"
                    disabled={avatarBusy}
                    onClick={() => void useGooglePhoto()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700 disabled:opacity-60"
                  >
                    <RefreshCw size={17} />
                    Use Google photo
                  </button>
                )}

                {user.image && (
                  <button
                    type="button"
                    disabled={avatarBusy}
                    onClick={() => void removePhoto()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-black text-rose-700 disabled:opacity-60"
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-4 flex max-w-2xl flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="Or paste a direct image URL"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm"
                />
                <button
                  type="button"
                  disabled={avatarBusy || !avatarUrl.trim()}
                  onClick={() => void saveAvatarUrl()}
                  className="h-11 rounded-xl border border-teal-600 px-4 text-sm font-black text-teal-700 disabled:opacity-50"
                >
                  Save URL
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">PNG, JPG, WebP or GIF. Maximum upload size: 10 MB.</p>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={submit} className="mt-6 grid gap-6 rounded-[2rem] border bg-white p-6 sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["nationality", "Nationality", "Bangladesh"],
            ["currentCountry", "Current country", "Bangladesh"],
            ["fieldOfStudy", "Current field of study", "Computer Science"],
            ["graduationYear", "Graduation year", "2026"]
          ].map(([key, label, placeholder]) => (
            <label key={key} className="grid gap-2 text-sm font-black">
              {label}
              <input
                value={String(form[key as keyof StudentProfile] ?? "")}
                onChange={(event) =>
                  set(key as keyof StudentProfile, key === "graduationYear" ? Number(event.target.value) : event.target.value)
                }
                placeholder={placeholder}
                className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm font-black">
            Current degree level
            <select
              value={form.degreeLevel ?? ""}
              onChange={(event) => set("degreeLevel", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal"
            >
              <option value="">Select level</option>
              <option value="high-school">High school</option>
              <option value="bachelors">Bachelor&apos;s</option>
              <option value="masters">Master&apos;s</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black">
            Funding preference
            <select
              value={form.fundingPreference ?? "any"}
              onChange={(event) => set("fundingPreference", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal"
            >
              <option value="any">Any funding</option>
              <option value="fully-funded">Fully funded</option>
              <option value="tuition-waiver">Tuition waiver</option>
              <option value="partial">Partial funding</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-black">
            GPA
            <div className="grid grid-cols-[1fr_100px] gap-2">
              <input
                type="number"
                step="0.01"
                value={form.gpa ?? ""}
                onChange={(event) => set("gpa", Number(event.target.value))}
                className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
              />
              <input
                type="number"
                step="0.1"
                value={form.gpaScale ?? 4}
                onChange={(event) => set("gpaScale", Number(event.target.value))}
                className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
                aria-label="GPA scale"
              />
            </div>
          </label>

          <label className="grid gap-2 text-sm font-black">
            Work experience (years)
            <input
              type="number"
              step="0.5"
              value={form.workExperienceYears ?? 0}
              onChange={(event) => set("workExperienceYears", Number(event.target.value))}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-black">
          Preferred countries <span className="font-normal text-slate-500">Comma-separated</span>
          <input
            value={countries}
            onChange={(event) => setCountries(event.target.value)}
            placeholder="Germany, Finland, United Kingdom"
            className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
          />
        </label>

        <label className="grid gap-2 text-sm font-black">
          Preferred fields <span className="font-normal text-slate-500">Comma-separated</span>
          <input
            value={fields}
            onChange={(event) => setFields(event.target.value)}
            placeholder="Computer Science, Data Science"
            className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
          />
        </label>

        <label className="grid gap-2 text-sm font-black">
          Private planning notes
          <textarea
            value={form.notes ?? ""}
            onChange={(event) => set("notes", event.target.value)}
            rows={4}
            className="rounded-xl border border-slate-300 px-4 py-3 font-normal"
            placeholder="Constraints or goals the agent should consider"
          />
        </label>

        <button disabled={saving} className="h-12 rounded-xl bg-slate-950 font-black text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
