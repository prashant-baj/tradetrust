import { TestBed } from '@angular/core/testing';

import { LCService } from './lc.service';

describe('LCService', () => {
  let service: LCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
