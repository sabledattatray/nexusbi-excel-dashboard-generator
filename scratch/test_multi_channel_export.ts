import fs from 'fs';
import path from 'path';
import { buildDatasetFromUpload, RawParsedTable } from '../src/utils/dataImporter';
import { exportToProfessionalExcel } from '../src/utils/excelExporter';
import { DatasetConfig } from '../src/types/dataset';

async function main() {
  console.log('Generating multi-channel dataset (6 channels)...');
  const sampleHeaders = ['Ticket_ID', 'Date', 'Customer', 'Category', 'Region', 'Resolver_Group', 'Units', 'SLA_Hours', 'Cost'];
  const channels = ['Applications', 'Network', 'Security', 'Database', 'Cloud Infrastructure', 'DevOps Support'];
  const regions = ['Hyderabad', 'Pune', 'Chennai', 'Bangalore'];

  const rows: Record<string, any>[] = Array.from({ length: 120 }, (_, i) => ({
    Ticket_ID: `TCK-${1000 + i}`,
    Date: `2026-0${(i % 8) + 1}-15`,
    Customer: `Client Org ${i % 20}`,
    Category: ['Software', 'Hardware', 'Network', 'Access', 'Cloud'][i % 5],
    Region: regions[i % regions.length],
    Resolver_Group: channels[i % channels.length],
    Units: 1 + (i % 3),
    SLA_Hours: 100 + (i * 15),
    Cost: 40 + (i * 5),
  }));

  const mockTable: RawParsedTable = {
    headers: sampleHeaders,
    rows: rows,
    totalRows: rows.length,
    fileName: 'Helpdesk_Operations_Test_Multi_Channel.csv',
    fileSize: 10240,
    fileType: 'csv',
  };

  const config: DatasetConfig = {
    companyName: 'Helpdesk Corp',
    reportTitle: 'Helpdesk Operations Analytics',
    industry: 'enterprise_tech',
    recordCount: 120,
    currency: 'USD',
    currencySymbol: '$',
    includeChartsInExcel: true,
    useLiveExcelFormulas: true,
  };

  const res = buildDatasetFromUpload(mockTable, {
    idCol: 'Ticket_ID',
    dateCol: 'Date',
    entityCol: 'Customer',
    primaryCategoryCol: 'Category',
    secondaryCategoryCol: 'Region',
    channelCol: 'Resolver_Group',
    volumeMetricCol: 'Units',
    primaryMetricCol: 'SLA_Hours',
    secondaryMetricCol: 'Cost',
  }, config);

  const { blob, filename } = await exportToProfessionalExcel(res.dataset, res.dataset.config);
  const buffer = Buffer.from(await blob.arrayBuffer());
  const outPath = path.resolve('scratch', 'multi_channel_test.xlsx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved multi-channel export (${buffer.length} bytes) to: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
