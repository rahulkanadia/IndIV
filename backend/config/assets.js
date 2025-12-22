export const ASSETS = {
  // --- INDICES (NSE) ---
  NIFTY: {
    futuresSymbol: "NIFTY1!",
    optionPrefix: "NIFTY",     // RESTORED
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 10,       // RESTORED
    options: true,
    type: "INDEX_TUE" 
  },
  BANKNIFTY: {
    futuresSymbol: "BANKNIFTY1!",
    optionPrefix: "BANKNIFTY", // RESTORED
    exchange: "NSE",
    strikeStep: 100,
    strikesEachSide: 10,       // RESTORED
    options: true,
    type: "INDEX_TUE"
  },
  FINNIFTY: {
    futuresSymbol: "FINNIFTY1!",
    optionPrefix: "FINNIFTY",  // RESTORED
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 10,       // RESTORED
    options: true,
    type: "INDEX_TUE"
  },
  // --- INDICES (BSE) ---
  SENSEX: {
    futuresSymbol: "BSX1!",
    optionPrefix: "BSX",       // RESTORED
    exchange: "BSE",
    strikeStep: 100,
    strikesEachSide: 10,       // RESTORED
    options: true,
    type: "INDEX_THU"
  },
  // --- COMMODITIES (MCX) ---
  CRUDEOIL: {
    futuresSymbol: "CRUDEOIL1!",
    optionPrefix: "CRUDEOIL",  // RESTORED
    exchange: "MCX",
    strikeStep: 50,
    strikesEachSide: 8,        // RESTORED
    options: true,
    type: "MCX_ENERGY"
  },
  NATURALGAS: {
    futuresSymbol: "NATURALGAS1!",
    optionPrefix: "NATURALGAS",
    exchange: "MCX",
    strikeStep: 5,
    strikesEachSide: 10,
    options: true,
    type: "MCX_ENERGY"
  },
  GOLD: {
    futuresSymbol: "GOLD1!",
    optionPrefix: "GOLD",
    exchange: "MCX",
    strikeStep: 100,
    strikesEachSide: 8,
    options: true,
    type: "MCX_BULLION"
  },
  SILVER: {
    futuresSymbol: "SILVER1!",
    optionPrefix: "SILVER",
    exchange: "MCX",
    strikeStep: 100,
    strikesEachSide: 8,
    options: true,
    type: "MCX_BULLION"
  },
  COPPER: {
    futuresSymbol: "COPPER1!",
    optionPrefix: "COPPER",
    exchange: "MCX",
    strikeStep: 2.5,
    strikesEachSide: 6,
    options: true,
    type: "MCX_METAL"
  },
  ZINC: {
    futuresSymbol: "ZINC1!",
    optionPrefix: "ZINC",
    exchange: "MCX",
    strikeStep: 1,
    strikesEachSide: 6,
    options: true,
    type: "MCX_METAL"
  }
}
