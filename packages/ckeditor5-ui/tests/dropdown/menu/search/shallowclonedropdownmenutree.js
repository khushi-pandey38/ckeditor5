/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { shallowCloneDropdownMenuTree } from '../../../../src/dropdown/menu/search/shallowclonedropdownmenutree.js';
import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'shallowCloneDropdownMenuTree', () => {
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

	it( 'should clone tree with nested children (except views)', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );

		const tree = Object.freeze( menuRootList.tree );
		const clonedTree = shallowCloneDropdownMenuTree( tree );

		clonedTree.children.push( 2 );
		clonedTree.children[ 0 ].children.push( 3 );

		expect( clonedTree ).not.to.be.equal( tree );
		expect( clonedTree.children[ 0 ].menu ).to.be.equal( tree.children[ 0 ].menu );
	} );
} );
