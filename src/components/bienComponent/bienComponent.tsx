import { Bien } from "../../types/bien";
import {
    Card, 
    CardContent, 
    CardActions, 
    Typography, 
    Chip,
    Button, 
    Stack, 
    Avatar, 
    Box, 
    Divider,
    IconButton,
    InputBase
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from '@mui/icons-material/Edit';
import { invoke } from '@tauri-apps/api/core';
import { useState, useEffect} from "react";
import DeletedBienPopUp from "../popups/deleteBienPopUp"; 
import EditBienPopUp from "../popups/editBienPopUp";

interface BienComponentProps {
    bien: Bien;
    onActualizado: (bienActualizado: Bien) => void;
    onEliminado: (id: number) => void;
}

function BienComponent(props: BienComponentProps) {

    const [confirmandoModificar, setConfirmandoModificar] = useState(false);
    const [valorStock, setValorStock] = useState(props.bien.stock_actual);
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

    useEffect(() => {
    setValorStock(bien.stock_actual);
    }, [props.bien.stock_actual]);

    const iniciarEdicion = () => {
        setValorStock(bien.stock_actual);
    };

    const confirmarStock = async () => {
        try {
            const bienActualizado = await invoke<Bien>('setear_stock_command', {
                request: { bien_id: bien.id, value: valorStock },
            });
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo setear el stock:", error);
        }
    };

    const ajustarStock = async (delta: number) => {
        try {
            const bienActualizado = await invoke<Bien>('ajustar_stock_command', {
                request: { bien_id: bien.id, delta },
            });
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo ajustar el stock:", error);
        }
    };

    const precioFormateado = (props.bien.precio_centavos / 100).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
    });

    const { bien } = props;

    let estadoTexto: string;
    let estadoColor: "success" | "warning" | "error";

    if (bien.stock_actual === 0) {
        estadoTexto = "Sin stock";
        estadoColor = "error";
    } else if (bien.stock_actual < 5) {
        estadoTexto = "Stock bajo";
        estadoColor = "warning";
    } else {
        estadoTexto = "En stock";
        estadoColor = "success";
    }

    return (<>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{alignItems: "flex-start"}}>
                    <Avatar sx={{ bgcolor: "grey.100" }}>
                        <Inventory2Icon color="action" />
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{bien.descripcion}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {precioFormateado}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        <Chip label={estadoTexto} color={estadoColor} />

                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        onClick={iniciarEdicion}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        En depósito: 
                                    </Typography>

                                <InputBase
                                        value={valorStock}
                                        onChange={(e) => setValorStock(Number(e.target.value))}
                                        onKeyDown={(e) => { if (e.key === "Enter") confirmarStock(); }}
                                        onBlur={confirmarStock}
                                        autoFocus
                                        type="number"
                                        inputProps={{ style: { textAlign: "center" } }}
                                        sx={{
                                            width: 40,
                                            borderRadius: 1,
                                            boxShadow: "0 0 8px 4px rgba(0,0,0,0.3)",
                                            px: 0.5,
                                            py: 0.5,
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
                            <IconButton size="small" onClick={() => ajustarStock(-1)} sx={{ borderRadius: 1, border: 1, borderColor: "divider" }}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => ajustarStock(1)}sx={{ borderRadius: 1, border: 1, borderColor: "divider" }}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Stack>
            </CardContent>

            <Divider />

            <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button 
                    variant="outlined" 
                    startIcon={<EditIcon/>} 
                    onClick={() => setConfirmandoModificar(true)}
                >
                    Modificar
                </Button>

                <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon/>} 
                    onClick={() => setConfirmandoEliminar(true)}
                >
                    Eliminar
                </Button>
            </CardActions>
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
    </>);
}

export default BienComponent;