import { useEffect, useState } from "react";

export function usePaginacion<T>(items: T[], porPaginaInicial = 10) {
    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPaginaState] = useState(porPaginaInicial);

    const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));

    useEffect(() => {
        if (pagina > totalPaginas) setPagina(1);
    }, [totalPaginas]);

    const setPorPagina = (n: number) => {
        setPorPaginaState(n);
        setPagina(1);
    };

    const inicio = (pagina - 1) * porPagina;
    const itemsPagina = items.slice(inicio, inicio + porPagina);

    return {
        pagina,
        setPagina,
        porPagina,
        setPorPagina,
        totalPaginas,
        itemsPagina,
        desde: items.length === 0 ? 0 : inicio + 1,
        hasta: Math.min(inicio + porPagina, items.length),
        total: items.length,
    };
}
