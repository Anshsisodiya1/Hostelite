import axios from "axios";

// auto-detect environment — no env variable needed
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://hostelite-1.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export default API;

/* ── CMS helpers ─────────────────────────────────────────
   Import in section components:
   import { cmsApi as api, buildFormData } from "../../services/api";
   ────────────────────────────────────────────────────── */
export const cmsApi = {
  get:    (path)       => API.get(path).then(r => r.data),
  post:   (path, body) => API.post(path, body).then(r => r.data),
  put:    (path, body) => API.put(path, body).then(r => r.data),
  delete: (path)       => API.delete(path).then(r => r.data),

  postForm: (path, fd) =>
    API.post(path, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data),

  putForm: (path, fd) =>
    API.put(path, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data),
};

export function buildFormData(obj, imageFile, imageKey = "image") {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (imageFile) fd.append(imageKey, imageFile);
  return fd;
}