import {Observable} from 'rxjs/Observable';
import {ScalarObservable} from 'rxjs/observable/ScalarObservable';
import {Operator} from 'rxjs/Operator';
import {Observer} from 'rxjs/Observer';
import {merge} from 'rxjs/operator/merge-static';
import {map} from 'rxjs/operator/map';

export interface Query {
  orderByKey?: boolean | Observable<boolean>;
}

export enum OrderByOptions {
  Child,
  Key,
  Order,
  Priority
}

export interface OrderBySelection {
  key: OrderByOptions;
  value: any;
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
            serializedOrder = {orderByKey: v.value};
            break;
        }
      }

      observer.next(serializedOrder);
    });
  });
}

function getOrderObservables(query:Query):Observable<OrderBySelection> {
  return merge(map.call(<Observable<boolean>>query.orderByKey, (v: boolean): OrderBySelection => {
    return {
      value: v,
      key: OrderByOptions.Key
    };
  }));
}

function hasObservableProperties(query: Query): boolean {
  if (query.orderByKey instanceof Observable) return true;
  return false;
}

function isPresent(val: any): boolean {
  return val !== undefined && val !== null;
}
