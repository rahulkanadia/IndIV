// File: frontend/lib/DataManager.js

import { mockData } from '../mockdata.js';

export class DataManager {
    constructor() {
        this.data = null;
        this.source = 'INIT'; 
        this.logs = [];
    }

    async fetch() {
        try {
            // 1. Try to fetch the Live JSON (Add timestamp to bust browser cache)
            const response = await fetch(`./indiv_data.json?t=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.json();

            // 2. Check if NIFTY data exists
            if (!rawData.NIFTY) {
                throw new Error("JSON valid but NIFTY data missing");
            }

            // 3. SUCCESS: Map Backend Data to UI Schema
            this.data = this.normalizeData(rawData.NIFTY);
            this.source = 'LIVE';
            this.logs = rawData.NIFTY.meta?.log || ["Live data loaded successfully"];
            
            console.log("✅ DataManager: Loaded LIVE data");

        } catch (e) {
            // 4. FAILURE: Fallback to Mock
            console.warn("⚠️ DataManager: Live fetch failed, using MOCK.", e.message);
            
            this.data = mockData;
            this.source = 'MOCK';
            this.logs = [
                "CRITICAL: Live data fetch failed.",
                `Error: ${e.message}`,
                "System reverted to Mock Data."
            ];
        }

        return {
            data: this.data,
            source: this.source,
            logs: this.logs
        };
    }

    // This function ensures the UI ALWAYS gets the structure it expects
    normalizeData(backendNifty) {
        // If the backend worker generates the exact UI structure, we pass it through.
        // If any key is missing, we can patch it here to prevent regression.
        
        return {
            // Header
            spot: backendNifty.header?.spot || 0,
            spotVix: backendNifty.header?.spotVix || 13.5,
            
            // Grids
            gridWeekly: backendNifty.gridWeekly || [],
            gridMonthly: backendNifty.gridMonthly || [],
            
            // Charts (Ensure arrays exist)
            intraday: backendNifty.charts?.intraday || { time:[], wk:[] },
            term: backendNifty.charts?.term || { expiries:[], weekly:[] },
            skew: backendNifty.charts?.skew || { strikes:[], weekly:[] },
            surface: backendNifty.charts?.surface || { expiriesWeekly:[], zWk:[] },
            
            // Widgets
            pcr: backendNifty.charts?.pcr || { current: 0, history: [] },
            sdTable: backendNifty.sdTable || { levels:[], call:[] }, // Backend needs to generate this eventually
            
            // Greeks Table
            greeks: backendNifty.charts?.greeks || { rows: [] }
        };
    }
}
