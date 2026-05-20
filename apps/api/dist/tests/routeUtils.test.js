"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const routeUtils_1 = require("../utils/routeUtils");
(0, vitest_1.describe)('normalizeDistance', () => {
    (0, vitest_1.afterEach)((context) => {
        if (context.task.result?.state === 'pass') {
            console.log(`PASSED: ${context.task.name}`);
        }
        else {
            console.log(`FAILED: ${context.task.name}`);
        }
    });
    (0, vitest_1.test)('ska returnera 1 om värdet är under minimum', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(0)).toBe(1);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(-5)).toBe(1);
    });
    (0, vitest_1.test)('ska returnera 30 om värdet är över maximum', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(50)).toBe(30);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(100)).toBe(30);
    });
    (0, vitest_1.test)('ska returnera värdet om det är inom 1-30', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(15)).toBe(15);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(1)).toBe(1);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(30)).toBe(30);
    });
    (0, vitest_1.test)('ska returnera 1 om värdet inte är ett nummer', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)('abc')).toBe(1);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(null)).toBe(1);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeDistance)(undefined)).toBe(1);
    });
});
(0, vitest_1.describe)('normalizeFilters', () => {
    (0, vitest_1.afterEach)((context) => {
        if (context.task.result?.state === 'pass') {
            console.log(`PASSED: ${context.task.name}`);
        }
        else {
            console.log(`FAILED: ${context.task.name}`);
        }
    });
    (0, vitest_1.test)('ska returnera bara strängar', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeFilters)(['park', 'water'])).toEqual(['park', 'water']);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeFilters)([1, 'park', null, 'water'])).toEqual([
            'park',
            'water',
        ]);
    });
    (0, vitest_1.test)('ska returnera tom array om input inte är en array', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeFilters)('not-an-array')).toEqual([]);
        (0, vitest_1.expect)((0, routeUtils_1.normalizeFilters)(null)).toEqual([]);
    });
    (0, vitest_1.test)('ska returnera tom array om input är tom', () => {
        (0, vitest_1.expect)((0, routeUtils_1.normalizeFilters)([])).toEqual([]);
    });
});
