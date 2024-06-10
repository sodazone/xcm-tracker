type ChainProperties = {
  name: string;
  ss58?: number;
};

export const chains: Record<string, ChainProperties> = {
  "urn:ocn:polkadot:0": {
    name: "polkadot",
    ss58: 0,
  },
  "urn:ocn:polkadot:1000": {
    name: "asset hub",
    ss58: 0,
  },
  "urn:ocn:polkadot:2000": {
    name: "acala",
    ss58: 10,
  },
  "urn:ocn:polkadot:2004": { name: "moonbeam" },
  "urn:ocn:polkadot:2006": {
    name: "astar",
    ss58: 5,
  },
  "urn:ocn:polkadot:2019": { name: "composable", ss58: 49 },
  "urn:ocn:polkadot:2026": { name: "nodle", ss58: 37 },
  "urn:ocn:polkadot:2030": { name: "bifrost", ss58: 6 },
  "urn:ocn:polkadot:2031": { name: "centrifuge", ss58: 37 },
  "urn:ocn:polkadot:2032": { name: "interlay", ss58: 2032 },
  "urn:ocn:polkadot:2034": { name: "hydration", ss58: 63 },
  "urn:ocn:polkadot:2035": { name: "phala", ss58: 30 },
  "urn:ocn:polkadot:2037": { name: "unique", ss58: 7391 },
  "urn:ocn:polkadot:2040": { name: "polkadex", ss58: 89 },
  "urn:ocn:polkadot:2094": { name: "pendulum", ss58: 56 },
  "urn:ocn:polkadot:2101": { name: "subsocial", ss58: 28 },
  "urn:ocn:polkadot:2104": { name: "manta", ss58: 77 },
  "urn:ocn:polkadot:3340": { name: "invarch", ss58: 117 },
};
