const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { parseIdealista, parseFotocasa, parseHabitaclia } = require('./parsers');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Cache for recently scraped properties to avoid repeated scraping
const propertyCache = new Map();
const CACHE_TTL = 3600000; // 1 hour cache TTL

/**
 * Scrape property data from a Spanish real estate website
 * @param {string} url - The property listing URL
 * @param {string} platform - The platform name (idealista, fotocasa, habitaclia)
 * @returns {Promise<Object>} - Structured property data
 */
async function scrapeProperty(url, platform) {
  // Check cache first
  const cacheKey = `${platform}:${url}`;
  const cachedData = propertyCache.get(cacheKey);
  
  if (cachedData && cachedData.timestamp > Date.now() - CACHE_TTL) {
    console.log(`Using cached data for ${url}`);
    return cachedData.data;
  }
  
  console.log(`Scraping property from ${platform}: ${url}`);
  
  let browser = null;
  try {
    // Launch browser with stealth mode
    browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });

    const page = await browser.newPage();
    
    // Set reasonable viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to appear as a regular browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    // Enable JavaScript
    await page.setJavaScriptEnabled(true);
    
    // Add random delay between requests to avoid detection
    await page.waitForTimeout(Math.floor(Math.random() * 1000) + 500);
    
    // Navigate to URL with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for main content to load
    await page.waitForTimeout(2000);
    
    // Get HTML content
    const htmlContent = await page.content();
    
    // Parse based on platform
    let propertyData;
    
    switch (platform.toLowerCase()) {
      case 'idealista':
        propertyData = await parseIdealista(page, htmlContent);
        break;
      case 'fotocasa':
        propertyData = await parseFotocasa(page, htmlContent);
        break;
      case 'habitaclia':
        propertyData = await parseHabitaclia(page, htmlContent);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Add to cache
    propertyCache.set(cacheKey, {
      timestamp: Date.now(),
      data: propertyData
    });
    
    return propertyData;
    
  } catch (error) {
    console.error(`Error scraping property from ${platform}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Calculate additional investment metrics from scraped data
 * @param {Object} propertyData - Basic property data
 * @returns {Object} - Enhanced property data with investment metrics
 */
function calculateInvestmentMetrics(propertyData) {
  const {
    purchasePrice,
    estimatedMonthlyRent,
    squareMeters,
    location
  } = propertyData;
  
  // Calculate annual rental income
  const annualRentalIncome = estimatedMonthlyRent * 12;
  
  // Estimate expenses (property tax, insurance, maintenance, etc.)
  const propertyTax = purchasePrice * 0.005; // 0.5% of purchase price
  const insurance = purchasePrice * 0.002; // 0.2% of purchase price
  const maintenance = purchasePrice * 0.01; // 1% of purchase price
  const managementFees = annualRentalIncome * 0.08; // 8% of rental income
  
  const totalExpenses = propertyTax + insurance + maintenance + managementFees;
  
  // Calculate net operating income
  const netOperatingIncome = annualRentalIncome - totalExpenses;
  
  // Calculate cap rate
  const capRate = (netOperatingIncome / purchasePrice) * 100;
  
  // Calculate cash on cash return (assuming 30% down payment)
  const downPayment = purchasePrice * 0.3;
  const loanAmount = purchasePrice - downPayment;
  const interestRate = 3.5; // Assume 3.5% interest rate
  const loanTerm = 30; // 30 years
  
  // Calculate monthly mortgage payment
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalPayments = loanTerm * 12;
  const monthlyMortgagePayment = 
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
    (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
  
  const annualMortgagePayment = monthlyMortgagePayment * 12;
  const annualCashFlow = netOperatingIncome - annualMortgagePayment;
  const cashOnCashReturn = (annualCashFlow / downPayment) * 100;
  
  // Calculate rental yield
  const rentalYield = (annualRentalIncome / purchasePrice) * 100;
  
  // Calculate price per square meter
  const pricePerSquareMeter = purchasePrice / squareMeters;
  
  // Estimate risk based on location and other factors
  const riskAssessment = assessRisk(propertyData);
  
  return {
    ...propertyData,
    financialMetrics: {
      purchasePrice,
      estimatedMonthlyRent,
      annualRentalIncome,
      expenses: {
        propertyTax,
        insurance,
        maintenance,
        managementFees
      },
      totalExpenses,
      netOperatingIncome,
      capRate,
      cashOnCashReturn,
      rentalYield,
      pricePerSquareMeter,
      breakEvenOccupancy: (totalExpenses / annualRentalIncome) * 100,
      mortgagePayment: monthlyMortgagePayment
    },
    riskAssessment
  };
}

/**
 * Assess risk of the property investment
 * @param {Object} propertyData - Property data
 * @returns {Object} - Risk assessment
 */
function assessRisk(propertyData) {
  // This is a simple risk assessment algorithm
  // In a real-world scenario, you would use more sophisticated models
  
  let score = 70; // Default score
  
  // Adjust score based on location
  if (propertyData.location.toLowerCase().includes('madrid') || 
      propertyData.location.toLowerCase().includes('barcelona')) {
    score += 10; // Prime locations
  }
  
  // Adjust based on rental yield
  const rentalYield = (propertyData.estimatedMonthlyRent * 12 / propertyData.purchasePrice) * 100;
  if (rentalYield > 5) {
    score += 10;
  } else if (rentalYield < 3) {
    score -= 10;
  }
  
  // Determine risk category
  let riskCategory;
  if (score >= 85) {
    riskCategory = 'Very Low';
  } else if (score >= 70) {
    riskCategory = 'Low';
  } else if (score >= 50) {
    riskCategory = 'Medium';
  } else if (score >= 30) {
    riskCategory = 'High';
  } else {
    riskCategory = 'Very High';
  }
  
  return {
    overall: riskCategory,
    score,
    factors: {
      location: propertyData.location,
      propertyType: propertyData.propertyType,
      rentalYield
    }
  };
}

module.exports = {
  scrapeProperty,
  calculateInvestmentMetrics
}; 