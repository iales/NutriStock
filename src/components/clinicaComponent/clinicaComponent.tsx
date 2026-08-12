import { Clinica } from "../../types/clinica";
import {
    Text,
    Badge,
    Button,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import {
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
    cuit: {
        color: tokens.colorNeutralForeground3,
    },
    metaRow: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
        color: tokens.colorNeutralForeground3,
    },
    sinDato: {
        color: tokens.colorNeutralForeground3,
        fontStyle: "italic",
    },
    acciones: {
        display: "flex",
        justifyContent: "flex-end",
        gap: tokens.spacingHorizontalXS,
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
            <tr>
                <td>
                    <Text weight="semibold">{clinica.razon_social}</Text>
                </td>
                <td>
                    <Text className={styles.cuit}>{clinica.cuit}</Text>
                </td>
                <td>
                    <div className={styles.metaRow}>
                        <LocationRegular fontSize={16} />
                        <Text>{clinica.direccion}, {clinica.localidad}</Text>
                    </div>
                </td>
                <td>
                    <Badge appearance="tint" color="informative">{condicionIvaLabel}</Badge>
                </td>
                <td>
                    {clinica.contacto ? (
                        <div className={styles.metaRow}>
                            <CallRegular fontSize={16} />
                            <Text>{clinica.contacto}</Text>
                        </div>
                    ) : (
                        <Text className={styles.sinDato}>Sin contacto</Text>
                    )}
                </td>
                <td>
                    <div className={styles.acciones}>
                        <Button
                            appearance="outline"
                            shape="square"
                            icon={<EditRegular />}
                            aria-label="Modificar clínica"
                            title="Modificar"
                            onClick={() => setConfirmandoModificar(true)}
                        />
                        <Button
                            appearance="outline"
                            shape="square"
                            icon={<DeleteRegular />}
                            aria-label="Eliminar clínica"
                            title="Eliminar"
                            onClick={() => setConfirmandoEliminar(true)}
                        />
                    </div>
                </td>
            </tr>
            
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
