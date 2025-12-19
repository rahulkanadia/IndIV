export const ASSETS = {
  // --- INDICES ---
  NIFTY: {
    futures: "NIFTY1!",
    optionPrefix: "NIFTY",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE", // Based on your CSV: Weekly=Tue
    exchange: "NSE"
  },
  BANKNIFTY: {
    futures: "BANKNIFTY1!",
    optionPrefix: "BANKNIFTY",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE", // CSV 2 & 3 imply Tuesday
    exchange: "NSE"
  },
  FINNIFTY: {
    futures: "FINNIFTY1!",
    optionPrefix: "FINNIFTY",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  MIDCPNIFTY: {
    futures: "MIDCPNIFTY1!",
    optionPrefix: "MIDCPNIFTY",
    strikeStep: 25, // Midcap step is often smaller
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  NIFTYNXT50: {
    futures: "NIFTYNXT501!",
    optionPrefix: "NIFTYNXT50",
    strikeStep: 100,
    strikesEachSide: 5, // Less liquid
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  SENSEX: {
    futures: "BSX1!",
    optionPrefix: "BSX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU", // CSV 2: Thursday
    exchange: "BSE"
  },
  BANKEX: {
    futures: "BKX1!",
    optionPrefix: "BANKEX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU",
    exchange: "BSE"
  },

  // --- COMMODITIES (MCX) ---
  CRUDEOIL: {
    futures: "CRUDEOIL1!",
    optionPrefix: "CRUDEOIL",
    strikeStep: 50,
    strikesEachSide: 8,
    type: "MCX_ENERGY", // Special logic
    exchange: "MCX"
  },
  NATURALGAS: {
    futures: "NATURALGAS1!",
    optionPrefix: "NATURALGAS",
    strikeStep: 5, // NG steps are small (e.g. 230, 235)
    strikesEachSide: 10,
    type: "MCX_ENERGY",
    exchange: "MCX"
  },
  GOLD: {
    futures: "GOLD1!",
    optionPrefix: "GOLD",
    strikeStep: 100,
    strikesEachSide: 8,
    type: "MCX_BULLION",
    exchange: "MCX"
  },
  SILVER: {
    futures: "SILVER1!",
    optionPrefix: "SILVER",
    strikeStep: 100, // Silver steps can be large
    strikesEachSide: 8,
    type: "MCX_BULLION",
    exchange: "MCX"
  },
  COPPER: {
    futures: "COPPER1!",
    optionPrefix: "COPPER",
    strikeStep: 2.5, // Check strict step, often 2.5 or 5
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  },
  ZINC: {
    futures: "ZINC1!",
    optionPrefix: "ZINC",
    strikeStep: 1, // Usually 1 or 0.5
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  }
}
