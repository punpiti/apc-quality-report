# APC quality report

รายงานภาษาไทยเรื่องความสัมพันธ์ระหว่างค่าตีพิมพ์บทความ (APC) กับการอ้างอิง จำนวนผลงาน Q ที่คำนวณจาก OpenAlex และบัญชีวารสาร Norway, JUFO และ ABDC

Live report: https://urban.cpe.ku.ac.th/apc-quality-report.html

ข้อมูลวารสาร 15,176 แห่ง ดึงเมื่อ 14 ตุลาคม 2026 รายงานมีข้อสรุปผู้บริหารภาษาง่าย ตัวเลือกสาขา และอภิธานศัพท์ รวมถึงความต่างระหว่าง Q, Top 10% / Tier 1 และ TCI

## Files

- `src/content/report/`: ต้นฉบับข้อความและกราฟ React พร้อม CSS
- `src/theme.css`: ธีมของรายงาน
- `data/report_snapshot.json`: ข้อมูลและที่มาซึ่งใช้ในรายงานฉบับปัจจุบัน
- `data/*.csv`: ข้อมูลวารสารและตารางผลวิเคราะห์
- `analysis/fetch_analyze_openalex.py`: สคริปต์ดึงข้อมูลและคำนวณผล
- `site/apc-quality-report.html`: ไฟล์เว็บสมบูรณ์ที่ deploy แล้ว เปิดจากเครื่องได้
- `scripts/`: สร้างรายงานและเพิ่ม Google Analytics
- `DEPLOYMENT.md`: วิธีอัปเดตไฟล์รายงานและเส้นทางเว็บ

## Build

ใช้ Node.js และ Data Analytics plugin รุ่น 1.0.11 ของ Codex ซึ่งมี runtime สำหรับรายงานและกราฟ สคริปต์นี้เก็บ build ชั่วคราวไว้นอก repo เพื่อเลี่ยง build cache ใน OneDrive

```bash
node scripts/build-report.mjs
```

หากติดตั้ง plugin ไว้ที่อื่น ให้ตั้ง `DATA_ANALYTICS_PLUGIN_ROOT` เป็น directory ของ plugin ที่มี `scripts/data-app.mjs` และ `scripts/prepare-data-app.mjs`

ผลลัพธ์เขียนลง `site/apc-quality-report.html` พร้อม Google Analytics รหัส `G-BWX7PFH4XM` ซึ่งเป็นรหัสเดียวกับหน้าแรกของ urban.cpe.ku.ac.th การ build อย่างเดียวไม่ deploy ขึ้นเว็บ

## Re-run analysis

ใช้ Python environment ที่มี NumPy, pandas, requests และ SciPy โดยสร้าง environment ไว้นอก OneDrive

```bash
python analysis/fetch_analyze_openalex.py
```

ผลการรันใหม่จะอยู่ใน `analysis/` และ raw API cache อยู่ใน `/var/tmp/openalex-apc-quality-20261014` สคริปต์ใช้ cache ที่มีอยู่ ถ้าจะเปลี่ยนวันอ้างอิงหรือข้อมูล ให้ตรวจและเลือก cache ที่จะใช้ก่อนรัน

การวิเคราะห์ใหม่ต้องทบทวนตัวเลข ข้อสรุป และวันที่ในต้นฉบับรายงานด้วย ก่อนเปลี่ยน `data/report_snapshot.json` และสร้างไฟล์เว็บใหม่

## Interpretation

ผลเป็นความสัมพันธ์ระดับวารสาร และยังไม่พิสูจน์สาเหตุของราคา APC ตัวเลข Q ในรายงานคำนวณจาก OpenAlex ภายในสาขา จึงใช้แทน Q ของ Scopus/JCR หรือ Tier 1 ตามประกาศทุนไม่ได้ ราคาเป็นราคาประกาศ ซึ่งอาจต่างจากเงินที่ผู้เขียนจ่ายจริง

Repository นี้เก็บต้นฉบับที่เขียนสำหรับรายงานและไฟล์เว็บที่เผยแพร่แล้ว การสร้างเว็บใหม่ใช้ runtime จาก plugin ที่ติดตั้งอยู่ในเครื่อง
