import { animate, fadeIn, fadeOut } from "@lit-labs/motion";
import { PropertyValues, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { Message, Subscription, xcm } from "@sodazone/ocelloids-client";

import "./journey.lit.js";
import { OcelloidsElement } from "../base/ocelloids.lit.js";
import { IconChain, IconChevronDown, IconChevronUp, IconPulse } from "../icons/index.js";
import { FixedSizedCache } from "../lib/cache.js";
import { TypedXcmJourney, XcmJourney, mergeJourney, toJourneyId } from "../lib/journey.js";
import { sender } from "../lib/mock.js";
import { trunc } from "../lib/utils.js";
import { tw } from "../style.js";

function uniques<T>(items: T[]) {
  const f = items.flat();
  return Array.from(new Set(f.values()));
}

@customElement("oc-subscription-streams")
export class SubscriptionStreamsElement extends OcelloidsElement {
  @property({
    type: Array,
  })
  subscriptions: Subscription<xcm.XcmInputs>[];

  @state()
  private journeys = new FixedSizedCache<XcmJourney>();

  @state()
  private pinned = new Map<string, XcmJourney>();

  @state()
  private connections: WebSocket[] = [];

  @state()
  private expanded: boolean = false;

  @property({
    type: Boolean,
  })
  mocked: boolean = false;

  constructor() {
    super();
  }

  handleExpandClick() {
    this.expanded = !this.expanded;
  }

  async onMessage(msg: Message<xcm.XcmMessagePayload>) {
    console.log("MSG", msg);

    const xcm = msg.payload;
    const id = await toJourneyId(xcm);

    const pinnedJourney = this.pinned.get(id);
    if (pinnedJourney !== undefined) {
      this.pinned.set(id, await mergeJourney(xcm, pinnedJourney));
    } else {
      const journey = this.journeys.get(id);
      this.journeys.set(id, await mergeJourney(xcm, journey));
    }

    this.requestUpdate();
  }

  renderSubscriptionDetails() {
    const origins = uniques(this.subscriptions.map((s) => s.args.origin));
    const destinations = uniques(this.subscriptions.map((s) => s.args.destinations));
    const senders = uniques(this.subscriptions.map((s) => s.args.senders ?? "*"));

    return html`
      <button class=${tw`flex bg-gray-100 bg-opacity-30 text-gray-900 justify-between text-sm items-center p-2 focus:outline-none md:hidden`} @click=${this.handleExpandClick}>
        <span>See subscription details</span>
        <div class=${tw`h-4 w-4`}>
          ${this.expanded ? IconChevronUp() : IconChevronDown()}
        </div>
      </button>
      <div
        class=${tw`${this.expanded ? "inline-flex" : "hidden"} flex flex-col w-full text-sm text-gray-500 px-4 border-b border-gray-900 bg-gray-900 bg-opacity-80 md:divide-x md:divide-gray-900 md:items-center md:flex-row md:space-x-3 md:inline-flex`}
      >
        <div class=${tw`flex flex-col space-y-2 pb-2 pt-2 md:pt-0 md:items-center`}>
          <span class=${tw`uppercase font-semibold`}>Origins</span>
          <span class=${tw`flex -space-x-1`}>
            ${origins.map((origin) => IconChain(origin))}
          </span>
        </div>
        <div class=${tw`flex flex-col space-y-2 pb-2 md:pl-3 md:items-center`}>
          <span class=${tw`uppercase font-semibold`}>Destinations</span>
          <span class=${tw`flex -space-x-1`}>
            ${destinations.map((destination) => IconChain(destination))}
          </span>
        </div>
        <div class=${tw`flex flex-col space-y-2 pb-2 md:pl-3 md:items-center`}>
          <span class=${tw`uppercase font-semibold`}>Senders</span>
          <span class=${tw`text-gray-200`}>
            ${senders.map((s) => trunc(s)).join(",")}
          </span>
        </div>
      </div>
    `;
  }

  pinJourney(_e: Event, key: string, journey: XcmJourney) {
    this.pinned.set(key, journey);
    this.journeys.delete(key);
    this.requestUpdate();
  }

  unpinJourney(_e: Event, key: string, journey: XcmJourney) {
    this.pinned.delete(key);
    this.journeys.set(key, journey);
    this.requestUpdate();
  }

  renderJourneys() {
    const journeys = this.journeys.entries();
    return journeys.length > 0
      ? html` <ul>
          ${repeat(
            journeys,
            ([id]) => id,
            ([id, j]) => html`
              <li
                ${animate({
                  keyframeOptions: {
                    duration: 400,
                    delay: 50,
                    fill: "both",
                  },
                })}
              >
                <oc-journey
                  class=${tw`flex flex-col md:flex-row md:flex-grow`}
                  .data=${j as TypedXcmJourney}
                  .pinned=${false}
                  @pinClick=${(e: Event) => this.pinJourney(e, id, j)}
                >
                </oc-journey>
              </li>
            `,
          )}
        </ul>`
      : html` <div class=${tw`flex items-center space-x-2 p-4 bg-gray-900 bg-opacity-40 backdrop-blur`}>
          <span class=${tw`text-gray-200 uppercase`}>Waiting for events…</span>
          ${IconPulse()}
        </div>`;
  }

  renderPinned() {
    const journeys = [...this.pinned.entries()];
    return journeys.length > 0
      ? html` <ul>
          ${repeat(
            journeys,
            ([id]) => id,
            ([id, j]) => html`
              <li>
                <oc-journey
                  class=${tw`flex flex-col md:flex-row md:flex-grow`}
                  .data=${j as TypedXcmJourney}
                  .pinned=${true}
                  @pinClick=${(e: Event) => this.unpinJourney(e, id, j)}
                >
                </oc-journey>
              </li>
            `,
          )}
        </ul>`
      : "";
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#reset();
  }

  shouldUpdate(props: PropertyValues<this>) {
    const ids = this.subscriptions.map((s) => s.id);
    if (
      props.get("subscriptions") !== undefined &&
      !props
        .get("subscriptions")
        .map((s) => s.id)
        .every((id) => ids.includes(id))
    ) {
      this.#reset();
    }
    return true;
  }

  render() {
    if (this.connections.length === 0) {
      console.log("open ws");

      for (const subscription of this.subscriptions) {
        this.connections.push(
          this.client.agent("xcm").subscribe(subscription.id, {
            onMessage: this.onMessage.bind(this),
          }),
        );
      }

      if (this.mocked) {
        sender(this.onMessage.bind(this));
      }
    }

    return html` <div class=${tw`flex flex-col`}>
      ${this.renderSubscriptionDetails()}
      <div class=${tw`w-full space-y-4 divide-y divide-gray-900`}>
        ${this.renderPinned()}
      </div>
      <div class=${tw`flex flex-col w-full space-y-4 divide-y divide-gray-900`}>
        ${this.renderJourneys()}
      </div>
    </div>`;
  }

  #reset() {
    if (this.connections.length === 0) {
      console.log("close ws");

      for (const ws of this.connections) {
        ws.close(1000, "bye");
      }
      this.connections = [];
    }
  }
}
