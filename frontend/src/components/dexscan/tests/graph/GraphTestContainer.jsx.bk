import React, { useState } from 'react';
import { NetworkManagerTest } from '@/components/dexscan/graph/test/NetworkManagerTest';
import { GraphHooksTest } from '@/components/dexscan/graph/test/GraphHooksTest';

/**
 * Container for all graph tests
 */
export const GraphTestContainer = () => {
  const [activeTest, setActiveTest] = useState('hooks');
  
  return (
    <div className="h-screen flex flex-col bg-dark-charcoal">
      {/* Tab Navigation */}
      <div className="p-4 pb-0">
        <div className="flex gap-2 border-b border-gray-700">
          <button 
            onClick={() => setActiveTest('hooks')}
            className={`px-4 py-2 font-semibold ${
              activeTest === 'hooks' 
                ? 'text-milk-base border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-milk-base'
            }`}
          >
            Hook Integration Test
          </button>
          <button 
            onClick={() => setActiveTest('network')}
            className={`px-4 py-2 font-semibold ${
              activeTest === 'network' 
                ? 'text-milk-base border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-milk-base'
            }`}
          >
            NetworkManager Test
          </button>
        </div>
      </div>
      
      {/* Test Content */}
      <div className="flex-1 overflow-hidden">
        {activeTest === 'hooks' && <GraphHooksTest />}
        {activeTest === 'network' && <NetworkManagerTest />}
      </div>
    </div>
  );
};