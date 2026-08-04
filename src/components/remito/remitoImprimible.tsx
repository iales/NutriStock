import type { CSSProperties } from "react";
import { Entrega } from "../../types/entrega";
import { DatosEmpresa } from "../../types/datosEmpresa";

function formatRemito(puntoVenta: number | null, numero: number | null): string {
    if (puntoVenta === null || numero === null) return "S/N";
    return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

function formatFecha(fechaIso: string): string {
    return new Date(fechaIso).toLocaleDateString('es-AR');
}

// Texto largo para el emisor ("IVA RESPONSABLE INSCRIPTO"), abreviado para el destinatario ("R. INSC.").
const CONDICION_IVA_EMISOR: Record<string, string> = {
    ResponsableInscripto: "IVA RESPONSABLE INSCRIPTO",
    Monotributo: "IVA MONOTRIBUTO",
    Exento: "IVA EXENTO",
};

const CONDICION_IVA_ABREVIADA: Record<string, string> = {
    ResponsableInscripto: "R. INSC.",
    Monotributo: "MONOTRIBUTO",
    Exento: "EXENTO",
};

interface RemitoImprimibleProps {
    entrega: Entrega;
    datosEmpresa: DatosEmpresa | null;
}

function RemitoImprimible(props: RemitoImprimibleProps) {
    const { entrega, datosEmpresa } = props;
    const cell: CSSProperties = { padding: "2px 0" };
    const label: CSSProperties = { color: "#444", fontSize: "11px" };

    return (
        <div className="remito-imprimible" style={{ padding: "24px", fontFamily: "Arial, sans-serif", color: "#000", fontSize: "13px" }}>
            <style>{`
                @media screen {
                    .remito-imprimible { display: none; }
                }
                @media print {
                    body * { visibility: hidden; }
                    .remito-imprimible, .remito-imprimible * { visibility: visible; }
                    .remito-imprimible { display: block; position: absolute; top: 0; left: 0; width: 100%; }
                }
            `}</style>

            {/* Encabezado: emisor | caja R | datos del comprobante */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000" }}>
                <tbody>
                    <tr>
                        <td style={{ width: "42%", verticalAlign: "top", padding: "10px", borderRight: "1px solid #000" }}>
                            {datosEmpresa ? (
                                <>
                                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#2f6b4f", lineHeight: "1.2" }}>
                                        {datosEmpresa.razon_social}
                                    </div>
                                    {datosEmpresa.subtitulo && (
                                        <div style={{ fontSize: "14px", fontWeight: "normal", color: "#5f9a80", lineHeight: "1.2" }}>
                                            {datosEmpresa.subtitulo}
                                        </div>
                                    )}
                                    <div style={{ marginTop: "8px" }}>{datosEmpresa.domicilio}</div>
                                    {datosEmpresa.email && (
                                        <div>{datosEmpresa.email}</div>
                                    )}
                                    <div style={{ marginTop: "6px", fontWeight: "bold" }}>
                                        {CONDICION_IVA_EMISOR[datosEmpresa.condicion_iva]}
                                    </div>
                                </>
                            ) : (
                                <div>(datos de la empresa sin cargar)</div>
                            )}
                        </td>

                        <td style={{ width: "16%", textAlign: "center", verticalAlign: "top", padding: "10px", borderRight: "1px solid #000" }}>
                            <div style={{
                                display: "inline-block", border: "2px solid #000", borderRadius: "4px",
                                width: "40px", height: "40px", lineHeight: "40px", fontSize: "26px", fontWeight: "bold",
                                background: "#e8e8e8",
                            }}>
                                R
                            </div>
                            <div style={{ marginTop: "4px", fontSize: "10px" }}>COD. Nº 91</div>
                        </td>

                        <td style={{ width: "42%", verticalAlign: "top", padding: "10px" }}>
                            <div style={{ fontWeight: "bold", fontSize: "11px", textAlign: "right" }}>
                                DOCUMENTO NO VÁLIDO COMO FACTURA
                            </div>
                            <div style={{ marginTop: "8px", fontSize: "15px", fontWeight: "bold" }}>
                                REMITO N° {formatRemito(entrega.remito_punto_venta, entrega.remito_numero)}
                            </div>
                            <table style={{ marginTop: "8px", width: "100%" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ ...label, ...cell }}>FECHA</td>
                                        <td style={{ ...cell, textAlign: "right" }}>{formatFecha(entrega.fecha)}</td>
                                    </tr>
                                    {datosEmpresa && (
                                        <>
                                            <tr>
                                                <td style={{ ...label, ...cell }}>CUIT</td>
                                                <td style={{ ...cell, textAlign: "right" }}>{datosEmpresa.cuit}</td>
                                            </tr>
                                            {datosEmpresa.ingresos_brutos && (
                                                <tr>
                                                    <td style={{ ...label, ...cell }}>ING. BRUTOS</td>
                                                    <td style={{ ...cell, textAlign: "right" }}>{datosEmpresa.ingresos_brutos}</td>
                                                </tr>
                                            )}
                                            {datosEmpresa.inicio_actividades && (
                                                <tr>
                                                    <td style={{ ...label, ...cell }}>Inicio de Act.</td>
                                                    <td style={{ ...cell, textAlign: "right" }}>{formatFecha(datosEmpresa.inicio_actividades)}</td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Destinatario */}
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", borderTop: "none" }}>
                <tbody>
                    <tr>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #000" }}>
                            <div style={label}>Señores</div>
                            <div style={{ fontWeight: "bold" }}>{entrega.clinica.razon_social}</div>
                            <div>{entrega.clinica.direccion}</div>
                            <div>{entrega.clinica.localidad}</div>
                        </td>
                        <td style={{ padding: "8px 10px", width: "40%" }}>
                            <div style={label}>Factura N°</div>
                            <div style={{ borderBottom: "1px solid #000", minHeight: "18px" }}></div>
                            <div style={{ ...label, marginTop: "6px" }}>O/Compra N°</div>
                            <div style={{ borderBottom: "1px solid #000", minHeight: "18px" }}></div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "8px 10px", borderRight: "1px solid #000", borderTop: "1px solid #000" }}>
                            <span style={label}>I.V.A. </span>
                            <span>{CONDICION_IVA_ABREVIADA[entrega.clinica.condicion_iva]}</span>
                        </td>
                        <td style={{ padding: "8px 10px", borderTop: "1px solid #000" }}>
                            <span style={label}>CUIT </span>
                            <span>{entrega.clinica.cuit}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "24px" }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: "left", borderBottom: "1px solid #000", padding: "4px" }}>Producto</th>
                        <th style={{ textAlign: "right", borderBottom: "1px solid #000", padding: "4px" }}>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {entrega.items.map((item, i) => (
                        <tr key={i}>
                            <td style={{ padding: "4px" }}>{item.bien.descripcion}</td>
                            <td style={{ textAlign: "right", padding: "4px" }}>{item.cantidad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p style={{ marginTop: "16px" }}>Peso total: {entrega.items.reduce((acc, i) => acc + i.bien.peso_kg * i.cantidad, 0).toFixed(2)} kg</p>

            {entrega.condicion_venta && (
                <p>Condición de venta: {entrega.condicion_venta}</p>
            )}

            <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between" }}>
                <p>Firma emisor: ______________________</p>
                <p>Firma receptor: ______________________</p>
            </div>
        </div>
    );
}

export default RemitoImprimible;
