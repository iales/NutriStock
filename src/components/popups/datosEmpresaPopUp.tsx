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
import { DatosEmpresa } from "../../types/datosEmpresa";
import { CondicionIva } from "../../types/clinica";
import Input from "../common/input";
import { invoke } from "@tauri-apps/api/core";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
});

const CONDICIONES_IVA: { value: CondicionIva; label: string }[] = [
    { value: "ResponsableInscripto", label: "Responsable Inscripto" },
    { value: "Monotributo", label: "Monotributo" },
    { value: "Exento", label: "Exento" },
];

interface DatosEmpresaPopUpProps {
    open: boolean;
    datosActuales: DatosEmpresa | null;
    onClose: () => void;
    onGuardado: (datos: DatosEmpresa) => void;
}

interface AppErrorShape {
    tipo: string;
    mensaje: string;
}

function DatosEmpresaPopUp(props: DatosEmpresaPopUpProps) {
    const styles = useStyles();
    const [razonSocial, setRazonSocial] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [cuit, setCuit] = useState("");
    const [domicilio, setDomicilio] = useState("");
    const [email, setEmail] = useState("");
    const [condicionIva, setCondicionIva] = useState<CondicionIva>("ResponsableInscripto");
    const [ingresosBrutos, setIngresosBrutos] = useState("");
    const [inicioActividades, setInicioActividades] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (props.open) {
            setRazonSocial(props.datosActuales?.razon_social ?? "");
            setSubtitulo(props.datosActuales?.subtitulo ?? "");
            setCuit(props.datosActuales?.cuit ?? "");
            setDomicilio(props.datosActuales?.domicilio ?? "");
            setEmail(props.datosActuales?.email ?? "");
            setCondicionIva(props.datosActuales?.condicion_iva ?? "ResponsableInscripto");
            setIngresosBrutos(props.datosActuales?.ingresos_brutos ?? "");
            setInicioActividades(props.datosActuales?.inicio_actividades ?? "");
            setError(null);
        }
    }, [props.open, props.datosActuales]);

    const guardar = async () => {
        try {
            const datos = await invoke<DatosEmpresa>('guardar_datos_empresa_command', {
                request: {
                    razon_social: razonSocial,
                    subtitulo: subtitulo || null,
                    cuit,
                    domicilio,
                    email: email || null,
                    condicion_iva: condicionIva,
                    ingresos_brutos: ingresosBrutos || null,
                    inicio_actividades: inicioActividades || null,
                },
            });
            props.onGuardado(datos);
            props.onClose();
        } catch (error) {
            const appError = error as AppErrorShape;
            console.error("No se pudieron guardar los datos de la empresa:", appError);
            setError(appError.mensaje ?? "No se pudieron guardar los datos.");
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Datos de la empresa</DialogTitle>
                    <DialogContent className={styles.content}>
                        <Field label="Razón social">
                            <Input
                                autoFocus
                                value={razonSocial}
                                onChange={(e) => setRazonSocial(e.target.value)}
                            />
                        </Field>
                        <Field label="Subtítulo (opcional)" hint='Ej: "División Alimentos"'>
                            <Input
                                value={subtitulo}
                                onChange={(e) => setSubtitulo(e.target.value)}
                            />
                        </Field>
                        <Field label="CUIT">
                            <Input
                                value={cuit}
                                onChange={(e) => setCuit(e.target.value)}
                            />
                        </Field>
                        <Field label="Domicilio">
                            <Input
                                value={domicilio}
                                onChange={(e) => setDomicilio(e.target.value)}
                            />
                        </Field>
                        <Field label="Email (opcional)">
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Field>
                        <Field label="Condición frente al IVA">
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
                        <Field label="Ingresos Brutos (opcional)">
                            <Input
                                value={ingresosBrutos}
                                onChange={(e) => setIngresosBrutos(e.target.value)}
                            />
                        </Field>
                        <Field label="Inicio de actividades (opcional)">
                            <Input
                                type="date"
                                value={inicioActividades}
                                onChange={(e) => setInicioActividades(e.target.value)}
                            />
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

export default DatosEmpresaPopUp;
