import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import { Button, Input, makeStyles, tokens } from "@fluentui/react-components";
import { AddRegular } from "@fluentui/react-icons";
import { Bien } from "../../types/bien";
import BienComponent from "../../components/bienComponent/bienComponent";
import CreateBienPopUp from "../../components/popups/createBienPopUp";

const useStyles = makeStyles({
    container: {
        maxWidth: "1100px",
        marginLeft: "auto",
        marginRight: "auto",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: tokens.spacingVerticalM,
    },
    search: {
        minWidth: "500px",
        boxShadow: tokens.shadow8,
    },
});

function ControlStock(){
    const styles = useStyles();
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
    }, []);

    const updateHandler = (updatedBien: Bien) => {
        setBienes(prev => prev.map(b => (b.id === updatedBien.id ? updatedBien : b)));
    }
    const deletedHandler = (id_bien: Number) => {
        setBienes(prev => prev.filter(b => b.id !== id_bien));
    }

    return (
        <>
            <div className={`${styles.container} ${styles.header}`}>
                <Input
                    size="medium"
                    placeholder="Buscar producto"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={styles.search}
                />
                <Button
                    appearance="primary"
                    icon={<AddRegular />}
                    onClick={() => setCreandoProducto(true)}
                >
                    Nuevo producto
                </Button>
            </div>

            <CreateBienPopUp
                open={creandoProducto}
                onClose={() => setCreandoProducto(false)}
                onCreado={creadoHandler}
            />

            <div className={styles.container}>
                {bienesFiltrados.map(bien => <BienComponent
                    key={bien.id}
                    bien={bien}
                    onActualizado={updateHandler}
                    onEliminado={deletedHandler}
                />)}
            </div>
        </>
    );
}

export default ControlStock;
