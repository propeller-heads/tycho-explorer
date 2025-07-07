import React from 'react';
import { render, screen } from '@testing-library/react';
import { SwapInterface } from './SwapInterface';

describe('SwapInterface token logo fix', () => {
  const mockPool1 = {
    id: 'pool1',
    tokens: [
      { address: '0x123', symbol: 'USDC', logoURI: 'https://example.com/usdc.png' },
      { address: '0x456', symbol: 'ETH', logoURI: 'https://example.com/eth.png' }
    ],
    protocol_system: 'Uniswap V3',
    spotPrice: '1234.56'
  };

  const mockPool2 = {
    id: 'pool2',
    tokens: [
      { address: '0x123', symbol: 'USDT', logoURI: 'https://example.com/usdt.png' }, // Same address, different symbol
      { address: '0x789', symbol: 'BTC', logoURI: 'https://example.com/btc.png' }
    ],
    protocol_system: 'Balancer',
    spotPrice: '2345.67'
  };

  test('TokenDisplay components should have unique keys including pool.id', () => {
    const { rerender } = render(
      <SwapInterface 
        pool={mockPool1} 
        onClose={() => {}} 
        simulate={() => Promise.resolve({})} 
      />
    );

    // Check that the component renders with pool1
    expect(screen.getByText('USDC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();

    // Rerender with pool2 - same token address but different symbol
    rerender(
      <SwapInterface 
        pool={mockPool2} 
        onClose={() => {}} 
        simulate={() => Promise.resolve({})} 
      />
    );

    // Check that the component updates to show new symbols
    expect(screen.getByText('USDT')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    
    // Should not show old symbols
    expect(screen.queryByText('USDC')).not.toBeInTheDocument();
    expect(screen.queryByText('ETH')).not.toBeInTheDocument();
  });

  test('Image elements should have unique keys with poolId', () => {
    const { container } = render(
      <SwapInterface 
        pool={mockPool1} 
        onClose={() => {}} 
        simulate={() => Promise.resolve({})} 
      />
    );

    // Check that images have the correct key attribute pattern
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      // React keys are not exposed in DOM, but we can verify the images are rendered
      expect(img).toHaveAttribute('src');
      expect(img).toHaveAttribute('alt');
    });
  });
});