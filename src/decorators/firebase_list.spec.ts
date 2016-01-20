import 'zone.js';
import {Component, OnInit, ViewChild} from 'angular2/core';
import {FirebaseList} from './firebase_list';
import {beforeEach, inject, it, describe, expect, TestComponentBuilder} from 'angular2/testing';

import {Parse5DomAdapter} from 'angular2/platform/server';
Parse5DomAdapter.makeCurrent();

@Component({
  template: '<h1>Hi</h1>'
})

class MyComponent {
  @FirebaseList({
    foo: 'bar'
  }) foo:any;
}

describe('FirebaseList', () => {
  it('should be cool', inject([TestComponentBuilder], (tcb:TestComponentBuilder) => {
    tcb.createAsync(MyComponent)
      .then(f => {
        expect(typeof f.componentInstance.ngOnInit).toBe('function');
      });
  }));
});

