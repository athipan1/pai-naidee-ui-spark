import type { TripStyle, TransportMode } from './tripPlanner';

export interface TripIntent {
  province: string;
  days: number;
  people: number;
  totalBudget: number | null;
  style: TripStyle;
  transport: TransportMode;
  avoidLongDrives: boolean;
  maxLegKm: number;
  issues: string[];
}

const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
const normalizeNumbers = (value: string) => value.replace(/[๐-๙]/g, digit => String(thaiDigits.indexOf(digit)));
const numberFrom = (value: string): number | null => {
  const normalized = normalizeNumbers(value).replace(/,/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

export function parseTripIntent(text: string, availableProvinces: string[]): TripIntent {
  const query = normalizeNumbers(text).trim();
  const compact = query.replace(/\s+/g, '');
  const province = [...availableProvinces].sort((a, b) => b.length - a.length)
    .find(name => compact.includes(name.replace(/\s+/g, ''))) ?? '';
  const daysMatch = query.match(/(\d{1,2})\s*(?:วัน|days?)/i);
  const peopleMatch = query.match(/(?:จำนวน|ไป|ทั้งหมด|ผู้เดินทาง)?\s*(\d{1,2})\s*(?:คน|persons?|people)/i);
  const budgetMatch = query.match(/(?:งบ(?:ประมาณ)?|budget|ไม่เกิน|มีเงิน)\s*(?:รวม|ทั้งหมด|ราว|ประมาณ|ไม่เกิน|ที่)?\s*(?:฿|บาท)?\s*([\d,]+)\s*(?:บาท)?/i)
    ?? query.match(/([\d,]+)\s*บาท/i);
  const dailyMatch = /(?:ต่อคนต่อวัน|คน\/วัน|คนต่อวัน)/.test(query);
  const days = daysMatch ? Number(daysMatch[1]) : 0;
  const people = peopleMatch ? Number(peopleMatch[1]) : 1;
  const budgetRaw = budgetMatch ? numberFrom(budgetMatch[1]) : null;
  const totalBudget = budgetRaw === null ? null : Math.round(budgetRaw * (dailyMatch ? Math.max(days, 1) * people : 1));
  const style: TripStyle = /ธรรมชาติ|น้ำตก|ป่า|ภูเขา|ทะเล|nature|hiking/i.test(query) ? 'nature'
    : /วัด|วัฒนธรรม|พิพิธภัณฑ์|ประวัติศาสตร์|culture/i.test(query) ? 'culture' : 'balanced';
  const transport: TransportMode = /รถสาธารณะ|รถไฟ|รถบัส|ไม่ขับรถ|ไม่มีรถ|public transport/i.test(query) ? 'public' : 'car';
  const avoidLongDrives = /ไม่อยากขับรถไกล|ไม่ขับรถไกล|เดินทางใกล้|ไม่ไกล|ใกล้[ๆ]?|short drive/i.test(query);
  const issues: string[] = [];
  if (!province) issues.push('กรุณาระบุจังหวัดที่มีข้อมูลสถานที่ในระบบ');
  if (!Number.isInteger(days) || days < 1 || days > 5) issues.push('กรุณาระบุจำนวนวัน 1–5 วัน');
  if (!Number.isInteger(people) || people < 1 || people > 10) issues.push('จำนวนผู้เดินทางต้องอยู่ระหว่าง 1–10 คน');
  if (totalBudget === null || totalBudget < 500 * Math.max(days, 1) * people) issues.push('กรุณาระบุงบรวมที่ไม่น้อยกว่า 500 บาทต่อคนต่อวัน');
  return { province, days, people, totalBudget, style, transport, avoidLongDrives, maxLegKm: avoidLongDrives ? 30 : 100, issues };
}
