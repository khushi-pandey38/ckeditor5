/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/keyboardfocustracker
 */

import DomEmitterMixin, { type DomEmitter } from './dom/emittermixin.js';
import ObservableMixin, { type ObservableChangeEvent } from './observablemixin.js';
import global from './dom/global.js';

import type FocusTracker from './focustracker.js';
import type { GetCallback } from './emittermixin.js';

/**
 * Represents a focus tracker that tracks the elements focused by the keyboard.
 */
export default class KeyboardFocusTracker extends /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ ObservableMixin() ) {
	/**
	 * True when one of the registered elements is focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocusedUsingKeyboard: boolean;

	/**
	 * Flag indicating whether a key is currently pressed.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isKeyPressed: boolean;

	/**
	 * The focus tracker used to track the focus state of the keyboard focus tracker.
	 *
	 * @readonly
	 * @observable
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * DOM Emitter.
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	/**
	 * Constructs a new instance of the KeyboardFocusTracker class.
	 *
	 * @param focusTracker The focus tracker instance.
	 */
	constructor( focusTracker: FocusTracker ) {
		super();

		this.set( {
			isFocusedUsingKeyboard: false,
			isKeyPressed: false
		} );

		this.focusTracker = focusTracker;
		this.focusTracker.on<ObservableChangeEvent<Element>>( 'change:focusedElement', this._watchFocusTracker );

		this._watchWindowKeyPress();
	}

	/**
	 * Watches the focus tracker and updates the `isKeyboardFocused` property based on the focus state and key press state.
	 *
	 * @returns A callback function that handles the focus change event.
	 */
	private _watchFocusTracker: GetCallback<ObservableChangeEvent<Element>> = ( evt, data, focusedElement ) => {
		this.isFocusedUsingKeyboard = !!focusedElement && this.isKeyPressed;
	};

	/**
	 * Watches for key press events on the window and updates the `isKeyPressed` property accordingly.
	 */
	private _watchWindowKeyPress() {
		const { _domEmitter, focusTracker } = this;

		_domEmitter.listenTo( global.document, 'keydown', () => {
			this.isKeyPressed = true;

			// Handle case when `isFocused` is initially true and user navigates list using keyboard.
			// It's crucial to keep it in `setTimeout` to ensure that the `isFocusedUsingKeyboard` is updated after the
			// handlers of `focusTracker` are executed.
			setTimeout( () => {
				this.isFocusedUsingKeyboard = focusTracker.isFocused;
			} );
		}, { useCapture: true } );

		_domEmitter.listenTo( global.document, 'keyup', () => {
			this.isKeyPressed = false;
		}, { useCapture: true } );
	}

	/**
	 * Destroys the keyboard focus tracker by disabling all global event listeners. It does not
	 * destroy passed focus tracker.
	 */
	public destroy(): void {
		this.stopListening();

		this.isFocusedUsingKeyboard = false;
		this.isKeyPressed = false;

		this.focusTracker.off( 'change:focusedElement', this._watchFocusTracker );
		this._domEmitter.stopListening();
	}
}
