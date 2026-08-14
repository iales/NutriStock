import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Title2,
    Card,
    Field,
    Combobox,
    Option,
    Input,
    Button,
    Text,
    Divider,
    Spinner,
    MessageBar,
    MessageBarBody,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { ArrowDownloadRegular } from "@fluentui/react-icons";
import { Bien } from "../../types/bien";

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
    resumenResultado: {
        color: tokens.colorPaletteGreenForeground2,
    },
    resumenVacio: {
        color: tokens.colorNeutralForeground3,
    },
    actionBar: {
        display: "flex",
        justifyContent: "flex-end",
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
});

function Entradas() {
    const styles = useStyles();
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [bienSeleccionado, setBienSeleccionado] = useState<Bien | null>(null);
    const [cantidad, setCantidad] = useState(0);
    const [vencimiento, setVencimiento] = useState("");
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        invoke<Bien[]>('listar_bienes_command').then(setBienes);
    }, []);

    const bienesFiltrados = bienes.filter(b =>
        b.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const confirmar = async () => {
        if (!bienSeleccionado || cantidad <= 0) {
            setMensaje({ tipo: "error", texto: "Elegí un producto y una cantidad mayor a cero." });
            return;
        }

        setEnviando(true);
        try {
            await invoke('recibir_lote_command', {
                request: {
                    bien_id: bienSeleccionado.id,
                    cantidad,
                    vencimiento: vencimiento || null,
                },
            });
            setMensaje({ tipo: "success", texto: `Se cargaron ${cantidad} u. de "${bienSeleccionado.descripcion}".` });
            setBusqueda("");
            setBienSeleccionado(null);
            setCantidad(0);
            setVencimiento("");
            const actualizados = await invoke<Bien[]>('listar_bienes_command');
            setBienes(actualizados);
        } catch (error) {
            console.error("No se pudo registrar la entrada:", error);
            setMensaje({ tipo: "error", texto: "No se pudo registrar la entrada." });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className={styles.container}>
            <Title2 className={styles.title}>Entradas</Title2>
            <Text className={styles.subtitle}>Registrá el ingreso de stock a tu depósito.</Text>

            {mensaje && (
                <MessageBar intent={mensaje.tipo === "success" ? "success" : "error"}>
                    <MessageBarBody>{mensaje.texto}</MessageBarBody>
                </MessageBar>
            )}

            <div className={styles.layout}>
                <Card className={styles.formCard}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionBar} />
                        <Text weight="semibold">Datos de la entrada</Text>
                    </div>

                    <Field label="Producto">
                        <Combobox
                            freeform
                            placeholder="Buscar producto…"
                            value={bienSeleccionado ? bienSeleccionado.descripcion : busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setBienSeleccionado(null);
                            }}
                            onOptionSelect={(_, data) => {
                                const bien = bienes.find(b => String(b.id) === data.optionValue);
                                if (bien) {
                                    setBienSeleccionado(bien);
                                    setBusqueda(bien.descripcion);
                                }
                            }}
                        >
                            {bienesFiltrados.map(b => (
                                <Option key={b.id} value={String(b.id)} text={b.descripcion}>
                                    {b.descripcion} · Stock: {b.stock_actual}
                                </Option>
                            ))}
                        </Combobox>
                    </Field>

                    <Field label="Cantidad">
                        <Input
                            type="number"
                            value={String(cantidad)}
                            onChange={(e) => setCantidad(Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            input={{ className: styles.noSpinner }}
                        />
                    </Field>

                    <Field label="Vencimiento (opcional)" hint="Si no lo sabés, dejalo vacío y cargá igual.">
                        <Input
                            type="date"
                            value={vencimiento}
                            onChange={(e) => setVencimiento(e.target.value)}
                        />
                    </Field>

                    <div className={styles.actionBar}>
                        <Button
                            appearance="primary"
                            icon={enviando ? <Spinner size="tiny" /> : <ArrowDownloadRegular />}
                            onClick={confirmar}
                            disabled={enviando}
                        >
                            {enviando ? "Confirmando…" : "Confirmar entrada"}
                        </Button>
                    </div>
                </Card>

                <Card className={styles.resumenCard}>
                    <Text weight="semibold">Resumen</Text>

                    {bienSeleccionado ? (
                        <>
                            <div className={styles.resumenRow}>
                                <Text className={styles.resumenLabel}>Producto</Text>
                                <Text weight="semibold">{bienSeleccionado.descripcion}</Text>
                            </div>
                            <div className={styles.resumenRow}>
                                <Text className={styles.resumenLabel}>Stock actual</Text>
                                <Text>{bienSeleccionado.stock_actual}</Text>
                            </div>
                            <Divider />
                            <div className={styles.resumenRow}>
                                <Text className={styles.resumenLabel}>Cantidad a ingresar</Text>
                                <Text weight="semibold">+{cantidad > 0 ? cantidad : 0}</Text>
                            </div>
                            <div className={styles.resumenRow}>
                                <Text className={styles.resumenLabel}>Stock resultante</Text>
                                <Text weight="semibold" className={styles.resumenResultado}>
                                    {bienSeleccionado.stock_actual + (cantidad > 0 ? cantidad : 0)}
                                </Text>
                            </div>
                            {vencimiento && (
                                <div className={styles.resumenRow}>
                                    <Text className={styles.resumenLabel}>Vencimiento</Text>
                                    <Text>{new Date(vencimiento + "T00:00:00").toLocaleDateString('es-AR')}</Text>
                                </div>
                            )}
                        </>
                    ) : (
                        <Text className={styles.resumenVacio}>Elegí un producto para ver el resumen.</Text>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Entradas;
