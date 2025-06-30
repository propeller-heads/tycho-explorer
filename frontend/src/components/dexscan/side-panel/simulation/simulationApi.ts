/**
 * Shared API types and functions for simulation
 */

// Interface for simulation response
export interface SimulationResponse {
  success: boolean;
  input_amount: string;
  output_amount: string;
  gas_estimate: string;
}

// Get API URL for a specific chain
const getApiUrl = (chain: string): string => {
  const urls: Record<string, string | undefined> = {
    ethereum: import.meta.env.VITE_API_ETHEREUM_URL,
    base: import.meta.env.VITE_API_BASE_URL,
    unichain: import.meta.env.VITE_API_UNICHAIN_URL
  };
  
  console.warn('[PROD-DEBUG] getApiUrl - chain:', chain);
  console.warn('[PROD-DEBUG] getApiUrl - available URLs:', urls);
  console.warn('[PROD-DEBUG] getApiUrl - import.meta.env:', import.meta.env);
  
  const url = urls[chain.toLowerCase()];
  if (!url) {
    throw new Error(`No API URL configured for chain: ${chain}. URLs: ${JSON.stringify(urls)}. Please set VITE_API_${chain.toUpperCase()}_URL in your environment.`);
  }
  
  console.warn('[PROD-DEBUG] getApiUrl - selected URL:', url);
  return url;
};

// Function to call the simulation API
export const callSimulationAPI = async (
  tokenInAddress: string,
  poolId: string,
  amount: number,
  selectedChain: string
): Promise<SimulationResponse | null> => {
  try {
    console.warn('[PROD-DEBUG] callSimulationAPI - called with:', {
      tokenInAddress,
      poolId,
      amount,
      selectedChain
    });
    
    const apiUrl = getApiUrl(selectedChain);
    const fullUrl = `${apiUrl}/api/simulate`;
    console.warn('[PROD-DEBUG] callSimulationAPI - fullUrl:', fullUrl);
    console.warn('[PROD-DEBUG] callSimulationAPI - payload:', { sell_token: tokenInAddress, pools: [poolId], amount });
    
    const response = await fetch(fullUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sell_token: tokenInAddress,
          pools: [
            poolId
          ],
          amount: amount
        })
      }
    );

    console.warn('[PROD-DEBUG] callSimulationAPI - response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.warn('[PROD-DEBUG] callSimulationAPI - response data:', data);
    return data;
  } catch (error) {
    console.warn("[PROD-DEBUG] Error calling simulation API:", error);
    return null;
  }
};

// Interface for limits response
export interface LimitsResponse {
  max_input: string;
  max_output: string;
}

// Interface for limits request
export interface LimitsRequest {
  sell_token: string;
  buy_token: string;
  pool_address: string;
}

// CURRENTLY NOT SUPPORTED
// Function to call the get_limits API
export const getLimits = async (
  sell_token: string,
  buy_token: string,
  pool_address: string,
  selectedChain: string
): Promise<LimitsResponse | null> => {
  try {
    // Flip tokens to get reliable max_output
    const req: LimitsRequest = {
      sell_token: buy_token,  // Flipped
      buy_token: sell_token,  // Flipped
      pool_address
    };
    
    console.log('Calling get_limits API with flipped tokens for reliable max_output:', req);

    const apiUrl = getApiUrl(selectedChain);
    const response = await fetch(`${apiUrl}/api/limits`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req)
      }
    );

    if (!response.ok) {
      console.error(`get_limits API call failed with status: ${response.status}`);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('get_limits API response:', data);
    return data;
  } catch (error) {
    console.error("Error calling get_limits API:", error);
    return null;
  }
};
