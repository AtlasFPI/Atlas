/**
 * Parsers for Spanish real estate websites
 * These functions extract structured data from websites using Puppeteer
 */

/**
 * Parse property data from Idealista
 * @param {Object} page - Puppeteer page
 * @param {string} htmlContent - HTML content of the page
 * @returns {Object} - Structured property data
 */
async function parseIdealista(page, htmlContent) {
  try {
    // Extract basic property information
    const propertyAddress = await page.evaluate(() => {
      // Try to find the address in different elements
      const addressContainer = document.querySelector('.main-info__title-main');
      const locationContainer = document.querySelector('.main-info__title-minor');
      
      const address = addressContainer ? addressContainer.textContent.trim() : '';
      const location = locationContainer ? locationContainer.textContent.trim() : '';
      
      return `${address}, ${location}`.trim();
    });

    // Extract price
    const purchasePrice = await page.evaluate(() => {
      const priceElement = document.querySelector('[data-testid="price"]');
      if (!priceElement) return null;
      
      const priceText = priceElement.textContent.trim();
      // Remove currency symbol and non-numeric characters
      return parseInt(priceText.replace(/[^0-9]/g, ''), 10);
    });

    // Extract property details
    const propertyDetails = await page.evaluate(() => {
      const details = {};
      
      // Extract square meters
      const sqmElement = document.querySelector('[data-testid="house-surface-area"]');
      if (sqmElement) {
        const sqmText = sqmElement.textContent.trim();
        details.squareMeters = parseInt(sqmText.match(/\\d+/)[0], 10);
      }
      
      // Extract bedrooms
      const bedroomsElement = document.querySelector('[data-testid="house-bedrooms"]');
      if (bedroomsElement) {
        const bedroomsText = bedroomsElement.textContent.trim();
        details.bedrooms = parseInt(bedroomsText.match(/\\d+/)[0], 10);
      }
      
      // Extract bathrooms
      const bathroomsElement = document.querySelector('[data-testid="house-bathrooms"]');
      if (bathroomsElement) {
        const bathroomsText = bathroomsElement.textContent.trim();
        details.bathrooms = parseInt(bathroomsText.match(/\\d+/)[0], 10);
      }
      
      // Property type
      const propertyTypeElement = document.querySelector('.property-type');
      if (propertyTypeElement) {
        details.propertyType = propertyTypeElement.textContent.trim();
      }
      
      return details;
    });

    // Extract additional features
    const features = await page.evaluate(() => {
      const featuresContainer = document.querySelector('.details-property-feature-one');
      if (!featuresContainer) return [];
      
      const featureItems = Array.from(featuresContainer.querySelectorAll('li'));
      return featureItems.map(item => item.textContent.trim());
    });

    // Extract location data
    const locationData = await page.evaluate(() => {
      const cityElement = document.querySelector('.main-info__title-minor');
      return cityElement ? cityElement.textContent.trim() : '';
    });

    // Estimate rent based on purchase price and location
    // In a real implementation, you would use rental data from the area
    // This is a simplified estimation
    let estimatedMonthlyRent;
    if (purchasePrice) {
      // Average rental yield in Spain is around 4-5%
      // Monthly rent = (Purchase price * yearly yield) / 12
      estimatedMonthlyRent = Math.round((purchasePrice * 0.045) / 12);
    }
    
    // Construct structured data
    return {
      propertyAddress,
      location: locationData,
      purchasePrice,
      estimatedMonthlyRent,
      squareMeters: propertyDetails.squareMeters || 0,
      bedrooms: propertyDetails.bedrooms || 0,
      bathrooms: propertyDetails.bathrooms || 0,
      propertyType: propertyDetails.propertyType || 'Apartment',
      features,
      source: {
        platform: 'idealista',
        url: page.url(),
        scrapedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error parsing Idealista data:', error);
    throw new Error(`Failed to parse Idealista data: ${error.message}`);
  }
}

/**
 * Parse property data from Fotocasa
 * @param {Object} page - Puppeteer page
 * @param {string} htmlContent - HTML content of the page
 * @returns {Object} - Structured property data
 */
async function parseFotocasa(page, htmlContent) {
  try {
    // Extract basic property information
    const propertyAddress = await page.evaluate(() => {
      const addressContainer = document.querySelector('.re-DetailHeader-propertyTitle');
      return addressContainer ? addressContainer.textContent.trim() : '';
    });

    // Extract price
    const purchasePrice = await page.evaluate(() => {
      const priceElement = document.querySelector('.re-DetailHeader-price');
      if (!priceElement) return null;
      
      const priceText = priceElement.textContent.trim();
      // Remove currency symbol and non-numeric characters
      return parseInt(priceText.replace(/[^0-9]/g, ''), 10);
    });

    // Extract property details
    const propertyDetails = await page.evaluate(() => {
      const details = {};
      
      // Extract features from the characteristics list
      const featureElements = document.querySelectorAll('.re-DetailFeaturesList-featureLabel');
      
      featureElements.forEach(element => {
        const featureText = element.textContent.trim();
        const valueElement = element.nextElementSibling;
        const valueText = valueElement ? valueElement.textContent.trim() : '';
        
        if (featureText.includes('Superficie')) {
          details.squareMeters = parseInt(valueText.match(/\\d+/)[0], 10);
        } else if (featureText.includes('Habitaciones')) {
          details.bedrooms = parseInt(valueText.match(/\\d+/)[0], 10);
        } else if (featureText.includes('Baños')) {
          details.bathrooms = parseInt(valueText.match(/\\d+/)[0], 10);
        } else if (featureText.includes('Tipo')) {
          details.propertyType = valueText;
        }
      });
      
      return details;
    });

    // Extract location data
    const locationData = await page.evaluate(() => {
      const locationElement = document.querySelector('.re-DetailMap-address');
      return locationElement ? locationElement.textContent.trim() : '';
    });

    // Estimate rent based on purchase price
    let estimatedMonthlyRent;
    if (purchasePrice) {
      // Average rental yield in Spain is around 4-5%
      estimatedMonthlyRent = Math.round((purchasePrice * 0.045) / 12);
    }
    
    // Construct structured data
    return {
      propertyAddress,
      location: locationData,
      purchasePrice,
      estimatedMonthlyRent,
      squareMeters: propertyDetails.squareMeters || 0,
      bedrooms: propertyDetails.bedrooms || 0,
      bathrooms: propertyDetails.bathrooms || 0,
      propertyType: propertyDetails.propertyType || 'Apartment',
      source: {
        platform: 'fotocasa',
        url: page.url(),
        scrapedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error parsing Fotocasa data:', error);
    throw new Error(`Failed to parse Fotocasa data: ${error.message}`);
  }
}

/**
 * Parse property data from Habitaclia
 * @param {Object} page - Puppeteer page
 * @param {string} htmlContent - HTML content of the page
 * @returns {Object} - Structured property data
 */
async function parseHabitaclia(page, htmlContent) {
  try {
    // Extract basic property information
    const propertyAddress = await page.evaluate(() => {
      const addressContainer = document.querySelector('.property-title');
      return addressContainer ? addressContainer.textContent.trim() : '';
    });

    // Extract price
    const purchasePrice = await page.evaluate(() => {
      const priceElement = document.querySelector('.price');
      if (!priceElement) return null;
      
      const priceText = priceElement.textContent.trim();
      // Remove currency symbol and non-numeric characters
      return parseInt(priceText.replace(/[^0-9]/g, ''), 10);
    });

    // Extract property details
    const propertyDetails = await page.evaluate(() => {
      const details = {};
      
      // Square meters
      const sqmElement = document.querySelector('.feature-container .icon-m2 + span');
      if (sqmElement) {
        details.squareMeters = parseInt(sqmElement.textContent.trim().match(/\\d+/)[0], 10);
      }
      
      // Bedrooms
      const bedroomsElement = document.querySelector('.feature-container .icon-rooms + span');
      if (bedroomsElement) {
        details.bedrooms = parseInt(bedroomsElement.textContent.trim().match(/\\d+/)[0], 10);
      }
      
      // Bathrooms
      const bathroomsElement = document.querySelector('.feature-container .icon-bathrooms + span');
      if (bathroomsElement) {
        details.bathrooms = parseInt(bathroomsElement.textContent.trim().match(/\\d+/)[0], 10);
      }
      
      // Property type
      const breadcrumbItems = document.querySelectorAll('.breadcrumb li');
      if (breadcrumbItems.length > 0) {
        details.propertyType = breadcrumbItems[breadcrumbItems.length - 1].textContent.trim();
      }
      
      return details;
    });

    // Extract location data
    const locationData = await page.evaluate(() => {
      const locationElement = document.querySelector('.location');
      return locationElement ? locationElement.textContent.trim() : '';
    });

    // Estimate rent based on purchase price
    let estimatedMonthlyRent;
    if (purchasePrice) {
      // Average rental yield in Spain is around 4-5%
      estimatedMonthlyRent = Math.round((purchasePrice * 0.045) / 12);
    }
    
    // Construct structured data
    return {
      propertyAddress,
      location: locationData,
      purchasePrice,
      estimatedMonthlyRent,
      squareMeters: propertyDetails.squareMeters || 0,
      bedrooms: propertyDetails.bedrooms || 0,
      bathrooms: propertyDetails.bathrooms || 0,
      propertyType: propertyDetails.propertyType || 'Apartment',
      source: {
        platform: 'habitaclia',
        url: page.url(),
        scrapedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error parsing Habitaclia data:', error);
    throw new Error(`Failed to parse Habitaclia data: ${error.message}`);
  }
}

module.exports = {
  parseIdealista,
  parseFotocasa,
  parseHabitaclia
}; 