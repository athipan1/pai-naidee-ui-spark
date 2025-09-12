import React, { useState, useEffect } from 'react';

function AttractionList() {
  // 1. State Management:
  // - data: สำหรับเก็บข้อมูลสถานที่ท่องเที่ยวที่ fetch มาได้
  // - loading: สำหรับบอกสถานะว่ากำลังโหลดข้อมูลอยู่หรือไม่ (true/false)
  // - error: สำหรับเก็บ error object หากการ fetch ข้อมูลล้มเหลว
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Data Fetching with useEffect:
  // - useEffect จะทำงานหลังจาก component render ครั้งแรก (เนื่องจากใส่ dependency array เป็น [])
  // - ใช้ async/await เพื่อให้การเขียนโค้ด fetch ข้อมูลอ่านง่ายขึ้น
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://www.melivecode.com/api/attractions');

        // ตรวจสอบว่า API response สำเร็จหรือไม่ (status code 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result); // เก็บข้อมูลที่ได้ใน state
      } catch (e) {
        setError(e); // หากเกิด error ให้เก็บ error object ไว้ใน state
      } finally {
        setLoading(false); // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้หยุดสถานะ loading
      }
    };

    fetchData();
  }, []); // Dependency array ที่ว่างเปล่าหมายถึงให้ effect นี้ทำงานแค่ครั้งเดียวตอน component ถูก mount

  // 3. Conditional Rendering:
  // - แสดงผลตามค่าของ state ในขณะนั้น

  // ขณะกำลังโหลดข้อมูล
  if (loading) {
    return <div>Loading attractions...</div>;
  }

  // หากเกิดข้อผิดพลาดในการโหลด
  if (error) {
    return <div>ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่</div>;
  }

  // หากโหลดข้อมูลสำเร็จ
  return (
    <div>
      <h1>รายชื่อสถานที่ท่องเที่ยว</h1>
      <ul>
        {/* ใช้ .map() เพื่อวนลูปแสดงผลข้อมูลแต่ละรายการ */}
        {data.map(attraction => (
          <li key={attraction.id}>
            {attraction.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttractionList;
