import { useState, useEffect } from "react";
import { PanelBottom, AtSign, Phone, MapPin, Share2 } from "lucide-react";
import { Card, Field, FieldGrid, SplitLayout, SectionActions } from "../UI";
import {
  cmsApi as api,
  buildFormData,
} from "../../services/api";

const DEFAULT = {
  footerDescription: "Modern hostel management platform designed to simplify student accommodation and streamline operations.",
  email:     "support@hostelite.com",
  phone:     "+91 98765 43210",
  address:   "India",
  copyrightText: `© ${new Date().getFullYear()} Hostelite. All rights reserved.`,
  instagram: "",
  linkedin:  "",
  twitter:   "",
  facebook:  "",
};

export default function FooterSection({ showToast, markUnsaved }) {
  const [data, setData]   = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get("/footer")
      .then(r => {
        if (r.footer) {
          const f = r.footer;
          setData({
            ...DEFAULT,
            ...f,
            instagram: f.socialLinks?.instagram || "",
            linkedin:  f.socialLinks?.linkedin  || "",
            twitter:   f.socialLinks?.twitter   || "",
            facebook:  f.socialLinks?.facebook  || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const set = (key) => (val) => {
    setData(d => ({ ...d, [key]: val }));
    markUnsaved();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/footer", data);
      showToast("Footer saved!");
    } catch (err) {
      showToast(err.message || "Failed to save", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="cms-loading">Loading…</div>;

  const editor = (
    <>
      <Card title="Footer info" icon={PanelBottom}>
        <FieldGrid>
          <Field
            label="Footer description"
            value={data.footerDescription}
            onChange={set("footerDescription")}
            textarea span2
          />
          <Field label="Email"   value={data.email}   onChange={set("email")}   placeholder="support@example.com" />
          <Field label="Phone"   value={data.phone}   onChange={set("phone")}   placeholder="+91 98765 43210" />
          <Field label="Address" value={data.address} onChange={set("address")} placeholder="City, Country" span2 />
          <Field label="Copyright text" value={data.copyrightText} onChange={set("copyrightText")} span2 />
        </FieldGrid>
      </Card>

      <Card title="Social links" icon={Share2}>
        <FieldGrid>
          <Field label="Instagram URL" value={data.instagram} onChange={set("instagram")} placeholder="https://instagram.com/…" />
          <Field label="LinkedIn URL"  value={data.linkedin}  onChange={set("linkedin")}  placeholder="https://linkedin.com/…" />
          <Field label="Twitter / X URL" value={data.twitter} onChange={set("twitter")}   placeholder="https://twitter.com/…" />
          <Field label="Facebook URL"  value={data.facebook}  onChange={set("facebook")}  placeholder="https://facebook.com/…" />
        </FieldGrid>
      </Card>

      <SectionActions onSave={handleSave} loading={loading} saveLabel="Save footer" />
    </>
  );

  const preview = (
    <div className="preview-footer">
      <div className="preview-footer__brand">
        <h3>🏠 Hostelite</h3>
        <p>{data.footerDescription}</p>
      </div>
      <div className="preview-footer__contact">
        <div className="preview-footer__row"><AtSign size={12} />{data.email}</div>
        <div className="preview-footer__row"><Phone   size={12} />{data.phone}</div>
        <div className="preview-footer__row"><MapPin  size={12} />{data.address}</div>
      </div>
      {(data.instagram || data.linkedin || data.twitter || data.facebook) && (
        <div className="preview-footer__social">
          {data.instagram && <a href={data.instagram} target="_blank" rel="noreferrer" className="preview-footer__social-link">Instagram</a>}
          {data.linkedin  && <a href={data.linkedin}  target="_blank" rel="noreferrer" className="preview-footer__social-link">LinkedIn</a>}
          {data.twitter   && <a href={data.twitter}   target="_blank" rel="noreferrer" className="preview-footer__social-link">Twitter</a>}
          {data.facebook  && <a href={data.facebook}  target="_blank" rel="noreferrer" className="preview-footer__social-link">Facebook</a>}
        </div>
      )}
      <div className="preview-footer__copyright">{data.copyrightText}</div>
    </div>
  );

  return <SplitLayout editor={editor} preview={preview} />;
}
