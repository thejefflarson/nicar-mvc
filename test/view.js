$(document).ready(function(){
  module("Views");
  
  test("bindings", function(){
    var counter = other = 0;
    var V = View.extend({
      el: $("#qunit-header"),
      bindings : {
        "click" : "increment"
      },
      increment : function(){
        counter++;
      }
    });
    var view = new V();
    expect(1);
    view.el.trigger("click");
    equals(counter, 1);
  });

});