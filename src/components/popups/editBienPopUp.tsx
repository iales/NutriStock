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
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { useState, useEffect } from "react";
import { Bien, CategoriaNutricional, CATEGORIAS_NUTRICIONALES } from "../../types/bien";
import { invoke } from "@tauri-apps/api/core";

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

interface EditBienProps {
    bien: Bien;
    open: boolean;
    onClose: () => void;
    onActualizado: (bienActualizado: Bien) => void;
}

function EditBienPopUp(props: EditBienProps) {
    const styles = useStyles();
    const [valorDescripcion, setValorDescripcion] = useState(props.bien.descripcion);
    const [valorPrecio, setValorPrecio] = useState(props.bien.precio_centavos / 100);
    const [categoria, setCategoria] = useState<CategoriaNutricional>(props.bien.categoria_nutricional);

    useEffect(() => {
        if (props.open) {
            setValorDescripcion(props.bien.descripcion);
            setValorPrecio(props.bien.precio_centavos / 100);
            setCategoria(props.bien.categoria_nutricional);
        }
    }, [props.open, props.bien.descripcion, props.bien.precio_centavos, props.bien.categoria_nutricional]);

    const guardar = async () => {
        try {
            const bienActualizado = await invoke<Bien>('actualizar_bien_command', {
                request: {
                    bien_id: props.bien.id,
                    descripcion: valorDescripcion,
                    precio_centavos: Math.round(valorPrecio * 100),
                    categoria_nutricional: categoria,
                },
            });
            props.onActualizado(bienActualizado);
        } catch (error) {
            console.error("No se pudo actualizar el bien:", error);
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
                    <DialogTitle>Modificar producto</DialogTitle>
                    <DialogContent className={styles.content}>
                        <Field label="Descripción">
                            <Input
                                autoFocus
                                value={valorDescripcion}
                                onChange={(e) => setValorDescripcion(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                        </Field>
                        <Field label="Precio">
                            <Input
                                type="number"
                                value={String(valorPrecio)}
                                onChange={(e) => setValorPrecio(Number(e.target.value))}
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
                        <Button appearance="primary" onClick={guardar}>Guardar</Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}

export default EditBienPopUp;
