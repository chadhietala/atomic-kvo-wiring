/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

// atomic.js
(function(context, undefined) {
  if (context.Atomic) {
    return;
  }

  /**
   * The global Atomic Object
   * @class Atomic
   */
  var Atomic = {
    CONSTANTS: {},
    Events: {},
    _: {
      Fiber: null,
      EventEmitter: null,
      requires: {} // used when no module loader is enabled
    },
    loader: {
      init: null,
      load: null
    }
  };

  // common JS and AMD environment
  // inside of this file, no define calls can be made
  var module;
  var exports;
  var process;
  var define = null;

  // imported APIs
  var __Atomic_AbstractComponent__;
  var __Atomic_CONSTANTS__;
  var __Atomic_Public_API__;
  var __Atomic_Events_API__;
  var __Atomic_Public_Factory_Methods__;
  var __Atomic_Private_Factory_Methods__;

  Atomic.config = context.ATOMIC_CONFIG || {};

  /**
   * Copy one objects properties into another
   * @method Atomic.augment
   * @param {Object} src - the source to supplement with new things
   * @param {Object} target - the thing to copy from
   * @returns {Object} the resulting object. `src` is updated by reference when using objects
   * @private
   */
  Atomic.augment = function(src, target) {
    if (Object.prototype.toString.call(src) === '[object Array]') {
      src = src.concat(target);
    }
    else {
      for (var name in target) {
        if (target.hasOwnProperty(name)) {
          src[name] = target[name];
        }
      }
    }
    return src;
  };

  /**
   * Create a "CommonJS" environment. This lets us
   * include a library directly, without having to alter
   * the original code. We can then collect the contents
   * from the module.exports object
   * @method cjsHarness
   * @private
   */
  function cjsHarness() {
    module = {
      exports: {}
    };
    exports = module.exports;
    process = {
      title: 'Atomic CommonJS Harness'
    };
  }

  /**
   * Destroy the "CommonJS" environment.
   * @method resetCjs
   * @private
   */
  function resetCjs() {
    module = undefined;
    exports = undefined;
    process = undefined;
  }

  // --------------------------------------------------
  // CONSTANTS
  // --------------------------------------------------
  /*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

// constants.js
var __Atomic_CONSTANTS__ = {};

// js hint requires var to be used
__Atomic_CONSTANTS__ = __Atomic_CONSTANTS__;
  Atomic.augment(Atomic._.CONSTANTS, __Atomic_CONSTANTS__);

  // --------------------------------------------------
  // FIBER
  // --------------------------------------------------
  cjsHarness();
  //     Fiber.js 1.0.5
//     @author: Kirollos Risk
//
//     Copyright (c) 2012 LinkedIn.
//     All Rights Reserved. Apache Software License 2.0
//     http://www.apache.org/licenses/LICENSE-2.0

(function () {
  /*jshint bitwise: true, camelcase: false, curly: true, eqeqeq: true,
    forin: false, immed: true, indent: 2, latedef: true, newcap: false,
    noarg: true, noempty: false, nonew: true, plusplus: false,
    quotmark: single, regexp: false, undef: true, unused: true, strict: false,
    trailing: true, asi: false, boss: false, debug: false, eqnull: true,
    es5: false, esnext: false, evil: true, expr: false, funcscope: false,
    iterator: false, lastsemic: false, laxbreak: false, laxcomma: false,
    loopfunc: false, multistr: true, onecase: false, proto: false,
    regexdash: false, scripturl: false, smarttabs: false, shadow: true,
    sub: true, supernew: true, validthis: false */

  /*global exports, global, define, module */

  (function (root, factory) {
    if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory(this);
    } else if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define(function () {
        return factory(root);
      });
    } else {
      // Browser globals (root is window)
      root.Fiber = factory(root);
    }
  }(this, function (global) {

    // Baseline setup
    // --------------

    // Stores whether the object is being initialized. i.e., whether
    // to run the `init` function, or not.
    var initializing = false,

    // Keep a few prototype references around - for speed access,
    // and saving bytes in the minified version.
    ArrayProto = Array.prototype,

    // Save the previous value of `Fiber`.
    previousFiber = global.Fiber;

    // Helper function to copy properties from one object to the other.
    function copy(from, to) {
      var name;
      for (name in from) {
        if (from.hasOwnProperty(name)) {
          to[name] = from[name];
        }
      }
    }

    // The base `Fiber` implementation.
    function Fiber() {}

    // ###Extend
    //
    // Returns a subclass.
    Fiber.extend = function (fn) {
      // Keep a reference to the current prototye.
      var parent = this.prototype,

      // Invoke the function which will return an object literal used to
      // define the prototype. Additionally, pass in the parent prototype,
      // which will allow instances to use it.
      properties = fn(parent),

      // Stores the constructor's prototype.
      proto;

      // The constructor function for a subclass.
      function child() {
        if (!initializing) {
          // Custom initialization is done in the `init` method.
          this.init.apply(this, arguments);
          // Prevent subsequent calls to `init`. Note: although a `delete
          // this.init` would remove the `init` function from the instance, it
          // would still exist in its super class' prototype.  Therefore,
          // explicitly set `init` to `void 0` to obtain the `undefined`
          // primitive value (in case the global's `undefined` property has
          // been re-assigned).
          this.init = void 0;
        }
      }

      // Instantiate a base class (but only create the instance, without
      // running `init`). And, make every `constructor` instance an instance
      // of `this` and of `constructor`.
      initializing = true;
      proto = child.prototype = new this;
      initializing = false;

      // Add default `init` function, which a class may override; it should
      // call the super class' `init` function (if it exists);
      proto.init = function () {
        if (typeof parent.init === 'function') {
          parent.init.apply(this, arguments);
        }
      };

       // Copy the properties over onto the new prototype.
      copy(properties, proto);

      // Enforce the constructor to be what we expect.
      proto.constructor = child;

      // Keep a reference to the parent prototype.
      // (Note: currently used by decorators and mixins, so that the parent
      // can be inferred).
      child.__base__ = parent;

      // Make this class extendable, this can be overridden by providing a
      // custom extend method on the proto.
      child.extend = child.prototype.extend || Fiber.extend;


      return child;
    };

    // Utilities
    // ---------

    // ###Proxy
    //
    // Returns a proxy object for accessing base methods with a given context.
    //
    // - `base`: the instance' parent class prototype.
    // - `instance`: a Fiber class instance.
    //
    // Overloads:
    //
    // - `Fiber.proxy( instance )`
    // - `Fiber.proxy( base, instance )`
    //
    Fiber.proxy = function (base, instance) {
      var name,
        iface = {},
        wrap;

      // If there's only 1 argument specified, then it is the instance,
      // thus infer `base` from its constructor.
      if (arguments.length === 1) {
        instance = base;
        base = instance.constructor.__base__;
      }

      // Returns a function which calls another function with `instance` as
      // the context.
      wrap = function (fn) {
        return function () {
          return base[fn].apply(instance, arguments);
        };
      };

      // For each function in `base`, create a wrapped version.
      for (name in base) {
        if (base.hasOwnProperty(name) && typeof base[name] === 'function') {
          iface[name] = wrap(name);
        }
      }
      return iface;
    };

    // ###Decorate
    //
    // Decorate an instance with given decorator(s).
    //
    // - `instance`: a Fiber class instance.
    // - `decorator[s]`: the argument list of decorator functions.
    //
    // Note: when a decorator is executed, the argument passed in is the super
    // class' prototype, and the context (i.e. the `this` binding) is the
    // instance.
    //
    //  *Example usage:*
    //
    //     function Decorator( base ) {
    //       // this === obj
    //       return {
    //         greet: function() {
    //           console.log('hi!');
    //         }
    //       };
    //     }
    //
    //     var obj = new Bar(); // Some instance of a Fiber class
    //     Fiber.decorate(obj, Decorator);
    //     obj.greet(); // hi!
    //
    Fiber.decorate = function (instance /*, decorator[s] */) {
      var i,
        // Get the base prototype.
        base = instance.constructor.__base__,
        // Get all the decorators in the arguments.
        decorators = ArrayProto.slice.call(arguments, 1),
        len = decorators.length;

      for (i = 0; i < len; i++) {
        copy(decorators[i].call(instance, base), instance);
      }
    };

    // ###Mixin
    //
    // Add functionality to a Fiber definition
    //
    // - `definition`: a Fiber class definition.
    // - `mixin[s]`: the argument list of mixins.
    //
    // Note: when a mixing is executed, the argument passed in is the super
    // class' prototype (i.e., the base)
    //
    // Overloads:
    //
    // - `Fiber.mixin( definition, mix_1 )`
    // - `Fiber.mixin( definition, mix_1, ..., mix_n )`
    //
    // *Example usage:*
    //
    //     var Definition = Fiber.extend(function(base) {
    //       return {
    //         method1: function(){}
    //       }
    //     });
    //
    //     function Mixin(base) {
    //       return {
    //         method2: function(){}
    //       }
    //     }
    //
    //     Fiber.mixin(Definition, Mixin);
    //     var obj = new Definition();
    //     obj.method2();
    //
    Fiber.mixin = function (definition /*, mixin[s] */) {
      var i,
        // Get the base prototype.
        base = definition.__base__,
        // Get all the mixins in the arguments.
        mixins = ArrayProto.slice.call(arguments, 1),
        len = mixins.length;

      for (i = 0; i < len; i++) {
        copy(mixins[i](base), definition.prototype);
      }
    };

    // ###noConflict
    //
    // Run Fiber.js in *noConflict* mode, returning the `fiber` variable to
    // its previous owner. Returns a reference to the Fiber object.
    Fiber.noConflict = function () {
      global.Fiber = previousFiber;
      return Fiber;
    };

    return Fiber;
  }));
} ());
  Atomic._.Fiber = module.exports;
  resetCjs();

  // --------------------------------------------------
  // EVENT EMITTER 2
  // --------------------------------------------------
  cjsHarness();
  ;!function(exports, undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      
      this._conf = conf;
      
      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }
    
    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }
        
        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
    
    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;
            
            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  };

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    };

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {
    
    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      
      if (!this._all && 
        !this._events.error && 
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || this._all;
    }
    else {
      return this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {
    
    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;
        
        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if(!this._all) {
      this._all = [];
    }

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          return this;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1)
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return EventEmitter;
    });
  } else {
    exports.EventEmitter2 = EventEmitter; 
  }

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
  Atomic._.EventEmitter = module.exports.EventEmitter2;
  resetCjs();

  // --------------------------------------------------
  // WHEN.JS Promises/A+
  // --------------------------------------------------
  cjsHarness();
  /** @license MIT License (c) copyright 2011-2013 original author or authors */

/**
 * A lightweight CommonJS Promises/A and when() implementation
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 * @version 2.0.1
 */
(function(define) { 'use strict';
define(function () {

  // Public API

  when.defer     = defer;      // Create a deferred
  when.resolve   = resolve;    // Create a resolved promise
  when.reject    = reject;     // Create a rejected promise

  when.join      = join;       // Join 2 or more promises

  when.all       = all;        // Resolve a list of promises
  when.map       = map;        // Array.map() for promises
  when.reduce    = reduce;     // Array.reduce() for promises

  when.any       = any;        // One-winner race
  when.some      = some;       // Multi-winner race

  when.isPromise = isPromise;  // Determine if a thing is a promise

  /**
   * Register an observer for a promise or immediate value.
   *
   * @param {*} promiseOrValue
   * @param {function?} [onFulfilled] callback to be called when promiseOrValue is
   *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
   *   will be invoked immediately.
   * @param {function?} [onRejected] callback to be called when promiseOrValue is
   *   rejected.
   * @param {function?} [onProgress] callback to be called when progress updates
   *   are issued for promiseOrValue.
   * @returns {Promise} a new {@link Promise} that will complete with the return
   *   value of callback or errback or the completion value of promiseOrValue if
   *   callback and/or errback is not supplied.
   */
  function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
    // Get a trusted promise for the input promiseOrValue, and then
    // register promise handlers
    return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
  }

  /**
   * Trusted Promise constructor.  A Promise created from this constructor is
   * a trusted when.js promise.  Any other duck-typed promise is considered
   * untrusted.
   * @constructor
   * @name Promise
   */
  function Promise(then) {
    this.then = then;
  }

  Promise.prototype = {
    /**
     * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
     * @param {function?} onRejected
     * @return {Promise}
     */
    otherwise: function(onRejected) {
      return this.then(undef, onRejected);
    },

    /**
     * Ensures that onFulfilledOrRejected will be called regardless of whether
     * this promise is fulfilled or rejected.  onFulfilledOrRejected WILL NOT
     * receive the promises' value or reason.  Any returned value will be disregarded.
     * onFulfilledOrRejected may throw or return a rejected promise to signal
     * an additional error.
     * @param {function} onFulfilledOrRejected handler to be called regardless of
     *  fulfillment or rejection
     * @returns {Promise}
     */
    ensure: function(onFulfilledOrRejected) {
      var self = this;

      return this.then(injectHandler, injectHandler).yield(self);

      function injectHandler() {
        return resolve(onFulfilledOrRejected());
      }
    },

    /**
     * Shortcut for .then(function() { return value; })
     * @param  {*} value
     * @return {Promise} a promise that:
     *  - is fulfilled if value is not a promise, or
     *  - if value is a promise, will fulfill with its value, or reject
     *    with its reason.
     */
    'yield': function(value) {
      return this.then(function() {
        return value;
      });
    },

    /**
     * Assumes that this promise will fulfill with an array, and arranges
     * for the onFulfilled to be called with the array as its argument list
     * i.e. onFulfilled.apply(undefined, array).
     * @param {function} onFulfilled function to receive spread arguments
     * @return {Promise}
     */
    spread: function(onFulfilled) {
      return this.then(function(array) {
        // array may contain promises, so resolve its contents.
        return all(array, function(array) {
          return onFulfilled.apply(undef, array);
        });
      });
    },

    /**
     * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected)
     * @deprecated
     */
    always: function(onFulfilledOrRejected, onProgress) {
      return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
    }
  };

  /**
   * Returns a resolved promise. The returned promise will be
   *  - fulfilled with promiseOrValue if it is a value, or
   *  - if promiseOrValue is a promise
   *    - fulfilled with promiseOrValue's value after it is fulfilled
   *    - rejected with promiseOrValue's reason after it is rejected
   * @param  {*} value
   * @return {Promise}
   */
  function resolve(value) {
    return promise(function(resolve) {
      resolve(value);
    });
  }

  /**
   * Returns a rejected promise for the supplied promiseOrValue.  The returned
   * promise will be rejected with:
   * - promiseOrValue, if it is a value, or
   * - if promiseOrValue is a promise
   *   - promiseOrValue's value after it is fulfilled
   *   - promiseOrValue's reason after it is rejected
   * @param {*} promiseOrValue the rejected value of the returned {@link Promise}
   * @return {Promise} rejected {@link Promise}
   */
  function reject(promiseOrValue) {
    return when(promiseOrValue, rejected);
  }

  /**
   * Creates a new Deferred with fully isolated resolver and promise parts,
   * either or both of which may be given out safely to consumers.
   * The resolver has resolve, reject, and progress.  The promise
   * only has then.
   *
   * @return {{
   * promise: Promise,
   * resolver: {
   *  resolve: function:Promise,
   *  reject: function:Promise,
   *  notify: function:Promise
   * }}}
   */
  function defer() {
    var deferred, pending, resolved;

    // Optimize object shape
    deferred = {
      promise: undef, resolve: undef, reject: undef, notify: undef,
      resolver: { resolve: undef, reject: undef, notify: undef }
    };

    deferred.promise = pending = promise(makeDeferred);

    return deferred;

    function makeDeferred(resolvePending, rejectPending, notifyPending) {
      deferred.resolve = deferred.resolver.resolve = function(value) {
        if(resolved) {
          return resolve(value);
        }
        resolved = true;
        resolvePending(value);
        return pending;
      };

      deferred.reject  = deferred.resolver.reject  = function(reason) {
        if(resolved) {
          return resolve(rejected(reason));
        }
        resolved = true;
        rejectPending(reason);
        return pending;
      };

      deferred.notify  = deferred.resolver.notify  = function(update) {
        notifyPending(update);
        return update;
      };
    }
  }

  /**
   * Creates a new promise whose fate is determined by resolver.
   * @private (for now)
   * @param {function} resolver function(resolve, reject, notify)
   * @returns {Promise} promise whose fate is determine by resolver
   */
  function promise(resolver) {
    var value, handlers = [];

    // Call the provider resolver to seal the promise's fate
    try {
      resolver(promiseResolve, promiseReject, promiseNotify);
    } catch(e) {
      promiseReject(e);
    }

    // Return the promise
    return new Promise(then);

    /**
     * Register handlers for this promise.
     * @param [onFulfilled] {Function} fulfillment handler
     * @param [onRejected] {Function} rejection handler
     * @param [onProgress] {Function} progress handler
     * @return {Promise} new Promise
     */
    function then(onFulfilled, onRejected, onProgress) {
      return promise(function(resolve, reject, notify) {
        handlers
        // Call handlers later, after resolution
        ? handlers.push(function(value) {
          value.then(onFulfilled, onRejected, onProgress)
            .then(resolve, reject, notify);
        })
        // Call handlers soon, but not in the current stack
        : enqueue(function() {
          value.then(onFulfilled, onRejected, onProgress)
            .then(resolve, reject, notify);
        });
      });
    }

    /**
     * Transition from pre-resolution state to post-resolution state, notifying
     * all listeners of the ultimate fulfillment or rejection
     * @param {*|Promise} val resolution value
     */
    function promiseResolve(val) {
      if(!handlers) {
        return;
      }

      value = coerce(val);
      scheduleHandlers(handlers, value);

      handlers = undef;
    }

    /**
     * Reject this promise with the supplied reason, which will be used verbatim.
     * @param {*} reason reason for the rejection
     */
    function promiseReject(reason) {
      promiseResolve(rejected(reason));
    }

    /**
     * Issue a progress event, notifying all progress listeners
     * @param {*} update progress event payload to pass to all listeners
     */
    function promiseNotify(update) {
      if(handlers) {
        scheduleHandlers(handlers, progressing(update));
      }
    }
  }

  /**
   * Coerces x to a trusted Promise
   *
   * @private
   * @param {*} x thing to coerce
   * @returns {Promise} Guaranteed to return a trusted Promise.  If x
   *   is trusted, returns x, otherwise, returns a new, trusted, already-resolved
   *   Promise whose resolution value is:
   *   * the resolution value of x if it's a foreign promise, or
   *   * x if it's a value
   */
  function coerce(x) {
    if(x instanceof Promise) {
      return x;
    } else if (x !== Object(x)) {
      return fulfilled(x);
    }

    return promise(function(resolve, reject, notify) {
      enqueue(function() {
        try {
          // We must check and assimilate in the same tick, but not the
          // current tick, careful only to access promiseOrValue.then once.
          var untrustedThen = x.then;

          if(typeof untrustedThen === 'function') {
            fcall(untrustedThen, x, resolve, reject, notify);
          } else {
            // It's a value, create a fulfilled wrapper
            resolve(fulfilled(x));
          }

        } catch(e) {
          // Something went wrong, reject
          reject(e);
        }
      });
    });
  }

  /**
   * Create an already-fulfilled promise for the supplied value
   * @private
   * @param {*} value
   * @return {Promise} fulfilled promise
   */
  function fulfilled(value) {
    var self = new Promise(function (onFulfilled) {
      try {
        return typeof onFulfilled == 'function'
          ? coerce(onFulfilled(value)) : self;
      } catch (e) {
        return rejected(e);
      }
    });

    return self;
  }

  /**
   * Create an already-rejected promise with the supplied rejection reason.
   * @private
   * @param {*} reason
   * @return {Promise} rejected promise
   */
  function rejected(reason) {
    var self = new Promise(function (_, onRejected) {
      try {
        return typeof onRejected == 'function'
          ? coerce(onRejected(reason)) : self;
      } catch (e) {
        return rejected(e);
      }
    });

    return self;
  }

  /**
   * Create a progress promise with the supplied update.
   * @private
   * @param {*} update
   * @return {Promise} progress promise
   */
  function progressing(update) {
    var self = new Promise(function (_, __, onProgress) {
      try {
        return typeof onProgress == 'function'
          ? progressing(onProgress(update)) : self;
      } catch (e) {
        return progressing(e);
      }
    });

    return self;
  }

  /**
   * Schedule a task that will process a list of handlers
   * in the next queue drain run.
   * @private
   * @param {Array} handlers queue of handlers to execute
   * @param {*} value passed as the only arg to each handler
   */
  function scheduleHandlers(handlers, value) {
    enqueue(function() {
      var handler, i = 0;
      while (handler = handlers[i++]) {
        handler(value);
      }
    });
  }

  /**
   * Determines if promiseOrValue is a promise or not
   *
   * @param {*} promiseOrValue anything
   * @returns {boolean} true if promiseOrValue is a {@link Promise}
   */
  function isPromise(promiseOrValue) {
    return promiseOrValue && typeof promiseOrValue.then === 'function';
  }

  /**
   * Initiates a competitive race, returning a promise that will resolve when
   * howMany of the supplied promisesOrValues have resolved, or will reject when
   * it becomes impossible for howMany to resolve, for example, when
   * (promisesOrValues.length - howMany) + 1 input promises reject.
   *
   * @param {Array} promisesOrValues array of anything, may contain a mix
   *      of promises and values
   * @param howMany {number} number of promisesOrValues to resolve
   * @param {function?} [onFulfilled] resolution handler
   * @param {function?} [onRejected] rejection handler
   * @param {function?} [onProgress] progress handler
   * @returns {Promise} promise that will resolve to an array of howMany values that
   *  resolved first, or will reject with an array of
   *  (promisesOrValues.length - howMany) + 1 rejection reasons.
   */
  function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {

    checkCallbacks(2, arguments);

    return when(promisesOrValues, function(promisesOrValues) {

      return promise(resolveSome).then(onFulfilled, onRejected, onProgress);

      function resolveSome(resolve, reject, notify) {
        var toResolve, toReject, values, reasons, fulfillOne, rejectOne, len, i;

        len = promisesOrValues.length >>> 0;

        toResolve = Math.max(0, Math.min(howMany, len));
        values = [];

        toReject = (len - toResolve) + 1;
        reasons = [];

        // No items in the input, resolve immediately
        if (!toResolve) {
          resolve(values);

        } else {
          rejectOne = function(reason) {
            reasons.push(reason);
            if(!--toReject) {
              fulfillOne = rejectOne = noop;
              reject(reasons);
            }
          };

          fulfillOne = function(val) {
            // This orders the values based on promise resolution order
            values.push(val);
            if (!--toResolve) {
              fulfillOne = rejectOne = noop;
              resolve(values);
            }
          };

          for(i = 0; i < len; ++i) {
            if(i in promisesOrValues) {
              when(promisesOrValues[i], fulfiller, rejecter, notify);
            }
          }
        }

        function rejecter(reason) {
          rejectOne(reason);
        }

        function fulfiller(val) {
          fulfillOne(val);
        }
      }
    });
  }

  /**
   * Initiates a competitive race, returning a promise that will resolve when
   * any one of the supplied promisesOrValues has resolved or will reject when
   * *all* promisesOrValues have rejected.
   *
   * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
   *      of {@link Promise}s and values
   * @param {function?} [onFulfilled] resolution handler
   * @param {function?} [onRejected] rejection handler
   * @param {function?} [onProgress] progress handler
   * @returns {Promise} promise that will resolve to the value that resolved first, or
   * will reject with an array of all rejected inputs.
   */
  function any(promisesOrValues, onFulfilled, onRejected, onProgress) {

    function unwrapSingleResult(val) {
      return onFulfilled ? onFulfilled(val[0]) : val[0];
    }

    return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
  }

  /**
   * Return a promise that will resolve only once all the supplied promisesOrValues
   * have resolved. The resolution value of the returned promise will be an array
   * containing the resolution values of each of the promisesOrValues.
   * @memberOf when
   *
   * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
   *      of {@link Promise}s and values
   * @param {function?} [onFulfilled] resolution handler
   * @param {function?} [onRejected] rejection handler
   * @param {function?} [onProgress] progress handler
   * @returns {Promise}
   */
  function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
    checkCallbacks(1, arguments);
    return map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
  }

  /**
   * Joins multiple promises into a single returned promise.
   * @return {Promise} a promise that will fulfill when *all* the input promises
   * have fulfilled, or will reject when *any one* of the input promises rejects.
   */
  function join(/* ...promises */) {
    return map(arguments, identity);
  }

  /**
   * Traditional map function, similar to `Array.prototype.map()`, but allows
   * input to contain {@link Promise}s and/or values, and mapFunc may return
   * either a value or a {@link Promise}
   *
   * @param {Array|Promise} array array of anything, may contain a mix
   *      of {@link Promise}s and values
   * @param {function} mapFunc mapping function mapFunc(value) which may return
   *      either a {@link Promise} or value
   * @returns {Promise} a {@link Promise} that will resolve to an array containing
   *      the mapped output values.
   */
  function map(array, mapFunc) {
    return when(array, function(array) {

      return promise(resolveMap);

      function resolveMap(resolve, reject, notify) {
        var results, len, toResolve, resolveOne, i;

        // Since we know the resulting length, we can preallocate the results
        // array to avoid array expansions.
        toResolve = len = array.length >>> 0;
        results = [];

        if(!toResolve) {
          resolve(results);
        } else {

          resolveOne = function(item, i) {
            when(item, mapFunc).then(function(mapped) {
              results[i] = mapped;

              if(!--toResolve) {
                resolve(results);
              }
            }, reject, notify);
          };

          // Since mapFunc may be async, get all invocations of it into flight
          for(i = 0; i < len; i++) {
            if(i in array) {
              resolveOne(array[i], i);
            } else {
              --toResolve;
            }
          }
        }
      }
    });
  }

  /**
   * Traditional reduce function, similar to `Array.prototype.reduce()`, but
   * input may contain promises and/or values, and reduceFunc
   * may return either a value or a promise, *and* initialValue may
   * be a promise for the starting value.
   *
   * @param {Array|Promise} promise array or promise for an array of anything,
   *      may contain a mix of promises and values.
   * @param {function} reduceFunc reduce function reduce(currentValue, nextValue, index, total),
   *      where total is the total number of items being reduced, and will be the same
   *      in each call to reduceFunc.
   * @returns {Promise} that will resolve to the final reduced value
   */
  function reduce(promise, reduceFunc /*, initialValue */) {
    var args = fcall(slice, arguments, 1);

    return when(promise, function(array) {
      var total;

      total = array.length;

      // Wrap the supplied reduceFunc with one that handles promises and then
      // delegates to the supplied.
      args[0] = function (current, val, i) {
        return when(current, function (c) {
          return when(val, function (value) {
            return reduceFunc(c, value, i, total);
          });
        });
      };

      return reduceArray.apply(array, args);
    });
  }

  //
  // Utilities, etc.
  //

  var reduceArray, slice, fcall, nextTick, handlerQueue,
    timeout, funcProto, call, arrayProto, undef;

  //
  // Shared handler queue processing
  //
  // Credit to Twisol (https://github.com/Twisol) for suggesting
  // this type of extensible queue + trampoline approach for
  // next-tick conflation.

  handlerQueue = [];

  /**
   * Enqueue a task. If the queue is not currently scheduled to be
   * drained, schedule it.
   * @param {function} task
   */
  function enqueue(task) {
    if(handlerQueue.push(task) === 1) {
      scheduleDrainQueue();
    }
  }

  /**
   * Schedule the queue to be drained in the next tick.
   */
  function scheduleDrainQueue() {
    nextTick(drainQueue);
  }

  /**
   * Drain the handler queue entirely or partially, being careful to allow
   * the queue to be extended while it is being processed, and to continue
   * processing until it is truly empty.
   */
  function drainQueue() {
    var task, i = 0;

    while(task = handlerQueue[i++]) {
      task();
    }

    handlerQueue = [];
  }

  //
  // Capture function and array utils
  //
  /*global setTimeout,setImmediate,window,process*/

  // capture setTimeout to avoid being caught by fake timers used in time based tests
  timeout = setTimeout;
  nextTick = typeof setImmediate === 'function'
    ? typeof window === 'undefined'
      ? setImmediate
      : setImmediate.bind(window)
    : typeof process === 'object' && process.nextTick
      ? process.nextTick
      : function(task) { timeout(task, 0); };

  // Safe function calls
  funcProto = Function.prototype;
  call = funcProto.call;
  fcall = funcProto.bind
    ? call.bind(call)
    : function(f, context) {
      return f.apply(context, slice.call(arguments, 2));
    };

  // Safe array ops
  arrayProto = [];
  slice = arrayProto.slice;

  // ES5 reduce implementation if native not available
  // See: http://es5.github.com/#x15.4.4.21 as there are many
  // specifics and edge cases.  ES5 dictates that reduce.length === 1
  // This implementation deviates from ES5 spec in the following ways:
  // 1. It does not check if reduceFunc is a Callable
  reduceArray = arrayProto.reduce ||
    function(reduceFunc /*, initialValue */) {
      /*jshint maxcomplexity: 7*/
      var arr, args, reduced, len, i;

      i = 0;
      arr = Object(this);
      len = arr.length >>> 0;
      args = arguments;

      // If no initialValue, use first item of array (we know length !== 0 here)
      // and adjust i to start at second item
      if(args.length <= 1) {
        // Skip to the first real element in the array
        for(;;) {
          if(i in arr) {
            reduced = arr[i++];
            break;
          }

          // If we reached the end of the array without finding any real
          // elements, it's a TypeError
          if(++i >= len) {
            throw new TypeError();
          }
        }
      } else {
        // If initialValue provided, use it
        reduced = args[1];
      }

      // Do the actual reduce
      for(;i < len; ++i) {
        if(i in arr) {
          reduced = reduceFunc(reduced, arr[i], i, arr);
        }
      }

      return reduced;
    };

  //
  // Utility functions
  //

  /**
   * Helper that checks arrayOfCallbacks to ensure that each element is either
   * a function, or null or undefined.
   * @private
   * @param {number} start index at which to start checking items in arrayOfCallbacks
   * @param {Array} arrayOfCallbacks array to check
   * @throws {Error} if any element of arrayOfCallbacks is something other than
   * a functions, null, or undefined.
   */
  function checkCallbacks(start, arrayOfCallbacks) {
    // TODO: Promises/A+ update type checking and docs
    var arg, i = arrayOfCallbacks.length;

    while(i > start) {
      arg = arrayOfCallbacks[--i];

      if (arg != null && typeof arg != 'function') {
        throw new Error('arg '+i+' must be a function');
      }
    }
  }

  function noop() {}

  function identity(x) {
    return x;
  }

  return when;
});
})(
  typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(); }
);
  Atomic._.When = module.exports;
  resetCjs();

  // --------------------------------------------------
  // ABSTRACT COMPONENT
  // --------------------------------------------------
  /*global Atomic:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Add an initialization function to an instance object
 * this places the function onto the _inits property
 * of the instance, and can optionally put it at the front
 * of the init collection
 * @method AbstractComponent.addInit
 * @private
 * @param {Object} obj - the object to augment with a new init
 * @param {Function} func - the function to add to obj
 * @param {Boolean} addFront - if true, the Func is placed at the front
 */
function addInit(obj, func, addFront) {
  if (addFront) {
    obj._inits.unshift(func);
  }
  else {
    obj._inits.push(func);
  }
}

/**
 * Test if the provided object is an array
 * @method AbstractComponent.isArray
 * @private
 * @param {Object} obj - the object to test
 * @returns {Boolean} if true, the object is an array
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * Creates a "displayable" version of an object or array.
 * On instantiation of an AbstractComponent, this is what
 * converts the elements/depends/events into their final
 * resolved forms.
 * An object returned by createDisplayable has the following
 * methods available to it:
 *
 * () - called as a function with no arguments, the resolved
 *   version of the object is provided. This is all of the
 *   assignments that have been made.
 * (key) - called as a function with one argument, the resolved
 *   value for a specific key is provided. This is the same as
 *   calling ().key
 * (key, value) - assigns a resolved "value" to a key
 * .toString() - the string interface for this object provides
 *   the original structure in an easy to read format. It also
 *   indicates which objects have been resolved and have values
 *   assigned to them. This is primarily a debugging tool.
 * ._ - a collection of internal methods for the interface,
 *   including add (adds new items to the collection), raw
     (returns the original object), and set (assigns a resolved
 *   value)
 *
 * @method AbstractComponent.createDisplayable
 * @private
 * @param {Object} obj - the object to convert
 * @param {Boolean} writeBack - if true, properties are also stored on the returned object
 * @param {Boolean} preResolved - if true, no resolution of the object is used. The keys become values
 * @returns {Object} a function/object combination wtih the above methods
 */
function createDisplayable(obj, writeBack, preResolved) {
  var type = (isArray(obj)) ? 'array' : 'object';
  var values = {};
  var registry = {};
  var name, i, len;
  var iface = function(key, to) {
    if (key && to) {
      return iface._.set(key, to);
    }
    else if (key) {
      return values[key];
    }
    return values;
  };
  iface.toString = function() {
    var out = [];
    var name, i;
    if (type === 'object') {
      for (name in obj) {
        if (obj.hasOwnProperty(name)) {
          out.push(name + ' (' + (values[name] ? 'R' : '?') + '): ' + obj[name]);
        }
      }
    }
    else {
      for (i = 0, len = obj.length; i < len; i++) {
        out.push('[' + i + '] (' + (values[obj[i]] ? 'R' : '?') + '): ' + obj[i]);
      }
    }
    return out.join('\n');
  };
  iface._ = {
    raw: function() {
      return obj;
    },
    add: function() {
      if (type === 'array') {
        if (!registry[arguments[0]]) {
          registry[arguments[0]] = 1;
          obj.push(arguments[0]);
          iface._.set(arguments[0], null);
        }
      }
      else {
        obj[arguments[0]] = arguments[1];
        if (writeBack) {
          iface[arguments[0]] = arguments[0];
        }
        if (preResolved) {
          values[arguments[0]] = arguments[0];
        }
      }
    },
    set: function(key, to) {
      values[key] = to;
    }
  };

  if (type === 'object') {
    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        iface._.set(name, null);
        if (writeBack) {
          iface[name] = name;
        }
        if (preResolved) {
          values[name] = name;
        }
      }
    }
  }
  else {
    for (i = 0, len = obj.length; i < len; i++) {
      iface._.set(obj[i], null);
    }
  }

  return iface;
}
/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
var __Atomic_AbstractComponent__ = Atomic._.Fiber.extend(function (base) {
  return {
    /**
     * A simple ID to be overridden. Useful in debugging
     * @property {String} AbstractComponent#name
     */
    name: 'AbstractComponent. Override me to improve debugging',

    /**
     * An array of dependencies this module needs to run
     * These are modules the implementing component needs
     * @property {Array} AbstractComponent#depends
     */
    depends: [],

    /**
     * A key/string collection of nodes and their purpose
     * These are nodes that components need to have in order to function.
     * This object is overriden with an instance variable during the constructor
     * @property {Object} AbstractComponent#elements
     */
    elements: {},

    /**
     * A key/string collection of events
     * These are events that the AbstractComponent can emit
     * Overriden with an instance variable during the constructor
     * @property {Object} AbstractComponent#events
     */
    events: {},

    /**
     * A configuration for this instance of the object
     * contains any unknown key/value pairs passed into the
     * constructor
     * @property {Object} AbstractComponent#config
     */
    config: {},

    /**
     * An array of async functions, responsible for "wiring" everything together
     * This is where app logic resides
     * @property {Array} AbstractComponent#_inits
     * @private
     */
    _inits: [],

    /**
     * A local event emitter
     * @property {EventEmitter} AbstractComponent#_eventEmitter
     * @private
     */
    _eventEmitter: null,

    /**
     * Has this object been destroyed
     * @property {Boolean} AbstractComponent#_isDestroyed
     * @private
     */
    _isDestroyed: false,

    /**
     * The initializer for a component
     * The optional el, if provided, will then perform an attach on
     * your behalf.
     * @constructor
     * @param {HTMLElement} el - an optional HTML element
     * @param {Object} overrides - any configuration overrides to provide to this object
     */
    init: function (el, overrides) {
      var name, nodeName;

      // set inits, assigned, etc all to local instance-level variables
      this._inits = [];
      this.config = {};
      this._eventEmitter = new Atomic._.EventEmitter({
        wildcard: true,
        newListener: false,
        maxListeners: 20
      });

      // localize the nodes/events/needs variable BEFORE the user starts configuring
      // nodes and needs can accept overwriting
      this.elements = createDisplayable(this.elements, true);
      this.events = createDisplayable(this.events, true, true);
      this.depends = createDisplayable(this.depends);

      // attach the el
      if (el) {
        this.attach(el);
      }

      // handle overrides
      if (overrides) {
        for (name in overrides) {
          if (!overrides.hasOwnProperty(name)) {
            continue;
          }
          if (typeof(this[name]) === 'function') {
            // can't override a function here
            continue;
          }
          else if (name.indexOf('_') === 0) {
            // can't override a _ property here
            continue;
          }
          else if (name === 'depends' || name === 'events' || name === 'config') {
            // needs and events should be wired in. using config for this is just silly
            continue;
          }
          else if (name === 'elements') {
            for (nodeName in overrides.elements) {
              if (overrides.elements.hasOwnProperty(nodeName)) {
                this.elements._.set(nodeName, overrides.elements[nodeName]);
              }
            }
          }
          else {
            // everything else is assigned to config
            this.config[name] = overrides[name];
          }
        }
      }
    },

    /**
     * Assign a node to the component.elements collection
     * @method AbstractComponent#assign
     * @param {String} name - the node to assign. Use a component.elements reference
     * @param {HTMLElement} el - an element to assign to the role.
     */
    assign: function(name, el) {
      this.elements._.set(name, el);
      return this;
    },
	
    /**
     * Assign a dependency to the component.depends collection
     * @method AbstractComponent#resolve
     * @param {String} name - the dependency to resolve. Use a component.depends reference
     * @param {Object} obj - the resolved object
     */
    resolve: function(name, obj) {
      this.depends._.set(name, obj);
      return this;
    },

    /**
     * Destroy the object, removing DOM element and event bindings
     * @method AbstractComponent#destroy
     */
    destroy: function () {
      this._isDestroyed = true;
      this.offAny();
      if(this.elements()._root.parentNode) {
        this.elements()._root.parentNode.removeChild(this.elements()._root);
      }
      this.removeAllListeners();
      return null;
    },

    /**
     * Listen for events emitted by the Component
     * @method AbstractComponent#on
     * @param {String} name - the event name
     * @param {Function} fn - the callback function
     */
    on: function (name, fn) {
      this._eventEmitter.on(name, fn);
      return this;
    },

    /**
     * Remove an event added via on
     * @method AbstractComponent#off
     * @param {String} name - the name to remove callbacks from
     * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
     */
    off: function (name, fn /* optional */) {
      this._eventEmitter.off(name, fn);
      return this;
    },

    /**
     * Listen to all events emitted from this Component
     * @method AbstractComponent#onAny
     * @param {Function} fn - a function to fire on all events
     */
    onAny: function (fn) {
      this._eventEmitter.onAny(fn);
      return this;
    },

    /**
     * Remove a listener from the "listen to everything" group
     * @method AbstractComponent#offAny
     * @param {Function} fn - the callback to remove
     */
    offAny: function (fn) {
      this._eventEmitter.offAny(fn);
      return this;
    },

    /**
     * Queue a callback to run once, and then remove itself
     * @method AbstractComponent#onOnce
     * @param {String} name - the event name
     * @param {Function} fn - the callback function
     */
    onOnce: function (name, fn) {
      this._eventEmitter.onOnce(name, fn);
      return this;
    },

    /**
     * Queue a callback to run X times, and then remove itself
     * @method AbstractComponent#on
     * @param {String} name - the event name
     * @param {Number} count - a number of times to invoke the callback
     * @param {Function} fn - the callback function
     */
    onMany: function (name, count, fn) {
      this._eventEmitter.onMany(name, count, fn);
      return this;
    },

    /**
     * Remove all of the listeners from the given namespace
     * @method AbstractComponent#offAll
     * @param {String} name - the event name
     */
    offAll: function (name) {
      this._eventEmitter.offAll(name);
      return this;
    },

    /**
     * set the maximum number of listeners this component can support
     * highly interactive components can increase the base number,
     * but setting arbitrarily large numbers should be a performance
     * warning.
     * @method AbstractComponent#setMaxListeners
     * @param {Number} count - the max number of listeners
     */
    setMaxListeners: function (count) {
      this._eventEmitter.setMaxListeners(count);
      return this;
    },

    /**
     * Get a list of all the current listeners
     * @method AbstractComponent#listeners
     * @returns {Array}
     */
    listeners: function (name) {
      var anyListeners = this._eventEmitter.listenersAny();
      var listeners = this._eventEmitter.listeners(name);
      return listeners.concat(anyListeners);
    },

    /**
     * Trigger an event
     * This triggers the specified event string, calling all
     * listeners that are subscribed to it.
     * @method AbstractComponent#trigger
     * @param {String} name - the event name
     * @param {Object} ... - any additional arguments to pass in the event
     */
    trigger: function () {
      var args = [].slice.call(arguments, 0);
      this._eventEmitter.emit.apply(this._eventEmitter, args);
      return this;
    },

    /**
     * Broadcast a global event
     * Trigger an event on the global event bus
     * @method AbstractComponent#broadcast
     * @param {String} name, the event name
     * @param {Object} ... - any additional arguments to pass in the event
     */
    broadcast: function () {
      var args = [].slice.call(arguments, 0);
      Atomic.trigger.apply(Atomic, args);
      return this;
    },

    /**
     * Provides an easy way to link an event and method
     * @method AbstractComponent#bind
     * @param {Object} eventing - an eventing object
     * @param {String} eventName - the name of the event to listen to
     * @param {String|Function} method - the method to invoke. If a string, resolves under this.*
     */
    bind: function (eventing, eventName, method) {
      if (typeof method === 'string') {
        eventing.on(eventName, Atomic.proxy(this[method], this));
      }
      else {
        eventing.on(eventName, method);
      }
      return this;
    },

    /**
     * Remove a bind() operation
     * @method AbstractComponent#unbind
     * @param {Object} eventing - an eventing object
     * @param {String} eventName - optional. an event name to unsubscribe from
     * @param {String|Function} method - optional. the method to remove. If a string, resolves under this.*
     */
    unbind: function (eventing, eventName, method) {
      if (typeof method === 'string') {
        eventing.off(eventName, this[method]);
      }
      else if (typeof method === 'function') {
        eventing.off(eventName, method);
      }
      else {
        eventing.off(eventName);
      }
      return this;
    },

    /**
     * augment a method by executing a custom function before executing a method
     * @method AbstractComponent#before
     * @param {String} method - method to augment
     * @param {Function} fn - custom function to execute before executing the method
     */
    before: function(method, fn) {
      var old = this[method];
      var that = this;
      this[method] = function() {
        fn.apply(that, arguments);
        old.apply(that, arguments);
      };
      return this;
    },

    /**
     * augment a method by executing a custom function after executing a method
     * @method AbstractComponent#before
     * @param {String} method - method to augment
     * @param {Function} fn - custom function to execute after executing the method
     */
    after: function(method, fn) {
      var old = this[method];
      var that = this;
      this[method] = function() {
        old.apply(that, arguments);
        fn.apply(that, arguments);
      };
      return this;
    },

    /**
     * Wrap a method with a new function
     * The new function gets the old function as its first parameter
     * @method AbstractComponent#wrap
     * @param {String} method - method to augment
     * @param {Function} fn - custom function to execute. Gets the original function as the first arg
     */
    wrap: function(method, fn) {
      var old = Atomic.proxy(this[method], this);
      var that = this;
      this[method] = function() {
        var args = [].slice.call(arguments, 0);
        args.unshift(old);
        fn.apply(that, args);
      };
      return this;
    },

    /**
     * Attach an element to this Component
     * @method AbstractComponent#attach
     * @param {HTMLElement} el - an HTML element to attach
     */
    attach: function (el) {
      this.assign('_root', el);
      return this;
    },

    /**
     * get root node
     * @method AbstractComponent#getRoot
     */
    getRoot: function () {
      return this.elements()._root;
    },

    /**
     * Load the Component, resolve all dependencies
     * calls the ready method
     * @method AbstractComponent#load
     * @param {Object} cb - a callback to run when this is loaded
     */
    load: function (cb) {
      var deferred = Atomic.deferred();
      var self = this;
      var fetch = [];
      var allDependencies = this.depends._.raw();
      var allResolvedDependencies = this.depends();
      var fetchLen;
      
      // only fetch things we don't have a resolved value for
      for (var i = 0, len = allDependencies.length; i < len; i++) {
        if (!allResolvedDependencies[allDependencies[i]]) {
          fetch.push(allDependencies[i]);
        }
      }

      Atomic.load.apply(Atomic, fetch)
      .then(function(values) {
        var wiringDeferred = Atomic.deferred(),
            inits,
            len,
            promise,
            createWiringCall,
            i,
            n;


        // populate values resolution into the this.depends()
        for (i = 0, fetchLen = fetch.length; i < fetchLen; i++) {
          self.depends._.set(fetch[i], values[i]);
        }

        // dynamically create promise chain
        // inits[0] runs automatically
        inits = self._inits;
        len = inits.length;
        promise = Atomic.when(inits[0].call(self)),

        // creates a call to a wiring function. Done outside of the
        // wiring for-loop
        createWiringCall = function(fn) {
          return function() {
            // run only on then() resolution to prevent premature
            // resolution of the promise chain
            fn.call(self);
          };
        };

        // replace itself with a new promise
        for (n = 1; n < len; n++) {
          promise = promise.then(createWiringCall(inits[n]));
        }

        // if there is a callback, we can then handle it
        // by attaching it to the end of the promise chain
        if (cb) {
          promise = promise.then(cb);
        }

        // set resolution for the internal promise
        promise.then(function() {
          wiringDeferred.resolve();
        }, function(err) {
          wiringDeferred.reject(err);
        });

        // return the promise to the outer function
        // if we hit a throw(), it'll automatically bubble out
        // to the outer promise layer thanks to the promise chain
        // above
        return wiringDeferred.promise;
      })
      .then(function() {
        deferred.resolve();
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Adds additional wiring commands to this Component
     * wiring is done in response to a load() call. An optional idx
     * can be provided, allowing you to insert your wiring wherever you
     * need to.
     * @method AbstractComponent#wireIn
     * @param {Function|Object} wiring - a functon to run in response to load(), or an object
     *  literal containing an init function to be executed with load(), and public methods
     *  to decorate the component instance
     * @param {Boolean} addFront - if false, add the wiring to the end of the
     *  wirings array. If true, add the wiring to the beginning of the array.
     *  by default, addFront is false
     */
    wireIn: function(wiring, addFront) {
      var name, nodesName, eventsName, i, len;

      // wiring can be set to a single function which defaults
      // to an initializer
      if (typeof wiring === 'function') {
        addInit(this, wiring, addFront);
      }
      // wiring can also be an object literal.  In this case, iterate through
      // the keys, add the init function, and append the other methods to the
      // class prototype
      else {
        for (name in wiring) {
          if (name === 'events') {
            // TODO: Broken
            for (eventsName in wiring.events) {
              if (wiring.events.hasOwnProperty(eventsName)) {
                this.events._.add(eventsName, wiring.events[eventsName]);
              }
            }
          }
          else if (name === 'elements') {
            for (nodesName in wiring.elements) {
              if (this.elements[nodesName]) {
                continue; // we do not overwrite if the Implementor has defined
              }
              this.elements._.add(nodesName, wiring.elements[nodesName]);
            }
          }
          else if (name === 'depends') {
            for (i = 0, len = wiring.depends.length; i < len; i++) {
              this.depends._.add(wiring.depends[i]);
            }
          }
          else {
            if (wiring.hasOwnProperty(name)) {
              if (name === 'init') {
                addInit(this, wiring[name], addFront);
              }
              else {
                this[name] = wiring[name];
              }
            }
          }
        }
      }
      return this;
    },

    /**
     * Can be overriden to synchronize the DOM to the component's internal state
     * @method AbstractComponent#sync
     * @returns this
     */
    sync: function() {
      return this;
    },

    /**
     * Can be overridden to update the component's internal state based on the
     * current DOM. This is really useful when you are pulling in content via
     * innerHTML, and want the component to reflect this new information
     * @method AbstractComponent#update
     * @returns this
     */
    update: function() {
      return this;
    }
  };
});

// for jshint
__Atomic_AbstractComponent__ = __Atomic_AbstractComponent__;

  Atomic._.AbstractComponent = __Atomic_AbstractComponent__;

  // --------------------------------------------------
  // FACTORY APIs
  // --------------------------------------------------
  /*global Atomic:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

var __Atomic_Private_Factory_Methods__ = {
  /**
   * The Internal Factory function hides most of the logic
   * for creating Atomic Components. It's split out to keep the
   * interface separate from the Fiber integration
   * @method Atomic.Factory
   * @private
   * @see Atomic.Component
   */
  Factory: function(objLiteral) {
    // certain items are "reserved" and cannot be overridden in a wiring
    var reserved = {
      // these are "special" but are okay to set using wiring
      // we are calling them out for readability's sake
      // wiring has a special use case below
      'depends':        false,
      'elements':       false,
      'events':         false,
      'init':           true,
      '_inits':         true,
      '_eventEmitter':  true,
      '_isDestroyed':   true
    };

    // currently, we aren't doing anything fancy here
    // fiber requires an object literal that defines the interface
    // and we create the interface from the object literal
    // provided. For every item, if it's not in our reserved list,
    // we place it onto the additionalMethods collection.
    //
    // We then create an init() method that puts the wiring value
    // as first on the stack of wiring items.
    //
    // When a component is created, the wirings are pulled in
    // and ran in order.
    var component = Atomic._.AbstractComponent.extend(function(base) {
      var additionalMethods = {};
      // add all other extras
      for (var name in objLiteral) {
        if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
          continue;
        }
        additionalMethods[name] = objLiteral[name];
      }
      additionalMethods.init = function() {
        base.init.apply(this, arguments);
        if (typeof objLiteral.init === 'function') {
          this.wireIn(objLiteral.init, true);
        }
      };

      return additionalMethods;
    });

    return component;
  }
};

var __Atomic_Public_Factory_Methods__ = {
  /**
   * Creates an Atomic Component
   * An Atomic Component consists of the following items in its object literal:
   * depends - an array of dependencies required for this component
   * elements - an object literal of node name / purpose
   * events - an object literal of event name / purpose
   * wiring - a function or object literal compatible with AbstractComponent#wireIn
   * @method Atomic.Component
   * @param {Object} objLiteral - the object literal to create a component from
   * @return {Object} an object that extends AbstractComponent
   */
  Component: function(objLiteral) {
    return __Atomic_Private_Factory_Methods__.Factory(objLiteral);
  }
};

__Atomic_Public_Factory_Methods__ = __Atomic_Public_Factory_Methods__;
__Atomic_Private_Factory_Methods__ = __Atomic_Private_Factory_Methods__;
  Atomic.augment(Atomic, __Atomic_Public_Factory_Methods__);
  Atomic.augment(Atomic._, __Atomic_Private_Factory_Methods__);

  // --------------------------------------------------
  // PUBLIC INTERFACES
  // --------------------------------------------------
  /*global Atomic:true, context:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * This file contains the public Atomic APIs. Anything
 * we wish to attach to Atomic.___ at a top level should
 * be exposed in this file.
 */

/**
 * A helper method to return the When object. Aids in unit
 * testing the public functions
 * @method Atomic.getWhen
 * @private
 * @returns {Object} the When.js interface
 */
function getWhen() {
  return Atomic._.When;
}

// holds the previous Atomic reference
var Atomic_noConflict_oldAtomic = context.Atomic;

// holds the initialized state of the framework
var Atomic_load_initialized = false;

// holds the config for if Atomic is AMD optimized
var Atomic_amd_optimized = false;

var __Atomic_Public_API__ = {
  /**
   * prevent conflicts with an existing variable
   * if it is named "Atomic". Returns the current
   * Atomic reference
   * @method Atomic.noConflict
   * @return Object - the current Atomic reference
   */
  noConflict: function () {
    var thisAtomic = context.Atomic;
    context.Atomic = Atomic_noConflict_oldAtomic;
    return thisAtomic;
  },

  /**
   * Set the pre-optimized flag for Atomic. If you have
   * used an AMD optimizer before running Atomic, you
   * should use this, as all your modules are going to
   * be properly named.
   */
  amdOptimized: function() {
    Atomic_amd_optimized = true;
  },

  /**
   * load the specified dependencies, then run the callback
   * with the dependencies as arguments. This abstracts
   * away any loader framework implementations
   * @method Atomic.load
   * @param Array depend - an array of dependencies or a list of dependencies
   * @param Function then - a callback to run with dependencies as arguments
   */
  load: function() {
    var deferred = Atomic.deferred();
    var args = [].slice.call(arguments, 0);

    function isArray(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    }

    // wrap the callback if it exists
    if (typeof args[args.length - 1] === 'function') {
      deferred.promise.then(args[args.length - 1]);
      args.pop();
    }

    // if 2+ args, no need to expand further
    if (args.length === 1) {
      args = args[0];
    }

    if (!isArray(args)) {
      args = [args];
    }

    // if not initialized, init, and then do the load step
    var initPromise = null;
    if (Atomic_load_initialized) {
      initPromise = Atomic.when(true);
    }
    else {
      Atomic_load_initialized = true;
      initPromise = Atomic.when(Atomic.loader.init());
    }

    // when initialization is complete, then call load
    // on load, resolve the primary promise
    initPromise
    .then(function() {
      return Atomic.when(Atomic.loader.load(args));
    })
    .then(function(needs) {
      return deferred.resolve(needs);
    }, function(reason) {
      return deferred.reject(reason);
    });

    // return the promise
    return deferred.promise;
  },

  /**
   * A basic proxy function. Makes it easier to wrap functionality
   * @method Atomic.proxy
   * @param {Function} fn - the function to wrap
   * @param {Object} scope - the scope to apply fn within
   * @returns {Function}
   */
  proxy: function(fn, scope) {
    return function() {
      return fn.apply(scope, arguments);
    };
  },

  /**
   * Throttle a function. Prevents a function from running again within X seconds
   * this is really helpful for repeating key events, scrolling, or simply "noisy"
   * events
   * Visually, this can be interpreted as
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   * I   I   I         I   I   I
   *
   * X = method called
   * I = actual invocation
   * 
   * From https://github.com/documentcloud/underscore/blob/master/underscore.js
   * @method Atomic.throttle
   * @param {Function} func - the function to throttle
   * @param {Number} wait - a number of milliseconds to wait
   * @param {Boolean} immediate - run a trailing function when throttled
   */
  throttle: function(func, wait, immediate) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
      previous = new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date();
      if (!previous && immediate === false) {
        previous = now;
      }
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },

  /**
   * Debounces a function, by only letting it run after the user has taken
   * no activity for X seconds. Similar to throttle, this is more useful
   * when you want to limit the invocations to once for every burst of
   * activity
   *
   * Visually, this can be interpreted as (immediate=true)
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   * I                 I
   *
   * alternatively, this can be interpreted as (immediate=false)
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   *                I                 I
   *
   * X = method called
   * I = actual invocation
   *
   * Notice how the user needed to stop acting for a window in order
   * for the trigger to reset
   *
   * From https://github.com/documentcloud/underscore/blob/master/underscore.js
   * @method Atomic.debounce
   * @param {Function} func - the function to wrap for debouncing
   * @param {Number} wait - the number of milliseconds to wait until invoking
   * @param {Boolean} immediate - if true, the event is on the leading edge
   */
  debounce: function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    };
  },

  /**
   * Take a function (which takes 1 arg) and return a function that takes
   * N args, where N is the length of the object or array in arguments[0]
   * @method Atomic.expand
   * @param {Function} fn - the function to expand
   * @returns {Function} a function that takes N args
   */
  expand: function(fn) {
    return function(args) {
      var key;
      var expanded = [];
      if (Object.prototype.toString.call(args) === '[object Array]') {
        expanded = args;
      }
      else {
        for (key in args) {
          if (args.hasOwnProperty(key)) {
            expanded.push(args[key]);
          }
        }
      }

      fn.apply(fn, expanded);
    };
  },

  /**
   * Get the keys of an object
   * @method Atomic.keys
   */
  keys: function(obj) {
    var name;
    var keys = [];
    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        keys[keys.length] = name;
      }
    }
    return keys;
  },

  /**
   * Creates the ability to call Promises from within the
   * wiring functions. This keeps us from having to pass
   * in control functions, instead making everything
   * synchronous by default. You may also pass it another
   * library's promise, which will convert to a promise
   * in the Atomic ecosystem.
   * @param {Object} promise - optional. a promise from another framework
   * @method Atomic.deferred
   * @returns {Object} Promise
   */
  deferred: function(promise) {
    if (promise) {
      return getWhen()(promise);
    }
    else {
      return getWhen().defer();
    }
  },

  /**
   * Convert a function value or promise return into
   * a promise. Very useful when you don't know if the function
   * is going to return a promise. This way, it's always a
   * promise, all of the time
   * @method Atomic.when
   * @param {Function|Object} the item you want to convert to a promise
   * @returns {Object} Promise
   */
  when: function(whennable) {
    var deferred = Atomic.deferred();
    getWhen()(whennable, function(resolveResult) {
      return deferred.resolve(resolveResult);
    }, function(rejectResult) {
      return deferred.reject(rejectResult);
    });
    return deferred.promise;
  },

  /**
   * Export a module for CommonJS or AMD loaders
   * @method Atomic.export
   * @deprecated
   * @param {Object} mod - commonJS module object
   * @param {Object} def - AMD define function
   * @param {Function} factory - the defining factory for module or exports
   */
  export: function(mod, def, factory) {
    var ranFactory = null;

    if (typeof factory === 'undefined' && typeof def === 'undefined' && typeof mod === 'function') {
      factory = mod;
      if (Atomic.loader && Atomic.loader.save) {
        ranFactory = factory();
        Atomic.loader.save(factory.id, ranFactory);
      }
      else {
        ranFactory = factory();
        window[factory.id] = ranFactory;
      }
      return;
    }
    if (mod && typeof mod.exports !== 'undefined' || Atomic_amd_optimized) {
      ranFactory = factory();
      mod.exports = ranFactory;
    }
    else if (def && def.amd) {
      def(factory);
    }
    else if (Atomic.loader && Atomic.loader.save) {
      ranFactory = factory();
      Atomic.loader.save(factory.id, ranFactory);
    }
    else {
      ranFactory = factory();
      window[factory.id] = ranFactory;
    }

    return ranFactory;
  },

  /**
   * Export a module for CommonJS or AMD loaders
   * @method Atomic.pack
   * @param {String} id - an identifier for this module
   * @param {Function} mod - a function that safely returns the module var if it exists
   * @param {Function} def - a function that safely returns the define var if it exists
   * @param {Function} factory - the defining factory for module or exports
   */
  pack: function(id, mod, def, factory) {
    var module, define;

    // try and capture module and define into local variables
    try {
      module = mod();
    }
    catch(e) {}
    try {
      define = def();
    }
    catch(e) {}

    var result = null;

    if ((typeof module !== 'undefined' && module && typeof module.exports !== 'undefined') || Atomic_amd_optimized) {
      result = factory();
      module.exports = result;
    }
    else if (typeof define !== 'undefined' && define && typeof define.amd !== 'undefined' && define.amd) {
      define(factory);
    }
    else if (typeof Atomic.loader !== 'undefined' && typeof Atomic.loader.save === 'function') {
      result = factory();
      Atomic.loader.save(id, result);
    }
    else {
      throw new Error('You must implement a module loader or use the "none" loader');
    }
  },

  /**
   * the Atomic thrower is a function you can use to handle rejection
   * of promises. It's easier than writing your own, and will output
   * to console.error as a last resort
   * @method Atomic.thrower
   * @param {Object} err - the error from a rejection
   */
  error: function(err) {
    /*global console:true */

    // if exception, try to get the stack
    var msg = '';
    var stack = '';

    if (typeof err === 'object') {
      if (err.message) {
        msg = err.message;
      }
      else if (err.toString) {
        msg = err.toString();
      }

      if (err.stack) {
        stack = err.stack;
      }
      else if (err.stacktrace) {
        stack = err.stacktrace;
      }
    }
    else if (typeof err === 'string') {
      msg = err;
    }

    if (console && console.error) {
      console.error(msg + '\n' + stack);
    }
  }
};
__Atomic_Public_API__.e = __Atomic_Public_API__.error;

__Atomic_Public_API__ = __Atomic_Public_API__;

  Atomic.augment(Atomic, __Atomic_Public_API__);

  /*global Atomic:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

var emitter = new Atomic._.EventEmitter({
  wildcard: true,
  newListener: false,
  maxListeners: 20
});

var __Atomic_Events_API__ = {
  /**
   * Listen for events emitted by the global Atomic Object
   * @method Atomic.on
   * @param {String} name - the event name
   * @param {Function} fn - the callback function
   */
  on: function (name, fn) {
    emitter.on(name, fn);
    return Atomic;
  },

  /**
   * Remove an event added via on
   * @method Atomic#off
   * @param {String} name - the name to remove callbacks from
   * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
   */
  off: function (name, fn /* optional */) {
    emitter.off(name, fn);
    return Atomic;
  },

  /**
   * Listen to all events emitted from the global Atomic Object
   * @method Atomic#onAny
   * @param {Function} fn - a function to fire on all events
   */
  onAny: function (fn) {
    emitter.onAny(fn);
    return Atomic;
  },

  /**
   * Remove a listener from the "listen to everything" group
   * @method Atomic#offAny
   * @param {Function} fn - the callback to remove
   */
  offAny: function (fn) {
    emitter.offAny(fn);
    return Atomic;
  },

  /**
   * Queue a callback to run once, and then remove itself
   * @method Atomic#onOnce
   * @param {String} name - the event name
   * @param {Function} fn - the callback function
   */
  onOnce: function (name, fn) {
    emitter.onOnce(name, fn);
    return Atomic;
  },

  /**
   * Queue a callback to run X times, and then remove itself
   * @method Atomic#on
   * @param {String} name - the event name
   * @param {Number} count - a number of times to invoke the callback
   * @param {Function} fn - the callback function
   */
  onMany: function (name, count, fn) {
    emitter.onMany(name, count, fn);
    return Atomic;
  },

  /**
   * Remove all of the listeners from the given namespace
   * @method Atomic#offAll
   * @param {String} name - the event name
   */
  offAll: function (name) {
    emitter.offAll(name);
    return Atomic;
  },

  /**
   * set the maximum number of listeners the global Atomic Object can support
   * highly interactive pages can increase the base number,
   * but setting arbitrarily large numbers should be a performance
   * warning.
   * @method Atomic#setMaxListeners
   * @param {Number} count - the max number of listeners
   */
  setMaxListeners: function (count) {
    emitter.setMaxListeners(count);
    return Atomic;
  },

  /**
   * Get a list of all the current listeners
   * @method Atomic#listeners
   * @returns {Array}
   */
  listeners: function (name) {
    var anyListeners = emitter.listenersAny();
    var listeners = emitter.listeners(name);
    return listeners.concat(anyListeners);
  },

  /**
   * Trigger an event
   * This triggers the specified event string, calling all
   * listeners that are subscribed to it.
   * @method Atomic#trigger
   * @param {String} name - the event name
   * @param {Object} ... - any additional arguments to pass in the event
   */
  trigger: function () {
    var args = [].slice.call(arguments, 0);
    emitter.emit.apply(emitter, args);
    return Atomic;
  }
};

__Atomic_Events_API__ = __Atomic_Events_API__;
  Atomic.augment(Atomic.Events, __Atomic_Events_API__);

  // assign atomic version
  /*global Atomic:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/
// this file sets the Atomic Version string at build time
Atomic.version = '0.0.4-3-gf54aa0f';

  // assign public interface in window scope
  context.Atomic = Atomic;
})(this);