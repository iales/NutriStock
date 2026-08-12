import { Bien } from "../../types/bien";
import {
    Text,
    Badge,
    Button,
    Input,
    makeStyles,
    tokens,
    mergeClasses,
} from "@fluentui/react-components";
import {
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
    precio: {
        color: tokens.colorNeutralForeground3,
    },
    stockGroup: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
    },
    stockInput: {
        width: "56px",
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
        minWidth: "28px",
    },
    acciones: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalXS,
    },
});

export const estadoColorMap = {
    "Sin stock": "danger",
    "Stock bajo": "warning",
    "En stock": "success",
} as const;

export const UMBRAL_STOCK_BAJO = 5;

const DIAS_URGENTE = 7;
const DIAS_PROXIMO = 30;

export function estadoBien(bien: Bien): keyof typeof estadoColorMap {
    if (bien.stock_actual === 0) return "Sin stock";
    if (bien.stock_actual < UMBRAL_STOCK_BAJO) return "Stock bajo";
    return "En stock";
}

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
    const estadoTexto = estadoBien(bien);

    return (
        <>
            <tr>
                <td>
                    <Text weight="semibold">{bien.descripcion}</Text>
                </td>
                <td>
                    <Text className={styles.precio}>{precioFormateado}</Text>
                </td>
                <td>
                    <div className={styles.stockGroup}>
                        <Button
                            appearance="outline"
                            shape="square"
                            size="small"
                            className={styles.squareButton}
                            icon={<SubtractRegular />}
                            aria-label="Restar una unidad"
                            onClick={() => ajustarStock(-1)}
                            disabled={bien.stock_actual === 0}
                        />
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
                            icon={<AddRegular />}
                            aria-label="Sumar una unidad"
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
                                aria-label="Confirmar cambio de stock"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={guardarStock}
                            />
                        )}
                    </div>
                </td>
                <td>
                    <Badge color={estadoColorMap[estadoTexto]} appearance="filled">
                        {estadoTexto}
                    </Badge>
                </td>
                <td>
                    {bien.proximo_vencimiento ? (
                        <Text
                            className={mergeClasses(
                                styles.vencimiento,
                                estadoVencimiento(bien.proximo_vencimiento) === "danger" && styles.vencimientoDanger,
                                estadoVencimiento(bien.proximo_vencimiento) === "warn" && styles.vencimientoWarn,
                            )}
                        >
                            {new Date(bien.proximo_vencimiento + "T00:00:00").toLocaleDateString('es-AR')}
                        </Text>
                    ) : (
                        <Text className={styles.vencimiento}>Sin fecha</Text>
                    )}
                </td>
                <td>
                    <div className={styles.acciones}>
                        <Button
                            appearance="outline"
                            shape="square"
                            icon={<EditRegular />}
                            aria-label="Modificar producto"
                            title="Modificar"
                            onClick={() => setConfirmandoModificar(true)}
                        />
                        <Button
                            appearance="outline"
                            shape="square"
                            icon={<DeleteRegular />}
                            aria-label="Eliminar producto"
                            title="Eliminar"
                            onClick={() => setConfirmandoEliminar(true)}
                        />
                    </div>
                </td>
            </tr>

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
