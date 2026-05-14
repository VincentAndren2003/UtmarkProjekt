"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paramAsString = paramAsString;
/** Express route params can be `string | string[]` in strict typings. */
function paramAsString(value) {
    if (value === undefined)
        return undefined;
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0];
    }
    return undefined;
}
