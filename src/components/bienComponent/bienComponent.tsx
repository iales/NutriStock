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
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from '@mui/icons-material/Edit';
import { invoke } from '@tauri-apps/api/core';
import { useState } from "react";
import DeletedBienPopUp from "../popups/deleteBienPopUp"; 
import EditBienPopUp from "../popups/editBienPopUp";

interface BienComponentProps {
    bien: Bien;
    onActualizado: (bienActualizado: Bien) => void;
    onEliminado: (id: number) => void;
}

function BienComponent(props: BienComponentProps) {

    const [confirmandoModificar, setConfirmandoModificar] = useState(false);
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

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
          <Card 
                variant="outlined" 
                sx={{ 
                mt:3, 
                mb: 2,
                borderRadius: 5,
                borderColor: "grey.500",
            }}>
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
                            <Typography variant="body2" color="text.secondary">
                                En depósito: {bien.stock_actual}
                            </Typography>                          
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
                    color="success"
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