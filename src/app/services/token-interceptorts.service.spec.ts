import { TestBed } from '@angular/core/testing';

import { TokenInterceptortsService } from './token-interceptorts.service';

describe('TokenInterceptortsService', () => {
  let service: TokenInterceptortsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenInterceptortsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
