
import NodeCache from 'node-cache';
let gotPromise = null;

// Helper to dynamically import got (ESM in CommonJS)
async function getGot() {
    if (!gotPromise) {
        gotPromise = import('got').then(mod => mod.default);
    }
    return gotPromise;
}

// Create a cache with a TTL (Time-To-Live) of 4 hours (14400 seconds)
const tokenCache = new NodeCache({ stdTTL: 14400 });

const cloudConfig = {
    url: 'https://technostationery.com/rest/',
    username: 'bot',
    password: '@dM1n$#@2o25B0T',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    } 
};
/*
consumerKey:'e8o87enwqqvdpv9i98sgoyxj6hiscvp6',	
consumerSecret: '4jg5fgp4pcu16buzyjznk4jb3exjjwxb',
access_token: 'g9w6zt4c7272gy85pzss2nmisg6n81aa',
access_token_secret: 'arwh37l3vlgx8519z50a1kzx8wo30n3u'
c1q9ww6eayiivf66pfgk2wcv6nchdcj3
ef6dows7v1oftrs6dxqog2idjuxk2pyk
5zfldcagvgahb3464cpry0ulsv39jtma
uadyiehnl9x93g1une3x4ny876okvy3v
*/
/*let cloudConfig = {
    url: 'https://technostationery.com/rest/',
    /*username: 'mounir.ab',
    password: 'M0un1r$@2o24'
};
 */
let betaConfig = {
    url: 'https://beta.technostationery.com/rest/',
    username: 'admintms',
    password: 'Admin-2025'
};


// Get Magento Admin Token (with caching, using got, with robust timeout/retry/logging)
async function getMagentoToken(config) {
    const cachedToken = tokenCache.get(config.url);
    if (cachedToken) {
        console.log("🔄 Using cached token");
        return cachedToken;
    }

    const authEndpoint = `${config.url}V1/integration/admin/token`;
    try {
        const got = await getGot();
        const response = await got.post(authEndpoint, {
            json: {
                username: config.username,
                password: config.password
            },
            responseType: 'json',
            timeout: { request: 30000 }, // 30s for slow auth
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            retry: {
                limit: 2,
                statusCodes: [408, 429, 500, 502, 503, 504],
                errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN'],
                calculateDelay: ({ attemptCount, retryOptions, retryAfter }) => {
                    if (attemptCount > retryOptions.limit) return 0;
                    if (retryAfter) return retryAfter * 1000;
                    return Math.min(5000, 1000 * Math.pow(2, attemptCount - 1));
                }
            }
        });
        const token = response.body;
        console.log("✅  Magento Authentication successful!");
        tokenCache.set(config.url, token); // Store in cache
        return token;
    } catch (error) {
        if (error.response) {
            let errBody = error.response.body;
            try {
                errBody = typeof errBody === 'string' ? JSON.parse(errBody) : errBody;
            } catch (e) {}
            console.error("❌ Authentication failed:", errBody || error.message, '\nStack:', error.stack);
        } else {
            console.error("❌ Authentication failed:", error.message, '\nStack:', error.stack);
        }
        throw new Error("Magento authentication failed");
    }
}



export { cloudConfig, betaConfig, getMagentoToken };