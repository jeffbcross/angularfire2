import 'zone.js';
import {Component, OnInit, ViewChild} from 'angular2/core';
import {FirebaseList} from './firebase_list';
import {beforeEach, fit, inject, it, describe, expect, TestComponentBuilder} from 'angular2/testing';

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

@Component({
  template: '<h1>Hi</h1>'
})
class MyComponentWithOnInit implements OnInit {
  @FirebaseList({
    foo: 'bar'
  }) foo:any;
  ngOnInitCalled = false;
  ngOnInit () {
    this.ngOnInitCalled = true;
  }
}

describe('FirebaseList', () => {
  it('should add an ngOnInit method if one does not exist', inject([TestComponentBuilder], (tcb:TestComponentBuilder) => {
    tcb.createAsync(MyComponent)
      .then(f => {
        expect(typeof f.componentInstance.ngOnInit).toBe('function');
      });
  }));

  it('should monkey-patch an ngOnInit method if one already exists', inject([TestComponentBuilder], (tcb:TestComponentBuilder) => {
    tcb.createAsync(MyComponentWithOnInit)
      .then(f => {
        expect(f.componentInstance.ngOnInitCalled).toBe(false);
        f.detectChanges();
        expect(f.componentInstance.ngOnInitCalled).toBe(true);
      });
  }));
});

