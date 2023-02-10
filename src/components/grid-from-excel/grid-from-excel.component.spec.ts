import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridFromExcelComponent } from './grid-from-excel.component';

describe('NameMatchingComponent', () => {
  let component: GridFromExcelComponent;
  let fixture: ComponentFixture<GridFromExcelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridFromExcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridFromExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
