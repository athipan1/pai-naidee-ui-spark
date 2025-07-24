import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'

const SimpleApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🏝️ หมู่เกาะพีพี</h1>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#666' }}>
          เกาะที่มีความงามตามธรรมชาติ น้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด 
          เหมาะสำหรับการพักผ่อนและกิจกรรมดำน้ำดูปะการัง
        </p>
        <p style={{ marginTop: '15px', color: '#28a745', fontWeight: 'bold' }}>
          ⭐ คะแนน: 4.8/5 | 📍 จังหวัดกระบี่
        </p>
      </div>
      <button 
        onClick={() => window.location.href = '/'} 
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        🏠 ดูสถานที่ท่องเที่ยวอื่น ๆ
      </button>
    </div>
  );
};

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>
)
