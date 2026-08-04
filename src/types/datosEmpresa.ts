import type { CondicionIva } from "./clinica";

export interface DatosEmpresa {
  razon_social: string;
  subtitulo: string | null;
  cuit: string;
  domicilio: string;
  email: string | null;
  condicion_iva: CondicionIva;
  ingresos_brutos: string | null;
  inicio_actividades: string | null;
}

export interface DatosEmpresaCreateRequest {
  razon_social: string;
  subtitulo: string | null;
  cuit: string;
  domicilio: string;
  email: string | null;
  condicion_iva: CondicionIva;
  ingresos_brutos: string | null;
  inicio_actividades: string | null;
}
