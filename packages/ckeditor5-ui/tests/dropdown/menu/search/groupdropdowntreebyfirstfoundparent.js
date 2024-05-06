/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { filterDropdownMenuTreeByRegExp } from '../../../../src/dropdown/menu/search/filterdropdownmenutreebyregexp.js';
import { groupDropdownTreeByFirstFoundParent } from '../../../../src/dropdown/menu/search/groupdropdowntreebyfirstfoundparent.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import { createRootTree, findMenuTreeItemByLabel } from '../_utils/dropdowntreeutils.js';

describe( 'groupDropdownTreeByFirstFoundParent', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should return 0 results if passed empty tree', () => {
		const result = groupDropdownTreeByFirstFoundParent( createRootTree() );

		expect( result ).to.be.deep.equal( [] );
	} );

	it( 'should all children of menu entry if it\'s marked as found', () => {
		const { groupedList, byLabel } = filterByRegExpMock( /Menu 1/gi );

		expect( groupedList ).to.deep.equal(
			[
				{
					parent: byLabel( 'Menu 1' ),
					children: [ byLabel( 'Foo' ), byLabel( 'Bar' ), byLabel( 'Buz' ) ]
				}
			]
		);
	} );

	it( 'should return matching flat item child', () => {
		const { groupedList, byLabel } = filterByRegExpMock( /Buz/gi );

		expect( groupedList ).to.deep.equal(
			[
				{
					parent: byLabel( 'Menu 1' ),
					children: [ byLabel( 'Buz' ) ]
				}
			]
		);
	} );

	function filterByRegExpMock( regexp ) {
		const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor );
		const { filteredTree } = filterDropdownMenuTreeByRegExp( regexp, tree );

		const byLabel = label => findMenuTreeItemByLabel( label, filteredTree );
		const groupedList = groupDropdownTreeByFirstFoundParent( filteredTree );

		return {
			filteredTree,
			groupedList,
			byLabel
		};
	}
} );
