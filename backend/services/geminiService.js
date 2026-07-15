const { apiKey } = require('../config/gemini');

/**
 * City Travel Guide powered by Gemini AI.
 * Falls back to lighter model variants if the primary model is busy/overloaded (503).
 *
 * @param {string} city   - The destination city the user wants to explore.
 * @param {string} query  - The user's travel-related question about that city.
 * @returns {Promise<{answer: string}>}
 */
const getCityTravelGuide = async (city, query) => {
  const systemPrompt = `You are a knowledgeable, friendly City Travel Assistant for RideVista — India's premium local vehicle rental platform.

The user is planning a trip to **${city}** and needs travel guidance.

Their question: "${query}"

Guidelines:
1. Answer ONLY travel-related questions about ${city}: sightseeing, itineraries, food, culture, shopping, festivals, weather, safety, photography spots, nearby destinations, local markets, hidden gems, etc.
2. If the question is unrelated to travel or not about ${city}, politely decline and remind the user to ask about travel in ${city}.
3. Structure your response clearly using markdown headings, bullet points or short paragraphs.
4. Be specific to the real geography, culture and landmarks of ${city}, India.
5. Keep the response helpful, enthusiastic, and under 200 words.
6. At the end, add a short RideVista tip: suggest that the user can explore these places by renting a local vehicle through RideVista.`;

  if (!apiKey) {
    return {
      answer: `🗺️ **City Travel Guide — ${city}**\n\n*(AI key not configured — showing sample response)*\n\n${city} is a vibrant city with plenty to explore! Consider visiting local landmarks, trying regional cuisine, and exploring nearby destinations. Use RideVista to rent a local vehicle for the most authentic experience.`
    };
  }

  const geminiPrompt = {
    contents: [
      {
        parts: [{ text: systemPrompt }]
      }
    ]
  };

  // Sequence of models to try in case of transient errors or quota limits
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest'
  ];

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const apiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPrompt)
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        throw new Error(`API error ${apiResponse.status} for ${model}: ${errText}`);
      }

      const apiData = await apiResponse.json();
      const answer = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answer) {
        throw new Error(`Empty response returned for ${model}`);
      }

      // If we got a successful answer, return it immediately
      return { answer };

    } catch (error) {
      console.warn(`[Gemini Fallback Warning] Model ${model} failed:`, error.message);
      lastError = error;
      // Continue to next model in loop
    }
  }

  // If we exhaust all models, throw the last encountered error
  throw lastError || new Error('All candidate models failed to generate content');
};

module.exports = {
  getCityTravelGuide,
};
