import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from "ng-mocks";
import { AdminModule } from "../admin.module";
import { AdminGalleryComponent } from './admin-gallery.component';

fdescribe('AdminGalleryComponent', () => {
  let component: AdminGalleryComponent;
  let fixture: ComponentFixture<AdminGalleryComponent>;

  beforeEach(async () => {
    MockBuilder(AdminGalleryComponent, AdminModule);
    fixture = MockRender(AdminGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
