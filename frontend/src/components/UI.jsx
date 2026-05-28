import { useRef } from "react";
import { Upload, X, Eye } from "lucide-react";

/* ── Card ──────────────────────────────────────────────── */
export function Card({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`cms-card ${className}`}>
      {title && (
        <div className="cms-card__header">
          {Icon && <Icon size={14} className="cms-card__icon" />}
          <h3 className="cms-card__title">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Field ─────────────────────────────────────────────── */
export function Field({
  label, value, onChange, placeholder = "",
  textarea = false, type = "text",
  span2 = false, hint = "",
}) {
  const cls = span2 ? "cms-field cms-field--span2" : "cms-field";
  return (
    <div className={cls}>
      {label && <label className="cms-field__label">{label}</label>}
      {textarea ? (
        <textarea
          className="cms-field__input cms-field__input--textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="cms-field__input"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="cms-field__hint">{hint}</p>}
    </div>
  );
}

/* ── SelectField ───────────────────────────────────────── */
export function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div className="cms-field">
      {label && <label className="cms-field__label">{label}</label>}
      <select
        className="cms-field__input cms-field__input--select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── ImageUpload ────────────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function ImageUpload({ label, currentUrl, onFile }) {
  const ref = useRef();
  const preview = currentUrl?.startsWith("/")
    ? `${BASE_URL}${currentUrl}`
    : currentUrl;

  return (
    <div className="cms-image-upload">
      {label && <label className="cms-field__label">{label}</label>}
      <div
        className={`cms-image-upload__box ${preview ? "cms-image-upload__box--has-image" : ""}`}
        onClick={() => ref.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && ref.current.click()}
        aria-label="Upload image"
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="cms-image-upload__img" />
            <div className="cms-image-upload__overlay">
              <Upload size={18} />
              <span>Replace image</span>
            </div>
          </>
        ) : (
          <>
            <Upload size={22} className="cms-image-upload__icon" />
            <span className="cms-image-upload__text">Click to upload</span>
            <span className="cms-image-upload__sub">JPG, PNG, WebP · max 5MB</span>
          </>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => onFile && onFile(e.target.files[0])}
      />
    </div>
  );
}

/* ── FieldGrid ──────────────────────────────────────────── */
export function FieldGrid({ children }) {
  return <div className="cms-field-grid">{children}</div>;
}

/* ── SplitLayout ────────────────────────────────────────── */
export function SplitLayout({ editor, preview }) {
  return (
    <div className="cms-split">
      <div className="cms-split__editor">{editor}</div>
      <div className="cms-split__preview">
        <div className="cms-preview-label">
          <Eye size={12} />
          Live preview
        </div>
        {preview}
      </div>
    </div>
  );
}

/* ── SectionActions ─────────────────────────────────────── */
export function SectionActions({ onSave, onReset, saveLabel = "Save changes", loading = false, extraActions }) {
  return (
    <div className="cms-section-actions">
      {extraActions}
      {onReset && (
        <button className="cms-btn cms-btn--ghost" onClick={onReset}>
          <X size={13} /> Reset
        </button>
      )}
      <button
        className="cms-btn cms-btn--primary"
        onClick={onSave}
        disabled={loading}
      >
        {loading ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}

/* ── StatusPill ─────────────────────────────────────────── */
export function StatusPill({ active }) {
  return (
    <span className={`cms-pill ${active ? "cms-pill--active" : "cms-pill--inactive"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ── EmptyState ─────────────────────────────────────────── */
export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="cms-empty">
      {Icon && <Icon size={28} className="cms-empty__icon" />}
      <p>{message}</p>
    </div>
  );
}
