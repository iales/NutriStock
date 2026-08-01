import { Bien } from "../../types/bien";
import {
    Card,
    Text,
    Title3,
    Badge,
    Button,
    Input,
    Avatar,
    Divider,
    makeStyles,
    tokens,
    mergeClasses,
} from "@fluentui/react-components";
import {
    BoxRegular,
    DeleteRegular,
    AddRegular,
    SubtractRegular,
    EditRegular,
    CheckmarkRegular,
} from "@fluentui/react-icons";
import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect } from "react";
import DeletedBienPopUp from "../popups/deleteBienPopUp";
import EditBienPopUp from "../popups/editBienPopUp";

const useStyles = makeStyles({
    card: {
        marginTop: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusXLarge,
    },
    content: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingHorizontalM,
    },
    info: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    precio: {
        color: tokens.colorNeutralForeground3,
    },
    right: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: tokens.spacingVerticalXS,
    },
    topRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    stockGroup: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    stockLabel: {
        color: tokens.colorNeutralForeground3,
    },
    stockInput: {
        width: "64px",
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
    vencimiento: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    vencimientoWarn: {
        color: tokens.colorPaletteMarigoldForeground1,
        fontWeight: tokens.fontWeightSemibold,
    },
    vencimientoDanger: {
        color: tokens.colorPaletteRedForeground1,
        fontWeight: tokens.fontWeightSemibold,
    },
    squareButton: {
        minWidth: "32px",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingHorizontalM,
    },
});

const estadoColorMap = {
    "Sin stock": "danger",
    "Stock bajo": "warning",
    "En stock": "success",
} as const;

const DIAS_URGENTE = 7;
const DIAS_PROXIMO = 30;

function estadoVencimiento(fechaIso: string): "danger" | "warn" | "normal" {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaIso + "T00:00:00");
    const diasRestantes = Math.round((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes <= DIAS_URGENTE) return "danger";
    if (diasRestantes <= DIAS_PROXIMO) return "warn";
    return "normal";
}

interface BienComponentProps {
    bien: Bien;
    onActualizado: (bienActualizado: Bien) => void;
    onEliminado: (id: number) => void;
}

function BienComponent(props: BienComponentProps) {
    const styles = useStyles();
    const [confirmandoModificar, setConfirmandoModificar] = useState(false);
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const [valorEdicion, setValorEdicion] = useState(props.bien.stock_actual);

    useEffect(() => {
        setValorEdicion(props.bien.stock_actual);
    }, [props.bien.stock_actual]);

    const ajustarStock = async (delta: number) => {
        try {
            const bienActualizado = await invoke<Bien>('ajustar_stock_command', {
                request: { bien_id: bien.id, delta },
            });
            setValorEdicion(bienActualizado.stock_actual);
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo ajustar el stock:", error);
        }
    };

    const cancelarEdicionStock = () => {
        setValorEdicion(props.bien.stock_actual);
    };

    const guardarStock = async () => {
        if (valorEdicion === props.bien.stock_actual) return;
        try {
            const bienActualizado = await invoke<Bien>('setear_stock_command', {
                request: { bien_id: props.bien.id, value: valorEdicion },
            });
            setValorEdicion(bienActualizado.stock_actual);
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo ajustar el stock:", error);
            setValorEdicion(props.bien.stock_actual);
        }
    };

    const precioFormateado = (props.bien.precio_centavos / 100).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
    });

    const { bien } = props;

    let estadoTexto: keyof typeof estadoColorMap;
    if (bien.stock_actual === 0) {
        estadoTexto = "Sin stock";
    } else if (bien.stock_actual < 5) {
        estadoTexto = "Stock bajo";
    } else {
        estadoTexto = "En stock";
    }

    return (
        <>
            <Card className={styles.card}>
                <div className={styles.content}>
                    <Avatar icon={<BoxRegular />} color="colorful" />

                    <div className={styles.info}>
                        <Title3>{bien.descripcion}</Title3>
                        <Text className={styles.precio}>{precioFormateado}</Text>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.topRow}>
                            <Badge color={estadoColorMap[estadoTexto]} appearance="filled">
                                {estadoTexto}
                            </Badge>

                            <div className={styles.stockGroup}>
                                <Text className={styles.stockLabel}>En depósito:</Text>
                                <Input
                                    size="small"
                                    type="number"
                                    className={styles.stockInput}
                                    value={String(valorEdicion)}
                                    onChange={(e) => setValorEdicion(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") guardarStock();
                                        if (e.key === "Escape") cancelarEdicionStock();
                                    }}
                                    onBlur={cancelarEdicionStock}
                                    input={{ className: styles.noSpinner }}
                                />
                                <Button
                                    appearance="outline"
                                    shape="square"
                                    size="small"
                                    className={styles.squareButton}
                                    icon={<SubtractRegular />}
                                    onClick={() => ajustarStock(-1)}
                                    disabled={bien.stock_actual === 0}
                                />
                                <Button
                                    appearance="outline"
                                    shape="square"
                                    size="small"
                                    className={styles.squareButton}
                                    icon={<AddRegular />}
                                    onClick={() => ajustarStock(1)}
                                />
                                {valorEdicion !== bien.stock_actual && (
                                    <Button
                                        appearance="primary"
                                        shape="square"
                                        size="small"
                                        className={styles.squareButton}
                                        icon={<CheckmarkRegular />}
                                        title="Confirmar cambio de stock"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={guardarStock}
                                    />
                                )}
                            </div>
                        </div>

                        {bien.proximo_vencimiento && (
                            <Text
                                className={mergeClasses(
                                    styles.vencimiento,
                                    estadoVencimiento(bien.proximo_vencimiento) === "danger" && styles.vencimientoDanger,
                                    estadoVencimiento(bien.proximo_vencimiento) === "warn" && styles.vencimientoWarn,
                                )}
                            >
                                Vence: {new Date(bien.proximo_vencimiento + "T00:00:00").toLocaleDateString('es-AR')}
                            </Text>
                        )}
                    </div>
                </div>

                <Divider />

                <div className={styles.actions}>
                    <Button
                        appearance="outline"
                        icon={<EditRegular />}
                        onClick={() => setConfirmandoModificar(true)}
                    >
                        Modificar
                    </Button>

                    <Button
                        appearance="outline"
                        icon={<DeleteRegular />}
                        onClick={() => setConfirmandoEliminar(true)}
                    >
                        Eliminar
                    </Button>
                </div>
            </Card>

            <DeletedBienPopUp
                bien={bien}
                open={confirmandoEliminar}
                onClose={() => setConfirmandoEliminar(false)}
                onEliminado={props.onEliminado}
            />
            <EditBienPopUp
                bien={bien}
                open={confirmandoModificar}
                onClose={() => setConfirmandoModificar(false)}
                onActualizado={props.onActualizado}
            />
        </>
    );
}

export default BienComponent;
