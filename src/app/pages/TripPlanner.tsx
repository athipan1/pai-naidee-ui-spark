import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPinned, Sparkles, Wallet, Navigation, Users, SlidersHorizontal, LoaderCircle, RotateCcw, AlertCircle, Compass, Trees, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getRailwayPlaceFacets } from '@/services/railway-api.service';
import { useAllAttractions } from '@/shared/hooks/useAttractionQueries';
import { auditTripRoute, createTripPlan, estimateTripBudget, mapDirectionsUrl, type TripPlanInput, type TripStyle } from '@/shared/utils/tripPlanner';
import { parseTripIntent, type TripIntent } from '@/shared/utils/tripIntent';
import BottomNavigation from '@/components/common/BottomNavigation';
import TripTimelineMap from './TripTimelineMap';

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
  const [editedStops, setEditedStops] = useState<import('@/shared/utils/tripPlanner').TripStop[] | null>(null);
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
      const timer = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await fetch('https://painaidee-api-production.up.railway.app/api/ai/trip-plan', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ message: request, province, days, people,
            budget: intent?.totalBudget ?? days * people * dailyBudgetPerPerson, transport }),
        });
        if (!response.ok) {
          const payload: { code?: string } = await response.json().catch(() => ({}));
          const messages: Record<string, string> = th
            ? { UPSTREAM_FAILURE: 'ผู้ให้บริการ AI ส่งคำตอบที่ระบบอ่านไม่ได้ กรุณาลองใหม่ภายหลัง', INVALID_JSON: 'AI ส่ง JSON ไม่ถูกต้อง กรุณาลองใหม่', INVALID_SCHEMA: 'รูปแบบแผนจาก AI ไม่ผ่านการตรวจสอบ', INVALID_PLACE_IDS: 'AI ระบุสถานที่ที่ไม่ได้อยู่ในฐานข้อมูล', INCOMPLETE_RESPONSE: 'คำตอบ AI ถูกตัดก่อนจบ กรุณาลองใหม่' }
            : { UPSTREAM_FAILURE: 'AI provider returned an unreadable response. Try again later.', INVALID_JSON: 'Invalid AI JSON response.', INVALID_SCHEMA: 'AI itinerary failed validation.', INVALID_PLACE_IDS: 'AI referenced unknown places.', INCOMPLETE_RESPONSE: 'AI output was cut short.' };
          throw Error(messages[payload.code ?? ''] || (th ? 'AI ยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง' : 'AI planner unavailable. Try later.'));
        }
        setAiPlan(await response.json());
      } finally { clearTimeout(timer); }
    } catch (error) { setAiError(error instanceof Error && error.name !== 'AbortError' ? error.message : (th ? 'การเชื่อมต่อ AI หมดเวลา กรุณาลองใหม่' : 'AI request timed out.')); }
    finally { setAiLoading(false); }
  };

  const facets = useQuery({ queryKey: ['places', 'facets'], queryFn: getRailwayPlaceFacets, staleTime: 5 * 60_000 });
  const places = useAllAttractions({ province }, { enabled: !!province });
  const input: TripPlanInput = { days, people, dailyBudgetPerPerson, style, transport };
  const stops = useMemo(() => generated && province && places.data
    ? createTripPlan(places.data.attractions.map(p => ({ ...p, images: p.images ?? [], coordinates: p.coordinates, tags: p.tags ?? [] })), input, intent?.avoidLongDrives ? intent.maxLegKm : undefined)
    : [], [generated, province, places.data, days, people, dailyBudgetPerPerson, style, transport, intent]);
  const displayedStops = editedStops ?? stops;
  const budget = estimateTripBudget(input);
  const routeAudit = useMemo(() => auditTripRoute(displayedStops, intent?.maxLegKm ?? 100), [displayedStops, intent]);
  const exceedsBudget = intent?.totalBudget !== null && intent?.totalBudget !== undefined && budget.total > intent.totalBudget;

  const interpretRequest = () => {
    const parsed = parseTripIntent(request, facets.data?.provinces ?? []);
    setIntent(parsed);
    setGenerated(false);
    setEditedStops(null);
    if (parsed.issues.length) return;
    setProvince(parsed.province);
    setDays(parsed.days);
    setPeople(parsed.people);
    setDailyBudgetPerPerson(Math.floor(parsed.totalBudget! / parsed.days / parsed.people));
    setStyle(parsed.style);
    setTransport(parsed.transport);
    setGenerated(true);
  };

  const generate = () => { setEditedStops(null); setGenerated(true); };
  const updateInput = (setter: () => void) => { setter(); setGenerated(false); setIntent(null); setEditedStops(null); };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-background pb-36 sm:pb-28">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-lg">
        <div className="container mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" aria-label={th ? 'กลับหน้าแรก' : 'Back home'} className="rounded-lg p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <Sparkles className="h-6 w-6 text-teal-400" />
          <span className="font-semibold">{th ? 'AI วางแผนเที่ยว' : 'Smart Trip Planner'}</span>
          <span className="ml-auto text-[10px] text-muted-foreground" aria-label="Frontend build">v{__PAINAIDEE_BUILD__}</span>
        </div>
      </header>
      <main className="container mx-auto w-full min-w-0 max-w-5xl space-y-6 overflow-x-clip px-4 py-5 sm:px-4 sm:py-7">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/15 via-background to-amber-500/10 p-5 shadow-sm sm:p-9">
          <a href="#trip-customizer" className="float-right rounded-full border border-teal-400/30 px-3 py-2 text-xs font-semibold text-teal-600 dark:text-teal-300 hover:bg-teal-500/10">{th ? 'เริ่มวางแผน' : 'Start planning'}</a>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400"><Sparkles className="h-4 w-4" /> PaiNaiDee Smart Planner</div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{th ? 'ทริปในฝัน เริ่มได้ที่นี่' : 'Your next trip starts here'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{th ? 'เลือกจุดหมายและสไตล์การเที่ยว เราจะจัดสถานที่จริงเป็นทริปรายวัน พร้อมประเมินงบและลิงก์เส้นทางให้' : 'Choose a destination and travel style to create a day-by-day plan from real places, with budget estimates and route links.'}</p>
        </section>

        <Card id="trip-customizer" className="scroll-mt-24 border-teal-500/20 shadow-sm"><CardContent className="min-w-0 space-y-5 overflow-hidden p-4 sm:p-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><SlidersHorizontal className="h-5 w-5 text-teal-400" />{th ? 'ออกแบบทริปของคุณ' : 'Customize your trip'}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{th ? 'เลือกจังหวัด วันเดินทาง ผู้เดินทาง และงบประมาณได้ในไม่กี่ขั้นตอน' : 'Choose your destination, days, travelers and budget in a few steps.'}</p>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <label className="min-w-0 space-y-2 text-sm font-medium">{th ? 'จังหวัดปลายทาง' : 'Destination province'}
              <select aria-label={th ? 'จังหวัดปลายทาง' : 'Destination province'} className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={province} onChange={e => updateInput(() => setProvince(e.target.value))}>
                <option value="">{th ? 'เลือกจังหวัด' : 'Select province'}</option>
                {(facets.data?.provinces ?? []).map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="min-w-0 space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{th ? 'จำนวนวัน' : 'Days'}</span>
              <select className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={days} onChange={e => updateInput(() => setDays(Number(e.target.value)))}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {th ? 'วัน' : 'days'}</option>)}
              </select>
            </label>
            <label className="min-w-0 space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Users className="h-4 w-4" />{th ? 'ผู้เดินทาง' : 'Travelers'}</span>
              <select className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={people} onChange={e => updateInput(() => setPeople(Number(e.target.value)))}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {th ? 'คน' : 'people'}</option>)}
              </select>
            </label>
            <label className="min-w-0 space-y-2 text-sm font-medium"><span className="flex items-center gap-2"><Wallet className="h-4 w-4" />{th ? 'งบต่อคนต่อวัน' : 'Budget per person/day'}</span>
              <select className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={dailyBudgetPerPerson} onChange={e => updateInput(() => setDailyBudgetPerPerson(Number(e.target.value)))}>
                {![500, 800, 1000, 1500, 2000, 3000, 5000].includes(dailyBudgetPerPerson) && <option value={dailyBudgetPerPerson}>{currency(dailyBudgetPerPerson)}</option>}
                {[500, 800, 1000, 1500, 2000, 3000, 5000].map(n => <option key={n} value={n}>{currency(n)}</option>)}
              </select>
            </label>
            <label className="min-w-0 space-y-2 text-sm font-medium">{th ? 'สไตล์ท่องเที่ยว' : 'Travel style'}
              <select className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={style} onChange={e => updateInput(() => setStyle(e.target.value as TripStyle))}>
                <option value="balanced">{th ? 'หลากหลาย' : 'Balanced'}</option><option value="nature">{th ? 'ธรรมชาติ' : 'Nature'}</option><option value="culture">{th ? 'วัฒนธรรม' : 'Culture'}</option>
              </select>
            </label>
            <label className="min-w-0 space-y-2 text-sm font-medium">{th ? 'การเดินทาง' : 'Transport'}
              <select className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-base focus-visible:ring-2 focus-visible:ring-teal-400/40" value={transport} onChange={e => updateInput(() => setTransport(e.target.value as 'car' | 'public'))}>
                <option value="car">{th ? 'รถยนต์' : 'Car'}</option><option value="public">{th ? 'ขนส่งสาธารณะ' : 'Public transport'}</option>
              </select>
            </label>
          </div>
          <div className="rounded-xl bg-muted/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2"><span className="text-sm text-muted-foreground">{th ? 'งบประมาณรวมโดยประมาณ' : 'Estimated total budget'}</span><strong className="text-lg text-teal-700 dark:text-teal-300">{currency(days * people * dailyBudgetPerPerson)}</strong></div>
          <Button disabled={!province || places.isLoading || !places.data || !!places.error} onClick={generate} className="min-h-12 w-full rounded-xl bg-teal-400 font-semibold text-slate-950 shadow-sm hover:bg-teal-300">
            <Sparkles className="mr-2 h-5 w-5" />{places.isLoading ? (th ? 'กำลังโหลดสถานที่...' : 'Loading places...') : (th ? 'สร้างทริปของฉัน' : 'Build my trip')}
          </Button>
          {places.error && <p role="alert" className="text-sm text-red-400">{th ? 'โหลดข้อมูลสถานที่ไม่ได้ กรุณาลองใหม่ภายหลัง' : 'Could not load places. Please try later.'}</p>}
        </CardContent></Card>

        <Card><CardContent className="min-w-0 space-y-5 overflow-hidden p-4 sm:p-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Sparkles className="h-5 w-5 text-teal-400" />{th ? 'เล่าทริปที่อยากไป' : 'Describe your ideal trip'}</h2>
          <label htmlFor="trip-request" className="block text-sm text-muted-foreground">{th ? 'ระบุจังหวัด จำนวนวัน งบรวม และความชอบด้วยภาษาธรรมชาติ' : 'Include province, days, total budget and preferences'}</label>
          <textarea id="trip-request" rows={3} maxLength={500} value={request} onChange={e => { setRequest(e.target.value); setIntent(null); setGenerated(false); }}
            placeholder={th ? 'อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท ชอบธรรมชาติ ไม่อยากขับรถไกล' : 'Chiang Mai 3 days budget 6000 baht, nature and short drives'}
            className="block w-full min-w-0 max-w-full resize-y rounded-2xl border border-input bg-background p-4 text-base leading-7 shadow-sm transition focus-visible:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-400/30" />
          <Button type="button" onClick={interpretRequest} disabled={!request.trim() || facets.isLoading || !facets.data} className="min-h-12 w-full rounded-xl bg-teal-400 font-semibold text-slate-950 shadow-sm transition hover:bg-teal-300">
            <Sparkles className="mr-2 h-4 w-4" />{th ? 'ตีความและสร้างแผนเบื้องต้น' : 'Interpret and draft itinerary'}
          </Button>
          {intent && <div aria-live="polite" className="min-w-0 space-y-2 break-words rounded-xl bg-muted/60 p-4 text-sm">
            {intent.issues.length ? <ul className="list-disc space-y-1 pl-5 text-amber-500">{intent.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>
              : <p>{th ? `เข้าใจคำขอ: ${intent.province} · ${intent.days} วัน · ${intent.people} คน · งบรวม ${currency(intent.totalBudget!)} · ${intent.avoidLongDrives ? 'จำกัดช่วงระหว่างจุดแวะไม่เกิน 30 กม. (เส้นตรง)' : 'วางแผนตามระยะทาง'}`
                : `Interpreted: ${intent.province}, ${intent.days} days, ${intent.people} people, total budget ${currency(intent.totalBudget!)}`}</p>}
          </div>}
          <Button type="button" variant="outline" onClick={requestAiPlan} className="min-h-12 w-full rounded-xl border-teal-500/30 font-semibold sm:w-auto"
            disabled={aiLoading || !request.trim() || !province}>
            {aiLoading ? (th ? 'AI กำลังวางแผน...' : 'AI is planning...') : (th ? 'สร้างแผนด้วย OpenRouter AI' : 'Generate with OpenRouter AI')}
          </Button>
          {aiLoading && <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-teal-400/20 bg-teal-400/5 p-3 text-sm text-muted-foreground"><LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-teal-400" />{th ? 'กำลังตรวจสถานที่และสร้างเส้นทาง โปรดรอสักครู่' : 'Checking places and preparing your route…'}</div>}
          {aiError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-500/5 p-4"><span className="flex min-w-0 items-start gap-2 text-sm text-red-500"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{aiError}</span><Button size="sm" variant="outline" disabled={aiLoading} onClick={requestAiPlan} className="gap-2 rounded-lg"><RotateCcw className="h-4 w-4" />{th ? 'ลองอีกครั้ง' : 'Retry'}</Button></div>}
          {aiPlan && <section className="min-w-0 space-y-3 break-words" aria-label="Verified AI draft">
            <div role="status" className={`rounded-xl border p-4 ${aiPlan.completeness?.status === 'complete' ? 'border-teal-500/40 bg-teal-500/10' : 'border-amber-500/40 bg-amber-500/10'}`}>
              <h3 className="font-semibold">{aiPlan.completeness?.status === 'complete' ? (th ? 'แผนครบตามเงื่อนไขที่ตรวจสอบ' : 'Complete verified itinerary') : (th ? 'แผนบางส่วน ยังไม่ครบตามเงื่อนไข' : 'Partial itinerary: some requirements unmet')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{th ? `วางแผนได้ ${aiPlan.completeness?.plannedDays ?? aiPlan.days?.length ?? 0} จาก ${aiPlan.completeness?.requestedDays ?? days} วัน` : `Planned ${aiPlan.completeness?.plannedDays ?? aiPlan.days?.length ?? 0} of ${aiPlan.completeness?.requestedDays ?? days} days`}</p>
              {aiPlan.completeness?.status !== 'complete' && <p className="mt-2 text-sm">{th ? 'ลองเพิ่มสถานที่หรือขยายระยะเดินทางที่ยอมรับได้ แล้วกดสร้างแผนใหม่ หรือใช้แผนพื้นฐานด้านล่าง' : 'Try relaxing the travel distance or adding more places, then regenerate, or use the basic planner below.'}</p>}
            </div>
            <TripTimelineMap days={days} th={th} stops={(aiPlan.days ?? []).flatMap((day: any) => (day.stops ?? []).map((stop: any, i: number) => {
              const place=places.data?.attractions.find(p=>String(p.id)===String(stop.id));
              return place ? {place:{...place,images:place.images??[],tags:place.tags??[]},day:day.day,order:i+1} : null;
            }).filter(Boolean))} available={[]} />
            <p>{th ? 'งบประมาณคร่าว ๆ' : 'Estimated budget'}: {currency(aiPlan.budget?.estimatedTotal ?? 0)}</p>
            {aiPlan.validation?.warnings?.map((warning: string) => <p key={warning} className="text-xs text-amber-500">⚠ {warning}</p>)}
          </section>}
          <p className="text-xs text-muted-foreground">{th ? 'โหมดแผนพื้นฐานด้านล่างใช้กฎภาษาไทยและตรวจเงื่อนไขอย่างเป็นระบบ ส่วนปุ่ม OpenRouter AI จะส่งคำขอไปยังโมเดลภายนอกผ่าน Railway' : 'The basic mode uses local rules. OpenRouter AI sends your request to an external model via Railway.'}</p>
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
            <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">{th ? `ทริป ${province} ${days} วัน` : `${province}: ${days}-day trip`}</h2><p className="text-sm text-muted-foreground">{th ? `${displayedStops.length} สถานที่ · ${people} คน` : `${displayedStops.length} places · ${people} travelers`}</p></div></div>
            <Card><CardContent className="p-5"><h3 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Wallet className="h-5 w-5 text-amber-400" />{th ? 'ประมาณการงบทั้งทริป' : 'Estimated trip budget'}</h3>
              <p className="text-3xl font-bold text-amber-400">{currency(budget.total)}</p><p className="mb-4 text-sm text-muted-foreground">{th ? `เฉลี่ย ${currency(budget.perPerson)} ต่อคน` : `${currency(budget.perPerson)} per person`}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">{([[th ? 'อาหาร' : 'Meals', budget.meals], [th ? 'เดินทาง' : 'Transport', budget.transport], [th ? 'ที่พัก' : 'Accommodation', budget.accommodation], [th ? 'กิจกรรม' : 'Activities', budget.activities]] as const).map(([label, amount]) => <div key={label} className="rounded-xl bg-muted/60 p-3"><span className="text-muted-foreground">{label}</span><p className="mt-1 font-semibold">{currency(amount)}</p></div>)}</div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{th ? 'ตัวเลขนี้เป็นการแบ่งงบตามสมมติฐานเพื่อวางแผน ไม่ใช่ราคาโรงแรม ค่าเข้าชม ค่าเดินทางจริง หรือใบเสนอราคา โปรดตรวจสอบราคาและเวลาทำการก่อนเดินทาง' : 'Indicative allocations only, not live hotel, transport or admission prices. Verify actual prices and opening hours before traveling.'}</p>
            </CardContent></Card>
            <TripTimelineMap stops={displayedStops} available={(places.data?.attractions??[]).map(p=>({...p,images:p.images??[],tags:p.tags??[]}))} days={days} th={th} onChange={setEditedStops}/>
            {editedStops && <p role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">{th?'คุณแก้ไขลำดับหรือจุดแวะแล้ว ต้องตรวจสอบเส้นทางถนน เวลาเปิดปิด และความเหมาะสมอีกครั้งก่อนเดินทาง':'You edited the itinerary. Road routes, opening hours and constraints must be revalidated.'}</p>}
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
