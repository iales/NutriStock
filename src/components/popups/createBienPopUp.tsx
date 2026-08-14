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
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { Bien, CategoriaNutricional, CATEGORIAS_NUTRICIONALES } from "../../types/bien";
import { invoke } from "@tauri-apps/api/core";
import Input from "../common/input";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
});

interface CreateBienProps {
    open: boolean;
    onClose: () => void;
    onCreado: (bien: Bien) => void;
}

function CreateBienPopUp(props: CreateBienProps) {
    const styles = useStyles();
    const [descripcion, setDescripcion] = useState("");
    const [pesoKg, setPesoKg] = useState(0);
    const [precio, setPrecio] = useState(0);
    const [categoria, setCategoria] = useState<CategoriaNutricional>("Lacteos");

    useEffect(() => {
        if (props.open) {
            setDescripcion("");
            setPesoKg(0);
            setPrecio(0);
            setCategoria("Lacteos");
        }
    }, [props.open]);

    const crear = async () => {
        try {
            const bienCreado = await invoke<Bien>('crear_bien_command', {
                request: {
                    descripcion,
                    peso_kg: pesoKg,
                    precio_centavos: Math.round(precio * 100),
                    categoria_nutricional: categoria,
                },
            });
            props.onCreado(bienCreado);
        } catch (error) {
            console.error("No se pudo crear el producto:", error);
        } finally {
            props.onClose();
        }
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Nuevo producto</DialogTitle>
                    <DialogContent className={styles.content}>
                        <Field label="Descripción">
                            <Input
                                autoFocus
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </Field>
                        <Field label="Peso (kg)">
                            <Input
                                type="number"
                                min={0.01}
                                step={0.01}
                                value={String(pesoKg)}
                                onChange={(e) => setPesoKg(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Precio">
                            <Input
                                type="number"
                                min={0}
                                step={0.01}
                                value={String(precio)}
                                onChange={(e) => setPrecio(Number(e.target.value))}
                                onFocus={(e) => e.target.select()}
                                input={{ className: styles.noSpinner }}
                            />
                        </Field>
                        <Field label="Categoría">
                            <Dropdown
                                value={CATEGORIAS_NUTRICIONALES.find(c => c.value === categoria)?.label}
                                selectedOptions={[categoria]}
                                onOptionSelect={(_, data) => {
                                    if (data.optionValue) setCategoria(data.optionValue as CategoriaNutricional);
                                }}
                            >
                                {CATEGORIAS_NUTRICIONALES.map(c => (
                                    <Option key={c.value} value={c.value}>{c.label}</Option>
                                ))}
                            </Dropdown>
                        </Field>
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

export default CreateBienPopUp;
