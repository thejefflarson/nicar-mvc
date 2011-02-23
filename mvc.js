(function(window, document, undefined){
  // **Events** 
  // Events are a way to publish messages from objects and subscribe to the
  // events from others. In this framework we'll use events primarily on 
  // models.
  var Events = {
    
    // bind takes an event name and a callback and adds it to a special lookup 
    // object so that we can trigger the event later
    bind : function(e, cb){
      var callbacks = (this._callbacks = this._callbacks || {});
      var events    = (callbacks[e] = callbacks[e] || []);
      events.push(cb);
    },
    
    // unbind will remove a particular callback from the list, essentially 
    // unsubscribing from the event.
    unbind : function(e, cb){
      if(!(this._callbacks && this._callbacks[e])) return;
      var events = this._callbacks[e];
      for(var i = 0; i < events.length; i++){
        if(events[i] === cb) { 
          events.splice(i, 1);
          break;
        }
      }
    },
    
    // trigger fires an event and the associated callbacks
    trigger : function(e){
      if(!this._callbacks) return;
      var list = this._callbacks[e];
      if(!list) return;
      
      for(var i = 0; i < list.length; i++) 
        list[i].apply(this, arguments);
        
      if(list['all']) {
        for(i = 0; i < list['all'].length; i++) 
          list['all'][i].apply(this, arguments);
      }
    }
  };
  
  // ** Attributes **
  // Each model has a special set of attributes, that tracks it's associated 
  // data. Each attribute will notify subscribers of changes.
  var Attributes = {
    
    // Every time an attribute is set, we trigger a change event, and take 
    // care to handle the model's id property.
    set : function(attrs){
      if (!attrs) return this;
      var attributes = (this.attributes = this.attributes || {}); 
      if ('id' in attrs) this.id = attrs.id;
      for(var attr in attrs){
        var value = attrs[attr];
        if(!(value === attributes[attr])){
          attributes[attr] = value;
          this.trigger("change:" + attr, this, value, attr);
        }
      }
      return this;
    },
    
    // unSet notifies subscribers and removes the attribute.
    unSet : function(key){
      if(this.attributes[key]) {
        delete this.attributes[key];
        this.trigger("change:" + key, this, undefined, key);
      }
    },
    
    // get returns the requested attribute from the attributes object.
    get : function(key){
      return this.attributes[key];
    }
  };
  
  // **Utilities**
  // In order to provide the functionality of Attributes and Events to multiple
  // constructors we'll "mixin" the functions defined into the host object.
  var mixin = function(obj){
    var objects = Array.prototype.slice.call(arguments, 1);
    for(var i = 0; i < objects.length; i++) {
      var mixin = objects[i];
      for(var key in mixin) obj[key] = mixin[key];
    }
  };
  
  // **Prototypal Inheritance **
  // A big point of confusion in JavaScript is that inheritance doesn't seem 
  // to exist. It does, but in JavaScript it's prototypal, that is each object
  // has an associated prototype that provides essentially a blueprint on how to
  // create an object. And those prototypes can have prototypes as well.
  //
  // An easy way to think of it is to look at Aristotle and Wittgenstein.
  //
  // Aristotle represents classical inheritance, that every object has a concrete
  // pattern it inherits from, for example a Sparrow is a type of Bird.
  //
  // Wittgenstein, held, that the world was composed of traits, for example a 
  // magazine isn't a book just because it has pages, rather magazines and books
  // have a pages trait.
  var ctor = function(){};
  var inherits = function(parent, protoProps){
    var child;
    if(protoProps.hasOwnProperty('constructor')){
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    };
    ctor.prototype  = parent.prototype;
    child.__super__ = parent.prototype;
    child.prototype = new ctor();
    if(protoProps) mixin(child.prototype, protoProps);
    child.prototype.constructor = child;
    return child;
  };
  
  // A self propagating extend function that we'll attach to our objects.
  var extend = function(protoProps){
    var child = inherits(this, protoProps);
    child.extend = extend;
    return child;
  };

  // The base class for all our objects, it takes care of ensuring that each
  // object has a unique id, and provides niceties like string formatting.
  var idCounter = 1;
  var MVCObject = function(attributes){
    this.cid = this.type + idCounter++;
    if(this.initialize) this.initialize(attributes);
  };
  MVCObject.prototype.type = "MVCObject";
  MVCObject.prototype.toString = function(){
    return "<" + this.type + " cid:" + this.cid + ">";
  };
  MVCObject.extend = extend;
  
  // The model is largely a container for data.
  var Model = MVCObject.extend({
    type: "Model",
    
    constructor : function(attributes){
      this.set(attributes);
      MVCObject.call(this, attributes);
    }
  });
  // Each model has both Events and Attributes, here we're using the prototypal
  // nature of JavaScript to provide the functionality.
  mixin(Model.prototype, Attributes);
  mixin(Model.prototype, Events);
  
  var Collection = MVCObject.extend({
    model : Model,
    
    constructor : function(attributes, options){
      this.models = [];
      MVCObject.call(this, options);
    },
    
    push : function(object){
      if(!(object instanceof Model)) object = new this.model(object);
      object.collection = this;
      model.bind('all', this._onModelEvent);
      this.models.push(object);
      this.trigger("added:" + model.cid, model, this);
      return model;
    },
    
    pop : function(object){
      var model = this.models.pop(object);
      model.unbind('all', this._onModelEvent);
      this.trigger("removed:" + model.cid, model, this);
      return model;
    },
    
    length : function(){
      return this.models.length;
    },
    
    forEach : function(cb){
      if(this.models.forEach) {
        this.models.forEach(cb);
      } else {
        var model;
        for(var i = 0; model = this.models[i]; i++) cb(model);
      }
    },
    
    populate : function(models){
      for(var i = 0; i < models.length; i++)
        this.push(models[i]);
    },
    
    _onModelEvent : function(){
      this.trigger.apply(this, arguments);
    }
  });
  mixin(Collection.prototype, Events);
  
  
  var View = MVCObject.extend({
    type: "View",
    el : null,
    bindings : {},

    constructor : function(attributes){
      attributes = (attributes || {});
      if(attributes.el) this.el = attributes.el;
      if(this.el) this.setBindings();
      MVCObject.call(this, attributes);
    },
    
    $ : function(query){
      return $(query, this.el);
    },
    
    setBindings : function(){
      var suffix = ".delegate" + this.cid;
      this.el.unbind(suffix);
      var view = this;
      for(var ev in this.bindings){
        var method   = this[this.bindings[ev]];
        var callback = function() { method.call(view, Array.prototype.slice.call(arguments)); };
        this.el.bind(ev + suffix, callback);
      }
    },
    
    render : function(){
      return this;
    }
  });
  
  

  mixin(window, {
    View: View,
    Model: Model,
    Collection: Collection
  });
})(window, document);