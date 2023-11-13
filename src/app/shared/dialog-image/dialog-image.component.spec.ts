import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogImageComponent } from './dialog-image.component';

describe('DialogImageComponent', () => {
  let component: DialogImageComponent;
  let fixture: ComponentFixture<DialogImageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogImageComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: { url: 'image.jpg'}}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
