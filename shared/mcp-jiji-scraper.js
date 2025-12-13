/**
 * JIJI MCP Server - Lead Generation
 * BUZZ: Lead generation for vendor acquisition
 *
 * Scrapes Jiji Ghana for active vendors and scores them
 * Returns high-quality leads for WhatsApp outreach
 *
 * Tool: To be used with Claude's Model Context Protocol
 * Or called directly from n8n workflows
 *
 * Cost: Free (web scraping)
 * Time: 1-2 minutes per 100 vendors
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import pino from 'pino';

const logger = pino();

// ============================================================================
// CONFIGURATION
// ============================================================================

const JIJI_BASE_URL = 'https://jiji.ng'; // Ghana version
const JIJI_SEARCH_URL = 'https://jiji.ng/search';

// Categories that work well on Beeline
const TARGET_CATEGORIES = [
  'electronics',
  'fashion',
  'food-and-drinks',
  'furniture-and-home',
  'services',
  'health-and-beauty',
  'bags-shoes-and-accessories'
];

// ============================================================================
// MCP TOOLS (For Claude integration)
// ============================================================================

export const mcp_tools = {
  name: 'jiji-scraper',
  version: '1.0.0',
  tools: [
    {
      name: 'search_jiji_listings',
      description: 'Search Jiji for product listings in a specific category. Returns vendor contact info and product details.',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: TARGET_CATEGORIES,
            description: 'Product category to search'
          },
          limit: {
            type: 'number',
            description: 'Max listings to return (1-100)',
            default: 50
          },
          page: {
            type: 'number',
            description: 'Page number (for pagination)',
            default: 1
          }
        },
        required: ['category']
      }
    },
    {
      name: 'extract_vendor_data',
      description: 'Extract detailed vendor information from a Jiji listing',
      inputSchema: {
        type: 'object',
        properties: {
          jiji_listing_url: {
            type: 'string',
            description: 'Full URL to Jiji listing'
          },
          include_phone: {
            type: 'boolean',
            description: 'Extract phone number if visible',
            default: true
          }
        },
        required: ['jiji_listing_url']
      }
    },
    {
      name: 'score_vendor_quality',
      description: 'Score a vendor based on sales volume, ratings, and response time. Returns score 0-100.',
      inputSchema: {
        type: 'object',
        properties: {
          vendor_name: {
            type: 'string',
            description: 'Vendor name on Jiji'
          },
          category: {
            type: 'string',
            description: 'Product category'
          },
          listing_count: {
            type: 'number',
            description: 'Number of active listings'
          },
          rating: {
            type: 'number',
            description: 'Seller rating (0-5)'
          },
          response_time_hours: {
            type: 'number',
            description: 'Estimated response time in hours'
          }
        },
        required: ['vendor_name', 'category']
      }
    }
  ]
};

// ============================================================================
// SCRAPING FUNCTIONS
// ============================================================================

/**
 * Search Jiji for listings in a category
 */
export async function searchJijiListings(category, limit = 50, page = 1) {
  try {
    logger.info(`Searching Jiji for ${category} (page ${page})`);

    const url = `${JIJI_SEARCH_URL}?category=${category}&page=${page}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const listings = [];

    // Parse listings (adjust selector based on actual Jiji HTML)
    $('.listing-item, .item-card, [data-listing-id]').slice(0, limit).each((index, element) => {
      try {
        const title = $(element).find('h2, .title, .listing-title').text().trim();
        const price = $(element).find('.price, .amount').text().trim();
        const vendorName = $(element).find('.seller-name, .vendor-name').text().trim();
        const listingUrl = $(element).find('a').attr('href');
        const imageUrl = $(element).find('img').attr('src');

        if (title && listingUrl) {
          listings.push({
            title,
            price,
            vendorName: vendorName || 'Unknown',
            listingUrl: `${JIJI_BASE_URL}${listingUrl}`,
            imageUrl,
            category
          });
        }
      } catch (e) {
        logger.debug(`Failed to parse listing: ${e.message}`);
      }
    });

    logger.info(`Found ${listings.length} listings in ${category}`);
    return listings;
  } catch (error) {
    logger.error(error, `Failed to search Jiji for ${category}`);
    throw error;
  }
}

/**
 * Extract detailed vendor info from a listing
 */
export async function extractVendorData(listingUrl) {
  try {
    logger.info(`Extracting vendor data from: ${listingUrl}`);

    const response = await axios.get(listingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extract phone (often hidden or requires clicking)
    let phone = null;
    const phonePattern = /(\+?234|0)\d{10}/g;
    const pageText = $.text();
    const matches = pageText.match(phonePattern);
    if (matches) {
      phone = matches[0];
      // Normalize to Ghana format (+233...)
      if (phone.startsWith('0')) {
        phone = '+233' + phone.slice(1);
      } else if (phone.startsWith('234')) {
        phone = '+' + phone;
      }
    }

    // Extract vendor info
    const vendorName = $('.seller-name, .vendor-name, [data-seller-name]').text().trim();
    const vendorRating = parseFloat(
      $('.rating, .seller-rating, [data-rating]').first().text() || '0'
    );
    const reviewCount = parseInt(
      $('.review-count, [data-reviews]').text().match(/\d+/) || [0]
    );

    return {
      vendorName,
      phone,
      rating: vendorRating,
      reviewCount,
      url: listingUrl,
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error(error, 'Failed to extract vendor data');
    throw error;
  }
}

/**
 * Score vendor quality for Beeline fit
 */
export function scoreVendorQuality(vendorData) {
  const { category, listingCount = 0, rating = 0, responseTimeHours = 24 } = vendorData;

  let score = 0;

  // Rating: 0-30 points (max 5 stars)
  score += Math.min(30, rating * 6);

  // Listing count: 0-40 points (200+ listings = max)
  score += Math.min(40, (listingCount / 200) * 40);

  // Response time: 0-30 points (lower is better)
  const responseScore = Math.max(0, 30 - responseTimeHours / 2);
  score += Math.min(30, responseScore);

  // Category fit: 0-10 bonus points
  if (TARGET_CATEGORIES.includes(category)) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Find high-quality vendors (quality score > 70)
 */
export async function findHighQualityVendors(category, limit = 20) {
  try {
    const listings = await searchJijiListings(category, limit * 2); // Get 2x to filter
    const vendors = new Map(); // Dedup by vendor name

    for (const listing of listings) {
      if (!vendors.has(listing.vendorName)) {
        const vendorData = await extractVendorData(listing.listingUrl).catch(() => ({
          vendorName: listing.vendorName,
          phone: null
        }));

        const score = scoreVendorQuality({
          ...vendorData,
          category,
          listingCount: 1
        });

        if (score > 70) {
          vendors.set(listing.vendorName, {
            ...vendorData,
            category,
            qualityScore: score,
            sampleListing: listing
          });
        }
      }
    }

    const highQualityVendors = Array.from(vendors.values())
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, limit);

    logger.info(`Found ${highQualityVendors.length} high-quality vendors in ${category}`);
    return highQualityVendors;
  } catch (error) {
    logger.error(error, 'Failed to find high-quality vendors');
    throw error;
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Generate leads from multiple categories
 */
export async function generateLeads(categories = TARGET_CATEGORIES, vendorsPerCategory = 10) {
  const allLeads = [];

  for (const category of categories) {
    try {
      const vendors = await findHighQualityVendors(category, vendorsPerCategory);
      allLeads.push(...vendors);
    } catch (error) {
      logger.error(error, `Failed to generate leads for ${category}`);
    }
  }

  // Sort by quality score
  allLeads.sort((a, b) => b.qualityScore - a.qualityScore);

  logger.info(`Generated ${allLeads.length} total leads across ${categories.length} categories`);
  return allLeads;
}

// ============================================================================
// CLI / STANDALONE USAGE
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  // Run as standalone script
  (async () => {
    console.log('🐝 Jiji Lead Generation - MCP Server\n');

    // Generate leads from top 3 categories
    const topCategories = ['electronics', 'fashion', 'food-and-drinks'];
    const leads = await generateLeads(topCategories, 5);

    console.log('\nTop Leads:\n');
    leads.forEach((lead, idx) => {
      console.log(`${idx + 1}. ${lead.vendorName}`);
      console.log(`   Phone: ${lead.phone}`);
      console.log(`   Category: ${lead.category}`);
      console.log(`   Quality Score: ${lead.qualityScore}/100`);
      console.log(`   Rating: ${lead.rating}/5 (${lead.reviewCount} reviews)`);
      console.log('');
    });

    console.log(`\nTotal leads: ${leads.length}`);
  })().catch(console.error);
}

export default {
  searchJijiListings,
  extractVendorData,
  scoreVendorQuality,
  findHighQualityVendors,
  generateLeads,
  mcp_tools
};
