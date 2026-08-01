export type CategoriaNutricional =
  | "Lacteos"
  | "Cereales"
  | "Harinas"
  | "Postres"
  | "FrutosSecos"
  | "Aceites"
  | "Azucares";

export const CATEGORIAS_NUTRICIONALES: { value: CategoriaNutricional; label: string }[] = [
  { value: "Lacteos", label: "Lácteos" },
  { value: "Cereales", label: "Cereales" },
  { value: "Harinas", label: "Harinas" },
  { value: "Postres", label: "Postres" },
  { value: "FrutosSecos", label: "Frutos secos" },
  { value: "Aceites", label: "Aceites" },
  { value: "Azucares", label: "Azúcares" },
];

export interface Bien {
  id: number | null;
  descripcion: string;
  peso_kg: number;
  precio_centavos: number;
  stock_actual: number;
  categoria_nutricional: CategoriaNutricional;
  proximo_vencimiento: string | null;
}

export interface BienCreateRequest {
  descripcion: string;
  peso_kg: number;
  precio_centavos: number;
  categoria_nutricional: CategoriaNutricional;
}

export interface BienUpdateRequest {
  bien_id: number;
  delta: number;
}

export interface BienSetRequest {
  bien_id: number;
  value: number;
}

export interface BienActualizarRequest {
  bien_id: number;
  descripcion: string;
  precio_centavos: number;
  categoria_nutricional: CategoriaNutricional;
}
