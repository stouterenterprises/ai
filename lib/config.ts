import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ConfigSource = "supabase";

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

export class SupabaseConfigService implements ConfigService {
  async getBusinessConfig(businessId: string): Promise<BusinessConfig> {
    const supabase = createServerSupabaseClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("id, default_department_id, allow_department_picker")
      .eq("id", businessId)
      .single();
    const { data: flags } = await supabase
      .from("feature_flags")
      .select("key, enabled")
      .eq("business_id", businessId);

    return {
      businessId,
      allowDepartmentPicker: business?.allow_department_picker ?? true,
      defaultDepartmentId: business?.default_department_id ?? null,
      featureFlags: flags ?? []
    };
  }
}

export const getConfigService = (): ConfigService => new SupabaseConfigService();
