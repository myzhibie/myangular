'use strict';
var _=require('lodash');
function initWatchVal(){ }
function Scope(){
	this.$$watchers=[];
 	this.$$lastDirtyWatch=null;
}
Scope.prototype.$watch=function(watchFn,listenerFn,valueEq){
	var watcher={
		watchFn:watchFn,
		listenerFn:listenerFn || function(){ },
		valueEq:!! valueEq,
		last:initWatchVal
	};
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch=null;
};
Scope.prototype.$$digestOnce=function(){
	var self=this;
	var newValue,oldValue,dirty;
	_.forEach(this.$$watchers,function(watcher){
		newValue=watcher.watchFn(self);
		oldValue=watcher.last;
		if(!self.$$areEqual(newValue,oldValue,watcher.valueEq)){
			self.$$lastDirtyWatch=watcher;
			watcher.last=(watcher.valueEq?_.cloneDeep(newValue):newValue);
			watcher.listenerFn(newValue,
				(oldValue===initWatchVal?newValue:oldValue),
				self);
			dirty=true;
		}else if(self.$$lastDirtyWatch===watcher){
			return false;
		}		
	});
	return dirty;
};
Scope.prototype.$digest=function(){
	var ttl=10;
	var dirty;
	this.$$lastDirtyWatch=null;
	do{
		dirty=this.$$digestOnce();
		if(dirty&&!(ttl--)){
			throw "10 digest iterations reached";
		}
	}while(dirty);
};
Scope.prototype.$$areEqual=function(newValue,oldValue,valueEq){
	if(valueEq){
		return _.isEqual(newValue,oldValue);
	}else{

		return newValue===oldValue ||
		(typeof newValue==='number' && typeof oldValue==='number'&&
				isNaN(newValue)&& isNaN(oldValue));
	}
};
module.exports=Scope;