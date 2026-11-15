import apiClient from "@/lib/apiClient";

export interface BomCalculateParams {
  plano_length: number;
  plano_width: number;
  cut_length: number;
  cut_width: number;
  target_quantity?: number;
  gsm?: number;
  waste_percent?: number;
  insheet_qty?: number;
  mode?: "best" | "tegak" | "miring";
}

export interface BomSaveParams {
  order_number?: string;
  customer_name?: string;
  brand?: string;
  product_name?: string;
  material_id?: number | null;
  paper_type?: string;
  paper_gsm: number;
  plano_length_cm: number;
  plano_width_cm: number;
  cut_length_cm: number;
  cut_width_cm: number;
  order_quantity: number;
  waste_percent?: number;
  insheet_quantity?: number;
  mode?: "best" | "tegak" | "miring";
  ink_estimate_kg?: number;
  glue_estimate_kg?: number;
  foil_length_m?: number;
  notes?: string;
}

export const bomService = {
  async calculate(params: BomCalculateParams) {
    try {
      const res = await apiClient.post("/v1/bom/calculate", params);
      return res.data?.data;
    } catch (err: any) {
      console.warn("API calculate failed, fallback to local:", err);
      return null;
    }
  },

  async save(data: BomSaveParams) {
    try {
      const res = await apiClient.post("/v1/bom", data);
      return res.data?.data;
    } catch (err: any) {
      console.error("Failed to save BOM to server:", err);
      throw err;
    }
  },

  async list(filter?: { order_number?: string; status?: string; search?: string }) {
    try {
      const params = new URLSearchParams();
      if (filter?.order_number) params.set("order_number", filter.order_number);
      if (filter?.status) params.set("status", filter.status);
      if (filter?.search) params.set("search", filter.search);

      const res = await apiClient.get(`/v1/bom?${params.toString()}`);
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async get(id: number | string) {
    const res = await apiClient.get(`/v1/bom/${id}`);
    return res.data?.data;
  },
};
