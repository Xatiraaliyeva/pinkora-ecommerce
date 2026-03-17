import { useState } from "react";
import { api, tokenStore } from "../api/http";

export default function Auth() {
  const [username, setUsername] = useState("test1");
  const [email, setEmail] = useState("test1@gmail.com");
  const [password, setPassword] = useState("123456");
  const [emailOrUsername, setEmailOrUsername] = useState("test1@gmail.com");
  const [log, setLog] = useState("");

  const show = (x) => setLog(typeof x === "string" ? x : JSON.stringify(x, null, 2));

  const register = async () => {
    try {
      const res = await api.post("/auth/register", { username, email, password });
      tokenStore.set(res.data.accessToken);
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { emailOrUsername, password });
      tokenStore.set(res.data.accessToken);
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  const refresh = async () => {
    try {
      const res = await api.post("/auth/refresh");
      tokenStore.set(res.data.accessToken);
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  const logout = async () => {
    try {
      const res = await api.post("/auth/logout");
      tokenStore.clear();
      show(res.data);
    } catch (e) {
      show(e.response?.data || e.message);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Auth Test (Backend yoxlama)</h2>

      <div style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h3>Register</h3>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        <button onClick={register}>REGISTER</button>
      </div>

      <div style={{ height: 20 }} />

      <div style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
        <h3>Login</h3>
        <input value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="emailOrUsername" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        <button onClick={login}>LOGIN</button>
      </div>

      <div style={{ height: 20 }} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={refresh}>REFRESH (cookie)</button>
        <button onClick={logout}>LOGOUT</button>
      </div>

      <p style={{ marginTop: 20 }}>
        <b>Access token (memory):</b> {tokenStore.accessToken ? tokenStore.accessToken.slice(0, 25) + "..." : "yoxdur"}
      </p>

      <pre style={{ background: "#111", color: "#0f0", padding: 12, borderRadius: 10, overflow: "auto" }}>
        {log}
      </pre>
    </div>
  );
}