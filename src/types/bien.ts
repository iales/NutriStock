export interface Bien {
  id: number | null;
  descripcion: string;
  peso_kg: number;
  precio_centavos: number;
  stock_actual: number;
}

export interface BienCreateRequest {
  descripcion: string;
  peso_kg: number;
  precio_centavos: number;
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
  stock_actual: number;
}
