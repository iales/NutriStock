import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Title2,
    Card,
    Field,
    Combobox,
    Option,
    Input,
    Button,
    Divider,
    Text,
    MessageBar,
    MessageBarBody,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { AddRegular, DeleteRegular, PrintRegular } from "@fluentui/react-icons";
import { Clinica } from "../../types/clinica";
import { Bien } from "../../types/bien";
import { Entrega } from "../../types/entrega";
import { AutorizacionRemito, SugerenciaRemito } from "../../types/autorizacionRemito";
import { DatosEmpresa } from "../../types/datosEmpresa";
import CreateAutorizacionRemitoPopUp from "../../components/popups/createAutorizacionRemitoPopUp";
import DatosEmpresaPopUp from "../../components/popups/datosEmpresaPopUp";
import RemitoImprimible from "../../components/remito/remitoImprimible";

const useStyles = makeStyles({
    container: {
        maxWidth: "700px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    title: {
        marginBottom: tokens.spacingVerticalS,
    },
    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dialogSurface: {
        maxWidth: "700px",
        width: "90vw",
    },
    topCards: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
    },
    caiCard: {
        flex: 1,
        padding: tokens.spacingHorizontalM,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    historialCard: {
        padding: tokens.spacingHorizontalXL,
    },
    tabla: {
        width: "100%",
        borderCollapse: "collapse",
    },
    card: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    itemRow: {
        display: "flex",
        alignItems: "flex-end",
        gap: tokens.spacingHorizontalS,
    },
    itemBien: {
        flexGrow: 1,
    },
    itemCantidad: {
        width: "90px",
    },
    itemPrecio: {
        width: "120px",
    },
    remitoRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
    },
    totales: {
        color: tokens.colorNeutralForeground3,
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
});

interface ItemRow {
    key: number;
    bien: Bien | null;
    busqueda: string;
    cantidad: number;
    precioOverride: number;
}

function formatRemito(puntoVenta: number | null, numero: number | null): string {
    if (puntoVenta === null || numero === null) return "sin número";
    return `${String(puntoVenta).padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
}

function crearFilaVacia(key: number): ItemRow {
    return { key, bien: null, busqueda: "", cantidad: 1, precioOverride: 0 };
}

function NuevaEntrega() {
    const styles = useStyles();
    const [clinicas, setClinicas] = useState<Clinica[]>([]);
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [busquedaClinica, setBusquedaClinica] = useState("");
    const [clinicaSeleccionada, setClinicaSeleccionada] = useState<Clinica | null>(null);
    const [items, setItems] = useState<ItemRow[]>([crearFilaVacia(0)]);
    const [condicionVenta, setCondicionVenta] = useState("");
    const [remitoPuntoVenta, setRemitoPuntoVenta] = useState("");
    const [remitoNumero, setRemitoNumero] = useState("");
    const [sugerencia, setSugerencia] = useState<SugerenciaRemito | null>(null);
    const [ultimaAutorizacion, setUltimaAutorizacion] = useState<AutorizacionRemito | null>(null);
    const [datosEmpresa, setDatosEmpresa] = useState<DatosEmpresa | null>(null);
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [mostrarPopupCai, setMostrarPopupCai] = useState(false);
    const [mostrarPopupEmpresa, setMostrarPopupEmpresa] = useState(false);
    const [entregaParaImprimir, setEntregaParaImprimir] = useState<Entrega | null>(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
    const proximoKey = useRef(1);

    const limpiarFormulario = () => {
        setClinicaSeleccionada(null);
        setBusquedaClinica("");
        setItems([crearFilaVacia(proximoKey.current++)]);
        setCondicionVenta("");
    };

    const cargarEstadoRemito = async () => {
        const nuevaSugerencia = await invoke<SugerenciaRemito>('sugerir_numero_remito_command');
        setSugerencia(nuevaSugerencia);
        setRemitoPuntoVenta(nuevaSugerencia.punto_venta !== null ? String(nuevaSugerencia.punto_venta) : "");
        setRemitoNumero(nuevaSugerencia.numero !== null ? String(nuevaSugerencia.numero) : "");

        const autorizaciones = await invoke<AutorizacionRemito[]>('listar_autorizaciones_remito_command');
        setUltimaAutorizacion(autorizaciones.length > 0 ? autorizaciones[0] : null);
    };

    const cargarHistorial = async () => {
        const lista = await invoke<Entrega[]>('listar_entregas_command');
        setEntregas(lista.slice().reverse());
    };

    useEffect(() => {
        invoke<Clinica[]>('listar_clinicas_command').then(setClinicas);
        invoke<Bien[]>('listar_bienes_command').then(setBienes);
        invoke<DatosEmpresa | null>('obtener_datos_empresa_command').then(setDatosEmpresa);
        cargarEstadoRemito();
        cargarHistorial();
    }, []);

    useEffect(() => {
        if (mostrarFormulario) {
            limpiarFormulario();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mostrarFormulario]);

    useEffect(() => {
        if (entregaParaImprimir) {
            const timer = setTimeout(() => window.print(), 100);
            return () => clearTimeout(timer);
        }
    }, [entregaParaImprimir]);

    useEffect(() => {
        const limpiar = () => setEntregaParaImprimir(null);
        window.addEventListener('afterprint', limpiar);
        return () => window.removeEventListener('afterprint', limpiar);
    }, []);

    const clinicasFiltradas = clinicas.filter(c =>
        c.razon_social.toLowerCase().includes(busquedaClinica.toLowerCase())
    );

    const actualizarFila = (key: number, cambios: Partial<ItemRow>) => {
        setItems(prev => prev.map(fila => (fila.key === key ? { ...fila, ...cambios } : fila)));
    };

    const agregarFila = () => {
        setItems(prev => [...prev, crearFilaVacia(proximoKey.current++)]);
    };

    const quitarFila = (key: number) => {
        setItems(prev => prev.filter(fila => fila.key !== key));
    };

    const filasValidas = items.filter(fila => fila.bien !== null && fila.cantidad > 0);

    const totalCentavos = filasValidas.reduce((acc, fila) => {
        const precio = fila.precioOverride || fila.bien!.precio_centavos;
        return acc + precio * fila.cantidad;
    }, 0);

    const totalPesoKg = filasValidas.reduce((acc, fila) => acc + fila.bien!.peso_kg * fila.cantidad, 0);

    const totalFormateado = (totalCentavos / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

    const confirmar = async () => {
        if (!clinicaSeleccionada) {
            setMensaje({ tipo: "error", texto: "Elegí una clínica." });
            return;
        }
        if (filasValidas.length === 0) {
            setMensaje({ tipo: "error", texto: "Agregá al menos un producto con cantidad mayor a cero." });
            return;
        }

        try {
            await invoke('crear_entrega_command', {
                request: {
                    clinica_id: clinicaSeleccionada.id,
                    items: filasValidas.map(fila => ({
                        bien_id: fila.bien!.id,
                        cantidad: fila.cantidad,
                        precio_unitario_centavos: fila.precioOverride || null,
                    })),
                    condicion_venta: condicionVenta || null,
                    remito_punto_venta: remitoPuntoVenta ? Number(remitoPuntoVenta) : null,
                    remito_numero: remitoNumero ? Number(remitoNumero) : null,
                },
            });

            setMensaje({ tipo: "success", texto: `Entrega registrada para "${clinicaSeleccionada.razon_social}".` });
            limpiarFormulario();
            setMostrarFormulario(false);
            await cargarEstadoRemito();
            await cargarHistorial();
        } catch (error) {
            console.error("No se pudo registrar la entrega:", error);
            setMensaje({ tipo: "error", texto: "No se pudo registrar la entrega." });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <Title2 className={styles.title}>Entregas</Title2>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setMostrarFormulario(true)}>
                    Nueva entrega
                </Button>
            </div>

            <div className={styles.topCards}>
                <Card className={styles.caiCard}>
                    <div>
                        <Text weight="semibold">
                            Próximo remito sugerido: {formatRemito(sugerencia?.punto_venta ?? null, sugerencia?.numero ?? null)}
                        </Text>
                        {ultimaAutorizacion && (
                            <Text className={styles.totales} block>
                                {" "}· CAI {ultimaAutorizacion.cai} vence {ultimaAutorizacion.vencimiento}
                            </Text>
                        )}
                    </div>
                    <Button appearance="outline" onClick={() => setMostrarPopupCai(true)}>Registrar nuevo CAI</Button>
                </Card>

                <Card className={styles.caiCard}>
                    <div>
                        <Text weight="semibold">
                            {datosEmpresa ? datosEmpresa.razon_social : "Datos de la empresa sin cargar"}
                        </Text>
                    </div>
                    <Button appearance="outline" onClick={() => setMostrarPopupEmpresa(true)}>
                        {datosEmpresa ? "Editar" : "Cargar datos"}
                    </Button>
                </Card>
            </div>

            {sugerencia && sugerencia.avisos.length > 0 && (
                <MessageBar intent="warning">
                    <MessageBarBody>
                        {sugerencia.avisos.map((aviso, i) => <div key={i}>{aviso}</div>)}
                    </MessageBarBody>
                </MessageBar>
            )}

            {mensaje && (
                <MessageBar intent={mensaje.tipo === "success" ? "success" : "error"}>
                    <MessageBarBody>{mensaje.texto}</MessageBarBody>
                </MessageBar>
            )}

            <Dialog
                open={mostrarFormulario}
                onOpenChange={(_, data) => { if (!data.open) setMostrarFormulario(false); }}
            >
            <DialogSurface className={styles.dialogSurface}>
            <DialogBody>
            <DialogTitle>Nueva entrega</DialogTitle>
            <DialogContent className={styles.card}>
                <Field label="Clínica">
                    <Combobox
                        freeform
                        placeholder="Buscar clínica…"
                        value={clinicaSeleccionada ? clinicaSeleccionada.razon_social : busquedaClinica}
                        onChange={(e) => {
                            setBusquedaClinica(e.target.value);
                            setClinicaSeleccionada(null);
                        }}
                        onOptionSelect={(_, data) => {
                            const clinica = clinicas.find(c => String(c.id) === data.optionValue);
                            if (clinica) {
                                setClinicaSeleccionada(clinica);
                                setBusquedaClinica(clinica.razon_social);
                            }
                        }}
                    >
                        {clinicasFiltradas.map(c => (
                            <Option key={c.id} value={String(c.id)}>{c.razon_social}</Option>
                        ))}
                    </Combobox>
                </Field>

                <Divider />

                <Text weight="semibold">Productos</Text>

                {items.map(fila => {
                    const bienesFiltrados = bienes.filter(b =>
                        b.descripcion.toLowerCase().includes(fila.busqueda.toLowerCase())
                    );

                    return (
                        <div key={fila.key} className={styles.itemRow}>
                            <Field label="Producto" className={styles.itemBien}>
                                <Combobox
                                    freeform
                                    placeholder="Buscar producto…"
                                    value={fila.bien ? fila.bien.descripcion : fila.busqueda}
                                    onChange={(e) => actualizarFila(fila.key, { busqueda: e.target.value, bien: null })}
                                    onOptionSelect={(_, data) => {
                                        const bien = bienes.find(b => String(b.id) === data.optionValue);
                                        if (bien) actualizarFila(fila.key, { bien, busqueda: bien.descripcion });
                                    }}
                                >
                                    {bienesFiltrados.map(b => (
                                        <Option key={b.id} value={String(b.id)}>{b.descripcion}</Option>
                                    ))}
                                </Combobox>
                            </Field>

                            <Field label="Cantidad" className={styles.itemCantidad}>
                                <Input
                                    type="number"
                                    value={String(fila.cantidad)}
                                    onChange={(e) => actualizarFila(fila.key, { cantidad: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    input={{ className: styles.noSpinner }}
                                />
                            </Field>

                            <Field label="Precio (opcional)" className={styles.itemPrecio}>
                                <Input
                                    type="number"
                                    value={String(fila.precioOverride)}
                                    onChange={(e) => actualizarFila(fila.key, { precioOverride: Number(e.target.value) })}
                                    onFocus={(e) => e.target.select()}
                                    input={{ className: styles.noSpinner }}
                                />
                            </Field>

                            <Button
                                appearance="outline"
                                shape="square"
                                icon={<DeleteRegular />}
                                onClick={() => quitarFila(fila.key)}
                                disabled={items.length === 1}
                            />
                        </div>
                    );
                })}

                <Button appearance="subtle" icon={<AddRegular />} onClick={agregarFila}>
                    Agregar producto
                </Button>

                <Text className={styles.totales}>
                    Total: {totalFormateado} · {totalPesoKg.toFixed(2)} kg
                </Text>

                <Divider />

                <div className={styles.remitoRow}>
                    <Field label="Punto de venta">
                        <Input
                            type="number"
                            value={remitoPuntoVenta}
                            onChange={(e) => setRemitoPuntoVenta(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            input={{ className: styles.noSpinner }}
                        />
                    </Field>
                    <Field label="Número de remito">
                        <Input
                            type="number"
                            value={remitoNumero}
                            onChange={(e) => setRemitoNumero(e.target.value)}
                            onFocus={(e) => e.target.select()}
                            input={{ className: styles.noSpinner }}
                        />
                    </Field>
                </div>

                <Field label="Condición de venta (opcional)">
                    <Input
                        value={condicionVenta}
                        onChange={(e) => setCondicionVenta(e.target.value)}
                    />
                </Field>

            </DialogContent>
            <DialogActions>
                <Button appearance="secondary" onClick={() => setMostrarFormulario(false)}>Cancelar</Button>
                <Button appearance="primary" onClick={confirmar}>Confirmar entrega</Button>
            </DialogActions>
            </DialogBody>
            </DialogSurface>
            </Dialog>

            <Card className={styles.historialCard}>
                <Text weight="semibold">Historial de entregas</Text>
                <table className={styles.tabla}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Fecha</th>
                            <th style={{ textAlign: "left" }}>Clínica</th>
                            <th style={{ textAlign: "left" }}>Remito</th>
                            <th style={{ textAlign: "right" }}>Ítems</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {entregas.map(entrega => (
                            <tr key={entrega.id}>
                                <td>{new Date(entrega.fecha).toLocaleDateString('es-AR')}</td>
                                <td>{entrega.clinica.razon_social}</td>
                                <td>{formatRemito(entrega.remito_punto_venta, entrega.remito_numero)}</td>
                                <td style={{ textAlign: "right" }}>{entrega.items.length}</td>
                                <td>
                                    <Button
                                        appearance="subtle"
                                        icon={<PrintRegular />}
                                        onClick={() => setEntregaParaImprimir(entrega)}
                                    >
                                        Imprimir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <CreateAutorizacionRemitoPopUp
                open={mostrarPopupCai}
                onClose={() => setMostrarPopupCai(false)}
                onCreado={() => cargarEstadoRemito()}
            />

            <DatosEmpresaPopUp
                open={mostrarPopupEmpresa}
                datosActuales={datosEmpresa}
                onClose={() => setMostrarPopupEmpresa(false)}
                onGuardado={setDatosEmpresa}
            />

            {entregaParaImprimir && (
                <RemitoImprimible entrega={entregaParaImprimir} datosEmpresa={datosEmpresa} />
            )}
        </div>
    );
}

export default NuevaEntrega;
