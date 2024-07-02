import { waitForAsync } from '@angular/core/testing';
import { MockBuilder, MockRender } from "ng-mocks";
import { HomeComponent } from "./admin/home/home.component";

describe('AppComponent', () => {

  beforeEach(async () => {
    MockBuilder(HomeComponent);
  });

  it('should create the app', waitForAsync(() => {
    const fixture = MockRender(HomeComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should render title in a h1 tag', waitForAsync(() => {
    const fixture = MockRender(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
  }));
});
