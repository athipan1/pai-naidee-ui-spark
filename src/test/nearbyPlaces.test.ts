import { describe, expect, it } from "vitest";
import { parsePlaceCoordinates } from "@/shared/utils/placeDetail";
import { nearbyMapPlaces } from "@/shared/utils/nearbyPlaces";
import type { SearchResult } from "@/shared/types/search";
const place = (id: string, distanceKm = 1, coordinates: unknown = { lat: 13, lng: 100 }) =>
  ({ id, distanceKm, coordinates, name: "Same name", image: "/placeholder-attraction.svg" }) as SearchResult;

describe("public Thailand coordinates", () => {
  it.each([null, undefined, {}, {lat:null,lng:100}, {lat:"",lng:100}, {lat:" ",lng:100},
    {lat:NaN,lng:100}, {lat:Infinity,lng:100}, {lat:0,lng:0}, {lat:100,lng:13},
    {lat:4,lng:100}, {lat:13,lng:107}, {lat:true,lng:100}, {lat:[13],lng:100}])("rejects invalid point %j", point => {
    expect(parsePlaceCoordinates(point)).toBeNull();
  });
  it("accepts numeric and string coordinates, including Thailand bounds", () => {
    expect(parsePlaceCoordinates({lat:"13.5",lng:"100.5"})).toEqual({lat:13.5,lng:100.5});
    expect(parsePlaceCoordinates({lat:5,lng:97})).toEqual({lat:5,lng:97});
    expect(parsePlaceCoordinates({lat:21,lng:106})).toEqual({lat:21,lng:106});
  });
});
describe("nearby public map results", () => {
  it("excludes canonical current ID, duplicate IDs, invalid coordinates and out-of-radius data", () => {
    const results = nearbyMapPlaces([place("main"),place("a",2),place("a",2),place("b",1),
      place("bad",0,{lat:0,lng:0}),place("far",6),place("nan",NaN),place("negative",-1)],"main",5);
    expect(results.map(p=>p.id)).toEqual(["b","a"]); // Equal names are separate entities.
  });
  it("limits hundreds of results to 30 and orders ties by ID", () => {
    const results = nearbyMapPlaces(Array.from({length:500},(_,i)=>place(`p${String(i).padStart(3,"0")}`,1)).reverse(),"main",5);
    expect(results).toHaveLength(30);
    expect(results[0].id).toBe("p000");
    expect(results[29].id).toBe("p029");
  });
  it.each([3,5,10,20])("retains radius boundary %i and preserves the published hero", radius => {
    const image="https://example.test/published.jpg";
    const results = nearbyMapPlaces([{...place("edge",radius),image},place("outside",radius+0.00001)],"main",radius);
    expect(results).toHaveLength(1); expect(results[0].image).toBe(image);
  });
});
