import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Button, Text, Caption1, makeStyles, tokens, mergeClasses } from "@fluentui/react-components";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
  VehicleTruckRegular,
  BoxRegular,
  BriefcaseMedicalRegular,
  ArrowDownloadRegular,
  SignOutRegular,
} from "@fluentui/react-icons";

const COLLAPSED_WIDTH = "50px";
const EXPANDED_WIDTH = "240px";
const SIDEBAR_BG = "#1D2935";
const SIDEBAR_SELECTED_ICON = "#759FBD";

const menuItems = [
  { label: "Nueva Entrega", to: "/entregas", icon: <VehicleTruckRegular /> },
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
  main: {
    flexGrow: 1,
    padding: tokens.spacingHorizontalXXL,
    overflowY: "auto",
  },
});

function AppLayout() {
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const { pathname } = useLocation();

  const handleLogout = async () => {
    const loginWindow = await WebviewWindow.getByLabel("login");
    await loginWindow?.show();
    await getCurrentWindow().hide();
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
    </div>
  );
}

export default AppLayout;
