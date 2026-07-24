import { Component, inject, signal, computed, WritableSignal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput, MatFormField, MatLabel } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatCheckbox } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { OnboardingService } from '../../services/onboarding.service';
import type { OpeningHours, DayNumber, TableGroup } from '../../../shared/types/restaurant';

interface DaySchedule {
  dayNumber: DayNumber;
  label: string;
  isOpen: WritableSignal<boolean>;
  openTime: WritableSignal<string>;
  closeTime: WritableSignal<string>;
}

@Component({
  templateUrl: './availability-page.component.html',
  styleUrls: ['./availability-page.component.scss'],
  imports: [FormsModule, MatButton, MatIconButton, MatCardModule, MatInput, MatFormField, MatLabel, MatProgressBar, MatCheckbox],
})
export class AvailabilityPageComponent implements OnInit {
  private onboardingService = inject(OnboardingService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  tableGroups = signal<TableGroup[]>([]);

  days: DaySchedule[] = [
    { dayNumber: 1, label: 'Monday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 2, label: 'Tuesday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 3, label: 'Wednesday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 4, label: 'Thursday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 5, label: 'Friday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 6, label: 'Saturday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
    { dayNumber: 7, label: 'Sunday', isOpen: signal(false), openTime: signal('09:00'), closeTime: signal('17:00') },
  ];

  hasOpenDays = computed(() => this.days.some(d => d.isOpen()));
  hasTableGroups = computed(() => this.tableGroups().length > 0);

  hasValidTimeRanges = computed(() => {
    return this.days
      .filter(d => d.isOpen())
      .every(d => d.openTime() < d.closeTime());
  });

  canContinue = computed(() => {
    return this.hasOpenDays() && this.hasTableGroups() && this.hasValidTimeRanges() && !this.loading();
  });

  hoursError = computed(() => {
    if (!this.hasOpenDays()) return 'Set your opening hours to continue';
    if (!this.hasValidTimeRanges()) return 'Close time must be after open time';
    return null;
  });

  tableGroupsError = computed(() => {
    return this.hasOpenDays() && !this.hasTableGroups() ? 'Add at least one table group to continue' : null;
  });

  async ngOnInit() {
    try {
      const user = this.onboardingService.getCurrentUser();
      if (!user) return;

      const restaurant = await this.onboardingService.getRestaurantByOwner(user.uid);
      if (!restaurant) return;

      if (restaurant.hours) {
        for (const day of this.days) {
          const dayHours = restaurant.hours[day.dayNumber];
          if (dayHours) {
            day.isOpen.set(true);
            day.openTime.set(dayHours.open);
            day.closeTime.set(dayHours.close);
          }
        }
      }

      if (restaurant.tableGroups) {
        this.tableGroups.set(restaurant.tableGroups);
      }
    } catch {
      // Silently ignore — defaults will be used
    }
  }

  addTableGroup() {
    this.tableGroups.update(groups => [...groups, { capacity: 2, count: 1 }]);
  }

  removeTableGroup(index: number) {
    this.tableGroups.update(groups => groups.filter((_, i) => i !== index));
  }

  updateTableGroupCapacity(index: number, value: string) {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      this.tableGroups.update(groups => groups.map((g, i) => i === index ? { ...g, capacity: num } : g));
    }
  }

  updateTableGroupCount(index: number, value: string) {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      this.tableGroups.update(groups => groups.map((g, i) => i === index ? { ...g, count: num } : g));
    }
  }

  toggleDay(day: DaySchedule) {
    day.isOpen.update(v => !v);
  }

  onOpenTimeChange(day: DaySchedule, value: string) {
    day.openTime.set(value);
  }

  onCloseTimeChange(day: DaySchedule, value: string) {
    day.closeTime.set(value);
  }

  async continueToStep3() {
    if (!this.canContinue()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const hours: OpeningHours = {};
      for (const day of this.days) {
        if (day.isOpen()) {
          hours[day.dayNumber] = {
            open: day.openTime(),
            close: day.closeTime(),
          };
        }
      }

      const restaurantId = await this.getRestaurantId();
      await this.onboardingService.updateRestaurant(restaurantId, {
        hours,
        tableGroups: this.tableGroups(),
      });

      this.router.navigate(['/onboarding/branding']);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  private async getRestaurantId(): Promise<string> {
    const user = this.onboardingService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const restaurant = await this.onboardingService.getRestaurantByOwner(user.uid);
    if (!restaurant) throw new Error('Restaurant not found');

    return restaurant.id;
  }
}
