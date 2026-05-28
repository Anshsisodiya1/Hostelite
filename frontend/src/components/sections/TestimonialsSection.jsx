import { useState, useEffect } from "react";
import { Quote, Plus, Pencil, Trash2, ArrowLeft, Star } from "lucide-react";
import {
  Card, Field, FieldGrid, SelectField, SplitLayout,
  SectionActions, ImageUpload, StatusPill, EmptyState,
} from "../UI";
import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMPTY_FORM = { studentName: "", course: "", rating: "5", review: "", isActive: "active" };

function StarRating({ value }) {
  const n = Math.min(5, Math.max(1, parseInt(value) || 5));
  return (
    <div className="preview-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < n ? "#fbbf24" : "none"} stroke={i < n ? "#fbbf24" : "#cbd5e1"} />
      ))}
    </div>
  );
}

function Avatar({ name, src }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  return src
    ? <img src={src} alt={name} className="preview-testi__avatar" />
    : <div className="preview-testi__avatar preview-testi__avatar--initials">{initials}</div>;
}

export default function TestimonialsSection({ showToast, markUnsaved }) {
  const [items, setItems]     = useState([]);
  const [mode, setMode]       = useState("list");
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchItems = () =>
    api.get("/testimonials")
      .then(r => setItems(r.testimonials || []))
      .catch(() => {})
      .finally(() => setFetching(false));

  useEffect(() => { fetchItems(); }, []);

  const setField = (key) => (val) => {
    setForm(f => ({ ...f, [key]: val }));
    markUnsaved();
  };

  const handleImageFile = (file) => {
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    markUnsaved();
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setImgFile(null); setImgPreview(""); };

  const startAdd = () => { resetForm(); setMode("add"); };

  const startEdit = (item) => {
    setForm({
      studentName: item.studentName || "",
      course:      item.course || "",
      rating:      String(item.rating || 5),
      review:      item.review || "",
      isActive:    item.isActive === false ? "inactive" : "active",
    });
    setImgPreview(item.avatar ? `${BASE_URL}${item.avatar}` : "");
    setEditId(item._id);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!form.studentName.trim()) { showToast("Student name is required", "error"); return; }
    if (!form.review.trim())      { showToast("Review is required", "error"); return; }
    setLoading(true);
    try {
      const payload = { ...form, isActive: form.isActive === "active" };
      const fd = buildFormData(payload, imgFile, "avatar");
      let r;
      if (editId) r = await api.putForm(`/testimonials/${editId}`, fd);
      else        r = await api.postForm("/testimonials", fd);
      if (r.success) {
        showToast(editId ? "Testimonial updated!" : "Testimonial added!");
        await fetchItems();
        setMode("list");
        resetForm();
      }
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      showToast("Testimonial deleted");
      setItems(prev => prev.filter(i => i._id !== id));
      if (editId === id) { setMode("list"); resetForm(); }
    } catch (err) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  if (fetching) return <div className="cms-loading">Loading…</div>;

  if (mode === "list") {
    return (
      <div className="cms-split">
        <div className="cms-split__editor">
          <Card title="All Testimonials" icon={Quote}>
            <button className="cms-btn cms-btn--primary cms-btn--full" onClick={startAdd}>
              <Plus size={14} /> Add testimonial
            </button>
            <div className="cms-list">
              {items.length === 0 && <EmptyState icon={Quote} message="No testimonials yet." />}
              {items.map(item => (
                <div key={item._id} className="cms-list-item cms-list-item--card">
                  <div className="cms-list-item__avatar">
                    {(item.studentName || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="cms-list-item__body">
                    <strong>{item.studentName}</strong>
                    <span>{item.course} · {"★".repeat(item.rating || 5)}</span>
                  </div>
                  <StatusPill active={item.isActive !== false} />
                  <button className="cms-btn cms-btn--icon" onClick={() => startEdit(item)}><Pencil size={13} /></button>
                  <button className="cms-btn cms-btn--icon-danger" onClick={() => handleDelete(item._id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="cms-split__preview">
          <div className="cms-preview-label">Preview</div>
          {items.slice(0, 2).map(item => (
            <div key={item._id} className="preview-testi">
              <StarRating value={item.rating} />
              <blockquote>"{(item.review || "").substring(0, 100)}{item.review?.length > 100 ? "…" : ""}"</blockquote>
              <div className="preview-testi__author">
                <Avatar name={item.studentName} src={item.avatar ? `${BASE_URL}${item.avatar}` : null} />
                <div>
                  <strong>{item.studentName}</strong>
                  <span>{item.course}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const editor = (
    <>
      <div className="cms-form-header">
        <button className="cms-btn cms-btn--ghost" onClick={() => { setMode("list"); resetForm(); }}>
          <ArrowLeft size={14} /> Back to list
        </button>
        <h3 className="cms-form-header__title">
          {mode === "edit" ? "Edit testimonial" : "Add testimonial"}
        </h3>
      </div>
      <Card title="Details" icon={Quote}>
        <FieldGrid>
          <Field label="Student name"      value={form.studentName} onChange={setField("studentName")} placeholder="e.g. Rahul Kumar" />
          <Field label="Course / Department" value={form.course}    onChange={setField("course")}      placeholder="e.g. Computer Engineering" />
          <Field label="Rating (1–5)"      value={form.rating}      onChange={setField("rating")}      type="number" />
          <SelectField
            label="Status"
            value={form.isActive}
            onChange={setField("isActive")}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
          <Field label="Review" value={form.review} onChange={setField("review")} textarea span2 placeholder="Student's review…" />
        </FieldGrid>
        <ImageUpload label="Student avatar (optional)" currentUrl={imgPreview} onFile={handleImageFile} />
      </Card>
      <SectionActions
        onSave={handleSave}
        loading={loading}
        saveLabel={mode === "edit" ? "Update testimonial" : "Add testimonial"}
        extraActions={
          mode === "edit" && (
            <button className="cms-btn cms-btn--danger" onClick={() => handleDelete(editId)}>
              <Trash2 size={13} /> Delete
            </button>
          )
        }
      />
    </>
  );

  const preview = (
    <div className="preview-testi">
      <StarRating value={form.rating} />
      <blockquote>"{form.review || "Review text will appear here…"}"</blockquote>
      <div className="preview-testi__author">
        <Avatar name={form.studentName} src={imgPreview || null} />
        <div>
          <strong>{form.studentName || "Student name"}</strong>
          <span>{form.course || "Course / Department"}</span>
        </div>
      </div>
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
