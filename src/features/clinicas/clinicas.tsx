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
import { AddRegular, SearchRegular, BuildingRegular, ReceiptRegular, PersonProhibitedRegular } from "@fluentui/react-icons";
import { Clinica, CondicionIva } from "../../types/clinica";
import ClinicaComponent from "../../components/clinicaComponent/clinicaComponent";
import CreateClinicaPopUp from "../../components/popups/createClinicaPopUp";
import { CONDICIONES_IVA } from "../../components/popups/createClinicaPopUp";
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
    listadoCard: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        boxShadow: tokens.shadow64,
    },
    listadoHeader: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
    },
    listadoContador: {
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
        minWidth: "200px",
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

function GestionClinicas() {
    const styles = useStyles();
    const [clinicas, setClinicas] = useState<Clinica[]>([]);
    const [creandoClinica, setCreandoClinica] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [filtroCondicionIva, setFiltroCondicionIva] = useState<CondicionIva | "todas">("todas");

    useEffect(() => {
        invoke<Clinica[]>('listar_clinicas_command').then(setClinicas);
    }, []);

    const creadaHandler = (nuevaClinica: Clinica) => {
        setClinicas(prev => [...prev, nuevaClinica]);
    };

    const actualizadaHandler = (clinicaActualizada: Clinica) => {
        setClinicas(prev => prev.map(c => (c.id === clinicaActualizada.id ? clinicaActualizada : c)));
    };

    const eliminadaHandler = (id: number) => {
        setClinicas(prev => prev.filter(c => c.id !== id));
    };

    const clinicasActivas = clinicas.length;
    const responsableInscripto = clinicas.filter(c => c.condicion_iva === "ResponsableInscripto").length;
    const sinContacto = clinicas.filter(c => !c.contacto).length;

    const clinicasFiltradas = clinicas.filter(c => {
        const coincideBusqueda =
            c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.cuit.includes(busqueda) ||
            c.localidad.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCondicion = filtroCondicionIva === "todas" || c.condicion_iva === filtroCondicionIva;
        return coincideBusqueda && coincideCondicion;
    });

    const hayFiltrosActivos = busqueda !== "" || filtroCondicionIva !== "todas";

    const limpiarFiltros = () => {
        setBusqueda("");
        setFiltroCondicionIva("todas");
    };

    const paginacion = usePaginacion(clinicasFiltradas);

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div>
                    <Title2 className={styles.title}>Clínicas</Title2>
                    <Text className={styles.subtitle}>Gestioná los datos de tus clientes.</Text>
                </div>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setCreandoClinica(true)}>
                    Nueva clínica
                </Button>
            </div>

            <div className={styles.metricsRow}>
                <Card className={styles.metricCard}>
                    <Avatar icon={<BuildingRegular />} color="royal-blue" />
                    <Text className={styles.metricLabel}>Clínicas activas</Text>
                    <Text className={styles.metricValue}>{clinicasActivas}</Text>
                </Card>

                <Card className={styles.metricCard}>
                    <Avatar icon={<ReceiptRegular />} color="dark-green" />
                    <Text className={styles.metricLabel}>Responsable inscripto</Text>
                    <Text className={styles.metricValue}>{responsableInscripto}</Text>
                </Card>

                <Card className={styles.metricCard}>
                    <Avatar icon={<PersonProhibitedRegular />} color="pumpkin" />
                    <Text className={styles.metricLabel}>Sin contacto cargado</Text>
                    <Text className={styles.metricValue}>{sinContacto}</Text>
                </Card>
            </div>

            <Card className={styles.listadoCard}>
                <div className={styles.listadoHeader}>
                    <Text weight="semibold">Listado de clínicas</Text>
                    <Text className={styles.listadoContador}>{clinicas.length} clínicas</Text>
                </div>

                {clinicas.length > 0 && (
                    <div className={styles.filtrosRow}>
                        <Field label="Buscar por razón social, CUIT o localidad" className={styles.filtroBusqueda}>
                            <Input
                                contentBefore={<SearchRegular />}
                                placeholder="Buscar…"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </Field>
                        <Field label="Condición IVA" className={styles.filtroDropdown}>
                            <Dropdown
                                value={filtroCondicionIva === "todas" ? "Todas" : CONDICIONES_IVA.find(c => c.value === filtroCondicionIva)?.label ?? "Todas"}
                                selectedOptions={[filtroCondicionIva]}
                                onOptionSelect={(_, data) => {
                                    setFiltroCondicionIva((data.optionValue as CondicionIva | "todas") ?? "todas");
                                }}
                            >
                                <Option value="todas">Todas</Option>
                                {CONDICIONES_IVA.map(c => (
                                    <Option key={c.value} value={c.value}>{c.label}</Option>
                                ))}
                            </Dropdown>
                        </Field>
                        {hayFiltrosActivos && (
                            <Button appearance="subtle" onClick={limpiarFiltros}>Limpiar filtros</Button>
                        )}
                    </div>
                )}

                {clinicas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>Todavía no cargaste ninguna clínica.</Text>
                        <Button appearance="outline" icon={<AddRegular />} onClick={() => setCreandoClinica(true)}>
                            Nueva clínica
                        </Button>
                    </div>
                ) : clinicasFiltradas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text>No se encontraron clínicas con esos filtros.</Text>
                        <Button appearance="outline" onClick={limpiarFiltros}>Limpiar filtros</Button>
                    </div>
                ) : (
                    <>
                        <table className={styles.tabla}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Razón social</th>
                                    <th style={{ textAlign: "left" }}>CUIT</th>
                                    <th style={{ textAlign: "left" }}>Ubicación</th>
                                    <th style={{ textAlign: "left" }}>Condición IVA</th>
                                    <th style={{ textAlign: "left" }}>Contacto</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginacion.itemsPagina.map(clinica => (
                                    <ClinicaComponent
                                        key={clinica.id}
                                        clinica={clinica}
                                        onActualizada={actualizadaHandler}
                                        onEliminada={eliminadaHandler}
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
                            etiqueta="clínicas"
                            onCambiarPagina={paginacion.setPagina}
                            onCambiarPorPagina={paginacion.setPorPagina}
                        />
                    </>
                )}
            </Card>

            <CreateClinicaPopUp
                open={creandoClinica}
                onClose={() => setCreandoClinica(false)}
                onCreada={creadaHandler}
            />
        </div>
    );
}

export default GestionClinicas;
