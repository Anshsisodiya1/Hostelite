import { useState } from "react";
import API from "../services/api";
import { toast } from "react-hot-toast";

export default function AddHostel() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.phone) {
      return toast.error("Name, Address and Phone are required");
    }

    try {
      setLoading(true);

      const res = await API.post("/hostel", form);

      toast.success(res.data.message || "Hostel created successfully");

      // reset form
      setForm({
        name: "",
        address: "",
        phone: "",
        email: "",
      });

    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create hostel"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Add Hostel
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Hostel Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Hostel"}
          </button>

        </form>
      </div>
    </div>
  );
}