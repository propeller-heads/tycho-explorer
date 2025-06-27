import selectTokensIcon from '@/assets/figma_generated/select_tokens_icon.svg';

// Sub-components
const Icon = ({ src, className }) => (
  <img
    src={src}
    className={className}
    loading="lazy"
  />
);

const HighlightedText = ({ children }) => (
  <span className="px-2 py-1 rounded bg-highlight">
    {children}
  </span>
);

/**
  * Displays a prompt when no tokens are selected in the graph view
  */
export const TokenSelectionPrompt = ({
  minTokens = 2,
  message = "to display the graph"
}) => (
  <div className={`flex flex-col items-center justify-center h-full gap-4 px-8 md:px-16`}>
    <Icon src={selectTokensIcon} className="w-60 h-60" />

    <div className={`flex flex-wrap items-center justify-center gap-1 text-lg text-milk-base`}>
      <span>You need to</span>
      <HighlightedText>select at least {minTokens} tokens</HighlightedText>
      <span>{message}.</span>
    </div>
  </div>
);
