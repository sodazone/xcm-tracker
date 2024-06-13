import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "./subscription-streams.lit";

import { animate, fadeIn, fadeInSlow, flyLeft, flyRight } from "@lit-labs/motion";
import { Task } from "@lit/task";
import { Subscription, xcm } from "@sodazone/ocelloids-client";
import { OcelloidsElement } from "../base/ocelloids.lit";
import { IconBurgerMenu, IconChevron, IconSpinner, IconXMark } from "../icons/index.js";
import { chainName } from "../lib/utils";
import { tw } from "../style.js";

@customElement("oc-subscriptions")
export class SubscriptionsElement extends OcelloidsElement {
  @state()
  private subscriptionId?: string;

  @state({
    hasChanged: () => false,
  })
  private subscriptions: Subscription<xcm.XcmInputs>[] = [];

  @state()
  menuOpen: boolean = false;

  private _getSubscriptions = new Task<Subscription<xcm.XcmInputs>[]>(this, {
    task: async (_, { signal }) => {
      this.subscriptions = await this.client.agent<xcm.XcmInputs>("xcm").allSubscriptions({
        signal,
      });
      return this.subscriptions;
    },
    args: () => [],
  });

  constructor() {
    super();
  }

  onSelected(e) {
    this.subscriptionId = e.target.value;
    if (this.menuOpen) {
      this.menuOpen = false;
    }
  }

  getChainName(subscriptionId: string) {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    return sub ? chainName(sub.args.origin) : undefined;
  }

  handleMenuClick() {
    this.menuOpen = !this.menuOpen;
  }

  renderSelect() {
    return html` <div
      class=${tw`flex flex-col border-b border-gray-900 bg-gray-900 bg-opacity-60`}
    >
      <div class=${tw`grid text-gray-300`}>
        ${IconChevron()}
        <select
          id="select-subscription"
          class=${tw`select-big focus:outline-none`}
          @change=${this.onSelected}
        >
          <option selected disabled hidden>Select a network</option>
          <option value="all">All networks</option>
          ${this.subscriptions.map(
            (s) => html`
              <option value=${s.id}><div class=${tw`uppercase`}>${chainName(s.args.origin)}</div></option>
            `,
          )}
        </select>
      </div>
    </div>`;
  }

  renderMenu() {
    return html`
      <div class=${tw`hidden md:inline-block`}>
        ${this.renderSelect()}
      </div>
      <div class=${tw`flex flex-col md:hidden`}>
        <div class=${tw`flex justify-between items-center p-4 border-b border-gray-900 bg-gray-900 bg-opacity-60`}>
          ${
            this.subscriptionId === "all"
              ? html`<div>All Networks</div>`
              : html`<div class=${tw`capitalize`}>${this.getChainName(this.subscriptionId)}</div>`
          }
          <div class=${tw`h-5 w-5`} @click=${this.handleMenuClick}>
            ${this.menuOpen ? IconXMark() : IconBurgerMenu()}
          </div>
        </div>
        ${
          this.menuOpen
            ? html`<div
          class=${tw`flex flex-col`}>
            ${this.renderSelect()}
          </div>`
            : ""
        }
      </div>
    `;
  }

  renderSubscriptions() {
    console.log("===", this.subscriptionId, this.subscriptions);
    return html`<div class=${tw`flex flex-col`}>
      ${this.subscriptionId ? this.renderMenu() : this.renderSelect()}
      ${
        this.subscriptionId
          ? this.subscriptionId === "all"
            ? html`<div class=${tw`flex flex-col`}>
              <oc-subscription-streams
                .mocked=${true}
                .menuOpen=${this.menuOpen}
                class=${tw`flex flex-col`}
                .subscriptions=${this.subscriptions}
              >
              </oc-subscription-streams>
            </div>`
            : html`
            <oc-subscription-streams
              .mocked=${false}
              .menuOpen=${this.menuOpen}
              class=${tw`flex flex-col`}
              .subscriptions=${[this.subscriptions.find((s) => s.id === this.subscriptionId)]}
            >
            </oc-subscription-streams>
          `
          : ""
      }
    </div>`;
  }

  render() {
    return this._getSubscriptions.render({
      pending: () => html`<div class=${tw`flex items-center px-4`}>${IconSpinner()}</div>`,
      complete: () => this.renderSubscriptions(),
      error: (e) => html`<div>error: ${e}</div>`,
    });
  }
}
