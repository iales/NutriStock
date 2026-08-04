import { Clinica } from "../../types/clinica";
import {
    Card,
    Text,
    Title3,
    Badge,
    Button,
    Avatar,
    Divider,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import {
    BuildingRegular,
    LocationRegular,
    CallRegular,
    DeleteRegular,
    EditRegular,
} from "@fluentui/react-icons";
import { useState } from "react";
import DeleteClinicaPopUp from "../popups/deleteClinicaPopUp";
import EditClinicaPopUp from "../popups/editClinicaPopUp";
import { CONDICIONES_IVA } from "../popups/createClinicaPopUp";

const useStyles = makeStyles({
    card: {
        marginTop: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusXLarge,
    },
    content: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingHorizontalM,
    },
    info: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
        color: tokens.colorNeutralForeground3,
    },
    cuit: {
        color: tokens.colorNeutralForeground3,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingHorizontalM,
    },
});

interface ClinicaComponentProps {
    clinica: Clinica;
    onActualizada: (clinica: Clinica) => void;
    onEliminada: (id: number) => void;
}

function ClinicaComponent(props: ClinicaComponentProps) {
    const styles = useStyles();
    const [confirmandoModificar, setConfirmandoModificar] = useState(false);
    const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
    const { clinica } = props;

    const condicionIvaLabel = CONDICIONES_IVA.find(c => c.value === clinica.condicion_iva)?.label ?? clinica.condicion_iva;

    return (
        <>
            <Card className={styles.card}>
                <div className={styles.content}>
                    <Avatar icon={<BuildingRegular />} color="colorful" />

                    <div className={styles.info}>
                        <Title3>{clinica.razon_social}</Title3>
                        <Text className={styles.cuit}>CUIT {clinica.cuit}</Text>
                        <div className={styles.metaRow}>
                            <LocationRegular fontSize={16} />
                            <Text>{clinica.direccion}, {clinica.localidad}</Text>
                        </div>
                        {clinica.contacto && (
                            <div className={styles.metaRow}>
                                <CallRegular fontSize={16} />
                                <Text>{clinica.contacto}</Text>
                            </div>
                        )}
                    </div>

                    <Badge appearance="tint" color="informative">{condicionIvaLabel}</Badge>
                </div>

                <Divider />

                <div className={styles.actions}>
                    <Button
                        appearance="outline"
                        icon={<EditRegular />}
                        onClick={() => setConfirmandoModificar(true)}
                    >
                        Modificar
                    </Button>

                    <Button
                        appearance="outline"
                        icon={<DeleteRegular />}
                        onClick={() => setConfirmandoEliminar(true)}
                    >
                        Eliminar
                    </Button>
                </div>
            </Card>

            <DeleteClinicaPopUp
                clinica={clinica}
                open={confirmandoEliminar}
                onClose={() => setConfirmandoEliminar(false)}
                onEliminada={props.onEliminada}
            />
            <EditClinicaPopUp
                clinica={clinica}
                open={confirmandoModificar}
                onClose={() => setConfirmandoModificar(false)}
                onActualizada={props.onActualizada}
            />
        </>
    );
}

export default ClinicaComponent;
