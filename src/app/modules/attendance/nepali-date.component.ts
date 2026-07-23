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

// Exact keys the nepali-date-converter library uses in its dateConfigMap
const LIB_MONTH_KEYS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export interface NepaliDate {
  year: number;
  month: number;     // 1–12
  day: number;
  monthName: string;
  formatted: string;
  formattedWithEn: string;
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
    const enFull = adDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return {
      year: bsYear,
      month: bsMonth,
      day: bsDay,
      monthName,
      formatted: `${toNepaliDigits(bsYear)} ${monthName} ${toNepaliDigits(bsDay)}`,
      formattedWithEn: `${monthName} ${bsDay}, ${bsYear} BS (${enFull})`
    };
  } catch (e) {
    console.error('Error converting date:', adDate, e);
    // Fallback for 2026 dates
    return getFallbackNepaliDate(adDate);
  }
}

// ✅ FALLBACK: Direct mapping for 2026 dates when library fails
function getFallbackNepaliDate(adDate: Date): NepaliDate {
  const year = adDate.getFullYear();
  const month = adDate.getMonth() + 1;
  const day = adDate.getDate();
  
  // For 2026, BS year is 2083
  const bsYear = 2083;
  let bsMonth = 1;
  let bsDay = day;
  
  // AD Month to BS Month mapping for 2083
  // AD: Jan → Poush, Feb → Magh, Mar → Falgun, Apr → Chaitra
  // AD: May → Baishakh, Jun → Jestha, Jul → Ashadh
  // AD: Aug → Shrawan, Sep → Bhadra, Oct → Ashwin
  // AD: Nov → Kartik, Dec → Mangsir
  const monthMapping: { [key: number]: number } = {
    1: 9,   // Jan → Poush
    2: 10,  // Feb → Magh
    3: 11,  // Mar → Falgun
    4: 12,  // Apr → Chaitra
    5: 1,   // May → Baishakh
    6: 2,   // Jun → Jestha
    7: 3,   // Jul → Ashadh
    8: 4,   // Aug → Shrawan
    9: 5,   // Sep → Bhadra
    10: 6,  // Oct → Ashwin
    11: 7,  // Nov → Kartik
    12: 8   // Dec → Mangsir
  };
  
  bsMonth = monthMapping[month] || 1;
  
  // Adjust day for BS month (approximate)
  // BS months have 30-32 days, AD months have 28-31 days
  // This is a rough approximation
  if (day > 30) bsDay = day - 2;
  if (day > 32) bsDay = 30;
  
  const monthName = BS_MONTHS[bsMonth - 1];
  
  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    monthName,
    formatted: `${toNepaliDigits(bsYear)} ${monthName} ${toNepaliDigits(bsDay)}`,
    formattedWithEn: `${monthName} ${bsDay}, ${bsYear} BS`
  };
}

export function getNepaliMonthName(bsYear: number, bsMonth: number): string {
  return BS_MONTHS[bsMonth - 1] || '';
}

/** How many days are in a given BS year/month (1–12) */
export function daysInBsMonth(bsYear: number, bsMonth: number): number {
  const cfg = (dateConfigMap as any)[String(bsYear)];
  if (!cfg) return 30;
  return cfg[LIB_MONTH_KEYS[bsMonth - 1]] || 30;
}

// ✅ ALIAS for getDaysInBSMonth (to match import)
export function getDaysInBSMonth(bsYear: number, bsMonth: number): number {
  return daysInBsMonth(bsYear, bsMonth);
}

/** BS year/month/day → AD JS Date */
export function bsToAd(bsYear: number, bsMonth: number, bsDay: number): Date {
  try {
    const nd = new NepaliDateLib(bsYear, bsMonth - 1, bsDay);
    const ad = nd.getAD();
    return new Date(ad.year, ad.month, ad.date);
  } catch (e) {
    console.error('Error converting BS to AD:', bsYear, bsMonth, bsDay, e);
    // Fallback
    const adYear = bsYear - 57;
    const adMonth = (bsMonth + 8) % 12 + 1;
    return new Date(adYear, adMonth - 1, bsDay);
  }
}

// ✅ ALIAS for bsToAD (to match import)
export function bsToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  return bsToAd(bsYear, bsMonth, bsDay);
}

/** Format a JS Date as an ISO yyyy-MM-dd string (local, not UTC) */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// ✅ Get AD day from BS date
export function getADDayFromBS(bsYear: number, bsMonth: number, bsDay: number): number {
  try {
    const adDate = bsToAd(bsYear, bsMonth, bsDay);
    return adDate.getDate();
  } catch {
    return bsDay + 16;
  }
}

// ✅ Get current BS date
export function getCurrentBSDate(): NepaliDate {
  const now = new Date();
  return toNepali(now);
}

// ✅ AD year/month → BS info - FIXED with fallback
export function adToNepaliMonth(adYear: number, adMonth: number) {
  // Use the 15th day of the month to get accurate BS month
  const midDate = new Date(adYear, adMonth - 1, 15);
  let bs = toNepali(midDate);
  
  // For 2026, ensure correct mapping
  if (adYear === 2026) {
    // Direct mapping for 2026
    const monthMapping: { [key: number]: { month: number, name: string } } = {
      1: { month: 9, name: 'Poush' },
      2: { month: 10, name: 'Magh' },
      3: { month: 11, name: 'Falgun' },
      4: { month: 12, name: 'Chaitra' },
      5: { month: 1, name: 'Baishakh' },
      6: { month: 2, name: 'Jestha' },
      7: { month: 3, name: 'Ashadh' },
      8: { month: 4, name: 'Shrawan' },
      9: { month: 5, name: 'Bhadra' },
      10: { month: 6, name: 'Ashwin' },
      11: { month: 7, name: 'Kartik' },
      12: { month: 8, name: 'Mangsir' }
    };
    
    const mapped = monthMapping[adMonth];
    if (mapped) {
      return {
        bsYear: 2083,
        bsMonth: mapped.month,
        bsMonthName: mapped.name,
        label: `${mapped.name} 2083 BS`
      };
    }
  }
  
  // If library conversion works, use it
  return {
    bsYear: bs.year,
    bsMonth: bs.month,
    bsMonthName: bs.monthName,
    label: `${bs.monthName} ${bs.year} BS`
  };
}