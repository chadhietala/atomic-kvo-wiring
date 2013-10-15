/*global require:true, module:true, define:true */
var Atomic = (typeof window !== 'undefined' && window.Atomic) ? window.Atomic : require('atomic');
Atomic.pack('button', function() { return module; }, function() { return define; }, function() {
  var $;

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'Button by jheuser',

    // no dependencies
    depends: ['jquery'],

    // no additional nodes needed
    elements: {},

    // events
    events: {
      // TODO from Eric: I know that 'click' isn't used here because we want to
      // include tap events as well.  But USE is very strange.
      USE: 'Triggered when the button is used'
    },

    // wiring functions to make this work
    init: function() {
      $ = this.depends('jquery');
      var self = this;


      // nodes._root is the default container, either an el passed
      // to the constructor, or via attach()
      $(self.elements()._root).on('click', function() {

        if ( self.get( 'enabled' ) ) {
          self.set( 'enabled', false );
        } else {
          self.set( 'enabled', true );
        }

        self.trigger(self.events.USE);
      });
    }
  });
});