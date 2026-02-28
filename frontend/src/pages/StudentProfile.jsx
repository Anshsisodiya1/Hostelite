import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/StudentProfile.css";

export default function StudentProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    phone: "",
    address: "",
    aadhaarNumber: "",
    profilePhoto: "",
    aadhaarPhoto: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const res = await API.get("/profile/me");

      if (res.data?.submitted) {
        setSubmitted(true);
        setFormData(res.data);
      }
    } catch (err) {
      console.log("No profile yet");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "Full Name is required";

    if (!formData.fatherName.trim())
      newErrors.fatherName = "Father Name is required";

    if (!formData.motherName.trim())
      newErrors.motherName = "Mother Name is required";

    if (!formData.phone.trim())
      newErrors.phone = "Phone is required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!formData.address.trim())
      newErrors.address = "Address is required";

    if (!formData.aadhaarNumber.trim())
      newErrors.aadhaarNumber = "Aadhaar is required";
    else if (!/^[0-9]{12}$/.test(formData.aadhaarNumber))
      newErrors.aadhaarNumber = "Aadhaar must be 12 digits";

    if (!profilePhoto && !submitted)
      newErrors.profilePhoto = "Profile photo required";

    if (!aadhaarPhoto && !submitted)
      newErrors.aadhaarPhoto = "Aadhaar photo required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();

    data.append("fullName", formData.fullName);
    data.append("fatherName", formData.fatherName);
    data.append("motherName", formData.motherName);
    data.append("phone", formData.phone);
    data.append("address", formData.address);
    data.append("aadhaarNumber", formData.aadhaarNumber);

    if (profilePhoto) data.append("profilePhoto", profilePhoto);
    if (aadhaarPhoto) data.append("aadhaarPhoto", aadhaarPhoto);

    try {
      await API.post("/profile/submit", data);
      alert("Profile submitted successfully");
      checkProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  const handleAadhaarPhotoChange = (e) => {
    const file = e.target.files[0];
    setAadhaarPhoto(file);
    if (file) setAadhaarPreview(URL.createObjectURL(file));
  };

  if (loading) return <h3 className="loading">Loading...</h3>;

  return (
    <div className="student-profile-wrapper">
      <div className="student-profile-header">
        <h2>Student Personal Profile</h2>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {submitted ? (
        <div className="student-profile-card">

          {/* IMAGE SECTION */}
          <div className="profile-images">
            {formData.profilePhoto && (
              <div className="image-box">
                <label>Profile Photo</label>
                <img
                  src={formData.profilePhoto}
                  alt="Profile"
                  className="profile-img"
                />
              </div>
            )}

            {formData.aadhaarPhoto && (
              <div className="image-box">
                <label>Aadhaar Photo</label>
                <img
                  src={formData.aadhaarPhoto}
                  alt="Aadhaar"
                  className="profile-img"
                />
              </div>
            )}
          </div>

          {/* DETAILS SECTION */}
          <div className="student-profile-grid">
            <div className="info-box">
              <label>Full Name</label>
              <span>{formData.fullName}</span>
            </div>

            <div className="info-box">
              <label>Father Name</label>
              <span>{formData.fatherName}</span>
            </div>

            <div className="info-box">
              <label>Mother Name</label>
              <span>{formData.motherName}</span>
            </div>

            <div className="info-box">
              <label>Phone</label>
              <span>{formData.phone}</span>
            </div>

            <div className="info-box full-width">
              <label>Address</label>
              <span>{formData.address}</span>
            </div>

            <div className="info-box">
              <label>Aadhaar Number</label>
              <span>{formData.aadhaarNumber}</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="student-profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" onChange={handleChange} />
            <p className="error">{errors.fullName}</p>
          </div>

          <div className="form-group">
            <label>Father Name</label>
            <input name="fatherName" onChange={handleChange} />
            <p className="error">{errors.fatherName}</p>
          </div>

          <div className="form-group">
            <label>Mother Name</label>
            <input name="motherName" onChange={handleChange} />
            <p className="error">{errors.motherName}</p>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input name="phone" onChange={handleChange} />
            <p className="error">{errors.phone}</p>
          </div>

          <div className="form-group full-width">
            <label>Permanent Address</label>
            <input name="address" onChange={handleChange} />
            <p className="error">{errors.address}</p>
          </div>

          <div className="form-group">
            <label>Aadhaar Number</label>
            <input name="aadhaarNumber" onChange={handleChange} />
            <p className="error">{errors.aadhaarNumber}</p>
          </div>

          <div className="form-group">
            <label>Upload Profile Photo</label>
            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
            {profilePreview && (
              <img src={profilePreview} alt="Preview" className="preview-img" />
            )}
            <p className="error">{errors.profilePhoto}</p>
          </div>

          <div className="form-group">
            <label>Upload Aadhaar Photo</label>
            <input type="file" accept="image/*" onChange={handleAadhaarPhotoChange} />
            {aadhaarPreview && (
              <img src={aadhaarPreview} alt="Preview" className="preview-img" />
            )}
            <p className="error">{errors.aadhaarPhoto}</p>
          </div>

          <button type="submit" className="btn-submit">
            Submit Profile
          </button>
        </form>
      )}
    </div>
  );
}