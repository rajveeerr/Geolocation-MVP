/**
 * Shared formatting utilities — currency, numbers, phone, dates.
 * Replaces duplicated formatCurrency/formatNumber across multiple files.
 */

/** Format a number as USD currency: $1,234.50 */
export const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/** Format a number with commas: 1,234 */
export const formatNumber = (num: number): string =>
    new Intl.NumberFormat('en-US').format(num);

/** Format phone digits as (XXX) XXX-XXXX for display */
export const formatPhoneDisplay = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/** Strip a phone string to raw digits, capped at 10 */
export const stripPhoneToDigits = (value: string): string =>
    value.replace(/\D/g, '').slice(0, 10);

/** Convert 24h time string "14:00" to 12h display "2:00 PM" */
export const to12h = (time24: string): string => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

/** Convert 12h parts back to 24h string "14:00" */
export const to24h = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let h24 = hour;
    if (period === 'AM' && hour === 12) h24 = 0;
    else if (period === 'PM' && hour !== 12) h24 = hour + 12;
    return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};
