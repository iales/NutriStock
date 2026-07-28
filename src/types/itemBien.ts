import type { Bien } from "./bien";

export interface ItemBien {
  bien: Bien;
  cantidad: number;
  precio_unitario_centavos: number;
}

export interface ItemBienRequest {
  bien_id: number;
  cantidad: number;
  precio_unitario_centavos: number | null;
}
