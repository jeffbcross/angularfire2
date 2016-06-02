import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import {
  AuthBackend,
  AuthProviders,
  AuthMethods,
  EmailPasswordCredentials
} from './auth_backend';
import {FirebaseApp} from '../tokens';
import {isPresent} from '../utils/utils';
import * as firebase from 'firebase';

@Injectable()
export class FirebaseSdkAuthBackend extends AuthBackend {
  _fbAuth: FirebaseAuth;
  constructor( @Inject(FirebaseApp) _fbApp: FirebaseApplication,
    private _webWorkerMode = false) {
    super();
    this._fbAuth = firebase.auth();
  }

  createUser(creds: EmailPasswordCredentials): Promise<FirebaseUser> {
    return this._fbAuth.createUserWithEmailAndPassword(creds.email, creds.password);
  }

  onAuth(): Observable<FirebaseUser> {
    // TODO: assumes this will accept an RxJS observer
    return Observable.create((observer: Observer<FirebaseUser>) => {
      return this._fbAuth.onAuthStateChanged(observer);
    });
  }

  unauth(): void {
    this._fbAuth.signOut();
  }

  authWithCustomToken(token: string): Promise<FirebaseUser> {
    return this._fbAuth.signInWithCustomToken(token)
  }

  authAnonymously(options?: any): Promise<FirebaseUser> {
    return this._fbAuth.signInAnonymously();
  }

  authWithPassword(creds: EmailPasswordCredentials, options?: any)
    : Promise<FirebaseUser> {
    return this._fbAuth.signInWithEmailAndPassword(creds.email, creds.password)
  }

  authWithOAuthPopup(provider: AuthProviders, options?: any): Promise<FirebaseUserCredential> {
    return this._fbAuth.signInWithPopup(this._enumToAuthProvider(provider));
  }

  /**
   * Authenticates a Firebase client using a redirect-based OAuth flow
   * NOTE: This promise will not be resolved if authentication is successful since the browser redirected.
   * You should subscribe to the FirebaseAuth object to listen succesful login
   */
  authWithOAuthRedirect(provider: AuthProviders, options?: any): Promise<void> {
    return this._fbAuth.signInWithRedirect(this._enumToAuthProvider(provider));
  }

  authWithOAuthToken(credential: FirebaseAuthCredential)
    : Promise<FirebaseUser> {
    return this._fbAuth.signInWithCredential(credential);
  }

  private _enumToAuthProvider(provider: AuthProviders): FirebaseAuthProvider {
    var providerId: string;
    switch (provider) {
      case AuthProviders.Github:
        providerId = 'github.com';
        break;
      case AuthProviders.Twitter:
        providerId = 'twitter.com';
        break;
      case AuthProviders.Facebook:
        providerId = 'facebook.com';
        break;
      case AuthProviders.Google:
        providerId = 'google.com';
        break;
      default:
        throw new Error(`Unsupported firebase auth provider ${provider}`);
    }
    return {
      providerId
    };
  }
}
