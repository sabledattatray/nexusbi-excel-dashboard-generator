import {
  Transaction,
  ProductCatalogItem,
  RegionalPerformance,
  CustomerAccount,
  MonthlyTrend,
  CategorySummary,
  IndustryType,
  DatasetConfig,
  AppDataset,
} from '../types/dataset';

// Preset industry definitions
export const INDUSTRY_PRESETS: Record<
  IndustryType,
  {
    name: string;
    description: string;
    companyDefault: string;
    products: { sku: string; name: string; category: string; cost: number; price: number }[];
    customers: { name: string; industry: string; tier: 'Enterprise Strategic' | 'Mid-Market' | 'Corporate' | 'SMB' }[];
  }
> = {
  enterprise_tech: {
    name: 'Enterprise Tech & Cloud SaaS',
    description: 'High-growth B2B enterprise software, cloud infrastructure, AI models, and cybersecurity solutions.',
    companyDefault: 'Nexdial.io Cloud Technologies Inc.',
    products: [
      { sku: 'ET-CLD-900', name: 'Cloud Enterprise Kubernetes Engine', category: 'Cloud Infrastructure', cost: 1450, price: 4200 },
      { sku: 'ET-SEC-450', name: 'Zero-Trust Identity & Gateway Shield', category: 'Cybersecurity', cost: 680, price: 2150 },
      { sku: 'ET-AI-820', name: 'Predictive LLM Vector Cluster', category: 'AI & Data Intelligence', cost: 2100, price: 5900 },
      { sku: 'ET-DAT-310', name: 'Lakehouse Realtime Analytics Engine', category: 'Data Platform', cost: 920, price: 2850 },
      { sku: 'ET-DEV-150', name: 'Continuous DevSecOps Pipeline Suite', category: 'Developer Tools', cost: 340, price: 1100 },
      { sku: 'ET-API-200', name: 'Microservices Mesh Orchestrator', category: 'Cloud Infrastructure', cost: 510, price: 1650 },
      { sku: 'ET-AUD-500', name: 'Compliance & Governance Radar', category: 'Cybersecurity', cost: 740, price: 2400 },
      { sku: 'ET-BI-400', name: 'Executive BI Automated Reporting Node', category: 'Data Platform', cost: 480, price: 1550 },
    ],
    customers: [
      { name: 'Apex Global Financial Corp', industry: 'Banking & Fintech', tier: 'Enterprise Strategic' },
      { name: 'Vanguard Biopharma Ltd', industry: 'Life Sciences', tier: 'Enterprise Strategic' },
      { name: 'OmniStream Media Networks', industry: 'Telecommunications', tier: 'Mid-Market' },
      { name: 'Stratosphere Aerospace', industry: 'Defense & Aviation', tier: 'Enterprise Strategic' },
      { name: 'Beacon Health Systems', industry: 'Healthcare', tier: 'Corporate' },
      { name: 'Horizon Renewable Energy', industry: 'Clean Energy & Utilities', tier: 'Corporate' },
      { name: 'Pinnacle Logistics International', industry: 'Supply Chain', tier: 'Mid-Market' },
      { name: 'Quantum Leap Interactive', industry: 'Gaming & Metaverse', tier: 'SMB' },
      { name: 'Terraform AgroTech', industry: 'Agriculture Tech', tier: 'Mid-Market' },
      { name: 'Aegis Cyber Defense Group', industry: 'Information Security', tier: 'Enterprise Strategic' },
      { name: 'Solis Automotive Group', industry: 'Automotive & EV', tier: 'Enterprise Strategic' },
      { name: 'Crestview Retail Omnichannel', industry: 'Retail & E-commerce', tier: 'Corporate' },
    ],
  },
  ecommerce_retail: {
    name: 'Global Omnichannel Retail',
    description: 'Multi-brand consumer retail, smart electronics, lifestyle apparel, and fulfillment logistics.',
    companyDefault: 'Meridian Global Retailers Inc.',
    products: [
      { sku: 'RET-AUD-101', name: 'AcousticPro ANC Wireless Headphones', category: 'Consumer Electronics', cost: 65, price: 199 },
      { sku: 'RET-WCH-202', name: 'Apex Chrono Smart Fitness Watch', category: 'Wearables & Health', cost: 85, price: 249 },
      { sku: 'RET-HOM-303', name: 'PureAir HEPA Smart Air Purifier', category: 'Home & Living', cost: 110, price: 320 },
      { sku: 'RET-LUG-404', name: 'AeroCarbon 28" Expandable Luggage', category: 'Travel & Gear', cost: 75, price: 235 },
      { sku: 'RET-APP-505', name: 'Merino Wool Thermal Performance Parka', category: 'Apparel & Outerwear', cost: 55, price: 185 },
      { sku: 'RET-CAM-606', name: '4K Ultra Stabilized Action Cam', category: 'Consumer Electronics', cost: 130, price: 380 },
      { sku: 'RET-KIT-707', name: 'Precision Espresso Induction Station', category: 'Home & Living', cost: 190, price: 540 },
    ],
    customers: [
      { name: 'Nordic Department Stores', industry: 'Luxury Retail', tier: 'Enterprise Strategic' },
      { name: 'Pacific Coast Distributors', industry: 'Wholesale & Distribution', tier: 'Enterprise Strategic' },
      { name: 'Urban Outfitters Collective', industry: 'Fashion Retail', tier: 'Corporate' },
      { name: 'Metro Express Hypermarkets', industry: 'Mass Merchant', tier: 'Enterprise Strategic' },
      { name: 'Cascade Outdoor Outlets', industry: 'Sporting Goods', tier: 'Mid-Market' },
      { name: 'Summit Lifestyle Boutiques', industry: 'Specialty Retail', tier: 'SMB' },
    ],
  },
  healthcare_pharma: {
    name: 'Healthcare & Medical Devices',
    description: 'Diagnostic equipment, clinical lab analyzers, patient monitoring nodes, and surgical robotics.',
    companyDefault: 'BioSynex Healthcare Technologies',
    products: [
      { sku: 'MED-DIA-01', name: 'Rapid Molecular PCR Diagnostic Suite', category: 'In-Vitro Diagnostics', cost: 3800, price: 11200 },
      { sku: 'MED-MON-02', name: 'ICU Continuous Hemodynamic Monitor', category: 'Patient Monitoring', cost: 2400, price: 7300 },
      { sku: 'MED-ULT-03', name: 'Portable Color Doppler Ultrasound Cart', category: 'Medical Imaging', cost: 6200, price: 18500 },
      { sku: 'MED-SUR-04', name: 'Minimally Invasive Endoscopic Trocar Kit', category: 'Surgical Instruments', cost: 420, price: 1350 },
      { sku: 'MED-INF-05', name: 'Precision Programmable Infusion Pump', category: 'Drug Delivery', cost: 790, price: 2450 },
    ],
    customers: [
      { name: 'Mayo Allied Hospital Network', industry: 'Academic Medical Center', tier: 'Enterprise Strategic' },
      { name: 'St. Jude Regional Healthcare', industry: 'Integrated Health System', tier: 'Enterprise Strategic' },
      { name: 'Genesis Clinical Laboratories', industry: 'Diagnostic Testing', tier: 'Corporate' },
      { name: 'Bavaria Cantonal Health Union', industry: 'Public Health Authority', tier: 'Enterprise Strategic' },
      { name: 'SingHealth Multi-Specialty Clinic', industry: 'Outpatient Care', tier: 'Mid-Market' },
    ],
  },
  industrial_manufacturing: {
    name: 'Industrial & Advanced Manufacturing',
    description: 'Heavy robotics, precision automation, smart sensors, and industrial CNC controllers.',
    companyDefault: 'Titan Industrial Systems AG',
    products: [
      { sku: 'IND-ROB-80', name: '6-Axis Articulated Assembly Robot', category: 'Industrial Robotics', cost: 9800, price: 27500 },
      { sku: 'IND-SEN-40', name: 'Vibration & Thermal IoT Telemetry Pod', category: 'Smart Sensors', cost: 320, price: 1100 },
      { sku: 'IND-CNC-10', name: '5-Axis Precision Milling CNC Station', category: 'Precision Machinery', cost: 18500, price: 49000 },
      { sku: 'IND-HYD-25', name: 'High-Pressure Hydraulic Servo Actuator', category: 'Hydraulics & Power', cost: 1400, price: 4100 },
      { sku: 'IND-SAF-15', name: 'Optoelectronic Laser Safety Scanner', category: 'Safety Systems', cost: 650, price: 2050 },
    ],
    customers: [
      { name: 'Krupp Heavy Engineering', industry: 'Heavy Equipment', tier: 'Enterprise Strategic' },
      { name: 'Daewoo Precision Motors', industry: 'Automotive Powertrain', tier: 'Enterprise Strategic' },
      { name: 'Atlas Aerospace Composites', industry: 'Aviation Structures', tier: 'Enterprise Strategic' },
      { name: 'Nordic Renewable Turbines', industry: 'Wind Energy', tier: 'Corporate' },
      { name: 'Brampton Metalworks Ltd', industry: 'Fabrication', tier: 'Mid-Market' },
    ],
  },
  finance_wealth: {
    name: 'Financial Solutions & Wealth FinTech',
    description: 'Algorithmic trading engines, private banking terminals, regulatory auditing suites, and wealth portals.',
    companyDefault: 'Aura Capital & FinTech Group',
    products: [
      { sku: 'FIN-TRD-01', name: 'Ultra-Low Latency Execution Terminal', category: 'Trading Systems', cost: 2200, price: 6800 },
      { sku: 'FIN-AML-02', name: 'Automated Anti-Money Laundering Engine', category: 'Risk & Compliance', cost: 1400, price: 4500 },
      { sku: 'FIN-WLTH-03', name: 'Private Client Wealth Portfolio Suite', category: 'Wealth Management', cost: 1100, price: 3400 },
      { sku: 'FIN-CRED-04', name: 'Machine Learning Credit Risk Evaluator', category: 'Risk & Compliance', cost: 1600, price: 5100 },
      { sku: 'FIN-API-05', name: 'Open Banking PSD2 Integration Hub', category: 'FinTech Infrastructure', cost: 750, price: 2350 },
    ],
    customers: [
      { name: 'Zurich Private Wealth Bank', industry: 'Private Banking', tier: 'Enterprise Strategic' },
      { name: 'London Capital Partners', industry: 'Hedge Fund & Equity', tier: 'Enterprise Strategic' },
      { name: 'SingaTrade Digital Securities', industry: 'Brokerage & Exchange', tier: 'Corporate' },
      { name: 'Manhattan Credit Union', industry: 'Retail Banking', tier: 'Mid-Market' },
      { name: 'Tokyo Sovereign Asset Management', industry: 'Sovereign Wealth', tier: 'Enterprise Strategic' },
    ],
  },
  real_estate: {
    name: 'Real Estate & Property Management',
    description: 'Commercial towers, multi-family residential portfolios, prime retail assets, and industrial logistics parks.',
    companyDefault: 'Vanguard Realty Capital Partners',
    products: [
      { sku: 'RE-COM-01', name: 'Class-A CBD Office Tower Lease', category: 'Commercial Office', cost: 12000, price: 34000 },
      { sku: 'RE-RES-02', name: 'Luxury Multi-Family Residential Suite', category: 'Residential High-Rise', cost: 2400, price: 6800 },
      { sku: 'RE-IND-03', name: 'Prime Last-Mile Logistics Center', category: 'Industrial Logistics', cost: 15000, price: 42000 },
      { sku: 'RE-RET-04', name: 'Anchor Retail Shopping Galleria', category: 'Retail Assets', cost: 8500, price: 23000 },
      { sku: 'RE-MIX-05', name: 'Urban Transit Mixed-Use Development', category: 'Mixed-Use Developments', cost: 19000, price: 54000 },
    ],
    customers: [
      { name: 'Blackstone Global Realty', industry: 'Private Equity Real Estate', tier: 'Enterprise Strategic' },
      { name: 'Brookfield Property Partners', industry: 'Asset Management', tier: 'Enterprise Strategic' },
      { name: 'Simon Property Group', industry: 'Retail REIT', tier: 'Corporate' },
      { name: 'Prologis Logistics Trust', industry: 'Industrial REIT', tier: 'Enterprise Strategic' },
      { name: 'Equitas Urban Housing', industry: 'Residential Trust', tier: 'Mid-Market' },
    ],
  },
  human_resources: {
    name: 'Human Resources & People Analytics',
    description: 'Workforce talent management, compensation modeling, departmental headcount, and retention tracking.',
    companyDefault: 'TalentPulse Global People Systems',
    products: [
      { sku: 'HR-ENG-01', name: 'Principal Cloud Systems Architect', category: 'Engineering & DevOps', cost: 14000, price: 26000 },
      { sku: 'HR-MGT-02', name: 'Executive Director Operations', category: 'Executive Leadership', cost: 18000, price: 32000 },
      { sku: 'HR-DAT-03', name: 'Lead Machine Learning Scientist', category: 'AI & Data Science', cost: 13500, price: 24500 },
      { sku: 'HR-SAL-04', name: 'Strategic Enterprise Sales Director', category: 'Go-to-Market', cost: 11000, price: 22000 },
      { sku: 'HR-OPS-05', name: 'Global People Operations Partner', category: 'People & Culture', cost: 7500, price: 14000 },
    ],
    customers: [
      { name: 'Alphabet Systems Group', industry: 'Technology', tier: 'Enterprise Strategic' },
      { name: 'McKinsey & Company Alliance', industry: 'Management Consulting', tier: 'Enterprise Strategic' },
      { name: 'Goldman Sachs Asset Mgmt', industry: 'Investment Banking', tier: 'Enterprise Strategic' },
      { name: 'Pfizer Global Health', industry: 'Pharmaceuticals', tier: 'Corporate' },
      { name: 'Tesla Mobility Energy', industry: 'Automotive & EV', tier: 'Corporate' },
    ],
  },
  hospitality_travel: {
    name: 'Hospitality, Travel & Dining Operations',
    description: 'Luxury hotel bookings, airline route yields, guest room occupancy, and culinary dining covers.',
    companyDefault: 'Sovereign Resorts & Luxury Hospitality',
    products: [
      { sku: 'HOS-SUI-01', name: 'Presidential Oceanfront Penthouse Suite', category: 'Luxury Suites', cost: 650, price: 2850 },
      { sku: 'HOS-ROO-02', name: 'Executive Club King Room', category: 'Guest Rooms', cost: 180, price: 680 },
      { sku: 'HOS-DIN-03', name: 'Michelin Star Chef Tasting Cover', category: 'Fine Dining & Banquet', cost: 95, price: 320 },
      { sku: 'HOS-SPA-04', name: 'Thermal Hydrotherapy Wellness Package', category: 'Wellness & Spa', cost: 80, price: 290 },
      { sku: 'HOS-EVT-05', name: 'Grand Ballroom Corporate Gala Hosting', category: 'Events & Conferences', cost: 3400, price: 12500 },
    ],
    customers: [
      { name: 'Four Seasons Global Collection', industry: 'Luxury Hotels', tier: 'Enterprise Strategic' },
      { name: 'Ritz-Carlton Heritage Group', industry: 'Hospitality', tier: 'Enterprise Strategic' },
      { name: 'Emirates Aviation Group', industry: 'Airlines & Travel', tier: 'Enterprise Strategic' },
      { name: 'Marriott Luxury Residences', industry: 'Hospitality', tier: 'Corporate' },
      { name: 'Belmond Orient Express', industry: 'Luxury Travel', tier: 'Mid-Market' },
    ],
  },
  energy_utilities: {
    name: 'Energy, Utilities & CleanTech',
    description: 'Renewable solar grids, offshore wind turbines, peak load transmission, and smart grid meters.',
    companyDefault: 'Helios CleanEnergy & Power Grid AG',
    products: [
      { sku: 'ENG-SOL-01', name: 'Utility-Scale Solar Photovoltaic Farm', category: 'Solar Energy', cost: 14000, price: 38000 },
      { sku: 'ENG-WND-02', name: 'Offshore Direct-Drive Wind Turbine', category: 'Wind Energy', cost: 22000, price: 58000 },
      { sku: 'ENG-BAT-03', name: 'Megawatt Grid Battery Storage Unit', category: 'Energy Storage', cost: 9500, price: 26000 },
      { sku: 'ENG-HYD-04', name: 'Green Hydrogen Electrolyzer Station', category: 'Clean Fuels', cost: 16000, price: 44000 },
      { sku: 'ENG-GRD-05', name: 'Smart Substation Telemetry Node', category: 'Grid Infrastructure', cost: 3200, price: 9800 },
    ],
    customers: [
      { name: 'NextEra Energy Resources', industry: 'Renewable Power', tier: 'Enterprise Strategic' },
      { name: 'Orsted Offshore Wind', industry: 'Clean Power', tier: 'Enterprise Strategic' },
      { name: 'Iberdrola Renewables', industry: 'Utilities', tier: 'Enterprise Strategic' },
      { name: 'National Grid UK & US', industry: 'Power Transmission', tier: 'Corporate' },
      { name: 'Enel Green Power', industry: 'Global Utilities', tier: 'Corporate' },
    ],
  },
  education_academic: {
    name: 'Higher Education & Academic Performance',
    description: 'University degree enrollments, tuition modeling, faculty research grants, and departmental budgets.',
    companyDefault: 'St. Andrews Collegiate University System',
    products: [
      { sku: 'EDU-DEG-01', name: 'Master of Science in Artificial Intelligence', category: 'Graduate Degrees', cost: 4200, price: 16500 },
      { sku: 'EDU-MBA-02', name: 'Executive Global MBA Fellowship', category: 'Executive Education', cost: 6800, price: 24000 },
      { sku: 'EDU-ENG-03', name: 'Bachelor of Science in Biomedical Engineering', category: 'Undergraduate Degrees', cost: 3400, price: 13200 },
      { sku: 'EDU-RES-04', name: 'Sponsored Clinical Genomics Research Grant', category: 'Research Programs', cost: 12000, price: 38000 },
      { sku: 'EDU-ONL-05', name: 'Digital Data Analytics Micro-Credential', category: 'Continuing Studies', cost: 450, price: 1950 },
    ],
    customers: [
      { name: 'Stanford Innovation Labs', industry: 'Research University', tier: 'Enterprise Strategic' },
      { name: 'Harvard Medical School Consortium', industry: 'Academic Medicine', tier: 'Enterprise Strategic' },
      { name: 'Oxford Cambridge Alliance', industry: 'Higher Education', tier: 'Enterprise Strategic' },
      { name: 'ETH Zurich Engineering', industry: 'Polytechnic Institute', tier: 'Corporate' },
      { name: 'National University of Singapore', industry: 'Global University', tier: 'Corporate' },
    ],
  },
  marketing_media: {
    name: 'Performance Marketing & Media ROI',
    description: 'Multi-channel ad spend, programmatic campaigns, conversion attribution, and brand lift analytics.',
    companyDefault: 'OmniMedia Performance Marketing Network',
    products: [
      { sku: 'MKT-SRC-01', name: 'High-Intent Paid Search Acquisition Suite', category: 'Search Advertising', cost: 3200, price: 9800 },
      { sku: 'MKT-SOC-02', name: 'Algorithmic Social Video Campaign', category: 'Paid Social & Influencer', cost: 4500, price: 14200 },
      { sku: 'MKT-PRG-03', name: 'Real-Time Programmatic Display Retargeting', category: 'Programmatic Media', cost: 2100, price: 6900 },
      { sku: 'MKT-SEO-04', name: 'Enterprise Organic Search Authority Engine', category: 'SEO & Content', cost: 1800, price: 5400 },
      { sku: 'MKT-OTT-05', name: 'Connected TV & Streaming Media Insertion', category: 'CTV & Video', cost: 6500, price: 19500 },
    ],
    customers: [
      { name: 'Nike Global Brand Communications', industry: 'Athletic Apparel', tier: 'Enterprise Strategic' },
      { name: 'LVMH Moët Hennessy Louis Vuitton', industry: 'Luxury Goods', tier: 'Enterprise Strategic' },
      { name: 'Procter & Gamble Consumer Care', industry: 'Consumer Packaged Goods', tier: 'Enterprise Strategic' },
      { name: 'Spotify Music & Podcasts', industry: 'Digital Streaming', tier: 'Corporate' },
      { name: 'Uber Technologies Mobility', industry: 'Rideshare & Delivery', tier: 'Corporate' },
    ],
  },
  general_business: {
    name: 'General Commercial & Operations',
    description: 'Comprehensive cross-industry enterprise model with automated schema mapping and flexible KPIs.',
    companyDefault: 'Apex Enterprise Operations Group',
    products: [
      { sku: 'GEN-OPS-01', name: 'Enterprise Operational Service Suite', category: 'Operations & Management', cost: 1200, price: 3800 },
      { sku: 'GEN-LOG-02', name: 'Supply Logistics Delivery Module', category: 'Logistics', cost: 850, price: 2600 },
      { sku: 'GEN-SVC-03', name: 'Professional Advisory Consultation', category: 'Professional Services', cost: 1600, price: 4900 },
      { sku: 'GEN-SYS-04', name: 'Infrastructure Maintenance Contract', category: 'Technical Support', cost: 700, price: 2200 },
      { sku: 'GEN-TRN-05', name: 'Workforce Capability Program', category: 'Corporate Training', cost: 550, price: 1750 },
    ],
    customers: [
      { name: 'Apex Commercial Partners', industry: 'Commercial Business', tier: 'Enterprise Strategic' },
      { name: 'Beacon Enterprise Holdings', industry: 'Conglomerate', tier: 'Enterprise Strategic' },
      { name: 'Crestview Corporate Ventures', industry: 'Business Services', tier: 'Corporate' },
      { name: 'Dynamic Global Solutions', industry: 'Operations', tier: 'Mid-Market' },
      { name: 'Equitas Corporate Network', industry: 'Services', tier: 'SMB' },
    ],
  },
  logistics_supply_chain: {
    name: 'Logistics, Freight & Supply Chain',
    description: 'Global freight forwarding, intermodal container shipping, warehouse distribution, and 3PL fleet operations.',
    companyDefault: 'Apex Intermodal Logistics Global Inc.',
    products: [
      { sku: 'LOG-INT-01', name: 'Cross-Dock Intermodal Freight Service', category: 'Intermodal Freight', cost: 1100, price: 3400 },
      { sku: 'LOG-CLD-02', name: 'Reefer Cold-Chain Temp Transport', category: 'Cold Chain', cost: 1600, price: 4800 },
      { sku: 'LOG-FUL-03', name: 'Automated Micro-Fulfillment Hub', category: 'Warehousing', cost: 2400, price: 7200 },
      { sku: 'LOG-CST-04', name: 'Customs Clearance & Trade Brokerage', category: 'Trade Compliance', cost: 450, price: 1450 },
      { sku: 'LOG-LST-05', name: 'Last-Mile Express Delivery Routing', category: 'Express Courier', cost: 320, price: 980 },
      { sku: 'LOG-FLT-06', name: 'Dedicated Long-Haul Fleet Contract', category: 'Fleet Transport', cost: 3800, price: 11500 },
    ],
    customers: [
      { name: 'Maersk Line Operations', industry: 'Ocean Shipping', tier: 'Enterprise Strategic' },
      { name: 'Amazon Logistics Hub', industry: 'E-Commerce', tier: 'Enterprise Strategic' },
      { name: 'Walmart Supply Chain', industry: 'Retail Logistics', tier: 'Enterprise Strategic' },
      { name: 'DHL Express Global', industry: 'Air Cargo', tier: 'Corporate' },
      { name: 'FedEx Supply Chain', industry: 'Freight Express', tier: 'Corporate' },
      { name: 'Target Regional Distribution', industry: 'Omnichannel Retail', tier: 'Mid-Market' },
    ],
  },
  automotive_ev: {
    name: 'Automotive & Electric Vehicles (EV)',
    description: 'Electric vehicle manufacturing, battery pack systems, powertrain telemetry, and Tier-1 automotive components.',
    companyDefault: 'Veloce Electric Motors & Mobility Inc.',
    products: [
      { sku: 'EV-PWR-01', name: 'Tri-Motor Performance Powertrain', category: 'EV Powertrain', cost: 3200, price: 9500 },
      { sku: 'EV-BAT-02', name: '95kWh High-Density LFP Battery Pack', category: 'Energy Storage', cost: 4100, price: 12400 },
      { sku: 'EV-SNS-03', name: 'Autonomous Drive LiDAR Sensor Cluster', category: 'Autonomous Systems', cost: 1850, price: 5600 },
      { sku: 'EV-CHG-04', name: '350kW DC Ultra-Fast Charging Unit', category: 'Charging Infrastructure', cost: 5200, price: 15800 },
      { sku: 'EV-CHS-05', name: 'Lightweight Carbon Chassis Subframe', category: 'Chassis & Body', cost: 2400, price: 7100 },
      { sku: 'EV-TCU-06', name: '5G Over-The-Air Telematics Controller', category: 'Connected Vehicle', cost: 680, price: 2150 },
    ],
    customers: [
      { name: 'Rivian Automotive Fleet', industry: 'EV Manufacturer', tier: 'Enterprise Strategic' },
      { name: 'Lucid Mobility Group', industry: 'Luxury EV', tier: 'Enterprise Strategic' },
      { name: 'Tesla Supercharger Network', industry: 'Clean Mobility', tier: 'Enterprise Strategic' },
      { name: 'Volvo Commercial Trucks', industry: 'Heavy Transportation', tier: 'Corporate' },
      { name: 'Ford Pro Commercial', industry: 'Automotive Fleet', tier: 'Corporate' },
      { name: 'Stellantis Global Powertrain', industry: 'OEM Automotive', tier: 'Mid-Market' },
    ],
  },
  pharmaceutical_biotech: {
    name: 'Pharmaceuticals & Biotechnology',
    description: 'Clinical stage drug discovery, monoclonal antibody therapeutics, mRNA vaccines, and bioprocess synthesis.',
    companyDefault: 'Aegis BioPharma Therapeutics Inc.',
    products: [
      { sku: 'BIO-MAB-01', name: 'Monoclonal Antibody Cell Line Suite', category: 'Therapeutics', cost: 4800, price: 14500 },
      { sku: 'BIO-MRN-02', name: 'mRNA Lipid Nanoparticle Platform', category: 'Vaccine Tech', cost: 6200, price: 18900 },
      { sku: 'BIO-HTS-03', name: 'High-Throughput Robotic Screening Assay', category: 'Discovery Platform', cost: 2900, price: 8800 },
      { sku: 'BIO-RCT-04', name: '500L Single-Use Bioreactor Skid', category: 'Bioprocessing', cost: 7500, price: 22800 },
      { sku: 'BIO-LYO-05', name: 'Lyophilized Recombinant Protein Reagents', category: 'Specialty Reagents', cost: 1200, price: 3750 },
      { sku: 'BIO-CHR-06', name: 'Affinity Chromatography Column Kit', category: 'Downstream Purification', cost: 1850, price: 5600 },
    ],
    customers: [
      { name: 'Pfizer Global R&D', industry: 'Pharma Manufacturing', tier: 'Enterprise Strategic' },
      { name: 'Novartis Research Institute', industry: 'Life Sciences', tier: 'Enterprise Strategic' },
      { name: 'Roche Molecular Diagnostics', industry: 'Biotechnology', tier: 'Enterprise Strategic' },
      { name: 'AstraZeneca BioSciences', industry: 'Oncology Therapeutics', tier: 'Corporate' },
      { name: 'Moderna Clinical Development', industry: 'mRNA Platform', tier: 'Corporate' },
      { name: 'Sanofi Pasteur Vaccines', industry: 'Immunology', tier: 'Mid-Market' },
    ],
  },
  construction_engineering: {
    name: 'Construction, EPC & Civil Infrastructure',
    description: 'Heavy civil engineering, commercial building EPC, structural steelworks, and smart infrastructure management.',
    companyDefault: 'Vanguard Civil & Infrastructure Corp.',
    products: [
      { sku: 'CST-STL-01', name: 'Pre-Stressed Structural Steel Truss', category: 'Structural Steel', cost: 3500, price: 10500 },
      { sku: 'CST-CON-02', name: 'High-Performance Ultra-Durable Concrete', category: 'Materials', cost: 1800, price: 5400 },
      { sku: 'CST-BIM-03', name: 'BIM 5D Digital Twin Architecture Model', category: 'Engineering Tech', cost: 2400, price: 7200 },
      { sku: 'CST-GEO-04', name: 'Deep Foundation Geotechnical Piles', category: 'Substructure', cost: 4200, price: 12800 },
      { sku: 'CST-HVC-05', name: 'Industrial Variable Refrigerant HVAC', category: 'Building Systems', cost: 5800, price: 17500 },
      { sku: 'CST-MOD-06', name: 'Prefabricated Modular Facade Enclosure', category: 'Envelope Systems', cost: 3100, price: 9400 },
    ],
    customers: [
      { name: 'Bechtel Global Projects', industry: 'Heavy Civil EPC', tier: 'Enterprise Strategic' },
      { name: 'Fluor Engineering Corp', industry: 'Industrial Construction', tier: 'Enterprise Strategic' },
      { name: 'Skanska Infrastructure Group', industry: 'Commercial Buildings', tier: 'Enterprise Strategic' },
      { name: 'Turner Construction Group', industry: 'General Contracting', tier: 'Corporate' },
      { name: 'Kiewit Heavy Civil', industry: 'Transportation Infrastructure', tier: 'Corporate' },
      { name: 'Balfour Beatty Construction', industry: 'Public Infrastructure', tier: 'Mid-Market' },
    ],
  },
  telecom_networks: {
    name: 'Telecommunications & 5G Fiber Networks',
    description: '5G cellular radio access networks, dark fiber backhaul, cloud edge towers, and satellite broadband data.',
    companyDefault: 'NexWave Global Telecommunications',
    products: [
      { sku: 'TEL-5G-01', name: '64T64R Massive MIMO 5G Antenna Node', category: 'Radio Access', cost: 4200, price: 12800 },
      { sku: 'TEL-FBR-02', name: 'Ultra-Dense 864-Strand Dark Fiber Cable', category: 'Fiber Backhaul', cost: 2100, price: 6400 },
      { sku: 'TEL-RAN-03', name: 'Open-RAN Virtualized Baseband Controller', category: 'Cloud RAN', cost: 3400, price: 10400 },
      { sku: 'TEL-SAT-04', name: 'LEO Satellite Uplink Gateway Transponder', category: 'Satellite Broadband', cost: 6800, price: 20500 },
      { sku: 'TEL-COR-05', name: 'Carrier-Grade 800Gbps Edge Router', category: 'Network Core', cost: 8900, price: 27000 },
      { sku: 'TEL-WDM-06', name: 'DWDM Optical Multiplexer Terminal', category: 'Optical Transport', cost: 3600, price: 11000 },
    ],
    customers: [
      { name: 'AT&T Business Networks', industry: 'Wireless Telecom', tier: 'Enterprise Strategic' },
      { name: 'Verizon Wireless Infrastructure', industry: 'Cellular Carrier', tier: 'Enterprise Strategic' },
      { name: 'Deutsche Telekom Global', industry: 'Broadband Provider', tier: 'Enterprise Strategic' },
      { name: 'Vodafone Enterprise Telecom', industry: 'Mobile Operator', tier: 'Corporate' },
      { name: 'T-Mobile 5G Expansion', industry: '5G Networks', tier: 'Corporate' },
      { name: 'NTT Communications Cloud', industry: 'Carrier Services', tier: 'Mid-Market' },
    ],
  },
  legal_compliance: {
    name: 'Legal Practices & Corporate Compliance',
    description: 'Corporate litigation, antitrust advisory, intellectual property licensing, and compliance management.',
    companyDefault: 'Sterling & Vance International Law LLP',
    products: [
      { sku: 'LAW-MNA-01', name: 'Cross-Border M&A Transaction Advisory', category: 'Corporate & M&A', cost: 2800, price: 8500 },
      { sku: 'LAW-IPR-02', name: 'Global Patent Prosecution & Licensing', category: 'Intellectual Property', cost: 1900, price: 5800 },
      { sku: 'LAW-REG-03', name: 'Enterprise Regulatory Compliance Audit', category: 'Compliance', cost: 2200, price: 6700 },
      { sku: 'LAW-LIT-04', name: 'Antitrust Commercial Litigation Retainer', category: 'Dispute Resolution', cost: 3600, price: 11000 },
      { sku: 'LAW-DSC-05', name: 'Digital eDiscovery & Forensic Review', category: 'Litigation Support', cost: 1400, price: 4300 },
      { sku: 'LAW-ESG-06', name: 'Corporate ESG Governance Framework', category: 'Advisory', cost: 1650, price: 5100 },
    ],
    customers: [
      { name: 'Alphabet Legal Operations', industry: 'Technology Conglomerate', tier: 'Enterprise Strategic' },
      { name: 'Microsoft Corporate Legal Affairs', industry: 'Software Systems', tier: 'Enterprise Strategic' },
      { name: 'JPMorgan Chase Compliance', industry: 'Investment Banking', tier: 'Enterprise Strategic' },
      { name: 'Apple Regulatory Counsel', industry: 'Consumer Electronics', tier: 'Corporate' },
      { name: 'Johnson & Johnson Legal Counsel', industry: 'Healthcare & Pharma', tier: 'Corporate' },
      { name: 'ExxonMobil General Counsel', industry: 'Energy & Petrochemicals', tier: 'Mid-Market' },
    ],
  },
  insurance_underwriting: {
    name: 'Insurance & Risk Underwriting',
    description: 'Commercial property & casualty, reinsurance pooling, cyber risk policies, and group health underwriting.',
    companyDefault: 'Apex Mutual Underwriting & Risk Corp.',
    products: [
      { sku: 'INS-PNC-01', name: 'Commercial Property & Casualty Comprehensive', category: 'P&C Underwriting', cost: 3100, price: 9500 },
      { sku: 'INS-CYB-02', name: 'Enterprise Cyber Breach Liability Policy', category: 'Cyber Risk', cost: 2400, price: 7400 },
      { sku: 'INS-DNO-03', name: 'Directors & Officers (D&O) Executive Shield', category: 'Executive Liability', cost: 2900, price: 8900 },
      { sku: 'INS-REI-04', name: 'Reinsurance Excess-of-Loss Treaty', category: 'Reinsurance', cost: 5200, price: 16000 },
      { sku: 'INS-MAR-05', name: 'Commercial Ocean Marine Cargo Policy', category: 'Marine Insurance', cost: 1800, price: 5500 },
      { sku: 'INS-GRP-06', name: 'Group Corporate Health Underwriting Pool', category: 'Health & Life', cost: 4100, price: 12500 },
    ],
    customers: [
      { name: 'Berkshire Hathaway Specialty', industry: 'Insurance Group', tier: 'Enterprise Strategic' },
      { name: 'Swiss Reinsurance America', industry: 'Global Reinsurer', tier: 'Enterprise Strategic' },
      { name: 'Chubb Global Risk Partners', industry: 'Commercial Lines', tier: 'Enterprise Strategic' },
      { name: 'AIG Commercial Underwriting', industry: 'Multi-Line Insurance', tier: 'Corporate' },
      { name: 'Travelers Companies Risk', industry: 'Casualty Insurance', tier: 'Corporate' },
      { name: 'Zurich North America Insurance', industry: 'Commercial Underwriter', tier: 'Mid-Market' },
    ],
  },
  agriculture_agritech: {
    name: 'Agriculture & Smart AgriTech',
    description: 'Precision crop science, automated drone spraying, soil microbiome fertilizers, and greenhouse automation.',
    companyDefault: 'Terraform AgriTech & BioHarvest Inc.',
    products: [
      { sku: 'AGR-DRN-01', name: 'Autonomous Precision Spraying Hexacopter', category: 'AgriRobotics', cost: 2600, price: 7900 },
      { sku: 'AGR-IOT-02', name: 'LoRaWAN Soil Nitrogen & Moisture Probe', category: 'Smart Sensing', cost: 480, price: 1550 },
      { sku: 'AGR-SED-03', name: 'High-Yield Drought-Resistant Hybrid Seed', category: 'Crop Genetics', cost: 1200, price: 3800 },
      { sku: 'AGR-BIO-04', name: 'Biological Soil Microbe Nutrient Booster', category: 'BioFertilizer', cost: 850, price: 2650 },
      { sku: 'AGR-GRN-05', name: 'Automated Climate Controlled Greenhouse', category: 'Smart Hydroponics', cost: 4900, price: 15200 },
      { sku: 'AGR-SAT-06', name: 'Multispectral Satellite Canopy Health Feed', category: 'Crop Intelligence', cost: 950, price: 2950 },
    ],
    customers: [
      { name: 'Archer-Daniels-Midland Agriservice', industry: 'Grain & Commodities', tier: 'Enterprise Strategic' },
      { name: 'Cargill Agricultural Supply', industry: 'Food Processing', tier: 'Enterprise Strategic' },
      { name: 'Bunge Agribusiness Operations', industry: 'Agri-Trading', tier: 'Enterprise Strategic' },
      { name: 'John Deere Precision Ag', industry: 'Agricultural Equipment', tier: 'Corporate' },
      { name: 'Syngenta Crop Protection', industry: 'Crop Science', tier: 'Corporate' },
      { name: 'Driscoll\'s Commercial Berry Farms', industry: 'Horticulture', tier: 'Mid-Market' },
    ],
  },
  food_beverage: {
    name: 'Food & Beverage Manufacturing (FMCG)',
    description: 'Commercial packaged goods, craft brewing, dairy processing, and automated packaging production lines.',
    companyDefault: 'Summit Peak Foods & Beverages Corp.',
    products: [
      { sku: 'FNB-ESP-01', name: 'Cold-Brew Nitro Espresso 24-Pack Case', category: 'Beverages', cost: 18, price: 58 },
      { sku: 'FNB-PRT-02', name: 'Plant-Based Organic Protein Shake Case', category: 'Health Drinks', cost: 22, price: 69 },
      { sku: 'FNB-CHD-03', name: 'Aged Artisanal Reserve Cheddar Wheel', category: 'Specialty Dairy', cost: 45, price: 140 },
      { sku: 'FNB-SEL-04', name: 'Zero-Sugar Vitamin Sparkling Seltzer', category: 'Beverages', cost: 14, price: 44 },
      { sku: 'FNB-GRN-05', name: 'Gluten-Free Spelt & Quinoa Ancient Grain', category: 'Dry Foods', cost: 28, price: 88 },
      { sku: 'FNB-BAR-06', name: 'Raw Honey Cacao Energy Bars 48ct', category: 'Snacks & Confectionery', cost: 32, price: 98 },
    ],
    customers: [
      { name: 'Kroger Co. Merchandising', industry: 'Supermarket Chain', tier: 'Enterprise Strategic' },
      { name: 'Costco Wholesale Procurement', industry: 'Club Wholesale', tier: 'Enterprise Strategic' },
      { name: 'Whole Foods Market Natural Foods', industry: 'Organic Grocery', tier: 'Enterprise Strategic' },
      { name: 'Sysco Foodservice Global', industry: 'Food Distribution', tier: 'Corporate' },
      { name: 'US Foods Broadline Distribution', industry: 'Hospitality Supply', tier: 'Corporate' },
      { name: 'Trader Joe\'s Specialty Buying', industry: 'Specialty Retail', tier: 'Mid-Market' },
    ],
  },
  aerospace_defense: {
    name: 'Aerospace, Defense & Aviation Systems',
    description: 'Avionics navigation, unmanned tactical UAVs, composite satellite structures, and commercial jet propulsion.',
    companyDefault: 'Stratosphere Defense & Aerospace Systems',
    products: [
      { sku: 'AER-UAV-01', name: 'Long-Endurance Tactical Surveillance UAV', category: 'Unmanned Systems', cost: 8500, price: 26000 },
      { sku: 'AER-AVN-02', name: 'Integrated Glass Cockpit Flight Display', category: 'Avionics', cost: 5400, price: 16500 },
      { sku: 'AER-BLD-03', name: 'Single-Crystal Superalloy Turbine Blades', category: 'Jet Propulsion', cost: 3800, price: 11800 },
      { sku: 'AER-SAT-04', name: 'Radiation-Hardened Geostationary Bus', category: 'Space Systems', cost: 9800, price: 30000 },
      { sku: 'AER-INS-05', name: 'Ring Laser Gyro Tactical Navigation IMU', category: 'Navigation & Guidance', cost: 2900, price: 8900 },
      { sku: 'AER-CMP-06', name: 'Carbon Fiber Wing Spar Structural Assembly', category: 'Airframe Structures', cost: 4600, price: 14200 },
    ],
    customers: [
      { name: 'Lockheed Martin Aeronautics', industry: 'Defense Contractor', tier: 'Enterprise Strategic' },
      { name: 'Boeing Commercial Airplanes', industry: 'Aviation OEM', tier: 'Enterprise Strategic' },
      { name: 'Northrop Grumman Space Systems', industry: 'Space Systems', tier: 'Enterprise Strategic' },
      { name: 'Raytheon Intelligence & Space', industry: 'Defense Technology', tier: 'Corporate' },
      { name: 'General Dynamics Land Systems', industry: 'Defense Hardware', tier: 'Corporate' },
      { name: 'Airbus Defense & Space', industry: 'Aerospace Group', tier: 'Mid-Market' },
    ],
  },
  cybersecurity_secops: {
    name: 'Cybersecurity & SecOps Intelligence',
    description: 'Endpoint detection & response (EDR), cloud SIEM, automated penetration testing, and zero-day threat intel.',
    companyDefault: 'Aegis Cyber Defense & SecOps Inc.',
    products: [
      { sku: 'CYB-XDR-01', name: 'Autonomous Extended Detection (XDR) Node', category: 'Endpoint Defense', cost: 1200, price: 3750 },
      { sku: 'CYB-CSP-02', name: 'Multi-Cloud Security Posture (CSPM) Grid', category: 'Cloud Security', cost: 1650, price: 5100 },
      { sku: 'CYB-RED-03', name: 'Continuous AI Red Team Penetration Tool', category: 'Threat Simulation', cost: 2100, price: 6400 },
      { sku: 'CYB-QNT-04', name: 'Post-Quantum Hardware Security Module', category: 'Cryptography', cost: 3800, price: 11500 },
      { sku: 'CYB-INT-05', name: 'Zero-Day Vulnerability Darknet Radar Feed', category: 'Threat Intel', cost: 1400, price: 4300 },
      { sku: 'CYB-SOAR-06', name: 'Automated Security Orchestration Playbook', category: 'SecOps Automation', cost: 1950, price: 5900 },
    ],
    customers: [
      { name: 'Capital One Cyber Division', industry: 'Financial Cyber', tier: 'Enterprise Strategic' },
      { name: 'Goldman Sachs Information Security', industry: 'Investment Banking', tier: 'Enterprise Strategic' },
      { name: 'Lockheed Martin CISO Office', industry: 'Defense Security', tier: 'Enterprise Strategic' },
      { name: 'UnitedHealth Group Cyber Defense', industry: 'Healthcare Security', tier: 'Corporate' },
      { name: 'Northrop Grumman InfoSec Group', industry: 'Aerospace Security', tier: 'Corporate' },
      { name: 'Cisco Systems Global Security', industry: 'Networking Tech', tier: 'Mid-Market' },
    ],
  },
  media_entertainment: {
    name: 'Media Streaming & Gaming Studios',
    description: 'Video-on-demand streaming platforms, real-time 3D game engines, virtual production, and audio distribution.',
    companyDefault: 'OmniStream Entertainment & Interactive Corp.',
    products: [
      { sku: 'MED-OTT-01', name: 'Ultra-HD Cloud OTT Video Streaming Node', category: 'Streaming Platform', cost: 1400, price: 4300 },
      { sku: 'MED-ENG-02', name: 'Photorealistic 3D Game Engine Studio', category: 'Game Engine', cost: 2200, price: 6800 },
      { sku: 'MED-AUD-03', name: 'Spatial Audio Dolby Atmos Mastering DAW', category: 'Audio Production', cost: 850, price: 2650 },
      { sku: 'MED-VPR-04', name: 'Virtual Production Curved LED Wall Stage', category: 'Virtual Studio', cost: 6500, price: 19800 },
      { sku: 'MED-SDK-05', name: 'In-Game Dynamic Programmatic Ad SDK', category: 'Ad Monetization', cost: 620, price: 1950 },
      { sku: 'MED-EDG-06', name: 'Multiplayer Real-Time Low-Latency Relay', category: 'Game Infrastructure', cost: 1750, price: 5400 },
    ],
    customers: [
      { name: 'Sony Interactive Entertainment', industry: 'Video Games', tier: 'Enterprise Strategic' },
      { name: 'Warner Bros. Discovery Streaming', industry: 'Entertainment Media', tier: 'Enterprise Strategic' },
      { name: 'Netflix Content Engineering', industry: 'Subscription Streaming', tier: 'Enterprise Strategic' },
      { name: 'Electronic Arts Game Studios', industry: 'Gaming Publisher', tier: 'Corporate' },
      { name: 'Paramount Global Media Networks', industry: 'Broadcast Media', tier: 'Corporate' },
      { name: 'Epic Games Unreal Ecosystem', industry: 'Interactive Software', tier: 'Mid-Market' },
    ],
  },
  nonprofit_charity: {
    name: 'Non-Profit, Foundations & Philanthropy',
    description: 'Donor endowment funds, humanitarian relief programs, educational grants, and public health campaigns.',
    companyDefault: 'Horizon Global Philanthropic Foundation',
    products: [
      { sku: 'NPO-WAT-01', name: 'Solar Water Purification Well Project', category: 'Clean Water', cost: 1800, price: 5500 },
      { sku: 'NPO-MED-02', name: 'Mobile Health Emergency Medical Clinic', category: 'Healthcare Relief', cost: 3200, price: 9800 },
      { sku: 'NPO-KIT-03', name: 'Disaster Shelter & Relief Survival Kit', category: 'Humanitarian Aid', cost: 450, price: 1400 },
      { sku: 'NPO-SCH-04', name: 'Digital STEM Girls Education Scholarship', category: 'Education Grants', cost: 1200, price: 3600 },
      { sku: 'NPO-FOR-05', name: 'Reforestation Biodiversity Acre Sanctuary', category: 'Conservation', cost: 750, price: 2300 },
      { sku: 'NPO-REF-06', name: 'Vocational Training Refugee Integration', category: 'Community Support', cost: 950, price: 2950 },
    ],
    customers: [
      { name: 'Bill & Melinda Gates Trust', industry: 'Philanthropic Trust', tier: 'Enterprise Strategic' },
      { name: 'Ford Foundation Grants Office', industry: 'Social Foundation', tier: 'Enterprise Strategic' },
      { name: 'Bloomberg Philanthropies Fund', industry: 'Global Charity', tier: 'Enterprise Strategic' },
      { name: 'Rockefeller Foundation Energy', industry: 'Public Health Fund', tier: 'Corporate' },
      { name: 'Wellcome Trust Biomedical', industry: 'Medical Research', tier: 'Corporate' },
      { name: 'MacArthur Foundation Fellowships', industry: 'Grantmaking Trust', tier: 'Mid-Market' },
    ],
  },
  fitness_wellness: {
    name: 'Fitness, Athletics & Wellness Studios',
    description: 'Smart gym equipment, boutique fitness chains, biometric performance wearables, and corporate wellness.',
    companyDefault: 'PulseFit Athletics & Wellness Centers Inc.',
    products: [
      { sku: 'FIT-BIK-01', name: 'Commercial Magnetic Resistance Spin Bike', category: 'Cardio Equipment', cost: 650, price: 1980 },
      { sku: 'FIT-RNG-02', name: 'Biometric HRV & Recovery Smart Ring', category: 'Wearables', cost: 110, price: 340 },
      { sku: 'FIT-COR-03', name: 'Corporate Multi-Gym All-Access Pass', category: 'Membership Passes', cost: 35, price: 110 },
      { sku: 'FIT-PRT-04', name: 'Hydrolyzed Whey Isolate Protein Tub', category: 'Nutrition Supplements', cost: 24, price: 75 },
      { sku: 'FIT-SAU-05', name: 'Full-Spectrum Infrared Recovery Sauna', category: 'Recovery & Spa', cost: 2800, price: 8600 },
      { sku: 'FIT-CBL-06', name: 'Dual-Stack Functional Cable Trainer', category: 'Strength Systems', cost: 1450, price: 4400 },
    ],
    customers: [
      { name: 'Equinox Luxury Fitness Clubs', industry: 'Premium Health Club', tier: 'Enterprise Strategic' },
      { name: 'Planet Fitness Franchises', industry: 'Commercial Gyms', tier: 'Enterprise Strategic' },
      { name: 'Lifetime Fitness Country Resorts', industry: 'Athletic Resorts', tier: 'Enterprise Strategic' },
      { name: 'CrossFit Global Affiliates', industry: 'Functional Fitness', tier: 'Corporate' },
      { name: 'F45 High-Intensity Studios', industry: 'Boutique Studios', tier: 'Corporate' },
      { name: 'OrangeTheory Fitness Centers', industry: 'Heart-Rate Fitness', tier: 'Mid-Market' },
    ],
  },
  professional_services: {
    name: 'Accounting, Audit & Advisory Services',
    description: 'Financial auditing, forensic tax advisory, digital transformation consulting, and valuation appraisals.',
    companyDefault: 'Deloitte & Sterling Advisory Partners LLP',
    products: [
      { sku: 'ADV-AUD-01', name: 'Statutory Annual Financial Audit Retainer', category: 'Assurance & Audit', cost: 3400, price: 10500 },
      { sku: 'ADV-TAX-02', name: 'Cross-Border Transfer Pricing Review', category: 'Tax Advisory', cost: 2100, price: 6500 },
      { sku: 'ADV-ERP-03', name: 'Cloud ERP Migration Architecture Lead', category: 'Digital Advisory', cost: 4200, price: 12800 },
      { sku: 'ADV-FRN-04', name: 'Forensic Accounting & Anti-Fraud Audit', category: 'Risk Advisory', cost: 2800, price: 8600 },
      { sku: 'ADV-VAL-05', name: 'Intangible Asset Fair Value Appraisal', category: 'Valuation Services', cost: 1650, price: 5100 },
      { sku: 'ADV-DUE-06', name: 'Buy-Side Operational Due Diligence', category: 'M&A Advisory', cost: 3900, price: 11900 },
    ],
    customers: [
      { name: 'General Electric Corporate Audit', industry: 'Industrial Conglomerate', tier: 'Enterprise Strategic' },
      { name: 'Berkshire Hathaway Financial Controls', industry: 'Holding Company', tier: 'Enterprise Strategic' },
      { name: 'Siemens AG Financial Operations', industry: 'Industrial Manufacturing', tier: 'Enterprise Strategic' },
      { name: 'Honeywell International Finance', industry: 'Aerospace & Buildings', tier: 'Corporate' },
      { name: '3M Global Financial Reporting', industry: 'Manufacturing Materials', tier: 'Corporate' },
      { name: 'Caterpillar Inc. Treasury Group', industry: 'Heavy Equipment', tier: 'Mid-Market' },
    ],
  },
  oil_gas_mining: {
    name: 'Energy Resources, Oil, Gas & Mining',
    description: 'Offshore drilling rigs, LNG liquefaction plants, lithium mineral mining, and subsea pipeline networks.',
    companyDefault: 'Continental PetroChemical & Mining Corp.',
    products: [
      { sku: 'OGM-SUB-01', name: 'Deepwater Subsea Xmas Tree Wellhead', category: 'Drilling Hardware', cost: 8200, price: 25000 },
      { sku: 'OGM-LNG-02', name: 'Cryogenic LNG Liquefaction Compressor', category: 'Gas Processing', cost: 6800, price: 21000 },
      { sku: 'OGM-LIT-03', name: 'Refined Battery-Grade Lithium Carbonate', category: 'Critical Minerals', cost: 3400, price: 10500 },
      { sku: 'OGM-EXC-04', name: 'Heavy Duty 40-Ton Hydraulic Bucket', category: 'Mining Equipment', cost: 4100, price: 12600 },
      { sku: 'OGM-VLV-05', name: 'High-Pressure Pipeline Subsea Choke Valve', category: 'Pipeline Transport', cost: 2300, price: 7100 },
      { sku: 'OGM-SEI-06', name: 'Ocean Bottom 3D Seismic Reservoir Scan', category: 'Exploration Geo', cost: 5500, price: 17000 },
    ],
    customers: [
      { name: 'Chevron Global Upstream', industry: 'Integrated Oil', tier: 'Enterprise Strategic' },
      { name: 'ExxonMobil Deepwater Production', industry: 'Petroleum Exploration', tier: 'Enterprise Strategic' },
      { name: 'Shell Integrated Gas Ventures', industry: 'Natural Gas & LNG', tier: 'Enterprise Strategic' },
      { name: 'Rio Tinto Critical Minerals', industry: 'Global Mining', tier: 'Corporate' },
      { name: 'BHP Billiton Metals Exploration', industry: 'Copper & Iron Ore', tier: 'Corporate' },
      { name: 'TotalEnergies Subsea R&D', industry: 'Energy Conglomerate', tier: 'Mid-Market' },
    ],
  },
  fashion_luxury: {
    name: 'Luxury Goods & High Fashion',
    description: 'Haute couture apparel, Swiss luxury horology, Italian handcrafted leatherware, and precious fine jewelry.',
    companyDefault: 'Maison Royale Haute Horlogerie & Fashion',
    products: [
      { sku: 'LUX-WCH-01', name: 'Grand Complication Tourbillon Watch', category: 'Fine Timepieces', cost: 4200, price: 18500 },
      { sku: 'LUX-BAG-02', name: 'Handcrafted Calfskin Leather Kelly Bag', category: 'Leather Goods', cost: 850, price: 4200 },
      { sku: 'LUX-COA-03', name: 'Double-Breasted Pure Cashmere Trench', category: 'Haute Couture', cost: 620, price: 2900 },
      { sku: 'LUX-BRC-04', name: '18K Rose Gold Brilliant Tennis Bracelet', category: 'Fine Jewelry', cost: 1800, price: 7500 },
      { sku: 'LUX-TUX-05', name: 'Bespoke Silk Jacquard Evening Tuxedo', category: 'Formalwear', cost: 480, price: 2350 },
      { sku: 'LUX-SHU-06', name: 'Hand-Welted Tuscan Calfskin Loafers', category: 'Footwear', cost: 240, price: 1150 },
    ],
    customers: [
      { name: 'Harrods Knightsbridge London', industry: 'Luxury Department Store', tier: 'Enterprise Strategic' },
      { name: 'Saks Fifth Avenue New York', industry: 'High-End Retail', tier: 'Enterprise Strategic' },
      { name: 'Galeries Lafayette Haussmann Paris', industry: 'European Luxury', tier: 'Enterprise Strategic' },
      { name: 'Lane Crawford Hong Kong', industry: 'Asia Luxury Retail', tier: 'Corporate' },
      { name: 'Bergdorf Goodman Manhattan', industry: 'Specialty Luxury', tier: 'Corporate' },
      { name: 'Dubai Mall Luxury Fashion Pavilion', industry: 'Middle East Luxury', tier: 'Mid-Market' },
    ],
  },
  biomedical_genomics: {
    name: 'Genomics & Bioinformatics Clinical Labs',
    description: 'Next-generation DNA sequencing (NGS), liquid biopsy cancer detection, spatial transcriptomics, and genetic testing.',
    companyDefault: 'OmniGenix Genomics & Precision Health',
    products: [
      { sku: 'GEN-WGS-01', name: 'Whole Genome 30x Deep Sequencing Flowcell', category: 'NGS Sequencing', cost: 750, price: 2400 },
      { sku: 'GEN-LBX-02', name: 'Circulating Tumor DNA Liquid Biopsy Assay', category: 'Cancer Diagnostics', cost: 1200, price: 3800 },
      { sku: 'GEN-SPT-03', name: 'Subcellular Spatial Transcriptomics Slide', category: 'Spatial Omics', cost: 1850, price: 5800 },
      { sku: 'GEN-SCR-04', name: 'Single-Cell Chromium RNA Barcoding Kit', category: 'Single Cell Prep', cost: 1400, price: 4400 },
      { sku: 'GEN-HPC-05', name: 'Hereditary Polygenic Risk Panel 150-Gene', category: 'Genetic Screening', cost: 420, price: 1350 },
      { sku: 'GEN-CRISPR-06', name: 'Guide-RNA CRISPR Target Knockout Array', category: 'Gene Editing Tools', cost: 890, price: 2800 },
    ],
    customers: [
      { name: 'Memorial Sloan Kettering Cancer Center', industry: 'Oncology Institute', tier: 'Enterprise Strategic' },
      { name: 'Dana-Farber Precision Medicine', industry: 'Cancer Research', tier: 'Enterprise Strategic' },
      { name: 'Mayo Clinic Center for Individualized Medicine', industry: 'Clinical Genomics', tier: 'Enterprise Strategic' },
      { name: 'Johns Hopkins Genetic Medicine', industry: 'Academic Medical', tier: 'Corporate' },
      { name: 'MD Anderson Molecular Diagnostics', industry: 'Precision Oncology', tier: 'Corporate' },
      { name: 'Broad Institute MIT-Harvard', industry: 'Genomic Research', tier: 'Mid-Market' },
    ],
  },
  saas_product_ops: {
    name: 'SaaS Product Operations & Growth',
    description: 'Product-led growth (PLG), customer feature adoption, in-app micro-surveys, and usage-based billing telemetry.',
    companyDefault: 'AppPulse Product Analytics & Growth Inc.',
    products: [
      { sku: 'OPS-FLG-01', name: 'Zero-Latency Dynamic Feature Flag Mesh', category: 'Feature Management', cost: 650, price: 2100 },
      { sku: 'OPS-GUI-02', name: 'Interactive No-Code User Onboarding Tour', category: 'User Activation', cost: 450, price: 1450 },
      { sku: 'OPS-REC-03', name: 'High-Definition Encrypted Session Replay', category: 'Product Analytics', cost: 950, price: 2950 },
      { sku: 'OPS-BIL-04', name: 'Metered Consumption Usage Billing Engine', category: 'FinOps & Billing', cost: 1250, price: 3900 },
      { sku: 'OPS-NPS-05', name: 'In-App Contextual CSAT & Micro-Survey', category: 'Voice of Customer', cost: 380, price: 1200 },
      { sku: 'OPS-AI-06', name: 'Churn Prediction & Account Health Radar', category: 'Retention Intelligence', cost: 1600, price: 4950 },
    ],
    customers: [
      { name: 'Canva Design Systems', industry: 'Creative Platform', tier: 'Enterprise Strategic' },
      { name: 'Notion Labs Productivity', industry: 'Collaborative Workspace', tier: 'Enterprise Strategic' },
      { name: 'Figma Product Design', industry: 'Interface Design', tier: 'Enterprise Strategic' },
      { name: 'Miro Visual Collaboration', industry: 'Virtual Whiteboarding', tier: 'Corporate' },
      { name: 'Airtable Enterprise Database', industry: 'Low-Code Database', tier: 'Corporate' },
      { name: 'Slack Technologies Salesforce', industry: 'Team Messaging', tier: 'Mid-Market' },
    ],
  },
  customer_support_ops: {
    name: 'Customer Support & Contact Center CX',
    description: 'Omnichannel cloud contact centers, AI voicebots, workforce engagement management, and sentiment analytics.',
    companyDefault: 'OmniCare Contact Centers & CX Technologies',
    products: [
      { sku: 'CS-BOT-01', name: 'Conversational Generative AI Voicebot', category: 'AI Virtual Agents', cost: 950, price: 2950 },
      { sku: 'CS-ACD-02', name: 'Cloud Omnichannel Skills-Based Routing', category: 'Contact Routing', cost: 1350, price: 4200 },
      { sku: 'CS-WSP-03', name: 'Real-Time Live Agent Whisper Co-Pilot', category: 'Agent Assist', cost: 800, price: 2500 },
      { sku: 'CS-WFM-04', name: 'AI Predictive Workforce Staffing Planner', category: 'Workforce Optimization', cost: 1100, price: 3400 },
      { sku: 'CS-STT-05', name: 'Multi-Language Call Audio Sentiment AI', category: 'Quality Assurance', cost: 620, price: 1950 },
      { sku: 'CS-DFL-06', name: 'Dynamic Self-Service Deflection Portal', category: 'Knowledge Base', cost: 480, price: 1550 },
    ],
    customers: [
      { name: 'Delta Air Lines Reservations Support', industry: 'Commercial Airlines', tier: 'Enterprise Strategic' },
      { name: 'American Express Global Servicing', industry: 'Card Services', tier: 'Enterprise Strategic' },
      { name: 'Airbnb Global Guest Community Help', industry: 'Travel Hospitality', tier: 'Enterprise Strategic' },
      { name: 'T-Mobile Customer Experience Care', industry: 'Telecommunications', tier: 'Corporate' },
      { name: 'AppleCare Technical Support Global', industry: 'Hardware Support', tier: 'Corporate' },
      { name: 'Shopify Merchant Support Network', industry: 'E-Commerce Platform', tier: 'Mid-Market' },
    ],
  },
};

const REGIONAL_GEOGRAPHY: Record<
  'North America' | 'EMEA' | 'APAC' | 'LATAM',
  { countries: { name: string; cities: string[] }[]; director: string }
> = {
  'North America': {
    director: 'Victoria Sterling',
    countries: [
      { name: 'United States', cities: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA'] },
      { name: 'Canada', cities: ['Toronto, ON', 'Vancouver, BC', 'Montreal, QC', 'Calgary, AB'] },
    ],
  },
  'EMEA': {
    director: 'Alexander Von Berg',
    countries: [
      { name: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh'] },
      { name: 'Germany', cities: ['Frankfurt', 'Munich', 'Berlin', 'Stuttgart'] },
      { name: 'France', cities: ['Paris', 'Lyon', 'Toulouse'] },
      { name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam'] },
      { name: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi'] },
      { name: 'Switzerland', cities: ['Zurich', 'Geneva'] },
    ],
  },
  'APAC': {
    director: 'Kenji Takahashi',
    countries: [
      { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Nagoya'] },
      { name: 'Singapore', cities: ['Singapore CBD', 'Jurong East'] },
      { name: 'Australia', cities: ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD'] },
      { name: 'India', cities: ['Bengaluru', 'Mumbai', 'Hyderabad'] },
      { name: 'South Korea', cities: ['Seoul', 'Incheon'] },
    ],
  },
  'LATAM': {
    director: 'Mariana Silva Cortez',
    countries: [
      { name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Curitiba'] },
      { name: 'Mexico', cities: ['Mexico City', 'Monterrey', 'Guadalajara'] },
      { name: 'Chile', cities: ['Santiago', 'Valparaíso'] },
      { name: 'Colombia', cities: ['Bogotá', 'Medellín'] },
    ],
  },
};

export const INDUSTRY_FILTER_PRESETS: Record<IndustryType, { regions: string[]; channels: string[] }> = {
  enterprise_tech: {
    regions: ['US-East (N. Virginia)', 'EU-West (Frankfurt)', 'AP-Southeast (Singapore)', 'US-West (Oregon)', 'ME-Central (Dubai)'],
    channels: ['Enterprise Direct', 'Cloud Marketplace', 'Global System Integrators', 'Strategic OEM', 'Digital Self-Serve'],
  },
  ecommerce_retail: {
    regions: ['North America Hub', 'Western Europe Hub', 'East Asia Hub', 'Latin America Hub', 'Nordic Fulfillment Center'],
    channels: ['Flagship E-Commerce', 'Omnichannel Retail', 'Marketplace Direct', 'B2B Wholesale', 'Social Commerce'],
  },
  healthcare_pharma: {
    regions: ['Mayo Allied Network', 'St. Jude Regional System', 'Genesis Clinical Centers', 'Bavaria Cantonal Health', 'SingHealth Specialty'],
    channels: ['Direct Hospital Systems', 'GPO Procurement', 'Specialty Distributors', 'Clinical Research Network', 'Emergency Reserve'],
  },
  industrial_manufacturing: {
    regions: ['Stuttgart Smart Plant', 'Detroit Advanced Facility', 'Yokohama Robotics Hub', 'Monterrey Assembly Plant', 'Munich Automation Center'],
    channels: ['Tier-1 OEM Direct', 'Industrial Distribution', 'Contract Manufacturing', 'Engineering Procurement', 'Global Systems Partner'],
  },
  finance_wealth: {
    regions: ['Wall Street / New York', 'City of London / EMEA', 'Tokyo & Singapore Hub', 'Zurich Private Banking', 'Hong Kong Capital Center'],
    channels: ['Institutional Desk', 'Private Wealth Advisory', 'Sovereign Wealth Funds', 'Family Office Direct', 'Digital Brokerage'],
  },
  real_estate: {
    regions: ['New York Metro', 'London Greater Area', 'Tokyo Metropolis', 'San Francisco Bay Area', 'Paris Capital Region'],
    channels: ['Commercial Direct', 'Corporate Brokerage', 'Institutional REIT', 'Private Placement', 'Direct Tenant Management'],
  },
  human_resources: {
    regions: ['San Francisco HQ', 'London Global Hub', 'Singapore APAC Center', 'New York Office', 'Berlin Innovation Hub'],
    channels: ['Executive Search', 'Internal Mobility', 'Direct Campus', 'Strategic Placement', 'Contractor Placement'],
  },
  hospitality_travel: {
    regions: ['Maui Beachfront Resort', 'St. Moritz Alpine Lodge', 'Kyoto Heritage Pavilion', 'Amalfi Coast Villas', 'Bora Bora Lagoon Retreat'],
    channels: ['Direct Web Booking', 'Luxury Travel Consortia', 'Corporate Negotiated Rate', 'OTA Premium Network', 'VIP Concierge Direct'],
  },
  energy_utilities: {
    regions: ['North Sea Wind Basin', 'Mojave Solar Field', 'Atacama Generation Hub', 'Hornsea Offshore Array', 'Texas Energy Corridor'],
    channels: ['Industrial Power Grid', 'Municipal Wholesale', 'Commercial PPA', 'Retail Energy Utility', 'Renewable Offtake'],
  },
  education_academic: {
    regions: ['North Campus Complex', 'Medical Sciences Center', 'Engineering Innovation Quad', 'Downtown Graduate Center', 'Online Global Campus'],
    channels: ['Direct Admissions', 'International Scholar Desk', 'Corporate Executive Education', 'State Fellowship Program', 'Alumni Continuing Studies'],
  },
  marketing_media: {
    regions: ['North America Tier-1', 'Western European Metros', 'Asia-Pacific Growth Markets', 'Latin America Urban Hubs', 'Nordic Digital Consumers'],
    channels: ['Programmatic Display', 'Paid Social Video', 'Search & Intent Engine', 'Connected TV (CTV)', 'Influencer & Affiliate'],
  },
  general_business: {
    regions: ['North America Operations', 'European Business Unit', 'Asia-Pacific Division', 'Latin America Hub', 'Middle East & Africa'],
    channels: ['Direct Enterprise', 'Strategic Partner Network', 'Corporate Accounts', 'Inside Sales', 'Digital Commerce'],
  },
  logistics_supply_chain: {
    regions: ['Chicago Inland Hub', 'Rotterdam Gateway', 'Singapore Transshipment', 'Dubai Logistics City', 'Long Beach Terminal'],
    channels: ['Intermodal Rail', 'Ocean Container Freight', 'Air Freight Priority', 'Cross-Border Truckload', 'Dedicated Courier'],
  },
  automotive_ev: {
    regions: ['Austin Gigafactory', 'Berlin-Brandenburg Gigafactory', 'Shanghai Mega-Plant', 'Fremont Complex', 'Monterrey Gigafactory'],
    channels: ['Direct Fleet Sales', 'Commercial Enterprise', 'Direct-to-Consumer', 'Mobility Operators', 'Government EV Fleet'],
  },
  pharmaceutical_biotech: {
    regions: ['Cambridge Bio-Cluster', 'Basel Discovery Labs', 'South San Francisco R&D', 'Oxford Genomics Campus', 'Singapore Biopolis'],
    channels: ['Global Clinical Trials', 'Biopharma Co-Development', 'Specialty Therapeutics Direct', 'Institutional Hospital Network', 'Government Research Grant'],
  },
  construction_engineering: {
    regions: ['Gulf Coast Mega-Project', 'Metro Transit Expansion', 'Airport Terminal Infrastructure', 'Clean Energy Solar Park', 'Data Center Industrial Complex'],
    channels: ['EPC Prime Contract', 'Design-Build Joint Venture', 'Public Infrastructure Tender', 'Private Developer Direct', 'CM at Risk'],
  },
  telecom_networks: {
    regions: ['Midwest 5G Metro Grid', 'Northeast Fiber Corridor', 'Pacific Coastal Node', 'Southern Megacity Hub', 'European Backbone Network'],
    channels: ['Enterprise Dedicated WAN', 'B2B Mobile Fleet', 'Wholesale MVNO Carrier', 'Direct Consumer Fiber', 'Government Tactical Comms'],
  },
  legal_compliance: {
    regions: ['Southern District of New York', 'Delaware Chancery Court', 'London Commercial Court', 'California Northern District', 'EU Competition Tribunal'],
    channels: ['Retained Corporate Counsel', 'Litigation Defense Practice', 'M&A Transaction Advisory', 'Regulatory Enforcement Desk', 'Special Investigation Unit'],
  },
  insurance_underwriting: {
    regions: ['Northeast Commercial District', 'Midwest Industrial Corridor', 'Gulf Coast Specialty Zone', 'Western Technology Region', 'London Lloyd\'s Syndicate'],
    channels: ['Wholesale Brokerage', 'Direct Corporate Risk', 'Managing General Agent (MGA)', 'Independent Agent Network', 'Reinsurance Treaty'],
  },
  agriculture_agritech: {
    regions: ['Midwest Grain Belt', 'California Central Valley', 'Mississippi Delta Basin', 'Pacific Northwest Orchards', 'Great Plains Agronomy Zone'],
    channels: ['Commercial Agronomy Retail', 'Farmer Cooperative Direct', 'Food Processing Contract', 'Commodity Grain Terminal', 'Export Bulk Channel'],
  },
  food_beverage: {
    regions: ['Metro Flagship District', 'Pacific Coast Region', 'Mid-Atlantic Franchise Hub', 'Great Lakes Beverage Hub', 'Southeast Distribution Zone'],
    channels: ['National Supermarket Chains', 'Foodservice & Restaurant Direct', 'Club Store Wholesale', 'Convenience & Express Retail', 'Direct-to-Consumer Pantry'],
  },
  aerospace_defense: {
    regions: ['Palmdale Skunkworks Facility', 'Redstone Flight Range', 'Cape Space Launch Complex', 'Woomera Test Facility', 'Seattle Final Assembly Line'],
    channels: ['Prime Defense Contract (DoD)', 'Direct Commercial Aviation', 'Allied Foreign Military Sales (FMS)', 'Civil Space Agency (NASA/ESA)', 'Defense Subcontractor Tier-1'],
  },
  cybersecurity_secops: {
    regions: ['FedRAMP High Enclave', 'EU Sovereign Data Zone', 'AWS Commercial Cloud', 'Azure Enterprise Tenant', 'Google Cloud Zero-Trust Zone'],
    channels: ['Enterprise Direct Sales', 'Managed Security Service Provider (MSSP)', 'Cloud Marketplace (AWS/Azure/GCP)', 'System Integrator Channel', 'Emergency Incident Response'],
  },
  media_entertainment: {
    regions: ['North American Domestic Box', 'European Cinema Circuit', 'Asia-Pacific Streaming Market', 'Latin American Theatrical Hub', 'Middle East Entertainment City'],
    channels: ['Subscription Video on Demand (SVOD)', 'Theatrical Distribution', 'Broadcast & Cable Syndication', 'Premium Video on Demand (PVOD)', 'Global Licensing Rights'],
  },
  nonprofit_charity: {
    regions: ['Sub-Saharan Africa Relief Hub', 'Southeast Asia Humanitarian Mission', 'Central America Development Zone', 'Domestic Urban Community Hub', 'Middle East Crisis Response'],
    channels: ['Major Philanthropic Donors', 'Institutional Foundation Grants', 'Corporate Matching Gifts', 'Government Aid Programs (USAID/UN)', 'Grassroots Digital Campaigns'],
  },
  fitness_wellness: {
    regions: ['Manhattan Flagship Club', 'Santa Monica Wellness Hub', 'Chicago Loop Athletic Center', 'Austin Performance Center', 'Miami Waterfront Club'],
    channels: ['All-Access Member Subscriptions', 'Corporate Wellness Partnerships', 'Personal Training Packages', 'Digital Streaming Class Pass', 'Wellness Spa & Nutrition Direct'],
  },
  professional_services: {
    regions: ['New York Advisory Practice', 'London Strategy Center', 'Chicago Transformation Hub', 'San Francisco Tech Practice', 'Singapore Management Hub'],
    channels: ['Strategy & M&A Retainers', 'Technology Transformation Contracts', 'Managed Professional Services', 'Turnaround & Restructuring', 'Executive Staff Augmentation'],
  },
  oil_gas_mining: {
    regions: ['Permian Delaware Basin', 'Eagle Ford Shale Play', 'Gulf of Mexico Deepwater', 'Bakken Formation', 'Athabasca Resource Zone'],
    channels: ['Long-Term Pipeline Offtake', 'Spot Commodity Clearing', 'Refinery Direct Supply', 'Industrial Bulk Wholesale', 'Export LNG Terminal'],
  },
  fashion_luxury: {
    regions: ['Fifth Avenue Flagship (New York)', 'Champs-Élysées Maison (Paris)', 'Via Montenapoleone (Milan)', 'Ginza Luxury Boutique (Tokyo)', 'Bond Street Store (London)'],
    channels: ['Maison Flagship Boutiques', 'Luxury Department Stores (Saks/Harrods)', 'Private Client VIP Salon', 'Omnichannel Digital Flagship', 'Exclusive Duty-Free Concessions'],
  },
  biomedical_genomics: {
    regions: ['Boston Genome Sequencing Center', 'San Diego High-Throughput Core Lab', 'Cambridge Sanger Institute Hub', 'Tokyo RIKEN Genomics Facility', 'Zurich Precision Health Hub'],
    channels: ['Clinical Diagnostic Laboratories', 'Academic Research Consortiums', 'Pharma Oncology Programs', 'Government Precision Medicine', 'Biotech Biomarker Discovery'],
  },
  saas_product_ops: {
    regions: ['US East (AWS Multi-AZ)', 'EU Central (Frankfurt Core)', 'AP Northeast (Tokyo Node)', 'US West (Silicon Valley Edge)', 'UK South (London Data Center)'],
    channels: ['Enterprise Direct Contract', 'Product-Led Growth (Self-Serve)', 'Annual Reserved Capacity', 'ISV Partner Integration', 'Government Cloud Tier'],
  },
  customer_support_ops: {
    regions: ['Austin Operations Center', 'Dublin EMEA Support Hub', 'Manila Global Assistance Hub', 'Bangalore Technical Resolution Center', 'Salt Lake City Operations'],
    channels: ['Dedicated Enterprise Concierge', 'Live Multi-Channel Chat', 'Priority 24/7 Telephone', 'Customer Portal Ticketing', 'Automated AI Agent Escalation'],
  },
};

function inferGeoLocation(regionName: string): { country: string; city: string } {
  if (regionName.includes('New York') || regionName.includes('Manhattan')) return { country: 'United States', city: 'New York' };
  if (regionName.includes('Austin')) return { country: 'United States', city: 'Austin' };
  if (regionName.includes('Fremont') || regionName.includes('Silicon Valley')) return { country: 'United States', city: 'Fremont' };
  if (regionName.includes('Chicago')) return { country: 'United States', city: 'Chicago' };
  if (regionName.includes('San Francisco') || regionName.includes('Santa Monica')) return { country: 'United States', city: 'San Francisco' };
  if (regionName.includes('Seattle')) return { country: 'United States', city: 'Seattle' };
  if (regionName.includes('Boston')) return { country: 'United States', city: 'Boston' };
  if (regionName.includes('San Diego')) return { country: 'United States', city: 'San Diego' };
  if (regionName.includes('US-') || regionName.includes('Midwest') || regionName.includes('Delaware') || regionName.includes('Detroit') || regionName.includes('Gulf') || regionName.includes('Northeast') || regionName.includes('Pacific') || regionName.includes('Southern') || regionName.includes('Great Plains') || regionName.includes('Mississippi') || regionName.includes('California') || regionName.includes('Texas') || regionName.includes('Mojave') || regionName.includes('Palmdale') || regionName.includes('Redstone') || regionName.includes('Cape') || regionName.includes('Permian') || regionName.includes('Eagle Ford') || regionName.includes('Bakken') || regionName.includes('Salt Lake')) {
    return { country: 'United States', city: 'Corporate Center' };
  }
  if (regionName.includes('Berlin')) return { country: 'Germany', city: 'Berlin' };
  if (regionName.includes('Frankfurt')) return { country: 'Germany', city: 'Frankfurt' };
  if (regionName.includes('Stuttgart')) return { country: 'Germany', city: 'Stuttgart' };
  if (regionName.includes('Munich')) return { country: 'Germany', city: 'Munich' };
  if (regionName.includes('London') || regionName.includes('Oxford') || regionName.includes('Cambridge') || regionName.includes('UK')) return { country: 'United Kingdom', city: 'London' };
  if (regionName.includes('Tokyo')) return { country: 'Japan', city: 'Tokyo' };
  if (regionName.includes('Yokohama')) return { country: 'Japan', city: 'Yokohama' };
  if (regionName.includes('Kyoto')) return { country: 'Japan', city: 'Kyoto' };
  if (regionName.includes('Shanghai')) return { country: 'China', city: 'Shanghai' };
  if (regionName.includes('Singapore')) return { country: 'Singapore', city: 'Singapore' };
  if (regionName.includes('Zurich')) return { country: 'Switzerland', city: 'Zurich' };
  if (regionName.includes('Basel') || regionName.includes('St. Moritz')) return { country: 'Switzerland', city: 'Basel' };
  if (regionName.includes('Paris')) return { country: 'France', city: 'Paris' };
  if (regionName.includes('Milan') || regionName.includes('Amalfi')) return { country: 'Italy', city: 'Milan' };
  if (regionName.includes('Monterrey')) return { country: 'Mexico', city: 'Monterrey' };
  if (regionName.includes('Rotterdam')) return { country: 'Netherlands', city: 'Rotterdam' };
  if (regionName.includes('Dubai')) return { country: 'United Arab Emirates', city: 'Dubai' };
  if (regionName.includes('Dublin')) return { country: 'Ireland', city: 'Dublin' };
  if (regionName.includes('Manila')) return { country: 'Philippines', city: 'Manila' };
  if (regionName.includes('Bangalore')) return { country: 'India', city: 'Bangalore' };
  return { country: 'United States', city: 'Operations Center' };
}

const SALES_REPS = [
  'Marcus Vance',
  'Elena Rostova',
  'David K. Chen',
  'Sarah Jenkins',
  'Liam O\'Connor',
  'Priya Sharma',
  'Mateo Alvarez',
  'Chloe Dubois',
];

const PAYMENT_TERMS: Transaction['paymentTerms'][] = [
  'Net 30',
  'Net 60',
  'Annual Prepaid',
  'Credit Card / ACH',
];

// Seeded pseudorandom generator for repeatable realistic datasets
function createRng(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function generateRealisticDataset(config: DatasetConfig, seedOffset = 0): AppDataset {
  const rng = createRng(42 + config.recordCount + seedOffset * 7919);
  const preset = INDUSTRY_PRESETS[config.industry] || INDUSTRY_PRESETS.enterprise_tech;
  const filterPreset = INDUSTRY_FILTER_PRESETS[config.industry] || INDUSTRY_FILTER_PRESETS.enterprise_tech;
  const regions = filterPreset.regions;
  const channels = filterPreset.channels;

  const transactions: Transaction[] = [];

  // Generate date ranges over past 18 months (e.g., 2024-01-01 to 2025-06-30)
  const startDate = new Date(2024, 0, 15).getTime();
  const endDate = new Date(2025, 5, 28).getTime();
  const timeSpan = endDate - startDate;

  for (let i = 1; i <= config.recordCount; i++) {
    // ID
    const txId = `TX-${2024 + Math.floor(rng() * 2)}-${String(10000 + i).slice(1)}`;
    
    // Pick customer
    const cust = preset.customers[Math.floor(rng() * preset.customers.length)];
    const custId = `CUST-${String(100 + (Math.abs(hashString(cust.name)) % 900))}`;

    // Pick region & country & city
    const regionName = regions[Math.floor(rng() * regions.length)];
    const geo = inferGeoLocation(regionName);

    // Pick product
    const product = preset.products[Math.floor(rng() * preset.products.length)];
    
    // Quantity: 1 to 15 (skewed towards 1-4 with occasional enterprise bulk 8-15)
    let quantity = 1;
    const qRoll = rng();
    if (qRoll > 0.88) quantity = Math.floor(rng() * 8) + 8;
    else if (qRoll > 0.60) quantity = Math.floor(rng() * 4) + 3;
    else quantity = Math.floor(rng() * 2) + 1;

    // Discount rate (e.g. 0%, 5%, 10%, 15%, 20%)
    let discountPct = 0;
    const dRoll = rng();
    if (dRoll > 0.85) discountPct = 0.20;
    else if (dRoll > 0.65) discountPct = 0.15;
    else if (dRoll > 0.45) discountPct = 0.10;
    else if (dRoll > 0.25) discountPct = 0.05;
    else discountPct = 0;

    // Financial calculations
    const listPrice = product.price;
    const unitCost = product.cost;
    const grossRev = quantity * listPrice * (1 - discountPct);
    const cogs = quantity * unitCost;
    const grossProfit = grossRev - cogs;
    const marginPct = grossRev > 0 ? grossProfit / grossRev : 0;

    // Date
    const txTimestamp = new Date(startDate + rng() * timeSpan);
    const dateStr = txTimestamp.toISOString().split('T')[0];
    const quarter = `Q${Math.floor(txTimestamp.getMonth() / 3) + 1}-${txTimestamp.getFullYear()}`;

    // Sales channel & Rep
    const rep = SALES_REPS[Math.floor(rng() * SALES_REPS.length)];
    const channel = channels[Math.floor(rng() * channels.length)];
    const payment = PAYMENT_TERMS[Math.floor(rng() * PAYMENT_TERMS.length)];

    transactions.push({
      id: txId,
      orderDate: dateStr,
      quarter,
      customerId: custId,
      customerName: cust.name,
      customerTier: cust.tier,
      industry: cust.industry,
      region: regionName,
      country: geo.country,
      city: geo.city,
      salesRep: rep,
      salesChannel: channel,
      sku: product.sku,
      productName: product.name,
      productCategory: product.category,
      unitCost: round2(unitCost),
      unitPrice: round2(listPrice),
      quantity,
      discountPct: round2(discountPct),
      revenue: round2(grossRev),
      cogs: round2(cogs),
      grossProfit: round2(grossProfit),
      marginPct: round4(marginPct),
      paymentTerms: payment,
      status: rng() > 0.08 ? 'Completed' : 'Invoiced',
    });
  }

  // Sort by date ascending
  transactions.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());

  // Aggregate Product Catalog items
  const productCatalog: ProductCatalogItem[] = preset.products.map((p, idx) => {
    const txs = transactions.filter((t) => t.sku === p.sku);
    const totalUnits = txs.reduce((sum, t) => sum + t.quantity, 0);
    return {
      sku: p.sku,
      productName: p.name,
      category: p.category,
      unitCost: p.cost,
      listPrice: p.price,
      standardMarginPct: round4((p.price - p.cost) / p.price),
      leadTimeDays: [7, 14, 21, 30][idx % 4],
      stockLevel: Math.floor(150 + totalUnits * 0.4 + rng() * 100),
      status: totalUnits > 200 ? 'High Demand' : 'Active',
    };
  });

  // Aggregate Regional Performance
  const uniqueRegions = Array.from(new Set(transactions.map((t) => t.region)));
  const top4Regions = uniqueRegions.slice(0, 4);
  const defaultDirectors = [
    'Marcus Vance (Lead Director)',
    'Sarah Jenkins (Senior Executive)',
    'Elena Rostova (Operations Head)',
    'David K. Chen (Regional VP)',
  ];

  const regionalPerformance: RegionalPerformance[] = top4Regions.map((reg, rIdx) => {
    const txs = transactions.filter((t) => t.region === reg);
    const actualRev = round2(txs.reduce((sum, t) => sum + t.revenue, 0));
    const actualProfit = round2(txs.reduce((sum, t) => sum + t.grossProfit, 0));
    const targetMultiplier = rIdx === 0 ? 0.94 : rIdx === 1 ? 0.98 : rIdx === 2 ? 1.05 : 0.91;
    const targetRevenue = round2(actualRev * targetMultiplier);
    const targetProfit = round2(actualProfit * targetMultiplier);
    const quotaPct = targetRevenue > 0 ? actualRev / targetRevenue : 1;
    const geo = REGIONAL_GEOGRAPHY[reg as keyof typeof REGIONAL_GEOGRAPHY];

    return {
      region: reg,
      countries: geo ? geo.countries.map((c) => c.name).slice(0, 3).join(', ') : 'Primary Facility & Operational Network',
      targetRevenue,
      actualRevenue: actualRev,
      targetProfit,
      actualProfit,
      quotaAttainmentPct: round4(quotaPct),
      orderCount: txs.length,
      averageDealSize: txs.length > 0 ? round2(actualRev / txs.length) : 0,
      growthRateYoY: round4(0.12 + (rng() * 0.14 - 0.04)),
      regionalDirector: geo ? geo.director : defaultDirectors[rIdx % defaultDirectors.length],
    };
  });

  // Aggregate Customer Accounts
  const customerMap = new Map<string, CustomerAccount>();
  for (const t of transactions) {
    if (!customerMap.has(t.customerId)) {
      customerMap.set(t.customerId, {
        customerId: t.customerId,
        customerName: t.customerName,
        tier: t.customerTier,
        industry: t.industry,
        country: t.country,
        totalOrders: 0,
        lifetimeRevenue: 0,
        lifetimeProfit: 0,
        contractRenewal: '2026-Q1',
        accountHealth: 'Optimal',
        accountExecutive: t.salesRep,
      });
    }
    const acc = customerMap.get(t.customerId)!;
    acc.totalOrders += 1;
    acc.lifetimeRevenue = round2(acc.lifetimeRevenue + t.revenue);
    acc.lifetimeProfit = round2(acc.lifetimeProfit + t.grossProfit);
  }

  const customerAccounts = Array.from(customerMap.values()).map((acc, i) => {
    const healthRoll = (i * 17) % 10;
    acc.accountHealth = healthRoll < 7 ? 'Optimal' : healthRoll < 9 ? 'Stable' : 'At Risk';
    acc.contractRenewal = `2026-Q${(i % 4) + 1}`;
    return acc;
  });
  customerAccounts.sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue);

  // Aggregate Monthly Trends
  const monthMap = new Map<string, { revenue: number; grossProfit: number; orders: number }>();
  for (const t of transactions) {
    const mKey = t.orderDate.slice(0, 7); // "YYYY-MM"
    if (!monthMap.has(mKey)) {
      monthMap.set(mKey, { revenue: 0, grossProfit: 0, orders: 0 });
    }
    const cur = monthMap.get(mKey)!;
    cur.revenue += t.revenue;
    cur.grossProfit += t.grossProfit;
    cur.orders += 1;
  }

  const monthlyTrends: MonthlyTrend[] = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
      const rev = round2(val.revenue);
      const prof = round2(val.grossProfit);
      return {
        monthKey: key,
        monthLabel: label,
        revenue: rev,
        grossProfit: prof,
        orderCount: val.orders,
        marginPct: rev > 0 ? round4(prof / rev) : 0,
      };
    });

  // Category Summaries
  const catMap = new Map<string, { units: number; revenue: number; profit: number }>();
  let totalRevAll = 0;
  for (const t of transactions) {
    if (!catMap.has(t.productCategory)) {
      catMap.set(t.productCategory, { units: 0, revenue: 0, profit: 0 });
    }
    const c = catMap.get(t.productCategory)!;
    c.units += t.quantity;
    c.revenue += t.revenue;
    c.profit += t.grossProfit;
    totalRevAll += t.revenue;
  }

  const categorySummaries: CategorySummary[] = Array.from(catMap.entries())
    .map(([cat, val]) => {
      const rev = round2(val.revenue);
      const prof = round2(val.profit);
      return {
        category: cat,
        units: val.units,
        revenue: rev,
        grossProfit: prof,
        marginPct: rev > 0 ? round4(prof / rev) : 0,
        sharePct: totalRevAll > 0 ? round4(rev / totalRevAll) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Overall KPIs
  const totalRevenue = round2(transactions.reduce((s, t) => s + t.revenue, 0));
  const totalGrossProfit = round2(transactions.reduce((s, t) => s + t.grossProfit, 0));
  const totalCogs = round2(transactions.reduce((s, t) => s + t.cogs, 0));
  const totalUnits = transactions.reduce((s, t) => s + t.quantity, 0);
  const averageDealSize = transactions.length > 0 ? round2(totalRevenue / transactions.length) : 0;
  const overallMarginPct = totalRevenue > 0 ? round4(totalGrossProfit / totalRevenue) : 0;

  return {
    config,
    transactions,
    productCatalog,
    regionalPerformance,
    customerAccounts,
    monthlyTrends,
    categorySummaries,
    kpi: {
      totalRevenue,
      totalGrossProfit,
      totalCogs,
      totalUnits,
      orderCount: transactions.length,
      averageDealSize,
      overallMarginPct,
      topRegion: regionalPerformance[0]?.region || 'North America',
      topCategory: categorySummaries[0]?.category || 'Core Enterprise',
      activeCustomers: customerAccounts.length,
    },
  };
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function round4(num: number): number {
  return Math.round((num + Number.EPSILON) * 10000) / 10000;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
