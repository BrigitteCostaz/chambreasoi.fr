/* config/types/organization.d.ts */
export interface PhotoCreditEntry {
  name: string;
  description: string;
  url?: string;
  licenseUrl?: string;
  licenseLabel?: string;
}

export interface OrganizationConfig {
  contact: {
    email: string;
    phone: {
      display: string;
      link: string;
    };
  };

  address: {
    street: string;
    city: string;
    postalCode: string;
    department: string;
    departmentCode: string;
    region: string;
    country: string;
    countryIso: string;
  };

  legal: {
    name: string;
    brandName: string;
    legalName: string;
    legalForm: string;

    siret: string;
    siren: string;
    vatNumber?: string;
    rcsNumber?: string;
    tradeRegistry?: string;

    startYear?: number;

    activityCode: string;
    activityLabel: string;
  };

  website: {
    url: string;
    developer: {
      name: string;
      url: string;
      email: string;
      siret: string;
    };
    hosting: {
      name: string;
      address: string;
      url: string;
      privacyPolicyUrl: string;
    };
  };

  dates: {
    lastUpdated: string;
    lastUpdatedIso: string;
  };

  photoCredits: PhotoCreditEntry[];

  googleBusiness: {
    cid?: string;
    location: {
      latitude: number;
      longitude: number;
    };
    reviewUrl?: string;
    sameAs: string[];
    priceRange?: string;
  };
}
