import { Typography, Container} from "@mui/material";
import React, {useState, useEffect} from "react";
import { invoke } from '@tauri-apps/api/core';
import { Bien } from "../../types/bien";
import BienComponent from "../../components/bienComponent/bienComponent";

function ControlStock(){
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [cargando, setCargando] = useState(true);

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
            <Container>
                {bienes.map(bien => <BienComponent
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