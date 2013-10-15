var FooView = {
  init: function () {
    this.render();
  },
  render: function () {
    var view = this;

    Atomic.load( 'button', 'kvo' )
    .then( Atomic.expand( function( Button, KVO )  {

      // Creates the KVO wiring
      var kvo = KVO();

      // Mixin to a POJO
      var state = $.extend( {}, kvo );

      // Assign the initial state
      state.enabled = true;

      // Create the button
      var btn = new Button( document.getElementById('btn') );

      // Make the button an observable object
      btn.wireIn( kvo );

      // Proxy the enabled state to the button
      btn.bindTo( 'enabled', state );

      // Capture the state mutation
      btn.enabledChanged = function ( state ) {
        console.log( 'State changed to ' + state );
      };

      btn.load();

    }), Atomic.e);
  }
};


var fooView = Object.create( FooView );
fooView.init();