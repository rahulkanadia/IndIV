export const ASSETS = {
  // ==========================================
  // 1. INDICES (NSE) - TUESDAY EXPIRY
  // ==========================================
  NIFTY: {
    indexSymbol: "NSE:NIFTY",      
    futuresSymbol: "NIFTY1!",
    optionPrefix: "NIFTY",
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  BANKNIFTY: {
    indexSymbol: "NSE:BANKNIFTY",
    futuresSymbol: "BANKNIFTY1!",
    optionPrefix: "BANKNIFTY",
    exchange: "NSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  FINNIFTY: {
    indexSymbol: "NSE:FINNIFTY",
    futuresSymbol: "FINNIFTY1!",
    optionPrefix: "FINNIFTY",
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  MIDCPNIFTY: {
    indexSymbol: "NSE:MIDCPNIFTY",
    futuresSymbol: "MIDCPNIFTY1!",
    optionPrefix: "MIDCPNIFTY",
    exchange: "NSE",
    strikeStep: 25,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  NIFTYNXT50: {
    indexSymbol: "NSE:NIFTYNXT50",
    futuresSymbol: "NIFTYNXT501!",
    optionPrefix: "NIFTYNXT50",
    exchange: "NSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },

  // ==========================================
  // 2. INDICES (BSE) - THURSDAY EXPIRY
  // ==========================================
  SENSEX: {
    indexSymbol: "BSE:SENSEX",
    futuresSymbol: "BSX1!",
    optionPrefix: "BSX",
    exchange: "BSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU"
  },
  BANKEX: {
    indexSymbol: "BSE:BANKEX",
    futuresSymbol: "BKX1!",
    optionPrefix: "BANKEX",
    exchange: "BSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU"
  },
  SENSEX50: {
    indexSymbol: "BSE:SENSEX50",
    futuresSymbol: "SX501!",
    optionPrefix: "SX50",
    exchange: "BSE",
    strikeStep: 50, 
    strikesEachSide: 10,
    type: "INDEX_THU"
  },

  // ==========================================
  // 3. COMMODITIES (MCX)
  // Use Future symbol as Spot proxy if Index unavailable
  // ==========================================
  CRUDEOIL: {
    indexSymbol: "MCX:CRUDEOIL1!", 
    futuresSymbol: "CRUDEOIL1!",
    optionPrefix: "CRUDEOIL",
    exchange: "MCX",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "MCX_CRUDE"
  },
  NATURALGAS: {
    indexSymbol: "MCX:NATURALGAS1!",
    futuresSymbol: "NATURALGAS1!",
    optionPrefix: "NATURALGAS",
    exchange: "MCX",
    strikeStep: 5,
    strikesEachSide: 10,
    type: "MCX_NATGAS"
  },
  GOLD: {
    indexSymbol: "MCX:GOLD1!",
    futuresSymbol: "GOLD1!",
    optionPrefix: "GOLD",
    exchange: "MCX",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "MCX_GOLD"
  },
  SILVER: {
    indexSymbol: "MCX:SILVER1!",
    futuresSymbol: "SILVER1!",
    optionPrefix: "SILVER",
    exchange: "MCX",
    strikeStep: 500,
    strikesEachSide: 10,
    type: "MCX_SILVER"
  },
  COPPER: {
    indexSymbol: "MCX:COPPER1!",
    futuresSymbol: "COPPER1!",
    optionPrefix: "COPPER",
    exchange: "MCX",
    strikeStep: 2.5,
    strikesEachSide: 10,
    type: "MCX_BASE"
  },
  ZINC: {
    indexSymbol: "MCX:ZINC1!",
    futuresSymbol: "ZINC1!",
    optionPrefix: "ZINC",
    exchange: "MCX",
    strikeStep: 0.5,
    strikesEachSide: 10,
    type: "MCX_BASE"
  }
};
