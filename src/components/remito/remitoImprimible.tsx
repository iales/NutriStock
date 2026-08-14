import type { CSSProperties } from "react";
import { Entrega } from "../../types/entrega";
import { DatosEmpresa } from "../../types/datosEmpresa";

function formatFecha(fechaIso: string): string {
    return new Date(fechaIso).toLocaleDateString('es-AR');
}

const CONDICION_IVA_ABREVIADA: Record<string, string> = {
    ResponsableInscripto: "R. INSC.",
    Monotributo: "MONOTRIBUTO",
    Exento: "EXENTO",
};

/**
 * El papel de Vaires Medical viene PREIMPRESO (logo, CAI, N° de remito, datos
 * fiscales del emisor, etiquetas de cada campo) por la imprenta Avalum. Esta
 * pantalla solo imprime los datos que varían por entrega, posicionados encima
 * de esa hoja en blanco — nada de membrete ni cajas propias.
 *
 * Las posiciones son una primera estimación a partir de una foto del papel
 * real, en A4 (210mm x 297mm). Van a necesitar un ajuste fino: imprimí esta
 * hoja en blanco, superponela a trasluz contra el papel preimpreso real, y
 * ajustá los mm de "POS" hasta que cada dato caiga en su casillero.
 */
const POS = {
    fecha: { top: "22mm", left: "144mm", width: "50mm" },
    senores: { top: "50mm", left: "24mm", width: "115mm" },
    iva: { top: "74mm", left: "24mm", width: "80mm" },
    cuit: { top: "74mm", left: "138mm", width: "70mm" },
    itemsInicio: { top: "97mm", left: "14mm" },
    itemsCantidadLeft: "14mm",
    itemsDescripcionLeft: "38mm",
    itemsAnchoDescripcion: "155mm",
    itemsAltoFila: "6mm",
} as const;

function campo(pos: { top: string; left: string; width?: string }): CSSProperties {
    return {
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: pos.width,
    };
}

interface RemitoImprimibleProps {
    entrega: Entrega;
    datosEmpresa: DatosEmpresa | null;
}

function RemitoImprimible(props: RemitoImprimibleProps) {
    const { entrega } = props;

    return (
        <div className="remito-imprimible">
            <style>{`
                @media screen {
                    .remito-imprimible { display: none; }
                }
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden; }
                    .remito-imprimible, .remito-imprimible * { visibility: visible; }
                    .remito-imprimible {
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 210mm;
                        height: 297mm;
                        font-family: Arial, sans-serif;
                        color: #000;
                        font-size: 11pt;
                    }
                }
            `}</style>

            <div style={campo(POS.fecha)}>{formatFecha(entrega.fecha)}</div>

            <div style={campo(POS.senores)}>{entrega.clinica.razon_social}</div>

            <div style={campo(POS.iva)}>{CONDICION_IVA_ABREVIADA[entrega.clinica.condicion_iva]}</div>

            <div style={campo(POS.cuit)}>{entrega.clinica.cuit}</div>

            <div style={{ position: "absolute", top: POS.itemsInicio.top, left: "0", width: "100%" }}>
                {entrega.items.map((item, i) => (
                    <div key={i} style={{ position: "relative", height: POS.itemsAltoFila }}>
                        <div style={{ position: "absolute", left: POS.itemsCantidadLeft, textAlign: "left" }}>
                            {item.cantidad}
                        </div>
                        <div style={{ position: "absolute", left: POS.itemsDescripcionLeft, width: POS.itemsAnchoDescripcion }}>
                            {item.bien.descripcion}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RemitoImprimible;
