export interface AutorizacionRemito {
  id: number | null;
  cai: string;
  punto_venta: number;
  numero_desde: number;
  numero_hasta: number;
  vencimiento: string;
}

export interface AutorizacionRemitoCreateRequest {
  cai: string;
  punto_venta: number;
  numero_desde: number;
  numero_hasta: number;
  vencimiento: string;
}

export interface SugerenciaRemito {
  punto_venta: number | null;
  numero: number | null;
  avisos: string[];
}
