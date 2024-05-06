/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { tryRemoveDropdownMenuTreeChild } from '../../../../src/dropdown/menu/search/tryremovedropdownmenutreechild.js';
import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'tryRemoveDropdownMenuTreeChild', () => {
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

	it( 'should remove menu child from root node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;
		const [ child ] = tree.children;

		const resultTree = tryRemoveDropdownMenuTreeChild( tree, child );

		expect( tree ).to.be.equal( resultTree );
		expect( tree.children ).not.to.contain( child );
	} );

	it( 'should remove menu child from menu node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		tryRemoveDropdownMenuTreeChild( parent, child );
		expect( parent.children ).not.to.contain( child );
	} );

	it( 'should do do nothing on item entry', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		expect( () => {
			tryRemoveDropdownMenuTreeChild( child, null );
		} ).not.to.throw();
	} );

	it( 'should throw on unknown entry', () => {
		expect( () => {
			tryRemoveDropdownMenuTreeChild( {}, null );
		} ).to.throw();
	} );
} );
