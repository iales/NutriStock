import { useState, useRef } from "react";
import {
  Card,
  Title2,
  Text,
  Field,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { PersonRegular, LockClosedRegular, EyeRegular, EyeOffRegular } from "@fluentui/react-icons";
import Input from "../../components/common/input";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const useStyles = makeStyles({
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    backgroundImage: `linear-gradient(180deg, ${tokens.colorNeutralBackground1}, ${tokens.colorBrandBackground2})`,
  },
  card: {
    width: "340px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalXL,
    boxShadow: tokens.shadow28,
  },
  logo: {
    width: "56px",
    height: "56px",
  },
  title: {
    marginTop: tokens.spacingVerticalXS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    marginBottom: tokens.spacingVerticalS,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  submit: {
    marginTop: tokens.spacingVerticalXS,
  },
  sinRevelarNativo: {
    "&::-ms-reveal, &::-ms-clear": {
      display: "none",
    },
  },
});

function Login() {
  const styles = useStyles();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ingresando, setIngresando] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Completá usuario y contraseña.");
      return;
    }

    setErrorMessage(null);
    setIngresando(true);
    try {
      const respuesta: any = await invoke("login_command", {
        request: { username, password },
      });

      if (respuesta.exito) {
        const mainWindow = await WebviewWindow.getByLabel("main");
        await mainWindow?.show();
        await getCurrentWindow().hide();
        setPassword("");
        setIngresando(false);
      } else {
        setErrorMessage(respuesta.message);
        setIngresando(false);
      }
    } catch (error) {
      console.error("Error fatal en el puente IPC:", error);
      setErrorMessage("No se pudo conectar. Intentá de nuevo.");
      setIngresando(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <img src="/logoVairesMedical.png" alt="Logo de Vaires Medical" className={styles.logo} />
        <Title2 className={styles.title}>NutriStock</Title2>
        <Text className={styles.subtitle}>Gestión & Facturación</Text>

        {errorMessage && (
          <MessageBar intent="error">
            <MessageBarBody>{errorMessage}</MessageBarBody>
          </MessageBar>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Field label="Usuario" validationState={errorMessage ? "error" : "none"}>
            <Input
              contentBefore={<PersonRegular />}
              placeholder="Nombre de usuario"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
            />
          </Field>

          <Field label="Contraseña" validationState={errorMessage ? "error" : "none"}>
            <Input
              ref={passwordInputRef}
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              contentBefore={<LockClosedRegular />}
              contentAfter={
                <Button
                  type="button"
                  appearance="transparent"
                  size="small"
                  icon={mostrarPassword ? <EyeOffRegular /> : <EyeRegular />}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setMostrarPassword(v => !v)}
                />
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              input={{ className: styles.sinRevelarNativo }}
            />
          </Field>

          <Button
            type="submit"
            appearance="primary"
            className={styles.submit}
            icon={ingresando ? <Spinner size="tiny" /> : undefined}
            disabled={ingresando}
          >
            {ingresando ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Login;
