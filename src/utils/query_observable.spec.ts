import {describe, expect, it} from 'angular2/testing';
import {QueryObservable} from './query_observable';

describe('QueryObservable', () => {
  it('should return an observable', () => {
    expect(typeof (new QueryObservable()).subscribe === 'function').toBe(true);
  });

  it('should return instances of QueryObservable from operators', () => {
    expect(new QueryObservable().map(v => v)).toBeAnInstanceOf(QueryObservable);
  });
});
