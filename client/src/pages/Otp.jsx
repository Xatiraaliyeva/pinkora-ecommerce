import { useState } from "react";
import { api, tokenStore } from "../api/http";

export default function Otp() {
  const [email, setEmail] = useState("test1@gmail.com");
  const [code, setCode] = useState("");
  const [log, setLog] = useState("");

  const show = (x) => setLog(typeof x === "string" ? x : JSON.stringify(x, null, 2));

  const request = async () => {
    try {
      const res = await api.post("/auth/otp/request", { email });
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  const verify = async () => {
    try {
      const res = await api.post("/auth/otp/verify", { email, code });
      tokenStore.set(res.data.accessToken);
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>OTP Test</h2>

      <div style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <button onClick={request}>OTP REQUEST</button>

        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="code (mail-dən)" />
        <button onClick={verify}>OTP VERIFY</button>
      </div>

      <pre style={{ marginTop: 20, background: "#111", color: "#0f0", padding: 12, borderRadius: 10 }}>
        {log}
      </pre>
    </div>
  );
}