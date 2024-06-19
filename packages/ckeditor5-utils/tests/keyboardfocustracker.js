/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Event, KeyboardEvent */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import FocusTracker from '../src/focustracker.js';
import KeyboardFocusTracker, { GlobalKeyboardMouseInteractionTracker } from '../src/keyboardfocustracker.js';

describe.only( 'KeyboardFocusTracker', () => {
	let clock, container, containerFirstInput, containerSecondInput, focusTracker, keyboardFocusTracker;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		container = document.createElement( 'div' );
		containerFirstInput = document.createElement( 'input' );
		containerSecondInput = document.createElement( 'input' );

		container.appendChild( containerFirstInput );
		container.appendChild( containerSecondInput );

		document.body.appendChild( container );
		clock = testUtils.sinon.useFakeTimers();

		focusTracker = new FocusTracker();
		keyboardFocusTracker = new KeyboardFocusTracker( focusTracker );
	} );

	afterEach( () => {
		keyboardFocusTracker.destroy();
		container.remove();
	} );

	describe( 'constructor()', () => {
		it( 'should set proper default values', () => {
			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
			expect( keyboardFocusTracker.focusTracker ).to.be.equal( focusTracker );
		} );

		it( 'should initialize _globalInteractionTracker', () => {
			expect( keyboardFocusTracker._globalInteractionTracker ).to.be.instanceOf( GlobalKeyboardMouseInteractionTracker );
		} );
	} );

	describe( '_watchFocusTracker', () => {
		describe( 'isKeyPressed=false', () => {
			it( 'should not set isFocusedUsingKeyboard to true when focusTracker is focused', () => {
				focusTracker.add( containerFirstInput );
				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.focusedElement ).not.to.be.null;
				expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
			} );

			it( 'should not set isFocusedUsingKeyboard to false when focusTracker is not focused', () => {
				focusTracker.focusedElement = null;
				keyboardFocusTracker._watchFocusTracker();

				expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
			} );
		} );

		describe( 'isKeyPressed=true', () => {
			beforeEach( () => {
				keyboardFocusTracker..isKeyPressed = true;
			} );

			it( 'should set isFocusedUsingKeyboard to true when focusTracker is focused', () => {
				focusTracker.add( containerFirstInput );
				containerFirstInput.dispatchEvent( new Event( 'focus' ) );

				expect( focusTracker.focusedElement ).not.to.be.null;
				expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;
			} );

			it( 'should not set isFocusedUsingKeyboard to false when focusTracker is not focused', () => {
				focusTracker.focusedElement = null;
				keyboardFocusTracker._watchFocusTracker();

				expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
			} );
		} );
	} );

	describe( '_watchWindowKeyPress', () => {
		it( 'should set isKeyPressed to true when keydown event is fired', () => {
			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );

			expect( keyboardFocusTracker.isKeyPressed ).to.be.true;
		} );

		it( 'should set isKeyPressed to false when keyup event is fired', () => {
			document.dispatchEvent( new KeyboardEvent( 'keyup' ) );

			expect( keyboardFocusTracker.isKeyPressed ).to.be.false;
		} );

		it( 'should set isKeyPressed to false on keyup event', () => {
			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );

			expect( keyboardFocusTracker.isKeyPressed ).to.be.true;

			document.dispatchEvent( new KeyboardEvent( 'keyup' ) );

			expect( keyboardFocusTracker.isKeyPressed ).to.be.false;
		} );

		it( 'should set isFocusedUsingKeyboard to focusTracker.isFocused when keydown event is fired', () => {
			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );
			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );

			// simulate event loop because it set in setTimeout
			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;

			clock.tick( 0 );
			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;
		} );

		it( 'should set isFocusedUsingKeyboard in sync mode if focus was fired between keydown and keyup', () => {
			focusTracker.add( containerFirstInput );

			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;

			document.dispatchEvent( new KeyboardEvent( 'keyup' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;
		} );

		it( 'should set isFocusedUsingKeyboard=false in sync mode if blur was fired between keydown and keyup', () => {
			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );
			containerFirstInput.dispatchEvent( new Event( 'blur' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;

			document.dispatchEvent( new KeyboardEvent( 'keyup' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
		} );

		it( 'should keep isFocusedUsingKeyboard=true while switching focus between elements', () => {
			focusTracker.add( containerFirstInput );
			focusTracker.add( containerSecondInput );

			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;

			containerFirstInput.dispatchEvent( new Event( 'blur' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;

			containerSecondInput.dispatchEvent( new Event( 'focus' ) );

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.true;
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should destroy all document keyboard listeners', () => {
			keyboardFocusTracker.destroy();
			document.dispatchEvent( new KeyboardEvent( 'keydown' ) );

			expect( keyboardFocusTracker.isKeyPressed ).to.be.false;
		} );

		it( 'should not destroy focusTracker', () => {
			keyboardFocusTracker.destroy();
			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			expect( focusTracker.focusedElement ).not.to.be.null;
		} );

		it( 'should off focusedElement listener on focusTracker', () => {
			keyboardFocusTracker.destroy();
			keyboardFocusTracker.isKeyPressed = true;

			focusTracker.add( containerFirstInput );
			containerFirstInput.dispatchEvent( new Event( 'focus' ) );

			expect( focusTracker.focusedElement ).to.equal( containerFirstInput );
			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
		} );

		it( 'should call stopListening method', () => {
			const stopListeningSpy = sinon.spy( keyboardFocusTracker, 'stopListening' );

			keyboardFocusTracker.destroy();

			expect( stopListeningSpy.calledOnce ).to.be.true;
		} );

		it( 'should reset all non-readonly properties', () => {
			keyboardFocusTracker.isFocusedUsingKeyboard = true;
			keyboardFocusTracker.isKeyPressed = true;

			keyboardFocusTracker.destroy();

			expect( keyboardFocusTracker.isFocusedUsingKeyboard ).to.be.false;
			expect( keyboardFocusTracker.isKeyPressed ).to.be.false;
		} );
	} );
} );
