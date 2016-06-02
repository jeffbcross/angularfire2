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
  var app: FirebaseApplication;
  var rootRef: FirebaseRef;
  var questionsRef: FirebaseRef;
  var listOfQuestionsRef: FirebaseRef;
  var angularFire2: AngularFire;

  beforeEachProviders(() => [FIREBASE_PROVIDERS, defaultFirebase(firebaseConfig)]);

  describe('things', () => {

  })
  beforeEach(inject([FirebaseApp, AngularFire], (firebaseApp: FirebaseApplication, _af: AngularFire) => {
    angularFire2 = _af;
    app = firebaseApp;
    rootRef = app.database().ref();
    questionsRef = rootRef.child('questions');
    listOfQuestionsRef = rootRef.child('list-of-questions');
  }));

  afterEach((done) => {
    rootRef.remove()
    if(subscription && !subscription.isUnsubscribed) {
      subscription.unsubscribe();
    }
    app.delete().then(done, done.fail);
  });


  it('should be injectable via FIREBASE_PROVIDERS', () => {
    expect(angularFire2).toBeAnInstanceOf(AngularFire);
  });

  describe('.auth', () => {
    it('should be an instance of AuthService', inject([AngularFire], (af:AngularFire) => {
      expect(af.auth).toBeAnInstanceOf(FirebaseAuth);
    }));
  });


  describe('.database', () => {
    it('should be an instance of Database', inject([AngularFire], (af:AngularFire) => {
      expect(af.database).toBeAnInstanceOf(FirebaseDatabase);
    }));
  });

  describe('FirebaseApp', () => {
    it('should provide a FirebaseApp for the FirebaseApp binding', () => {
      expect(typeof app.delete).toBe('function');
    })
  });

  describe('defaultFirebase', () => {
    it('should create a provider', () => {
      const provider = defaultFirebase(firebaseConfig);
      expect(provider).toBeAnInstanceOf(Provider);
    });
  });
});
