import type { ModelExplorerWorkspace } from '../../contracts/data-contract'

export const modelExplorerWorkspaceMock: ModelExplorerWorkspace = {
  workspace_id: 'model-explorer-v1',
  generated_at: '2026-04-18T09:20:00+05:00',
  default_model_id: 'qpm-uzbekistan',
  models: [
    {
      model_id: 'qpm-uzbekistan',
      model_name: 'QPM',
      model_type: 'Quarterly projection model',
      frequency: 'Quarterly',
      status: 'active',
      summary: 'Monetary-policy transmission, output gap, inflation, Taylor rule, and UIP scenarios.',
    },
    {
      model_id: 'dfm-nowcast',
      model_name: 'DFM',
      model_type: 'Dynamic factor nowcast',
      frequency: 'Monthly / mixed frequency',
      status: 'active',
      summary: 'Short-horizon growth nowcast using high-frequency activity, external, and financial indicators.',
    },
    {
      model_id: 'pe-trade',
      model_name: 'PE',
      model_type: 'Partial equilibrium trade model',
      frequency: 'Scenario-based',
      status: 'staging',
      summary: 'Tariff and trade-policy shock analysis with import demand, trade diversion, and revenue effects.',
    },
    {
      model_id: 'io-sector',
      model_name: 'IO',
      model_type: 'Input-output multiplier model',
      frequency: 'Annual / scenario-based',
      status: 'staging',
      summary: 'Sector multiplier analysis for demand shocks, value added, and supply-chain propagation.',
    },
    {
      model_id: 'cge-reform',
      model_name: 'CGE',
      model_type: 'Computable general equilibrium model',
      frequency: 'Scenario-based',
      status: 'staging',
      summary: 'Economy-wide reform and relative-price scenarios across households, sectors, trade, and government.',
    },
    {
      model_id: 'fpp-fiscal',
      model_name: 'FPP',
      model_type: 'Financial programming framework',
      frequency: 'Quarterly / annual',
      status: 'active',
      summary: 'Macroeconomic consistency framework linking growth, inflation, fiscal balance, debt, and external accounts.',
    },
  ],
  details_by_model_id: {
    'qpm-uzbekistan': {
      model_id: 'qpm-uzbekistan',
      overview:
        'QPM is the anchor policy model for medium-term inflation, output-gap, exchange-rate, and policy-rate trade-offs.',
      assumptions: [
        {
          assumption_id: 'qpm-a1',
          label: 'Neutral policy rate',
          value: '13.0%',
          rationale: 'Anchors medium-term inflation convergence under current baseline expectations.',
        },
        {
          assumption_id: 'qpm-a2',
          label: 'Exchange-rate pass-through scaler',
          value: '0.45',
          rationale: 'Controls how strongly nominal depreciation affects core inflation.',
        },
        {
          assumption_id: 'qpm-a3',
          label: 'Inflation target corridor',
          value: '5% +/- 1pp',
          rationale: 'Defines the reaction threshold for persistent inflation deviations.',
        },
      ],
      equations: [
        {
          equation_id: 'qpm-e1',
          title: 'Output gap dynamics',
          expression: 'x_t = 0.7*x_(t-1) - 0.2*(r_t - r*) + eps_x_t',
          explanation: 'Domestic demand cools when real policy settings are restrictive.',
        },
        {
          equation_id: 'qpm-e2',
          title: 'Inflation block',
          expression: 'pi_t = 0.6*pi_(t-1) + 0.3*E_t(pi_(t+1)) + 0.1*x_t + eps_pi_t',
          explanation: 'Inflation combines persistence, expectations, and demand pressure.',
        },
      ],
      caveats: [
        {
          caveat_id: 'qpm-c1',
          severity: 'warning',
          message: 'Expectation channels are calibrated rather than estimated from micro survey panels.',
          implication: 'Forward-guidance shocks should be treated as directional.',
        },
      ],
      data_sources: [
        {
          source_id: 'qpm-d1',
          name: 'Policy rate, CPI, exchange rate, output gap proxies',
          provider: 'CBU, Statistics Agency, CERR transforms',
          frequency: 'Monthly to quarterly',
          vintage: '2026-04',
          note: 'Monthly releases are reconciled to the quarterly state vector.',
        },
      ],
    },
    'dfm-nowcast': {
      model_id: 'dfm-nowcast',
      overview:
        'DFM extracts latent activity factors from mixed-frequency indicators to update the current-quarter growth picture.',
      assumptions: [
        {
          assumption_id: 'dfm-a1',
          label: 'Indicator panel completeness threshold',
          value: '75%',
          rationale: 'Prevents sparse publication windows from dominating the nowcast.',
        },
        {
          assumption_id: 'dfm-a2',
          label: 'Publication lag treatment',
          value: 'Kalman backfill',
          rationale: 'Maintains continuity when fresh indicators are not yet released.',
        },
      ],
      equations: [
        {
          equation_id: 'dfm-e1',
          title: 'Latent factor transition',
          expression: 'f_t = A*f_(t-1) + u_t; y_t = Lambda*f_t + e_t',
          explanation: 'Observed indicators load on a common activity factor estimated through state-space updates.',
        },
      ],
      caveats: [
        {
          caveat_id: 'dfm-c1',
          severity: 'warning',
          message: 'Signal quality weakens when survey indicators diverge from hard data.',
          implication: 'Turning-point revisions may be larger than normal.',
        },
      ],
      data_sources: [
        {
          source_id: 'dfm-d1',
          name: 'Industrial production, trade, tax receipts, surveys',
          provider: 'Statistics Agency, Treasury, internal high-frequency sources',
          frequency: 'Weekly / monthly',
          vintage: '2026-04 W2',
          note: 'Mixed-frequency series are standardized before factor extraction.',
        },
      ],
    },
    'pe-trade': {
      model_id: 'pe-trade',
      overview:
        'PE estimates direct trade effects of tariff and market-access shocks before economy-wide feedbacks are introduced.',
      assumptions: [
        {
          assumption_id: 'pe-a1',
          label: 'Import demand elasticity',
          value: 'Product-specific where available; fallback 1.27',
          rationale: 'Maps price changes to import-volume responses.',
        },
        {
          assumption_id: 'pe-a2',
          label: 'Trade diversion rule',
          value: 'Partner-share weighted',
          rationale: 'Allocates import switching across source markets after tariff changes.',
        },
      ],
      equations: [
        {
          equation_id: 'pe-e1',
          title: 'Import response',
          expression: 'dM_i = epsilon_i * M_i * dP_i',
          explanation: 'Commodity-level import changes follow price shock times elasticity and baseline import value.',
        },
      ],
      caveats: [
        {
          caveat_id: 'pe-c1',
          severity: 'info',
          message: 'Partial equilibrium results exclude second-round income and production feedbacks.',
          implication: 'Large tariff packages should be cross-checked in CGE.',
        },
      ],
      data_sources: [
        {
          source_id: 'pe-d1',
          name: 'Trade values, tariff schedules, elasticity tables',
          provider: 'Customs, WITS/SMART, national tariff registry',
          frequency: 'Annual with scenario overrides',
          vintage: '2025',
          note: 'HS-level records are aggregated for the MVP interface.',
        },
      ],
    },
    'io-sector': {
      model_id: 'io-sector',
      overview:
        'IO tracks how sector demand shocks propagate through suppliers and value-added linkages in the domestic economy.',
      assumptions: [
        {
          assumption_id: 'io-a1',
          label: 'Technology coefficients',
          value: 'Fixed Leontief coefficients',
          rationale: 'Short-run production structure is assumed stable during the shock window.',
        },
        {
          assumption_id: 'io-a2',
          label: 'Multiplier type',
          value: 'Type I in MVP',
          rationale: 'Direct and indirect effects are shown while induced household consumption remains future work.',
        },
      ],
      equations: [
        {
          equation_id: 'io-e1',
          title: 'Leontief inverse',
          expression: 'x = (I - A)^(-1) * y',
          explanation: 'Sector output responds to final-demand shocks through the inter-industry requirements matrix.',
        },
      ],
      caveats: [
        {
          caveat_id: 'io-c1',
          severity: 'warning',
          message: 'Fixed coefficients do not capture substitution or capacity constraints.',
          implication: 'Use CGE for large price or labor-market shocks.',
        },
      ],
      data_sources: [
        {
          source_id: 'io-d1',
          name: 'Supply-use and input-output tables',
          provider: 'Statistics Agency, CERR harmonization',
          frequency: 'Annual',
          vintage: 'Latest harmonized table',
          note: 'Sector mappings are aligned to the policy workspace taxonomy.',
        },
      ],
    },
    'cge-reform': {
      model_id: 'cge-reform',
      overview:
        'CGE evaluates broad reform packages where prices, production, trade, government, and household welfare adjust together.',
      assumptions: [
        {
          assumption_id: 'cge-a1',
          label: 'Armington elasticity',
          value: 'Sector-calibrated',
          rationale: 'Controls substitution between domestic and imported goods.',
        },
        {
          assumption_id: 'cge-a2',
          label: 'Closure rule',
          value: 'Government balance adjusts via savings in MVP',
          rationale: 'Keeps the scenario internally consistent for fiscal-reform interpretation.',
        },
      ],
      equations: [
        {
          equation_id: 'cge-e1',
          title: 'Market clearing',
          expression: 'supply_c = demand_c for all commodities c',
          explanation: 'Prices adjust until commodity and factor markets clear under the chosen closure.',
        },
      ],
      caveats: [
        {
          caveat_id: 'cge-c1',
          severity: 'warning',
          message: 'MVP metadata summarizes the reform logic; solver-grade diagnostics remain in the model layer.',
          implication: 'Detailed welfare claims require full calibration review.',
        },
      ],
      data_sources: [
        {
          source_id: 'cge-d1',
          name: 'Social accounting matrix and national accounts',
          provider: 'CERR, Statistics Agency, fiscal accounts',
          frequency: 'Annual / calibration updates',
          vintage: 'Model calibration vintage',
          note: 'SAM balancing assumptions are documented with model caveats.',
        },
      ],
    },
    'fpp-fiscal': {
      model_id: 'fpp-fiscal',
      overview:
        'FPP checks macro consistency across growth, inflation, fiscal balance, debt, external financing, and reserves.',
      assumptions: [
        {
          assumption_id: 'fpp-a1',
          label: 'Revenue elasticity to growth',
          value: '1.1',
          rationale: 'Converts real activity changes into tax-intake dynamics.',
        },
        {
          assumption_id: 'fpp-a2',
          label: 'Primary spending rule',
          value: 'Baseline plus policy adjustments',
          rationale: 'Separates policy experiments from the administrative baseline.',
        },
      ],
      equations: [
        {
          equation_id: 'fpp-e1',
          title: 'Fiscal balance identity',
          expression: 'fb_t = rev_t - exp_t - int_t',
          explanation: 'Fiscal balance is determined by revenues, primary expenditures, and interest costs.',
        },
        {
          equation_id: 'fpp-e2',
          title: 'Debt accumulation',
          expression: 'debt_t = debt_(t-1) + deficit_t + valuation_t',
          explanation: 'Debt evolves with financing needs and valuation effects.',
        },
      ],
      caveats: [
        {
          caveat_id: 'fpp-c1',
          severity: 'info',
          message: 'Off-budget operations are represented through adjustment coefficients.',
          implication: 'Public-sector coverage still requires reconciliation tables before citation.',
        },
      ],
      data_sources: [
        {
          source_id: 'fpp-d1',
          name: 'Treasury execution, debt, BOP, macro baseline',
          provider: 'Ministry of Economy and Finance, CBU, Statistics Agency',
          frequency: 'Monthly / quarterly',
          vintage: '2026-03',
          note: 'Fiscal and external blocks are aligned to a common baseline vintage.',
        },
      ],
    },
  },
}
