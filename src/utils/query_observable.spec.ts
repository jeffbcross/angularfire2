import {describe, expect, it} from 'angular2/testing';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';

import {observeQuery} from './query_observable';

describe('QueryObservable', () => {
  it('should return an observable', () => {
    expect(observeQuery({})).toBeAnInstanceOf(Observable);
  });


  it('should immediately emit a query object if passed a plain JS object with only scalar values', () => {
    var nextSpy = jasmine.createSpy('next');
    var completeSpy = jasmine.createSpy('complete');
    var query = {orderByKey: true};
    var obs = observeQuery(query);
    obs.subscribe(nextSpy, null, completeSpy);
    expect(nextSpy).toHaveBeenCalledWith(query);
    expect(completeSpy).toHaveBeenCalled();
  });


  it('should return null if called with no query', () => {
    var nextSpy = jasmine.createSpy('next');
    var completeSpy = jasmine.createSpy('complete');
    var query:any = null;
    var obs = observeQuery(query);
    obs.subscribe(nextSpy, null, completeSpy);
    expect(nextSpy).toHaveBeenCalledWith(null);
    expect(completeSpy).toHaveBeenCalled();
  });


  it('should emit an updated query if an attached observable emits new value', () => {
    var nextSpy = jasmine.createSpy('next');
    var completeSpy = jasmine.createSpy('complete');
    var query = {
      orderByKey: new Subject()
    };
    var obs = observeQuery(query);
    obs.subscribe(nextSpy, null, completeSpy);
    query.orderByKey.next(true);
    expect(nextSpy).toHaveBeenCalledWith({orderByKey:true});
    nextSpy.calls.reset();
    expect(completeSpy).not.toHaveBeenCalled();
    query.orderByKey.next(false);
    expect(nextSpy).toHaveBeenCalledWith({orderByKey:false});
  });
});
