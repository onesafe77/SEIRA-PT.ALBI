const fetch = require('node-fetch');

/**
 * Send a WhatsApp message via Notif.my.id API.
 * @param {string} target - Phone number (e.g. 6285126406588)
 * @param {string} message - Message text
 * @returns {Promise<{success: boolean, detail?: any}>}
 */
async function sendWhatsApp(target, message) {
    const apiKey = process.env.NOTIFYME_API_KEY;
    if (!apiKey) {
        console.error('[WA] NOTIFYME_API_KEY not set');
        return { success: false, detail: 'API key not configured' };
    }

    try {
        const params = new URLSearchParams({
            apikey: apiKey,
            receiver: target,
            mtype: 'text',
            text: message,
            duration: '3000'
        });

        const url = `https://app.notif.my.id/api/send-message?${params.toString()}`;
        const response = await fetch(url);
        const result = await response.json();

        console.log('[WA] Response:', JSON.stringify(result));
        return { success: result.status === true, detail: result };
    } catch (error) {
        console.error('[WA] Error:', error.message);
        return { success: false, detail: error.message };
    }
}

module.exports = { sendWhatsApp };
