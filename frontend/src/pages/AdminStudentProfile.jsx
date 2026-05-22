import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/AdminStudentProfile.css";

export default function AdminStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState(null);
  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [editData, setEditData]     = useState({});

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      const res = await API.get(`/profile/${id}`);
      setProfile(res.data);
      setEditData({
        fullName:     res.data.fullName     || "",
        fatherName:   res.data.fatherName   || "",
        motherName:   res.data.motherName   || "",
        phone:        res.data.phone        || "",
        address:      res.data.address      || "",
        aadhaarNumber: res.data.aadhaarNumber || "",
      });
    } catch (err) {
      alert("Failed to fetch profile");
    } finally {
      setPageLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await API.put(`/profile/${id}`, editData);
      const updated = res.data?.profile || res.data;
      setProfile(updated);
      setEditData({
        fullName:      updated.fullName      || "",
        fatherName:    updated.fatherName    || "",
        motherName:    updated.motherName    || "",
        phone:         updated.phone         || "",
        address:       updated.address       || "",
        aadhaarNumber: updated.aadhaarNumber || "",
      });
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // reset edit data back to saved profile
    setEditData({
      fullName:      profile.fullName      || "",
      fatherName:    profile.fatherName    || "",
      motherName:    profile.motherName    || "",
      phone:         profile.phone         || "",
      address:       profile.address       || "",
      aadhaarNumber: profile.aadhaarNumber || "",
    });
    setIsEditing(false);
  };

  const downloadPDF = async () => {
    try {
      if (!profile?.user?._id) return;
      const response = await API.get(
        `/profile/download/${profile.user._id}`,
        { responseType: "blob" }
      );
      if (response.data.size === 0) { alert("PDF is empty"); return; }
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${profile.fullName || "Student"}_Profile.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF");
    }
  };

  /* ── Loading state ── */
  if (pageLoading) {
    return (
      <div className="asp-loading">
        <div className="asp-spinner"><span /><span /><span /></div>
        <p>Loading profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="asp-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <p>No profile data found.</p>
        <button className="asp-btn asp-btn--ghost" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const initials = profile.fullName
    ? profile.fullName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const fields = [
    { name: "fullName",      label: "Full Name" },
    { name: "fatherName",    label: "Father's Name" },
    { name: "motherName",    label: "Mother's Name" },
    { name: "phone",         label: "Phone Number" },
    { name: "address",       label: "Address",       full: true },
    { name: "aadhaarNumber", label: "Aadhaar Number" },
  ];

  return (
    <div className="asp-wrapper">

      {/* ── Top Bar ── */}
      <div className="asp-topbar">
        <button className="asp-btn asp-btn--ghost" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div className="asp-topbar-actions">
          {isEditing ? (
            <>
              <button className="asp-btn asp-btn--ghost" onClick={handleCancelEdit}>Cancel</button>
              <button className="asp-btn asp-btn--success" onClick={handleUpdate} disabled={loading}>
                {loading
                  ? <><span className="asp-btn-spinner" /> Saving…</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save Changes</>
                }
              </button>
            </>
          ) : (
            <>
              <button className="asp-btn asp-btn--secondary" onClick={() => setIsEditing(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
              <button className="asp-btn asp-btn--primary" onClick={downloadPDF}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Hero Section ── */}
      <div className="asp-hero">
        <div className="asp-hero-bg" />
        <div className="asp-hero-content">
          <div className="asp-avatar-wrap">
            {profile.profilePhoto
              ? <img src={profile.profilePhoto} alt={profile.fullName} className="asp-avatar-img" />
              : <div className="asp-avatar-initials">{initials}</div>
            }
          </div>
          <div className="asp-hero-info">
            <div className="asp-hero-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Verified Student
            </div>
            <h1 className="asp-hero-name">{profile.fullName}</h1>
            <p className="asp-hero-sub">
              {profile.user?.email && <span>{profile.user.email}</span>}
              {profile.phone && <span>· {profile.phone}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="asp-body">

        {/* ── Personal Info Card ── */}
        <div className="asp-card">
          <div className="asp-card-head">
            <div className="asp-card-icon asp-icon--blue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2>Personal Information</h2>
            {isEditing && <span className="asp-editing-badge">Editing</span>}
          </div>

          <div className="asp-info-grid">
            {fields.map((f) => (
              <div key={f.name} className={`asp-field ${f.full ? "asp-field--full" : ""}`}>
                <label className="asp-label">{f.label}</label>
                {isEditing ? (
                  <input
                    className="asp-input"
                    type="text"
                    name={f.name}
                    value={editData[f.name]}
                    onChange={handleEditChange}
                    autoComplete="off"
                  />
                ) : (
                  <div className={`asp-value ${f.name === "phone" || f.name === "aadhaarNumber" ? "asp-value--mono" : ""}`}>
                    {f.name === "aadhaarNumber" && profile[f.name]
                      ? profile[f.name].replace(/(\d{4})(\d{4})(\d{4})/, "$1 XXXX $3")
                      : profile[f.name] || "—"
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Documents Card ── */}
        <div className="asp-card">
          <div className="asp-card-head">
            <div className="asp-card-icon asp-icon--violet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            </div>
            <h2>Identity Documents</h2>
          </div>

          <div className="asp-docs-row">

            {/* Profile Photo */}
            <div className="asp-doc-card">
              <div className="asp-doc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile Photo
              </div>
              {profile.profilePhoto ? (
                <div className="asp-doc-img-wrap asp-doc-img-wrap--square">
                  <img src={profile.profilePhoto} alt="Profile" />
                </div>
              ) : (
                <div className="asp-doc-empty">No photo uploaded</div>
              )}
            </div>

            {/* Aadhaar Photo */}
            <div className="asp-doc-card">
              <div className="asp-doc-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                Aadhaar Card
              </div>
              {profile.aadhaarPhoto ? (
                <div className="asp-doc-img-wrap asp-doc-img-wrap--rect">
                  <img src={profile.aadhaarPhoto} alt="Aadhaar Card" />
                </div>
              ) : (
                <div className="asp-doc-empty">No document uploaded</div>
              )}
            </div>

          </div>
        </div>

        {/* ── Meta Info ── */}
        <div className="asp-meta">
          <span>Role: <strong>{profile.role || profile.user?.role || "student"}</strong></span>
          {profile.createdAt && (
            <span>Submitted: <strong>{new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
          )}
          {profile.user?.email && (
            <span>Email: <strong>{profile.user.email}</strong></span>
          )}
        </div>

      </div>
    </div>
  );
}