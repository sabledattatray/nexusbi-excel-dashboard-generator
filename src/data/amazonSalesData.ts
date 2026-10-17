export interface MonthlyCustomerTrend {
  month: string;
  active: number;
  activeLY: number;
  revenue: number;
  orders: number;
}

export interface CustomerRecord {
  id: string;
  customerName: string;
  regionName: string;
  country: string;
  flag: string;
  units: number;
  revenue: number;
  segment: 'Returning' | 'New' | 'VIP';
}

export interface ChannelPerformance {
  channel: string;
  volume: number;
  pct: number;
}

export interface CategoryRevenue {
  name: string;
  revenue: number;
  pct: number;
}

export interface CountryVolume {
  country: string;
  flag: string;
  customers: number;
}

export interface ScatterPoint {
  id: number;
  orders: number;
  revenue: number;
  size: number;
}

export const MONTHLY_TREND_DATA: MonthlyCustomerTrend[] = [
  { month: 'Jan', active: 95, activeLY: 80, revenue: 16200, orders: 120 },
  { month: 'Feb', active: 110, activeLY: 88, revenue: 18700, orders: 142 },
  { month: 'Mar', active: 135, activeLY: 104, revenue: 23100, orders: 185 },
  { month: 'Apr', active: 128, activeLY: 112, revenue: 21900, orders: 170 },
  { month: 'May', active: 154, activeLY: 126, revenue: 26800, orders: 210 },
  { month: 'Jun', active: 142, activeLY: 120, revenue: 24500, orders: 195 },
  { month: 'Jul', active: 139, activeLY: 115, revenue: 23800, orders: 188 },
  { month: 'Aug', active: 125, activeLY: 105, revenue: 21325, orders: 165 },
  { month: 'Sep', active: 148, activeLY: 122, revenue: 25400, orders: 202 },
  { month: 'Oct', active: 162, activeLY: 130, revenue: 27900, orders: 228 },
  { month: 'Nov', active: 188, activeLY: 148, revenue: 32600, orders: 265 },
  { month: 'Dec', active: 205, activeLY: 162, revenue: 36200, orders: 290 },
];

export const CATEGORY_REVENUE_DATA: CategoryRevenue[] = [
  { name: 'Echo Smart Devices', revenue: 629, pct: 37.12 },
  { name: 'Kindle & Tablets', revenue: 417, pct: 24.62 },
  { name: 'Fire TV & Audio', revenue: 364, pct: 21.49 },
  { name: 'Ring Security Cams', revenue: 178, pct: 10.51 },
  { name: 'Amazon Essentials', revenue: 106, pct: 6.26 },
];

export const COUNTRY_VOLUME_DATA: CountryVolume[] = [
  { country: 'United States', flag: '🇺🇸', customers: 24 },
  { country: 'Germany', flag: '🇩🇪', customers: 18 },
  { country: 'United Kingdom', flag: '🇬🇧', customers: 16 },
  { country: 'South Korea', flag: '🇰🇷', customers: 15 },
  { country: 'France', flag: '🇫🇷', customers: 11 },
  { country: 'India', flag: '🇮🇳', customers: 10 },
  { country: 'Italy', flag: '🇮🇹', customers: 10 },
  { country: 'Saudi Arabia', flag: '🇸🇦', customers: 9 },
];

export const CHANNEL_DATA: ChannelPerformance[] = [
  { channel: 'Search (Organic & PPC)', volume: 40, pct: 32 },
  { channel: 'Social Media', volume: 28, pct: 23 },
  { channel: 'Sponsored Brands', volume: 21, pct: 17 },
  { channel: 'Direct Email', volume: 16, pct: 13 },
  { channel: 'Affiliates', volume: 14, pct: 11 },
  { channel: 'Direct', volume: 6, pct: 4 },
];

export const SCATTER_POINTS: ScatterPoint[] = [
  { id: 1, orders: 1.2, revenue: 140, size: 14 },
  { id: 2, orders: 1.4, revenue: 180, size: 16 },
  { id: 3, orders: 1.8, revenue: 210, size: 22 },
  { id: 4, orders: 2.1, revenue: 260, size: 28 },
  { id: 5, orders: 2.3, revenue: 190, size: 18 },
  { id: 6, orders: 2.5, revenue: 320, size: 34 },
  { id: 7, orders: 2.7, revenue: 280, size: 26 },
  { id: 8, orders: 2.9, revenue: 390, size: 38 },
  { id: 9, orders: 3.1, revenue: 340, size: 30 },
  { id: 10, orders: 3.2, revenue: 420, size: 40 },
  { id: 11, orders: 3.4, revenue: 460, size: 44 },
  { id: 12, orders: 3.6, revenue: 380, size: 32 },
  { id: 13, orders: 3.8, revenue: 510, size: 46 },
  { id: 14, orders: 4.1, revenue: 580, size: 48 },
  { id: 15, orders: 4.3, revenue: 470, size: 36 },
  { id: 16, orders: 4.5, revenue: 620, size: 52 },
  { id: 17, orders: 1.6, revenue: 290, size: 20 },
  { id: 18, orders: 2.2, revenue: 350, size: 25 },
  { id: 19, orders: 2.8, revenue: 440, size: 35 },
  { id: 20, orders: 3.5, revenue: 520, size: 42 },
];

export const CUSTOMER_RECORDS: CustomerRecord[] = [
  { id: 'ORD-9841', customerName: 'Chloe Wilson', regionName: 'Europe', country: 'Germany', flag: '🇩🇪', units: 3, revenue: 447, segment: 'Returning' },
  { id: 'ORD-9842', customerName: 'Sophie Al-Farsi', regionName: 'South America', country: 'Brazil', flag: '🇧🇷', units: 3, revenue: 447, segment: 'Returning' },
  { id: 'ORD-9843', customerName: 'Charlotte Jackson', regionName: 'Asia', country: 'South Korea', flag: '🇰🇷', units: 3, revenue: 358, segment: 'Returning' },
  { id: 'ORD-9844', customerName: 'Liam Patel', regionName: 'Africa', country: 'South Africa', flag: '🇿🇦', units: 6, revenue: 316, segment: 'Returning' },
  { id: 'ORD-9845', customerName: 'Fatima Patel', regionName: 'South America', country: 'Brazil', flag: '🇧🇷', units: 6, revenue: 303, segment: 'VIP' },
  { id: 'ORD-9846', customerName: 'Henry Al-Saud', regionName: 'Europe', country: 'France', flag: '🇫🇷', units: 3, revenue: 225, segment: 'VIP' },
  { id: 'ORD-9847', customerName: 'Daniel Garcia', regionName: 'Europe', country: 'Spain', flag: '🇪🇸', units: 3, revenue: 190, segment: 'Returning' },
  { id: 'ORD-9848', customerName: 'Zoe Lewis', regionName: 'Europe', country: 'Italy', flag: '🇮🇹', units: 4, revenue: 176, segment: 'New' },
  { id: 'ORD-9849', customerName: 'Lily Patel', regionName: 'South America', country: 'Mexico', flag: '🇲🇽', units: 2, revenue: 158, segment: 'New' },
  { id: 'ORD-9850', customerName: 'Emily Al-Farsi', regionName: 'Asia', country: 'Japan', flag: '🇯🇵', units: 2, revenue: 153, segment: 'VIP' },
  { id: 'ORD-9851', customerName: 'Lee Lopez', regionName: 'North America', country: 'Canada', flag: '🇨🇦', units: 4, revenue: 116, segment: 'Returning' },
  { id: 'ORD-9852', customerName: 'Omar Kim', regionName: 'Europe', country: 'France', flag: '🇫🇷', units: 4, revenue: 116, segment: 'Returning' },
  { id: 'ORD-9853', customerName: 'Sara Khan', regionName: 'Middle East', country: 'UAE', flag: '🇦🇪', units: 4, revenue: 116, segment: 'Returning' },
  { id: 'ORD-9854', customerName: 'Yassine Walker', regionName: 'North America', country: 'USA', flag: '🇺🇸', units: 6, revenue: 116, segment: 'Returning' },
  { id: 'ORD-9855', customerName: 'Nora Garcia', regionName: 'Europe', country: 'UK', flag: '🇬🇧', units: 2, revenue: 93, segment: 'Returning' },
  { id: 'ORD-9856', customerName: 'Ava Smith', regionName: 'Middle East', country: 'UAE', flag: '🇦🇪', units: 3, revenue: 87, segment: 'Returning' },
  { id: 'ORD-9857', customerName: 'Lucas Bernard', regionName: 'Asia', country: 'South Korea', flag: '🇰🇷', units: 3, revenue: 87, segment: 'VIP' },
];
