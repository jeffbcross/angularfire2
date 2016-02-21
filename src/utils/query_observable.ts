import {Observable} from 'rxjs/Observable';
import {ScalarObservable} from 'rxjs/observable/ScalarObservable';
import {Operator} from 'rxjs/Operator';
import {Observer} from 'rxjs/Observer';

export interface Query {
  orderByKey?: boolean | Observable<boolean>;
}

export interface ObservableQueryTuple {
  key: string;
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
    var serializedQuery:Query = {};
    if (query.orderByKey instanceof Observable) {
      (<Observable<boolean>>query.orderByKey).subscribe(v => {
        serializedQuery.orderByKey = v;
        observer.next(serializedQuery);
      });
    }
  });
}

function hasObservableProperties(query: Query): boolean {
  if (query.orderByKey instanceof Observable) return true;
  return false;
}

function isPresent(val: any): boolean {
  return val !== undefined && val !== null;
}
