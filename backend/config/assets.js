export const ASSETS = {
  // ==========================================
  // 1. INDICES (NSE) - ALL TUESDAY EXPIRY
  // ==========================================
  NIFTY: {
    futuresSymbol: "NIFTY1!",
    optionPrefix: "NIFTY",
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  BANKNIFTY: {
    futuresSymbol: "BANKNIFTY1!",
    optionPrefix: "BANKNIFTY",
    exchange: "NSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_TUE"
  },
  FINNIFTY: {
    futuresSymbol: "FINNIFTY1!",
    optionPrefix: "FINNIFTY",
    exchange: "NSE",
    strikeStep: 50,
    strikesEachSide: 8,
    type: "INDEX_TUE"
  },
  MIDCPNIFTY: {
    futuresSymbol: "MIDCPNIFTY1!",
    optionPrefix: "MIDCPNIFTY",
    exchange: "NSE",
    strikeStep: 25,
    strikesEachSide: 6,
    type: "INDEX_TUE"
  },
  NIFTYNXT50: {
    futuresSymbol: "NIFTYNXT501!",
    optionPrefix: "NIFTYNXT50",
    exchange: "NSE",
    strikeStep: 100,
    strikesEachSide: 5,
    type: "INDEX_TUE"
  },

  // ==========================================
  // 2. INDICES (BSE) - ALL THURSDAY EXPIRY
  // ==========================================
  SENSEX: {
    futuresSymbol: "BSX1!",
    optionPrefix: "BSX",
    exchange: "BSE",
    strikeStep: 100,
    strikesEachSide: 10,
    type: "INDEX_THU"
  },
  BANKEX: {
    futuresSymbol: "BKX1!",
    optionPrefix: "BANKEX",
    exchange: "BSE",
    strikeStep: 100,
    strikesEachSide: 6,
    type: "INDEX_THU"
  },
  SENSEX50: {
    futuresSymbol: "SX501!",
    optionPrefix: "SX50",
    exchange: "BSE",
    strikeStep: 50, 
    strikesEachSide: 5,
    type: "INDEX_THU"
  },

  // ==========================================
  // 3. COMMODITIES (MCX) - CUSTOM RULES
  // ==========================================
  CRUDEOIL: {
    futuresSymbol: "CRUDEOIL1!",
    optionPrefix: "CRUDEOIL",
    exchange: "MCX",
    strikeStep: 50,
    strikesEachSide: 8,
    type: "MCX_CRUDE" // Rule: Options 2 days before Fut
  },
  NATURALGAS: {
    futuresSymbol: "NATURALGAS1!",
    optionPrefix: "NATURALGAS",
    exchange: "MCX",
    strikeStep: 5,
    strikesEachSide: 8,
    type: "MCX_NATGAS" // Rule: Options 2 days before Fut
  },
  GOLD: {
    futuresSymbol: "GOLD1!",
    optionPrefix: "GOLD",
    exchange: "MCX",
    strikeStep: 100,
    strikesEachSide: 6,
    type: "MCX_GOLD" // Rule: Fut=5th, Opt=3 biz days prior to tender
  },
  SILVER: {
    futuresSymbol: "SILVER1!",
    optionPrefix: "SILVER",
    exchange: "MCX",
    strikeStep: 500,
    strikesEachSide: 6,
    type: "MCX_SILVER"
  },
  COPPER: {
    futuresSymbol: "COPPER1!",
    optionPrefix: "COPPER",
    exchange: "MCX",
    strikeStep: 2.5,
    strikesEachSide: 5,
    type: "MCX_BASE" // Rule: Fut=LastDay, Opt=~8 days prior
  },
  ZINC: {
    futuresSymbol: "ZINC1!",
    optionPrefix: "ZINC",
    exchange: "MCX",
    strikeStep: 0.5,
    strikesEachSide: 5,
    type: "MCX_BASE"
  }
};
