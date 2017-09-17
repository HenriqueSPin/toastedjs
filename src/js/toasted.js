import show from './show';
const uuid = require('shortid');

// add Object.assign Polyfill
require('es6-object-assign').polyfill();



/**
 * Allows Toasted to be Extended
 *
 * @type {{hook: {}, verifyHook: Extender.verifyHook}}
 */
export let Extender = {
	hook : {},
	verifyHook : function (hook) {
		return !!(hook && typeof hook === 'function');
	}
};



/**
 * Toast
 * core instance of toast
 *
 * @param _options
 * @returns {Toasted}
 * @constructor
 */
export const Toasted = function (_options) {

	if(!_options) _options = {};

	/**
	 * Unique id of the toast
	 */
	this.id = uuid.generate();

	/**
	 * Shared Options of the Toast
	 */
	this.options = _options;


	/**
	 * Shared Toasts list
	 */
	this.global = {};


	/**
	 * All Registered Groups
	 */
	this.groups = [];


	/**
	 * Initiate custom toasts
	 */
	initiateCustomToasts(this);


	/**
	 * Create New Group of Toasts
	 *
	 * @param o
	 */
	this.group = (o) => {

		if(!o) o = {};

		if(!o.globalToasts) {
			o.globalToasts = {};
		}

		// share parents global toasts
		Object.assign(o.globalToasts, this.global);

		// tell parent about the group
		let group = new Toasted(o);
		this.groups.push(group);

		return group;
	}


	/**
	 * Register a Global Toast
	 *
	 * @param name
	 * @param payload
	 * @param options
	 */
	this.register = (name, payload, options) => {
		options = options || {};
		return register(this, name, payload, options);
	}


	/**
	 * Show a Simple Toast
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	this.show = (message, options) => {
		return _show(this, message, options);
	}


	/**
	 * Show a Toast with Success Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	this.success = (message, options) => {
		options = options || {};
		options.type = "success";
		return _show(this, message, options);
	}


	/**
	 * Show a Toast with Info Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	this.info =  (message, options) => {
		options = options || {};
		options.type = "info";
		return _show(this, message, options);
	}


	/**
	 * Show a Toast with Error Style
	 *
	 * @param message
	 * @param options
	 * @returns {*}
	 */
	this.error =  (message, options) => {
		options = options || {};
		options.type = "error";
		return _show(this, message, options);
	}


	return this;
};

/**
 * Wrapper for show method in order to manipulate options
 *
 * @param instance
 * @param message
 * @param options
 * @returns {*}
 * @private
 */
export const _show = function (instance, message, options) {
    options = options || {};

    if (typeof options !== "object") {
        console.error("Options should be a type of object. given : " + options);
        return null;
    }

    // clone the global options
    let _options = Object.assign({}, instance.options);

	// merge the cached global options with options
	Object.assign(_options, options);

    return show(instance, message, _options);
};

/**
 * Register the Custom Toasts
 */
export const initiateCustomToasts = function (instance) {

    let customToasts =  instance.options.globalToasts;

    // this will initiate toast for the custom toast.
    let initiate = (message, options) => {

        // check if passed option is a available method if so call it.
        if(typeof(options) === 'string' && instance[options]) {
           return instance[options].apply(instance, [message, {}]);
        }

        // or else create a new toast with passed options.
        return _show(instance.id, message, options);
    };

    if(customToasts) {

	    instance.global = {};

        Object.keys(customToasts).forEach( key => {

            // register the custom toast events to the Toast.custom property
	        instance.global[key] = (payload = {}) => {

                // return the it in order to expose the Toast methods
                return customToasts[key].apply(null, [ payload, initiate ]);
            };
        });

    }
};

const register = function (instance, name, message, options) {

	(!instance.options.globalToasts) ? instance.options.globalToasts = {} : null;

	instance.options.globalToasts[name] = function (payload, initiate) {

		if(typeof message === 'function') {
			message = message(payload);
		}

		return initiate(message, options);
	};


	initiateCustomToasts(instance);
}

export default {Toasted, Extender};