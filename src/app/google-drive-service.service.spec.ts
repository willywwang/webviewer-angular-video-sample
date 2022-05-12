import { TestBed } from '@angular/core/testing';

import { GoogleDriveServiceService } from './google-drive-service.service';

describe('GoogleDriveServiceService', () => {
  let service: GoogleDriveServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleDriveServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
