import { Link } from 'react-router-dom';

type Props = { kind: 'privacy' | 'terms' };
const supportUrl = 'https://github.com/athipan1/pai-naidee-ui-spark/issues';

export default function LegalPage({ kind }: Props) {
  const privacy = kind === 'privacy';
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card px-4 py-4">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link to="/" className="font-semibold text-teal-600 hover:underline">← PaiNaiDee ไปไหนดี</Link>
        <nav aria-label="นโยบายเว็บไซต์" className="flex flex-wrap gap-4 text-sm">
          <Link to="/privacy" className="hover:underline" aria-current={privacy ? 'page' : undefined}>Privacy Policy</Link>
          <Link to="/terms" className="hover:underline" aria-current={!privacy ? 'page' : undefined}>Terms of Use</Link>
        </nav>
      </div>
    </header>
    <main id="main-content" className="mx-auto max-w-3xl space-y-6 px-5 py-10 leading-7">
      <h1 className="text-3xl font-bold">{privacy ? 'นโยบายความเป็นส่วนตัว (Privacy Policy)' : 'ข้อกำหนดการใช้งาน (Terms of Use)'}</h1>
      <p className="text-sm text-muted-foreground">ผู้ให้บริการ: โครงการ PaiNaiDee (ไปไหนดี) · ปรับปรุงล่าสุด 3 พฤศจิกายน 2569</p>
      {privacy ? <>
        <section><h2 className="text-xl font-semibold">1. ข้อมูลที่ใช้ในการให้บริการ</h2>
          <p>เมื่อค้นหาสถานที่หรือขอให้ AI วางแผนเที่ยว เว็บไซต์ประมวลผลข้อความที่ส่ง จังหวัด จำนวนวัน งบประมาณ รูปแบบการเดินทาง และข้อมูลสถานที่ที่เกี่ยวข้อง ระบบโฮสต์และ API อาจประมวลผลข้อมูลทางเทคนิค เช่น IP address, เวลาคำขอ, บันทึกข้อผิดพลาด และข้อมูลเบราว์เซอร์เพื่อความปลอดภัยและการแก้ปัญหา โปรดอย่าส่งข้อมูลส่วนบุคคลที่อ่อนไหวในข้อความถึง AI</p></section>
        <section><h2 className="text-xl font-semibold">2. วัตถุประสงค์และผู้ให้บริการภายนอก</h2>
          <p>ข้อมูลคำขอแผนเที่ยวอาจส่งไปยังผู้ให้บริการโมเดล AI ผ่าน OpenRouter เพื่อสร้างคำแนะนำ ข้อมูลแผนที่และสถานที่อาจได้รับจาก Google Maps Platform หรือผู้ให้บริการแผนที่รายอื่นเมื่อฟีเจอร์นั้นเปิดใช้งาน ผู้ให้บริการโครงสร้างพื้นฐานอาจรวมถึง Vercel และ Railway การประมวลผลของบุคคลภายนอกอยู่ภายใต้นโยบายของผู้ให้บริการแต่ละราย</p>
          <p>ดู <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">นโยบายความเป็นส่วนตัวของ Google</a> และ <a className="underline" href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer">นโยบายของ OpenRouter</a></p></section>
        <section><h2 className="text-xl font-semibold">3. การจัดเก็บและระยะเวลา</h2>
          <p>ผลลัพธ์จาก Google Places ใช้สำหรับคำขอแผนเที่ยวขณะนั้น ไม่จัดเก็บเนื้อหาสถานที่จาก Google ไว้ถาวร (ยกเว้น Place ID ที่เงื่อนไข Google อนุญาต) ประวัติแชตของหน้าวางแผนเที่ยวถูกเก็บในหน่วยความจำของหน้าเว็บระหว่างที่ใช้งานในแท็บนั้น บันทึกการทำงานของระบบอาจถูกเก็บโดยผู้ให้บริการโฮสต์ตามการตั้งค่าและข้อกำหนดของแต่ละบริการ</p></section>
        <section><h2 className="text-xl font-semibold">4. สิทธิและการติดต่อ</h2>
          <p>หากต้องการสอบถามเกี่ยวกับข้อมูล การแก้ไขหรือลบข้อมูล โปรดเริ่มติดต่อผู้ดูแลผ่าน <a className="underline" href={supportUrl} target="_blank" rel="noopener noreferrer">ช่องทางแจ้งปัญหา PaiNaiDee</a> โดยไม่เผยแพร่ข้อมูลส่วนบุคคลหรือข้อมูลอ่อนไหวใน Issue สาธารณะ ผู้ดูแลจะประสานช่องทางส่วนตัวสำหรับเรื่องที่ต้องยืนยันตัวตน</p></section>
      </> : <>
        <section><h2 className="text-xl font-semibold">1. การใช้งานเว็บไซต์</h2>
          <p>PaiNaiDee ให้ข้อมูลแหล่งท่องเที่ยว แผนเที่ยวและงบประมาณเพื่อประกอบการตัดสินใจ ไม่ใช่การยืนยันการจอง ราคา เวลาเปิดทำการ หรือความปลอดภัยในการเดินทาง ผู้ใช้ต้องตรวจสอบข้อมูลสำคัญกับสถานที่และผู้ให้บริการจริงก่อนออกเดินทาง</p></section>
        <section><h2 className="text-xl font-semibold">2. คำแนะนำจาก AI และแผนบางส่วน</h2>
          <p>AI อาจตอบคลาดเคลื่อนหรือให้แผนได้ไม่ครบทุกวัน ระบบจะแสดงการตรวจสอบและคำเตือนเท่าที่ทำได้ ห้ามใช้ผลลัพธ์แทนข้อมูลการเดินทางจริงหรือการตัดสินใจด้านความปลอดภัย</p></section>
        <section><h2 className="text-xl font-semibold">3. บริการของบุคคลภายนอก</h2>
          <p>เมื่อใช้งานข้อมูลจาก Google Maps Platform การใช้งานอยู่ภายใต้ <a className="underline" href="https://cloud.google.com/maps-platform/terms" target="_blank" rel="noopener noreferrer">ข้อกำหนด Google Maps Platform</a> รวมถึง <a className="underline" href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">ข้อกำหนด Google Maps</a> และ <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">นโยบายความเป็นส่วนตัวของ Google</a> แผนที่ การนำทางและข้อมูลสถานที่ของ Google เป็นบริการของ Google ไม่ใช่ข้อมูลที่ PaiNaiDee รับรอง</p></section>
        <section><h2 className="text-xl font-semibold">4. การใช้งานที่เหมาะสม</h2>
          <p>ห้ามพยายามเจาะระบบ ส่งคำขออัตโนมัติเพื่อรบกวนบริการ หรือนำข้อมูลของบุคคลภายนอกไปใช้ขัดต่อสิทธิและข้อกำหนดเจ้าของข้อมูล เว็บไซต์อาจจำกัดคำขอเพื่อความปลอดภัยและควบคุมต้นทุน</p></section>
        <section><h2 className="text-xl font-semibold">5. การเปลี่ยนแปลงและการติดต่อ</h2>
          <p>ข้อกำหนดอาจปรับปรุงเมื่อบริการเปลี่ยนไป ดูวันที่แก้ไขด้านบน และแจ้งปัญหาทั่วไปผ่าน <a className="underline" href={supportUrl} target="_blank" rel="noopener noreferrer">ช่องทาง PaiNaiDee</a> โดยไม่ส่งข้อมูลลับลงใน Issue สาธารณะ</p></section>
      </>}
      <footer className="flex gap-5 border-t pt-5 text-sm"><Link className="underline" to="/">หน้าแรก</Link><Link className="underline" to="/trip-planner">AI วางแผนเที่ยว</Link></footer>
    </main>
  </div>;
}
