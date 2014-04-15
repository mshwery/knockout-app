(function(window) {

  var Fulcrum = window.Fulcrum = {};

  var toJSON = ko.toJSON,
    utils = {
      // TODO: polyfill Array.isArray
      isArray: Array.isArray,

      initArray: function(value) {
        return ko.observableArray(value);
      },

      initVar: function(value) {
        return ko.observable(value);
      }
    };

  Fulcrum.sync = function(method, model, options) {

  };

  Fulcrum.Model = function(attributes, options) {
    var defaults = this.defaults || {};
    var attrs = attributes || {};
    options || (options = {});
    this.attributes = {};

    // map attrs to model, with extendable fn (in our case we want to make knockout observables)
    _.extend(this.attributes, defaults, attrs);

    // TODO: should this be extracted from the main constructor?
    // turn attrs to observables
    this.toKO();

    // call initialize method
    this.initialize.apply(this, arguments);
  };

  _.extend(Fulcrum.Model.prototype, {

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    changed: {},

    initialize: function(){},

    toJS: function() {
      var attrs = {};

      for (var attr in this.attributes) {
        attrs[attr] = this.get(attr);
      }

      return attrs;
    },

    toJSON: function() {
      return toJSON(this.attributes);
    },

    toKO: function(attribute, value) {
      var attrs;

      if (attribute) {
        (attrs = {})[attribute] = value;
      } else {
        attrs = this.attributes;
      }

      for (var attr in attrs) {
        value = attrs[attr];
        this.attributes[attr] = utils.isArray(value) ?
          utils.initArray(value) :
          utils.initVar(value);

        // subscribe to changes for our model's change hash
        this.subscribe(attr);
      }
    },

    subscribe: function(attr) {
      this.attributes[attr].subscribe(function(newValue) {
        this.changed[attr] = newValue;
      }, this);
    },

    sync: function() {
      return Fulcrum.sync.apply(this, arguments);
    },

    save: function(options) {
      // bunch of stuff here
      var type = this.isNew() ? 'POST' : 'PUT';
      return this.sync(type, options, this);
    },

    fetch: function(options) {
      // bunch of stuff here
      return this.sync('GET', options, this);
    },

    destroy: function(options) {
      // bunch of stuff here
      return this.sync('DELETE', options, this);
    },

    parse: function(response, options) {
      return response;
    },

    clone: function() {
      return new this.constructor(this.toJSON(this.attributes));
    },

    get: function(attr) {
      return ko.utils.unwrapObservable(this.attributes[attr]);
    },

    // key could be a single attr or an object hash of keys and values
    // options could potentially be used to specify 'silent' changes that don't trigger a change event or populate a changed attrs hash
    set: function(key, val, options) {
      var attr, attrs, prev, current, silent, unset;

      // gotta have something to set
      if (key == null) return this;

      // handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val; // properly map the 2 args vs 3 args
      } else {
        // create an empty obj and simultaneously set its key name and value
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // TODO: run validation?
      // if (!this.validate(attrs, options)) return false;

      // extract options
      unset = options.unset;
      silent = options.silent;

      // setup previous & current attrs
      prev = this._previousAttributes = this.toJS();
      current = this.attributes;

      // check for changes of `id`
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      for (attr in attrs) {
        val = attrs[attr];

        // TODO: do something to detect change
        // `Model.sync` will have to set `this.changed` back to null upon successful response
        if (ko.utils.unwrapObservable(current[attr]) != val) {
          this.changed[attr] = val;
        }

        unset ? delete current[attr] : this.setAttr(attr, val);
      }

      return this;
    },

    setAttr: function(attr, val) {
      var attribute = this.attributes[attr];

      // TODO: remove KO references... need to abstract these out
      if (attr in this.attributes) {
        ko.isObservable(attribute) ? attribute(val) : (this.attributes[attr] = val);
      } else {
        this.toKO(attr, val);
      }
    },

    previousAttributes: function() {
      return this._previousAttributes;
    },

    has: function(attr) {
      return this.get(attr) != null;
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    hasChanged: function(attr) {
      return attr ? this.changed.hasOwnProperty(attr) : !_.isEmpty(this.changed);
    }

  });

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  Fulcrum.Model.extend = extend;

  return Fulcrum;
})(window);
