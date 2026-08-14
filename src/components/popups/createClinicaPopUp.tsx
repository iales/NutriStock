import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Field,
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
import Input from "../common/input";

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

export const CONDICIONES_IVA: { value: CondicionIva; label: string }[] = [
    { value: "ResponsableInscripto", label: "Responsable Inscripto" },
    { value: "Monotributo", label: "Monotributo" },
    { value: "Exento", label: "Exento" },
];

interface CreateClinicaProps {
    open: boolean;
    onClose: () => void;
    onCreada: (clinica: Clinica) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function CreateClinicaPopUp(props: CreateClinicaProps) {
    const styles = useStyles();
    const [razonSocial, setRazonSocial] = useState("");
    const [direccion, setDireccion] = useState("");
    const [localidad, setLocalidad] = useState("");
    const [cuit, setCuit] = useState("");
    const [condicionIva, setCondicionIva] = useState<CondicionIva>("ResponsableInscripto");
    const [contacto, setContacto] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) {
            setRazonSocial("");
            setDireccion("");
            setLocalidad("");
            setCuit("");
            setCondicionIva("ResponsableInscripto");
            setContacto("");
            setError(null);
        }
    }, [props.open]);

    const crear = async () => {
        try {
            const clinica = await invoke<Clinica>('registrar_nueva_clinica_command', {
                request: {
                    razon_social: razonSocial,
                    direccion,
                    localidad,
                    cuit,
                    condicion_iva: condicionIva,
                    contacto: contacto || null,
                },
            });
            props.onCreada(clinica);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudo crear la clínica:", appError);
            setError(appError.mensaje ?? "No se pudo crear la clínica.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Nueva clínica</DialogTitle>
                    <DialogContent className={styles.content}>
                        <Field label="Razón social">
                            <Input autoFocus value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
                        </Field>
                        <div className={styles.row}>
                            <Field label="CUIT" className={styles.rowField}>
                                <Input value={cuit} onChange={(e) => setCuit(e.target.value)} />
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
                        <Button appearance="primary" onClick={crear}>Crear</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default CreateClinicaPopUp;
