const axios = require("axios");

// Headers matching the Python source
const HEADERS = {
    'Host': 'api.revenuecat.com',
    'Authorization': 'Bearer appl_JngFETzdodyLmCREOlwTUtXdQik', // Found in source
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'X-Platform': 'iOS',
    'X-Platform-Version': 'Version 26.2 (Build 23C55)',
    'X-Platform-Device': 'iPhone15,3',
    'X-Platform-Flavor': 'native',
    'X-Version': '5.41.0',
    'X-Client-Version': '2.32.2',
    'X-Client-Bundle-ID': 'com.locket.Locket',
    'X-Client-Build-Version': '3',
    'X-StoreKit2-Enabled': 'true',
    'X-StoreKit-Version': '2',
    'X-Observer-Mode-Enabled': 'false',
    'X-Is-Sandbox': 'true', // Will be overwritten by token set
    'X-Storefront': 'VNM',
    'X-Apple-Device-Identifier': '39A73C25-1E05-4350-ADA7-5CD3FE1079E8',
    'X-Preferred-Locales': 'vi_KR,ko_KR,en_KR',
    'X-Nonce': 'w0Mlb6+AmV4WYuVv',
    'X-Is-Backgrounded': 'false',
    'X-Retry-Count': '0',
    'X-Is-Debug-Build': 'false',
    'User-Agent': 'Locket/3 CFNetwork/3860.300.31 Darwin/25.2.0',
    'Accept-Language': 'vi-VN,vi;q=0.9',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'X-RevenueCat-ETag': ''
};

// Placeholder tokens - User needs to update these
// You can populate this list with tokens found in your database or config
const TOKEN_SETS = [
    {
        // Example structure
        fetch_token: "", // FILL ME
        app_transaction: "", // FILL ME
        hash_params: "",
        hash_headers: "",
        is_sandbox: true
    }
];

async function resolveUid(username) {
    const url = `https://locket.cam/${username}`;
    const headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        "Accept": "text/html"
    };

    try {
        const response = await axios.get(url, { headers, maxRedirects: 5, validateStatus: () => true });
        const html = response.data;
        const redirectUrl = response.request.res.responseUrl || url; // axios exposes responseUrl

        function extract(text) {
            if (!text) return null;
            // Match /invites/{id}
            let m = text.match(/\/invites\/([A-Za-z0-9]{28})/);
            if (m) return m[1];

            // Match link=...
            let lp = text.match(/link=([^\s"'>]+)/);
            if (lp) {
                try {
                    let d = decodeURIComponent(lp[1]);
                    let dm = d.match(/\/invites\/([A-Za-z0-9]{28})/);
                    if (dm) return dm[1];
                } catch (e) { }
            }
            return null;
        }

        return extract(redirectUrl) || extract(html);
    } catch (e) {
        console.error("Resolve UID Error:", e.message);
        return null;
    }
}

async function checkStatus(uid) {
    const url = `https://api.revenuecat.com/v1/subscribers/${uid}`;
    try {
        const response = await axios.get(url, { headers: HEADERS, validateStatus: () => true });
        if (response.status >= 200 && response.status < 300) {
            const data = response.data;
            const entitlements = data.subscriber?.entitlements?.Gold;
            if (entitlements) {
                return { active: true, expires: entitlements.expires_date };
            }
            return { active: false };
        }
        return { active: false };
    } catch (e) {
        console.error("Check Status Error:", e.message);
        return null;
    }
}

async function injectGold(uid, logCallback = console.log) {
    // Pick a token - simplistic logic, picking first valid one or first one
    const tokenConfig = TOKEN_SETS.find(t => t.fetch_token) || TOKEN_SETS[0];

    if (!tokenConfig.fetch_token) {
        logCallback("❌ No valid tokens found in utils/locket-api.js");
        return { success: false, message: "No valid tokens configured." };
    }

    const url = "https://api.revenuecat.com/v1/receipts";
    const body = {
        "product_id": "locket_199_1m",
        "fetch_token": tokenConfig.fetch_token,
        "app_transaction": tokenConfig.app_transaction,
        "app_user_id": uid,
        "is_restore": true,
        "store_country": "VNM",
        "currency": "USD",
        "price": "1.99",
        "normal_duration": "P1M",
        "subscription_group_id": "21419447",
        "observer_mode": false,
        "initiation_source": "restore",
        "offers": [],
        "attributes": {
            "$attConsentStatus": { "updated_at_ms": Date.now(), "value": "notDetermined" }
        }
    };

    const currentHeaders = { ...HEADERS };
    currentHeaders['Content-Length'] = JSON.stringify(body).length;

    if (tokenConfig.hash_params) currentHeaders['X-Post-Params-Hash'] = tokenConfig.hash_params;
    if (tokenConfig.hash_headers) currentHeaders['X-Headers-Hash'] = tokenConfig.hash_headers;
    currentHeaders['X-Is-Sandbox'] = String(tokenConfig.is_sandbox).toLowerCase();

    logCallback(`[*] Target: ${uid}`);
    logCallback(`[*] Using Token Set: Sandbox=${tokenConfig.is_sandbox}`);

    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            logCallback(`[>] Attempt ${attempt + 1}/5: Sending Receipt...`);
            const response = await axios.post(url, body, {
                headers: currentHeaders,
                validateStatus: () => true,
                timeout: 15000
            });

            if (response.status === 200) {
                logCallback(`[+] HTTP 200 OK. Verifying Entitlement...`);
                // Verify
                const status = await checkStatus(uid);
                if (status && status.active) {
                    logCallback(`[SUCCESS] Gold Entitlement Active!`);
                    return { success: true, message: "SUCCESS" };
                } else {
                    logCallback(`[!] Entitlement not found immediately. Retrying verification...`);
                    await new Promise(r => setTimeout(r, 2000));
                    const status2 = await checkStatus(uid);
                    if (status2 && status2.active) {
                        logCallback(`[SUCCESS] Gold Active after delay.`);
                        return { success: true, message: "SUCCESS" };
                    }
                    logCallback(`[-] Exploitation Failed: Valid receipt but no Gold.`);
                    return { success: false, message: "Accepted but NO Gold (Expired?)" };
                }
            } else if (response.status === 529) {
                logCallback(`[!] Server Busy (529). Cooldown 2s...`);
                await new Promise(r => setTimeout(r, 2000));
                continue;
            } else {
                let msg = response.data?.message || String(response.status);
                logCallback(`[x] Request Rejected: ${msg}`);
                return { success: false, message: `Rejected: ${msg}` };
            }
        } catch (e) {
            logCallback(`[!] Network Error: ${e.message}`);
            if (attempt === 4) return { success: false, message: `Request Error: ${e.message}` };
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return { success: false, message: "Timeout / Failed after retries" };
}

module.exports = { resolveUid, checkStatus, injectGold };
