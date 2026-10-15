const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin if needed
const admin = require("firebase-admin");
admin.initializeApp();

// Create an HTTP Cloud Function to handle image generation securely
// Ensure you set the Gemini API Key in your Firebase environment:
// firebase secrets:set GEMINI_API_KEY
// Then update this to use defineSecret if on v2, or process.env for simplicity here.

exports.generateGameImage = onRequest({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (req, res) => {
    // Read the secret key from the environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        logger.error("Missing GEMINI_API_KEY secret in Firebase.");
        res.status(500).send({ error: 'Server configuration error: Missing API Key.' });
        return;
    }

    try {
        // The frontend sends the prompt in the request body
        const { prompt } = req.body;

        if (!prompt) {
            res.status(400).send({ error: 'Missing prompt in request body.' });
            return;
        }

        logger.info(`Generating image for prompt: ${prompt.substring(0, 50)}...`);

        // Call the Gemini API server-to-server (secure)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Return the data directly to the frontend
        res.json(data);

    } catch (error) {
        logger.error("Error generating image", error);
        res.status(500).json({ error: error.message });
    }
});
