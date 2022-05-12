// @ts-nocheck

import { Component, ViewChild, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';
import { initializeVideoViewer } from '@pdftron/webviewer-video';
import { GoogleDriveService, API_KEY } from './google-drive.service';
// @ts-nocheck
// Set this to ID of file you want to retrieve from Google Drive.
const FILE_ID = '1vcD4lIRcScI0UU20yz7lJFcMV39FWS8i';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer') viewer: ElementRef;
  wvInstance: WebViewerInstance;
  @Output() coreControlsEvent:EventEmitter<string> = new EventEmitter(); 

  public loadVideo: (filename: string, options?: any) => any;

  private documentLoaded$: Subject<void>;

  constructor(private googleDriveService : GoogleDriveService) {
    this.documentLoaded$ = new Subject<void>();
  }

  ngAfterViewInit(): void {

    WebViewer({
      path: '../lib',
      initialDoc: '../files/webviewer-demo-annotated.pdf'
    }, this.viewer.nativeElement).then(instance => {
      this.wvInstance = instance;

      this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);

      this.loadGoogleDriveFile(FILE_ID);
    })
  }

  ngOnInit() {
  }

  getDocumentLoadedObservable() {
    return this.documentLoaded$.asObservable();
  }

  loadGoogleDriveFile(fileId: string) {
    var path: string = 'https://www.googleapis.com/drive/v3/files/' + fileId + '?key=' + API_KEY + '&alt=media';
    var instance = this.wvInstance;

    //load the google drive api, I need to figure out how to know when this is complete
    this.googleDriveService.load();

    //for not just wait for a little bit
    setTimeout(() => {
      //I need to make sure that I can tell if there is a user logged in so I don't ask them every time.
      this.googleDriveService.signIn().then(async (user) => {
        //check the file type so we know how to load it.
        this.googleDriveService.getFileInfo(fileId).then(async (fileInfo) => {
          const { access_token, token_type } = await this.googleDriveService.getAuthInstance().currentUser.get().getAuthResponse();
          if (this.isVideo(fileInfo.mimeType)) {
            //this is a video file
            const { loadVideo } = await initializeVideoViewer(instance, {
              license: "scott.byrnes@gotoadvantage.com///159:21:60:200:148:200:216:191:8:72:220:108:220:174:188:38:66:59:54:111:181:208:204:55:94:24:40:74:0:4:16:229:69:252:47:148:14:98:223:217:98:88:10:73:50:55:3:250:69:66:179:94:99:122:197:102:29:112:118:117:7:222:147:78:85:29:79:167:226:245:250:212:6:221:161:240:123:127:14:181:254:205:178:232:26:165:222:242:157:221:0:12:165:105:42:2:27:74:194:33:57:113:109:161:123:199:35:132:229:27:64:36:191:211:24:127:36:231:135:157:174:191:154:61:96:102:244:149:144:202:140:186:243:50:126:159:58:165:95:57:5:91:114:248:75:19:56:122:61:119:110:77:214:128:113:73:86:0:70:112:54:91:48:7:236:112:156:187:235:29:49:180:93:186:208:33:222:8:252:152:129:79:97:52:79:91:25:37:50:39:150:77:10:207:54:221:234:101:78:21:85:166:45:127:98:193:141:130:86:74:151:5:101:147:89:98:58:103:158:220:73:35:121:188:173:197:132:169:6:91:47:232:243:147:54:248:144:58:40:56:146:89:99:225:29:147:97:135:88:103:71:174:12:68:166:145:138:87:20:211:201:174:162:93:146:37:157:133:73:240:29:18:63:167:175:43:42:184:236:210:4:127:203:66:159:201:176:169:139:74:95:248:242:203:203:78:207:111:37:43:160:76:182:49:70:135:142:204:109:210:217:69:191:161:209:140:194:93:190:173:110:76:129:62:143:66:112:206:73:147:9:17:197:234:141:97:247:24:41:66:177:2:119:39:34:131:129:82:193:82:56:38:84:26:145:50:184:83:236:125:86:6:34:208:77:142:225:190:1:158:167:135:180:64:241:6:50:250:110:75:98:166:144:47:251:68:77:177:152:186:161:71:87:163:96:115:54:244:124:108:244:106:127:170:31:41:213:0:248:109:190:34:180:61:65:149:120:130:242:223:183:150:32:136:94:86:133:124:84:176:67:229:92:184:134:126:58:24:161:184:216:33:160:158:95:21:226:94:35:96:175:157:7:159:166:231:228:35:75:1:77:54:149:110:16:195:74:189:229:50:89:139:18:216:44:184:107:36:17:255:221:171:113:254:208:211:5:12:100:148:13:248:199:103:152:0:36:146:159:114:86:12:56:215:233:195:41:75:136:188:153:111",
            });
            this.loadVideo = loadVideo;

            instance.UI.disableElements([
              'linkButton',
              'annotationPopup',
              'annotationDeleteButton',
              'annotationStyleEditButton'
            ]);

            this.loadVideo(path, {
                fileName: 'test',
                headers: {
                  Authorization: token_type + ' ' + access_token
                },
                withCredentials: true
            });

          } else {
            instance.UI.loadDocument(path,
              {
                filename: 'test',
                customHeaders: {
                  Authorization: token_type + ' ' + access_token
                },
                withCredentials: true
              }
            );
          }
        });
      });
    }, 500);

  }

  isVideo(mimeType: string): boolean {
    return (mimeType == 'video/mp4' ||
      mimeType == 'video/ogg' ||
      mimeType == 'audio/ogg' ||
      mimeType == 'video/webm');
  }
}
