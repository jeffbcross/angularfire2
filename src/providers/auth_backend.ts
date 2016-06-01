import { Observable } from 'rxjs/Observable';

export abstract class AuthBackend {
  abstract authWithCustomToken(token: string, options?: any): Promise<FirebaseUser>;
  abstract authAnonymously(options?: any): Promise<FirebaseUser>;
  abstract authWithPassword(credentials: EmailPasswordCredentials, options?: any): Promise<FirebaseUser>;
  abstract authWithOAuthPopup(provider: AuthProviders, options?: any): Promise<FirebaseUserCredential>;
  abstract authWithOAuthRedirect(provider: AuthProviders, options?: any): Promise<void>;
  abstract authWithOAuthToken(credentialsObj: FirebaseAuthCredential, options?: any)
    : Promise<FirebaseUser>;
  abstract onAuth(): Observable<FirebaseUser>;
  abstract unauth(): void;
  abstract createUser(credentials: EmailPasswordCredentials): Promise<FirebaseUser>;
}

// Firebase only provides typings for google
export interface FirebaseAuthDataAllProviders extends FirebaseUser {
  github?: any;
  twitter?: any;
  google?: any;
  facebook?: any;
  password?: any;
  anonymous?: any;
}

export enum AuthProviders {
  Github,
  Twitter,
  Facebook,
  Google,
  Password,
  Anonymous,
  Custom
};

export enum AuthMethods {
  Popup,
  Redirect,
  Anonymous,
  Password,
  OAuthToken,
  CustomToken
};


export interface AuthConfiguration {
  method?: AuthMethods;
  provider?: AuthProviders;
  remember?: string;
  scope?: string[];
}

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}
