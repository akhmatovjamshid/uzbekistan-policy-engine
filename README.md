# Uzbekistan Economic Policy Engine

Interactive macroeconomic policy simulation platform for analyzing Uzbekistan's economy. Features 6 economic models with real-time visualization, multi-language support (EN/RU/UZ), and data export capabilities.

## Models

| Model | Description |
|-------|-------------|
| **QPM DSGE Simulator** | New-Keynesian small open economy model with monetary policy impulse responses |
| **GDP Nowcasting (DFM)** | Mixed-frequency Dynamic Factor Model with Kalman filter — 34 monthly indicators, 3-month GDP forecast |
| **Partial Equilibrium** | WTO accession trade impact analysis with WITS-computed tariff effects across HS codes |
| **Input-Output Model** | 136-sector Leontief framework (2022 data) — supply chain multipliers, sectoral linkages |
| **CGE 1-2-3 Model** | Computable General Equilibrium model for sectoral shock simulation (2021 data) |
| **Financial Programming** | IMF 4-sector framework for macroeconomic consistency checks |

## Getting Started

This is a static web application — no server or build tools required.

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Navigate between models using the sidebar or model cards

### For Development

- Each model is self-contained in its own folder with an `index.html`
- Shared utilities are in `shared/report-engine.js`
- Data files (`*_data.js`, `*_data.json`) are auto-generated from R scripts

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Charts:** Chart.js 4.4.0
- **Export:** jsPDF 2.5.1 (PDF), XLSX 0.18.5 (Excel)
- **Modeling:** R (data processing and model computation)
- **Fonts:** Inter, JetBrains Mono (Google Fonts)

## Features

- 6 interactive economic models with real-time parameter adjustment
- Multi-language interface (English, Русский, Ўзбекча)
- Macro snapshot dashboard with key economic indicators
- GDP forecast chart with DFM nowcast integration
- International Organizations data page (2026 data)
- Export to CSV, PNG, and PDF
- Responsive design for desktop and mobile

## Data Sources

- Statistics Agency of Uzbekistan
- Central Bank of Uzbekistan
- World Integrated Trade Solution (WITS)
- Central Asian Economic Model (CAEM)
- Center for Economic Research & Reforms (CERR)

## License

All rights reserved.
