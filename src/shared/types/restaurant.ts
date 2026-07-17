export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  address?: string;
  timezone: string;
  hours: OpeningHours;
  tableGroups: TableGroup[];
  whiteLabel: WhiteLabel;
  customField?: CustomField;
  createdAt: Date;
}

export interface WhiteLabel {
  primaryColor: string;
  secondaryColor: string;
}

/** ISO day numbers: 1=Monday, 7=Sunday */
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OpeningHours = Partial<Record<DayNumber, DayHours>>;

export interface DayHours {
  /** 24-hour format, e.g. "09:00" */
  open: string;
  /** 24-hour format, e.g. "17:00" */
  close: string;
}

export interface TableGroup {
  capacity: number;
  count: number;
}

export interface CustomField {
  label: string;
  required: boolean;
  enabled: boolean;
}
