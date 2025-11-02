import { orchestrator } from "#/core/Orchestrator";
import { DATA_MACHINE_ID } from "#/machines/dataMachine";


const SEP_RE = /(?:\s*[-–—]\s*|[,;|\/\\])/;

export const splitSubcategory = (value: string | null | undefined): string[] => {
  if (!value) return [];
  return String(value)
    .split(SEP_RE)
    .map(p => p.trim())
    .filter(p => p.length > 0);
};

export const buildAvailableSubcats = (ratedCountsSnapshot: Record<string, { subcategory: string | null; count: number }[]> = {}) => {
  const s = new Set<string>();
  Object.values(ratedCountsSnapshot).forEach(arr => {
    arr.forEach(item => {
      splitSubcategory(item.subcategory).forEach(p => s.add(p));
    });
  });
  return Array.from(s).sort();
};

export const buildDoctorSubcatMap = (ratedCountsSnapshot: Record<string, { subcategory: string | null; count: number }[]> = {}) => {
  const map: Record<string, string[]> = {};
  Object.entries(ratedCountsSnapshot).forEach(([docId, arr]) => {
    const set = new Set<string>();
    arr.forEach(item => {
      splitSubcategory(item.subcategory).forEach(p => set.add(p));
    });
    map[docId] = Array.from(set);
  });
  return map;
};

export const buildFilteredDoctors = (
  doctorsBySpecialty: any[],
  doctorSubcatMap: Record<string, string[]>,
  minScore: number | null,
  selectedSubcats: string[]
) => {
  let list = Array.isArray(doctorsBySpecialty) ? [...doctorsBySpecialty] : [];
  if (minScore != null) {
    list = list.filter((d: any) => d.score != null && d.score >= minScore);
  }
  if (selectedSubcats && selectedSubcats.length > 0) {
    list = list.filter((d: any) => {
      const subs = doctorSubcatMap[d.id] || [];
      if (!subs.length) return false;
      return selectedSubcats.some(sel => subs.includes(sel));
    });
  }
  return list;
};


export const requestRatedCountsForDoctors = (doctors: any[] = []) => {
  const ids = (doctors || []).map(d => d.id).filter(Boolean);
  if (!ids.length) return;
  orchestrator.sendToMachine(DATA_MACHINE_ID as any, { type: 'LOAD_RATED_SUBCATEGORY_COUNTS', doctorIds: ids });
};

export default {
  splitSubcategory,
  buildAvailableSubcats,
  buildDoctorSubcatMap,
  buildFilteredDoctors,
  requestRatedCountsForDoctors,
};
