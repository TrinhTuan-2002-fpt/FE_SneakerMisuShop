import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDetailSaleComponent } from './create-detail-sale.component';

describe('CreateDetailSaleComponent', () => {
  let component: CreateDetailSaleComponent;
  let fixture: ComponentFixture<CreateDetailSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDetailSaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDetailSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
