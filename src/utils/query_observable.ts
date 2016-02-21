import {Observable} from 'rxjs/Observable';
import {ScalarObservable} from 'rxjs/observable/ScalarObservable';
import {Operator} from 'rxjs/Operator';
import {Observer} from 'rxjs/Observer';
import {merge} from 'rxjs/operator/merge-static';
import {map} from 'rxjs/operator/map';

export interface Query {
  orderByKey?: boolean | Observable<boolean>;
  orderByPriority?: boolean | Observable<boolean>;
  orderByChild?: string | Observable<string>;
  orderByValue?: boolean | Observable<boolean>;
}

export enum OrderByOptions {
  Child,
  Key,
  Value,
  Priority
}

export interface OrderBySelection {
  key: OrderByOptions;
  value: boolean | string;
}

export function observeQuery (query: Query): Observable<Query> {
  if (!isPresent(query)) {
    return new ScalarObservable(null);
  }

  if (!hasObservableProperties(query)) {
    return new ScalarObservable(query);
  }

  return Observable.create((observer: Observer<Query>) => {
    var serializedOrder:Query = {};
    getOrderObservables(query).subscribe((v:OrderBySelection) => {
      if (!isPresent(v.value)) {
        serializedOrder = {};
      } else {
        switch (v.key) {
          case OrderByOptions.Key:
            serializedOrder = {orderByKey: <boolean>v.value};
            break;
          case OrderByOptions.Priority:
            serializedOrder = {orderByPriority: <boolean>v.value};
            break;
          case OrderByOptions.Value:
            serializedOrder = {orderByValue: <boolean>v.value};
            break;
          case OrderByOptions.Child:
            serializedOrder = {orderByChild: <string>v.value};
            break;
        }
      }

      // TODO: this should combine with other parts of the query
      observer.next(serializedOrder);
    });
  });
}

function getOrderObservables(query: Query): Observable<OrderBySelection> {
  return merge(
    mapToOrderBySelection(
      <Observable<boolean>>query.orderByKey,
      OrderByOptions.Key),

    mapToOrderBySelection(
      <Observable<boolean>>query.orderByPriority,
      OrderByOptions.Priority),

    mapToOrderBySelection(
      <Observable<boolean>>query.orderByValue,
      OrderByOptions.Value),

    mapToOrderBySelection(
      <Observable<string>>query.orderByChild,
      OrderByOptions.Child)
  );
}

function mapToOrderBySelection (obs:Observable<boolean|string>, key:OrderByOptions): Observable<OrderBySelection> {
  // TODO: something better than returning a no-op Observable
  if (!(obs instanceof Observable)) return new Observable(() => {});
  return map
    .call(obs, (value: boolean):OrderBySelection => ({ value, key}));
}

function hasObservableProperties(query: Query): boolean {
  if (query.orderByKey instanceof Observable) return true;
  return false;
}

function isPresent(val: any): boolean {
  return val !== undefined && val !== null;
}
