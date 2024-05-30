import { animate, fadeIn, fadeOut } from "@lit-labs/motion";
import { PropertyValues, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { NotifyMessage, Subscription, xcm } from "@sodazone/ocelloids-client";

import "./journey.lit.js";
import { OcelloidsElement } from "../base/ocelloids.lit.js";
import { IconChain, IconPulse } from "../icons/index.js";
import { FixedSizedCache } from "../lib/cache.js";
import {
  TypedXcmJourney,
  XcmJourney,
  mergeJourney,
  toJourneyId,
} from "../lib/journey.js";
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
  subscriptions: Subscription[];

  @state()
  private journeys = new FixedSizedCache<XcmJourney>();

  @state()
  private connections: WebSocket[] = [];

  @property({
    type: Boolean,
  })
  mocked: boolean = false;

  constructor() {
    super();
  }

  async onMessage(msg: NotifyMessage<xcm.XcmMessagePayload>) {
    console.log("MSG", msg);

    const xcm = msg.payload;
    const id = await toJourneyId(xcm);
    const journey = this.journeys.get(id);

    const merged = await mergeJourney(xcm, journey);

    this.journeys.set(id, merged);

    this.requestUpdate();
  }

  renderSubscriptionDetails() {
    const origins = uniques(this.subscriptions.map((s) => s.args.origin));
    const destinations = uniques(
      this.subscriptions.map((s) => s.args.destinations),
    );
    const senders = uniques(
      this.subscriptions.map((s) => s.args.senders ?? "*"),
    );

    return html`
      <div
        class=${tw`flex w-full text-sm items-center space-x-3 text-gray-500 px-4 border-b border-gray-900 divide-x divide-gray-900 bg-gray-900 bg-opacity-80`}
      >
        <div class=${tw`flex flex-col space-y-2 pb-3 items-center`}>
          <span class=${tw`uppercase font-semibold`}>Origins</span>
          <span class=${tw`flex -space-x-1`}>
            ${origins.map((origin) => IconChain(origin))}
          </span>
        </div>
        <div class=${tw`flex flex-col space-y-2 pl-3 pb-3 items-center`}>
          <span class=${tw`uppercase font-semibold`}>Destinations</span>
          <span class=${tw`flex -space-x-1`}>
            ${destinations.map((destination) => IconChain(destination))}
          </span>
        </div>
        <div class=${tw`flex flex-col space-y-2 pl-3 pb-4`}>
          <span class=${tw`uppercase font-semibold`}>Senders</span>
          <span class=${tw`text-gray-200`}>
            ${senders.map((s) => trunc(s)).join(",")}
          </span>
        </div>
      </div>
    `;
  }

  renderJourneys() {
    const journeys = this.journeys.entries();
    return journeys.length > 0
      ? html` <ul>
          ${repeat(
            journeys,
            ([id]) => id,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, j]) => html`
              <li
                ${animate({
                  keyframeOptions: {
                    duration: 500,
                    delay: 100,
                    fill: "both",
                  },
                  in: fadeIn,
                  out: fadeOut,
                })}
              >
                <oc-journey class=${tw`flex w-full`} .data=${
                  j as TypedXcmJourney
                }> </oc-journey>
              </li>
            `,
          )}
        </ul>`
      : html` <div class=${tw`flex items-center space-x-2 p-4`}>
          <span class=${tw`text-gray-200 uppercase`}>Waiting for events…</span>
          ${IconPulse()}
        </div>`;
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
          this.client.subscribe(
            {
              agentId: "xcm",
              subscriptionId: subscription.id,
            },
            {
              onMessage: this.onMessage.bind(this),
            },
          ),
        );
      }

      if (this.mocked) {
        sender(this.onMessage.bind(this));
      }
    }

    return html` <div class=${tw`flex flex-col`}>
      ${this.renderSubscriptionDetails()}
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
