export interface SecureResourceItem {
  link?: string;
  downloadLinks?: Array<{ label: string; url: string }>;
  purchaseDetails?: string;
}

export const secureResourceDetails: Record<string, SecureResourceItem> = {};
