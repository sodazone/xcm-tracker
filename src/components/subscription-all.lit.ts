import { html } from "lit";
import { Task } from "@lit/task";
import { customElement } from "lit/decorators.js";

import { Subscription } from "@sodazone/ocelloids-client";

import "./subscription-streams.lit.js";
import { OcelloidsElement } from "../base/ocelloids.lit.js";
import { tw } from "../style.js";
import { IconSpinner } from "../icons/index.js";

@customElement("oc-all-subscriptions")
export class AllSubscriptions extends OcelloidsElement {
  private subscriptions: Subscription[] = [];

  private _getSubscriptions = new Task<Subscription[]>(this, {
    task: async (_, { signal }) => {
      this.subscriptions = await this.client.allSubscriptions({ signal });
      return this.subscriptions;
    },
    args: () => [],
  });

  renderSubscriptions() {
    return html`<div class=${tw`flex flex-col`}>
      <oc-subscription-streams
        .mocked=${false}
        class=${tw`flex flex-col`}
        .subscriptions=${this.subscriptions}
      >
      </oc-subscription-streams>
    </div>`;
  }

  render() {
    return this._getSubscriptions.render({
      pending: () =>
        html`<div class=${tw`flex items-center px-4`}>${IconSpinner()}</div>`,
      complete: () => this.renderSubscriptions(),
      error: (e) => html`<div>error: ${e}</div>`,
    });
  }
}
