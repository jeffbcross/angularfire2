declare var Reflect:any;
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

class FirebaseListDecorator {
}

/**
 * This is copied from makePropDecorator in Angular.
 * The only modification is to call monkeyPatchOnInit
 * to monkey patch the component's onInit handler.
 */
export function FirebaseList(...args:any[]): any {
  var decoratorInstance = Object.create(FirebaseListDecorator.prototype);
  FirebaseListDecorator.apply(decoratorInstance, args);

  if (this instanceof FirebaseListDecorator) {
    return decoratorInstance;
  } else {
    return function PropDecorator(target: any, name: string) {
      var meta = Reflect.getOwnMetadata('propMetadata', target.constructor);
      monkeyPatchOnInit(target, name);
      meta = meta || {};
      meta[name] = meta[name] || [];
      meta[name].unshift(decoratorInstance);
      Reflect.defineMetadata('propMetadata', meta, target.constructor);
    };
  }
}

function monkeyPatchOnInit(target:any, name:string):void {
  if (target && typeof target.ngOnInit === 'function') {
    let existingInit = target.ngOnInit;
    target.ngOnInit = function () {
      // TODO
      this[name] = Observable.create((obs:Observer<any[]>) => {
        //TODO
      });
      existingInit.apply(this, arguments);
    };
  } else if (target) {
    target.ngOnInit = function () {
      // TODO
      this[name] = Observable.create((obs:Observer<any[]>) => {
        //TODO
      });
    };
  } else {
    throw `FirebaseList must be applied to a component instance. Actual: ${target}`;
  }
}
