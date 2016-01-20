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
  let existingInit = target && typeof target.ngOnInit === 'function' ? target.ngOnInit : null;
  target.ngOnInit = createOnInitFn(name, existingInit);
}

function createOnInitFn(propName:string, fn?:Function):Function {
  return function ngOnInit() {
    this[propName] = Observable.create((obs:Observer<any[]>) => {
      var arr:any[] = [];
      this.firebaseRef.on('child_added', (child:any) => {
        arr.push(child);
        obs.next.bind(arr);
      });
    });
    if (fn) fn.apply(this, arguments);
  }
}
