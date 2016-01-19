import 'zone.js';
import {Component} from 'angular2/core';
import {FirebaseList} from './firebase_list';
import {beforeEach, inject, it, describe, TestComponentBuilder} from 'angular2/testing';

import {Parse5DomAdapter} from 'angular2/platform/server';
Parse5DomAdapter.makeCurrent();

@Component({
  template: '<h1>Hi</h1>'
})
@FirebaseList({
  foo:'bar'
})
class MyComponent {

}

describe('FirebaseList', () => {
  it('should be cool', inject([TestComponentBuilder], (tcb:TestComponentBuilder) =>{

  }));

});
