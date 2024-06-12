type ChainProperties = {
  name: string;
  ss58?: number;
  subscanLink?: string;
};

export const chains: Record<string, ChainProperties> = {
  "urn:ocn:polkadot:0": {
    name: "polkadot",
    ss58: 0,
    subscanLink: "https://polkadot.subscan.io",
  },
  "urn:ocn:polkadot:1000": {
    name: "asset hub",
    ss58: 0,
    subscanLink: "https://assethub-polkadot.subscan.io",
  },
  "urn:ocn:polkadot:2000": {
    name: "acala",
    ss58: 10,
    subscanLink: "https://acala.subscan.io",
  },
  "urn:ocn:polkadot:2004": {
    name: "moonbeam",
    subscanLink: "https://moonbeam.subscan.io",
  },
  "urn:ocn:polkadot:2006": {
    name: "astar",
    ss58: 5,
    subscanLink: "https://astar.subscan.io",
  },
  "urn:ocn:polkadot:2019": { name: "composable", ss58: 49, subscanLink: "https://composable.subscan.io" },
  "urn:ocn:polkadot:2026": { name: "nodle", ss58: 37, subscanLink: "https://nodle.subscan.io" },
  "urn:ocn:polkadot:2030": { name: "bifrost", ss58: 6, subscanLink: "https://bifrost.subscan.io" },
  "urn:ocn:polkadot:2031": { name: "centrifuge", ss58: 37, subscanLink: "https://centrifuge.subscan.io" },
  "urn:ocn:polkadot:2032": { name: "interlay", ss58: 2032, subscanLink: "https://interlay.subscan.io" },
  "urn:ocn:polkadot:2034": { name: "hydration", ss58: 63, subscanLink: "https://hydration.subscan.io" },
  "urn:ocn:polkadot:2035": { name: "phala", ss58: 30, subscanLink: "https://phala.subscan.io" },
  "urn:ocn:polkadot:2037": { name: "unique", ss58: 7391, subscanLink: "https://unique.subscan.io" },
  "urn:ocn:polkadot:2040": { name: "polkadex", ss58: 89, subscanLink: "https://polkadex.subscan.io" },
  "urn:ocn:polkadot:2094": { name: "pendulum", ss58: 56, subscanLink: "https://pendulum.subscan.io" },
  "urn:ocn:polkadot:2101": { name: "subsocial", ss58: 28 },
  "urn:ocn:polkadot:2104": { name: "manta", ss58: 77, subscanLink: "https://manta.subscan.io" },
  "urn:ocn:polkadot:3340": { name: "invarch", ss58: 117 },
};
