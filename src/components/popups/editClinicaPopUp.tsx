import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Field,
    Input,
    Dropdown,
    Option,
    MessageBar,
    MessageBarBody,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { Clinica, CondicionIva } from "../../types/clinica";
import { invoke } from "@tauri-apps/api/core";
import { CONDICIONES_IVA } from "./createClinicaPopUp";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        minWidth: "360px",
    },
    row: {
        display: "flex",
        gap: tokens.spacingHorizontalM,
    },
    rowField: {
        flex: 1,
    },
});

interface EditClinicaProps {
    clinica: Clinica;
    open: boolean;
    onClose: () => void;
    onActualizada: (clinica: Clinica) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function EditClinicaPopUp(props: EditClinicaProps) {
    const styles = useStyles();
    const [razonSocial, setRazonSocial] = useState(props.clinica.razon_social);
    const [direccion, setDireccion] = useState(props.clinica.direccion);
    const [localidad, setLocalidad] = useState(props.clinica.localidad);
    const [condicionIva, setCondicionIva] = useState<CondicionIva>(props.clinica.condicion_iva);
    const [contacto, setContacto] = useState(props.clinica.contacto ?? "");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) {
            setRazonSocial(props.clinica.razon_social);
            setDireccion(props.clinica.direccion);
            setLocalidad(props.clinica.localidad);
            setCondicionIva(props.clinica.condicion_iva);
            setContacto(props.clinica.contacto ?? "");
            setError(null);
        }
    }, [props.open, props.clinica]);

    const guardar = async () => {
        try {
            const clinica = await invoke<Clinica>('update_clinica_command', {
                id: props.clinica.id,
                request: {
                    razon_social: razonSocial,
                    direccion,
                    localidad,
                    condicion_iva: condicionIva,
                    contacto: contacto || null,
                },
            });
            props.onActualizada(clinica);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudo actualizar la clínica:", appError);
            setError(appError.mensaje ?? "No se pudo actualizar la clínica.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Modificar clínica</DialogTitle>
                    <DialogContent className={styles.content}>
                        <Field label="Razón social">
                            <Input autoFocus value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
                        </Field>
                        <div className={styles.row}>
                            <Field label="CUIT">
                                <Input value={props.clinica.cuit} disabled />
                            </Field>
                            <Field label="Condición IVA" className={styles.rowField}>
                                <Dropdown
                                    value={CONDICIONES_IVA.find(c => c.value === condicionIva)?.label}
                                    selectedOptions={[condicionIva]}
                                    onOptionSelect={(_, data) => {
                                        if (data.optionValue) setCondicionIva(data.optionValue as CondicionIva);
                                    }}
                                >
                                    {CONDICIONES_IVA.map(c => (
                                        <Option key={c.value} value={c.value}>{c.label}</Option>
                                    ))}
                                </Dropdown>
                            </Field>
                        </div>
                        <div className={styles.row}>
                            <Field label="Dirección" className={styles.rowField}>
                                <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                            </Field>
                            <Field label="Localidad" className={styles.rowField}>
                                <Input value={localidad} onChange={(e) => setLocalidad(e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Contacto (opcional)">
                            <Input value={contacto} onChange={(e) => setContacto(e.target.value)} />
                        </Field>
                        {error && (
                            <MessageBar intent="error">
                                <MessageBarBody>{error}</MessageBarBody>
                            </MessageBar>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={props.onClose}>Cancelar</Button>
                        <Button appearance="primary" onClick={guardar}>Guardar</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default EditClinicaPopUp;
