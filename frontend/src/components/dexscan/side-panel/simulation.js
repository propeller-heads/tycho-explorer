// Private: API URL management
const getApiUrl = (chain) => {
  const urls = {
    ethereum: import.meta.env.VITE_API_ETHEREUM_URL,
    base: import.meta.env.VITE_API_BASE_URL,
    unichain: import.meta.env.VITE_API_UNICHAIN_URL
  };
  
  const url = urls[chain.toLowerCase()];
  if (!url) {
    throw new Error(`No API URL configured for chain: ${chain}`);
  }
  return url;
};

// Private: Call API
const callAPI = async (tokenIn, poolId, amount, chain) => {
  const apiUrl = getApiUrl(chain);
  const requestBody = {
    sell_token: tokenIn,
    pools: [poolId],
    amount: amount
  };
  
  console.log('=== API REQUEST ===');
  console.log('URL:', `${apiUrl}/api/simulate`);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(`${apiUrl}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('API Response:', JSON.stringify(result, null, 2));
  
  return result;
};

// Public: Main factory function
export function createSimulation(pool, chain) {
  // Create a closure that captures pool and chain
  return async function simulate({ amount, sellToken, buyToken }) {
    try {
      // Validation
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Find tokens in pool
      const sellTokenData = pool.tokens.find(t => t.address === sellToken);
      const buyTokenData = pool.tokens.find(t => t.address === buyToken);
      
      // Call API
      const result = await callAPI(sellToken, pool.id, parseFloat(amount), chain);
      
      // Calculate results
      const outputAmount = parseFloat(result.output_amount);
      const inputAmount = parseFloat(amount);
      const exchangeRate = outputAmount / inputAmount;
      
      console.log('=== CALCULATION DETAILS ===');
      console.log('Input Amount:', inputAmount);
      console.log('Output Amount:', outputAmount);
      console.log('Exchange Rate (output/input):', exchangeRate);
      console.log('Sell Token:', sellTokenData?.symbol, sellToken);
      console.log('Buy Token:', buyTokenData?.symbol, buyToken);
      
      return {
        buyAmount: outputAmount.toFixed(6),
        exchangeRate: exchangeRate.toFixed(6),
        fee: pool.static_attributes.fee,
        netAmount: outputAmount.toFixed(6),
        gasEstimate: result.gas_estimate || '0',
        error: null
      };
      
    } catch (error) {
      return {
        buyAmount: null,
        exchangeRate: null,
        fee: pool.static_attributes?.fee || null,
        netAmount: null,
        gasEstimate: null,
        error: error.message
      };
    }
  };
}