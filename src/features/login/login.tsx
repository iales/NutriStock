import { useState, useRef } from "react";
import {
  Field,
  Input,
  Divider,
  Button,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PersonRegular, LockClosedRegular } from "@fluentui/react-icons";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const useStyles = makeStyles({
  page: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    paddingTop: '60px',
    backgroundImage: `linear-gradient(180deg, ${tokens.colorNeutralBackground1}, ${tokens.colorBrandBackground2})`,
    gap: tokens.spacingVerticalS,
  },
  logo: {
    maxWidth: "120px",
    height: "auto",
    display: "block",
    marginBottom: tokens.spacingVerticalM,
  },
  field: {
    minWidth: "250px",
  },
  divider: {
    width: "250px",
    margin: `${tokens.spacingVerticalXS} 0`,
  },
  submit: {
    marginTop: tokens.spacingVerticalS,
  },
});

function Login() {
  const styles = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      alert("por favor, completar todos los campos");
      return;
    }
    const datosFormulario = {
      username: username,
      password: password,
    };

    try {
      const respuesta: any = await invoke("login_command", { request: datosFormulario });
      console.log("Enviando credenciales...", { username, password });
      console.log("tauri respuesta: ", respuesta);

      if (respuesta.exito) {
        console.log("¡Logueado con éxito!", respuesta.message);
        const mainWindow = await WebviewWindow.getByLabel("main");
        await mainWindow?.show();
        await getCurrentWindow().hide();
      } else {
        setErrorMessage(respuesta.message);
      }
    } catch (error) {
      console.error("Error fatal en el puente IPC:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.page}>
        <img src="/logoVairesMedical.png" alt="Logo de Vaires Medical" className={styles.logo} />

        {errorMessage && (
          <MessageBar intent="error">
            <MessageBarBody>{errorMessage}</MessageBarBody>
          </MessageBar>
        )}

        <Field className={styles.field} validationState={errorMessage ? "error" : "none"}>
          <Input
            size="small"
            placeholder="Nombre de usuario"
            contentBefore={<PersonRegular />}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                passwordInputRef.current?.focus();
              }
            }}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>

        <Divider className={styles.divider} />

        <Field className={styles.field} validationState={errorMessage ? "error" : "none"}>
          <Input
            ref={passwordInputRef}
            size="small"
            placeholder="Contraseña"
            type="password"
            contentBefore={<LockClosedRegular />}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" appearance="primary" size="small" className={styles.submit}>
          Iniciar Sesión
        </Button>
      </div>
    </form>
  );
}

export default Login;
