export function trunc(str, len = 11, sep = "…") {
  if (str.length <= len) {
    return str;
  }
  const chars = len - sep.length;
  const frontChars = Math.ceil(chars / 2);
  const backChars = Math.floor(chars / 2);

  return str.substr(0, frontChars) + sep + str.substr(str.length - backChars);
}

export function chainName(id) {
  switch (id) {
    case "urn:ocn:polkadot:0":
      return "polkadot";
    case "urn:ocn:polkadot:1000":
      return "asset hub";
    case "urn:ocn:polkadot:2000":
      return "acala";
    case "urn:ocn:polkadot:2004":
      return "moonbeam";
    case "urn:ocn:polkadot:2006":
      return "astar";
    case "urn:ocn:polkadot:2019":
      return "composable";
    case "urn:ocn:polkadot:2026":
      return "nodle";
    case "urn:ocn:polkadot:2030":
      return "bifrost";
    case "urn:ocn:polkadot:2031":
      return "centrifuge";
    case "urn:ocn:polkadot:2032":
      return "interlay";
    case "urn:ocn:polkadot:2034":
      return "hydra";
    case "urn:ocn:polkadot:2035":
      return "phala";
    case "urn:ocn:polkadot:2037":
      return "unique";
    case "urn:ocn:polkadot:2040":
      return "polkadex";
    case "urn:ocn:polkadot:2094":
      return "pendulum";
    case "urn:ocn:polkadot:2101":
      return "subsocial";
    case "urn:ocn:polkadot:2104":
      return "manta";
    case "urn:ocn:polkadot:3340":
      return "invarch";
    default:
      return id;
  }
}
