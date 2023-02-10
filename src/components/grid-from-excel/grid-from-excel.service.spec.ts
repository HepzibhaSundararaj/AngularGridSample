import { TestBed, inject } from '@angular/core/testing';

import { GridFromExcelService } from './grid-from-excel.service';

describe('NameMatchingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GridFromExcelService]
    });
  });

  it('should be created', inject([GridFromExcelService], (service: GridFromExcelService) => {
    expect(service).toBeTruthy();
  }));
});
