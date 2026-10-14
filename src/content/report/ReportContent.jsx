import React, { useState } from "react";

import {
  DataComponent,
  EvidenceChart,
  ReportSection,
  RichNarrative,
  SegmentedControl,
  useDataApp,
} from "../../data-app-public.jsx";
import { en } from "./report-en.js";

const sourcePreviews = {
  "https://help.openalex.org/data/sources/": {
    title: "Sources Overview",
    summary: "OpenAlex explains source-level APC coverage, OA flags, journal types, and APC limitations.",
    source: "OpenAlex Help Center",
    date: "2026-10-10",
    approvedForReport: true,
  },
  "https://help.openalex.org/data/common-attributes/": {
    title: "Common attributes",
    summary: "Definitions for 2-year mean citedness, h-index, i10-index, citation counts, and update timestamps.",
    source: "OpenAlex Help Center",
    approvedForReport: true,
  },
  "https://help.openalex.org/data/source-lists/": {
    title: "Source lists",
    summary: "Definitions and editions for CWTS Core, DOAJ, MEDLINE, Norway, JUFO, ABDC, and other journal lists.",
    source: "OpenAlex Help Center",
    date: "2026-10-09",
    approvedForReport: true,
  },
  "https://kanalregister.hkdir.no/en/informasjonsartikler/levels-and-changes-in-levels": {
    title: "Norwegian Register levels",
    summary: "HK-dir defines levels 0, 1, and 2 for approved academic publication channels in the Norwegian Register.",
    source: "Norwegian Directorate for Higher Education and Skills",
    date: "2025-11-06",
    approvedForReport: true,
  },
  "https://julkaisufoorumi.fi/en/publication-forum": {
    title: "Publication Forum (JUFO)",
    summary: "The Finnish Publication Forum explains the purpose, scope, expert panels, and responsible use of JUFO levels.",
    source: "Federation of Finnish Learned Societies",
    date: "2026-01-13",
    approvedForReport: true,
  },
  "https://julkaisufoorumi.fi/en/faq-0": {
    title: "JUFO frequently asked questions",
    summary: "The official FAQ documents the 2027 removal of JUFO level 3 and explains appropriate uses of the classification.",
    source: "Federation of Finnish Learned Societies",
    approvedForReport: true,
  },
  "https://abdc.edu.au/abdc-journal-quality-list/": {
    title: "ABDC Journal Quality List",
    summary: "The official ABDC page provides the 2025 list and review materials for business and related disciplines.",
    source: "Australian Business Deans Council",
    approvedForReport: true,
  },
  "https://doaj.org/apply/guide/": {
    title: "DOAJ application guide",
    summary: "DOAJ describes the transparency and open-access criteria required for journals to be indexed.",
    source: "Directory of Open Access Journals",
    approvedForReport: true,
  },
  "https://www.nlm.nih.gov/medline/medline_journal_selection.html": {
    title: "Journal Selection for MEDLINE",
    summary: "The U.S. National Library of Medicine explains the scientific and editorial review used to select MEDLINE journals.",
    source: "U.S. National Library of Medicine",
    approvedForReport: true,
  },
};

const correlationSpec = {
  type: "horizontalBar", x: "metric_label", y: "spearman_rho", xLabel: "ความสัมพันธ์กับราคา: ใกล้ 1 = เรียงสูงขึ้นด้วยกันชัดกว่า",
  valueDecimals: 2, colors: { spearman_rho: "var(--chart-1)" },
};
const quartileSpec = {
  type: "bar", x: "group", y: "median_apc_usd", yLabel: "Median APC (USD)",
  currency: "USD", valueDecimals: 0, colors: { median_apc_usd: "var(--chart-2)" },
};
const curatedSpec = {
  type: "horizontalBar", x: "display_group", y: "median_apc_usd", xLabel: "Median APC (USD)",
  currency: "USD", valueDecimals: 0, colors: { median_apc_usd: "var(--chart-3)" },
};
const fieldSpec = {
  type: "horizontalBar", x: "field_label", y: "spearman_rho",
  xLabel: "Spearman ρ: APC vs 2-year mean citedness", valueDecimals: 2,
  colors: { spearman_rho: "var(--chart-4)" },
};

const fieldLabels = {
  "Agricultural and Biological Sciences": "เกษตรและชีววิทยา",
  "Arts and Humanities": "ศิลปศาสตร์และมนุษยศาสตร์",
  "Biochemistry, Genetics and Molecular Biology": "ชีวเคมี พันธุศาสตร์ และชีววิทยาโมเลกุล",
  "Business, Management and Accounting": "ธุรกิจ การจัดการ และการบัญชี",
  Chemistry: "เคมี",
  "Computer Science": "วิทยาการคอมพิวเตอร์",
  "Decision Sciences": "วิทยาการตัดสินใจ",
  Dentistry: "ทันตแพทยศาสตร์",
  "Earth and Planetary Sciences": "วิทยาศาสตร์โลกและดาวเคราะห์",
  Economics: "เศรษฐศาสตร์",
  "Economics, Econometrics and Finance": "เศรษฐศาสตร์ เศรษฐมิติ และการเงิน",
  Energy: "พลังงาน",
  Engineering: "วิศวกรรมศาสตร์",
  "Environmental Science": "วิทยาศาสตร์สิ่งแวดล้อม",
  "Health Professions": "วิชาชีพสุขภาพ",
  "Immunology and Microbiology": "ภูมิคุ้มกันวิทยาและจุลชีววิทยา",
  "Materials Science": "วัสดุศาสตร์",
  Mathematics: "คณิตศาสตร์",
  Medicine: "แพทยศาสตร์",
  Neuroscience: "ประสาทวิทยาศาสตร์",
  Nursing: "พยาบาลศาสตร์",
  "Pharmacology, Toxicology and Pharmaceutics": "เภสัชวิทยา พิษวิทยา และเภสัชกรรม",
  "Physics and Astronomy": "ฟิสิกส์และดาราศาสตร์",
  Psychology: "จิตวิทยา",
  "Social Sciences": "สังคมศาสตร์",
  Veterinary: "สัตวแพทยศาสตร์",
};

const usd = (value) => `$${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const number = (value) => Number(value || 0).toLocaleString("en-US");
const metricLabels = {
  "h-index": "h-index",
  "i10-index": "i10-index",
  "Lifetime citations": "อ้างอิงสะสม",
  "Works count": "จำนวนผลงาน",
  "2-year mean citedness": "อ้างอิงเฉลี่ยสองปี",
};

export function ReportContent() {
  const [language, setLanguage] = useState("en");
  const thai = language === "th";
  const text = (english, th) => thai ? th : english;
  const narrativeId = (id) => thai ? `${id}:th` : id;
  const { reviewedRows, canEdit, mode, appTitle, setAppTitle } = useDataApp();
  const overviewRows = reviewedRows("overview");
  const [overview] = overviewRows;
  const allCorrelations = reviewedRows("correlations");
  const correlations = allCorrelations
    .filter((row) => row.population.startsWith("All known"))
    .map((row) => ({ ...row, metric_label: thai ? metricLabels[row.metric] ?? row.metric : row.metric }))
    .sort((a, b) => b.spearman_rho - a.spearman_rho);
  const quartiles = [...reviewedRows("quartiles")].sort((a, b) => a.group.localeCompare(b.group));
  const curatedRows = reviewedRows("curated_lists");
  const curated = curatedRows
    .filter((row) => ["Norwegian Register level", "JUFO level", "ABDC rating"].includes(row.grouping))
    .map((row) => ({
      ...row,
      display_group: row.grouping === "ABDC rating"
        ? `ABDC ${row.group}`
        : row.grouping === "JUFO level" ? `JUFO ${row.group}` : `Norway ${row.group}`,
    }))
    .sort((a, b) => a.median_apc_usd - b.median_apc_usd);
  const fieldRows = reviewedRows("field_correlations");
  const fields = fieldRows.filter((row) => row.n >= 250)
    .map((row) => ({ ...row, field_label: thai ? fieldLabels[row.field] ?? row.field : row.field }))
    .sort((a, b) => a.spearman_rho - b.spearman_rho);
  const executiveSummary = thai
    ? `วารสารที่ค่าตีพิมพ์แพงกว่ามักมีผลงานที่ถูกอ้างอิงมากสะสมอยู่มากกว่า แต่ความสัมพันธ์กับการอ้างอิงของงานช่วงสองปีอ่อนกว่า ผลจากวารสาร ${number(overview?.journals)} แห่งให้ภาพดังนี้

- ตัวแปรที่สัมพันธ์กับราคาชัดที่สุดเมื่อดูทีละตัวคือ h-index หมายถึงวารสารมีผลงานที่ถูกอ้างอิงมากอยู่มากเพียงใด ค่าความสัมพันธ์กับราคาเท่ากับ 0.64
- วารสารที่มียอดอ้างอิงสะสมมาก หรือมีจำนวนผลงานมาก ก็มักมีราคาสูงกว่าเช่นกัน ค่าความสัมพันธ์เท่ากับ 0.63 และ 0.55 ตามลำดับ จึงเห็นว่าราคาเกี่ยวข้องกับผลงานสะสมและขนาดของวารสารด้วย
- หากดูการอ้างอิงเฉลี่ยของงานช่วงสองปี ความสัมพันธ์กับราคาเหลือ 0.34 วารสารแพงจึงไม่ได้มีงานช่วงล่าสุดที่ถูกอ้างอิงมากกว่าอย่างชัดเจนทุกแห่ง
- เมื่อแบ่งวารสารตามการอ้างอิงภายในสาขา กลุ่มบนสุด หรือ Q1 มีราคากลาง ${usd(3280)} เทียบกับ ${usd(1500)} ในกลุ่มล่างสุด หรือ Q4 ราว 2.2 เท่า ส่วนระดับ Norway, JUFO และ ABDC ที่สูงกว่ามีราคากลางสูงกว่าประมาณ 500–600 ดอลลาร์
- เมื่อนำหลายตัวแปรมาดูพร้อมกัน การอ้างอิงของงานช่วงสองปียังสัมพันธ์กับราคาสูง ส่วน h-index เปลี่ยนเป็นความสัมพันธ์ลบเล็กน้อย จึงยังสรุปไม่ได้ว่า h-index เป็นสาเหตุที่ทำให้แพง รายงานนี้ยังไม่ได้วัดต้นทุนและนโยบายตั้งราคาของสำนักพิมพ์`
    : en.summary(number(overview?.journals));
  const coverageRows = reviewedRows("coverage");
  const adjustedRows = reviewedRows("adjusted_model");
  const allSources = {
    overview: overviewRows,
    correlations: allCorrelations,
    quartiles,
    curated_lists: curatedRows,
    field_correlations: fieldRows,
    adjusted_model: adjustedRows,
    coverage: coverageRows,
  };

  return (
    <article className="report-content" lang={language} aria-label="OpenAlex APC and journal quality report">
      <header className="report-hero">
        <div className="report-language">
          <SegmentedControl ariaLabel="Report language" value={language} onChange={setLanguage}
            options={[{ value: "en", label: "English" }, { value: "th", label: "ไทย" }]} />
        </div>
        <div className="report-eyebrow">OPENALEX · 15,176 JOURNALS · DATA THROUGH 13 OCT 2026</div>
        <h1
          data-data-app-title
          contentEditable={!thai && canEdit && mode === "edit"}
          suppressContentEditableWarning
          aria-label={!thai && canEdit && mode === "edit" ? "Edit report heading" : undefined}
          onBlur={!thai && canEdit && mode === "edit"
            ? (event) => setAppTitle(event.currentTarget.textContent.trim() || appTitle)
            : undefined}
          onKeyDown={canEdit && mode === "edit" ? (event) => {
            if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); }
          } : undefined}
        >{thai ? "APC สูงสัมพันธ์กับตัวชี้วัดการอ้างอิง แต่ราคาไม่ใช่คะแนนคุณภาพ" : appTitle}</h1>
        <RichNarrative
          id={narrativeId("apc-report:description")} className="report-deck" label="Edit report introduction"
          value={text(en.introduction, "เปรียบเทียบค่าตีพิมพ์ที่วารสารประกาศเรียกเก็บต่อบทความ (APC) กับการอ้างอิง จำนวนผลงาน และระดับจัดอันดับ เพื่อดูว่าวารสารราคาแพงมีลักษณะอย่างไร")}
        />
      </header>

      <ReportSection
        id="apc-executive-summary" title={text("Executive summary", "ข้อสรุปสำหรับผู้บริหาร")} queryId="overview"
        queryIds={["overview", "correlations", "quartiles", "curated_lists", "field_correlations", "adjusted_model"]}
        sourceRowsByQuery={{ overview: overviewRows, correlations: allCorrelations, quartiles,
          curated_lists: curatedRows, field_correlations: fieldRows, adjusted_model: adjustedRows }}
        className="report-summary"
      >
        <RichNarrative
          id={narrativeId("apc-executive-summary:body")} className="report-summary-lead" label="Edit executive summary"
          value={executiveSummary}
        />
      </ReportSection>

      <DataComponent
        id="apc-key-metrics" title={text("Dataset at a glance", "ภาพรวมข้อมูล")} queryId="overview" kind="custom"
        displayRows={overviewRows} sourceRows={overviewRows}
        description={text("Advertised APC list prices converted to USD by OpenAlex", "ค่าราคาเป็น list price ปัจจุบันที่ OpenAlex แปลงเป็น USD")}
      >
        <div className="report-facts" data-reviewed-rows>
          <div className="fact-card"><span>{text("Journals", "วารสาร")}</span><strong>{number(overview?.journals)}</strong><small>{text("with recorded APCs", "มี APC ระบุไว้")}</small></div>
          <div className="fact-card"><span>{text("Median APC", "APC มัธยฐาน")}</span><strong>{usd(overview?.median_apc_usd)}</strong><small>IQR {usd(overview?.apc_p25_usd)}–{usd(overview?.apc_p75_usd)}</small></div>
          <div className="fact-card"><span>APC = USD 0</span><strong>{number(overview?.zero_apc_journals)}</strong><small>{text("recorded as no charge", "บันทึกว่าไม่มีค่าธรรมเนียม")}</small></div>
          <div className="fact-card"><span>{text("Highest recorded APC", "APC สูงสุด")}</span><strong>{usd(overview?.apc_max_usd)}</strong><small>{text("maximum in this dataset", "ค่าที่พบในข้อมูล")}</small></div>
        </div>
      </DataComponent>

      <section className="report-section">
        <ReportSection
          id="apc-interpretation" title={text("Measures associated with higher fees", "ค่าตีพิมพ์แพงสัมพันธ์กับตัวแปรใดบ้าง")} queryId="correlations"
          queryIds={["correlations", "adjusted_model"]}
          sourceRowsByQuery={{ correlations: allCorrelations, adjusted_model: adjustedRows }} showHeading={false}
        >
          <RichNarrative
            id={narrativeId("apc-interpretation:body")} className="report-analysis" label="Edit correlation interpretation"
            value={text(en.interpretation, `## ค่าตีพิมพ์แพงสัมพันธ์กับตัวแปรใดบ้าง

เมื่อเปรียบเทียบวารสารทั้งหมดโดยดูทีละตัวแปร วารสารที่มีตัวเลขเหล่านี้สูงมักมีค่าตีพิมพ์สูงด้วย แต่ความชัดของแนวโน้มต่างกัน

- h-index บอกว่ามีผลงานที่ถูกอ้างอิงมากสะสมอยู่มากเพียงใด วารสารที่ค่านี้สูงมักมีราคาสูง สัมพันธ์ชัดที่สุดในห้าตัวแปรนี้ (0.64)
- การอ้างอิงสะสมทั้งหมด บอกว่างานทั้งหมดของวารสารถูกอ้างอิงรวมกันกี่ครั้ง วารสารที่ยอดสะสมมากมักมีราคาสูง (0.63)
- i10-index บอกว่ามีผลงานกี่เรื่องที่ถูกอ้างอิงอย่างน้อย 10 ครั้ง วารสารที่มีผลงานกลุ่มนี้มากมักมีราคาสูง (0.61)
- จำนวนผลงานทั้งหมด บอกว่าวารสารมีงานตีพิมพ์สะสมกี่เรื่อง วารสารที่มีผลงานมากมักมีราคาสูงกว่า (0.55)
- การอ้างอิงเฉลี่ยของงานช่วงสองปี บอกว่างานในช่วงสองปีถูกอ้างอิงเฉลี่ยมากเพียงใด วารสารที่ค่านี้สูงมีแนวโน้มราคาสูงด้วย แต่ความสัมพันธ์อ่อนกว่าสี่ตัวแปรแรก (0.34)

ตัวเลขในวงเล็บเป็นค่าความสัมพันธ์ของอันดับ หรือ Spearman ρ ถ้าเรียงวารสารจากราคาถูกไปแพง ตัวเลขนี้บอกว่าตัวแปรอีกฝั่งเรียงจากน้อยไปมากตามกันชัดแค่ไหน ค่าใกล้ 1 หมายถึงเรียงไปด้วยกันชัด ค่าใกล้ 0 หมายถึงแทบไม่ไปด้วยกัน ค่า 0.64 ไม่ได้แปลว่า APC เพิ่ม 64% หรืออธิบายคุณภาพได้ 64% และยังใช้คำนวณไม่ได้ว่า h-index เพิ่มหนึ่งหน่วยแล้วราคาจะเพิ่มกี่ดอลลาร์

### ตัวเลขสะสมสูงอาจสะท้อนขนาดและอายุวารสารด้วย

วารสารที่ตีพิมพ์มานานและมีผลงานมากมีโอกาสสะสมการอ้างอิงได้มาก ในข้อมูลนี้ h-index สัมพันธ์กับจำนวนผลงานถึง 0.83 และวารสารที่เริ่มตีพิมพ์ก่อนมักมี h-index สูงกว่า ดังนั้นความสัมพันธ์ระหว่าง h-index กับราคาจึงปะปนกับขนาดและอายุของวารสาร

### เมื่อนำหลายตัวแปรมาดูพร้อมกัน ผลของ h-index เปลี่ยนไป

การวิเคราะห์เสริมเปรียบเทียบวารสารที่มีสาขา จำนวนผลงาน และลักษณะการเผยแพร่ใกล้เคียงกัน โดยใส่ตัวแปรเหล่านี้ในแบบจำลองเดียวกัน พบว่าการอ้างอิงเฉลี่ยของงานช่วงสองปียังสัมพันธ์กับราคาสูง ส่วน h-index กลับสัมพันธ์กับราคาต่ำลงเล็กน้อย ผลนี้แสดงว่าค่า 0.64 ในการดูทีละตัวแปรยังใช้สรุปว่า h-index เป็นตัวกำหนดราคาไม่ได้

แบบจำลองยังไม่ครอบคลุมต้นทุน ชื่อเสียง และนโยบายตั้งราคาของสำนักพิมพ์ จึงตอบได้ว่าวารสารแพงมีลักษณะใดร่วมกัน แต่ยังตอบไม่ได้ว่าปัจจัยใดทำให้สำนักพิมพ์ตั้งราคาแพง`)}
          />
        </ReportSection>
        <EvidenceChart
          id="apc-correlation-chart" queryId="correlations"
          title={text("Accumulated measures have stronger price correlations than recent citations", "ตัวเลขสะสมสัมพันธ์กับราคาชัดกว่าการอ้างอิงของงานช่วงสองปี")}
          description={text("Longer bars indicate closer shared ordering with price. Each variable is examined separately; zero-price journals are included.", "แท่งยาว = ราคาและตัวแปรนั้นเรียงสูงขึ้นด้วยกันชัดกว่า ดูทีละตัวแปร รวมวารสารที่ราคาเป็นศูนย์")}
          spec={{ ...correlationSpec, xLabel: text("Rank correlation with APC (Spearman ρ)", correlationSpec.xLabel) }} rows={correlations} sourceRows={allCorrelations} height={330}
        />
      </section>

      <section className="report-section">
        <ReportSection id="apc-quartile-section" title={text("The median fee for Q1 is about twice that for Q4", "Q1 มี APC มัธยฐานประมาณสองเท่าของ Q4")}
          queryId="quartiles" sourceRows={quartiles} showHeading={false}>
          <RichNarrative
            id={narrativeId("apc-quartile-section:body")} className="report-analysis" label="Edit quartile interpretation"
            value={text(en.quartiles, `## Q1 มี APC มัธยฐานประมาณสองเท่าของ Q4

รายงานแบ่งวารสารในแต่ละสาขาออกเป็นสี่กลุ่ม โดยเรียงตามการอ้างอิงเฉลี่ยของงานช่วงสองปี Q1 คือกลุ่ม 25% แรกที่มีการอ้างอิงสูงสุด และ Q4 คือกลุ่ม 25% ท้าย เมื่อนำวารสารแต่ละกลุ่มมาดูราคา กลุ่ม Q1 มีราคากลาง ${usd(3280)} ต่อบทความ เทียบกับ ${usd(1500)} ใน Q4

ราคากลางของ Q2 และ Q3 อยู่ที่ ${usd(3160)} และ ${usd(2990)} จึงเห็นว่าราคาไม่ได้เพิ่มเท่ากันทุกระดับ ช่องว่างที่เด่นอยู่ระหว่างกลุ่มล่างสุดกับกลุ่มอื่น การอยู่ Q1 ก็ไม่ได้หมายความว่าทุกวารสารในกลุ่มต้องแพงกว่าทุกวารสารใน Q4

Q นี้คำนวณใหม่จากข้อมูล OpenAlex เพื่อเทียบวารสารภายในสาขาเดียวกัน จึงต่างจาก Q ที่แสดงใน Scopus/SCImago หรือ Journal Citation Reports ช่วงความไม่แน่นอน 95% ของราคากลางอยู่ที่ ${usd(3190)}–${usd(3290)} สำหรับ Q1 และ ${usd(1307)}–${usd(1680)} สำหรับ Q4`)}
          />
        </ReportSection>
        <EvidenceChart
          id="apc-quartile-chart" queryId="quartiles" title={text("Median APC by OpenAlex-derived within-field quartile", "APC มัธยฐานตาม OpenAlex field-adjusted quartile")}
          description={text("Q1 contains the top 25% by two-year mean citedness within each field", "Q1 = 25% แรกของ 2-year mean citedness ภายในสาขาเดียวกัน")}
          spec={quartileSpec} rows={quartiles} sourceRows={quartiles} height={320}
        />
      </section>

      <section className="report-section">
        <ReportSection id="apc-list-section" title={text("Higher curated levels have somewhat higher median fees", "Journal lists ที่เข้มขึ้นสัมพันธ์กับ APC ที่สูงขึ้นเล็กน้อย")}
          queryId="curated_lists" sourceRows={curatedRows} showHeading={false}>
          <RichNarrative
            id={narrativeId("apc-list-section:body")} className="report-analysis" label="Edit journal-list interpretation"
            value={text(en.lists, `## Journal lists ที่เข้มขึ้นสัมพันธ์กับ APC ที่สูงขึ้นเล็กน้อย

Norway คือทะเบียนช่องทางตีพิมพ์ของนอร์เวย์ JUFO คือระบบประเมินช่องทางตีพิมพ์ของฟินแลนด์ และ ABDC คือบัญชีวารสารด้านธุรกิจของออสเตรเลีย ทั้งสามระบบแสดงลำดับราคาโดยรวมตามระดับคัดสรร แต่ช่วงราคาของแต่ละระดับยังซ้อนทับกันมาก ความต่างของมัธยฐานอยู่ในหลักร้อยดอลลาร์: Norway level 2 สูงกว่า level 1 ราว ${usd(528)}, JUFO level 3 สูงกว่า level 1 ราว ${usd(635)} และ ABDC A* สูงกว่า C ราว ${usd(610)} รายละเอียดเกณฑ์และข้อจำกัดอยู่ในอภิธานศัพท์ท้ายรายงาน

วารสารใน CWTS Core มีราคากลาง ${usd(3137)} เทียบกับ ${usd(200)} สำหรับวารสารนอกบัญชี กลุ่มทั้งสองมีองค์ประกอบต่างกัน และ OpenAlex มีข้อมูลราคาไม่ครบทุกวารสาร ส่วนต่างนี้จึงยังบอกไม่ได้ว่าการเข้าบัญชีทำให้ราคาเพิ่มขึ้นเท่าไร`)}
          />
        </ReportSection>
        <EvidenceChart
          id="apc-list-chart" queryId="curated_lists" title={text("Median APC by Norway, JUFO, and ABDC level", "APC มัธยฐานในรายการ Norway, JUFO และ ABDC")}
          description={text("Compare levels within each system; criteria and disciplinary coverage differ across systems", "แต่ละระบบมีเกณฑ์และขอบเขตสาขาต่างกัน จึงควรอ่านแนวโน้มภายในระบบ")}
          spec={curatedSpec} rows={curated} sourceRows={curatedRows} height={470}
        />
      </section>

      <section className="report-section">
        <ReportSection id="apc-field-section" title={text("The price–citation relationship varies across fields", "ความสัมพันธ์ต่างกันมากระหว่างสาขา")}
          queryId="field_correlations" sourceRows={fieldRows} showHeading={false}>
          <RichNarrative
            id={narrativeId("apc-field-section:body")} className="report-analysis" label="Edit field interpretation"
            value={text(en.fields, `## ความสัมพันธ์ต่างกันมากระหว่างสาขา

ธุรกิจ การจัดการ และการบัญชีมีความสัมพันธ์ระหว่างค่าตีพิมพ์กับการอ้างอิงสองปีสูงสุดในกลุ่มสาขาที่มีวารสารอย่างน้อย 250 แห่ง โดยอยู่ที่ 0.61 ส่วนศิลปศาสตร์และมนุษยศาสตร์กับวิทยาการคอมพิวเตอร์อยู่ใกล้ 0.12–0.14 ผลรวมทุกสาขาจึงไม่เหมาะสำหรับใช้ทำนายวารสารรายชื่อหนึ่งโดยไม่ดูสาขา`)}
          />
        </ReportSection>
        <EvidenceChart
          id="apc-field-chart" queryId="field_correlations"
          title={text("APC and two-year mean citedness: comparison across fields", "ค่าตีพิมพ์กับการอ้างอิงสองปี เปรียบเทียบระหว่างสาขา")}
          description={text("Fields with at least 250 journals with recorded APCs", "แสดงสาขาที่มีวารสารอย่างน้อย 250 แห่งที่มีข้อมูล APC")}
          spec={fieldSpec} rows={fields} sourceRows={fieldRows} height={650}
        />
      </section>

      <ReportSection
        id="apc-glossary" title={text("Glossary and journal classification systems", "อภิธานศัพท์และระบบจัดอันดับวารสาร")} queryId="curated_lists"
        queryIds={["curated_lists", "overview", "correlations"]}
        sourceRowsByQuery={{ curated_lists: curatedRows, overview: overviewRows, correlations: allCorrelations }}
        showHeading={false} className="report-glossary"
      >
        <RichNarrative
          id={narrativeId("apc-glossary:body")} className="report-analysis" label="Edit glossary"
          sourcePreviews={sourcePreviews}
          value={text(en.glossary, `## อภิธานศัพท์และระบบจัดอันดับวารสาร

### Norway หรือ Norwegian Register

[Norwegian Register for Scientific Journals, Series and Publishers](https://kanalregister.hkdir.no/en/informasjonsartikler/levels-and-changes-in-levels) เป็นทะเบียนช่องทางตีพิมพ์ทางวิชาการที่ดูแลโดย Norwegian Directorate for Higher Education and Skills หรือ HK-dir คำว่า Norway ในกราฟจึงหมายถึงสถานะของวารสารในทะเบียนนี้ ไม่ได้หมายถึงประเทศที่ตั้งของวารสาร Level 1 คือช่องทางวิชาการที่ผ่านเกณฑ์รับรอง ส่วน Level 2 คือระดับสูงสุดและคัดสรรกว่า Level 0 คือช่องทางที่ยังไม่ผ่านเกณฑ์รับรอง รายงานเปรียบเทียบเฉพาะ Level 1 และ 2 ที่ OpenAlex ระบุไว้

### JUFO หรือ Publication Forum

[JUFO](https://julkaisufoorumi.fi/en/publication-forum) ย่อมาจาก Julkaisufoorumi เป็นระบบฟินแลนด์สำหรับจัดระดับวารสาร ชุดหนังสือ การประชุม และสำนักพิมพ์ คณะผู้เชี่ยวชาญแยกตามสาขาเป็นผู้ประเมิน รุ่นที่ OpenAlex ใช้ในรายงานนี้แบ่ง Level 1 เป็นระดับพื้นฐาน Level 2 เป็นระดับนำ และ Level 3 เป็นระดับสูงสุด การจัดระดับสะท้อนค่าเฉลี่ยของช่องทางตีพิมพ์และเหมาะกับการประเมินผลงานจำนวนมาก [ระบบ JUFO จะยกเลิก Level 3 ตั้งแต่ต้นปี 2027](https://julkaisufoorumi.fi/en/faq-0) ดังนั้นผลในรายงานเป็นภาพของบัญชีรุ่นปี 2026

### ABDC Journal Quality List

[ABDC Journal Quality List](https://abdc.edu.au/abdc-journal-quality-list/) จัดทำโดย Australian Business Deans Council และครอบคลุมธุรกิจ เศรษฐศาสตร์ การจัดการ ระบบสารสนเทศ และสาขาที่เกี่ยวข้อง รายการปี 2025 ใช้ความเห็นผู้เชี่ยวชาญร่วมกับ citation metrics และบัญชีจัดอันดับอื่น เกรดเรียงจาก A* ซึ่งเป็นกลุ่มสูงสุด ตามด้วย A, B และ C เกณฑ์ชี้นำของรอบปี 2025 กำหนด A* ราว 5–7% แรกของวารสารในแต่ละ Field of Research ส่วน C คือวารสารคุณภาพที่ได้รับการยอมรับในกลุ่มที่เหลือ ขอบเขตเฉพาะสาขาทำให้ ABDC ไม่ควรถูกเทียบตรงกับ quartile แบบครอบคลุมทุกศาสตร์

### Source list และ publication channel

*Source list* ใน OpenAlex คือรายชื่อวารสารที่องค์กรภายนอกดูแล OpenAlex จับคู่รายชื่อเหล่านี้กับ source ด้วย ISSN และบันทึกไว้ในตัวแปร listed_in คำว่า *publication channel* ครอบคลุมสถานที่เผยแพร่งาน เช่น วารสาร ชุดหนังสือ การประชุม หรือสำนักพิมพ์ การมีชื่ออยู่ใน list แสดงว่าผ่านเกณฑ์ของผู้ดูแลตามรุ่นข้อมูลที่ระบุ OpenAlex ไม่ได้รับรองความถูกต้องหรือคุณภาพของรายการเหล่านั้น

### CWTS Core, DOAJ และ MEDLINE

*CWTS Core* คือชุดแหล่งตีพิมพ์ทุกสาขาที่ Centre for Science and Technology Studies แห่ง Leiden University ใช้เป็นฐานของ Leiden Ranking Open Edition คำนี้ไม่ใช่ Web of Science Core Collection

*[DOAJ](https://doaj.org/apply/guide/)* หรือ Directory of Open Access Journals เป็นดัชนีวารสาร open access เต็มรูปแบบที่ผ่านเกณฑ์ด้านความโปร่งใส กระบวนการบรรณาธิการ และการเปิดเผยค่าธรรมเนียม การอยู่ใน DOAJ บอกสถานะและมาตรฐานการเผยแพร่แบบเปิด ไม่ได้เป็นอันดับ citation impact

*[MEDLINE](https://www.nlm.nih.gov/medline/medline_journal_selection.html)* เป็นฐานบรรณานุกรมของ U.S. National Library of Medicine สำหรับชีวการแพทย์และวิทยาศาสตร์ชีวภาพ วารสารผ่านการทบทวนด้านขอบเขต คุณภาพทางวิทยาศาสตร์ นโยบายบรรณาธิการ และการผลิต MEDLINE จึงเป็นรายการคัดสรรเฉพาะสาขา ไม่ใช่อันดับวารสารข้ามทุกศาสตร์

### APC, list price และรูปแบบ open access

*APC* ย่อมาจาก article processing charge หรือค่าธรรมเนียมการประมวลผลบทความที่เรียกเก็บเพื่อให้บทความเผยแพร่แบบ open access ค่าในรายงานเป็น *APC list price* ที่ประกาศและแปลงเป็นดอลลาร์สหรัฐ จำนวนที่ผู้เขียนจ่ายจริงอาจต่ำกว่านี้จาก waiver, ส่วนลด หรือข้อตกลงของสถาบัน

*Gold open access* หมายถึงบทความในวารสารที่เปิดให้อ่านทันทีทั้งหมด *Hybrid open access* หมายถึงบทความเปิดในวารสารแบบสมัครสมาชิกเมื่อผู้เขียนเลือกจ่าย APC ส่วน *diamond open access* คือวารสารเปิดที่ไม่เก็บ APC จากผู้เขียน ค่า APC=0 ใน OpenAlex บอกว่าระบบบันทึกราคาเป็นศูนย์ แต่ข้อมูลเพียงช่องนี้ยังไม่ยืนยันรูปแบบ diamond ได้ครบถ้วน

### h-index, i10-index และ citation metrics

*h-index* ของวารสารเท่ากับ h เมื่อวารสารมีบทความอย่างน้อย h เรื่องที่ถูกอ้างอิงเรื่องละอย่างน้อย h ครั้ง ตัวเลขนี้รวมทั้งผลกระทบและปริมาณงานสะสม วารสารเก่าหรือวารสารที่ตีพิมพ์มากจึงมีโอกาสได้ค่าสูงกว่า

*i10-index* คือจำนวนผลงานที่ได้รับการอ้างอิงอย่างน้อย 10 ครั้ง *Lifetime citations* คือจำนวนการอ้างอิงสะสมของผลงานทั้งหมด และ *works count* คือจำนวนผลงานที่ OpenAlex เชื่อมกับวารสาร ตัวชี้วัดทั้งสามไวต่ออายุและขนาดของวารสาร

*2-year mean citedness* ของ OpenAlex คือค่าเฉลี่ยการอ้างอิงต่อผลงานในหน้าต่างสองปี จึงเน้นผลงานร่วมสมัยกว่า h-index รายงานใช้ชื่อนี้แทนคำว่า impact factor เพราะสูตร แหล่งข้อมูล และกระบวนการนับต่างจาก Journal Impact Factor ของ Clarivate

### Q1–Q4 ในรายงานนี้

*Quartile* คือการแบ่งวารสารเป็นสี่กลุ่มตามลำดับค่า Q1 คือ 25% แรกและ Q4 คือ 25% ท้าย รายงานคำนวณ Q ใหม่จาก 2-year mean citedness ภายใน dominant OpenAlex field ของแต่ละวารสาร จึงเรียกว่า *OpenAlex-derived quartile* ค่า Q นี้ไม่ใช่ JCR quartile, Scopus quartile หรือ SCImago quartile

*Dominant OpenAlex field* คือสาขาหลักที่อนุมานจาก topic ซึ่งมีจำนวนผลงานของวารสารมากที่สุด วิธีนี้ให้กลุ่มสำหรับเปรียบเทียบภายในสาขา แต่ลดความซับซ้อนของวารสารสหสาขาให้เหลือเพียงสาขาเดียว

### T1 หรือ Tier 1 และความต่างจาก TCI

*Tier* แปลว่าระดับหรือกลุ่ม คำว่า T1 ต้องดูนิยามของหน่วยงานที่ใช้ ใน [ประกาศสนับสนุน APC ของ สวพ.มก. ปี 2026](https://www3.rdi.ku.ac.th/?p=96160) Tier 1 หมายถึงวารสาร 10% แรกของแต่ละสาขา โดยจัดอันดับด้วย CiteScore Percentile ใน Scopus

ถ้าสาขาหนึ่งมีวารสาร 100 แห่ง กลุ่ม Top 10% จะอยู่ประมาณ 10 อันดับแรก ส่วน Q1 ครอบคลุมประมาณ 25 อันดับแรก เมื่อใช้ตัวชี้วัด สาขา และปีเดียวกัน Top 10% จึงเป็นกลุ่มย่อยใน Q1 การเรียก T1 ไม่ได้หมายถึงการแบ่งวารสารเป็นสี่กลุ่มแบบ Q1–Q4 และไม่ได้ทำให้มีนิยาม T2–T4 ที่ใช้ร่วมกันทุกหน่วยงาน

*TCI Tier 1–3* หมายถึงกลุ่มคุณภาพวารสารของ Thai-Journal Citation Index Centre หรือศูนย์ดัชนีการอ้างอิงวารสารไทย ซึ่งใช้เกณฑ์ประเมินการดำเนินงานวารสารและคะแนนตาม [เกณฑ์ TCI รอบปี 2568–2572](https://tci-thailand.org/backend/download/Evaluation_5/EvaluationRound5.pdf) กลุ่มนี้ใช้เกณฑ์คนละชุดกับ Top 10% ของ Scopus การเห็นคำว่า Tier 1 จึงต้องระบุด้วยว่าเป็น Tier ของระบบใด

รายงานนี้ยังไม่ได้เชื่อมข้อมูล CiteScore Percentile หรือกลุ่ม TCI จึงยังไม่มีผลเปรียบเทียบ APC ของ T1 ตามสองระบบนี้ Q ที่คำนวณจาก OpenAlex ในรายงานก็ใช้แทน T1 ตามประกาศของ มก. ไม่ได้

### Spearman ρ, IQR และช่วงความไม่แน่นอน

*Spearman ρ* อ่านว่า Spearman rho เป็นค่าสหสัมพันธ์ของอันดับ มีค่าตั้งแต่ −1 ถึง 1 ค่าบวกหมายถึงสองตัวแปรมีแนวโน้มเรียงสูงขึ้นด้วยกัน ค่าใกล้ศูนย์หมายถึงลำดับมีความสัมพันธ์น้อย ค่านี้วัด association และไม่ระบุความเป็นเหตุเป็นผล

*Median* หรือมัธยฐานคือค่ากลางหลังเรียงข้อมูล *IQR* หรือ interquartile range คือช่วงตั้งแต่เปอร์เซ็นไทล์ที่ 25 ถึง 75 จึงครอบคลุมครึ่งกลางของข้อมูล *Bootstrap 95% interval* เกิดจากการสุ่มตัวอย่างซ้ำจากข้อมูลที่มีอยู่เพื่อบอกความไม่แน่นอนของค่าประมาณ ช่วงนี้ไม่ใช่ขอบเขตที่ APC ของวารสาร 95% ต้องตกอยู่ภายใน

### Fixed effects, robust standard errors และ sensitivity model

*Field fixed effects* คือการใส่ตัวแปรควบคุมสำหรับแต่ละสาขาในโมเดล เพื่อเปรียบเทียบความสัมพันธ์หลังหักความต่างเฉลี่ยระหว่างสาขา *HC1 robust standard errors* ปรับการคำนวณความไม่แน่นอนให้ทนต่อความแปรปรวนของเศษเหลือที่ไม่เท่ากัน ส่วน *sensitivity model* คือการวิเคราะห์เสริมเพื่อดูว่าทิศทางผลยังอยู่หรือไม่เมื่อเพิ่มตัวแปรควบคุม โมเดลเหล่านี้ช่วยตรวจความคงทนของ association แต่ไม่ได้เปลี่ยนข้อมูลเชิงสังเกตให้เป็นหลักฐานเชิงเหตุ`)}
        />
      </ReportSection>

      <ReportSection
        id="apc-methods-limitations" title={text("Methods and limitations", "วิธีวิเคราะห์และข้อจำกัด")} queryId="overview"
        queryIds={["overview", "correlations", "quartiles", "curated_lists", "field_correlations", "adjusted_model", "coverage"]}
        sourceRowsByQuery={allSources} showHeading={false} className="report-methods"
      >
        <RichNarrative
          id={narrativeId("apc-methods-limitations:body")} className="report-caveat" label="Edit methods and limitations"
          sourcePreviews={sourcePreviews}
          value={text(en.methods(number(overview?.journals)), `## วิธีวิเคราะห์และข้อจำกัด

### ข้อมูลและประชากร

ดึงข้อมูลจาก [OpenAlex Sources API](https://help.openalex.org/data/sources/) เมื่อ 14 ตุลาคม 2026 ด้วย cursor pagination ครบทุก source ที่ type=journal และมี apc_usd เท่ากับ 0 หรือมากกว่า 0 ได้ ${number(overview?.journals)} วารสาร ไม่มี OpenAlex ID ซ้ำ ค่า APC เป็นราคาโฆษณาปัจจุบันที่ OpenAlex แปลงเป็น USD จาก DOAJ และการ curate จึงไม่รวม waiver, discount, transformative agreement หรือจำนวนเงินที่ผู้เขียนจ่ายจริง

### Metric และ Q

ใช้ [2-year mean citedness, h-index, i10-index, lifetime citations และ works count](https://help.openalex.org/data/common-attributes/) จาก source object โดยตรง Q1–Q4 คำนวณใหม่จาก 2-year mean citedness ภายใน dominant OpenAlex field ของแต่ละวารสาร Q1 คือ 25% แรก ตัวแปร field อาศัย topic ที่มีจำนวนงานสูงสุด จึงอาจจำแนกวารสารสหสาขาหรือวารสารเก่าคลาดเคลื่อนได้

### สถิติ

ใช้ Spearman rank correlation เพราะ APC และ citation metrics เบ้มาก ค่ามัธยฐานราย quartile ใช้ bootstrap 2,000 ครั้งเพื่อสร้างช่วง 95% sensitivity model ใช้ log APC เฉพาะค่าบวก ควบคุม log(1+h-index), log(1+2-year mean citedness), log(1+works count), OA, DOAJ, CWTS Core และ field fixed effects พร้อม HC1 robust standard errors ตัวแปรต่อเนื่องทั้งสามถูกปรับให้มีค่าเฉลี่ยศูนย์และส่วนเบี่ยงเบนมาตรฐานหนึ่ง โมเดลนี้ช่วยตรวจความคงทนของ association แต่ไม่ระบุสาเหตุ

### Coverage และ selection

OpenAlex มี journal sources ทั้งหมด 217,114 แห่ง และ 88,583 แห่งมีผลงานล่าสุดในปี 2025–2026 ในกลุ่ม active ดังกล่าวมี APC ระบุเพียง 14,074 แห่ง หรือ 15.9% [OpenAlex ระบุเอง](https://help.openalex.org/data/sources/) ว่า APC coverage เอนเอียงไปทาง fully OA และครอบคลุม hybrid journal บางกว่า ผลจึงอธิบายวารสารที่มี APC record มากกว่าวารสารทั้งหมด

### รายชื่อคัดสรร

ใช้ membership จาก [OpenAlex source lists](https://help.openalex.org/data/source-lists/) ซึ่งเก็บรุ่นของ CWTS Core, DOAJ, MEDLINE, Norwegian Register, JUFO และ ABDC การอยู่ใน list เป็นคุณลักษณะเชิงคัดสรรที่หน่วยงานภายนอกกำหนด ไม่ใช่คะแนนคุณภาพที่ OpenAlex รับรอง

### ขอบเขตข้อสรุป

ผลทั้งหมดเป็นความสัมพันธ์ระดับวารสารในภาพตัดขวาง APC สูงอาจสะท้อนสำนักพิมพ์ สาขา โมเดล OA อายุ ขนาด ชื่อเสียง และอำนาจตั้งราคา หลักฐานนี้รองรับข้อสรุปว่า APC และ citation signals เคลื่อนไปในทิศทางเดียวกันโดยเฉลี่ย และไม่รองรับข้อสรุปว่าเพิ่ม APC แล้วคุณภาพสูงขึ้นหรือวารสารแพงกว่าดีกว่าเสมอ`)}
        />
      </ReportSection>
    </article>
  );
}
