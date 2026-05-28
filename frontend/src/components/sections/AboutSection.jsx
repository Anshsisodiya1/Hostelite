import { useState, useEffect } from "react";
import { FileText, ListChecks, BarChart3, Plus, Trash2 } from "lucide-react";
import {
  Card, Field, FieldGrid, SelectField, SplitLayout, SectionActions,
} from "../UI";
import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const DEFAULT = {
  title: "What is Hostelite?",
  description: "Hostelite is a revolutionary hostel management platform transforming the student living experience across 500+ educational institutions worldwide.",
  isActive: true,
  highlights: [
    "Lightning-fast digital payments and transactions",
    "Smart meal planning with real-time feedback system",
    "Quick complaint resolution with live tracking",
    "Mobile-first design for on-the-go access",
  ],
  stats: [
    { label: "Institutions", value: "500+" },
    { label: "Students",     value: "50K+" },
    { label: "Uptime",       value: "99.9%" },
    { label: "Support",      value: "24/7" },
  ],
};

export default function AboutSection({ showToast, markUnsaved }) {
  const [data, setData] = useState(DEFAULT);
  const [hlInput, setHlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get("/about")
      .then(r => { if (r.about) setData({ ...DEFAULT, ...r.about }); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (key) => (val) => {
    setData(d => ({ ...d, [key]: val }));
    markUnsaved();
  };

  const addHighlight = () => {
    const v = hlInput.trim();
    if (!v) return;
    setData(d => ({ ...d, highlights: [...(d.highlights || []), v] }));
    setHlInput("");
    markUnsaved();
  };

  const removeHighlight = (i) => {
    setData(d => ({ ...d, highlights: d.highlights.filter((_, idx) => idx !== i) }));
    markUnsaved();
  };

  const setStat = (i, key) => (val) => {
    setData(d => {
      const arr = [...d.stats];
      arr[i] = { ...arr[i], [key]: val };
      return { ...d, stats: arr };
    });
    markUnsaved();
  };

  const addStat = () => {
    setData(d => ({ ...d, stats: [...d.stats, { label: "", value: "" }] }));
    markUnsaved();
  };

  const removeStat = (i) => {
    setData(d => ({ ...d, stats: d.stats.filter((_, idx) => idx !== i) }));
    markUnsaved();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const r = await api.put("/about", data);
      if (r.about) setData({ ...DEFAULT, ...r.about });
      showToast("About section saved!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="cms-loading">Loading…</div>;

  const editor = (
    <>
      <Card title="Content" icon={FileText}>
        <FieldGrid>
          <Field label="Section title" value={data.title} onChange={set("title")} />
          <SelectField
            label="Status"
            value={data.isActive ? "active" : "inactive"}
            onChange={v => set("isActive")(v === "active")}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
          <Field
            label="Description"
            value={data.description}
            onChange={set("description")}
            textarea span2
          />
        </FieldGrid>
      </Card>

      <Card title="Highlights" icon={ListChecks}>
        {(data.highlights || []).map((h, i) => (
          <div key={i} className="cms-list-item">
            <span className="cms-list-item__dot" />
            <span className="cms-list-item__text">{h}</span>
            <button
              className="cms-btn cms-btn--icon-danger"
              onClick={() => removeHighlight(i)}
              aria-label="Remove highlight"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <div className="cms-inline-add">
          <input
            className="cms-field__input"
            placeholder="Add a highlight…"
            value={hlInput}
            onChange={e => setHlInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHighlight()}
          />
          <button className="cms-btn cms-btn--primary" onClick={addHighlight}>
            <Plus size={14} /> Add
          </button>
        </div>
      </Card>

      <Card title="Stats" icon={BarChart3}>
        {(data.stats || []).map((s, i) => (
          <div key={i} className="cms-stat-row">
            <Field
              label={i === 0 ? "Label" : ""}
              value={s.label}
              onChange={setStat(i, "label")}
              placeholder="Label"
            />
            <Field
              label={i === 0 ? "Value" : ""}
              value={s.value}
              onChange={setStat(i, "value")}
              placeholder="500+"
            />
            <button
              className={`cms-btn cms-btn--icon-danger ${i === 0 ? "cms-stat-row__del--offset" : ""}`}
              onClick={() => removeStat(i)}
              aria-label="Remove stat"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button className="cms-btn cms-btn--ghost cms-btn--full" onClick={addStat}>
          <Plus size={13} /> Add stat
        </button>
      </Card>

      <SectionActions onSave={handleSave} loading={loading} saveLabel="Save about section" />
    </>
  );

  const preview = (
    <div className="preview-about">
      <h2 className="preview-about__title">{data.title}</h2>
      <p className="preview-about__desc">{data.description}</p>
      <div className="preview-about__highlights">
        {(data.highlights || []).map((h, i) => (
          <div key={i} className="preview-about__hl">
            <span className="preview-about__hl-dot" />
            {h}
          </div>
        ))}
      </div>
      <div className="preview-about__stats">
        {(data.stats || []).map((s, i) => (
          <div key={i} className="preview-about__stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
