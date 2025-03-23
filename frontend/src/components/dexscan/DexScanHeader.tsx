interface DexScanHeaderProps {
  // No props needed anymore
}

export const DexScanHeader = ({}: DexScanHeaderProps) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Dexscan</h2>
      <p className="text-lg text-muted-foreground">
        See any token's liquidity, cheapest path to/from, and DEX liquidity.
      </p>
    </div>
  );
};
