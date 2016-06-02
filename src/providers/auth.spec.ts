/// <reference path="../../manual_typings/manual_typings.d.ts" />

import {
  expect,
  ddescribe,
  describe,
  it,
  iit,
  beforeEach
} from '@angular/core/testing';
import {ReflectiveInjector, provide, Provider} from '@angular/core';
import {Observable} from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer';
import {
  defaultFirebase,
  FIREBASE_PROVIDERS,
  FirebaseApp,
  FirebaseConfig,
  FirebaseAuth,
  AuthMethods,
  firebaseAuthConfig,
  AuthProviders
} from '../angularfire2';
import {
  firebaseConfig
} from '../angularfire2.spec';
import {AuthBackend} from './auth_backend';
import {FirebaseSdkAuthBackend} from './firebase_sdk_auth_backend';
import * as Firebase from 'firebase';

describe('FirebaseAuth', () => {
  let injector: ReflectiveInjector;
  let app: FirebaseApplication;
  let authData: any;
  let authCb: any;
  let backend: AuthBackend;

  const authMethods = ['signInWithCustomToken', 'signInAnonymously', 'signInWithPassword',
    'signInWithPopup', 'signInWithRedirect', 'signInWithCredential',
    'signOut', 'onAuthStateChanged',
    'createUserWithEmailAndPassword', 'changeEmail', 'removeUser', 'resetPassword'
  ];

  const providerMetadata = {
    accessToken: 'accessToken',
    displayName: 'github User',
    username: 'githubUsername',
    id: '12345',
    expires: 0
  }

  const authObj = {
    token: 'key'
  }

  const authState = {
    provider: 'github',
    uid: 'github:12345',
    github: providerMetadata,
    auth: authObj,
    expires: 0
  };

  const AngularFireAuthState = {
    provider: AuthProviders.Github,
    uid: 'github:12345',
    github: providerMetadata,
    auth: authObj,
    expires: 0
  }

  beforeEach(() => {
    authData = null;
    authCb = null;
    injector = ReflectiveInjector.resolveAndCreate([
      FIREBASE_PROVIDERS,
      defaultFirebase(firebaseConfig)
    ]);
    app = injector.get(FirebaseApp);
  });

  afterEach(done => {
    app.delete().then(done, done.fail);
  });


  iit('should be an observable', () => {
    expect(injector.get(FirebaseAuth)).toBeAnInstanceOf(Observable);
  })

  describe('AuthState', () => {

    beforeEach(() => {
      spyOn(app.auth(), 'onAuthStateChanged').and.callFake((fn: Function | Observer<FirebaseUser>) => {
        console.log('mock onAuthStateChanged', fn);
        authCb = fn;
        if (typeof authCb === 'function') {
          authCb(authData);
        } else if (authCb && typeof authCb === 'object') {
          <Observer<FirebaseUser>>authCb.next(authData);
        }
      });
      backend = new FirebaseSdkAuthBackend(app);
    });

    function updateAuthState(_authData: any): void {
      authData = _authData;

      if (typeof authCb === 'function') {
        console.log('calling function');
        authCb(authData);
      } else if (authCb && typeof authCb === 'object') {
        console.log('calling next');
        <Observer<FirebaseUser>>authCb.next(authData);
      } else {
        console.log('no callback');
      }
    }

    iit('should asynchronously load firebase auth data', (done) => {
      updateAuthState(authState);
      let auth = injector.get(FirebaseAuth);

      auth
        .take(1)
        .subscribe((data) => {
          expect(data).toBe(authState);
          done();
        }, done.fail);
    });

    iit('should be null if user is not authed', (done) => {
      let auth = injector.get(FirebaseAuth);

      auth.subscribe(authData => {
        expect(authData).toBe(null);
        done();
      }, done.fail);
    });

    xit('should emit auth updates', (done: any) => {
      let count = 0;
      let auth = injector.get(FirebaseAuth);

      auth
        .do(() => count++)
        .subscribe(authData => {
          console.log('authData', authData);
          switch (count) {
            case 1:
              console.log('case 1', authState);
              expect(authData).toBe(null);
              updateAuthState(authState);
              break;
            case 2:
              console.log('case 2');
              expect(authData).toBe(AngularFireAuthState);
              done();
              break;
            default:
              throw new Error('Called too many times');
          }
        }, done.fail);
    });
  });

  function getArgIndex(callbackName: string): number {
    //In the firebase API, the completion callback is the second argument for all but a few functions.
    switch (callbackName) {
      case 'authAnonymously':
      case 'onAuth':
        return 0;
      case 'authWithOAuthToken':
        return 2;
      default:
        return 1;
    }
  }

  // calls the firebase callback
  function callback(callbackName: string, callIndex?: number): Function {
    callIndex = callIndex || 0; //assume the first call.
    var argIndex = getArgIndex(callbackName);
    return (<any>app)[callbackName].calls.argsFor(callIndex)[argIndex];
  }

  describe('firebaseAuthConfig', () => {
    beforeEach(() => {
      var authSpy = jasmine.createSpyObj('auth', authMethods);
      authSpy.signInWithPopup = jasmine.createSpy('signInWithPopup').and.returnValue(Promise.resolve('foo'));
      app.auth = () => authSpy;
      backend = new FirebaseSdkAuthBackend(app);
    });

    iit('should return a provider', () => {
      expect(firebaseAuthConfig({ method: AuthMethods.Password })).toBeAnInstanceOf(Provider);
    });

    iit('should use config in login', () => {
      let config = {
        method: AuthMethods.Anonymous
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login();
      expect(app.auth().signInAnonymously).toHaveBeenCalled();
    });

    xit('should pass options on to login method', () => {
      let config = {
        method: AuthMethods.Anonymous,
        remember: 'default'
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login();
      expect(app.auth().signInAnonymously).toHaveBeenCalledWith(jasmine.any(Function), { remember: 'default' });
    });

    xit('should be overridden by login\'s arguments', () => {
      let config = {
        method: AuthMethods.Anonymous
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login({
        method: AuthMethods.Popup,
        provider: AuthProviders.Google
      });
      expect(app.auth().signInWithPopup).toHaveBeenCalledWith('google.com', jasmine.any(Function), {});
    });

    it('should be merged with login\'s arguments', () => {
      let config = {
        method: AuthMethods.Popup,
        provider: AuthProviders.Google,
        scope: ['email']
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login({
        provider: AuthProviders.Github
      });
      expect(app.authWithOAuthPopup).toHaveBeenCalledWith('github', jasmine.any(Function), {
        scope: ['email']
      });
    });
  });

  describe('createUser', () => {
    let auth: FirebaseAuth = null;
    let credentials = { email: 'myname', password: 'password' };

    beforeEach(() => {
      app = jasmine.createSpyObj('ref',
        ['authWithCustomToken', 'authAnonymously', 'authWithPassword',
          'authWithOAuthPopup', 'authWithOAuthRedirect', 'authWithOAuthToken',
          'unauth', 'getAuth', 'onAuth', 'offAuth',
          'createUser', 'changePassword', 'changeEmail', 'removeUser', 'resetPassword'
        ]);
      backend = new FirebaseSdkAuthBackend(app);
      auth = new FirebaseAuth(backend);
    });

    it('should call createUser on a db reference', () => {
      auth.createUser(credentials);
      expect(app.createUser)
        .toHaveBeenCalledWith(credentials, jasmine.any(Function));
    });

  });

  describe('login', () => {
    let auth: FirebaseAuth = null;

    beforeEach(() => {
      app = jasmine.createSpyObj('ref',
        ['authWithCustomToken', 'authAnonymously', 'authWithPassword',
          'authWithOAuthPopup', 'authWithOAuthRedirect', 'authWithOAuthToken',
          'unauth', 'getAuth', 'onAuth', 'offAuth',
          'createUser', 'changePassword', 'changeEmail', 'removeUser', 'resetPassword'
        ]);
      backend = new FirebaseSdkAuthBackend(app);
      auth = new FirebaseAuth(backend);
    });

    it('should reject if password is used without credentials', (done: any) => {
      let config = {
        method: AuthMethods.Password
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login().then(done.fail, done);
    });

    it('should reject if custom token is used without credentials', (done: any) => {
      let config = {
        method: AuthMethods.CustomToken
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login().then(done.fail, done);;
    });

    it('should reject if oauth token is used without credentials', (done: any) => {
      let config = {
        method: AuthMethods.OAuthToken
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login().then(done.fail, done);
    });

    it('should reject if popup is used without a provider', (done: any) => {
      let config = {
        method: AuthMethods.Popup
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login().then(done.fail, done);
    });

    it('should reject if redirect is used without a provider', (done: any) => {
      let config = {
        method: AuthMethods.Redirect
      };
      let auth = new FirebaseAuth(backend, config);
      auth.login().then(done.fail, done);
    });

    describe('authWithCustomToken', () => {
      let options = {
        remember: 'default',
        method: AuthMethods.CustomToken
      };
      let credentials = {
        token: 'myToken'
      };

      it('passes custom token to underlying method', () => {
        auth.login(credentials, options);
        expect(app.authWithCustomToken)
          .toHaveBeenCalledWith('myToken', jasmine.any(Function), { remember: 'default' });
      });

      it('will reject the promise if authentication fails', (done: any) => {
        auth.login(credentials, options).then(done.fail, done);
        callback('authWithCustomToken')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(credentials, options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authWithCustomToken')(null, authState);
      });
    });

    describe('authAnonymously', () => {
      let options = {
        remember: 'default',
        method: AuthMethods.Anonymous
      };
      it('passes options object to underlying method', () => {
        auth.login(options);
        expect(app.authAnonymously).toHaveBeenCalledWith(jasmine.any(Function), { remember: 'default' });
      });

      it('will reject the promise if authentication fails', (done: any) => {
        auth.login(options).then(done.fail, done);
        callback('authAnonymously')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authAnonymously')(null, authState);
      });
    });

    describe('authWithPassword', () => {
      let options = { remember: 'default', method: AuthMethods.Password };
      let credentials = { email: 'myname', password: 'password' };

      it('should login with password credentials', () => {
        let config = {
          method: AuthMethods.Password,
          provider: AuthProviders.Password
        };
        const credentials = {
          email: 'david@fire.com',
          password: 'supersecretpassword'
        };
        let auth = new FirebaseAuth(backend, config);
        auth.login(credentials);
        expect(app.authWithPassword).toHaveBeenCalledWith(credentials,
          jasmine.any(Function),
          { provider: config.provider });
      });

      it('passes options and credentials object to underlying method', () => {
        auth.login(credentials, options);
        expect(app.authWithPassword).toHaveBeenCalledWith(
          credentials,
          jasmine.any(Function),
          { remember: options.remember }
        );
      });

      it('will revoke the promise if authentication fails', (done: any) => {
        auth.login(credentials, options).then(done.fail, done);
        callback('authWithPassword')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(credentials, options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authWithPassword')(null, authState);
      });
    });

    describe('authWithOAuthPopup', function() {
      let options = {
        method: AuthMethods.Popup,
        provider: AuthProviders.Github
      };
      it('passes provider and options object to underlying method', () => {
        let customOptions = Object.assign({}, options);
        customOptions.scope = ['email'];
        auth.login(customOptions);
        expect(app.authWithOAuthPopup).toHaveBeenCalledWith(
          'github',
          jasmine.any(Function),
          { scope: ['email'] }
        );
      });

      it('will reject the promise if authentication fails', (done: any) => {
        auth.login(options).then(done.fail, done);
        callback('authWithOAuthPopup')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authWithOAuthPopup')(null, authState);
      });
    });

    describe('authWithOAuthRedirect', () => {
      const options = {
        method: AuthMethods.Redirect,
        provider: AuthProviders.Github
      };
      it('passes provider and options object to underlying method', () => {
        let customOptions = Object.assign({}, options);
        customOptions.scope = ['email'];
        auth.login(customOptions);
        expect(app.authWithOAuthRedirect).toHaveBeenCalledWith(
          'github',
          jasmine.any(Function),
          { scope: ['email'] }
        );
      });

      it('will reject the promise if authentication fails', (done: any) => {
        auth.login(options).then(done.fail, done);
        callback('authWithOAuthRedirect')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authWithOAuthRedirect')(null, authState);
      });
    });

    describe('authWithOAuthToken', () => {
      const options = {
        method: AuthMethods.OAuthToken,
        provider: AuthProviders.Github,
        scope: ['email']
      };
      const token = 'GITHUB_TOKEN';
      const credentials = {
        token: token
      };
      it('passes provider, token, and options object to underlying method', () => {
        auth.login(credentials, options);
        expect(app.authWithOAuthToken).toHaveBeenCalledWith(
          'github',
          token,
          jasmine.any(Function),
          { scope: ['email'] }
        );
      });

      it('passes provider, OAuth credentials, and options object to underlying method', () => {
        let customOptions = Object.assign({}, options);
        customOptions.provider = AuthProviders.Twitter;
        let twitterCredentials = {
          "user_id": "<USER-ID>",
          "oauth_token": "<ACCESS-TOKEN>",
          "oauth_token_secret": "<ACCESS-TOKEN-SECRET>"
        };
        auth.login(twitterCredentials, customOptions);
        expect(app.authWithOAuthToken).toHaveBeenCalledWith(
          'twitter',
          twitterCredentials,
          jasmine.any(Function),
          { scope: ['email'] }
        );
      });

      it('will reject the promise if authentication fails', (done: any) => {
        let creds = {
          token: ''
        };
        auth.login(creds, options).then(done.fail, done);
        callback('authWithOAuthToken')('myError');
      });

      it('will resolve the promise upon authentication', (done: any) => {
        auth.login(credentials, options).then(result => {
          expect(result).toEqual(AngularFireAuthState);
          done();
        }, done.fail);
        callback('authWithOAuthToken')(null, authState);
      });
    });


    describe('unauth()', () => {
      it('will call unauth() on the backing ref if logged in', () => {
        (<any>app).getAuth.and.returnValue({ provider: 'twitter' }); auth.logout();
        expect(app.unauth).toHaveBeenCalled();
      });

      it('will NOT call unauth() on the backing ref if NOT logged in', () => {
        (<any>app).getAuth.and.returnValue(null);
        auth.logout();
        expect(app.unauth).not.toHaveBeenCalled();
      });
    });
  });
});

