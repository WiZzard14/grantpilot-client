"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/imgbb";

const initial = {
  title: "", shortDescription: "", fullDescription: "", providerName: "", country: "", location: "International",
  degreeLevels: "", fields: "", fundingType: "Fully Funded", estimatedValue: "", currency: "USD", benefits: "",
  eligibility: "", requiredDocuments: "", minimumGpa: "", deadline: "", imageUrl: "", officialUrl: "", sourceUrl: ""
};

function AddItemContent() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const router = useRouter();
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      set("imageUrl", url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/scholarships", { method: "POST", body: JSON.stringify({
        title: form.title,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        providerName: form.providerName,
        providerImage: form.imageUrl || "/scholarships/custom.svg",
        images: form.imageUrl ? [form.imageUrl] : ["/scholarships/custom.svg"],
        country: form.country,
        location: form.location,
        degreeLevels: list(form.degreeLevels),
        fields: list(form.fields),
        fundingType: form.fundingType,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
        currency: form.currency.toUpperCase(),
        benefits: list(form.benefits),
        eligibility: list(form.eligibility),
        requiredDocuments: list(form.requiredDocuments),
        minimumGpa: form.minimumGpa ? Number(form.minimumGpa) : undefined,
        deadline: form.deadline,
        deadlineLabel: "User-submitted listing — verify the official source",
        deadlineIsEstimated: false,
        officialUrl: form.officialUrl,
        sourceUrl: form.sourceUrl,
        lastVerifiedAt: new Date().toISOString()
      }) });
      toast.success("Scholarship submitted");
      router.push("/items/manage");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const input = "h-12 rounded-xl border border-slate-300 px-4 font-normal";
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div>
        <p className="font-bold uppercase tracking-widest text-teal-700">Protected item creation</p>
        <h1 className="mt-2 text-4xl font-black">Add a scholarship</h1>
        <p className="mt-4 leading-7 text-slate-600">Student submissions enter a pending moderation state. Administrators can publish verified records directly.</p>
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-6 rounded-[2rem] border bg-white p-6 sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-black md:col-span-2">Title<input required value={form.title} onChange={(e) => set("title", e.target.value)} className={input} /></label>
          <label className="grid gap-2 text-sm font-black md:col-span-2">Short description<textarea required minLength={20} maxLength={320} rows={3} value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
          <label className="grid gap-2 text-sm font-black md:col-span-2">Full description<textarea required minLength={80} rows={7} value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>

          {[ ["providerName", "Provider name"], ["country", "Country"], ["location", "Location"], ["deadline", "Deadline"], ["degreeLevels", "Degree levels (comma-separated)"], ["fields", "Fields (comma-separated)"], ["estimatedValue", "Estimated funding value"], ["currency", "Currency code"], ["minimumGpa", "Minimum GPA (optional)"], ["officialUrl", "Official application URL"], ["sourceUrl", "Source URL"] ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-black">{label}<input required={!(["estimatedValue", "minimumGpa"].includes(key))} type={key === "deadline" ? "datetime-local" : key.includes("Url") ? "url" : key === "estimatedValue" || key === "minimumGpa" ? "number" : "text"} step={key === "minimumGpa" ? "0.01" : undefined} value={form[key as keyof typeof form]} onChange={(e) => set(key as keyof typeof form, e.target.value)} className={input} /></label>
          ))}

          <label className="grid gap-2 text-sm font-black">Funding type<select value={form.fundingType} onChange={(e) => set("fundingType", e.target.value)} className={`${input} bg-white`}><option>Fully Funded</option><option>Partially Funded</option><option>Tuition Waiver</option><option>Research Grant</option></select></label>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <div className="flex items-center gap-2"><ImagePlus size={19} className="text-teal-700" /><p className="text-sm font-black">Scholarship image</p></div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input type="url" placeholder="Paste image URL or upload below" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={input} />
              <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 font-black text-white hover:bg-teal-800">
                {imageUploading ? <LoaderCircle size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                {imageUploading ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" disabled={imageUploading} onChange={(e) => void handleImageUpload(e.target.files?.[0])} className="sr-only" />
              </label>
            </div>
            <p className="text-xs leading-5 text-slate-500">Uses the configured ImgBB key. You can still paste any direct image URL instead.</p>
            {form.imageUrl && <img src={form.imageUrl} alt="Scholarship preview" className="h-48 w-full rounded-xl border bg-white object-cover" />}
          </div>
        </div>

        {[ ["benefits", "Benefits"], ["eligibility", "Eligibility requirements"], ["requiredDocuments", "Required documents"] ].map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm font-black">{label} <span className="font-normal text-slate-500">Comma-separated</span><textarea required rows={3} value={form[key as keyof typeof form]} onChange={(e) => set(key as keyof typeof form, e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3 font-normal" /></label>
        ))}

        <button disabled={loading || imageUploading} className="h-12 rounded-xl bg-slate-950 font-black text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Submitting…" : "Submit item"}</button>
      </form>
    </div>
  );
}

export default function AddItemPage() {
  return <ProtectedRoute><AddItemContent /></ProtectedRoute>;
}
