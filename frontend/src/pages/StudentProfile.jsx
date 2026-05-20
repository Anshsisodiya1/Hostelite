import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/StudentProfile.css";

export default function StudentProfile() {
  const navigate = useNavigate();

  const [loading, setLoading]     = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", fatherName: "", motherName: "",
    phone: "", address: "", aadhaarNumber: "",
    profilePhoto: "", aadhaarPhoto: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);

  useEffect(() => { checkProfile(); }, []);

  const checkProfile = async () => {
    try {
      const res = await API.get("/profile/me");
      if (res.data?.submitted) { setSubmitted(true); setFormData(res.data); }
    } catch { console.log("No profile yet"); }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let e = {};
    if (!formData.fullName.trim())      e.fullName = "Full name is required";
    if (!formData.fatherName.trim())    e.fatherName = "Father's name is required";
    if (!formData.motherName.trim())    e.motherName = "Mother's name is required";
    if (!formData.phone.trim())         e.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) e.phone = "Must be 10 digits";
    if (!formData.address.trim())       e.address = "Address is required";
    if (!formData.aadhaarNumber.trim()) e.aadhaarNumber = "Aadhaar number is required";
    else if (!/^[0-9]{12}$/.test(formData.aadhaarNumber)) e.aadhaarNumber = "Must be 12 digits";
    if (!profilePhoto && !submitted)    e.profilePhoto = "Profile photo is required";
    if (!aadhaarPhoto && !submitted)    e.aadhaarPhoto = "Aadhaar photo is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    const data = new FormData();
    data.append("fullName",      formData.fullName);
    data.append("fatherName",    formData.fatherName);
    data.append("motherName",    formData.motherName);
    data.append("phone",         formData.phone);
    data.append("address",       formData.address);
    data.append("aadhaarNumber", formData.aadhaarNumber);
    if (profilePhoto) data.append("profilePhoto", profilePhoto);
    if (aadhaarPhoto) data.append("aadhaarPhoto", aadhaarPhoto);
    try {
      setSubmitting(true);
      await API.post("/profile/submit", data);
      alert("Profile submitted successfully");
      checkProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    if (file) setProfilePreview(URL.createObjectURL(file));
    setErrors({ ...errors, profilePhoto: "" });
  };

  const handleAadhaarPhotoChange = (e) => {
    const file = e.target.files[0];
    setAadhaarPhoto(file);
    if (file) setAadhaarPreview(URL.createObjectURL(file));
    setErrors({ ...errors, aadhaarPhoto: "" });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="sp-loading-screen">
        <div className="sp-loading-spinner">
          <span /><span /><span />
        </div>
        <p>Loading your profile…</p>
      </div>
    );
  }

  /* ── View mode (submitted) ── */
  if (submitted) {
    const initials = formData.fullName
      ? formData.fullName.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
      : "?";

    return (
      <div className="sp-wrapper">

        {/* Back */}
        <button className="sp-back" onClick={() => navigate("/dashboard")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Dashboard
        </button>

        {/* Hero card */}
        <div className="sp-hero-card">
          <div className="sp-hero-bg" />
          <div className="sp-hero-content">
            <div className="sp-avatar-wrap">
              {formData.profilePhoto
                ? <img src={formData.profilePhoto} alt="Profile" className="sp-avatar-img" />
                : <div className="sp-avatar-initials">{initials}</div>
              }
              <div className="sp-avatar-ring" />
            </div>
            <div className="sp-hero-text">
              <div className="sp-hero-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Profile Verified
              </div>
              <h1>{formData.fullName}</h1>
              <p className="sp-hero-sub">Hostel Resident · {formData.phone}</p>
            </div>
          </div>
        </div>

        {/* Info sections */}
        <div className="sp-sections">

          {/* Personal info */}
          <div className="sp-section-card">
            <div className="sp-section-head">
              <div className="sp-section-icon sp-icon--blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2>Personal Information</h2>
            </div>
            <div className="sp-info-grid">
              <InfoField label="Full Name"     value={formData.fullName} />
              <InfoField label="Father's Name" value={formData.fatherName} />
              <InfoField label="Mother's Name" value={formData.motherName} />
              <InfoField label="Phone Number"  value={formData.phone} mono />
              <InfoField label="Aadhaar Number" value={formData.aadhaarNumber} mono masked />
              <InfoField label="Permanent Address" value={formData.address} wide />
            </div>
          </div>

          {/* Documents */}
          {formData.aadhaarPhoto && (
            <div className="sp-section-card">
              <div className="sp-section-head">
                <div className="sp-section-icon sp-icon--violet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <h2>Identity Document</h2>
              </div>
              <div className="sp-doc-row">
                <div className="sp-doc-card">
                  <div className="sp-doc-label">Aadhaar Card</div>
                  <img src={formData.aadhaarPhoto} alt="Aadhaar" className="sp-doc-img" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  /* ── Form mode ── */
  const fields = [
    { name: "fullName",      label: "Full Name",            placeholder: "Enter your full legal name",    half: true },
    { name: "fatherName",    label: "Father's Name",        placeholder: "Enter father's full name",       half: true },
    { name: "motherName",    label: "Mother's Name",        placeholder: "Enter mother's full name",       half: true },
    { name: "phone",         label: "Phone Number",         placeholder: "10-digit mobile number",         half: true },
    { name: "address",       label: "Permanent Address",    placeholder: "Full address with city & state", half: false },
    { name: "aadhaarNumber", label: "Aadhaar Number",       placeholder: "12-digit Aadhaar number",        half: true },
  ];

  return (
    <div className="sp-wrapper">

      {/* Back */}
      <button className="sp-back" onClick={() => navigate("/dashboard")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to Dashboard
      </button>

      {/* Form header */}
      <div className="sp-form-header">
        <div className="sp-form-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <h1>Student Profile</h1>
          <p>Fill in your details accurately — this is used for official hostel records.</p>
        </div>
        <div className="sp-step-badge">Step 1 of 1</div>
      </div>

      <form onSubmit={handleSubmit} className="sp-form" noValidate>

        {/* Personal info section */}
        <div className="sp-form-section">
          <div className="sp-form-section-title">
            <span>Personal Information</span>
          </div>
          <div className="sp-form-grid">
            {fields.map((f, i) => (
              <div
                key={f.name}
                className={`sp-field ${f.half ? "" : "sp-field--full"}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <label className="sp-label" htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className={`sp-input ${errors[f.name] ? "sp-input--error" : ""}`}
                  autoComplete="off"
                />
                {errors[f.name] && (
                  <span className="sp-error">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors[f.name]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Documents section */}
        <div className="sp-form-section">
          <div className="sp-form-section-title">
            <span>Identity Documents</span>
          </div>
          <div className="sp-form-grid">

            {/* Profile Photo */}
            <div className="sp-field">
              <label className="sp-label">Profile Photo</label>
              <label className={`sp-upload ${errors.profilePhoto ? "sp-upload--error" : ""} ${profilePreview ? "sp-upload--filled" : ""}`}>
                <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="sp-upload-input" />
                {profilePreview ? (
                  <div className="sp-upload-preview">
                    <img src={profilePreview} alt="Profile preview" />
                    <div className="sp-upload-overlay">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Change photo
                    </div>
                  </div>
                ) : (
                  <div className="sp-upload-placeholder">
                    <div className="sp-upload-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <span className="sp-upload-text">Click to upload</span>
                    <span className="sp-upload-hint">JPG, PNG · Max 5MB</span>
                  </div>
                )}
              </label>
              {errors.profilePhoto && (
                <span className="sp-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.profilePhoto}
                </span>
              )}
            </div>

            {/* Aadhaar Photo */}
            <div className="sp-field">
              <label className="sp-label">Aadhaar Card Photo</label>
              <label className={`sp-upload sp-upload--doc ${errors.aadhaarPhoto ? "sp-upload--error" : ""} ${aadhaarPreview ? "sp-upload--filled" : ""}`}>
                <input type="file" accept="image/*" onChange={handleAadhaarPhotoChange} className="sp-upload-input" />
                {aadhaarPreview ? (
                  <div className="sp-upload-preview sp-upload-preview--doc">
                    <img src={aadhaarPreview} alt="Aadhaar preview" />
                    <div className="sp-upload-overlay">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Change photo
                    </div>
                  </div>
                ) : (
                  <div className="sp-upload-placeholder">
                    <div className="sp-upload-icon sp-upload-icon--doc">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                    </div>
                    <span className="sp-upload-text">Upload Aadhaar card</span>
                    <span className="sp-upload-hint">Clear photo of front side</span>
                  </div>
                )}
              </label>
              {errors.aadhaarPhoto && (
                <span className="sp-error">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {errors.aadhaarPhoto}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Notice */}
        <div className="sp-notice">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Your information is stored securely and used only for hostel administration purposes.
        </div>

        {/* Submit */}
        <button type="submit" className="sp-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="sp-submit-spinner" />
              Submitting Profile…
            </>
          ) : (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Submit Profile
            </>
          )}
        </button>

      </form>
    </div>
  );
}

/* ── Sub-components ── */
function InfoField({ label, value, mono, masked, wide }) {
  const display = masked
    ? value.replace(/(\d{4})(\d{4})(\d{4})/, "$1 XXXX $3")
    : value;
  return (
    <div className={`sp-info-field ${wide ? "sp-info-field--wide" : ""}`}>
      <div className="sp-info-label">{label}</div>
      <div className={`sp-info-value ${mono ? "sp-info-value--mono" : ""}`}>
        {display || "—"}
      </div>
    </div>
  );
}