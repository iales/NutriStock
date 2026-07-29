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

interface CreateBienProps {
    open: boolean;
    onClose: () => void;
    onCreado: (bien: Bien) => void;
}

function CreateBienPopUp(props: CreateBienProps) {
    const [descripcion, setDescripcion] = useState("");
    const [pesoKg, setPesoKg] = useState(0);
    const [precio, setPrecio] = useState(0);

    useEffect(() => {
        if (props.open) {
            setDescripcion("");
            setPesoKg(0);
            setPrecio(0);
        }
    }, [props.open]);

    const crear = async () => {
        try {
            const bienCreado = await invoke<Bien>('crear_bien_command', {
                request: {
                    descripcion,
                    peso_kg: pesoKg,
                    precio_centavos: Math.round(precio * 100),
                },
            });
            props.onCreado(bienCreado);
        } catch (error) {
            console.error("No se pudo crear el producto:", error);
        } finally {
            props.onClose();
        }
    };

    return (
        <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    margin="dense"
                    label="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Peso (kg)"
                    type="number"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(Number(e.target.value))}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Precio"
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancelar</Button>
                <Button onClick={crear} variant="contained">Crear</Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateBienPopUp;