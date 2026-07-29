import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Bien } from "../../types/bien";
import { invoke } from "@tauri-apps/api/core";

interface EditBienProps {
    bien: Bien;
    open: boolean;
    onClose: () => void;
    onActualizado: (bienActualizado: Bien) => void;
}

function EditBienPopUp(props: EditBienProps) {
    const [valorDescripcion, setValorDescripcion] = useState(props.bien.descripcion);

    useEffect(() => {
        if (props.open) {
            setValorDescripcion(props.bien.descripcion);
        }
    }, [props.open, props.bien.descripcion]);

    const guardar = async () => {
        try {
            const bienActualizado = await invoke<Bien>('actualizar_bien_command', {
                request: { bien_id: props.bien.id, descripcion: valorDescripcion },
            });
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo actualizar la descripción:", error);
        } finally {
            props.onClose();
        }
    };

    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>

            <DialogTitle>Modificar producto</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    margin="dense"
                    label="Descripción"
                    value={valorDescripcion}
                    onChange={(e) => setValorDescripcion(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancelar</Button>
                <Button onClick={guardar} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditBienPopUp;