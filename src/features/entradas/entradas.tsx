import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
    Title2,
    Card,
    Field,
    Combobox,
    Option,
    Input,
    Button,
    MessageBar,
    MessageBarBody,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { Bien } from "../../types/bien";

const useStyles = makeStyles({
    container: {
        maxWidth: "480px",
        marginLeft: "auto",
        marginRight: "auto",
    },
    title: {
        marginBottom: tokens.spacingVerticalL,
    },
    card: {
        padding: tokens.spacingHorizontalXL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
    },
    noSpinner: {
        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
            WebkitAppearance: "none",
            margin: 0,
        },
        "-moz-appearance": "textfield",
    },
});

function Entradas() {
    const styles = useStyles();
    const [bienes, setBienes] = useState<Bien[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [bienSeleccionado, setBienSeleccionado] = useState<Bien | null>(null);
    const [cantidad, setCantidad] = useState(0);
    const [vencimiento, setVencimiento] = useState("");
    const [mensaje, setMensaje] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

    useEffect(() => {
        invoke<Bien[]>('listar_bienes_command').then(setBienes);
    }, []);

    const bienesFiltrados = bienes.filter(b =>
        b.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const confirmar = async () => {
        if (!bienSeleccionado || cantidad <= 0) {
            setMensaje({ tipo: "error", texto: "Elegí un producto y una cantidad mayor a cero." });
            return;
        }

        try {
            await invoke('recibir_lote_command', {
                request: {
                    bien_id: bienSeleccionado.id,
                    cantidad,
                    vencimiento: vencimiento || null,
                },
            });
            setMensaje({ tipo: "success", texto: `Se cargaron ${cantidad} u. de "${bienSeleccionado.descripcion}".` });
            setBusqueda("");
            setBienSeleccionado(null);
            setCantidad(0);
            setVencimiento("");
        } catch (error) {
            console.error("No se pudo registrar la entrada:", error);
            setMensaje({ tipo: "error", texto: "No se pudo registrar la entrada." });
        }
    };

    return (
        <div className={styles.container}>
            <Title2 className={styles.title}>Registrar entrada</Title2>

            {mensaje && (
                <MessageBar intent={mensaje.tipo === "success" ? "success" : "error"} style={{ marginBottom: tokens.spacingVerticalM }}>
                    <MessageBarBody>{mensaje.texto}</MessageBarBody>
                </MessageBar>
            )}

            <Card className={styles.card}>
                <Field label="Producto">
                    <Combobox
                        freeform
                        placeholder="Buscar producto…"
                        value={bienSeleccionado ? bienSeleccionado.descripcion : busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setBienSeleccionado(null);
                        }}
                        onOptionSelect={(_, data) => {
                            const bien = bienes.find(b => String(b.id) === data.optionValue);
                            if (bien) {
                                setBienSeleccionado(bien);
                                setBusqueda(bien.descripcion);
                            }
                        }}
                    >
                        {bienesFiltrados.map(b => (
                            <Option key={b.id} value={String(b.id)}>{b.descripcion}</Option>
                        ))}
                    </Combobox>
                </Field>

                <Field label="Cantidad">
                    <Input
                        type="number"
                        value={String(cantidad)}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        input={{ className: styles.noSpinner }}
                    />
                </Field>

                <Field label="Vencimiento (opcional)" hint="Si no lo sabés, dejalo vacío y cargá igual.">
                    <Input
                        type="date"
                        value={vencimiento}
                        onChange={(e) => setVencimiento(e.target.value)}
                    />
                </Field>

                <Button appearance="primary" onClick={confirmar}>Confirmar entrada</Button>
            </Card>
        </div>
    );
}

export default Entradas;
