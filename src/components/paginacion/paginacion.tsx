import {
    Button,
    Dropdown,
    Option,
    Text,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
    },
    resumen: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    paginas: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
    },
    numeroBoton: {
        minWidth: "32px",
    },
    porPaginaGroup: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
    },
    porPaginaDropdown: {
        minWidth: "80px",
    },
    puntosSuspensivos: {
        color: tokens.colorNeutralForeground3,
        padding: `0 ${tokens.spacingHorizontalXXS}`,
    },
});

function numerosVisibles(paginaActual: number, totalPaginas: number): (number | "…")[] {
    if (totalPaginas <= 7) {
        return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    const numeros = new Set<number>([1, totalPaginas, paginaActual, paginaActual - 1, paginaActual + 1]);
    const ordenados = [...numeros].filter(n => n >= 1 && n <= totalPaginas).sort((a, b) => a - b);

    const resultado: (number | "…")[] = [];
    for (let i = 0; i < ordenados.length; i++) {
        if (i > 0 && ordenados[i] - ordenados[i - 1] > 1) {
            resultado.push("…");
        }
        resultado.push(ordenados[i]);
    }
    return resultado;
}

interface PaginacionProps {
    desde: number;
    hasta: number;
    total: number;
    pagina: number;
    totalPaginas: number;
    porPagina: number;
    etiqueta: string;
    onCambiarPagina: (pagina: number) => void;
    onCambiarPorPagina: (porPagina: number) => void;
}

function Paginacion(props: PaginacionProps) {
    const styles = useStyles();

    if (props.total === 0) return null;

    return (
        <div className={styles.root}>
            <Text className={styles.resumen}>
                Mostrando {props.desde}-{props.hasta} de {props.total} {props.etiqueta}
            </Text>

            <div className={styles.paginas}>
                <Button
                    appearance="subtle"
                    shape="square"
                    size="small"
                    icon={<ChevronLeftRegular />}
                    aria-label="Página anterior"
                    disabled={props.pagina === 1}
                    onClick={() => props.onCambiarPagina(props.pagina - 1)}
                />

                {numerosVisibles(props.pagina, props.totalPaginas).map((n, i) =>
                    n === "…" ? (
                        <Text key={`ellipsis-${i}`} className={styles.puntosSuspensivos}>…</Text>
                    ) : (
                        <Button
                            key={n}
                            className={styles.numeroBoton}
                            appearance={n === props.pagina ? "primary" : "outline"}
                            shape="square"
                            size="small"
                            onClick={() => props.onCambiarPagina(n)}
                        >
                            {n}
                        </Button>
                    )
                )}

                <Button
                    appearance="subtle"
                    shape="square"
                    size="small"
                    icon={<ChevronRightRegular />}
                    aria-label="Página siguiente"
                    disabled={props.pagina === props.totalPaginas}
                    onClick={() => props.onCambiarPagina(props.pagina + 1)}
                />
            </div>

            <div className={styles.porPaginaGroup}>
                <Text className={styles.resumen}>Mostrar</Text>
                <Dropdown
                    className={styles.porPaginaDropdown}
                    size="small"
                    value={String(props.porPagina)}
                    selectedOptions={[String(props.porPagina)]}
                    onOptionSelect={(_, data) => {
                        if (data.optionValue) props.onCambiarPorPagina(Number(data.optionValue));
                    }}
                >
                    <Option value="10">10</Option>
                    <Option value="25">25</Option>
                    <Option value="50">50</Option>
                </Dropdown>
                <Text className={styles.resumen}>por página</Text>
            </div>
        </div>
    );
}

export default Paginacion;
