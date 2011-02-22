(function(window, document, undefined){
  
  var Events = {
    bind : function(e, cb){
      var callbacks = (this._callbacks = this._callbacks || {});
      var events    = (callbacks[e] = callbacks[e] || []);
      events.push(cb);
    },
    
    unbind : function(e, cb){
      if(!(this._callbacks && this._callbacks[e])) return;
      var events = this._callbacks[e];
      for(var i = 0; i < events.length; i++){
        if(list[i] === cb) { 
          list.splice(i, 1);
          break;
        }
      }
    },
    
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
  
  var Attributes = {
    set : function(attrs){
      if (!attrs) return this;
      var attributes = this.attributes; 
      if ('id' in attrs) this.id = attrs.id;
      for(var attr in attrs){
        var value = attrs[attr];
        if(!value === attributes[attr]){
          attributes[attr] = value;
          this.trigger("change:" + attr, this, value, attr);
        }
      }
      return this;
    },
    
    unSet : function(key){
      if(this.attributes[key]) {
        delete this.attributes[key];
        this.trigger("change:" + key, this, undefined, key);
      }
    },
    
    get : function(key){
      return this.attributes[key];
    }
  };
  
  var mixin = function(obj){
    var objects = Array.prototype.slice.call(arguments, 1);
    for(var i = 0; i < objects.length; i++) {
      var mixin = objects[i];
      for(var key in mixin) obj[key] = mixin[key];
    }
  };
  
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
  
  var extend = function(protoProps){
    var child = inherits(this, protoProps);
    child.extend = extend;
    return child;
  };

  var idCounter = 1;
  
  var MVCObject = function(options){
    this.cid = idCounter++;
    if(this.initialize) this.initialize(options);
  };
  MVCObject.extend = extend;
  
  var Model = MVCObject.extend({});
  mixin(Model.prototype, Attributes);
  mixin(Model.prototype, Events);
  
  var View = MVCObject.extend({});
  
  
  var Collection = MVCObject.extend({
    model : Model,
    
    constructor : function(options){
      this.models = [];
      MVCObject.call(this, options);
    },
    
    push : function(object){
      if(!(object instanceof MVCObject)) object = new this.model(object);
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
    
    _onModelEvent : function(){
      this.trigger.apply(this, arguments);
    }
  });
  mixin(Collection.prototype, Events);
  
    
})(window, document);