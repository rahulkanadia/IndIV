export const ASSETS = {
  // --- INDICES (NSE) ---
  NIFTY: {
    futuresSymbol: "NIFTY1!",
    exchange: "NSE",
    strikeStep: 50,
    options: true,
    type: "INDEX_TUE" 
  },
  BANKNIFTY: {
    futuresSymbol: "BANKNIFTY1!",
    exchange: "NSE",
    strikeStep: 100,
    options: true,
    type: "INDEX_TUE"
  },
  FINNIFTY: {
    futuresSymbol: "FINNIFTY1!",
    exchange: "NSE",
    strikeStep: 50,
    options: true,
    type: "INDEX_TUE"
  },
  // --- INDICES (BSE) ---
  SENSEX: {
    futuresSymbol: "BSX1!",
    exchange: "BSE",
    strikeStep: 100,
    options: true,
    type: "INDEX_THU"
  },
  // --- COMMODITIES (MCX) ---
  CRUDEOIL: {
    futuresSymbol: "CRUDEOIL1!",
    exchange: "MCX",
    strikeStep: 50,
    options: true,
    type: "MCX_ENERGY"
  },
  NATURALGAS: {
    futuresSymbol: "NATURALGAS1!",
    exchange: "MCX",
    strikeStep: 5,
    options: true,
    type: "MCX_ENERGY"
  },
  GOLD: {
    futuresSymbol: "GOLD1!",
    exchange: "MCX",
    strikeStep: 100,
    options: true,
    type: "MCX_BULLION"
  },
  SILVER: {
    futuresSymbol: "SILVER1!",
    exchange: "MCX",
    strikeStep: 100,
    options: true,
    type: "MCX_BULLION"
  },
  COPPER: {
    futuresSymbol: "COPPER1!",
    exchange: "MCX",
    strikeStep: 2.5,
    options: true,
    type: "MCX_METAL"
  },
  ZINC: {
    futuresSymbol: "ZINC1!",
    exchange: "MCX",
    strikeStep: 1,
    options: true,
    type: "MCX_METAL"
  }
}
