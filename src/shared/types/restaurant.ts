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

export type OpeningHours = Record<number, DayHours>;

export interface DayHours {
  open: string;
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
