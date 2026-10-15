import JSZip from 'jszip';
import { generateRealisticDataset } from './dataGenerator';

/**
 * Injects 100% REAL NATIVE OPENXML DRAWINGML EXCEL CHARTS into the .xlsx workbook using JSZip.
 * 
 * Generates authentic interactive Excel chart objects across two executive sheets:
 * 
 * --- SHEET 1: EXECUTIVE DASHBOARD ---
 * 1. Chart 1: Native Vertical Clustered Column Run-Rate Chart (<c:barChart barDir="col">)
 *    - Anchor: Columns B to H (B10:H25)
 *    - Data range: 'Executive Dashboard'!$B$46:$B$57 (Months)
 *    - Series 1: 'Executive Dashboard'!$C$46:$C$57 (Revenue)
 *    - Series 2: 'Executive Dashboard'!$E$46:$E$57 (Gross Profit)
 * 
 * 2. Chart 2: Native Excel 2D Pie Chart (<c:pieChart>)
 *    - Anchor: Columns I to O (I10:O25)
 *    - Category labels: 'Executive Dashboard'!$B$62:$B$66 (Top 5 Categories)
 *    - Values: 'Executive Dashboard'!$D$62:$D$66 (Revenue)
 * 
 * 3. Chart 3: Native Horizontal Clustered Bar Chart (<c:barChart barDir="bar">)
 *    - Anchor: Columns B to H (B27:H42)
 *    - Category labels: 'Executive Dashboard'!$I$46:$I$49 (Regions: North America, EMEA, APAC, LATAM)
 *    - Series 1: 'Executive Dashboard'!$K$46:$K$49 (Actual Rev)
 *    - Series 2: 'Executive Dashboard'!$L$46:$L$49 (Quota Target)
 * 
 * 4. Chart 4: Native Donut Chart (<c:doughnutChart holeSize="65">)
 *    - Anchor: Columns I to O (I27:O42)
 *    - Category labels: 'Executive Dashboard'!$I$62:$I$65 (Sales Channels)
 *    - Values: 'Executive Dashboard'!$K$62:$K$65 (Channel Revenue)
 * 
 * --- SHEET 2: PIVOT TABLE ANALYSIS (PIVOT CHARTS) ---
 * 5. Chart 5: Pivot Chart 1 - Global Theater by Sales Channel Matrix (<c:barChart barDir="col">)
 *    - Categories: 'Pivot Table Analysis'!$B$7:$B$10 (Theaters)
 *    - Series 1: Direct Enterprise ('Pivot Table Analysis'!$C$7:$C$10)
 *    - Series 2: Partner Ecosystem ('Pivot Table Analysis'!$D$7:$D$10)
 *    - Series 3: Inside Sales ('Pivot Table Analysis'!$E$7:$E$10)
 *    - Series 4: Online Enterprise ('Pivot Table Analysis'!$F$7:$F$10)
 * 
 * 6. Chart 6: Pivot Chart 2 - Product Category Revenue Distribution (<c:pieChart>)
 *    - Categories: 'Pivot Table Analysis'!$B$15:$B$19 (Product Categories)
 *    - Values: 'Pivot Table Analysis'!$G$15:$G$19 (Total Revenue)
 * 
 * 7. Chart 7: Pivot Chart 3 - Fiscal Quarterly Run-Rate & Margin (<c:barChart barDir="col">)
 *    - Categories: 'Pivot Table Analysis'!$B$24:$B$27 (Q1-2024 to Q4-2024)
 *    - Series 1: Gross Revenue ('Pivot Table Analysis'!$C$24:$C$27)
 *    - Series 2: Operating Profit ('Pivot Table Analysis'!$E$24:$E$27)
 */

export async function injectNativeExcelCharts(
  xlsxBuffer: ArrayBuffer,
  dataset: ReturnType<typeof generateRealisticDataset>
): Promise<Blob> {
  const zip = await JSZip.loadAsync(xlsxBuffer);

  const { monthlyTrends, categorySummaries, regionalPerformance, kpi } = dataset;

  const months = monthlyTrends.slice(0, 12);
  const mCount = months.length;
  const startMonthRow = 46;
  const endMonthRow = startMonthRow + mCount - 1; // 46 to 57

  const topCats = categorySummaries.slice(0, 5);
  const cCount = topCats.length;
  const startCatRow = 62; // Aligned with Table Block 2: B62:H66
  const endCatRow = startCatRow + cCount - 1; // 62 to 66

  const regions = regionalPerformance.slice(0, 4);
  const rCount = regions.length;
  const startRegRow = 46; // Aligned with Table Block 1: I46:O49
  const endRegRow = startRegRow + rCount - 1; // 46 to 49

  // Channels for Donut Chart
  const totalRev = kpi.totalRevenue;
  const channelList = [
    { name: 'Direct Enterprise', rev: Math.round(totalRev * 0.42), color: '0284C7' },
    { name: 'Partner Ecosystem', rev: Math.round(totalRev * 0.28), color: '10B981' },
    { name: 'Inside Sales', rev: Math.round(totalRev * 0.18), color: '6366F1' },
    { name: 'Online Enterprise', rev: Math.round(totalRev * 0.12), color: 'F59E0B' },
  ];

  const pieColors = ['10B981', '0284C7', '6366F1', '8B5CF6', 'F59E0B'];
  const quartersList = ['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'];

  // =============================================================
  // SHEET 1 CHARTS (chart1.xml to chart4.xml)
  // =============================================================

  // 1. CHART 1: MONTHLY COLUMN RUN-RATE CHART
  const chart1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1200"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1200"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Monthly Revenue &amp; Operating Profit Run-Rate</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$C$45</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Revenue ($)</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="0284C7"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="0369A1"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$B$${startMonthRow}:$B$${endMonthRow}</c:f>
              <c:strCache>
                <c:ptCount val="${mCount}"/>
                ${months.map((m, i) => `<c:pt idx="${i}"><c:v>${escapeXml(m.monthLabel)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$C$${startMonthRow}:$C$${endMonthRow}</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${mCount}"/>
                ${months.map((m, i) => `<c:pt idx="${i}"><c:v>${m.revenue}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:ser>
          <c:idx val="1"/>
          <c:order val="1"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$E$45</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Gross Profit ($)</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="10B981"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="059669"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$B$${startMonthRow}:$B$${endMonthRow}</c:f>
              <c:strCache>
                <c:ptCount val="${mCount}"/>
                ${months.map((m, i) => `<c:pt idx="${i}"><c:v>${escapeXml(m.monthLabel)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$E$${startMonthRow}:$E$${endMonthRow}</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${mCount}"/>
                ${months.map((m, i) => `<c:pt idx="${i}"><c:v>${m.grossProfit}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:gapWidth val="120"/>
        <c:overlap val="0"/>
        <c:axId val="100001"/>
        <c:axId val="100002"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="100001"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="100002"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="100002"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="100001"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="t"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // 2. CHART 2: CATEGORY REVENUE SHARE PIE CHART
  const chart2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1200"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1200"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Revenue Contribution by Product Category</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:pieChart>
        <c:varyColors val="1"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$D$61</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Gross Revenue</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          ${topCats.map((cat, i) => `
          <c:dPt>
            <c:idx val="${i}"/>
            <c:spPr>
              <a:solidFill><a:srgbClr val="${pieColors[i % pieColors.length]}"/></a:solidFill>
              <a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>
            </c:spPr>
          </c:dPt>`).join('')}
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$B$${startCatRow}:$B$${endCatRow}</c:f>
              <c:strCache>
                <c:ptCount val="${cCount}"/>
                ${topCats.map((c, i) => `<c:pt idx="${i}"><c:v>${escapeXml(c.category)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$D$${startCatRow}:$D$${endCatRow}</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${cCount}"/>
                ${topCats.map((c, i) => `<c:pt idx="${i}"><c:v>${c.revenue}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:dLbls>
          <c:showLegendKey val="0"/>
          <c:showVal val="0"/>
          <c:showCatName val="0"/>
          <c:showSerName val="0"/>
          <c:showPercent val="1"/>
          <c:showBubbleSize val="0"/>
        </c:dLbls>
        <c:firstSliceAng val="0"/>
      </c:pieChart>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="r"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // 3. CHART 3: REGIONAL HORIZONTAL BAR CHART
  const chart3Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1200"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1200"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Regional Theater Quota Attainment (Actual vs Target)</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="bar"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$K$45</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Actual Rev</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="0284C7"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="0369A1"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$I$${startRegRow}:$I$${endRegRow}</c:f>
              <c:strCache>
                <c:ptCount val="${rCount}"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${escapeXml(r.region)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$K$${startRegRow}:$K$${endRegRow}</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${rCount}"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${r.actualRevenue}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:ser>
          <c:idx val="1"/>
          <c:order val="1"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$L$45</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Target Rev</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="64748B"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$I$${startRegRow}:$I$${endRegRow}</c:f>
              <c:strCache>
                <c:ptCount val="${rCount}"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${escapeXml(r.region)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$L$${startRegRow}:$L$${endRegRow}</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${rCount}"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${r.targetRevenue}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:gapWidth val="100"/>
        <c:overlap val="0"/>
        <c:axId val="200001"/>
        <c:axId val="200002"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="200001"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="200002"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="200002"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="200001"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="t"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // 4. CHART 4: CHANNEL MIX DONUT CHART
  const chart4Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1200"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1200"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Sales Channel Revenue Mix (Native Donut Chart)</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:doughnutChart>
        <c:varyColors val="1"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Executive Dashboard'!$K$61</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Channel Revenue</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          ${channelList.map((ch, i) => `
          <c:dPt>
            <c:idx val="${i}"/>
            <c:spPr>
              <a:solidFill><a:srgbClr val="${ch.color}"/></a:solidFill>
              <a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>
            </c:spPr>
          </c:dPt>`).join('')}
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$I$62:$I$65</c:f>
              <c:strCache>
                <c:ptCount val="4"/>
                ${channelList.map((ch, i) => `<c:pt idx="${i}"><c:v>${escapeXml(ch.name)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$K$62:$K$65</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="4"/>
                ${channelList.map((ch, i) => `<c:pt idx="${i}"><c:v>${ch.rev}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:dLbls>
          <c:showLegendKey val="0"/>
          <c:showVal val="0"/>
          <c:showCatName val="0"/>
          <c:showSerName val="0"/>
          <c:showPercent val="1"/>
          <c:showBubbleSize val="0"/>
        </c:dLbls>
        <c:firstSliceAng val="0"/>
        <c:holeSize val="65"/>
      </c:doughnutChart>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="r"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // =============================================================
  // SHEET 2 PIVOT CHARTS (chart5.xml to chart7.xml)
  // =============================================================

  // 5. CHART 5: PIVOT CHART 1 - REGIONAL THEATER × CHANNEL MATRIX
  const chart5Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1100"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1100"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Pivot Chart 1: Global Theater Revenue by Sales Channel</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        ${['Direct Enterprise', 'Partner Ecosystem', 'Inside Sales', 'Online Enterprise'].map((ch, idx) => {
          const colLetter = ['C', 'D', 'E', 'F'][idx];
          const colorHex = ['0284C7', '10B981', '6366F1', 'F59E0B'][idx];
          return `
        <c:ser>
          <c:idx val="${idx}"/>
          <c:order val="${idx}"/>
          <c:tx>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$${colLetter}$6</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>${escapeXml(ch)}</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="${colorHex}"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="${colorHex}"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$B$7:$B$10</c:f>
              <c:strCache>
                <c:ptCount val="4"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${escapeXml(r.region)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Pivot Table Analysis'!$${colLetter}$7:$${colLetter}$10</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="4"/>
                ${regions.map((r, i) => `<c:pt idx="${i}"><c:v>${Math.round(r.actualRevenue * [0.42, 0.28, 0.18, 0.12][idx])}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>`;
        }).join('')}
        <c:gapWidth val="130"/>
        <c:overlap val="0"/>
        <c:axId val="300001"/>
        <c:axId val="300002"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="300001"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="300002"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="300002"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="300001"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="t"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // 6. CHART 6: PIVOT CHART 2 - PRODUCT CATEGORY PORTFOLIO (PIE)
  const chart6Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1100"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1100"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Pivot Chart 2: Product Category Revenue Matrix</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:pieChart>
        <c:varyColors val="1"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$G$14</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Total Revenue</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          ${topCats.map((cat, i) => `
          <c:dPt>
            <c:idx val="${i}"/>
            <c:spPr>
              <a:solidFill><a:srgbClr val="${pieColors[i % pieColors.length]}"/></a:solidFill>
              <a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>
            </c:spPr>
          </c:dPt>`).join('')}
          <c:cat>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$B$15:$B$19</c:f>
              <c:strCache>
                <c:ptCount val="${cCount}"/>
                ${topCats.map((c, i) => `<c:pt idx="${i}"><c:v>${escapeXml(c.category)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Pivot Table Analysis'!$G$15:$G$19</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="${cCount}"/>
                ${topCats.map((c, i) => `<c:pt idx="${i}"><c:v>${c.revenue}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:dLbls>
          <c:showLegendKey val="0"/>
          <c:showVal val="0"/>
          <c:showCatName val="0"/>
          <c:showSerName val="0"/>
          <c:showPercent val="1"/>
          <c:showBubbleSize val="0"/>
        </c:dLbls>
        <c:firstSliceAng val="0"/>
      </c:pieChart>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="r"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // 7. CHART 7: PIVOT CHART 3 - FISCAL QUARTERLY PERFORMANCE (COLUMN)
  const chart7Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <c:date1904 val="0"/>
  <c:lang val="en-US"/>
  <c:roundedCorners val="0"/>
  <c:chart>
    <c:title>
      <c:tx>
        <c:rich>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr><a:defRPr b="1" sz="1100"/></a:pPr>
            <a:r>
              <a:rPr b="1" sz="1100"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill></a:rPr>
              <a:t>Pivot Chart 3: Fiscal Quarterly Revenue &amp; Operating Profit</a:t>
            </a:r>
          </a:p>
        </c:rich>
      </c:tx>
      <c:layout/>
      <c:overlay val="0"/>
    </c:title>
    <c:plotArea>
      <c:layout/>
      <c:barChart>
        <c:barDir val="col"/>
        <c:grouping val="clustered"/>
        <c:varyColors val="0"/>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$C$23</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Gross Revenue</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="0284C7"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="0369A1"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$B$24:$B$27</c:f>
              <c:strCache>
                <c:ptCount val="4"/>
                ${quartersList.map((q, i) => `<c:pt idx="${i}"><c:v>${escapeXml(q)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Pivot Table Analysis'!$C$24:$C$27</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="4"/>
                ${quartersList.map((q, i) => `<c:pt idx="${i}"><c:v>${Math.round(totalRev * 0.25)}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:ser>
          <c:idx val="1"/>
          <c:order val="1"/>
          <c:tx>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$E$23</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Operating Profit</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="10B981"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="059669"/></a:solidFill></a:ln>
          </c:spPr>
          <c:cat>
            <c:strRef>
              <c:f>'Pivot Table Analysis'!$B$24:$B$27</c:f>
              <c:strCache>
                <c:ptCount val="4"/>
                ${quartersList.map((q, i) => `<c:pt idx="${i}"><c:v>${escapeXml(q)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Pivot Table Analysis'!$E$24:$E$27</c:f>
              <c:numCache>
                <c:formatCode>$#,##0</c:formatCode>
                <c:ptCount val="4"/>
                ${quartersList.map((q, i) => `<c:pt idx="${i}"><c:v>${Math.round(kpi.totalGrossProfit * 0.25)}</c:v></c:pt>`).join('')}
              </c:numCache>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:gapWidth val="120"/>
        <c:overlap val="0"/>
        <c:axId val="400001"/>
        <c:axId val="400002"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="400001"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="400002"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="400002"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="400001"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="t"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // =============================================================
  // DRAWINGS XML: DRAWING 1 (Sheet 1: Executive Dashboard)
  // =============================================================
  const drawing1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
  
  <!-- Anchor for Chart 1: Native Vertical Column Run-rate Chart (B10 to H25) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>9</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>8</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>25</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="2" name="Chart 1: Monthly Run-Rate Column Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart1"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

  <!-- Anchor for Chart 2: Native Excel Pie Chart (I10 to O25) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>8</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>9</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>15</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>25</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="3" name="Chart 2: Category Revenue Share Pie Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart2"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

  <!-- Anchor for Chart 3: Native Horizontal Bar Chart (B27 to H42) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>26</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>8</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>42</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="4" name="Chart 3: Regional Quota Performance Horizontal Bar Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart3"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

  <!-- Anchor for Chart 4: Native Donut Chart (I27 to O42) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>8</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>26</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>15</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>42</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="5" name="Chart 4: Channel Distribution Donut Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart4"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

</xdr:wsDr>`;

  const drawing1RelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdChart1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
  <Relationship Id="rIdChart2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart2.xml"/>
  <Relationship Id="rIdChart3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart3.xml"/>
  <Relationship Id="rIdChart4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart4.xml"/>
</Relationships>`;

  // =============================================================
  // DRAWINGS XML: DRAWING 2 (Sheet 2: Pivot Table Analysis)
  // =============================================================
  const drawing2Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
  
  <!-- Anchor for Chart 5: Pivot Chart 1 - Theater by Channel Column Chart (Cols K to R, Rows 5 to 12) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>10</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>4</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>18</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>12</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="6" name="Pivot Chart 1: Theater by Channel Column Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart5"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

  <!-- Anchor for Chart 6: Pivot Chart 2 - Product Category Revenue Share Pie Chart (Cols K to R, Rows 13 to 21) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>10</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>12</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>18</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>21</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="7" name="Pivot Chart 2: Category Revenue Share Pie Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart6"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

  <!-- Anchor for Chart 7: Pivot Chart 3 - Quarterly Run-Rate Column Chart (Cols K to R, Rows 22 to 30) -->
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from><xdr:col>10</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>21</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>18</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>30</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro="">
      <xdr:nvGraphicFramePr>
        <xdr:cNvPr id="8" name="Pivot Chart 3: Quarterly Run-Rate Column Chart"/>
        <xdr:cNvGraphicFramePr/>
      </xdr:nvGraphicFramePr>
      <xdr:xfrm>
        <a:off x="0" y="0"/>
        <a:ext cx="0" cy="0"/>
      </xdr:xfrm>
      <a:graphic>
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
          <c:chart r:id="rIdChart7"/>
        </a:graphicData>
      </a:graphic>
    </xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>

</xdr:wsDr>`;

  const drawing2RelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdChart5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart5.xml"/>
  <Relationship Id="rIdChart6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart6.xml"/>
  <Relationship Id="rIdChart7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart7.xml"/>
</Relationships>`;

  // Write all chart and drawing files to ZIP
  zip.file('xl/charts/chart1.xml', chart1Xml);
  zip.file('xl/charts/chart2.xml', chart2Xml);
  zip.file('xl/charts/chart3.xml', chart3Xml);
  zip.file('xl/charts/chart4.xml', chart4Xml);
  zip.file('xl/charts/chart5.xml', chart5Xml);
  zip.file('xl/charts/chart6.xml', chart6Xml);
  zip.file('xl/charts/chart7.xml', chart7Xml);

  zip.file('xl/drawings/drawing1.xml', drawing1Xml);
  zip.file('xl/drawings/_rels/drawing1.xml.rels', drawing1RelsXml);

  zip.file('xl/drawings/drawing2.xml', drawing2Xml);
  zip.file('xl/drawings/_rels/drawing2.xml.rels', drawing2RelsXml);

  // =============================================================
  // UPDATE SHEET 1 (Executive Dashboard)
  // =============================================================
  let sheet1Rels = await zip.file('xl/worksheets/_rels/sheet1.xml.rels')?.async('string');
  if (!sheet1Rels) {
    sheet1Rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;
  } else if (!sheet1Rels.includes('drawings/drawing1.xml')) {
    sheet1Rels = sheet1Rels.replace(
      '</Relationships>',
      `<Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`
    );
  }
  zip.file('xl/worksheets/_rels/sheet1.xml.rels', sheet1Rels);

  let sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')?.async('string');
  if (sheet1Xml && !sheet1Xml.includes('<drawing')) {
    sheet1Xml = sheet1Xml.replace(
      '</worksheet>',
      `<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdDrawing1"/></worksheet>`
    );
    zip.file('xl/worksheets/sheet1.xml', sheet1Xml);
  }

  // =============================================================
  // UPDATE SHEET 2 (Pivot Table Analysis)
  // =============================================================
  let sheet2Rels = await zip.file('xl/worksheets/_rels/sheet2.xml.rels')?.async('string');
  if (!sheet2Rels) {
    sheet2Rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdDrawing2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing2.xml"/>
</Relationships>`;
  } else if (!sheet2Rels.includes('drawings/drawing2.xml')) {
    sheet2Rels = sheet2Rels.replace(
      '</Relationships>',
      `<Relationship Id="rIdDrawing2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing2.xml"/></Relationships>`
    );
  }
  zip.file('xl/worksheets/_rels/sheet2.xml.rels', sheet2Rels);

  let sheet2Xml = await zip.file('xl/worksheets/sheet2.xml')?.async('string');
  if (sheet2Xml && !sheet2Xml.includes('<drawing')) {
    sheet2Xml = sheet2Xml.replace(
      '</worksheet>',
      `<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdDrawing2"/></worksheet>`
    );
    zip.file('xl/worksheets/sheet2.xml', sheet2Xml);
  }

  // =============================================================
  // UPDATE [Content_Types].xml
  // =============================================================
  let contentTypes = await zip.file('[Content_Types].xml')?.async('string');
  if (contentTypes) {
    let updatedContentTypes = contentTypes;
    const overrides = [
      '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
      '<Override PartName="/xl/drawings/drawing2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
      '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart3.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart4.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart5.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart6.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart7.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
    ];

    overrides.forEach((ov) => {
      const partMatch = ov.match(/PartName="([^"]+)"/)?.[1];
      if (partMatch && !updatedContentTypes.includes(partMatch)) {
        updatedContentTypes = updatedContentTypes.replace('</Types>', `${ov}</Types>`);
      }
    });
    zip.file('[Content_Types].xml', updatedContentTypes);
  }

  // Re-generate clean OpenXML .xlsx binary blob
  const finalBuffer = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  return finalBuffer;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
