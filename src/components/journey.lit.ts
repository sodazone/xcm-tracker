import { animate, fadeInSlow } from "@lit-labs/motion";
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";

import { TwElement } from "../base/tw.lit.js";
import {
  BadgeType,
  IconArrow,
  IconChain,
  IconChainFail,
  IconChainSkipped,
  IconChainSuccess,
  IconChainTimeout,
  IconChainWait,
  IconChevronDown,
  IconChevronUp,
  IconFail,
  IconPin,
  IconSkipped,
  IconSuccess,
  IconTimeout,
  IconUnpin,
  IconWait,
} from "../icons/index.js";
import { TypedXcmJourney, TypedXcmJourneyWaypoint, XcmJourneyLeg, XcmJourneyWaypoint } from "../lib/journey.js";
import { HumanizedXcm, humanize } from "../lib/kb.js";
import { tw } from "../style.js";

import "./code.lit.js";
import { chains } from "../chains/index.js";

@customElement("oc-journey")
export class Journey extends TwElement {
  @property({
    type: Object,
  })
  data: TypedXcmJourney;

  @property()
  pinned: boolean;

  @state() expanded: boolean = false;

  // XXX just a quick hack
  iconForOutcomeFromConsensus(j: XcmJourneyWaypoint) {
    const { chainId } = j;
    const relay = chainId.substring(0, chainId.lastIndexOf(":") + 1) + "0";
    if (chainId === relay) {
      return this.iconForOutcome(j);
    }

    return html`
    <span class=${tw("flex relative")}>
      ${this.iconForOutcome(j)}
      <span class=${tw("flex absolute -ml-2 -mt-2")}>
       ${IconChain(relay, "xs")}
      </span>
    </span>
    `;
  }

  iconForOutcome({ chainId, outcome, skipped, timeout }: XcmJourneyWaypoint, withChain = true) {
    if (outcome === undefined) {
      if (timeout) {
        return withChain ? IconChainTimeout(chainId) : IconTimeout();
      }
      return withChain ? IconChainWait(chainId) : IconWait();
    } else if (outcome === "Success") {
      return withChain ? IconChainSuccess(chainId) : IconSuccess();
    } else {
      if (skipped) {
        return withChain ? IconChainSkipped(chainId) : IconSkipped();
      }
      return withChain ? IconChainFail(chainId) : IconFail();
    }
  }

  renderBlockInfo({ chainId, event, extrinsicId, blockNumber }: TypedXcmJourneyWaypoint) {
    const subscan = chains[chainId]?.subscanLink;
    if (event && Object.keys(event).length > 0) {
      const xtId = extrinsicId ?? `${blockNumber}-0`;
      const link = subscan ? `${subscan}/extrinsic/${xtId}?event=${event.eventId}` : undefined;
      return html`<a target="_blank" href=${ifDefined(link)} class=${tw`${link ? "hover:underline" : ""}`}>${event.eventId}</a>`;
    }

    const link = subscan ? `${subscan}/block/${blockNumber}` : undefined;
    return html`
        <a target="_blank" href=${ifDefined(link)} class=${tw`${link ? "hover:underline" : ""}`}>${blockNumber}</a>`;
  }

  renderStatusRow(point: TypedXcmJourneyWaypoint) {
    return html`
      <div
        class=${tw`flex w-full items-center justify-between px-6 py-4`}
      >
        <div class=${tw`flex items-center justify-center space-x-4`}>
          ${this.iconForOutcomeFromConsensus(point)}
          ${this.renderBlockInfo(point)}
          <span class=${tw`ml-auto text-gray-400 text-xs font-mono capitalize`}
            >${point.event && Object.keys(point.event).length > 0 ? `${point.event.section} ${point.event.method}` : ""}</span
          >
        </div>
        <div class=${tw`flex justify-end items-center space-x-4`}>
          ${
            point.assetsTrapped !== undefined
              ? html`
                <span
                  class=${tw`text-xs font-medium px-2.5 py-0.5 rounded bg-red-500 text-gray-900`}
                  >trapped</span
                >
              `
              : ""
          }
          ${this.iconForOutcome(point, false)}
        </div>
      </div>
    `;
  }

  handleExpandClick() {
    this.expanded = !this.expanded;
  }

  renderLeg(leg: XcmJourneyLeg) {
    const label =
      leg.type === "bridge"
        ? "from " + leg.stops.map((s) => s.chainId.split(":")[2].toUpperCase()).join(" to ")
        : "on " + leg.stops[0].chainId.split(":")[2].toUpperCase();
    return html`
    <div>
      <div class=${tw`flex mx-auto py-2 px-4 bg-gray-900 bg-opacity-70 text-gray-400 text-sm`}>
        ${label}
      </div>
      <div
        class=${tw`flex flex-col divide-y divide-gray-900 border-x border-gray-900 bg-gray-900 bg-opacity-50`}
      >
        ${repeat(
          leg.stops,
          (p) => leg.index + p.chainId + p.outcome,
          (p) => this.renderStatusRow(p as TypedXcmJourneyWaypoint),
        )}
      </div>
    </div>
  `;
  }

  renderHumanized(hxcm: HumanizedXcm) {
    const { type, from, to } = hxcm;

    return html`
      <span class=${tw`mr-4`}>
        ${BadgeType(type)} from
        <span class=${tw`text-gray-300`}>${from}</span> to
        <span class=${tw`text-gray-300`}>${to}</span>
      </span>
    `;
  }

  getPinIcon() {
    return html`
      <button class=${tw`h-4 w-4 text-gray-300`} @click=${(_: Event) => this.firePinClickEvent()}>
        ${this.pinned ? IconUnpin() : IconPin()}
      </button>
    `;
  }

  firePinClickEvent() {
    const event = new CustomEvent("pinClick");
    this.dispatchEvent(event);
  }

  render() {
    const j = this.data;

    return html`<div class=${tw`w-full`}>
      <div
        class=${tw`w-full flex p-4 items-center space-x-3 bg-gray-900 bg-opacity-80`}
      >
        ${this.getPinIcon()}
        <div class=${tw`flex w-full justify-between items-center`}>
          <div class=${tw`flex items-center space-x-4`}>
            <span class=${tw`pr-4 text-gray-500`}>
              ${this.renderHumanized(humanize(j))}
            </span>
            ${this.iconForOutcomeFromConsensus(j.origin)}
            <span class=${tw`text-gray-700`}>${IconArrow()}</span>
            ${this.iconForOutcomeFromConsensus(j.destination)}
          </div>
          <div class=${tw`flex items-center space-x-2`}>
            <span class=${tw`mr-3 text-sm text-gray-500`}> ${j.created} </span>
            <button class=${tw`h-5 w-5 text-gray-300 hover:text-gray-500`} @click=${this.handleExpandClick}>
              ${this.expanded ? IconChevronUp() : IconChevronDown()}
            </button>
          </div>
        </div>
      </div>
      ${
        this.expanded
          ? html`
          <div
            ${animate({
              in: fadeInSlow,
            })}
            @click=${this.handleExpandClick}
            class=${tw`flex flex-col`}
          >
            ${
              j.forwardId &&
              html`
                <div class=${tw`py-1 text-sm px-4 text-gray-400 bg-gray-600 capitalize border-t border-gray-600`}>
                  XCM Forward ID
                </div>
                <span class=${tw`text-sm text-mono bg-gray-700 py-4 px-6`}>
                  ${j.forwardId}
                </span>`
            }
            ${
              j.topicId &&
              html`
                <div class=${tw`py-1 text-sm px-4 text-gray-400 bg-gray-600 capitalize border-t border-gray-600`}>
                  XCM Topic ID
                </div>
                <span class=${tw`text-sm text-mono bg-gray-700 py-4 px-6`}>
                  ${j.topicId}
                </span>`
            }

            <div class=${tw`py-1 text-sm px-4 text-gray-400 bg-gray-600 capitalize border-t border-gray-600`}>
              XCM Origin Message Hash
            </div>
            <div class=${tw`text-sm text-mono bg-gray-700 py-4 px-6`}>
              ${j.origin.messageHash}
            </div>
            <div
              class=${tw`py-1 text-sm px-4 text-gray-400 bg-gray-600 capitalize border-t border-gray-600`}
            >
              XCM Instructions
            </div>
            <code-block
              code=${JSON.stringify(j.instructions, null, 2)}
            ></code-block>
          </div>
        `
          : ""
      }
      ${repeat(
        j.legs,
        (l) => j.id + l.index,
        (l) => this.renderLeg(l),
      )}
    </div>`;
  }
}
