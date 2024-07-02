import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from "ng-mocks";

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    MockBuilder(HomeComponent);
    fixture = MockRender(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
