import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsCardsProps {
  totalPools: number;
  totalProtocols: number;
  totalUniqueTokens: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ totalPools, totalProtocols, totalUniqueTokens }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Pools Indexed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPools.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Protocols Indexed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProtocols.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Unique Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUniqueTokens.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
