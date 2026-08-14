import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Button,
  Text,
  Caption1,
  makeStyles,
  tokens,
  mergeClasses,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  ProgressBar,
  MessageBar,
  MessageBarBody,
  Spinner,
} from "@fluentui/react-components";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  VehicleTruckRegular,
  BoxRegular,
  BriefcaseMedicalRegular,
  ArrowDownloadRegular,
  SignOutRegular,
  ArrowSyncRegular,
} from "@fluentui/react-icons";

const COLLAPSED_WIDTH = "50px";
const EXPANDED_WIDTH = "240px";
const SIDEBAR_BG = "#1D2935";
const SIDEBAR_SELECTED_ICON = "#759FBD";

const menuItems = [
  { label: "Entregas", to: "/entregas", icon: <VehicleTruckRegular /> },
  { label: "Inventario", to: "/stock", icon: <BoxRegular /> },
  { label: "Clínicas", to: "/clinicas", icon: <BriefcaseMedicalRegular /> },
  { label: "Entradas", to: "/entradas", icon: <ArrowDownloadRegular /> },
];

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflowX: "hidden",
    backgroundColor: SIDEBAR_BG,
    color: "rgba(255,255,255,0.87)",
    transitionProperty: "width",
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  collapsed: {
    width: COLLAPSED_WIDTH,
  },
  expanded: {
    width: EXPANDED_WIDTH,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    whiteSpace: "nowrap",
  },
  logo: {
    width: "32px",
    height: "32px",
    flexShrink: 0,
  },
  brandText: {
    overflow: "hidden",
  },
  brandTitle: {
    color: "white",
    fontWeight: tokens.fontWeightBold,
    lineHeight: "1.2",
    display: "block",
  },
  brandSubtitle: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1",
    display: "block",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: tokens.spacingVerticalXS,
    padding: `0 ${tokens.spacingHorizontalXS}`,
  },
  navItem: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    whiteSpace: "nowrap",
    color: "rgba(255,255,255,0.87)",
    backgroundColor: "transparent",
    border: "none",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    whiteSpace: "nowrap",
    color: "rgba(255,255,255,0.87)",
    textDecoration: "none",
    borderRadius: tokens.borderRadiusMedium,
    padding: `${tokens.spacingVerticalSNudge} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase300,
    fontFamily: tokens.fontFamilyBase,
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.08)",
    },
  },
  navItemSelected: {
    color: SIDEBAR_SELECTED_ICON,
  },
  footer: {
    padding: `0 ${tokens.spacingHorizontalXS}`,
    paddingBottom: tokens.spacingVerticalM,
  },
  updateStatus: {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    padding: `0 ${tokens.spacingHorizontalM}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  main: {
    flexGrow: 1,
    padding: tokens.spacingHorizontalXXL,
    overflowY: "auto",
  },
  updateContent: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    minWidth: "360px",
  },
  updateNotes: {
    whiteSpace: "pre-wrap",
    color: tokens.colorNeutralForeground3,
    maxHeight: "160px",
    overflowY: "auto",
  },
  updateProgress: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
});

function AppLayout() {
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const { pathname } = useLocation();

  const [buscando, setBuscando] = useState(false);
  const [estadoBusqueda, setEstadoBusqueda] = useState<string | null>(null);
  const [actualizacion, setActualizacion] = useState<Update | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [errorActualizacion, setErrorActualizacion] = useState<string | null>(null);

  const handleLogout = async () => {
    const loginWindow = await WebviewWindow.getByLabel("login");
    await loginWindow?.show();
    await getCurrentWindow().hide();
  };

  const handleBuscarActualizaciones = async () => {
    setBuscando(true);
    setEstadoBusqueda(null);
    try {
      const update = await check();
      if (update) {
        setActualizacion(update);
        setErrorActualizacion(null);
        setProgreso(null);
        setDialogoAbierto(true);
      } else {
        setEstadoBusqueda("Ya tenés la última versión instalada.");
      }
    } catch (error) {
      console.error("No se pudo buscar actualizaciones:", error);
      setEstadoBusqueda("No se pudo buscar actualizaciones. Revisá tu conexión.");
    } finally {
      setBuscando(false);
    }
  };

  const handleInstalarActualizacion = async () => {
    if (!actualizacion) return;
    setInstalando(true);
    setErrorActualizacion(null);
    try {
      let descargado = 0;
      let total = 0;
      await actualizacion.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          descargado += event.data.chunkLength;
          setProgreso(total > 0 ? Math.round((descargado / total) * 100) : null);
        } else if (event.event === "Finished") {
          setProgreso(100);
        }
      });
      await relaunch();
    } catch (error) {
      console.error("No se pudo instalar la actualización:", error);
      setErrorActualizacion("No se pudo instalar la actualización. Probá de nuevo.");
      setInstalando(false);
    }
  };

  return (
    <div className={styles.root}>
      <div
        className={mergeClasses(styles.sidebar, isExpanded ? styles.expanded : styles.collapsed)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={styles.brand}>
          <img src="/logoVairesMedical.png" alt="Logo NutriStock" className={styles.logo} />
          <div className={styles.brandText}>
            <Text className={styles.brandTitle}>NutriStock</Text>
            <Caption1 className={styles.brandSubtitle}>Gestión &amp; Facturación</Caption1>
          </div>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={mergeClasses(
                styles.navLink,
                pathname === item.to && styles.navItemSelected,
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          {estadoBusqueda && isExpanded && (
            <Caption1 className={styles.updateStatus}>{estadoBusqueda}</Caption1>
          )}
          <Button
            appearance="subtle"
            icon={buscando ? <Spinner size="tiny" /> : <ArrowSyncRegular />}
            className={styles.navItem}
            onClick={handleBuscarActualizaciones}
            disabled={buscando}
          >
            {buscando ? "Buscando…" : "Buscar actualizaciones"}
          </Button>
          <Button
            appearance="subtle"
            icon={<SignOutRegular />}
            className={styles.navItem}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>

      <Dialog
        open={dialogoAbierto}
        onOpenChange={(_, data) => { if (!instalando) setDialogoAbierto(data.open); }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Actualización disponible</DialogTitle>
            <DialogContent className={styles.updateContent}>
              <Text>Hay una nueva versión: <b>{actualizacion?.version}</b></Text>
              {actualizacion?.body && (
                <Text className={styles.updateNotes}>{actualizacion.body}</Text>
              )}
              {instalando && (
                <div className={styles.updateProgress}>
                  <ProgressBar value={progreso !== null ? progreso / 100 : undefined} />
                  <Caption1>{progreso !== null ? `${progreso}%` : "Descargando…"}</Caption1>
                </div>
              )}
              {errorActualizacion && (
                <MessageBar intent="error">
                  <MessageBarBody>{errorActualizacion}</MessageBarBody>
                </MessageBar>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)} disabled={instalando}>
                Ahora no
              </Button>
              <Button
                appearance="primary"
                onClick={handleInstalarActualizacion}
                disabled={instalando}
                icon={instalando ? <Spinner size="tiny" /> : undefined}
              >
                {instalando ? "Instalando…" : "Actualizar ahora"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default AppLayout;
