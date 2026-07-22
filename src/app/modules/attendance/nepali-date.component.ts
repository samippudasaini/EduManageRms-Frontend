import { Component } from '@angular/core';

@Component({
  selector: 'app-nepali-date',
  standalone: true,
  imports: [],
  templateUrl: './nepali-date.component.html',
  styleUrl: './nepali-date.component.scss'
})
export class NepaliDateComponent {}

/**
 * Nepali (Bikram Sambat) Calendar Utility
 * Converts between English (AD) and Nepali (BS) dates.
 */

import NepaliDateLib, { dateConfigMap } from 'nepali-date-converter';

const BS_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Library month keys
const LIB_MONTH_KEYS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export interface NepaliDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  formatted: string;
}

function toNepaliDigits(n: number): string {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(n).split('').map(d => digits[parseInt(d, 10)] ?? d).join('');
}

/** AD date → Nepali date */
export function toNepali(adDate: Date): NepaliDate {
  try {
    const bs = NepaliDateLib.fromAD(adDate);
    const bsYear = bs.getYear();
    const bsMonth = bs.getMonth() + 1;
    const bsDay = bs.getDate();
    const monthName = BS_MONTHS[bsMonth - 1];

    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay,
      monthName,
      formatted: `${toNepaliDigits(bsYear)} ${monthName} ${toNepaliDigits(bsDay)}`
    };
  } catch {
    // Fallback
    return {
      year: 2080,
      month: 4,
      day: 1,
      monthName: 'Ashadh',
      formatted: '२०८० Ashadh १'
    };
  }
}

/** Get days in BS month - DYNAMIC (30, 31, or 32) */
export function getDaysInBSMonth(bsYear: number, bsMonth: number): number {
  try {
    const cfg = (dateConfigMap as any)[String(bsYear)];
    if (!cfg) return 30;
    const days = cfg[LIB_MONTH_KEYS[bsMonth - 1]];
    return days || 30;
  } catch {
    return 30;
  }
}

/** AD year/month → BS info (returns ONLY ONE month) */
export function adToNepaliMonth(adYear: number, adMonth: number) {
  // Use middle of month to get accurate BS month
  const midDate = new Date(adYear, adMonth - 1, 15);
  const bs = toNepali(midDate);
  
  return {
    bsYear: bs.year,
    bsMonth: bs.month,
    bsMonthName: bs.monthName,
    label: `${bs.monthName} ${bs.year} BS`
  };
}

/** ✅ NEW: BS to AD - ACCURATE conversion */
export function bsToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  try {
    // Use the library for accurate conversion
    const nd = new NepaliDateLib(bsYear, bsMonth - 1, bsDay);
    const ad = nd.getAD();
    return new Date(ad.year, ad.month, ad.date);
  } catch {
    // Fallback rough conversion
    const adYear = bsYear - 57;
    const adMonth = (bsMonth + 8) % 12 + 1;
    return new Date(adYear, adMonth - 1, bsDay);
  }
}

/** ✅ NEW: Get AD day number from BS date */
export function getADDayFromBS(bsYear: number, bsMonth: number, bsDay: number): number {
  try {
    const adDate = bsToAD(bsYear, bsMonth, bsDay);
    return adDate.getDate();
  } catch {
    return bsDay + 16; // Approximate fallback
  }
}

/** ✅ NEW: Get current BS date */
export function getCurrentBSDate(): NepaliDate {
  const now = new Date();
  return toNepali(now);
}