import { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import { Title2, Button, Input, Text, makeStyles, tokens } from "@fluentui/react-components";
import { AddRegular, SearchRegular } from "@fluentui/react-icons";
import { Clinica } from "../../types/clinica";
import ClinicaComponent from "../../components/clinicaComponent/clinicaComponent";
import CreateClinicaPopUp from "../../components/popups/createClinicaPopUp";

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
    vacio: {
        display: "flex",
        justifyContent: "center",
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
});

function GestionClinicas() {
    const styles = useStyles();
    const [clinicas, setClinicas] = useState<Clinica[]>([]);
    const [creandoClinica, setCreandoClinica] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        invoke<Clinica[]>('listar_clinicas_command').then(setClinicas);
    }, []);

    const creadaHandler = (nuevaClinica: Clinica) => {
        setClinicas(prev => [...prev, nuevaClinica]);
    };

    const actualizadaHandler = (clinicaActualizada: Clinica) => {
        setClinicas(prev => prev.map(c => (c.id === clinicaActualizada.id ? clinicaActualizada : c)));
    };

    const eliminadaHandler = (id: number) => {
        setClinicas(prev => prev.filter(c => c.id !== id));
    };

    const clinicasFiltradas = clinicas.filter(c =>
        c.razon_social.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.cuit.includes(busqueda) ||
        c.localidad.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <>
            <div className={`${styles.container} ${styles.header}`}>
                <Input
                    size="medium"
                    placeholder="Buscar por razón social, CUIT o localidad…"
                    contentBefore={<SearchRegular />}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={styles.search}
                />
                <Button
                    appearance="primary"
                    icon={<AddRegular />}
                    onClick={() => setCreandoClinica(true)}
                >
                    Nueva clínica
                </Button>
            </div>

            <CreateClinicaPopUp
                open={creandoClinica}
                onClose={() => setCreandoClinica(false)}
                onCreada={creadaHandler}
            />

            <div className={styles.container}>
                {clinicasFiltradas.length === 0 ? (
                    <div className={styles.vacio}>
                        <Text>{clinicas.length === 0 ? "Todavía no cargaste ninguna clínica." : "No se encontraron clínicas."}</Text>
                    </div>
                ) : (
                    clinicasFiltradas.map(clinica => (
                        <ClinicaComponent
                            key={clinica.id}
                            clinica={clinica}
                            onActualizada={actualizadaHandler}
                            onEliminada={eliminadaHandler}
                        />
                    ))
                )}
            </div>
        </>
    );
}

export default GestionClinicas;
