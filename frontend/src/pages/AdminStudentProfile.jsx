
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/AdminStudentProfile.css";

export default function AdminStudentProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setPageLoading(true);
      const res = await API.get(`/profile/${id}`);
      setProfile(res.data);
    } catch (err) {
      alert("Failed to fetch profile");
    } finally {
      setPageLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const updatedData = {
        fullName: profile?.fullName,
        fatherName: profile?.fatherName,
        motherName: profile?.motherName,
        phone: profile?.phone,
        address: profile?.address,
        aadhaarNumber: profile?.aadhaarNumber,
      };

      const res = await API.put(`/profile/${id}`, updatedData);

      setProfile(res.data?.profile || res.data);
      setIsEditing(false);

      alert("Profile updated successfully");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      if (!profile?.user?._id) return;

      const response = await API.get(
        `/profile/download/${profile.user._id}`,
        { responseType: "blob" }
      );

      if (response.data.size === 0) {
        alert("PDF is empty or not generated");
        return;
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Student_Profile.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF");
    }
  };

  if (pageLoading) {
    return (
      <div className="profile-cont">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-cont">
        <p>No profile data found.</p>
      </div>
    );
  }

  return (
    <div className="profile-cont">
      {/* ================= HEADER ================= */}
      <div className="profile-header">
        <h2 className="profile-title">Student Profile</h2>

        <div className="profile-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>

          <button className="btn btn-primary" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      </div>

      {/* ================= PROFILE DETAILS CARD ================= */}
      <div className="profile-card">
        <div className="profile-grid">
          {/* Full Name */}
          <div className="field-group">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.fullName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            ) : (
              <span>{profile.fullName}</span>
            )}
          </div>

          {/* Father Name */}
          <div className="field-group">
            <label>Father Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.fatherName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, fatherName: e.target.value })
                }
              />
            ) : (
              <span>{profile.fatherName}</span>
            )}
          </div>

          {/* Mother Name */}
          <div className="field-group">
            <label>Mother Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.motherName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, motherName: e.target.value })
                }
              />
            ) : (
              <span>{profile.motherName}</span>
            )}
          </div>

          {/* Phone */}
          <div className="field-group">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            ) : (
              <span>{profile.phone}</span>
            )}
          </div>

          {/* Address */}
          <div className="field-group">
            <label>Address</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.address || ""}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />
            ) : (
              <span>{profile.address}</span>
            )}
          </div>

          {/* Aadhaar */}
          <div className="field-group">
            <label>Aadhaar Number</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.aadhaarNumber || ""}
                onChange={(e) =>
                  setProfile({ ...profile, aadhaarNumber: e.target.value })
                }
              />
            ) : (
              <span>{profile.aadhaarNumber}</span>
            )}
          </div>
        </div>

        {isEditing && (
          <button
            className="btn btn-success"
            style={{ marginTop: "25px" }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* ================= IMAGES SECTION ================= */}
      <div className="image-section">
        {profile.profilePhoto && (
          <div className="image-card">
            <h4>Profile Photo</h4>
            <img
              src={`http://localhost:5001/${profile.profilePhoto}`}
              alt="Profile"
              width="200"
            />
          </div>
        )}

        {profile.aadhaarPhoto && (
          <div className="image-card">
            <h4>Aadhaar Card</h4>
            <img
              src={`http://localhost:5001/${profile.aadhaarPhoto}`}
              alt="Aadhaar"
              width="300"
            />
          </div>
        )}
      </div>
    </div>
  );
}