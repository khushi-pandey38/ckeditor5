/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import rejectFalsyItems from '../src/rejectfalsyitems.js';

describe( 'rejectFalsyItems', () => {
	it( 'should filter out falsy items from the array', () => {
		const items = [ 1, 0, 'foo', '', null, undefined, false ];
		const filteredItems = rejectFalsyItems( items );

		expect( filteredItems ).to.deep.equal( [ 1, 0, 'foo', '' ] );
	} );

	it( 'should return an empty array if all items are falsy', () => {
		const items = [ false, null, undefined ];
		const filteredItems = rejectFalsyItems( items );

		expect( filteredItems ).to.deep.equal( [] );
	} );

	it( 'should return the same array if all items are truthy', () => {
		const items = [ 1, 'foo', true ];
		const filteredItems = rejectFalsyItems( items );

		expect( filteredItems ).to.deep.equal( [ 1, 'foo', true ] );
	} );

	it( 'should handle arrays with mixed truthy and falsy items', () => {
		const items = [ 1, null, 'foo', false, undefined, 0, 'bar' ];
		const filteredItems = rejectFalsyItems( items );

		expect( filteredItems ).to.deep.equal( [ 1, 'foo', 0, 'bar' ] );
	} );
} );
