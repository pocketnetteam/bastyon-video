import { GARBAGE_COLLECTOR_STATES } from "@server/initializers/constants";
import { exists } from "./misc";

function isGarbageCollectorStateValid (value: any) {
    return exists(value) && GARBAGE_COLLECTOR_STATES[value] !== undefined
}

// ---------------------------------------------------------------------------

export {
    isGarbageCollectorStateValid
}