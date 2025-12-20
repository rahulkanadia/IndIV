export const ASSETS = {
  // --- INDICES ---
  NIFTY: {
    futures: "NSE:NIFTY1!",  // Added NSE:
    optionPrefix: "NSE:NIFTY", // Added NSE:
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE", 
    exchange: "NSE"
  },
  BANKNIFTY: {
    futures: "NSE:BANKNIFTY1!",
    optionPrefix: "NSE:BANKNIFTY",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  FINNIFTY: {
    futures: "NSE:FINNIFTY1!",
    optionPrefix: "NSE:FINNIFTY",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  MIDCPNIFTY: {
    futures: "NSE:MIDCPNIFTY1!",
    optionPrefix: "NSE:MIDCPNIFTY",
    strikeStep: 25,
    strikesEachSide: 10,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  NIFTYNXT50: {
    futures: "NSE:NIFTYNXT501!",
    optionPrefix: "NSE:NIFTYNXT50",
    strikeStep: 100,
    strikesEachSide: 5,
    type: "INDEX_TUE",
    exchange: "NSE"
  },
  SENSEX: {
    futures: "BSE:BSX1!", // Added BSE:
    optionPrefix: "BSE:BSX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU",
    exchange: "BSE"
  },
  BANKEX: {
    futures: "BSE:BKX1!",
    optionPrefix: "BSE:BANKEX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU",
    exchange: "BSE"
  },

  // --- COMMODITIES (MCX) ---
  CRUDEOIL: {
    futures: "MCX:CRUDEOIL1!", // Added MCX:
    optionPrefix: "MCX:CRUDEOIL",
    strikeStep: 50,
    strikesEachSide: 8,
    type: "MCX_ENERGY", 
    exchange: "MCX"
  },
  NATURALGAS: {
    futures: "MCX:NATURALGAS1!",
    optionPrefix: "MCX:NATURALGAS",
    strikeStep: 5, 
    strikesEachSide: 10,
    type: "MCX_ENERGY",
    exchange: "MCX"
  },
  GOLD: {
    futures: "MCX:GOLD1!",
    optionPrefix: "MCX:GOLD",
    strikeStep: 100,
    strikesEachSide: 8,
    type: "MCX_BULLION",
    exchange: "MCX"
  },
  SILVER: {
    futures: "MCX:SILVER1!",
    optionPrefix: "MCX:SILVER",
    strikeStep: 100, 
    strikesEachSide: 8,
    type: "MCX_BULLION",
    exchange: "MCX"
  },
  COPPER: {
    futures: "MCX:COPPER1!",
    optionPrefix: "MCX:COPPER",
    strikeStep: 2.5, 
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  },
  ZINC: {
    futures: "MCX:ZINC1!",
    optionPrefix: "MCX:ZINC",
    strikeStep: 1, 
    strikesEachSide: 6,
    type: "MCX_METAL",
    exchange: "MCX"
  }
}
