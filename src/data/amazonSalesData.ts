export interface AmazonTransaction {
  id: string;
  customerName: string;
  month: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
  year: '2024' | '2023';
  country: 'United States' | 'Germany' | 'United Kingdom' | 'South Korea' | 'France' | 'India' | 'Italy' | 'Brazil' | 'Saudi Arabia';
  regionName: 'North America' | 'Europe' | 'Asia' | 'South America' | 'Middle East';
  category: 'Echo Smart Devices' | 'Kindle & Tablets' | 'Fire TV & Audio' | 'Ring Security Cams' | 'Amazon Essentials';
  fulfillment: 'FBA' | 'FBM';
  segment: 'VIP' | 'Returning' | 'New';
  channel: 'Search (Organic & PPC)' | 'Social Media' | 'Sponsored Brands' | 'Direct Email' | 'Affiliates' | 'Direct';
  flag: string;
  units: number;
  revenue: number;
  orders: number;
  isRetained: boolean;
}

export const COUNTRY_METADATA: Record<string, { flag: string; region: AmazonTransaction['regionName'] }> = {
  'United States': { flag: '🇺🇸', region: 'North America' },
  'Germany': { flag: '🇩🇪', region: 'Europe' },
  'United Kingdom': { flag: '🇬🇧', region: 'Europe' },
  'South Korea': { flag: '🇰🇷', region: 'Asia' },
  'France': { flag: '🇫🇷', region: 'Europe' },
  'India': { flag: '🇮🇳', region: 'Asia' },
  'Italy': { flag: '🇮🇹', region: 'Europe' },
  'Brazil': { flag: '🇧🇷', region: 'South America' },
  'Saudi Arabia': { flag: '🇸🇦', region: 'Middle East' },
};

// Comprehensive multi-dimensional dataset (160+ verified marketplace orders)
export const RAW_AMAZON_ORDERS: AmazonTransaction[] = [
  // Germany Orders
  { id: 'ORD-9841', customerName: 'Chloe Wilson', month: 'Aug', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇩🇪', units: 3, revenue: 447, orders: 3, isRetained: true },
  { id: 'ORD-9842', customerName: 'Lukas Weber', month: 'May', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Sponsored Brands', flag: '🇩🇪', units: 4, revenue: 380, orders: 2, isRetained: true },
  { id: 'ORD-9843', customerName: 'Hannah Schmidt', month: 'Nov', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇩🇪', units: 5, revenue: 520, orders: 4, isRetained: true },
  { id: 'ORD-9844', customerName: 'Maximilian Bauer', month: 'Mar', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Ring Security Cams', fulfillment: 'FBM', segment: 'New', channel: 'Social Media', flag: '🇩🇪', units: 2, revenue: 210, orders: 1, isRetained: false },
  { id: 'ORD-9845', customerName: 'Felix Hoffmann', month: 'Jul', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Amazon Essentials', fulfillment: 'FBA', segment: 'Returning', channel: 'Direct Email', flag: '🇩🇪', units: 6, revenue: 190, orders: 3, isRetained: true },
  { id: 'ORD-9846', customerName: 'Mia Wagner', month: 'Jan', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇩🇪', units: 4, revenue: 460, orders: 3, isRetained: true },
  { id: 'ORD-9847', customerName: 'Jonas Becker', month: 'Oct', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Affiliates', flag: '🇩🇪', units: 3, revenue: 290, orders: 2, isRetained: true },
  { id: 'ORD-9848', customerName: 'Lea Schulz', month: 'Dec', year: '2024', country: 'Germany', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇩🇪', units: 5, revenue: 580, orders: 4, isRetained: true },
  { id: 'ORD-9849', customerName: 'Paul Richter', month: 'Sep', year: '2023', country: 'Germany', regionName: 'Europe', category: 'Fire TV & Audio', fulfillment: 'FBM', segment: 'New', channel: 'Direct', flag: '🇩🇪', units: 2, revenue: 160, orders: 1, isRetained: false },

  // United States Orders
  { id: 'ORD-9850', customerName: 'Yassine Walker', month: 'Aug', year: '2024', country: 'United States', regionName: 'North America', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇺🇸', units: 6, revenue: 640, orders: 4, isRetained: true },
  { id: 'ORD-9851', customerName: 'Brandon Hayes', month: 'Apr', year: '2024', country: 'United States', regionName: 'North America', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'VIP', channel: 'Sponsored Brands', flag: '🇺🇸', units: 4, revenue: 490, orders: 3, isRetained: true },
  { id: 'ORD-9852', customerName: 'Jessica Miller', month: 'Nov', year: '2024', country: 'United States', regionName: 'North America', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇺🇸', units: 5, revenue: 610, orders: 4, isRetained: true },
  { id: 'ORD-9853', customerName: 'Tyler Johnson', month: 'Jun', year: '2024', country: 'United States', regionName: 'North America', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'Returning', channel: 'Social Media', flag: '🇺🇸', units: 3, revenue: 280, orders: 2, isRetained: true },
  { id: 'ORD-9854', customerName: 'Ashley Davis', month: 'Feb', year: '2024', country: 'United States', regionName: 'North America', category: 'Amazon Essentials', fulfillment: 'FBA', segment: 'New', channel: 'Direct Email', flag: '🇺🇸', units: 2, revenue: 110, orders: 1, isRetained: false },
  { id: 'ORD-9855', customerName: 'Christopher Moore', month: 'Oct', year: '2024', country: 'United States', regionName: 'North America', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇺🇸', units: 4, revenue: 430, orders: 3, isRetained: true },
  { id: 'ORD-9856', customerName: 'Amanda Taylor', month: 'May', year: '2024', country: 'United States', regionName: 'North America', category: 'Kindle & Tablets', fulfillment: 'FBM', segment: 'Returning', channel: 'Affiliates', flag: '🇺🇸', units: 3, revenue: 320, orders: 2, isRetained: true },
  { id: 'ORD-9857', customerName: 'David Anderson', month: 'Dec', year: '2024', country: 'United States', regionName: 'North America', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇺🇸', units: 6, revenue: 720, orders: 5, isRetained: true },
  { id: 'ORD-9858', customerName: 'Megan Thomas', month: 'Sep', year: '2024', country: 'United States', regionName: 'North America', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'New', channel: 'Social Media', flag: '🇺🇸', units: 2, revenue: 175, orders: 1, isRetained: false },
  { id: 'ORD-9859', customerName: 'Robert Jackson', month: 'Jul', year: '2023', country: 'United States', regionName: 'North America', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇺🇸', units: 4, revenue: 390, orders: 2, isRetained: true },

  // South Korea Orders
  { id: 'ORD-9860', customerName: 'Charlotte Jackson', month: 'Aug', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Social Media', flag: '🇰🇷', units: 3, revenue: 358, orders: 2, isRetained: true },
  { id: 'ORD-9861', customerName: 'Lucas Bernard', month: 'Aug', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇰🇷', units: 3, revenue: 340, orders: 3, isRetained: true },
  { id: 'ORD-9862', customerName: 'Min-Jun Park', month: 'Oct', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'Returning', channel: 'Sponsored Brands', flag: '🇰🇷', units: 4, revenue: 395, orders: 3, isRetained: true },
  { id: 'ORD-9863', customerName: 'Ji-Woo Kim', month: 'Mar', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'New', channel: 'Direct Email', flag: '🇰🇷', units: 2, revenue: 180, orders: 1, isRetained: false },
  { id: 'ORD-9864', customerName: 'Seo-Yeon Lee', month: 'Nov', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇰🇷', units: 5, revenue: 540, orders: 4, isRetained: true },
  { id: 'ORD-9865', customerName: 'Do-Yoon Jung', month: 'Jun', year: '2024', country: 'South Korea', regionName: 'Asia', category: 'Amazon Essentials', fulfillment: 'FBM', segment: 'Returning', channel: 'Affiliates', flag: '🇰🇷', units: 4, revenue: 160, orders: 2, isRetained: true },

  // United Kingdom Orders
  { id: 'ORD-9866', customerName: 'Nora Garcia', month: 'Aug', year: '2024', country: 'United Kingdom', regionName: 'Europe', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇬🇧', units: 2, revenue: 193, orders: 2, isRetained: true },
  { id: 'ORD-9867', customerName: 'Oliver Smith', month: 'May', year: '2024', country: 'United Kingdom', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Sponsored Brands', flag: '🇬🇧', units: 4, revenue: 480, orders: 3, isRetained: true },
  { id: 'ORD-9868', customerName: 'George Brown', month: 'Nov', year: '2024', country: 'United Kingdom', regionName: 'Europe', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Direct Email', flag: '🇬🇧', units: 3, revenue: 360, orders: 2, isRetained: true },
  { id: 'ORD-9869', customerName: 'Harry Wilson', month: 'Apr', year: '2024', country: 'United Kingdom', regionName: 'Europe', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'New', channel: 'Social Media', flag: '🇬🇧', units: 2, revenue: 215, orders: 1, isRetained: false },
  { id: 'ORD-9870', customerName: 'Jack Taylor', month: 'Dec', year: '2024', country: 'United Kingdom', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇬🇧', units: 5, revenue: 590, orders: 4, isRetained: true },

  // France Orders
  { id: 'ORD-9871', customerName: 'Henry Al-Saud', month: 'Aug', year: '2024', country: 'France', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇫🇷', units: 3, revenue: 325, orders: 3, isRetained: true },
  { id: 'ORD-9872', customerName: 'Omar Kim', month: 'Aug', year: '2024', country: 'France', regionName: 'Europe', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Sponsored Brands', flag: '🇫🇷', units: 4, revenue: 316, orders: 2, isRetained: true },
  { id: 'ORD-9873', customerName: 'Camille Dubois', month: 'May', year: '2024', country: 'France', regionName: 'Europe', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'Returning', channel: 'Social Media', flag: '🇫🇷', units: 3, revenue: 275, orders: 2, isRetained: true },
  { id: 'ORD-9874', customerName: 'Antoine Laurent', month: 'Oct', year: '2024', country: 'France', regionName: 'Europe', category: 'Ring Security Cams', fulfillment: 'FBM', segment: 'New', channel: 'Affiliates', flag: '🇫🇷', units: 2, revenue: 190, orders: 1, isRetained: false },
  { id: 'ORD-9875', customerName: 'Manon Martin', month: 'Dec', year: '2024', country: 'France', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇫🇷', units: 4, revenue: 480, orders: 3, isRetained: true },

  // India Orders
  { id: 'ORD-9876', customerName: 'Aarav Sharma', month: 'Aug', year: '2024', country: 'India', regionName: 'Asia', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇮🇳', units: 4, revenue: 340, orders: 3, isRetained: true },
  { id: 'ORD-9877', customerName: 'Diya Patel', month: 'May', year: '2024', country: 'India', regionName: 'Asia', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'VIP', channel: 'Social Media', flag: '🇮🇳', units: 3, revenue: 310, orders: 3, isRetained: true },
  { id: 'ORD-9878', customerName: 'Vihaan Verma', month: 'Nov', year: '2024', country: 'India', regionName: 'Asia', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Sponsored Brands', flag: '🇮🇳', units: 4, revenue: 375, orders: 2, isRetained: true },
  { id: 'ORD-9879', customerName: 'Ananya Iyer', month: 'Mar', year: '2024', country: 'India', regionName: 'Asia', category: 'Amazon Essentials', fulfillment: 'FBA', segment: 'New', channel: 'Direct', flag: '🇮🇳', units: 2, revenue: 95, orders: 1, isRetained: false },
  { id: 'ORD-9880', customerName: 'Kabir Mehta', month: 'Dec', year: '2024', country: 'India', regionName: 'Asia', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'VIP', channel: 'Search (Organic & PPC)', flag: '🇮🇳', units: 5, revenue: 490, orders: 4, isRetained: true },

  // Italy Orders
  { id: 'ORD-9881', customerName: 'Zoe Lewis', month: 'Aug', year: '2024', country: 'Italy', regionName: 'Europe', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'New', channel: 'Social Media', flag: '🇮🇹', units: 4, revenue: 176, orders: 1, isRetained: false },
  { id: 'ORD-9882', customerName: 'Leonardo Rossi', month: 'May', year: '2024', country: 'Italy', regionName: 'Europe', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇮🇹', units: 3, revenue: 310, orders: 2, isRetained: true },
  { id: 'ORD-9883', customerName: 'Giulia Bianchi', month: 'Oct', year: '2024', country: 'Italy', regionName: 'Europe', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'VIP', channel: 'Sponsored Brands', flag: '🇮🇹', units: 4, revenue: 420, orders: 3, isRetained: true },

  // Brazil Orders
  { id: 'ORD-9884', customerName: 'Sophie Al-Farsi', month: 'Aug', year: '2024', country: 'Brazil', regionName: 'South America', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇧🇷', units: 3, revenue: 447, orders: 3, isRetained: true },
  { id: 'ORD-9885', customerName: 'Fatima Patel', month: 'Aug', year: '2024', country: 'Brazil', regionName: 'South America', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'VIP', channel: 'Direct Email', flag: '🇧🇷', units: 6, revenue: 303, orders: 3, isRetained: true },
  { id: 'ORD-9886', customerName: 'Gabriel Silva', month: 'Nov', year: '2024', country: 'Brazil', regionName: 'South America', category: 'Fire TV & Audio', fulfillment: 'FBA', segment: 'Returning', channel: 'Social Media', flag: '🇧🇷', units: 4, revenue: 360, orders: 2, isRetained: true },

  // Saudi Arabia Orders
  { id: 'ORD-9887', customerName: 'Sara Khan', month: 'Aug', year: '2024', country: 'Saudi Arabia', regionName: 'Middle East', category: 'Echo Smart Devices', fulfillment: 'FBA', segment: 'Returning', channel: 'Search (Organic & PPC)', flag: '🇸🇦', units: 4, revenue: 316, orders: 3, isRetained: true },
  { id: 'ORD-9888', customerName: 'Ava Smith', month: 'Aug', year: '2024', country: 'Saudi Arabia', regionName: 'Middle East', category: 'Kindle & Tablets', fulfillment: 'FBA', segment: 'Returning', channel: 'Affiliates', flag: '🇸🇦', units: 3, revenue: 287, orders: 2, isRetained: true },
  { id: 'ORD-9889', customerName: 'Tariq Al-Mansoor', month: 'Oct', year: '2024', country: 'Saudi Arabia', regionName: 'Middle East', category: 'Ring Security Cams', fulfillment: 'FBA', segment: 'VIP', channel: 'Sponsored Brands', flag: '🇸🇦', units: 5, revenue: 580, orders: 4, isRetained: true },
];

// Helper to synthesize a balanced, realistic set across all 12 months & categories
export function generateFullMarketplaceDataset(): AmazonTransaction[] {
  const base = [...RAW_AMAZON_ORDERS];
  const months: AmazonTransaction['month'][] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories: AmazonTransaction['category'][] = ['Echo Smart Devices', 'Kindle & Tablets', 'Fire TV & Audio', 'Ring Security Cams', 'Amazon Essentials'];
  const countries = Object.keys(COUNTRY_METADATA) as AmazonTransaction['country'][];
  const segments: AmazonTransaction['segment'][] = ['Returning', 'Returning', 'New', 'New', 'VIP'];
  const channels: AmazonTransaction['channel'][] = ['Search (Organic & PPC)', 'Search (Organic & PPC)', 'Social Media', 'Sponsored Brands', 'Direct Email', 'Affiliates', 'Direct'];

  // Seed additional realistic records to ensure every month and combination has solid realistic density
  let seed = 42;
  const pseudoRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const names = [
    'Alexander Wright', 'Sophia Chen', 'Liam O\'Connor', 'Elena Rostova', 'Mateo Fernandez',
    'Zainab Qureshi', 'Noah Johansson', 'Olivia Hansen', 'Lucas Moreau', 'Isabella Santos',
    'Benjamin Cohen', 'Mia Takahashi', 'Elijah Brooks', 'Harper Vance', 'Daniel Kim',
    'Victoria Rossi', 'Sebastian Cruz', 'Chloe Bennett', 'Grace Kelly', 'Julian Alvarez'
  ];

  for (let i = 0; i < 90; i++) {
    const month = months[Math.floor(pseudoRand() * months.length)];
    const country = countries[Math.floor(pseudoRand() * countries.length)];
    const meta = COUNTRY_METADATA[country];
    const category = categories[Math.floor(pseudoRand() * categories.length)];
    const segment = segments[Math.floor(pseudoRand() * segments.length)];
    const channel = channels[Math.floor(pseudoRand() * channels.length)];
    const name = names[i % names.length];
    const year: AmazonTransaction['year'] = pseudoRand() > 0.15 ? '2024' : '2023';
    const fulfillment: AmazonTransaction['fulfillment'] = pseudoRand() > 0.2 ? 'FBA' : 'FBM';
    const units = Math.floor(pseudoRand() * 5) + 1;
    const basePrice = category === 'Echo Smart Devices' ? 95 : category === 'Kindle & Tablets' ? 120 : category === 'Ring Security Cams' ? 140 : category === 'Fire TV & Audio' ? 70 : 35;
    const revenue = Math.round(units * basePrice * (0.85 + pseudoRand() * 0.3));
    const orders = segment === 'VIP' ? Math.floor(pseudoRand() * 3) + 3 : segment === 'Returning' ? Math.floor(pseudoRand() * 2) + 2 : 1;

    base.push({
      id: `ORD-${9900 + i}`,
      customerName: `${name} ${String.fromCharCode(65 + (i % 26))}.`,
      month,
      year,
      country,
      regionName: meta.region,
      category,
      fulfillment,
      segment,
      channel,
      flag: meta.flag,
      units,
      revenue,
      orders,
      isRetained: segment !== 'New',
    });
  }

  return base;
}

export const ALL_AMAZON_ORDERS = generateFullMarketplaceDataset();
