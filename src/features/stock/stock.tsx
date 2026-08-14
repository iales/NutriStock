import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import {
    Title2,
    Card,
    Field,
    Dropdown,
    Option,
    Avatar,
    Input,
    Button,
    Text,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { AddRegular, SearchRegular, BoxRegular, WarningRegular, CalendarClockRegular } from "@fluentui/react-icons";
import { Bien, CATEGORIAS_NUTRICIONALES, CategoriaNutricional } from "../../types/bien";
import BienComponent, { estadoBien } from "../../components/bienComponent/bienComponent";
import CreateBienPopUp from "../../components/popups/createBienPopUp";
import Paginacion from "../../components/paginacion/paginacion";
import { usePaginacion } from "../../hooks/usePaginacion";

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
    metricsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
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
    metricSub: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    catalogoCard: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        boxShadow: tokens.shadow64,
    },
    catalogoHeader: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    catalogoContador: {
        color: tokens.colorNeutralForeground3,
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
    filtroDropdown: {
        minWidth: "160px",
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
});

type FiltroEstado = "todos" | "En stock" | "Stock bajo" | "Sin stock";
type FiltroVencimiento = "todos" | "vencido" | "proximo" | "sin_fecha";
const DIAS_PROXIMO = 30;

function diasHasta(fechaIso: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaIso + "T00:00:00");
    return Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function ControlStock() {
    const styles = useStyles();
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [creandoProducto, setCreandoProducto] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState<CategoriaNutricional | "todas">("todas");
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
    const [filtroVencimiento, setFiltroVencimiento] = useState<FiltroVencimiento>("todos");

    const creadoHandler = (nuevoBien: Bien) => {
        setBienes(prev => [...prev, nuevoBien]);
    };

    useEffect(() => {
        invoke<Bien[]>('listar_bienes_command').then(setBienes);
    }, []);

    const updateHandler = (updatedBien: Bien) => {
        setBienes(prev => prev.map(b => (b.id === updatedBien.id ? updatedBien : b)));
    };
    const deletedHandler = (id_bien: Number) => {
        setBienes(prev => prev.filter(b => b.id !== id_bien));
    };

    const productosActivos = bienes.length;
    const stockBajo = bienes.filter(b => estadoBien(b) === "Stock bajo" || estadoBien(b) === "Sin stock").length;
    const proximoVencimiento = bienes
        .filter(b => b.proximo_vencimiento !== null)
        .sort((a, b) => (a.proximo_vencimiento! < b.proximo_vencimiento! ? -1 : 1))[0] ?? null;

    const bienesFiltrados = bienes.filter(b => {
        const coincideBusqueda = b.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = filtroCategoria === "todas" || b.categoria_nutricional === filtroCategoria;
        const coincideEstado = filtroEstado === "todos" || estadoBien(b) === filtroEstado;
        let coincideVencimiento = true;
        if (filtroVencimiento === "sin_fecha") {
            coincideVencimiento = b.proximo_vencimiento === null;
        } else if (filtroVencimiento === "vencido") {
            coincideVencimiento = b.proximo_vencimiento !== null && diasHasta(b.proximo_vencimiento) < 0;
        } else if (filtroVencimiento === "proximo") {
            coincideVencimiento = b.proximo_vencimiento !== null && diasHasta(b.proximo_vencimiento) >= 0 && diasHasta(b.proximo_vencimiento) <= DIAS_PROXIMO;
        }
        return coincideBusqueda && coincideCategoria && coincideEstado && coincideVencimiento;
    });

    const hayFiltrosActivos = busqueda !== "" || filtroCategoria !== "todas" || filtroEstado !== "todos" || filtroVencimiento !== "todos";

    const paginacion = usePaginacion(bienesFiltrados);

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroCategoria("todas");
        setFiltroEstado("todos");
        setFiltroVencimiento("todos");
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div>
                    <Title2 className={styles.title}>Inventario</Title2>
                    <Text className={styles.subtitle}>Controlá el stock y la disponibilidad de tus productos.</Text>
                </div>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setCreandoProducto(true)}>
                    Nuevo producto
                </Button>
            </div>

            <div className={styles.metricsRow}>
                <Card className={styles.metricCard}>
                    <Avatar icon={<BoxRegular />} color="royal-blue" />
                    <Text className={styles.metricLabel}>Productos activos</Text>
                    <Text className={styles.metricValue}>{productosActivos}</Text>
                </Card>

                <Card className={styles.metricCard}>
                    <Avatar icon={<WarningRegular />} color="pumpkin" />
                    <Text className={styles.metricLabel}>Stock bajo</Text>
                    <Text className={styles.metricValue}>{stockBajo}</Text>
                </Card>

                <Card className={styles.metricCard}>
                    <Avatar icon={<CalendarClockRegular />} color="dark-green" />
                    <Text className={styles.metricLabel}>Próximo vencimiento</Text>
                    <Text className={styles.metricValue}>
                        {proximoVencimiento
                            ? new Date(proximoVencimiento.proximo_vencimiento + "T00:00:00").toLocaleDateString('es-AR')
                            : "Sin datos"}
                    </Text>
                    {proximoVencimiento && (
                        <Text className={styles.metricSub}>{proximoVencimiento.descripcion}</Text>
                    )}
                </Card>
            </div>

            <Card className={styles.catalogoCard}>
                <div className={styles.catalogoHeader}>
                    <Text weight="semibold">Catálogo de productos</Text>
                    <Text className={styles.catalogoContador}>{bienes.length} productos</Text>
                </div>

                {bienes.length > 0 && (
                    <div className={styles.filtrosRow}>
                        <Field label="Buscar producto" className={styles.filtroBusqueda}>
                            <Input
                                contentBefore={<SearchRegular />}
                                placeholder="Buscar…"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </Field>
                        <Field label="Categoría" className={styles.filtroDropdown}>
                            <Dropdown
                                value={filtroCategoria === "todas" ? "Todas" : CATEGORIAS_NUTRICIONALES.find(c => c.value === filtroCategoria)?.label ?? "Todas"}
                                selectedOptions={[filtroCategoria]}
                                onOptionSelect={(_, data) => {
                                    setFiltroCategoria((data.optionValue as CategoriaNutricional | "todas") ?? "todas");
                                }}
                            >
                                <Option value="todas">Todas</Option>
                                {CATEGORIAS_NUTRICIONALES.map(c => (
                                    <Option key={c.value} value={c.value}>{c.label}</Option>
                                ))}
                            </Dropdown>
                        </Field>
                        <Field label="Estado" className={styles.filtroDropdown}>
                            <Dropdown
                                value={filtroEstado === "todos" ? "Todos" : filtroEstado}
                                selectedOptions={[filtroEstado]}
                                onOptionSelect={(_, data) => {
                                    setFiltroEstado((data.optionValue as FiltroEstado) ?? "todos");
                                }}
                            >
                                <Option value="todos">Todos</Option>
                                <Option value="En stock">En stock</Option>
                                <Option value="Stock bajo">Stock bajo</Option>
                                <Option value="Sin stock">Sin stock</Option>
                            </Dropdown>
                        </Field>
                        <Field label="Vencimiento (opcional)" className={styles.filtroDropdown}>
                            <Dropdown
                                value={
                                    filtroVencimiento === "todos" ? "Todos"
                                        : filtroVencimiento === "vencido" ? "Vencido"
                                        : filtroVencimiento === "proximo" ? "Próximo a vencer"
                                        : "Sin fecha"
                                }
                                selectedOptions={[filtroVencimiento]}
                                onOptionSelect={(_, data) => {
                                    setFiltroVencimiento((data.optionValue as FiltroVencimiento) ?? "todos");
                                }}
                            >
                                <Option value="todos">Todos</Option>
                                <Option value="vencido">Vencido</Option>
                                <Option value="proximo">Próximo a vencer</Option>
                                <Option value="sin_fecha">Sin fecha</Option>
                            </Dropdown>
                        </Field>
                        {hayFiltrosActivos && (
                            <Button appearance="subtle" onClick={limpiarFiltros}>Limpiar filtros</Button>
                        )}
                    </div>
                )}

                {bienes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>Todavía no cargaste ningún producto.</Text>
                        <Button appearance="outline" icon={<AddRegular />} onClick={() => setCreandoProducto(true)}>
                            Nuevo producto
                        </Button>
                    </div>
                ) : bienesFiltrados.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>No se encontraron productos con esos filtros.</Text>
                        <Button appearance="outline" onClick={limpiarFiltros}>Limpiar filtros</Button>
                    </div>
                ) : (
                    <>
                        <table className={styles.tabla}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Producto</th>
                                    <th style={{ textAlign: "left" }}>Precio</th>
                                    <th style={{ textAlign: "left" }}>Stock disponible</th>
                                    <th style={{ textAlign: "left" }}>Estado</th>
                                    <th style={{ textAlign: "left" }}>Vencimiento</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginacion.itemsPagina.map(bien => (
                                    <BienComponent
                                        key={bien.id}
                                        bien={bien}
                                        onActualizado={updateHandler}
                                        onEliminado={deletedHandler}
                                    />
                                ))}
                            </tbody>
                        </table>

                        <Paginacion
                            desde={paginacion.desde}
                            hasta={paginacion.hasta}
                            total={paginacion.total}
                            pagina={paginacion.pagina}
                            totalPaginas={paginacion.totalPaginas}
                            porPagina={paginacion.porPagina}
                            etiqueta="productos"
                            onCambiarPagina={paginacion.setPagina}
                            onCambiarPorPagina={paginacion.setPorPagina}
                        />
                    </>
                )}
            </Card>

            <CreateBienPopUp
                open={creandoProducto}
                onClose={() => setCreandoProducto(false)}
                onCreado={creadoHandler}
            />
        </div>
    );
}

export default ControlStock;
