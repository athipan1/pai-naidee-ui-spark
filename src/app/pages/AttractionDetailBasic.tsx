const AttractionDetailBasic = () => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← กลับ
        </button>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px', color: '#333' }}>หมู่เกาะพีพี</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>จังหวัดกระบี่</p>
        
        <div style={{ 
          height: '200px', 
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          🏝️ Beautiful Island Paradise
        </div>
        
        <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '20px' }}>
          เกาะที่มีความงามตามธรรมชาติ น้ำทะเลใสสีเขียวมรกต หาดทรายขาวสะอาด 
          เหมาะสำหรับการพักผ่อนและกิจกรรมดำน้ำดูปะการัง
        </p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            ⭐ Rating: 4.8/5
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🏠 กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetailBasic;