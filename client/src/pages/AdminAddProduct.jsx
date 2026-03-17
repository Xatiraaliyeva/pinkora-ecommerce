import { useState } from "react";
import { api } from "../api/http";

export default function AdminAddProduct() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");

  const create = async () => {
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("desc", desc);
      fd.append("price", price);
      if (image) fd.append("image", image);

      const r = await api.post("/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("Əlavə olundu ✅ " + r.data.title);
      setTitle("");
      setDesc("");
      setPrice("");
      setImage(null);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "Arial" }}>
      <h2>Admin: Add Product</h2>

      <div style={{ display: "grid", gap: 10, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Desc" rows={3} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        <button onClick={create}>Create</button>

        {msg && <div style={{ padding: 10, background: "#fff2cc", borderRadius: 8 }}>{msg}</div>}
      </div>
    </div>
  );
}