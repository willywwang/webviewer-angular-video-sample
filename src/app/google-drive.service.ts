import { Injectable } from '@angular/core';

//const CLIENT_ID : string = '496871216487-42qils6tp8qm00t7ovmcg1qkeemovlk5.apps.googleusercontent.com';
const CLIENT_ID: string = '253127768301-tc4lbj4limutt28h4c3c44bgt9p49s3g.apps.googleusercontent.com'
//const API_KEY: string = 'AIzaSyAW2kWN96BNKLU6w8CJ-9tQqIUw3pYbKyY';
export const API_KEY: string = 'AIzaSyA_MsDV6U_71lZ6_FypWQRr8WenjoEJTGA'

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS : string[] = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES : string = 'https://www.googleapis.com/auth/drive';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  constructor() { }

   // Client ID and API key from the Developer Console
  load(): void {
    gapi.load('client:auth2', this.initClient);
  }

  initClient(): Promise<any> {
    var promise = new Promise((resolve) => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      }).then(() => {
        // Listen for sign-in state changes.
        //gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        resolve(null);
      });
    });

    return promise;
  }

  signIn(): Promise<any> {
    console.log('asdf', gapi.auth2);
    return gapi.auth2.getAuthInstance().signIn();
  }

  listFiles(): Promise<any> {
    var promise = new Promise((resolve) => {
      gapi.client.drive.files.list({
        'pageSize': 100,
        'fields': "nextPageToken, files(id, name)",
        'includeItemsFromAllDrives': true,
        'supportsAllDrives': true
      }).then((response) => {
        resolve(response.result);
      });
    });

    return promise;
  };

  listDrives() : Promise<any> {
    var promise = new Promise((resolve) => {
      gapi.client.drive.drives.list({
        'pageSize': 100,
        'fields': 'nextPageToken, drives(id, name)'
      }).then((response) => {
        resolve(response.result);
      });
    });

    return promise;
  }

  getAuthInstance() : any {
    return gapi.auth2.getAuthInstance();
  }

  getFileInfo(fileId: string, fields: string = 'name, mimeType, webContentLink') : Promise<any> {
    var promise = new Promise((resolve) => {
      gapi.client.drive.files.get({
        'fileId': fileId,
        'fields': fields,
        'supportsAllDrives' : true
      }).then((response) => {
        console.log(response);
        resolve(response.result);
      });
    });
    return promise;
  }
 
}
