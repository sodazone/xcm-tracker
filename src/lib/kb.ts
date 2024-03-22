import { AnyJson } from "@sodazone/ocelloids-client";
import { XcmJourney } from "./journey.js";
import { chainName, trunc } from "./utils.js";

export enum XcmJourneyType {
  Transfer = "transfer",
  Teleport = "teleport",
  Transact = "transact",
  Unknown = "??",
}

export type HumanizedXcm = {
  type: XcmJourneyType;
  to: string;
  from: string;
};

// WARN: this should be extracted to production rules kb
// eslint-disable-next-line complexity
export function humanize(journey: XcmJourney) {
  const { sender, origin, destination } = journey;
  const versioned = Object.values(origin.instructions)[0] as AnyJson[];
  const hopTransfer = versioned.find(
    (op) =>
      op.InitiateReserveWithdraw ||
      op.InitiateTeleport ||
      op.DepositReserveAsset ||
      op.TransferReserveAsset,
  );

  let type = XcmJourneyType.Unknown;
  if (versioned.find((op) => op.Transact)) {
    type = XcmJourneyType.Transact;
  } else if (
    (versioned.find((op) => op.WithdrawAsset || op.ReserveAssetDeposited) &&
      versioned.find((op) => op.DepositAsset)) ||
    hopTransfer
  ) {
    type = XcmJourneyType.Transfer;
  } else if (versioned.find((op) => op.ReceiveTeleportedAsset)) {
    type = XcmJourneyType.Teleport;
  }

  // Extract beneficiary
  let deposit = versioned.find((op) => op.DepositAsset !== undefined);
  if (hopTransfer) {
    deposit = (
      (Object.values(hopTransfer)[0] as AnyJson).xcm as AnyJson[]
    ).find((op) => op.DepositAsset !== undefined);
  }
  const X1 = deposit.DepositAsset.beneficiary.interior.X1;
  let beneficiary = "unknown";
  if (X1?.AccountId32) {
    beneficiary = X1.AccountId32.id;
  } else if (X1?.AccountKey20) {
    beneficiary = X1.AccountKey20.key;
  } else if (X1?.Parachain) {
    beneficiary = X1.Parachain;
  }

  const from = sender
    ? trunc(sender["Id"] ?? sender)
    : chainName(origin.chainId);
  const to = [XcmJourneyType.Teleport, XcmJourneyType.Transfer].includes(type)
    ? trunc(beneficiary)
    : chainName(destination.chainId);

  return {
    type,
    from,
    to,
  };
}
