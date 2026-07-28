import { Bien } from "../../types/bien";


interface BienComponentProps {
    bien: Bien;
    onActualizado: (bienActualizado: Bien) => void;
    onEliminado: (id: number) => void;
}

function BienComponent(props: BienComponentProps) {
    return (<></>);
}

export default BienComponent;