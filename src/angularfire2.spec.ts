import * as Firebase from 'firebase';
import {
  describe,
  ddescribe,
  it,
  iit,
  beforeEach,
  beforeEachProviders,
  expect,
  inject,
  injectAsync,
  async
} from '@angular/core/testing';
import {ReflectiveInjector, provide, Provider} from '@angular/core';
import {
  AngularFire,
  FirebaseObjectObservable,
  FIREBASE_PROVIDERS,
  FirebaseAuth,
  FirebaseConfig,
  FirebaseApp,
  defaultFirebase,
  FirebaseDatabase
} from './angularfire2';
import {Subscription} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

// Only use this URL for angularfire2.spec.ts
const firebaseConfig: FirebaseAppConfig = {
  apiKey: "AIzaSyBVSy3YpkVGiKXbbxeK0qBnu3-MNZ9UIjA",
  authDomain: "angularfire2-test.firebaseapp.com",
  databaseURL: "https://angularfire2-test.firebaseio.com",
  storageBucket: "angularfire2-test.appspot.com",
};

describe('angularfire', () => {
  var subscription:Subscription;
  const rootRef = Firebase.initializeApp(firebaseConfig).database().ref();
  const questionsRef = rootRef.child('questions');
  const listOfQuestionsRef = rootRef.child('list-of-questions');

  afterEach((done:any) => {
    // Clear out the Firebase to prevent leaks between tests
    rootRef.remove(done);
    if(subscription && !subscription.isUnsubscribed) {
      subscription.unsubscribe();
    }
  });


  it('should be injectable via FIREBASE_PROVIDERS', () => {
    var injector = ReflectiveInjector.resolveAndCreate([FIREBASE_PROVIDERS, defaultFirebase(firebaseConfig)]);
    expect(injector.get(AngularFire)).toBeAnInstanceOf(AngularFire);
  });

  describe('.auth', () => {
    beforeEachProviders(() => [FIREBASE_PROVIDERS, defaultFirebase(firebaseConfig)]);

    it('should be an instance of AuthService', inject([AngularFire], (af:AngularFire) => {
      expect(af.auth).toBeAnInstanceOf(FirebaseAuth);
    }));
  });


  describe('.database', () => {
    beforeEachProviders(() => [FIREBASE_PROVIDERS, defaultFirebase(firebaseConfig)]);

    it('should be an instance of AuthService', inject([AngularFire], (af:AngularFire) => {
      expect(af.database).toBeAnInstanceOf(FirebaseDatabase);
    }));
  });

  describe('FIREBASE_REF', () => {
    it('should provide a FirebaseRef for the FIREBASE_REF binding', () => {
      var injector = ReflectiveInjector.resolveAndCreate([
        provide(FirebaseConfig, {
          useValue: firebaseConfig
        }),
        FIREBASE_PROVIDERS
      ]);
      expect(typeof injector.get(FirebaseApp).on).toBe('function');
    })
  });

  describe('defaultFirebase', () => {
    it('should create a provider', () => {
      const provider = defaultFirebase(firebaseConfig);
      expect(provider).toBeAnInstanceOf(Provider);
    });


    it('should inject a FIR reference', () => {
      const injector = ReflectiveInjector.resolveAndCreate([defaultFirebase(firebaseConfig), FIREBASE_PROVIDERS]);
      expect(injector.get(FirebaseApp).toString()).toBe(firebaseConfig);
    });
  });

});
