import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
    Title2,
    Card,
    Field,
    Combobox,
    Option,
    Button,
    Divider,
    Text,
    Badge,
    Spinner,
    MessageBar,
    MessageBarBody,
    MessageBarActions,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { AddRegular, DeleteRegular } from "@fluentui/react-icons";
import { Clinica } from "../../types/clinica";
import { Bien } from "../../types/bien";
import { AutorizacionRemito, SugerenciaRemito } from "../../types/autorizacionRemito";
import { AppErrorShape, formatRemito } from "./utils";
import CreateAutorizacionRemitoPopUp from "../../components/popups/createAutorizacionRemitoPopUp";
import Input from "../../components/common/input";

const useStyles = makeStyles({
    container: {
        maxWidth: "1100px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    breadcrumb: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    breadcrumbLink: {
        cursor: "pointer",
        ":hover": {
            color: tokens.colorBrandForeground1,
        },
    },
    breadcrumbActual: {
        color: tokens.colorNeutralForeground1,
        fontWeight: tokens.fontWeightSemibold,
    },
    titleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        display: "block",
        marginBottom: tokens.spacingVerticalS,
    },
    subtitle: {
        display: "block",
        color: tokens.colorNeutralForeground3,
    },
    statusCard: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        columnGap: tokens.spacingHorizontalXXL,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        boxShadow: tokens.shadow64,
    },
    statusItem: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXXS,
    },
    statusLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        textTransform: "uppercase",
        fontWeight: tokens.fontWeightSemibold,
    },
    statusValue: {
        fontWeight: tokens.fontWeightSemibold,
    },
    layout: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: tokens.spacingHorizontalM,
        alignItems: "start",
    },
    formCard: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        boxShadow: tokens.shadow64,
    },
    sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    sectionBar: {
        width: "4px",
        height: "18px",
        backgroundColor: tokens.colorBrandBackground,
        borderRadius: tokens.borderRadiusSmall,
        flexShrink: 0,
    },
    itemGroup: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    itemRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
        alignItems: "flex-end",
    },
    itemBien: {
        minWidth: 'min-content',
    },
    itemCantidad: {
        flexShrink: 0,
    },
    itemPrecio: {
        flexShrink: 0,
    },
    itemEliminar: {
        flexShrink: 0,
    },
    stockHint: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    stockAviso: {
        color: tokens.colorPaletteMarigoldForeground1,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
    },
    remitoRow: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
    },
    totales: {
        color: tokens.colorPaletteGreenForeground2,
        fontWeight: tokens.fontWeightSemibold,
    },
    resumenCard: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        boxShadow: tokens.shadow64,
    },
    resumenRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    resumenLabel: {
        color: tokens.colorNeutralForeground3,
    },
    actionBar: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalM,
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

function crearFilaVacia(key: number): ItemRow {
    return { key, bien: null, busqueda: "", cantidad: 1, precioOverride: 0 };
}

function NuevaEntregaPage() {
    const styles = useStyles();
    const navigate = useNavigate();
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
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [mostrarPopupCai, setMostrarPopupCai] = useState(false);
    const proximoKey = useRef(1);

    const cargarEstadoRemito = async () => {
        const nuevaSugerencia = await invoke<SugerenciaRemito>('sugerir_numero_remito_command');
        setSugerencia(nuevaSugerencia);
        setRemitoPuntoVenta(nuevaSugerencia.punto_venta !== null ? String(nuevaSugerencia.punto_venta) : "");
        setRemitoNumero(nuevaSugerencia.numero !== null ? String(nuevaSugerencia.numero) : "");

        const autorizaciones = await invoke<AutorizacionRemito[]>('listar_autorizaciones_remito_command');
        setUltimaAutorizacion(autorizaciones.length > 0 ? autorizaciones[0] : null);
    };

    useEffect(() => {
        invoke<Clinica[]>('listar_clinicas_command').then(setClinicas);
        invoke<Bien[]>('listar_bienes_command').then(setBienes);
        cargarEstadoRemito();
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
        const precio = fila.precioOverride > 0 ? Math.round(fila.precioOverride * 100) : fila.bien!.precio_centavos;
        return acc + precio * fila.cantidad;
    }, 0);

    const totalPesoKg = filasValidas.reduce((acc, fila) => acc + fila.bien!.peso_kg * fila.cantidad, 0);
    const totalUnidades = filasValidas.reduce((acc, fila) => acc + fila.cantidad, 0);
    const totalFormateado = (totalCentavos / 100).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    const totalPesoFormateado = totalPesoKg.toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    const caiVencido = ultimaAutorizacion ? new Date(ultimaAutorizacion.vencimiento) < new Date() : false;
    const caiEstadoTexto = !ultimaAutorizacion ? "Sin registrar" : caiVencido ? "Vencido" : "Vigente";
    const caiBadgeColor = !ultimaAutorizacion ? "informative" : caiVencido ? "danger" : "success";

    const confirmar = async () => {
        if (!clinicaSeleccionada) {
            setError("Elegí una clínica.");
            return;
        }

        const filaInvalida = items.find(fila => fila.bien !== null && fila.cantidad <= 0);
        if (filaInvalida) {
            setError(`"${filaInvalida.bien!.descripcion}" tiene una cantidad inválida — corregila o quitá esa fila.`);
            return;
        }

        if (filasValidas.length === 0) {
            setError("Agregá al menos un producto con cantidad mayor a cero.");
            return;
        }

        setEnviando(true);
        try {
            await invoke('crear_entrega_command', {
                request: {
                    clinica_id: clinicaSeleccionada.id,
                    items: filasValidas.map(fila => ({
                        bien_id: fila.bien!.id,
                        cantidad: fila.cantidad,
                        precio_unitario_centavos: fila.precioOverride > 0 ? Math.round(fila.precioOverride * 100) : null,
                    })),
                    condicion_venta: condicionVenta || null,
                    remito_punto_venta: remitoPuntoVenta ? Number(remitoPuntoVenta) : null,
                    remito_numero: remitoNumero ? Number(remitoNumero) : null,
                },
            });

            navigate('/entregas', {
                state: { mensaje: `Entrega registrada para "${clinicaSeleccionada.razon_social}".` },
            });
        } catch (err) {
            const appError = err as AppErrorShape;
            console.error("No se pudo registrar la entrega:", appError);
            setError(appError.mensaje ?? "No se pudo registrar la entrega.");
            setEnviando(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumb}>
                <Text className={styles.breadcrumbLink} onClick={() => navigate('/entregas')}>Entregas</Text>
                <Text>/</Text>
                <Text className={styles.breadcrumbActual}>Nueva entrega</Text>
            </div>

            <div className={styles.titleRow}>
                <div>
                    <Title2 className={styles.title}>Nueva entrega</Title2>
                    <Text className={styles.subtitle}>Completá los datos para registrar un envío y generar el remito.</Text>
                </div>
            </div>

            <Card className={styles.statusCard}>
                <div className={styles.statusItem}>
                    <Text className={styles.statusLabel}>Próximo remito</Text>
                    <Text className={styles.statusValue}>
                        {formatRemito(sugerencia?.punto_venta ?? null, sugerencia?.numero ?? null)}
                    </Text>
                </div>
                <div className={styles.statusItem}>
                    <Text className={styles.statusLabel}>CAI</Text>
                    <Badge appearance="filled" color={caiBadgeColor}>
                        CAI {caiEstadoTexto}
                    </Badge>
                </div>
                {ultimaAutorizacion && (
                    <div className={styles.statusItem}>
                        <Text className={styles.statusLabel}>Vencimiento</Text>
                        <Text className={styles.statusValue}>
                            {new Date(ultimaAutorizacion.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    </div>
                )}
            </Card>

            {sugerencia && sugerencia.avisos.length > 0 && (
                <MessageBar intent="warning">
                    <MessageBarBody>
                        {sugerencia.avisos.map((aviso, i) => <div key={i}>{aviso}</div>)}
                    </MessageBarBody>
                    <MessageBarActions>
                        <Button appearance="outline" size="small" onClick={() => setMostrarPopupCai(true)}>
                            {ultimaAutorizacion ? "Actualizar CAI" : "Registrar CAI"}
                        </Button>
                    </MessageBarActions>
                </MessageBar>
            )}

            {error && (
                <MessageBar intent="error">
                    <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
            )}

            <div className={styles.layout}>
                <Card className={styles.formCard}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionBar} />
                        <Text weight="semibold">Datos de la entrega</Text>
                    </div>

                    <Field label="Clínica / centro de destino">
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

                    <Field label="Condición de venta (opcional)">
                        <Input
                            value={condicionVenta}
                            onChange={(e) => setCondicionVenta(e.target.value)}
                        />
                    </Field>

                    <Divider />

                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionBar} />
                        <Text weight="semibold">Productos a enviar</Text>
                    </div>

                    {items.map(fila => {
                        const bienesFiltrados = bienes.filter(b =>
                            b.descripcion.toLowerCase().includes(fila.busqueda.toLowerCase())
                        );

                        const excedeStock = fila.bien !== null && fila.cantidad > fila.bien.stock_actual;

                        return (
                            <div key={fila.key} className={styles.itemGroup}>
                                <div className={styles.itemRow}>
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
                                                <Option key={b.id} value={String(b.id)} text={b.descripcion}>
                                                    {b.descripcion} · Stock: {b.stock_actual}
                                                </Option>
                                            ))}
                                        </Combobox>
                                    </Field>

                                    <Field label="Cantidad" className={styles.itemCantidad}>
                                        <Input
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={String(fila.cantidad)}
                                            onChange={(e) => actualizarFila(fila.key, { cantidad: Number(e.target.value) })}
                                            onFocus={(e) => e.target.select()}
                                            input={{ className: styles.noSpinner }}
                                        />
                                    </Field>

                                    <Field label="Precio (opcional)" className={styles.itemPrecio}>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            contentBefore="$"
                                            value={String(fila.precioOverride)}
                                            onChange={(e) => actualizarFila(fila.key, { precioOverride: Number(e.target.value) })}
                                            onFocus={(e) => e.target.select()}
                                            input={{ className: styles.noSpinner }}
                                        />
                                    </Field>

                                    <Button
                                        className={styles.itemEliminar}
                                        appearance="outline"
                                        shape="square"
                                        icon={<DeleteRegular />}
                                        aria-label="Quitar producto"
                                        onClick={() => quitarFila(fila.key)}
                                        disabled={items.length === 1}
                                    />
                                </div>

                                {fila.bien && (
                                    <Text className={excedeStock ? styles.stockAviso : styles.stockHint}>
                                        {excedeStock
                                            ? `Solo hay ${fila.bien.stock_actual} disponibles`
                                            : `Disponible: ${fila.bien.stock_actual}`}
                                    </Text>
                                )}
                            </div>
                        );
                    })}

                    <Button appearance="subtle" icon={<AddRegular />} onClick={agregarFila}>
                        Agregar producto
                    </Button>

                    <Text className={styles.totales}>
                        Total: {totalFormateado} · {totalPesoFormateado} kg
                    </Text>

                    <Divider />

                    <div className={styles.remitoRow}>
                        <Field label="Punto de venta">
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={remitoPuntoVenta}
                                onChange={(e) => setRemitoPuntoVenta(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Número de remito">
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={remitoNumero}
                                onChange={(e) => setRemitoNumero(e.target.value)}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                    </div>
                </Card>

                <Card className={styles.resumenCard}>
                    <Text weight="semibold">Resumen de entrega</Text>

                    <div className={styles.resumenRow}>
                        <Text className={styles.resumenLabel}>Clínica destino</Text>
                        <Text weight="semibold">{clinicaSeleccionada ? clinicaSeleccionada.razon_social : "Sin seleccionar"}</Text>
                    </div>
                    <div className={styles.resumenRow}>
                        <Text className={styles.resumenLabel}>Fecha</Text>
                        <Text>{new Date().toLocaleDateString('es-AR')}</Text>
                    </div>
                    <Divider />
                    <div className={styles.resumenRow}>
                        <Text className={styles.resumenLabel}>Total productos</Text>
                        <Text weight="semibold">{filasValidas.length}</Text>
                    </div>
                    <div className={styles.resumenRow}>
                        <Text className={styles.resumenLabel}>Total unidades</Text>
                        <Text weight="semibold">{totalUnidades} uds.</Text>
                    </div>
                </Card>
            </div>

            <div className={styles.actionBar}>
                <Button appearance="secondary" onClick={() => navigate('/entregas')} disabled={enviando}>
                    Cancelar
                </Button>
                <Button
                    appearance="primary"
                    icon={enviando ? <Spinner size="tiny" /> : undefined}
                    onClick={confirmar}
                    disabled={enviando}
                >
                    {enviando ? "Emitiendo…" : "Emitir entrega"}
                </Button>
            </div>

            <CreateAutorizacionRemitoPopUp
                open={mostrarPopupCai}
                autorizacionActual={ultimaAutorizacion}
                onClose={() => setMostrarPopupCai(false)}
                onCreado={() => cargarEstadoRemito()}
            />
        </div>
    );
}

export default NuevaEntregaPage;
