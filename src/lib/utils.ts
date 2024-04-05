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
  const chain = id.startsWith("urn:ocn") ? id.split(":")[3] : id;
  switch (chain) {
    case "0":
      return "polkadot";
    case "1000":
      return "asset hub";
    case "2000":
      return "acala";
    case "2004":
      return "moonbeam";
    case "2006":
      return "astar";
    case "2019":
      return "composable";
    case "2026":
      return "nodle";
    case "2030":
      return "bifrost";
    case "2031":
      return "centrifuge";
    case "2032":
      return "interlay";
    case "2034":
      return "hydra";
    case "2035":
      return "phala";
    case "2037":
      return "unique";
    case "2040":
      return "polkadex";
    case "2094":
      return "pendulum";
    case "2101":
      return "subsocial";
    case "2104":
      return "manta";
    case "3340":
      return "invarch";
    default:
      return chain;
  }
}
