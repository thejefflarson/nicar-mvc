(function(){
  
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
    },
    
    unSet : function(key){
      
    },
    
    get : function(key){
      return this.attributes[key];
    }
  };
  
  var mixin = function(obj, mixin){
    for(var key in mixin) obj[key] = mixin[key];
  };
  
  var MVCObject = function(attributes){ };
  mixin(MVCObject.prototype, Events);
  
  var MVCCollection = function(attributes){ };
  mixin(MVCCollection.prototype, Events);
  
  
  var Model;
  mixin(Model.prototype, Attributes);
  
  var Collection;
  mixin(MVCCollection.prototype, Attributes);
  
  var View;
})();