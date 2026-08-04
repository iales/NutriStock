import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { Clinica } from "../../types/clinica";
import { invoke } from "@tauri-apps/api/core";

interface DeleteClinicaProps {
    clinica: Clinica;
    open: boolean;
    onClose: () => void;
    onEliminada: (id: number) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function DeleteClinicaPopUp(props: DeleteClinicaProps) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) setError(null);
    }, [props.open]);

    const eliminar = async () => {
        try {
            await invoke('eliminar_clinica_command', { id: props.clinica.id });
            props.onEliminada(props.clinica.id!);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudo eliminar la clínica:", appError);
            setError(appError.mensaje ?? "No se pudo eliminar la clínica.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Eliminar clínica</DialogTitle>
                    <DialogContent>
                        ¿Seguro que querés eliminar "{props.clinica.razon_social}"? Esta acción no se puede deshacer.
                        {error && (
                            <MessageBar intent="error" style={{ marginTop: "12px" }}>
                                <MessageBarBody>{error}</MessageBarBody>
                            </MessageBar>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={props.onClose}>Cancelar</Button>
                        <Button appearance="primary" onClick={eliminar}>Eliminar</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default DeleteClinicaPopUp;
