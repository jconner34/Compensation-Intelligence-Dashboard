# Compensation Intelligence — Interactive HR Dashboard

A **GitHub Pages-ready compensation analytics portfolio project** built using **96 entirely fictional employee records**, **12 job classifications**, and **illustrative internal salary bands**. Built with vanilla HTML, CSS, and JavaScript: no subscriptions, API keys, or build step required.

## Features

- Dynamic filters for **department, location, role, and salary-range status**
- Five KPIs: population, average salary, average compa-ratio, below-range population, and modeled minimum correction cost
- Interactive salary distribution histogram and pay-position donut chart
- Department compa-ratio comparison to a 100% salary midpoint benchmark
- Role-level benchmarking table with correction exposure
- Searchable, paginated employee explorer and individual pay profile modal
- Context-aware executive recommendations and filtered CSV export
- Responsive layout with a dark sidebar and clean teal HR analytics visual identity

## Run locally

1. Download or clone this repository.
2. In the project directory run `python -m http.server 8000` (Windows may use `py -m http.server 8000`).
3. Visit **http://localhost:8000** in a browser.

> Opening `index.html` via `file://` may block local JSON loading in browsers. Use a web server or GitHub Pages.

## Publish to GitHub Pages

1. Create a **public** repository, e.g. `compensation-intelligence-dashboard`.
2. Upload `index.html`, `styles.css`, `app.js`, `data/compensation.json`, and this README to the **repository root**.
3. Go to **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. Your site will normally appear at `https://YOUR-USERNAME.github.io/compensation-intelligence-dashboard/` once Pages finishes deploying.

### Suggested portfolio description

> Designed and developed an interactive HR compensation dashboard using 96 synthetic employee records and 12 illustrative salary bands. Analyzed base salary distribution, compa-ratio, salary-range penetration, below-minimum exposure, role-level variation, and annualized correction-cost scenarios. Built intuitive filters, role comparisons, employee drill-downs, CSV exports, and decision-oriented executive recommendations using HTML, CSS, and JavaScript.

## Interpretation / definitions

| Measure | Definition |
|---|---|
| Compa-ratio | Base salary ÷ internal job midpoint |
| Range penetration | (Base salary − minimum) ÷ (maximum − minimum) |
| Below minimum | Base salary < job salary range minimum |
| Above maximum | Base salary > job salary range maximum |
| Cost to minimum | Σ max(0, salary range minimum − base salary) for filtered employees |
| Average salary | Arithmetic average of filtered employee base salaries |
| Average compa-ratio | Arithmetic average of individual employee compa-ratios; not average salary ÷ average midpoint |

### Responsible HR interpretation

These salary bands are **invented examples**, not published market survey benchmarks. Employees and other attributes are fully fictional. This is **not** a pay equity or discrimination determination. Before recommending any real compensation adjustments, validate job-level mapping and range design, geography, market pricing, performance, tenure, organizational policy, and any applicable laws. Correction costs exclude payroll taxes, benefits, timing effects, compression, and other ripple effects.

### Project files

```text
compensation-intelligence-dashboard/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── compensation.json
├── README.md
└── LICENSE
```

## Source workbook

The dataset was adapted from a separate demonstration workbook, `Compensation_Analytics_Portfolio.xlsx`, created with synthetic sample data. You can replace `data/compensation.json` with your own **authorized, de-identified** sample data while preserving the JSON shape. Do **not** publish actual employee compensation records.

## License

MIT — see [LICENSE](LICENSE).
