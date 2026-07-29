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
    const [valorPrecio, setValorPrecio] = useState(props.bien.precio_centavos / 100);
    const [valorStock, setValorStock] = useState(props.bien.stock_actual);

    useEffect(() => {
        if (props.open) {
            setValorDescripcion(props.bien.descripcion);
            setValorPrecio(props.bien.precio_centavos / 100);
            setValorStock(props.bien.stock_actual);
        }
    }, [props.open, props.bien.descripcion, props.bien.precio_centavos, props.bien.stock_actual]);
    
    const guardar = async () => {
        try {
            const bienActualizado = await invoke<Bien>('actualizar_bien_command', {
                request: {
                    bien_id: props.bien.id,
                    descripcion: valorDescripcion,
                    precio_centavos: Math.round(valorPrecio * 100),
                    stock_actual: valorStock,
                },

            });
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo actualizar el bien:", error);
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
                <TextField
                    fullWidth
                    margin="dense"
                    label="Precio"
                    type="number"
                    value={valorPrecio}
                    onChange={(e) => setValorPrecio(Number(e.target.value))}
                    sx={{
                        "& input[type=number]": {
                            MozAppearance: "textfield",
                        },
                        "& input[type=number]::-webkit-outer-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                        },
                        "& input[type=number]::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                        },
                    }}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Stock"
                    type="number"
                    value={valorStock}
                    onChange={(e) => setValorStock(Number(e.target.value))}
                    sx={{
                        "& input[type=number]": {
                            MozAppearance: "textfield",
                        },
                        "& input[type=number]::-webkit-outer-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                        },
                        "& input[type=number]::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                        },
                    }}
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