import { forwardRef } from "react";
import { Input as FluentInput, InputProps } from "@fluentui/react-components";

/**
 * Wrapper de Input con autoComplete="off" por defecto — sin esto, WebView2
 * muestra un dropdown con valores tipeados antes en cada campo, que en una
 * app de escritorio de un solo usuario es más ruido que ayuda. Se puede
 * pisar pasando `autoComplete` explícitamente si algún campo lo necesita.
 */
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
    <FluentInput autoComplete="off" {...props} ref={ref} />
));

Input.displayName = "Input";

export default Input;
