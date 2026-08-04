import type { Clinica } from "./clinica";
import type { ItemBien, ItemBienRequest } from "./itemBien";

export interface Entrega {
  id: number | null;
  clinica: Clinica;
  items: ItemBien[];
  fecha: string;
  condicion_venta: string | null;
  remito_punto_venta: number | null;
  remito_numero: number | null;
}

export interface EntregaCreateRequest {
  clinica_id: number;
  items: ItemBienRequest[];
  condicion_venta: string | null;
  remito_punto_venta: number | null;
  remito_numero: number | null;
}
