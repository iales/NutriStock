export type CondicionIva = "ResponsableInscripto" | "Monotributo" | "Exento";

export interface Clinica {
  id: number | null;
  razon_social: string;
  direccion: string;
  localidad: string;
  cuit: string;
  condicion_iva: CondicionIva;
  contacto: string | null;
}

export interface ClinicaCreateRequest {
  razon_social: string;
  direccion: string;
  localidad: string;
  cuit: string;
  condicion_iva: CondicionIva;
  contacto: string | null;
}

export interface ClinicaUpdateRequest {
  razon_social: string;
  direccion: string;
  localidad: string;
  condicion_iva: CondicionIva;
  contacto: string | null;
}
