import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "./subscription-all.lit";
import "./subscription-select.lit";

import { TwElement } from "../base/tw.lit.js";
import { tw } from "../style.js";

@customElement("oc-subscriptions")
export class SubscriptionsElement extends TwElement {
  @state()
  selected: string;

  renderSelection() {
    if (this.selected) {
      return this.selected === "select"
        ? html`<oc-select-subscription></oc-select-subscription>`
        : html`<oc-all-subscriptions></oc-all-subscriptions>`;
    }
    return html`</>`;
  }
  render() {
    return html`
      <div class=${tw("bg-gray-900 bg-opacity-80 border-b border-gray-900")}>
        <ul class=${tw("grid grid-cols-2 list-none")}>
          <li
            @click=${() => (this.selected = "all")}
            class=${tw(
              "flex justify-center border-t-2 cursor-pointer uppercase border-r border-r-gray-900",
            ) +
            " " +
            tw(
              this.selected === "all"
                ? "border-t-yellow-500 font-semibold"
                : "border-t-transparent",
            )}
          >
            <span class=${tw("inline-block py-2 px-3")}> All Networks </span>
          </li>
          <li
            @click=${() => (this.selected = "select")}
            class=${tw(
              "flex justify-center border-t-2 cursor-pointer uppercase",
            ) +
            " " +
            tw(
              this.selected === "select"
                ? "border-t-yellow-500 font-semibold"
                : "border-t-transparent",
            )}
          >
            <span class=${tw("inline-block py-2 px-3")}>
              Select Subscription
            </span>
          </li>
        </ul>
      </div>
      ${this.renderSelection()}
    `;
  }
}
