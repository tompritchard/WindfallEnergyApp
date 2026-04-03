export type FreeElectricityCredit = {
  date: string; // dd/mm/yyyy
  credit: number; // GBP
};

export const freeElectricityCredits: FreeElectricityCredit[] = [
  { date: "25/12/2025", credit: 8.05 },
  { date: "18/01/2026", credit: 5.54 },
  { date: "08/02/2026", credit: 0.09 },
  { date: "15/03/2026", credit: 0.07 },
  { date: "22/03/2026", credit: 9.57 },
  { date: "29/03/2026", credit: 9.99 },
];

export default freeElectricityCredits;