import {Observable} from 'rxjs/Observable';
import {Operator} from 'rxjs/Operator';

export class QueryObservable<T> extends Observable<T> {
  lift<T, R>(operator: Operator<T, R>): Observable<R> {
    const observable = new QueryObservable<R>();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }
}
