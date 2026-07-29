import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogContentText, 
    DialogActions,
    Button
} from "@mui/material";
import { Bien } from "../../types/bien";
import { invoke } from "@tauri-apps/api/core";


interface DeletedBienProps {
    bien: Bien;
    open: boolean;
    onClose: () => void;
    onEliminado: (id: number) => void;
}

function DeletedBienPopUp(props: DeletedBienProps) {
    const eliminar = async () => {
        try {
            await invoke('eliminar_bien_command', { id: props.bien.id });
            props.onEliminado(props.bien.id!);
        } catch (error) {
            console.error("No se pudo eliminar el bien:", error);
        } finally {
            props.onClose();
        }
    };

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ¿Seguro que querés eliminar "{props.bien.descripcion}"? Esta acción no se puede deshacer.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancelar</Button>
                <Button onClick={eliminar} color="error" variant="contained">Eliminar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeletedBienPopUp;