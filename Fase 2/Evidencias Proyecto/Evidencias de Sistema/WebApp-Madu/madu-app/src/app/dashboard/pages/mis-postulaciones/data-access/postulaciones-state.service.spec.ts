import { TestBed } from '@angular/core/testing';

import { PostulacionesStateService } from './postulaciones-state.service';

describe('PostulacionesStateService', () => {
  let service: PostulacionesStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostulacionesStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
