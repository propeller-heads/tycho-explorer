#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const LOGOS_DIR = path.join(__dirname, '..', 'public', 'logos');
const RATE_LIMIT_DELAY = 2400;
const PROGRESS_FILE = path.join(LOGOS_DIR, '.download-progress.json');
const API_KEY = process.env.COINGECKO_API_KEY;

// Ensure logos directory exists
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

// Load progress from previous run
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to load progress file:', e.message);
  }
  return { processedCoins: [], lastIndex: 0 };
}

// Save progress
function saveProgress(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (e) {
    console.error('Failed to save progress:', e.message);
  }
}

// Fetch JSON from URL
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {}
    };
    
    // Add API key header if available
    if (API_KEY) {
      options.headers['x-cg-api-key'] = API_KEY;
    }

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // Check if this is an error response
          if (res.statusCode !== 200) {
            resolve({
              success: false,
              statusCode: res.statusCode,
              data: parsed,
              error: parsed.status?.error_message || `HTTP ${res.statusCode}`
            });
          } else {
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: parsed
            });
          }
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Check if logo already exists
function logoExists(coinId) {
  return fs.existsSync(path.join(LOGOS_DIR, `${coinId}.png`));
}

// Sleep for specified milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Seeded random number generator
function seededRandom(seed) {
  let value = seed;
  return function() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// Fisher-Yates shuffle with seeded random
function shuffleArray(array, seed) {
  const arr = [...array]; // Create a copy
  const random = seededRandom(seed);
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr;
}

// Get current timestamp
function timestamp() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

// Fetch with retry logic and exponential backoff
async function fetchWithRetry(url, coinId, maxRetries = 10) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchJson(url);
      
      if (response.success) {
        return response.data;
      }
      
      // Check for rate limit error
      if (response.statusCode === 429 || response.data?.status?.error_code === 429) {
        const backoffTime = Math.pow(2.4, attempt + 1) * 1000; // 1s, 2s, 4s, 8s, 16s
        console.log(`\n[${timestamp()}] [RATE LIMIT] Hit rate limit for ${coinId}`);
        console.log(`[${timestamp()}] Error message: ${response.error}`);
        console.log(`[${timestamp()}] Waiting ${backoffTime/1000}s before retry (attempt ${attempt + 1}/${maxRetries})`);
        
        // Show countdown
        for (let i = Math.floor(backoffTime/1000); i > 0; i--) {
          process.stdout.write(`\rRetrying in ${i}... `);
          await sleep(1000);
        }
        process.stdout.write('\r                    \r'); // Clear countdown line
        
        lastError = response.error;
        continue; // Try again
      }
      
      // Other errors, don't retry
      throw new Error(response.error);
      
    } catch (error) {
      // Network errors, retry with backoff
      if (attempt < maxRetries - 1) {
        const backoffTime = Math.pow(2.4, attempt + 1) * 1000;
        console.log(`\n[${timestamp()}] [NETWORK ERROR] Failed to fetch ${coinId}: ${error.message}`);
        console.log(`[${timestamp()}] Waiting ${backoffTime/1000}s before retry (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(backoffTime);
        lastError = error.message;
      } else {
        throw error;
      }
    }
  }
  
  // All retries exhausted
  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError}`);
}

// Main function
async function downloadAllLogos() {
  console.log('Starting logo download process...');
  console.log(`Logos will be saved to: ${LOGOS_DIR}`);
  console.log(`Rate limit delay ${RATE_LIMIT_DELAY}ms`);
  console.log(`API Key: ${API_KEY ? 'Provided' : 'Not provided (using public API)'}`);
  console.log('');

  try {
    // Load previous progress
    const progress = loadProgress();
    console.log(`Resuming from coin index: ${progress.lastIndex}`);

    // Fetch coin list
    console.log('Fetching coin list from CoinGecko...');
    let coins;
    try {
      coins = await fetchWithRetry('https://api.coingecko.com/api/v3/coins/list', 'coin-list');
    } catch (error) {
      console.error(`\n[${timestamp()}] Failed to fetch coin list: ${error.message}`);
      console.error('Cannot proceed without coin list. Please try again later.');
      process.exit(1);
    }
    console.log(`Found ${coins.length} coins total`);
    
    // Shuffle coins with seed 42 for consistent random order
    console.log('Shuffling coins list with seed 42...');
    coins = shuffleArray(coins, 42);
    console.log('');

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    let rateLimitHits = 0;

    // Process each coin
    for (let i = progress.lastIndex; i < coins.length; i++) {
      const coin = coins[i];
      const logoPath = path.join(LOGOS_DIR, `${coin.id}.png`);

      // Update progress
      progress.lastIndex = i;
      progress.processedCoins.push(coin.id);

      // Check if logo already exists
      if (logoExists(coin.id)) {
        skipped++;
        process.stdout.write(`\r[${i + 1}/${coins.length}] Skipped: ${coin.id} (already exists) | Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed} | Rate limits: ${rateLimitHits}`);
        continue;
      }

      try {
        // Fetch coin details with retry logic
        const coinDetails = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${coin.id}`,
          coin.id
        );
        
        if (coinDetails.image && coinDetails.image.large) {
          // Download the image
          await downloadImage(coinDetails.image.large, logoPath);
          downloaded++;
          process.stdout.write(`\r[${i + 1}/${coins.length}] Downloaded: ${coin.id} | Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed} | Rate limits: ${rateLimitHits}`);
        } else {
          failed++;
          console.error(`\n[${timestamp()}] No image or image.large for ${coin.id}`);
          process.stdout.write(`\r[${i + 1}/${coins.length}] No image for: ${coin.id} | Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed} | Rate limits: ${rateLimitHits}`);
        }
      } catch (error) {
        failed++;
        // Check if this was a rate limit failure
        if (error.message.includes('429') || error.message.includes('Rate Limit')) {
          rateLimitHits++;
          console.error(`\n[${timestamp()}] [RATE LIMIT EXHAUSTED] Failed to fetch ${coin.id} after all retries`);
        } else {
          console.error(`\n[${timestamp()}] Error processing ${coin.id}: ${error.message}`);
        }
        process.stdout.write(`\r[${i + 1}/${coins.length}] Failed: ${coin.id} | Downloaded: ${downloaded} | Skipped: ${skipped} | Failed: ${failed} | Rate limits: ${rateLimitHits}`);
      }

      // Save progress periodically
      if (i % 10 === 0) {
        saveProgress(progress);
      }

      // Rate limiting - wait before next request
      if (i < coins.length - 1) {
        await sleep(RATE_LIMIT_DELAY);
      }
    }

    console.log('\n\nDownload complete!');
    console.log(`Total coins processed: ${coins.length}`);
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Skipped (already existed): ${skipped}`);
    console.log(`Failed: ${failed}`);
    if (rateLimitHits > 0) {
      console.log(`Rate limit failures: ${rateLimitHits} (after exhausting all retries)`);
    }

    // Clean up progress file
    try {
      fs.unlinkSync(PROGRESS_FILE);
      console.log('\nProgress file cleaned up.');
    } catch (e) {
      // Ignore cleanup errors
    }

  } catch (error) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
downloadAllLogos().catch(console.error);