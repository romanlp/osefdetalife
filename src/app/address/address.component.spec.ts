import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AddressComponent } from './address.component';

describe('AddressComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<AddressComponent>>;
  let component: AddressComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AddressComponent);
    component = fixture.componentInstance;
  });

  it('should export the component class', () => {
    expect(typeof AddressComponent).toBe('function');
  });

  it('should have a states array with all US states', () => {
    expect(component.states).toBeDefined();
    expect(component.states.length).toBeGreaterThan(50);
    expect(component.states[0]).toHaveProperty('name');
    expect(component.states[0]).toHaveProperty('abbreviation');
  });

  it('should have a default shipping value of free', () => {
    expect(component.addressForm.get('shipping')?.value).toBe('free');
  });

  it('should require firstName', () => {
    const firstName = component.addressForm.get('firstName');
    firstName?.setValue(null);
    expect(firstName?.valid).toBeFalsy();
    firstName?.setValue('John' as never);
    expect(firstName?.valid).toBeTruthy();
  });

  it('should require lastName', () => {
    const lastName = component.addressForm.get('lastName');
    lastName?.setValue(null);
    expect(lastName?.valid).toBeFalsy();
    lastName?.setValue('Doe' as never);
    expect(lastName?.valid).toBeTruthy();
  });

  it('should require address', () => {
    const address = component.addressForm.get('address');
    address?.setValue(null);
    expect(address?.valid).toBeFalsy();
    address?.setValue('123 Main St' as never);
    expect(address?.valid).toBeTruthy();
  });

  it('should require city', () => {
    const city = component.addressForm.get('city');
    city?.setValue(null);
    expect(city?.valid).toBeFalsy();
    city?.setValue('London' as never);
    expect(city?.valid).toBeTruthy();
  });

  it('should require state', () => {
    const state = component.addressForm.get('state');
    state?.setValue(null);
    expect(state?.valid).toBeFalsy();
    state?.setValue('CA' as never);
    expect(state?.valid).toBeTruthy();
  });

  it('should require postalCode with exact 5 digits', () => {
    const postalCode = component.addressForm.get('postalCode');
    postalCode?.setValue(null);
    expect(postalCode?.valid).toBeFalsy();
    postalCode?.setValue('123' as never);
    expect(postalCode?.valid).toBeFalsy();
    postalCode?.setValue('123456' as never);
    expect(postalCode?.valid).toBeFalsy();
    postalCode?.setValue('12345' as never);
    expect(postalCode?.valid).toBeTruthy();
  });

  it('should have optional company and address2 fields', () => {
    const company = component.addressForm.get('company');
    const address2 = component.addressForm.get('address2');
    expect(company?.valid).toBeTruthy();
    expect(address2?.valid).toBeTruthy();
  });

  it('should call onSubmit and show alert', () => {
    const alertSpy = vi.spyOn(window, 'alert');
    component.onSubmit();
    expect(alertSpy).toHaveBeenCalledWith('Thanks!');
    alertSpy.mockRestore();
  });
});
