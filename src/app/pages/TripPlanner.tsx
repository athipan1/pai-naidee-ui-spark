import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPinned, Sparkles, Wallet, Navigation, Users, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getRailwayPlaceFacets } from '@/services/railway-api.service';
import { useAllAttractions } from '@/shared/hooks/useAttractionQueries';
import { auditTripRoute, createTripPlan, estimateTripBudget, mapDirectionsUrl, type TripPlanInput, type TripStyle } from '@/shared/utils/tripPlanner';
import { parseTripIntent, type TripIntent } from '@/shared/utils/tripIntent';
import BottomNavigation from '@/components/common/BottomNavigation';

interface Props { currentLanguage: 'th' | 'en' }

const currency = (value: number) => `฿${value.toLocaleString('th-TH')}`;

export default function TripPlanner({ currentLanguage }: Props) {
  const th = currentLanguage === 'th';
  const [province, setProvince] = useState('');
  const [days, setDays] = useState(2);
  const [people, setPeople] = useState(2);
  const [dailyBudgetPerPerson, setDailyBudgetPerPerson] = useState(1500);
  const [style, setStyle] = useState<TripStyle>('balanced');
  const [transport, setTransport] = useState<'car' | 'public'>('car');
  const [generated, setGenerated] = useState(false);
  const [request, setRequest] = useState('');
  const [intent, setIntent] = useState<TripIntent | null>(null);
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const requestAiPlan = async () => {
    if (!request.trim() || !province || !days || !people) return;
    setAiLoading(true); setAiError(''); setAiPlan(null);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch('https://painaidee-api-production.up.railway.app/api/ai/trip-plan', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ message: request, province, days, people,
            budget: intent?.totalBudget ?? days * people * dailyBudgetPerPerson, transport }),
        });
        if (!response.ok) throw Error('AI planning unavailable (' + response.status + ')');
        setAiPlan(await response.json());
      } finally { clearTimeout(timer); }
    } catch { setAiError(th ? 'AI ยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง' : 'AI planner unavailable. Try later.'); }
    finally { setAiLoading(false); }
  };

  const facets = useQuery({ queryKey: ['places', 'facets'], queryFn: getRailwayPlaceFacets, staleTime: 5 * 60_000 });
  const places = useAllAttractions({ province }, { enabled: !!province });
  const input: TripPlanInput = { days, people, dailyBudgetPerPerson, style, transport };
  const stops = useMemo(() => generated && province && places.data
    ? createTripPlan(places.data.attractions.map(p => ({ ...p, images: p.images ?? [], coordinates: p.coordinates, tags: p.tags ?? [] })), input, intent?.avoidLongDrives ? intent.maxLegKm : undefined)
    : [], [generated, province, places.data, days, people, dailyBudgetPerPerson, style, transport, intent]);
  const budget = estimateTripBudget(input);
  const routeAudit = useMemo(() => auditTripRoute(stops, intent?.maxLegKm ?? 100), [stops, intent]);
  const exceedsBudget = intent?.totalBudget !== null && intent?.totalBudget !== undefined && budget.total > intent.totalBudget;

  const interpretRequest = () => {
    const parsed = parseTripIntent(request, facets.data?.provinces ?? []);
    setIntent(parsed);
    setGenerated(false);
    if (parsed.issues.length) return;
    setProvince(parsed.province);
    setDays(parsed.days);
    setPeople(parsed.people);
    setDailyBudgetPerPerson(Math.floor(parsed.totalBudget! / parsed.days / parsed.people));
    setStyle(parsed.style);
    setTransport(parsed.transport);
    setGenerated(true);
  };

  const generate = () => setGenerated(true);
  const updateInput = (setter: () => void) => { setter(); setGenerated(false); setIntent(null); };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-lg">
        <div className="container mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" aria-label={th ? 'กลับหน้าแรก' : 'Back home'} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <Sparkles className="h-6 w-6 text-teal-400" />
          <span className="font-semibold">{th ? 'AI วางแผนเที่ยว' : 'Smart Trip Planner'}</span>
        </div>
      </header>
      <main className="container mx-auto max-w-5xl space-y-6 px-4 py-7">
        <section className="rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/15 via-background to-amber-500/10 p-6 sm:p-9">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400"><Sparkles className="h-4 w-4" /> PaiNaiDee Smart Planner</div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{th ? 'ทริปในฝัน เริ่มได้ที่นี่' : 'Your next trip starts here'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{th ? 'เลือกจุดหมายและสไตล์การเที่ยว เราจะจัดสถานที่จริงเป็นทริปรายวัน พร้อมประเมินงบและลิงก์เส้นทางให้' : 'Choose a destination and travel style to create a day-by-day plan from real places, with budget estimates and route links.'}</p>
        </section>

        <Card><CardContent className="space-y-4 p-5 sm:p-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Sparkles className="h-5 w-5 text-teal-400" />{th ? 'เล่าทริปที่อยากไป' : 'Describe your ideal trip'}</h2>
          <label htmlFor="trip-request" className="block text-sm text-muted-foreground">{th ? 'ระบุจังหวัด จำนวนวัน งบรวม และความชอบด้วยภาษาธรรมชาติ' : 'Include province, days, total budget and preferences'}</label>
          <textarea id="trip-request" rows={3} maxLength={500} value={request} onChange={e => { setRequest(e.target.value); setIntent(null); setGenerated(false); }}
            placeholder={th ? 'อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท ชอบธรรมชาติ ไม่อยากขับรถไกล' : 'Chiang Mai 3 days budget 6000 baht, nature and short drives'}
            className="w-full rounded-xl border border-input bg-background p-3 text-base" />
          <Button type="button" onClick={interpretRequest} disabled={!request.trim() || facets.isLoading || !facets.data} className="w-full bg-teal-400 text-slate-950 hover:bg-teal-300">
            <Sparkles className="mr-2 h-4 w-4" />{th ? 'ตีความและสร้างแผนเบื้องต้น' : 'Interpret and draft itinerary'}
          </Button>
          {intent && <div aria-live="polite" className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
            {intent.issues.length ? <ul className="list-disc space-y-1 pl-5 text-amber-500">{intent.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
              : <p>{th ? `เข้าใจคำขอ: ${intent.province} · ${intent.days} วัน · ${intent.people} คน · งบรวม ${currency(intent.totalBudget!)} · ${intent.avoidLongDrives ? 'จำกัดช่วงระหว่างจุดแวะไม่เกิน 30 กม. (เส้นตรง)' : 'วางแผนตามระยะทาง'}`
                : `Interpreted: ${intent.province}, ${intent.days} days, ${intent.people} people, total budget ${currency(intent.totalBudget!)}`}</p>}
          </div>}
          <Button type="button" variant="outline" onClick={requestAiPlan}
            disabled={aiLoading || !request.trim() || !province}>
            {aiLoading ? (th ? 'AI กำลังวางแผน...' : 'AI is planning...') : (th ? 'สร้างแผนด้วย OpenRouter AI' : 'Generate with OpenRouter AI')}
          </Button>
          {aiError && <p role="alert" className="text-sm text-red-400">{aiError}</p>}
          {aiPlan && <section className="space-y-3" aria-label="Verified AI draft">
            <h3 className="font-semibold">{th ? 'แผนจาก AI (ฉบับร่าง)' : 'AI itinerary (draft)'}</h3>
            {aiPlan.days?.map((day: any) => <div key={day.day} className="rounded-xl border p-3">
              <p className="font-semibold">{th ? 'วันที่' : 'Day'} {day.day}</p>
              {day.stops?.map((stop: any) => <p key={stop.id}>• {stop.name} · {stop.openingHours?.status === 'sourced' ? `${stop.openingHours.value} (${stop.openingHours.source})` : (th ? 'เวลาทำการยังไม่ยืนยัน' : 'Hours unverified')}</p>)}
              {day.legs?.map((leg: any, i: number) => <p className="text-xs text-muted-foreground" key={i}>
                {leg.road?.status === 'verified_route'
                  ? `${leg.road.distanceKm} km / ${leg.road.durationMinutes} min (Geoapify)`
                  : (th ? 'เส้นทางถนนยังไม่ยืนยัน' : 'Road route unverified')}
              </p>)}
            </div>)}
            <p>{th ? 'งบประมาณคร่าว ๆ' : 'Estimated budget'}: {currency(aiPlan.budget?.estimatedTotal ?? 0)}</p>
            {aiPlan.validation?.warnings?.map((warning: string) => <p key={warning} className="text-xs text-amber-500">⚠ {warning}</p>)}
          </section>}
          <p className="text-xs text-muted-foreground">{th ? 'โหมดแผนพื้นฐานด้านล่างใช้กฎภาษาไทยและตรวจเงื่อนไขอย่างเป็นระบบ ส่วนปุ่ม OpenRouter AI จะส่งคำขอไปยังโมเดลภายนอกผ่าน Railway' : 'The basic mode uses local rules. OpenRouter AI sends your request to an external model via Railway.'}</p>
        </CardContent></Card>

        <Card><CardContent className="space-y-5 p-5 sm:p-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><SlidersHorizontal className="h-5 w-5 text-teal-400" />{th ? 'ออกแบบทริปของคุณ' : 'Customize your trip'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">{th ? 'จังหวัดปลายทาง' : 'Destination province'}
              <select aria-label={th ? 'จังหวัดปลายทาง' : 'Destination province'} className="h-12 w-full rounded-lg border border-input bg-background px-3" value={province} onChange={e => updateInput(() => setProvince(e.target.value))}>
                <option value="">{th ? 'เลือกจังหวัด' : 'Select province'}</option>
                {(facets.data?.provinces ?? []).map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{th ? 'จำนวนวัน' : 'Days'}</span>
              <select className="h-12 w-full rounded-lg border border-input bg-background px-3" value={days} onChange={e => updateInput(() => setDays(Number(e.target.value)))}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {th ? 'วัน' : 'days'}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Users className="h-4 w-4" />{th ? 'ผู้เดินทาง' : 'Travelers'}</span>
              <select className="h-12 w-full rounded-lg border border-input bg-background px-3" value={people} onChange={e => updateInput(() => setPeople(Number(e.target.value)))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {th ? 'คน' : 'people'}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Wallet className="h-4 w-4" />{th ? 'งบต่อคนต่อวัน' : 'Budget per person/day'}</span>
              <select className="h-12 w-full rounded-lg border border-input bg-background px-3" value={dailyBudgetPerPerson} onChange={e => updateInput(() => setDailyBudgetPerPerson(Number(e.target.value)))}>
                {![500, 800, 1000, 1500, 2000, 3000, 5000].includes(dailyBudgetPerPerson) && <option value={dailyBudgetPerPerson}>{currency(dailyBudgetPerPerson)}</option>}
                {[500, 800, 1000, 1500, 2000, 3000, 5000].map(n => <option key={n} value={n}>{currency(n)}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">{th ? 'สไตล์ท่องเที่ยว' : 'Travel style'}
              <select className="h-12 w-full rounded-lg border border-input bg-background px-3" value={style} onChange={e => updateInput(() => setStyle(e.target.value as TripStyle))}>
                <option value="balanced">{th ? 'หลากหลาย' : 'Balanced'}</option><option value="nature">{th ? 'ธรรมชาติ' : 'Nature'}</option><option value="culture">{th ? 'วัฒนธรรม' : 'Culture'}</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">{th ? 'การเดินทาง' : 'Transport'}
              <select className="h-12 w-full rounded-lg border border-input bg-background px-3" value={transport} onChange={e => updateInput(() => setTransport(e.target.value as 'car' | 'public'))}>
                <option value="car">{th ? 'รถยนต์' : 'Car'}</option><option value="public">{th ? 'ขนส่งสาธารณะ' : 'Public transport'}</option>
              </select>
            </label>
          </div>
          <Button disabled={!province || places.isLoading || !places.data || !!places.error} onClick={generate} className="h-12 w-full bg-teal-400 font-semibold text-slate-950 hover:bg-teal-300">
            <Sparkles className="mr-2 h-5 w-5" />{places.isLoading ? (th ? 'กำลังโหลดสถานที่...' : 'Loading places...') : (th ? 'สร้างทริปของฉัน' : 'Build my trip')}
          </Button>
          {places.error && <p role="alert" className="text-sm text-red-400">{th ? 'โหลดข้อมูลสถานที่ไม่ได้ กรุณาลองใหม่ภายหลัง' : 'Could not load places. Please try later.'}</p>}
        </CardContent></Card>

        {generated && <section className="space-y-5" aria-live="polite">
          <Card><CardContent className="space-y-2 p-5 text-sm">
            <h3 className="font-semibold">{th ? 'ผลตรวจความพร้อมของแผน' : 'Itinerary validation'}</h3>
            <p>✅ {th ? 'พิกัด' : 'Coordinates'}: {routeAudit.validCoordinates ? (th ? 'ผ่านการตรวจขอบเขตไทย' : 'Valid Thailand bounds') : (th ? 'ไม่มีจุดแวะที่ผ่านเกณฑ์' : 'No valid stops')}</p>
            <p>{routeAudit.overDistanceLimit ? '⚠️' : '✅'} {th ? 'ระยะระหว่างจุดแวะ' : 'Inter-stop distance'}: {routeAudit.overDistanceLimit ? (th ? 'เกินข้อจำกัด' : 'Exceeds limit') : (th ? 'ไม่เกินข้อจำกัดที่กำหนด (วัดระยะเส้นตรง)' : 'Within straight-line limit')}</p>
            <p>⚠️ {th ? 'เวลาทำการ: ยังไม่ยืนยันจากแหล่งข้อมูลทางการ โปรดตรวจสอบแต่ละสถานที่ก่อนเดินทาง' : 'Opening hours: unverified; check each place before traveling'}</p>
            <p>{exceedsBudget ? '⚠️' : '✅'} {th ? 'งบประมาณ' : 'Budget'}: {exceedsBudget ? (th ? 'เกินวงเงินที่ร้องขอ' : 'Over requested budget') : (th ? 'อยู่ภายในวงเงินประมาณการ' : 'Within estimated cap')}</p>
            <p className="text-xs text-muted-foreground">{th ? 'ระยะเส้นตรงไม่ใช่ระยะถนนหรือเวลาเดินทางจริง แผนนี้ยังเป็นฉบับร่าง ไม่ใช่แผนที่ยืนยันเวลาทำการแล้ว' : 'Straight-line distance is not driving distance or travel time. This is a draft, not an hours-verified itinerary.'}</p>
          </CardContent></Card>
          {stops.length === 0 ? <Card><CardContent className="p-5">{th ? 'จังหวัดนี้ยังไม่มีสถานที่พร้อมพิกัดเพียงพอสำหรับจัดทริป' : 'No verified coordinates available for this destination yet.'}</CardContent></Card> : <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">{th ? `ทริป ${province} ${days} วัน` : `${province}: ${days}-day trip`}</h2><p className="text-sm text-muted-foreground">{th ? `${stops.length} สถานที่ · ${people} คน` : `${stops.length} places · ${people} travelers`}</p></div></div>
            <Card><CardContent className="p-5"><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Wallet className="h-5 w-5 text-amber-400" />{th ? 'ประมาณการงบทั้งทริป' : 'Estimated trip budget'}</h3>
              <p className="text-3xl font-bold text-amber-400">{currency(budget.total)}</p><p className="mb-4 text-sm text-muted-foreground">{th ? `เฉลี่ย ${currency(budget.perPerson)} ต่อคน` : `${currency(budget.perPerson)} per person`}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">{([[th ? 'อาหาร' : 'Meals', budget.meals], [th ? 'เดินทาง' : 'Transport', budget.transport], [th ? 'ที่พัก' : 'Accommodation', budget.accommodation], [th ? 'กิจกรรม' : 'Activities', budget.activities]] as const).map(([label, amount]) => <div key={label} className="rounded-xl bg-muted/60 p-3"><span className="text-muted-foreground">{label}</span><p className="mt-1 font-semibold">{currency(amount)}</p></div>)}</div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{th ? 'ตัวเลขนี้เป็นการแบ่งงบตามสมมติฐานเพื่อวางแผน ไม่ใช่ราคาโรงแรม ค่าเข้าชม ค่าเดินทางจริง หรือใบเสนอราคา โปรดตรวจสอบราคาและเวลาทำการก่อนเดินทาง' : 'Indicative allocations only, not live hotel, transport or admission prices. Verify actual prices and opening hours before traveling.'}</p>
            </CardContent></Card>
            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const daily = stops.filter(s => s.day === day);
              if (!daily.length) return null;
              const url = mapDirectionsUrl(daily);
              return <Card key={day}><CardContent className="space-y-3 p-5"><div className="flex items-center justify-between gap-2"><h3 className="text-lg font-semibold">{th ? `วันที่ ${day}` : `Day ${day}`}</h3>{url && <a className="inline-flex items-center gap-1 text-sm text-teal-400 underline" href={url} target="_blank" rel="noopener noreferrer"><Navigation className="h-4 w-4" />{th ? 'เปิดเส้นทาง' : 'Open route'}</a>}</div>
                <ol className="space-y-3">{daily.map((stop, i) => <li key={stop.place.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-sm font-bold text-teal-400">{i + 1}</span><div className="min-w-0 flex-1"><Link className="font-semibold hover:underline" to={`/attraction/${stop.place.id}`}>{th ? stop.place.nameLocal || stop.place.name : stop.place.name}</Link><p className="text-xs text-muted-foreground">{stop.place.category} · {stop.place.province}</p></div></li>)}</ol>
              </CardContent></Card>;
            })}
            {routeAudit.legs.length > 0 && <Card><CardContent className="space-y-2 p-5"><h3 className="font-semibold">{th ? 'ตรวจระยะทางระหว่างจุดแวะ (เส้นตรง)' : 'Straight-line legs'}</h3>{routeAudit.legs.map((leg, i) => <p key={i} className="text-sm text-muted-foreground">{leg.from} → {leg.to}: {leg.straightLineKm} กม.</p>)}</CardContent></Card>}
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><MapPinned className="h-4 w-4 shrink-0" />{th ? 'ลำดับจุดแวะคำนวณจากความใกล้เคียงและประเภทสถานที่ ไม่ใช่เวลาเดินทางจากการจราจรจริง เส้นทาง Google Maps ใช้สำหรับตรวจสอบและปรับแผนก่อนออกเดินทาง' : 'Stops are ordered by proximity and category, not live traffic. Check routes in Google Maps before leaving.'}</p>
          </>}
        </section>}
        <p className="text-center text-xs text-muted-foreground">{th ? 'Smart Planner รุ่นเริ่มต้นใช้การจัดอันดับอัตโนมัติจากข้อมูลสถานที่จริง ยังไม่ใช่ AI สนทนาหรือการจองอัตโนมัติ' : 'This first version uses rule-based ranking of real places, not conversational AI or automated bookings.'}</p>
      </main>
      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
}
