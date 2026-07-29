import {Container, Button, TextField} from "@mui/material";
import {useState, useEffect} from "react";
import { invoke } from '@tauri-apps/api/core';
import { Bien } from "../../types/bien";
import BienComponent from "../../components/bienComponent/bienComponent";
import CreateBienPopUp from "../../components/popups/createBienPopUp";
import AddIcon from '@mui/icons-material/Add';

function ControlStock(){
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [, setCargando] = useState(true);
    const [creandoProducto, setCreandoProducto] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    const creadoHandler = (nuevoBien: Bien) => {
        setBienes(prev => [...prev, nuevoBien]);
    };

    const bienesFiltrados = bienes.filter(b =>
        b.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );



    useEffect(() => {
        const cargarBienes = async () => {
            try {
                const datos = await invoke<Bien[]>('listar_bienes_command');
                setBienes(datos);
            } finally {
                setCargando(false);
            }
        };
    cargarBienes();
    } , []);
        
    const updateHandler = (updatedBien: Bien) => {
        setBienes(prev => prev.map(b => (b.id === updatedBien.id ? updatedBien : b)));
    }
    const deletedHandler = (id_bien: Number) => {
        setBienes(prev => prev.filter(b => b.id !== id_bien));
    }
    return(
        <>
            <Container sx={{display: 'flex', justifyContent: 'space-between'}}>
                <TextField
                    size="small"
                    placeholder="Buscar pruducto"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    sx={{ minWidth: 500, boxShadow: 5 }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreandoProducto(true)}
                >
                    Nuevo producto
                </Button>
            </Container>

            <CreateBienPopUp
                open={creandoProducto}
                onClose={() => setCreandoProducto(false)}
                onCreado={creadoHandler}
            />

            <Container>
                {bienesFiltrados.map(bien => <BienComponent
                    key={bien.id}
                    bien={bien}
                    onActualizado={updateHandler}
                    onEliminado={deletedHandler}
                />)}
            </Container>
        </>
    ); 
    
}  

export default ControlStock;