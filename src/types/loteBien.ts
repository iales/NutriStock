export interface LoteBien {
  id: number | null;
  bien_id: number;
  cantidad: number;
  vencimiento: string | null;
}

export interface LoteBienCreateRequest {
  bien_id: number;
  cantidad: number;
  vencimiento: string | null;
}
