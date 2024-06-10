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

interface XcmInstructionSchema {
  InitiateReserveWithdraw: unknown;
  InitiateTeleport: unknown;
  DepositReserveAsset: unknown;
  TransferReserveAsset: unknown;
  Transact: unknown;
  WithdrawAsset: unknown;
  ReserveAssetDeposited: unknown;
  DepositAsset: {
    beneficiary: {
      interior: {
        X1: {
          AccountId32: {
            id: string;
          };
          AccountKey20: {
            key: string;
          };
          Parachain: string;
        };
      };
    };
  };
  ReceiveTeleportedAsset: unknown;
  ExportMessage: unknown;
}

interface XcmInstruction extends Partial<XcmInstructionSchema> {}
interface XcmInstructionXcm extends XcmInstruction {
  xcm: XcmInstruction[];
}

// WARN: this should be extracted to production rules kb
// eslint-disable-next-line complexity
export function humanize(journey: XcmJourney) {
  const { sender, origin, destination } = journey;
  const versioned: XcmInstruction[] = Object.values(origin.instructions)[0];
  const hopTransfer = versioned.find(
    (op) => op.InitiateReserveWithdraw || op.InitiateTeleport || op.DepositReserveAsset || op.TransferReserveAsset,
  );
  const bridgeMessage = versioned.find((op) => op.ExportMessage);

  let type = XcmJourneyType.Unknown;
  if (versioned.find((op) => op.Transact)) {
    type = XcmJourneyType.Transact;
  } else if (
    (versioned.find((op) => op.WithdrawAsset || op.ReserveAssetDeposited) && versioned.find((op) => op.DepositAsset)) ||
    hopTransfer ||
    bridgeMessage
  ) {
    type = XcmJourneyType.Transfer;
  } else if (versioned.find((op) => op.ReceiveTeleportedAsset)) {
    type = XcmJourneyType.Teleport;
  }

  // Extract beneficiary
  let deposit = versioned.find((op) => op.DepositAsset !== undefined);
  if (hopTransfer) {
    deposit = (Object.values(hopTransfer)[0] as XcmInstructionXcm).xcm.find((op) => op.DepositAsset !== undefined);
  }
  if (bridgeMessage) {
    deposit = (Object.values(bridgeMessage)[0] as XcmInstructionXcm).xcm.find((op) => op.DepositAsset !== undefined);
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

  const signer = sender?.signer;
  const from = signer ? trunc(signer.id ?? signer) : chainName(origin.chainId);
  const to = [XcmJourneyType.Teleport, XcmJourneyType.Transfer].includes(type)
    ? trunc(beneficiary)
    : chainName(destination.chainId);

  return {
    type,
    from,
    to,
  };
}
