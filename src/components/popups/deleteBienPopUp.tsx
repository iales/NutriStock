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
import { Bien } from "../../types/bien";
import { invoke } from "@tauri-apps/api/core";

interface DeletedBienProps {
    bien: Bien;
    open: boolean;
    onClose: () => void;
    onEliminado: (id: number) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function DeletedBienPopUp(props: DeletedBienProps) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) setError(null);
    }, [props.open]);

    const eliminar = async () => {
        try {
            await invoke('eliminar_bien_command', { id: props.bien.id });
            props.onEliminado(props.bien.id!);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudo eliminar el bien:", appError);
            setError(appError.mensaje ?? "No se pudo eliminar el producto.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Eliminar producto</DialogTitle>
                    <DialogContent>
                        ¿Seguro que querés eliminar "{props.bien.descripcion}"? Esta acción no se puede deshacer.
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

export default DeletedBienPopUp;
