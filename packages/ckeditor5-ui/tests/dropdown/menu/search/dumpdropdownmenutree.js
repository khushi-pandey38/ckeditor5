/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { dumpDropdownMenuTree } from '../../../../src/dropdown/menu/search/dumpdropdownmenutree.js';
import { Dump } from '../_utils/dropdowntreemenudump.js';
import {
	createBlankRootListView,
	createMockDropdownMenuDefinition,
	createMockMenuDefinition
} from '../_utils/dropdowntreemock.js';

describe( 'dumpDropdownMenuTree', () => {
	let element, editor;

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

	it( 'should return a string representation of the tree', () => {
		const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor );

		const dump = dumpDropdownMenuTree( tree );

		expect( dump ).to.be.equal(
			Dump.root( [
				Dump.menu( 'Menu 1', [
					Dump.item( 'Foo' ),
					Dump.item( 'Bar' ),
					Dump.item( 'Buz' )
				] ),
				Dump.menu( 'Menu 2', [
					Dump.item( 'A' ),
					Dump.item( 'B' )
				] )
			] )
		);
	} );

	it( 'should not expand lazy initialized menu entries', () => {
		const { tree } = createBlankRootListView(
			editor,
			[
				createMockMenuDefinition( 'Menu 1' ),
				createMockMenuDefinition( 'Menu 2' ),
				createMockMenuDefinition( 'Menu 3' )
			],
			{
				lazyInitializeSubMenus: true
			}
		);

		const dump = dumpDropdownMenuTree( tree );

		expect( dump ).to.be.equal(
			Dump.root( [
				Dump.menu( 'Menu 1' ),
				Dump.menu( 'Menu 2' ),
				Dump.menu( 'Menu 3' )
			] )
		);
	} );
} );
