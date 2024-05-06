/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/rejectfalsyitems
 */

type FalsyValue = false | undefined | null;

type FalsyItem<O> = O | FalsyValue;

/**
 * Filters out falsy items from an array and returns a new array with only truthy items.
 *
 * ```ts
 * const items = [ 1, 0, 'foo', '', null, undefined, false ];
 * const filteredItems = rejectFalsyItems( items );
 *
 * expect( filteredItems ).to.deep.equal( [ 1, 0, 'foo', '' ] );
 * ```
 *
 * @param items The array to filter.
 * @returns A new array with only truthy items.
 */
export default function rejectFalsyItems<O>( items: Array<FalsyItem<O>> ): Array<Exclude<O, FalsyValue>> {
	return items.filter( item => !isFalsyValue( item ) ) as Array<Exclude<O, FalsyValue>>;
}

/**
 * Checks if a value is falsy.
 *
 * @param The value to check.
 * @returns `true` if the value is falsy, `false` otherwise.
 */
function isFalsyValue( item: any ): item is FalsyValue {
	return item === false || item === undefined || item === null;
}
