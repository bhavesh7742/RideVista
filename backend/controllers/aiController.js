const geminiService = require('../services/geminiService');

/**
 * CITY TRAVEL GUIDE ENDPOINT
 *
 * POST /api/ai/travel
 * Body: { city: string, query: string }
 *
 * Returns Gemini-generated travel advice for the specified city.
 */
const getCityTravelGuide = async (req, res) => {
  try {
    const { city, query } = req.body;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a city name to get travel guidance.',
      });
    }

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please ask a question about the city.',
      });
    }

    const result = await geminiService.getCityTravelGuide(city.trim(), query.trim());

    return res.status(200).json({
      success: true,
      city: city.trim(),
      answer: result.answer,
    });

  } catch (error) {
    console.error(error);
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: 'Sorry, the travel assistant is temporarily unavailable. Please try again.',
    });
  }
};

module.exports = {
  getCityTravelGuide,
};
