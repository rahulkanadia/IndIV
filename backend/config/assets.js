export const ASSETS = {
  // --- INDICES ---
  NIFTY: {
    futures: "NIFTY1!",
    optionPrefix: "NIFTY",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE", 
    exchange: "NSE"
  },
  BANKNIFTY: {
    futures: "BANKNIFTY1!",
    optionPrefix: "BANKNIFTY",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE", // Weekly Tue
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
    strikeStep: 25,
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  NIFTYNXT50: {
    futures: "NIFTYNXT501!",
    optionPrefix: "NIFTYNXT50",
    strikeStep: 100,
    strikesEachSide: 5,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  SENSEX: {
    futures: "BSX1!",
    optionPrefix: "BSX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU", // Weekly Thu
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
    type: "MCX_ENERGY", 
    exchange: "MCX"
  },
  NATURALGAS: {
    futures: "NATURALGAS1!",
    optionPrefix: "NATURALGAS",
    strikeStep: 5, 
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
    strikeStep: 100, 
    strikesEachSide: 8,
    type: "MCX_BULLION",
    exchange: "MCX"
  },
  COPPER: {
    futures: "COPPER1!",
    optionPrefix: "COPPER",
    strikeStep: 2.5, 
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  },
  ZINC: {
    futures: "ZINC1!",
    optionPrefix: "ZINC",
    strikeStep: 1, 
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  }
}
