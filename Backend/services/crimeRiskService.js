// Model inputs are derived from outputs/ujjain_zone_crime_estimates.csv.
// They are planning estimates, not police-recorded crime counts by zone.
const ZONE_CRIME = [
  { zone_id: 1, zone_name: "Mahakaleshwar Mandir", weight: 100, estimated_total: 244, level: "HIGH" },
  { zone_id: 2, zone_name: "Ram Ghat", weight: 50, estimated_total: 122, level: "MEDIUM" },
  { zone_id: 3, zone_name: "Kshipra Bridge", weight: 40, estimated_total: 98, level: "LOW" },
  { zone_id: 4, zone_name: "Harsiddhi Mandir", weight: 80, estimated_total: 196, level: "HIGH" },
  { zone_id: 5, zone_name: "Bada Ganesh Mandir", weight: 30, estimated_total: 73, level: "LOW" },
  { zone_id: 6, zone_name: "Kal Bhairav Mandir", weight: 60, estimated_total: 147, level: "MEDIUM" },
];

// Top-level categories only: they sum to the supplied district total of 880.
const CRIME_CATEGORIES = [
  ["Cruelty by husband or relatives", 218],
  ["Kidnapping and abduction of women", 217],
  ["POCSO Act", 129],
  ["Rape", 87],
  ["Sexual harassment", 69],
  ["Assault to outrage modesty", 55],
  ["Stalking", 39],
  ["Dowry deaths", 13],
  ["Voyeurism", 11],
  ["Other reported categories", 42],
];

const allocateCategoryCounts = (allocationShare) => {
  const raw = CRIME_CATEGORIES.map(([, count]) => count * allocationShare);
  const allocated = raw.map(Math.floor);
  const target = Math.round(880 * allocationShare);
  const remainder = target - allocated.reduce((sum, count) => sum + count, 0);
  raw.map((value, index) => ({ index, remainder: value - allocated[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, remainder)
    .forEach(({ index }) => { allocated[index] += 1; });
  return CRIME_CATEGORIES.map(([category, district_count], index) => ({ category, district_count, estimated_zone_count: allocated[index] }));
};

export const getCrimeRiskZones = (zones = []) => {
  const liveCounts = new Map(zones.map((zone) => [Number(zone.zone_id), Number(zone.client_count || 0)]));
  const maxEstimated = Math.max(...ZONE_CRIME.map((zone) => zone.estimated_total));

  return ZONE_CRIME.map((base) => {
    const current_count = liveCounts.get(base.zone_id) || 0;
    // A transparent forecast signal: 70% historic estimate, 30% live occupancy proxy.
    const crowd_load = Math.min(current_count / base.weight, 1);
    const risk_score = Math.round((base.estimated_total / maxEstimated) * 70 + crowd_load * 30);
    const live_level = risk_score >= 65 ? "HIGH" : risk_score >= 35 ? "MEDIUM" : "LOW";
    return { ...base, current_count, crowd_load: Number(crowd_load.toFixed(2)), risk_score, live_level };
  });
};

export const getZoneCrimeReport = (zoneId, zones = []) => {
  const zone = getCrimeRiskZones(zones).find((item) => item.zone_id === Number(zoneId));
  if (!zone) return null;
  const allocationShare = zone.weight / 360;
  return {
    ...zone,
    is_estimate: true,
    source_geography: "Ujjain district",
    allocation_method: "project-capacity-weighted largest-remainder estimate",
    categories: allocateCategoryCounts(allocationShare),
  };
};
