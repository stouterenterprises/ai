import { query } from "@/lib/db";

export type ConfigSource = "mysql";

export type FeatureFlag = {
  key: string;
  enabled: boolean;
};

export type BusinessConfig = {
  businessId: string;
  allowDepartmentPicker: boolean;
  defaultDepartmentId: string | null;
  featureFlags: FeatureFlag[];
};

export interface ConfigService {
  getBusinessConfig(businessId: string): Promise<BusinessConfig>;
}

export class DatabaseConfigService implements ConfigService {
  async getBusinessConfig(businessId: string): Promise<BusinessConfig> {
    const [business] = await query<{
      id: string;
      default_department_id: string | null;
      allow_department_picker: number;
    }>(
      `select id, default_department_id, allow_department_picker
       from businesses
       where id = ?
       limit 1`,
      [businessId]
    );

    const flags = await query<{ key: string; enabled: number }>(
      `select \`key\`, enabled from feature_flags where business_id = ?`,
      [businessId]
    );

    return {
      businessId,
      allowDepartmentPicker: business ? Boolean(business.allow_department_picker) : true,
      defaultDepartmentId: business?.default_department_id ?? null,
      featureFlags: flags.map((flag) => ({ key: flag.key, enabled: Boolean(flag.enabled) }))
    };
  }
}

export const getConfigService = (): ConfigService => new DatabaseConfigService();
