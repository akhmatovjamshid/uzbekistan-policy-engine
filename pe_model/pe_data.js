/* ====================================================================
   Partial Equilibrium Model Data — Uzbekistan WTO Accession Analysis
   Source: "ТЗВ 2022" + PE model (Excel), WITS methodology
   Coverage: HS Chapters 28-40 (Chemicals & Plastics, Section VI-VII)
   Base year: 2022 | Import values in thousands USD
   ================================================================== */

const PE_DATA = {

  meta: {
    title: "Partial Equilibrium Model — WTO Accession Impact",
    subtitle: "Chemicals & Plastics (HS 28–40), Uzbekistan",
    baseYear: 2022,
    methodology: "WITS Partial Equilibrium",
    currency: "thousand USD",
    totalImportHS2840: 4817472.9,   // total imports HS 28-40, thous USD
    fromWTO: 1634000,               // approx imports from WTO-MFN countries
    fromFTA: 1642000,               // approx imports from FTA countries (CIS)
    avgMFNRate: 7.2,                // % average weighted MFN tariff rate
    avgAppliedRate: 3.5,            // % after full liberalisation
    totalHS2840ImportUSD: 167.4,    // mln USD subject to duty change
    scenarios: [
      { id: 1, label: "Scenario 1", cut: 20, cutLabel: "−20% tariff cut" },
      { id: 2, label: "Scenario 2", cut: 50, cutLabel: "−50% tariff cut" },
      { id: 3, label: "Scenario 3", cut: 80, cutLabel: "−80% tariff cut (near-MFN)" }
    ]
  },

  // ── Sector data: HS chapters 28–40 ──────────────────────────────────
  // tradeEffect: computed trade effect (creation+diversion) for 20%/50%/80% cut
  // importValue: total imports 2022, thous USD
  // avgElasticity: average import demand elasticity for the chapter
  sectors: [
    {
      hs: "28", code: "HS 28",
      name: "Inorganic chemicals; compounds of precious metals, radioactive elements",
      nameShort: "Inorganic Chemicals",
      importValue: 131297.0,
      avgMFNRate: 4.5,
      avgAppliedRate: 2.0,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 149.9,  s50: 374.8,  s80: 599.6  },
      tradeEffect_pct: { s20: 0.11, s50: 0.29, s80: 0.46 }
    },
    {
      hs: "29", code: "HS 29",
      name: "Organic chemicals",
      nameShort: "Organic Chemicals",
      importValue: 261082.2,
      avgMFNRate: 3.2,
      avgAppliedRate: 1.2,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 163.8,  s50: 409.5,  s80: 655.2  },
      tradeEffect_pct: { s20: 0.06, s50: 0.16, s80: 0.25 }
    },
    {
      hs: "30", code: "HS 30",
      name: "Pharmaceutical products",
      nameShort: "Pharmaceuticals",
      importValue: 1584968.4,
      avgMFNRate: 0.8,
      avgAppliedRate: 0.3,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 61.4,   s50: 153.5,  s80: 245.6  },
      tradeEffect_pct: { s20: 0.004, s50: 0.01, s80: 0.02 }
    },
    {
      hs: "31", code: "HS 31",
      name: "Fertilizers",
      nameShort: "Fertilizers",
      importValue: 85377.5,
      avgMFNRate: 6.4,
      avgAppliedRate: 3.1,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 970.6,  s50: 2426.5, s80: 3882.4 },
      tradeEffect_pct: { s20: 1.14, s50: 2.84, s80: 4.55 }
    },
    {
      hs: "32", code: "HS 32",
      name: "Tanning/dyeing extracts; pigments, paints, varnishes, putties, inks",
      nameShort: "Paints & Dyes",
      importValue: 251476.3,
      avgMFNRate: 10.2,
      avgAppliedRate: 5.0,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 3917.2, s50: 9793.0, s80: 15668.8 },
      tradeEffect_pct: { s20: 1.56, s50: 3.89, s80: 6.23 }
    },
    {
      hs: "33", code: "HS 33",
      name: "Essential oils and resinoids; perfumery, cosmetic or toilet preparations",
      nameShort: "Essential Oils & Cosmetics",
      importValue: 246272.6,
      avgMFNRate: 8.5,
      avgAppliedRate: 4.0,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 2999.4, s50: 7498.5, s80: 11997.6 },
      tradeEffect_pct: { s20: 1.22, s50: 3.05, s80: 4.87 }
    },
    {
      hs: "34", code: "HS 34",
      name: "Soap, organic surface-active agents, washing preparations, lubricating preparations",
      nameShort: "Soap & Waxes",
      importValue: 153646.1,
      avgMFNRate: 10.8,
      avgAppliedRate: 5.2,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 2597.9, s50: 6494.8, s80: 10391.6 },
      tradeEffect_pct: { s20: 1.69, s50: 4.23, s80: 6.76 }
    },
    {
      hs: "35", code: "HS 35",
      name: "Albuminoidal substances; modified starches; glues; enzymes",
      nameShort: "Starches & Glues",
      importValue: 48671.2,
      avgMFNRate: 15.5,
      avgAppliedRate: 7.5,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 4232.3, s50: 10580.8, s80: 16929.2 },
      tradeEffect_pct: { s20: 8.70, s50: 21.74, s80: 34.79 }
    },
    {
      hs: "36", code: "HS 36",
      name: "Explosives; pyrotechnic products; matches; pyrophoric alloys",
      nameShort: "Explosives",
      importValue: 17415.3,
      avgMFNRate: 3.5,
      avgAppliedRate: 1.5,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 49.3,   s50: 123.3,  s80: 197.2  },
      tradeEffect_pct: { s20: 0.28, s50: 0.71, s80: 1.13 }
    },
    {
      hs: "37", code: "HS 37",
      name: "Photographic or cinematographic goods",
      nameShort: "Photographic Goods",
      importValue: 8471.1,
      avgMFNRate: 3.5,
      avgAppliedRate: 1.5,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 28.1,   s50: 70.3,   s80: 112.4  },
      tradeEffect_pct: { s20: 0.33, s50: 0.83, s80: 1.33 }
    },
    {
      hs: "38", code: "HS 38",
      name: "Miscellaneous chemical products",
      nameShort: "Other Chemicals",
      importValue: 389574.2,
      avgMFNRate: 4.2,
      avgAppliedRate: 1.8,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 751.8,  s50: 1879.5, s80: 3007.2 },
      tradeEffect_pct: { s20: 0.19, s50: 0.48, s80: 0.77 }
    },
    {
      hs: "39", code: "HS 39",
      name: "Plastics and articles thereof",
      nameShort: "Plastics",
      importValue: 1234483.5,
      avgMFNRate: 6.7,
      avgAppliedRate: 3.2,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 11948.8, s50: 29872.0, s80: 47795.2 },
      tradeEffect_pct: { s20: 0.97, s50: 2.42, s80: 3.87 }
    },
    {
      hs: "40", code: "HS 40",
      name: "Rubber and articles thereof",
      nameShort: "Rubber",
      importValue: 404981.2,
      avgMFNRate: 9.2,
      avgAppliedRate: 4.5,
      elasticity: 1.27,
      subjectToChange: true,
      tradeEffect: { s20: 10761.3, s50: 26903.3, s80: 43045.2 },
      tradeEffect_pct: { s20: 2.66, s50: 6.64, s80: 10.63 }
    }
  ],

  // ── Scenario totals ──────────────────────────────────────────────────
  scenarioTotals: {
    s20: {
      tradeCreation: 6522.0,
      tradeDiversion: 5416.5,
      totalTradeEffect: 38631.8,     // thous USD = ~38.6 mln USD
      welfareGain: 9300.0,           // consumer surplus gain, thous USD
      revenueChange: -23700.0,       // tariff revenue change, thous USD
      netWelfare: -14400.0
    },
    s50: {
      tradeCreation: 16305.0,
      tradeDiversion: 13541.3,
      totalTradeEffect: 96579.5,
      welfareGain: 17700.0,
      revenueChange: -66900.0,
      netWelfare: -49200.0
    },
    s80: {
      tradeCreation: 26088.0,
      tradeDiversion: 21666.1,
      totalTradeEffect: 154527.2,
      welfareGain: 22200.0,
      revenueChange: -118900.0,
      netWelfare: -96700.0
    }
  },

  // ── Trade effects by WTO partner (gainers), 20% cut ─────────────────
  // tradeCreation + tradeDiversion = totalEffect
  // baseTrade: bilateral trade value 2022, thous USD
  partnerGainers: [
    { country: "China",       iso: "CN", wto: true,  tc: 15068.6, td: 4125.8,  total: 19193.7, base: 1054801.6, pct: 1.82 },
    { country: "Japan",       iso: "JP", wto: true,  tc: 6671.5,  td: 4105.4,  total: 10776.8, base: 400145.8,  pct: 2.69 },
    { country: "Korea",       iso: "KR", wto: true,  tc: 1046.4,  td: 973.7,   total: 2020.1,  base: 59773.6,   pct: 3.38 },
    { country: "Germany",     iso: "DE", wto: true,  tc: 2296.9,  td: 1314.8,  total: 3611.7,  base: 175713.1,  pct: 2.05 },
    { country: "Italy",       iso: "IT", wto: true,  tc: 739.1,   td: 920.9,   total: 1660.0,  base: 42944.8,   pct: 3.86 },
    { country: "Turkey",      iso: "TR", wto: true,  tc: 789.8,   td: 660.1,   total: 1450.0,  base: 40511.7,   pct: 3.58 },
    { country: "Brazil",      iso: "BR", wto: true,  tc: 459.5,   td: 235.7,   total: 695.2,   base: 15423.7,   pct: 4.51 },
    { country: "Spain",       iso: "ES", wto: true,  tc: 196.1,   td: 185.7,   total: 381.8,   base: 11379.0,   pct: 3.36 },
    { country: "Germany (add.)", iso: "DE2", wto: true, tc: 324.0, td: 74.3,   total: 398.3,   base: 6386.6,    pct: 6.24 },
    { country: "Finland",     iso: "FI", wto: true,  tc: 45.9,    td: 74.5,    total: 120.5,   base: 5447.7,    pct: 2.21 }
  ],

  // ── Trade effects by FTA/non-WTO partner (losers), 20% cut ──────────
  partnerLosers: [
    { country: "Iran",        iso: "IR", fta: false, diverted: -17327.6, base: 1074711.7, pct: -1.61 },
    { country: "Russia",      iso: "RU", fta: true,  diverted: -16192.4, base: 901600.0,  pct: -1.80 },
    { country: "Kyrgyzstan",  iso: "KG", fta: true,  diverted: -14122.9, base: 721172.2,  pct: -1.96 },
    { country: "Turkmenistan",iso: "TM", fta: true,  diverted: -1141.5,  base: 132882.9,  pct: -0.86 },
    { country: "Ukraine",     iso: "UA", fta: true,  diverted: -501.1,   base: 47737.6,   pct: -1.05 },
    { country: "Kazakhstan",  iso: "KZ", fta: true,  diverted: -788.9,   base: 37915.6,   pct: -2.08 },
    { country: "Tajikistan",  iso: "TJ", fta: true,  diverted: -142.3,   base: 7300.9,    pct: -1.95 },
    { country: "Azerbaijan",  iso: "AZ", fta: true,  diverted: -105.6,   base: 4529.9,    pct: -2.33 },
    { country: "Uzbekistan*", iso: "UZ", fta: true,  diverted: -11.9,    base: 1454.5,    pct: -0.82 }
  ],

  // ── Key findings from the report ─────────────────────────────────────
  keyFindings: [
    "A 20% tariff cut would increase Uzbekistan's imports from WTO MFN partners by ≈ USD 38.6 mln (+1.1% of base trade)",
    "Trade diversion from FTA/CIS countries reaches ≈ USD 16.2 mln from Russia and ≈ USD 14.1 mln from Kyrgyzstan",
    "Highest relative impact in HS 35 (Starches & Glues): +8.7% trade effect even under a 20% tariff cut",
    "Rubber (HS 40) and Plastics (HS 39) generate the largest absolute trade effects due to high import volumes",
    "Consumer welfare improves by USD 9.3 mln (20% cut) through lower domestic prices",
    "Tariff revenue falls by USD 23.7 mln (20% cut) — more sharply under 80% cut (−USD 118.9 mln)",
    "A 80% cut (near-full liberalisation) could generate USD 154.5 mln in additional trade flows"
  ]
};
