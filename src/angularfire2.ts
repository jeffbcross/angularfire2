import {APP_INITIALIZER, Inject, Injectable, OpaqueToken, provide, Provider} from '@angular/core';
import {FirebaseAuth, firebaseAuthConfig} from './providers/auth';
import * as firebase from 'firebase';
import {FirebaseListObservable} from './utils/firebase_list_observable';
import {FirebaseObjectObservable} from './utils/firebase_object_observable';
import {FirebaseListFactory, FirebaseListFactoryOpts} from './utils/firebase_list_factory';
import {
  FirebaseObjectFactoryOpts,
  FirebaseObjectFactory
} from './utils/firebase_object_factory';
import {FirebaseConfig, FirebaseApp} from './tokens';
import {
  AuthBackend,
  AuthMethods,
  AuthProviders
} from './providers/auth_backend';
import {FirebaseSdkAuthBackend} from './providers/firebase_sdk_auth_backend';
import {FirebaseDatabase} from './database/database';

@Injectable()
export class AngularFire {
  list: (url:string, opts?:FirebaseListFactoryOpts) => FirebaseListObservable<any[]>;
  object: (url: string, opts?:FirebaseObjectFactoryOpts) => FirebaseObjectObservable<any>;
  constructor(
    @Inject(FirebaseConfig) private fbUrl:string,
    public auth:FirebaseAuth,
    public database: FirebaseDatabase) {}

}

function getAbsUrl (root:string, url:string) {
  if (!(/^[a-z]+:\/\/.*/.test(url))) {
    // Provided url is relative.
    url = root + url;
  }
  return url;
}

export const COMMON_PROVIDERS: any[] = [
  provide(FirebaseApp, {
    useFactory: (config: FirebaseAppConfig) => {
      return firebase.initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        databaseURL: config.databaseURL,
        storageBucket: config.storageBucket
      });
    },
    deps: [FirebaseConfig]}),
  FirebaseAuth,
  AngularFire,
  FirebaseDatabase
];

export const FIREBASE_PROVIDERS:any[] = [
  COMMON_PROVIDERS,
  provide(AuthBackend, {
    useFactory: (ref: FirebaseRef) => new FirebaseSdkAuthBackend(ref, false),
    deps: [FirebaseApp]
  })
];

/**
 * Used to define the default Firebase root location to be
 * used throughout an application.
 */
export const defaultFirebase = (config: FirebaseAppConfig): Provider => {
  return provide(FirebaseConfig, {
    useValue: config
  });
};

export {
  FirebaseAuth,
  FirebaseDatabase,
  FirebaseListObservable,
  FirebaseObjectObservable,
  FirebaseListFactory,
  FirebaseObjectFactory,
  firebaseAuthConfig,
  AuthMethods,
  AuthProviders
}

export { FirebaseConfig, FirebaseApp, FirebaseAuthConfig } from './tokens';

// Helps Angular-CLI automatically add providers
export default {
  providers: FIREBASE_PROVIDERS
}
