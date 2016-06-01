/// <reference path="../../node_modules/rxjs/Observer.d.ts" />

// TODO(): generate these typings from Firebase source, and publish to npm
declare class FirebaseApplication {
	database(): FirebaseDatabase
}

declare class FirebaseModule {
	initializeApp(config: FirebaseAppConfig, name?: string): FirebaseApplication;
	auth(): FirebaseAuth;
}

declare interface FirebaseAppConfig {
	apiKey: string;
  authDomain: string;
  databaseURL?: string;
  storageBucket?: string;
}

declare class FirebaseDatabase {
	app: FirebaseApplication;
	ref(path?: string): Firebase;
}

declare class FirebaseRef {
	child(path: string): Firebase;
	remove(onComplete?: Function): Promise<void>;
}

// TODO: remove this once codebase has been updated to refer to FirebaseRef
declare class Firebase extends FirebaseRef {
}

declare interface FirebaseUser {
	displayName?: string;
	email?: string;
	emailVerified?: boolean;
	isAnonymous: boolean;
	photoURL?: string;
	providerData?: FirebaseUserInfo[];
	// TODO: consider union string type 'facebook.com' | 'google.com'
	providerId: string;
	refreshToken?: string;
	uid: string;
	// TODO: add methods
}

declare interface FirebaseUserInfo {
	displayName?: string;
	email?: string;
	photoURL?: string;
	providerId: string;
	uid: string;
}

/**
 * TODO: Should these be namespaced similarly to docs, i.e. FirebaseAuthUserCredential
 * to represent firebase.auth.UserCredential
 **/

declare interface FirebaseUserCredential {
	user: FirebaseUser;
	credential: FirebaseAuthCredential;
}

declare interface FirebaseAuthCredential {
	provider: string;
}

declare interface FirebaseAuth {
	app: FirebaseApplication;
	currentUser: FirebaseUser;
	createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser>;
	// TODO: fix Observer type
	onAuthStateChanged (nextOrObserver: any /*Observer<FirebaseUser>*/ | Function, opt_error?: Function, opt_completed?: Function): Function;
	signOut(): Promise<void>;
	signInWithCustomToken(token: string): Promise<FirebaseUser>;
	signInAnonymously(): Promise<FirebaseUser>;
	signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser>;
	signInWithPopup(provider: FirebaseAuthProvider): Promise<FirebaseUserCredential>
	signInWithRedirect(provider: FirebaseAuthProvider): Promise<void>;
	signInWithCredential(credential: FirebaseAuthCredential): Promise<FirebaseUser>;
	// TODO: implement remainining properties and methods
}

declare interface FirebaseAuthProvider {
	providerId: string;
}

declare var firebaseModule: FirebaseModule;

declare module 'firebase' {
	export = firebaseModule;
}
