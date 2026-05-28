import { useState, useEffect } from "react";
import { Type, BarChart3 } from "lucide-react";

import {
  Card,
  Field,
  FieldGrid,
  SplitLayout,
  SectionActions,
  ImageUpload,
} from "../UI";

import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const DEFAULT = {
  badge: "🎓 Trusted by 10,000+ Students",
  titleLine1: "Smart Hostel",
  titleLine2: "Management",
  description: "One platform for payments, complaints, and meals.",
  highlightText: "Experience seamless hostel living",
  primaryButtonText: "Get Started",
  secondaryButtonText: "Learn More",
  stat1Number: "500+", stat1Label: "Institutions",
  stat2Number: "50K+", stat2Label: "Students",
  stat3Number: "99.9%", stat3Label: "Uptime",
  heroImage: "",
};

export default function HeroSection({ showToast, markUnsaved }) {
  const [data, setData]     = useState(DEFAULT);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get("/hero")
      .then(r => { if (r.hero) setData({ ...DEFAULT, ...r.hero }); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (key) => (val) => {
    setData(d => ({ ...d, [key]: val }));
    markUnsaved();
  };

  const handleImageFile = (file) => {
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    markUnsaved();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = buildFormData(
        { ...data, heroImage: undefined },
        imgFile,
        "image"
      );
      const r = await api.putForm("/hero", fd);
      if (r.hero) setData({ ...DEFAULT, ...r.hero });
      showToast("Hero section saved!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(DEFAULT);
    setImgFile(null);
    setImgPreview("");
    markUnsaved();
  };

  if (fetching) return <div className="cms-loading">Loading…</div>;

  const editor = (
    <>
      <Card title="Content" icon={Type}>
        <FieldGrid>
          <Field label="Badge text"      value={data.badge}         onChange={set("badge")}         placeholder="🎓 Badge text…" />
          <Field label="Highlight text"  value={data.highlightText} onChange={set("highlightText")} placeholder="Catchy highlight…" />
          <Field label="Title line 1"    value={data.titleLine1}    onChange={set("titleLine1")} />
          <Field label="Title line 2"    value={data.titleLine2}    onChange={set("titleLine2")} />
          <Field label="Primary button"  value={data.primaryButtonText}   onChange={set("primaryButtonText")} />
          <Field label="Secondary button" value={data.secondaryButtonText} onChange={set("secondaryButtonText")} />
          <Field
            label="Description"
            value={data.description}
            onChange={set("description")}
            textarea span2
          />
        </FieldGrid>
        <ImageUpload
          label="Hero background image (optional)"
          currentUrl={imgPreview || data.heroImage}
          onFile={handleImageFile}
        />
      </Card>

      <Card title="Stats" icon={BarChart3}>
        <FieldGrid>
          <Field label="Stat 1 — number" value={data.stat1Number} onChange={set("stat1Number")} placeholder="500+" />
          <Field label="Stat 1 — label"  value={data.stat1Label}  onChange={set("stat1Label")}  placeholder="Institutions" />
          <Field label="Stat 2 — number" value={data.stat2Number} onChange={set("stat2Number")} placeholder="50K+" />
          <Field label="Stat 2 — label"  value={data.stat2Label}  onChange={set("stat2Label")}  placeholder="Students" />
          <Field label="Stat 3 — number" value={data.stat3Number} onChange={set("stat3Number")} placeholder="99.9%" />
          <Field label="Stat 3 — label"  value={data.stat3Label}  onChange={set("stat3Label")}  placeholder="Uptime" />
        </FieldGrid>
      </Card>

      <SectionActions onSave={handleSave} onReset={handleReset} loading={loading} saveLabel="Save hero section" />
    </>
  );

  const preview = (
    <div className="preview-hero">
      <div className="preview-hero__inner">
        <span className="preview-hero__badge">{data.badge || "Badge text"}</span>
        <h1 className="preview-hero__title">
          {data.titleLine1 || "Title Line 1"}
          <br />
          {data.titleLine2 || "Title Line 2"}
        </h1>
        <p className="preview-hero__desc">
          {data.description}
          <br />
          <span className="preview-hero__highlight">{data.highlightText}</span>
        </p>
        <div className="preview-hero__btns">
          <button className="preview-hero__btn preview-hero__btn--primary">
            {data.primaryButtonText || "Primary"} →
          </button>
          <button className="preview-hero__btn preview-hero__btn--secondary">
            {data.secondaryButtonText || "Secondary"}
          </button>
        </div>
        <div className="preview-hero__stats">
          {[
            [data.stat1Number, data.stat1Label],
            [data.stat2Number, data.stat2Label],
            [data.stat3Number, data.stat3Label],
          ].map(([num, lbl]) => (
            <div key={lbl} className="preview-hero__stat">
              <strong>{num}</strong>
              <span>{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
