import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Field,
    Input,
    MessageBar,
    MessageBarBody,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { AutorizacionRemito } from "../../types/autorizacionRemito";
import { invoke } from "@tauri-apps/api/core";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
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
    onClose: () => void;
    onCreado: (autorizacion: AutorizacionRemito) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
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
                                value={String(puntoVenta)}
                                onChange={(e) => setPuntoVenta(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Número desde">
                            <Input
                                type="number"
                                value={String(numeroDesde)}
                                onChange={(e) => setNumeroDesde(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Número hasta">
                            <Input
                                type="number"
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
