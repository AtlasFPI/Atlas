const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { scrapeProperty, calculateInvestmentMetrics } = require('./propertyScraperService');
const OpenAI = require('openai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client (for AI scoring)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Add your API key in .env file
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Fallback mock data for testing
const mockData = {
  propertyAddress: 'Calle Gran Vía 28, Madrid, España',
  marketTrends: {
    priceHistory: [
      { date: '2023-01', price: 380000 },
      { date: '2023-04', price: 395000 },
      { date: '2023-07', price: 410000 },
      { date: '2023-10', price: 425000 },
      { date: '2024-01', price: 440000 },
      { date: '2024-04', price: 450000 },
    ],
    rentalYield: 5.2,
    areaGrowth: 4.8,
    similarProperties: [
      {
        address: 'Calle Gran Vía 30',
        price: 465000,
        sqft: 95,
        pricePerSqft: 4895
      },
      {
        address: 'Calle Princesa 15',
        price: 445000,
        sqft: 90,
        pricePerSqft: 4944
      },
      {
        address: 'Plaza España 4',
        price: 490000,
        sqft: 100,
        pricePerSqft: 4900
      }
    ]
  }
};

/**
 * Generate a property analysis using AI
 * @param {Object} propertyData - Property data
 * @returns {Object} - AI analysis
 */
async function generateAIAnalysis(propertyData) {
  try {
    // Simple scoring algorithm as fallback
    const rentalYieldScore = Math.min(propertyData.financialMetrics.rentalYield * 10, 50);
    const riskScore = Math.min(propertyData.riskAssessment.score * 0.3, 30);
    const locationScore = Math.min((propertyData.squareMeters > 70 ? 80 : 60) / 20 * 10, 20);
    
    // Combine the scores
    const totalScore = Math.round(rentalYieldScore + riskScore + locationScore);
    
    // If OpenAI API key is available, use it for sophisticated analysis
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a real estate investment analysis AI. Analyze the property data and provide an investment score from 0-100 based on rental yield, location quality, and risk assessment."
            },
            {
              role: "user",
              content: `Analyze this Spanish property as an investment:\n${JSON.stringify(propertyData, null, 2)}`
            }
          ],
          temperature: 0.5,
          max_tokens: 500,
        });
        
        // Extract a score from the AI response
        const aiResponse = response.choices[0]?.message?.content || '';
        const scoreMatch = aiResponse.match(/score.*?(\d+)/i);
        
        if (scoreMatch && scoreMatch[1]) {
          return {
            score: parseInt(scoreMatch[1]),
            analysis: aiResponse
          };
        }
      } catch (error) {
        console.error("Error calling OpenAI:", error);
        // Fall back to the simple algorithm if API call fails
      }
    }
    
    return {
      score: totalScore,
      analysis: `Property analysis complete. This property has a rental yield of ${propertyData.financialMetrics.rentalYield.toFixed(2)}%, which is ${propertyData.financialMetrics.rentalYield > 5 ? 'good' : 'average'} for the Spanish market. The risk assessment is ${propertyData.riskAssessment.overall.toLowerCase()}, and the location scores are excellent.`
    };
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return {
      score: 70, // Default fallback score
      analysis: "Analysis could not be completed. Using estimated score based on available data."
    };
  }
}

// API endpoint for property scraping
app.post('/api/property-analysis', async (req, res) => {
  try {
    const { url, platform, useMockData } = req.body;
    
    if (!url && !useMockData) {
      return res.status(400).json({
        success: false,
        message: 'URL is required',
        error: 'Missing URL'
      });
    }
    
    let propertyData;
    
    if (useMockData) {
      // Use mock data for testing
      propertyData = {
        ...mockData,
        purchasePrice: 450000,
        estimatedMonthlyRent: 1950,
        squareMeters: 90,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: 'Apartment',
        location: platform === 'idealista' ? 'Madrid' : platform === 'fotocasa' ? 'Barcelona' : 'Valencia',
        source: {
          platform,
          url: url || 'https://example.com',
          scrapedAt: new Date().toISOString()
        }
      };
    } else {
      // Perform real web scraping
      try {
        const scrapedData = await scrapeProperty(url, platform);
        propertyData = scrapedData;
      } catch (scrapeError) {
        console.error('Scraping error:', scrapeError);
        return res.status(400).json({
          success: false,
          message: 'Failed to scrape property data',
          error: scrapeError.message
        });
      }
    }
    
    // Calculate investment metrics
    const enhancedPropertyData = calculateInvestmentMetrics(propertyData);
    
    // Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(enhancedPropertyData);
    
    // Add AI score to the response
    const finalPropertyData = {
      ...enhancedPropertyData,
      atlasScore: aiAnalysis.score,
      aiAnalysis: aiAnalysis.analysis
    };
    
    // Return response
    return res.json({
      success: true,
      message: 'Property analysis completed',
      data: {
        url,
        scrapedAt: new Date().toISOString(),
        propertyDetails: finalPropertyData,
        platform
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Property scraper API running on port ${PORT}`);
}); 