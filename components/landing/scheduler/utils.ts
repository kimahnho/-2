
export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const HOURS = [
    '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
];

export const DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LABELS: Record<DayKey, string> = {
    'Mon': '월', 'Tue': '화', 'Wed': '수', 'Thu': '목', 'Fri': '금', 'Sat': '토', 'Sun': '일'
};

export const addDays = (d: Date, days: number) => {
    const date = new Date(d);
    date.setDate(date.getDate() + days);
    return date;
};

export const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

export const formatIsoDate = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export const formatDateShort = (d: Date) => {
    return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateRange = (start: Date) => {
    const end = addDays(start, 6); // 월요일 ~ 일요일 (7일)
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDay = String(start.getDate()).padStart(2, '0');
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');

    // 같은 월이면 월 생략, 다른 월이면 표시
    if (start.getMonth() === end.getMonth()) {
        return `${start.getFullYear()}.${startMonth}.${startDay}(월) ~ ${endDay}(일)`;
    } else {
        return `${start.getFullYear()}.${startMonth}.${startDay}(월) ~ ${endMonth}.${endDay}(일)`;
    }
};
