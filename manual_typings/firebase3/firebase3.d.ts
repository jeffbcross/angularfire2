// TODO(): generate these typings from Firebase source, and publish to npm
declare class FirebaseApp {
	database(): FirebaseDatabase
}

declare class FirebaseModule {
	initializeApp(config: FirebaseAppConfig, name?: string): FirebaseApp;
}

declare interface FirebaseAppConfig {
	apiKey: string;
  authDomain: string;
  databaseURL?: string;
  storageBucket?: string;
}

declare class FirebaseDatabase {
	app: FirebaseApp;
	ref(path?: string): Firebase;
}

declare class FirebaseRef {
	child(path: string): Firebase;
	remove(onComplete?: Function): Promise<void>;
}

// TODO: remove this once codebase has been updated to refer to FirebaseRef
declare class Firebase extends FirebaseRef {
}

declare var firebaseModule: FirebaseModule;

declare module 'firebase' {
	export = firebaseModule;
}
