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
  { date: "05/04/2026", credit: 5 },
  { date: "12/04/2026", credit: 13.3 },
  { date: "19/04/2026", credit: 7.95 },
  { date: "26/04/2026", credit: 7.8 },
  { date: "03/05/2026", credit: 2.31 },
  { date: "10/05/2026", credit: 10.67 },
  { date: "17/05/2026", credit: 7.92 },
  { date: "24/05/2026", credit: 0.11 },
];