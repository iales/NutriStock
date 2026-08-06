import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import {
    Title2,
    Card,
    Field,
    Option,
    Button,
    Divider,
    Text,
    Avatar,
    Badge,
    Dropdown,
    Input,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
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
import {
    AddRegular,
    PrintRegular,
    DocumentRegular,
    ShieldCheckmarkRegular,
    BuildingRegular,
    SettingsRegular,
    EyeRegular,
    CalendarRegular,
    SearchRegular,
} from "@fluentui/react-icons";
import { Clinica } from "../../types/clinica";
import { Entrega } from "../../types/entrega";
import { AutorizacionRemito, SugerenciaRemito } from "../../types/autorizacionRemito";
import { DatosEmpresa } from "../../types/datosEmpresa";
import CreateAutorizacionRemitoPopUp from "../../components/popups/createAutorizacionRemitoPopUp";
import DatosEmpresaPopUp from "../../components/popups/datosEmpresaPopUp";
import RemitoImprimible from "../../components/remito/remitoImprimible";
import { formatRemito } from "./utils";

const useStyles = makeStyles({
    container: {
        maxWidth: "1100px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground4,
        borderRadius: tokens.borderRadiusXLarge,
        padding: tokens.spacingHorizontalXL,
    },
    title: {
        marginBottom: tokens.spacingVerticalS,
    },
    subtitle: {
        color: tokens.colorNeutralForeground3,
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
    metricsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: tokens.spacingHorizontalM,
    },
    metricCard: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingHorizontalM,
        boxShadow: tokens.shadow64,
    },
    metricLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        textTransform: "uppercase",
        fontWeight: tokens.fontWeightSemibold,
    },
    metricValue: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
    },
    statusCard: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "nowrap",
        columnGap: tokens.spacingHorizontalL,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        boxShadow: tokens.shadow64,
    },
    statusItem: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        flexShrink: 0,
        whiteSpace: "nowrap",
    },
    statusSub: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    statusSpacer: {
        flexGrow: 1,
    },
    historialCard: {
        padding: tokens.spacingHorizontalXL,
        boxShadow: tokens.shadow64,
    },
    historialHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filtrosRow: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: tokens.spacingHorizontalM,
    },
    filtroBusqueda: {
        flexGrow: 1,
        minWidth: "220px",
    },
    filtroClinica: {
        minWidth: "180px",
    },
    filtroFecha: {
        minWidth: "140px",
    },
    contadorResultados: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    tabla: {
        width: "100%",
        borderCollapse: "collapse",
        "& th, & td": {
            padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
        },
        "& thead tr": {
            backgroundColor: tokens.colorNeutralBackground2,
        },
        "& tbody tr": {
            transitionProperty: "background-color",
            transitionDuration: tokens.durationFaster,
        },
        "& tbody tr:hover": {
            backgroundColor: tokens.colorSubtleBackgroundHover,
        },
    },
    fechaCelda: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
    },
    fechaIcon: {
        color: tokens.colorNeutralForeground3,
    },
    card: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    totales: {
        color: tokens.colorPaletteGreenForeground2,
        fontWeight: tokens.fontWeightSemibold,
    },
    detalleRow: {
        display: "flex",
        justifyContent: "space-between",
    },
    detalleLabel: {
        color: tokens.colorNeutralForeground3,
    },
    accionesCelda: {
        display: "flex",
        gap: tokens.spacingHorizontalXS,
        justifyContent: "flex-end",
    },
});

function NuevaEntrega() {
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [clinicas, setClinicas] = useState<Clinica[]>([]);
    const [sugerencia, setSugerencia] = useState<SugerenciaRemito | null>(null);
    const [ultimaAutorizacion, setUltimaAutorizacion] = useState<AutorizacionRemito | null>(null);
    const [datosEmpresa, setDatosEmpresa] = useState<DatosEmpresa | null>(null);
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [mostrarPopupCai, setMostrarPopupCai] = useState(false);
    const [mostrarPopupEmpresa, setMostrarPopupEmpresa] = useState(false);
    const [entregaParaImprimir, setEntregaParaImprimir] = useState<Entrega | null>(null);
    const [entregaDetalle, setEntregaDetalle] = useState<Entrega | null>(null);
    const [mensaje] = useState<string | null>((location.state as { mensaje?: string } | null)?.mensaje ?? null);
    const [busquedaHistorial, setBusquedaHistorial] = useState("");
    const [filtroClinicaId, setFiltroClinicaId] = useState<number | "todas">("todas");
    const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
    const [filtroFechaHasta, setFiltroFechaHasta] = useState("");

    const cargarEstadoRemito = async () => {
        const nuevaSugerencia = await invoke<SugerenciaRemito>('sugerir_numero_remito_command');
        setSugerencia(nuevaSugerencia);

        const autorizaciones = await invoke<AutorizacionRemito[]>('listar_autorizaciones_remito_command');
        setUltimaAutorizacion(autorizaciones.length > 0 ? autorizaciones[0] : null);
    };

    const cargarHistorial = async () => {
        const lista = await invoke<Entrega[]>('listar_entregas_command');
        setEntregas(lista.slice().reverse());
    };

    useEffect(() => {
        invoke<Clinica[]>('listar_clinicas_command').then(setClinicas);
        invoke<DatosEmpresa | null>('obtener_datos_empresa_command').then(setDatosEmpresa);
        cargarEstadoRemito();
        cargarHistorial();
    }, []);

    useEffect(() => {
        if (location.state) {
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const caiVencido = ultimaAutorizacion ? new Date(ultimaAutorizacion.vencimiento) < new Date() : false;
    const caiEstadoTexto = !ultimaAutorizacion ? "Sin registrar" : caiVencido ? "Vencido" : "Vigente";
    const caiBadgeColor = !ultimaAutorizacion ? "informative" : caiVencido ? "danger" : "success";
    const ahora = new Date();
    const entregasEsteMes = entregas.filter(e => {
        const fecha = new Date(e.fecha);
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    }).length;
    const entregasFiltradas = entregas.filter(e => {
        const remito = formatRemito(e.remito_punto_venta, e.remito_numero);
        const coincideBusqueda = busquedaHistorial.trim() === "" ||
            e.clinica.razon_social.toLowerCase().includes(busquedaHistorial.toLowerCase()) ||
            remito.toLowerCase().includes(busquedaHistorial.toLowerCase());
        const coincideClinica = filtroClinicaId === "todas" || e.clinica.id === filtroClinicaId;
        const fecha = new Date(e.fecha);
        const coincideDesde = !filtroFechaDesde || fecha >= new Date(filtroFechaDesde + "T00:00:00");
        const coincideHasta = !filtroFechaHasta || fecha <= new Date(filtroFechaHasta + "T23:59:59");
        return coincideBusqueda && coincideClinica && coincideDesde && coincideHasta;
    });

    const hayFiltrosActivos = busquedaHistorial !== "" || filtroClinicaId !== "todas" || filtroFechaDesde !== "" || filtroFechaHasta !== "";

    const limpiarFiltros = () => {
        setBusquedaHistorial("");
        setFiltroClinicaId("todas");
        setFiltroFechaDesde("");
        setFiltroFechaHasta("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div>
                    <Title2 className={styles.title}>Entregas</Title2>
                    <Text className={styles.subtitle}>Registrá entregas y generá el remito numerado.</Text>
                </div>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => navigate('/entregas/nueva')}>
                    Nueva entrega
                </Button>
            </div>

            <div className={styles.metricsRow}>
                <Card className={styles.metricCard}>
                    <Avatar icon={<CalendarRegular />} color="dark-green" />
                    <Text className={styles.metricLabel}>Entregas este mes</Text>
                    <Text className={styles.metricValue}>{entregasEsteMes}</Text>
                </Card>

                <Card className={styles.metricCard}>
                    <Avatar icon={<DocumentRegular />} color="royal-blue" />
                    <Text className={styles.metricLabel}>Próximo remito</Text>
                    <Text className={styles.metricValue}>
                        {formatRemito(sugerencia?.punto_venta ?? null, sugerencia?.numero ?? null)}
                    </Text>
                </Card>
            </div>

            <Card className={styles.statusCard}>
                <div className={styles.statusItem}>
                    <Badge appearance="filled" color={caiBadgeColor}>
                        CAI {caiEstadoTexto}
                    </Badge>
                    {ultimaAutorizacion && (
                        <Text className={styles.statusSub}>
                            Vence el {new Date(ultimaAutorizacion.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Text>
                    )}
                </div>

                <div className={styles.statusSpacer} />

                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button appearance="subtle" icon={<SettingsRegular />}>
                            Configuración
                        </Button>
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem icon={<ShieldCheckmarkRegular />} onClick={() => setMostrarPopupCai(true)}>
                                {ultimaAutorizacion ? "Actualizar CAI" : "Registrar CAI"}
                            </MenuItem>
                            <MenuItem icon={<BuildingRegular />} onClick={() => setMostrarPopupEmpresa(true)}>
                                {datosEmpresa ? "Editar datos de la empresa" : "Cargar datos de la empresa"}
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </Card>

            {sugerencia && sugerencia.avisos.length > 0 && (
                <MessageBar intent="warning">
                    <MessageBarBody>
                        {sugerencia.avisos.map((aviso, i) => <div key={i}>{aviso}</div>)}
                    </MessageBarBody>
                </MessageBar>
            )}

            {mensaje && (
                <MessageBar intent="success">
                    <MessageBarBody>{mensaje}</MessageBarBody>
                </MessageBar>
            )}

            <Card className={styles.historialCard}>
                <Text weight="semibold">Historial de entregas</Text>

                {entregas.length > 0 && (
                    <div className={styles.filtrosRow}>
                        <Field label="Buscar por clínica o remito" className={styles.filtroBusqueda}>
                            <Input
                                contentBefore={<SearchRegular />}
                                placeholder="Buscar…"
                                value={busquedaHistorial}
                                onChange={(e) => setBusquedaHistorial(e.target.value)}
                            />
                        </Field>
                        <Field label="Clínica" className={styles.filtroClinica}>
                            <Dropdown
                                value={filtroClinicaId === "todas" ? "Todas" : (clinicas.find(c => c.id === filtroClinicaId)?.razon_social ?? "Todas")}
                                selectedOptions={[filtroClinicaId === "todas" ? "todas" : String(filtroClinicaId)]}
                                onOptionSelect={(_, data) => {
                                    setFiltroClinicaId(data.optionValue === "todas" || !data.optionValue ? "todas" : Number(data.optionValue));
                                }}
                            >
                                <Option value="todas">Todas</Option>
                                {clinicas.map(c => (
                                    <Option key={c.id} value={String(c.id)}>{c.razon_social}</Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Desde" className={styles.filtroFecha}>
                            <Input
                                type="date"
                                value={filtroFechaDesde}
                                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                            />
                        </Field>
                        <Field label="Hasta" className={styles.filtroFecha}>
                            <Input
                                type="date"
                                value={filtroFechaHasta}
                                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                            />
                        </Field>
                        {hayFiltrosActivos && (
                            <Button appearance="subtle" onClick={limpiarFiltros}>Limpiar filtros</Button>
                        )}
                    </div>
                )}

                {entregas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>Todavía no registraste ninguna entrega.</Text>
                        <Button appearance="outline" icon={<AddRegular />} onClick={() => navigate('/entregas/nueva')}>
                            Nueva entrega
                        </Button>
                    </div>
                ) : entregasFiltradas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>No se encontraron entregas con esos filtros.</Text>
                        <Button appearance="outline" onClick={limpiarFiltros}>Limpiar filtros</Button>
                    </div>
                ) : (
                <>
                <Text className={styles.contadorResultados}>
                    {entregasFiltradas.length} {entregasFiltradas.length === 1 ? "entrega encontrada" : "entregas encontradas"}
                </Text>
                <table className={styles.tabla}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Fecha</th>
                            <th style={{ textAlign: "left" }}>Clínica</th>
                            <th style={{ textAlign: "left" }}>Remito</th>
                            <th style={{ textAlign: "right" }}>Productos</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {entregasFiltradas.map(entrega => (
                            <tr key={entrega.id}>
                                <td>
                                    <div className={styles.fechaCelda}>
                                        <CalendarRegular className={styles.fechaIcon} />
                                        {new Date(entrega.fecha).toLocaleDateString('es-AR')}
                                    </div>
                                </td>
                                <td>{entrega.clinica.razon_social}</td>
                                <td>{formatRemito(entrega.remito_punto_venta, entrega.remito_numero)}</td>
                                <td style={{ textAlign: "right" }}>
                                    <Badge appearance="tint" color="informative">{entrega.items.length}</Badge>
                                </td>
                                <td>
                                    <div className={styles.accionesCelda}>
                                        <Button
                                            appearance="outline"
                                            icon={<EyeRegular />}
                                            onClick={() => setEntregaDetalle(entrega)}
                                        >
                                            Detalles
                                        </Button>
                                        <Button
                                            appearance="outline"
                                            icon={<PrintRegular />}
                                            onClick={() => setEntregaParaImprimir(entrega)}
                                        >
                                            Imprimir
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </>
                )}
            </Card>

            <Dialog
                open={entregaDetalle !== null}
                onOpenChange={(_, data) => { if (!data.open) setEntregaDetalle(null); }}
            >
                <DialogSurface className={styles.dialogSurface}>
                    <DialogBody>
                        <DialogTitle>Detalle de la entrega</DialogTitle>
                        {entregaDetalle && (
                            <DialogContent className={styles.card}>
                                <div className={styles.detalleRow}>
                                    <Text className={styles.detalleLabel}>Clínica</Text>
                                    <Text weight="semibold">{entregaDetalle.clinica.razon_social}</Text>
                                </div>
                                <div className={styles.detalleRow}>
                                    <Text className={styles.detalleLabel}>Fecha</Text>
                                    <Text>{new Date(entregaDetalle.fecha).toLocaleDateString('es-AR')}</Text>
                                </div>
                                <div className={styles.detalleRow}>
                                    <Text className={styles.detalleLabel}>Remito</Text>
                                    <Text>{formatRemito(entregaDetalle.remito_punto_venta, entregaDetalle.remito_numero)}</Text>
                                </div>
                                {entregaDetalle.condicion_venta && (
                                    <div className={styles.detalleRow}>
                                        <Text className={styles.detalleLabel}>Condición de venta</Text>
                                        <Text>{entregaDetalle.condicion_venta}</Text>
                                    </div>
                                )}

                                <Divider />

                                <table className={styles.tabla}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "left" }}>Producto</th>
                                            <th style={{ textAlign: "right" }}>Cantidad</th>
                                            <th style={{ textAlign: "right" }}>Precio unitario</th>
                                            <th style={{ textAlign: "right" }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entregaDetalle.items.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.bien.descripcion}</td>
                                                <td style={{ textAlign: "right" }}>{item.cantidad}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    {(item.precio_unitario_centavos / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    {(item.precio_unitario_centavos * item.cantidad / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <Text className={styles.totales}>
                                    Total: {(entregaDetalle.items.reduce((acc, item) => acc + item.precio_unitario_centavos * item.cantidad, 0) / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                                    {" · "}
                                    {entregaDetalle.items.reduce((acc, item) => acc + item.bien.peso_kg * item.cantidad, 0).toFixed(2)} kg
                                </Text>
                            </DialogContent>
                        )}
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setEntregaDetalle(null)}>Cerrar</Button>
                            {entregaDetalle && (
                                <Button
                                    appearance="primary"
                                    icon={<PrintRegular />}
                                    onClick={() => { setEntregaParaImprimir(entregaDetalle); setEntregaDetalle(null); }}
                                >
                                    Imprimir
                                </Button>
                            )}
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <CreateAutorizacionRemitoPopUp
                open={mostrarPopupCai}
                autorizacionActual={ultimaAutorizacion}
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
