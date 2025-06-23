# Token Logo Cache

This directory contains cached token logos from CoinGecko to improve loading performance and reduce API calls.

## Usage

### Downloading Logos

To download all token logos:

```bash
# Without API key (uses public rate limits)
npm run download-logos

# With API key (recommended for faster downloads)
COINGECKO_API_KEY=your-api-key npm run download-logos
```

### How It Works

1. **Development**: Run the download script to fetch logos
2. **Commit**: Add downloaded logos to Git
3. **Production**: Nginx serves these static logos
4. **Runtime**: Browser loads from `/logos/{coinId}.png`, falls back to CoinGecko API if not found

### Rate Limits

- **Without API key**: 25 requests per minute (public API safe limit)
- **With API key**: 25 requests per minute (conservative to avoid issues)

### Notes

- The script can be interrupted and resumed (progress is saved)
- Already downloaded logos are skipped
- Failed downloads are logged but don't stop the process
- Large files should be reviewed before committing to Git