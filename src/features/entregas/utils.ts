export interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

export function formatRemito(puntoVenta: number | null, numero: number | null): string {
    if (puntoVenta === null || numero === null) return "sin número";
    return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}
