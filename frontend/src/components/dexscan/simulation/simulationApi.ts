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

// Function to call the simulation API
export const callSimulationAPI = async (
  tokenInAddress: string,
  poolId: string,
  amount: number
): Promise<SimulationResponse | null> => {
  try {
    console.log('Calling simulation API with:', {
      sell_token: tokenInAddress,
      pools: [poolId],
      amount: amount
    });

    const response = await fetch('http://localhost:3000/api/simulate',
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

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Simulation API response:", data);
    return data;
  } catch (error) {
    console.error("Error calling simulation API:", error);
    return null;
  }
};

// Interface for limits response
export interface LimitsResponse {
  min_amount: string;
  max_amount: string;
}

// Interface for limits request
export interface LimitsRequest {
  sell_token: string;
  buy_token: string;
  pool_address: string;
}

// Function to call the get_limits API
export const getLimits = async (
  sell_token: string,
  buy_token: string,
  pool_address: string
): Promise<LimitsResponse | null> => {
  try {
    const req: LimitsRequest = {
      sell_token,
      buy_token,
      pool_address
    };
    
    console.log('Calling get_limits API with:', req);

    const response = await fetch('http://localhost:3000/api/limits',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req)
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Get limits API response:", data);
    return data;
  } catch (error) {
    console.error("Error calling get_limits API:", error);
    return null;
  }
};
