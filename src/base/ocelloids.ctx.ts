import { createContext } from "@lit/context";

import { OcelloidsClient } from "@sodazone/ocelloids-client";
export type { OcelloidsClient } from "@sodazone/ocelloids-client";

export const ocelloidsContext = createContext<OcelloidsClient>("ocelloids");
