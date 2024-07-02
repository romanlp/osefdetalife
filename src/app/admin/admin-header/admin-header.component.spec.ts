import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from "ng-mocks";

import { AdminHeaderComponent } from './admin-header.component';

describe('AdminHeaderComponent', () => {
  let component: AdminHeaderComponent;
  let fixture: ComponentFixture<AdminHeaderComponent>;

  beforeEach(async () => {
    MockBuilder(AdminHeaderComponent);
    fixture = MockRender(AdminHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
