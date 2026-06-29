const axios = require('axios');

/**
 * Sends an SMS message using the Hormuud SMS API.
 * Handles authentication internally if the API requires a bearer token.
 * 
 * @param {string} phone - The recipient phone number (e.g., +25261XXXXXXX)
 * @param {string} message - The SMS content to send
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const sendSMS = async (phone, message) => {
  try {
    const apiUrl = process.env.SMS_API_URL;
    const clientId = process.env.SMS_CLIENT_ID;
    const secretKey = process.env.SMS_SECRET_KEY;

    // Check if credentials exist; if not, just simulate sending (useful for dev/mock mode)
    const isPlaceholder = !apiUrl || !clientId || !secretKey
      || apiUrl.includes('your_') || clientId.includes('your_') || secretKey.includes('your_')
      || apiUrl.includes('example') || apiUrl.includes('test');
    if (isPlaceholder) {
      console.log(`\n[SMS SIMULATION] To: ${phone}\nMessage: ${message}\n`);
      return true;
    }

    // Example payload for a typical SMS gateway - adjust according to Hormuud's exact documentation
    const payload = {
      mobile: phone,
      message: message,
      sender_id: 'BooqashoApp' // Often required by gateways
    };

    // Make the API request
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}` // Basic Auth example
      }
    });

    console.log(`[SMS SUCCESS] Sent to ${phone}. Response: ${response.status}`);
    return true;

  } catch (error) {
    console.error(`[SMS ERROR] Failed to send SMS to ${phone}. Error:`, error.message);
    return false;
  }
};

module.exports = {
  sendSMS
};
