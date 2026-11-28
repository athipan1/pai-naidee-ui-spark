import { describe, it, expect, beforeEach } from "vitest";
import { rankDiscovery, readPreferences, recordInterest, setPersonalization, PREFERENCE_KEY, isNewPlace } from "./discoveryPreferences";
import type { DiscoveryEntry } from "@/services/railway-api.service";
const now = Date.parse("2026-11-28T00:00:00Z");
const data: DiscoveryEntry[] = Array.from({length:60}, (_,i)=>({
  id:"p"+i,province:i%3===0?"Rayong":"Province "+i%5,category:i<25?"Beach":"Nature",categories:[],
  publishedAt:i>=55?new Date(now-86400000).toISOString():"2020-01-01T00:00:00Z",
}));
describe("private discovery ranking",()=>{
  beforeEach(()=>localStorage.clear());
  it("does not record without opt-in and removes data on opt-out",()=>{
    recordInterest({category:"Beach"},4);
    expect(localStorage.getItem(PREFERENCE_KEY)).toBeNull();
    setPersonalization(true);
    recordInterest({category:"Beach"},4);
    expect(readPreferences().scores["category:Beach"]).toBeGreaterThan(3);
    setPersonalization(false);
    expect(localStorage.getItem(PREFERENCE_KEY)).toBeNull();
  });
  it("includes latest and interest results and traverses the entire catalogue without duplicates",()=>{
    const ranked=rankDiscovery([...data,data[0]],{enabled:true,scores:{"category:Beach":5},updatedAt:now},new Set(),now,()=>0.5);
    expect(ranked).toHaveLength(60);
    expect(new Set(ranked.map(p=>p.id)).size).toBe(60);
    expect(ranked.slice(0,20).filter(p=>isNewPlace(p,now))).toHaveLength(5);
    expect(ranked.slice(0,20).filter(p=>p.category==="Beach").length).toBeGreaterThanOrEqual(12);
  });
  it("deprioritizes the previous batch and handles small catalogues",()=>{
    const ranked=rankDiscovery(data.slice(0,25),{enabled:false,scores:{},updatedAt:now},new Set(data.slice(0,5).map(p=>p.id)),now,()=>0.5);
    expect(ranked.slice(0,20).every(p=>!["p0","p1","p2","p3","p4"].includes(p.id))).toBe(true);
    expect(ranked).toHaveLength(25);
  });
});
