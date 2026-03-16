"use client";

import { useMemo, useState } from "react";
import { getTokensForChain } from "@/lib/token-list";
import { ChainKey, TokenOption } from "@/lib/types";

interface Props {
  chain: ChainKey;
  open: boolean;
  title: string;
  onClose: () => void;
  onSelect: (token: TokenOption) => void;
}

export default function TokenSelectorModal({ chain, open, title, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const tokens = useMemo(() => {
    const list = getTokensForChain(chain);
    if (!query.trim()) return list;
    const lowered = query.toLowerCase();
    return list.filter((token) => `${token.symbol} ${token.name}`.toLowerCase().includes(lowered));
  }, [chain, query]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose}>×</button>
        </div>
        <input className="modal-search" placeholder="Search token" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="token-list">
          {tokens.map((token) => (
            <button
              type="button"
              key={`${token.chain}-${token.symbol}`}
              className="token-row"
              onClick={() => {
                onSelect(token);
                onClose();
              }}
            >
              <span className="token-badge">{token.symbol.slice(0, 1)}</span>
              <span>
                <strong>{token.symbol}</strong>
                <small>{token.name}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
