import React, { useEffect, useState } from "react";

const ApiStatusPrompt = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error("API response not OK");
        return res.json();
      })
      .then((data) => {
        console.log("✅ API พร้อมใช้งาน:", data);
        setStatus("success");
        setMessage("✅ เชื่อมต่อกับ Backend สำเร็จ");
      })
      .catch((err) => {
        console.error("❌ ไม่สามารถเชื่อมต่อกับ API:", err);
        setStatus("error");
        setMessage("❌ ไม่สามารถเชื่อมต่อกับ Backend ได้");
      });
  }, []);

  return (
    <div data-testid="api-status-prompt" style={{ padding: "1rem", borderRadius: "8px", background: "#f0f0f0" }}>
      <h3>สถานะการเชื่อมต่อ API</h3>
      {status === "loading" && <p>⏳ กำลังตรวจสอบ...</p>}
      {status === "success" && <p style={{ color: "green" }}>{message}</p>}
      {status === "error" && (
        <div style={{ color: "red" }}>
          <p>{message}</p>
          <button onClick={() => window.location.reload()}>🔁 ลองใหม่อีกครั้ง</button>
        </div>
      )}
    </div>
  );
};

export default ApiStatusPrompt;
