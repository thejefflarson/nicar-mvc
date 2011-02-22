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
      for(var i = 0; i < list.length; i++) list[i].apply(this, arguments);
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
  
  var mixin = function(obj, mixin){
    for(var key in mixin) obj[key] = mixin[key];
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
  };
  
  var extend = function(protoProps){
    var child = inherits(this, protoProps);
    child.extend = extend
    return child;
  };

  
  var MVCObject = function(attributes){ };
  MVCObject.extend = extend;
  mixin(MVCObject.prototype, Events);
  
  var Collection = function(attributes){
    this.models = [];
    this.length = 0;
  };
  
  Collection.prototype.push = function(object){
    if(!(object instanceof MVCObject)) object = new this.model(object);
    object.collection = this;
    this.models.push(object);
    this.length++;
    this.trigger("added:" + model.cid, model, this);
    return model;
  };
    
  Collection.prototype.pop = function(object){
    var model = this.models.pop(object);
    this.length--;
    this.trigger("removed:" + model.cid, model, this);
    return model;
  };
  mixin(MVCCollection.prototype, Events);
  
  
  var Model;
  mixin(Model.prototype, Attributes);
    
  var View;
})(window, document);