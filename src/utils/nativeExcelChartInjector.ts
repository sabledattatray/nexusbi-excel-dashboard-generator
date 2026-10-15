import JSZip from 'jszip';
import { generateRealisticDataset } from './dataGenerator';

/**
 * Injects 100% REAL NATIVE OPENXML DRAWINGML EXCEL CHARTS into the .xlsx workbook using JSZip.
 * 
 * Generates authentic interactive Excel chart objects:
 * 1. Chart 1: Native Vertical Clustered Column Run-Rate Chart (<c:barChart barDir="col">)
 *    - Data range: 'Executive Dashboard'!$B$46:$B$57 (Months)
 *    - Series 1: 'Executive Dashboard'!$C$46:$C$57 (Revenue)
 *    - Series 2: 'Executive Dashboard'!$E$46:$E$57 (Gross Profit)
 * 
 * 2. Chart 2: Native Excel 2D Pie Chart (<c:pieChart>)
 *    - Category labels: 'Executive Dashboard'!$I$46:$I$50 (Top 5 Categories)
 *    - Values: 'Executive Dashboard'!$K$46:$K$50 (Revenue)
 *    - Native interactive pie slices with percentage data labels!
 * 
 * 3. Chart 3: Native Horizontal Clustered Bar Chart (<c:barChart barDir="bar">)
 *    - Category labels: 'Executive Dashboard'!$I$29:$I$32 (Regions)
 *    - Series 1: 'Executive Dashboard'!$K$29:$K$32 (Actual Rev)
 *    - Series 2: 'Executive Dashboard'!$L$29:$L$32 (Quota Target)
 *    - Side-by-side horizontal bars comparing Actual vs Target!
 * 
 * 4. Chart 4: Native Donut Chart (<c:doughnutChart holeSize="65">)
 *    - Category labels: 'Executive Dashboard'!$I$56:$I$59 (Sales Channels)
 *    - Values: 'Executive Dashboard'!$K$56:$K$59 (Channel Revenue)
 *    - Native interactive donut ring with center hole and percentage callouts!
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
  const endMonthRow = startMonthRow + mCount - 1;

  const topCats = categorySummaries.slice(0, 5);
  const cCount = topCats.length;
  const startCatRow = 46;
  const endCatRow = startCatRow + cCount - 1;

  const regions = regionalPerformance.slice(0, 4);
  const rCount = regions.length;
  const startRegRow = 29;
  const endRegRow = startRegRow + rCount - 1;

  // Channels for Donut Chart
  const totalRev = kpi.totalRevenue;
  const channelList = [
    { name: 'Direct Enterprise', rev: Math.round(totalRev * 0.42), color: '0284C7' },
    { name: 'Partner Ecosystem', rev: Math.round(totalRev * 0.28), color: '10B981' },
    { name: 'Inside Sales', rev: Math.round(totalRev * 0.18), color: '6366F1' },
    { name: 'Online Enterprise', rev: Math.round(totalRev * 0.12), color: 'F59E0B' },
  ];

  // -------------------------------------------------------------
  // 1. CHART 1: NATIVE COLUMN RUN-RATE CHART (chart1.xml)
  // -------------------------------------------------------------
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
        <c:axId val="11101"/>
        <c:axId val="11102"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="11101"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="11102"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="11102"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="F1F5F9"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="11101"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="b"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // -------------------------------------------------------------
  // 2. CHART 2: NATIVE EXCEL PIE CHART (chart2.xml)
  // -------------------------------------------------------------
  const pieColors = ['0284C7', '10B981', '6366F1', 'F59E0B', 'EC4899'];

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
              <a:t>Revenue Contribution by Product Category (Native Pie Chart)</a:t>
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
              <c:f>'Executive Dashboard'!$K$45</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Gross Revenue</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          ${topCats.map((_, i) => `
          <c:dPt>
            <c:idx val="${i}"/>
            <c:spPr>
              <a:solidFill><a:srgbClr val="${pieColors[i % pieColors.length]}"/></a:solidFill>
              <a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln>
            </c:spPr>
          </c:dPt>`).join('')}
          <c:cat>
            <c:strRef>
              <c:f>'Executive Dashboard'!$I$${startCatRow}:$I$${endCatRow}</c:f>
              <c:strCache>
                <c:ptCount val="${cCount}"/>
                ${topCats.map((c, i) => `<c:pt idx="${i}"><c:v>${escapeXml(c.category)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$K$${startCatRow}:$K$${endCatRow}</c:f>
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

  // -------------------------------------------------------------
  // 3. CHART 3: NATIVE HORIZONTAL BAR CHART (chart3.xml)
  // -------------------------------------------------------------
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
              <a:t>Regional Actual Revenue vs Quota Target (Horizontal Bar Chart)</a:t>
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
              <c:f>'Executive Dashboard'!$K$28</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Actual Rev</c:v></c:pt></c:strCache>
            </c:strRef>
          </c:tx>
          <c:spPr>
            <a:solidFill><a:srgbClr val="059669"/></a:solidFill>
            <a:ln w="9525"><a:solidFill><a:srgbClr val="047857"/></a:solidFill></a:ln>
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
              <c:f>'Executive Dashboard'!$L$28</c:f>
              <c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Quota Target</c:v></c:pt></c:strCache>
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
        <c:gapWidth val="130"/>
        <c:overlap val="0"/>
        <c:axId val="11301"/>
        <c:axId val="11302"/>
      </c:barChart>
      <c:catAx>
        <c:axId val="11301"/>
        <c:scaling><c:orientation val="maxMin"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="l"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="11302"/>
        <c:crosses val="autoZero"/>
        <c:auto val="1"/>
        <c:lblAlgn val="ctr"/>
        <c:lblOffset val="100"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="11302"/>
        <c:scaling><c:orientation val="minMax"/></c:scaling>
        <c:delete val="0"/>
        <c:axPos val="b"/>
        <c:majorGridlines>
          <c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="F1F5F9"/></a:solidFill></a:ln></c:spPr>
        </c:majorGridlines>
        <c:numFmt formatCode="$#,##0" sourceLinked="0"/>
        <c:majorTickMark val="none"/>
        <c:minorTickMark val="none"/>
        <c:tickLblPos val="nextTo"/>
        <c:crossAx val="11301"/>
        <c:crosses val="autoZero"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="b"/>
      <c:layout/>
      <c:overlay val="0"/>
    </c:legend>
    <c:plotVisOnly val="1"/>
    <c:dispBlanksAs val="gap"/>
    <c:showDLblsOverMax val="0"/>
  </c:chart>
</c:chartSpace>`;

  // -------------------------------------------------------------
  // 4. CHART 4: NATIVE DONUT CHART (chart4.xml)
  // -------------------------------------------------------------
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
              <c:f>'Executive Dashboard'!$K$55</c:f>
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
              <c:f>'Executive Dashboard'!$I$56:$I$59</c:f>
              <c:strCache>
                <c:ptCount val="4"/>
                ${channelList.map((ch, i) => `<c:pt idx="${i}"><c:v>${escapeXml(ch.name)}</c:v></c:pt>`).join('')}
              </c:strCache>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>'Executive Dashboard'!$K$56:$K$59</c:f>
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

  // -------------------------------------------------------------
  // 5. DRAWINGS XML (xl/drawings/drawing1.xml)
  // -------------------------------------------------------------
  const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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

  // -------------------------------------------------------------
  // 6. DRAWINGS RELATIONSHIPS (xl/drawings/_rels/drawing1.xml.rels)
  // -------------------------------------------------------------
  const drawingRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdChart1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/>
  <Relationship Id="rIdChart2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart2.xml"/>
  <Relationship Id="rIdChart3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart3.xml"/>
  <Relationship Id="rIdChart4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart4.xml"/>
</Relationships>`;

  zip.file('xl/charts/chart1.xml', chart1Xml);
  zip.file('xl/charts/chart2.xml', chart2Xml);
  zip.file('xl/charts/chart3.xml', chart3Xml);
  zip.file('xl/charts/chart4.xml', chart4Xml);
  zip.file('xl/drawings/drawing1.xml', drawingXml);
  zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRelsXml);

  // -------------------------------------------------------------
  // 7. UPDATE SHEET1 RELATIONSHIPS (xl/worksheets/_rels/sheet1.xml.rels)
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 8. UPDATE SHEET1.XML (xl/worksheets/sheet1.xml)
  // -------------------------------------------------------------
  let sheet1Xml = await zip.file('xl/worksheets/sheet1.xml')?.async('string');
  if (sheet1Xml && !sheet1Xml.includes('<drawing')) {
    sheet1Xml = sheet1Xml.replace(
      '</worksheet>',
      `<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rIdDrawing1"/></worksheet>`
    );
    zip.file('xl/worksheets/sheet1.xml', sheet1Xml);
  }

  // -------------------------------------------------------------
  // 9. UPDATE [Content_Types].xml
  // -------------------------------------------------------------
  let contentTypes = await zip.file('[Content_Types].xml')?.async('string');
  if (contentTypes) {
    let updatedContentTypes = contentTypes;
    const overrides = [
      '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>',
      '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart2.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart3.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
      '<Override PartName="/xl/charts/chart4.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>',
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
