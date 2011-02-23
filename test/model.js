(function(){
  module("Model");

  var attrs = {
    id: 1, 
    title: "Unnameable"
  };

  var getModel = function(){
    return new Model(attrs);
  };
  
  var ExtendedModel = Model.extend({
    type: "ExtendedModel",
    initialize: function(attrs){
      this.test = 1;
    }
  });

  test("initialize", function(){
    var model = new Model();
    expect(3);
    ok(model);
    ok(model.cid);
    ok(model.id === void 0);
  });

  test("initialize with attributes and id", function(){
    var model = getModel();    
    expect(2);
    equals(model.id, 1);
    equals(model.get("title"), "Unnameable");
  });
  
  test("extend and initialize", function(){
    var model = new ExtendedModel(attrs);
    expect(4);
    ok(model instanceof Model)
    equals(model.test, 1);
    equals(model.type, "ExtendedModel");
    ok(/ExtendedModel/.test(model.cid));
  });
  
  test("writing to an attribute", function(){
    var model = getModel();
    model.set({"monday": "ham sandwich"}).set({"tuesday": "BLT"});
    expect(3);
    equals(model.get("monday"), "ham sandwich");
    equals(model.get("tuesday"), "BLT");
    model.set({"library": "hexagonal galleries"});
    equals(model.get("library"), "hexagonal galleries");
  });
  
  test("removing an attribute", function(){
    var model = getModel();
    model.unSet("title");
    equals(model.get("title"), undefined);
  });

  module("Model Events");
  test("bind events", function(){
    var model = getModel();
    expect(3);
    model.bind("sign", function(e, french){
      ok(e, "sign");
      ok(french, "sceau");
    });
    equals(model._callbacks.sign.length, 1);
    model.trigger("sign", "sceau");
  });

  test("unbind events", function(){
    var cb    = function(){};
    var ev    = "signed";
    var model = getModel();
    expect(2);
    model.bind(ev, cb);
    equals(model._callbacks[ev].length, 1);
    model.unbind(ev, cb);
    equals(model._callbacks[ev].length, 0);
  });

  test("fire change event with changed attributes", function(){
    var location = "brooklyn";
    var model    = getModel();
    var callback = function(e, modelChanged, value, key){
      equals(modelChanged, model)
      equals(key,          "location");
      equals(value,        location);
    }
    expect(4);
    model.bind("change:location", callback);
    model.set({"location": location});
    model.unbind("change:location", callback);
    model.bind("change:location", function(e, modelChanged, key, old, value){
      equals(value, undefined);
    });
    model.unSet("location");
  });

})();