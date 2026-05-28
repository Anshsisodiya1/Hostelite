import { useState, useEffect } from "react";
import { Building2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  Card, Field, FieldGrid, SelectField, SplitLayout,
  SectionActions, ImageUpload, StatusPill, EmptyState,
} from "../UI";
import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const EMPTY_FORM = { title: "", icon: "", description: "", order: "", isActive: "active" };

export default function FacilitiesSection({ showToast, markUnsaved }) {
  const [items, setItems]     = useState([]);
  const [mode, setMode]       = useState("list"); // "list" | "add" | "edit"
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchItems = () =>
    api.get("/facilities")
      .then(r => setItems(r.facilities || []))
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

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImgFile(null);
    setImgPreview("");
  };

  const startAdd = () => { resetForm(); setMode("add"); };

  const startEdit = (item) => {
    setForm({
      title:    item.title || "",
      icon:     item.icon || "",
      description: item.description || "",
      order:    String(item.order || ""),
      isActive: item.isActive === false ? "inactive" : "active",
    });
    setImgPreview(item.image || "");
    setEditId(item._id);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    setLoading(true);
    try {
      const payload = { ...form, isActive: form.isActive === "active" };
      const fd = buildFormData(payload, imgFile);
      let r;
      if (editId) r = await api.putForm(`/facilities/${editId}`, fd);
      else        r = await api.postForm("/facilities", fd);
      if (r.success) {
        showToast(editId ? "Facility updated!" : "Facility created!");
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
    if (!confirm("Delete this facility?")) return;
    try {
      await api.delete(`/facilities/${id}`);
      showToast("Facility deleted");
      setItems(prev => prev.filter(i => i._id !== id));
      if (editId === id) { setMode("list"); resetForm(); }
    } catch (err) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  if (fetching) return <div className="cms-loading">Loading…</div>;

  /* ── List view ── */
  if (mode === "list") {
    return (
      <div className="cms-split">
        <div className="cms-split__editor">
          <Card title="All Facilities" icon={Building2}>
            <button className="cms-btn cms-btn--primary cms-btn--full" onClick={startAdd}>
              <Plus size={14} /> Add new facility
            </button>
            <div className="cms-list">
              {items.length === 0 && (
                <EmptyState icon={Building2} message="No facilities yet. Add your first one." />
              )}
              {items.map(item => (
                <div key={item._id} className="cms-list-item cms-list-item--card">
                  {item.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${item.image}`}
                      alt={item.title}
                      className="cms-list-item__thumb"
                    />
                  ) : (
                    <div className="cms-list-item__thumb cms-list-item__thumb--placeholder">
                      {item.icon || "🏢"}
                    </div>
                  )}
                  <div className="cms-list-item__body">
                    <strong>{item.title}</strong>
                    <span>{(item.description || "").substring(0, 55)}{item.description?.length > 55 ? "…" : ""}</span>
                  </div>
                  <StatusPill active={item.isActive !== false} />
                  <button className="cms-btn cms-btn--icon" onClick={() => startEdit(item)} aria-label="Edit">
                    <Pencil size={13} />
                  </button>
                  <button className="cms-btn cms-btn--icon-danger" onClick={() => handleDelete(item._id)} aria-label="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="cms-split__preview">
          <div className="cms-preview-label">Overview</div>
          <div className="preview-facilities-grid">
            {items.slice(0, 3).map(item => (
              <div key={item._id} className="preview-facility-mini">
                {item.image
                  ? <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${item.image}`} alt={item.title} />
                  : <div className="preview-facility-mini__placeholder">{item.icon || "🏢"}</div>
                }
                <span>{item.title}</span>
              </div>
            ))}
            {items.length > 3 && (
              <div className="preview-facility-mini preview-facility-mini--more">
                +{items.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Add / Edit form ── */
  const editor = (
    <>
      <div className="cms-form-header">
        <button className="cms-btn cms-btn--ghost" onClick={() => { setMode("list"); resetForm(); }}>
          <ArrowLeft size={14} /> Back to list
        </button>
        <h3 className="cms-form-header__title">
          {mode === "edit" ? "Edit facility" : "Add new facility"}
        </h3>
      </div>

      <Card title="Details" icon={Building2}>
        <FieldGrid>
          <Field label="Title"        value={form.title}       onChange={setField("title")}       placeholder="e.g. Modern Rooms" />
          <Field label="Icon (emoji)" value={form.icon}        onChange={setField("icon")}        placeholder="🏢" />
          <Field label="Display order" value={form.order}     onChange={setField("order")}        placeholder="1" type="number" />
          <SelectField
            label="Status"
            value={form.isActive}
            onChange={setField("isActive")}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
          <Field label="Description" value={form.description} onChange={setField("description")} placeholder="Describe this facility…" textarea span2 />
        </FieldGrid>
        <ImageUpload label="Facility image" currentUrl={imgPreview} onFile={handleImageFile} />
      </Card>

      <SectionActions
        onSave={handleSave}
        loading={loading}
        saveLabel={mode === "edit" ? "Update facility" : "Create facility"}
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
    <div className="preview-facility">
      {imgPreview ? (
        <img src={imgPreview} alt="preview" className="preview-facility__img" />
      ) : (
        <div className="preview-facility__img-placeholder">
          <span>{form.icon || "🏢"}</span>
        </div>
      )}
      <div className="preview-facility__body">
        <h4>{form.title || "Facility title"}</h4>
        <p>{form.description || "Description will appear here…"}</p>
      </div>
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
