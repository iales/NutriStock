import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Field,
    MessageBar,
    MessageBarBody,
    Text,
    Divider,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { AutorizacionRemito } from "../../types/autorizacionRemito";
import { invoke } from "@tauri-apps/api/core";
import Input from "../common/input";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    actualCard: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground3,
    },
    actualLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        textTransform: "uppercase",
        fontWeight: tokens.fontWeightSemibold,
    },
    actualValue: {
        fontWeight: tokens.fontWeightSemibold,
    },
    actualSub: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
});

interface CreateAutorizacionRemitoProps {
    open: boolean;
    autorizacionActual: AutorizacionRemito | null;
    onClose: () => void;
    onCreado: (autorizacion: AutorizacionRemito) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function formatRango(puntoVenta: number, numeroDesde: number, numeroHasta: number): string {
    const pv = String(puntoVenta).padStart(4, "0");
    return `${pv}-${String(numeroDesde).padStart(8, "0")} a ${pv}-${String(numeroHasta).padStart(8, "0")}`;
}

function CreateAutorizacionRemitoPopUp(props: CreateAutorizacionRemitoProps) {
    const styles = useStyles();
    const [cai, setCai] = useState("");
    const [puntoVenta, setPuntoVenta] = useState(1);
    const [numeroDesde, setNumeroDesde] = useState(0);
    const [numeroHasta, setNumeroHasta] = useState(0);
    const [vencimiento, setVencimiento] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) {
            setCai("");
            setPuntoVenta(1);
            setNumeroDesde(0);
            setNumeroHasta(0);
            setVencimiento("");
            setError(null);
        }
    }, [props.open]);

    const crear = async () => {
        try {
            const nueva = await invoke<AutorizacionRemito>('registrar_autorizacion_remito_command', {
                request: {
                    cai,
                    punto_venta: puntoVenta,
                    numero_desde: numeroDesde,
                    numero_hasta: numeroHasta,
                    vencimiento,
                },
            });
            props.onCreado(nueva);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudo registrar la autorización:", appError);
            setError(appError.mensaje ?? "No se pudo registrar la autorización.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Registrar autorización de remitos (CAI)</DialogTitle>
                    <DialogContent className={styles.content}>
                        {props.autorizacionActual && (
                            <>
                                <div className={styles.actualCard}>
                                    <Text className={styles.actualLabel}>CAI actual</Text>
                                    <Text className={styles.actualValue}>{props.autorizacionActual.cai}</Text>
                                    <Text className={styles.actualSub}>
                                        Rango {formatRango(
                                            props.autorizacionActual.punto_venta,
                                            props.autorizacionActual.numero_desde,
                                            props.autorizacionActual.numero_hasta
                                        )} · Vence el {new Date(props.autorizacionActual.vencimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Text>
                                </div>
                                <Divider>Registrar una nueva autorización</Divider>
                            </>
                        )}
                        <Field label="CAI">
                            <Input
                                autoFocus
                                value={cai}
                                onChange={(e) => setCai(e.target.value)}
                            />
                        </Field>
                        <Field label="Punto de venta">
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={String(puntoVenta)}
                                onChange={(e) => setPuntoVenta(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Número desde">
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={String(numeroDesde)}
                                onChange={(e) => setNumeroDesde(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Número hasta">
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={String(numeroHasta)}
                                onChange={(e) => setNumeroHasta(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Vencimiento">
                            <Input
                                type="date"
                                value={vencimiento}
                                onChange={(e) => setVencimiento(e.target.value)}
                            />
                        </Field>
                        {error && (
                            <MessageBar intent="error">
                                <MessageBarBody>{error}</MessageBarBody>
                            </MessageBar>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={props.onClose}>Cancelar</Button>
                        <Button appearance="primary" onClick={crear}>Registrar</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default CreateAutorizacionRemitoPopUp;
