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
	 * The global keyboard and mouse interaction tracker.
	 */
	private readonly _globalInteractionTracker: GlobalKeyboardMouseInteractionTracker;

	/**
	 * True when one of the registered elements is focused.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isFocusedUsingKeyboard: boolean;

	/**
	 * The focus tracker used to track the focus state of the keyboard focus tracker.
	 *
	 * @readonly
	 * @observable
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * Constructs a new instance of the KeyboardFocusTracker class.
	 *
	 * @param focusTracker The focus tracker instance.
	 */
	constructor( focusTracker: FocusTracker ) {
		super();

		this.set( 'isFocusedUsingKeyboard', false );

		this._globalInteractionTracker = new GlobalKeyboardMouseInteractionTracker();
		this._globalInteractionTracker.on<ObservableChangeEvent<boolean>>( 'change:isMouseMoved', this._watchMouseMoved );
		this._globalInteractionTracker.on<ObservableChangeEvent<boolean>>( 'change:isKeyPressed', this._watchIsKeyPressed );

		this.focusTracker = focusTracker;
		this.focusTracker.on<ObservableChangeEvent<Element>>( 'change:focusedElement', this._watchChangeFocusedElement );
	}

	/**
	 * Callback function for the mouse moved event.
	 * If mouse moved event is triggered, it sets the `isFocusedUsingKeyboard` property to false.
	 *
	 * @returns A callback function that handles the mouse moved event.
	 */
	private _watchMouseMoved: GetCallback<ObservableChangeEvent<boolean>> = ( evt, data, mouseMoved ) => {
		if ( mouseMoved ) {
			this.isFocusedUsingKeyboard = false;
		}
	};

	/**
	 * Callback function used to watch if a key is pressed.
	 *
	 * @returns A callback function that handles the key press event.
	 */
	private _watchIsKeyPressed: GetCallback<ObservableChangeEvent<boolean>> = ( evt, data, isKeyPressed ) => {
		if ( isKeyPressed ) {
			this.isFocusedUsingKeyboard = this.focusTracker.isFocused;
		}
	};

	/**
	 * Watches the focus tracker and updates the `isKeyboardFocused` property based on the focus state and key press state.
	 *
	 * @returns A callback function that handles the focus change event.
	 */
	private _watchChangeFocusedElement: GetCallback<ObservableChangeEvent<Element>> = ( evt, data, focusedElement ) => {
		const { isMouseMoved, isKeyPressed } = this._globalInteractionTracker;

		this.isFocusedUsingKeyboard = !!focusedElement && !isMouseMoved && isKeyPressed;
	};

	/**
	 * Destroys the keyboard focus tracker by disabling all global event listeners. It does not
	 * destroy passed focus tracker.
	 */
	public destroy(): void {
		this.stopListening();

		this.focusTracker.off( 'change:focusedElement', this._watchChangeFocusedElement );
		this._globalInteractionTracker.off( 'change:isMouseMoved', this._watchMouseMoved );

		this._globalInteractionTracker.destroy();
		this.isFocusedUsingKeyboard = false;
	}
}

/**
 * Represents a global keyboard and mouse interaction tracker. Only one instance of this class should exist at a time.
 */
export class GlobalKeyboardMouseInteractionTracker extends /* #__PURE__ */ DomEmitterMixin( /* #__PURE__ */ ObservableMixin() ) {
	/**
	 * The singleton instance of the class.
	 */
	private static _instance: GlobalKeyboardMouseInteractionTracker | null = null;

	/**
	 * The total number of instances of the class. It's used to determine if the singleton instance should be destroyed.
	 */
	private static _totalInstances: number = 0;

	/**
	 * Flag indicating whether a key is currently pressed.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isKeyPressed: boolean;

	/**
	 * Flag indicating if mouse has been moved since last key press.
	 *
	 * @readonly
	 * @observable
	 */
	declare public isMouseMoved: boolean;

	/**
	 * DOM Emitter.
	 */
	private _domEmitter: DomEmitter = new ( DomEmitterMixin() )();

	constructor() {
		super();

		// Track how many instances of this class are created and assign the singleton instance.
		GlobalKeyboardMouseInteractionTracker._totalInstances++;

		if ( GlobalKeyboardMouseInteractionTracker._instance ) {
			return GlobalKeyboardMouseInteractionTracker._instance;
		}

		GlobalKeyboardMouseInteractionTracker._instance = this;

		// Initialize rest of the properties.
		this.set( {
			isKeyPressed: false,
			isMouseMoved: false
		} );

		this._mountDocumentListeners();
	}

	/**
	 * Watches for key press events on the window and updates the `isKeyPressed` property accordingly.
	 */
	private _mountDocumentListeners() {
		const { _domEmitter } = this;

		const handleMouseMoved = () => {
			this.isMouseMoved = true;
		};

		const handleResetKeyPress = () => {
			this.isKeyPressed = false;
			this.isMouseMoved = false;
		};

		_domEmitter.listenTo( global.document, 'mouseleave', handleMouseMoved, { useCapture: true } );
		_domEmitter.listenTo( global.document, 'pointerleave', handleMouseMoved, { useCapture: true } );
		_domEmitter.listenTo( global.document, 'mouseenter', handleMouseMoved, { useCapture: true } );
		_domEmitter.listenTo( global.document, 'pointerenter', handleMouseMoved, { useCapture: true } );

		_domEmitter.listenTo( global.document, 'keydown', () => {
			this.isMouseMoved = false;
			this.isKeyPressed = true;
		}, { useCapture: true } );

		_domEmitter.listenTo( global.document, 'keyup', handleResetKeyPress, { useCapture: true } );
	}

	/**
	 * Destroys the keyboard focus tracker by disabling all global event listeners. It does not
	 * destroy passed focus tracker.
	 */
	public destroy(): void {
		// Unmount local listeners.
		this.stopListening();
		this._domEmitter.stopListening();
		this.isKeyPressed = false;
		this.isMouseMoved = false;

		// If this is the last instance of this class, reset the singleton instance.
		GlobalKeyboardMouseInteractionTracker._totalInstances--;

		if ( !GlobalKeyboardMouseInteractionTracker._totalInstances ) {
			GlobalKeyboardMouseInteractionTracker._instance!.destroy();
			GlobalKeyboardMouseInteractionTracker._instance = null;
		}
	}
}
