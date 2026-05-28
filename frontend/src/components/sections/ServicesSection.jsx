import { useState, useEffect } from "react";
import { Wrench, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  Card, Field, FieldGrid, SelectField, SplitLayout,
  SectionActions, ImageUpload, StatusPill, EmptyState,
} from "../UI";
import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EMPTY_FORM = { title: "", icon: "", stats: "", description: "", isActive: "active" };

export default function ServicesSection({ showToast, markUnsaved }) {
  const [items, setItems]     = useState([]);
  const [mode, setMode]       = useState("list");
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchItems = () =>
    api.get("/services")
      .then(r => setItems(r.services || []))
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
      title:    item.title || "",
      icon:     item.icon || "",
      stats:    item.stats || "",
      description: item.description || "",
      isActive: item.isActive === false ? "inactive" : "active",
    });
    setImgPreview(item.image ? `${BASE_URL}${item.image}` : "");
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
      if (editId) r = await api.putForm(`/services/${editId}`, fd);
      else        r = await api.postForm("/services", fd);
      if (r.success) {
        showToast(editId ? "Service updated!" : "Service created!");
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
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${id}`);
      showToast("Service deleted");
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
          <Card title="All Services" icon={Wrench}>
            <button className="cms-btn cms-btn--primary cms-btn--full" onClick={startAdd}>
              <Plus size={14} /> Add new service
            </button>
            <div className="cms-list">
              {items.length === 0 && <EmptyState icon={Wrench} message="No services yet." />}
              {items.map(item => (
                <div key={item._id} className="cms-list-item cms-list-item--card">
                  <div className="cms-list-item__thumb cms-list-item__thumb--placeholder" style={{ fontSize: 20 }}>
                    {item.icon || "⚙️"}
                  </div>
                  <div className="cms-list-item__body">
                    <strong>{item.title}</strong>
                    <span>{item.stats}</span>
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
          <div className="cms-preview-label">Services on page</div>
          <div className="preview-services-grid">
            {items.map(item => (
              <div key={item._id} className="preview-service-card">
                <div className="preview-service-card__icon">{item.icon || "⚙️"}</div>
                <strong>{item.title}</strong>
                <span className="preview-service-card__badge">{item.stats}</span>
              </div>
            ))}
          </div>
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
          {mode === "edit" ? "Edit service" : "Add new service"}
        </h3>
      </div>
      <Card title="Details" icon={Wrench}>
        <FieldGrid>
          <Field label="Title"        value={form.title} onChange={setField("title")} placeholder="e.g. Smart Payments" />
          <Field label="Icon (emoji)" value={form.icon}  onChange={setField("icon")}  placeholder="💳" />
          <Field label="Stats badge"  value={form.stats} onChange={setField("stats")} placeholder="99.9% Uptime" />
          <SelectField
            label="Status"
            value={form.isActive}
            onChange={setField("isActive")}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
          <Field label="Description" value={form.description} onChange={setField("description")} textarea span2 placeholder="Describe this service…" />
        </FieldGrid>
        <ImageUpload label="Service image" currentUrl={imgPreview} onFile={handleImageFile} />
      </Card>
      <SectionActions
        onSave={handleSave}
        loading={loading}
        saveLabel={mode === "edit" ? "Update service" : "Create service"}
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
    <div className="preview-service">
      <div className="preview-service__icon">
        {imgPreview
          ? <img src={imgPreview} alt="service" />
          : <span>{form.icon || "⚙️"}</span>
        }
      </div>
      <h4>{form.title || "Service title"}</h4>
      <p>{form.description || "Description will appear here…"}</p>
      {form.stats && <span className="preview-service__badge">{form.stats}</span>}
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
