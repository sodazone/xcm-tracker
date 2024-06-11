import { encodeAddress } from "@polkadot/util-crypto";
import { chains } from "../chains/index.js";

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
  const chain = chains[id];
  if (chain !== undefined) {
    return chain.name;
  }
  return id;
}

export function toAddress(key: string, chainId: string) {
  const chain = chains[chainId];
  if (chain !== undefined) {
    return encodeAddress(key, chain.ss58);
  }
  return key;
}
