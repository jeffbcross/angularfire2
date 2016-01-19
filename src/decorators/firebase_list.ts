import {makeDecorator} from 'angular2/src/core/util/decorators';

function FirebaseListDecorator(cls:any, fn:Function) {
  console.log('outer function', arguments);
  return function(lol:any) {
    console.log('inner function', arguments);
  }
}

export var FirebaseList = makeDecorator(FirebaseListDecorator);
