import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LogoutIcon from "@mui/icons-material/Logout";

const COLLAPSED_WIDTH = 50;
const EXPANDED_WIDTH = 240;
const SIDEBAR_BG = "#1D2935";
const SIDEBAR_SELECTED_ICON = "#759FBD";

const menuItems = [
    { label: "Nueva Entrega", to: "/entregas", icon: <LocalShippingIcon /> },
    { label: "Inventario", to: "/stock", icon: <InventoryIcon /> },
    { label: "Clínicas", to: "/clinicas", icon: <LocalHospitalIcon /> },
];

function AppLayout() {
    const [isExpanded, setIsExpanded] = useState(false);
    const { pathname } = useLocation();

    const handleLogout = async () => {
        const loginWindow = await WebviewWindow.getByLabel("login");
        await loginWindow?.show();
        await getCurrentWindow().hide();
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                variant="permanent"
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                sx={{
                    width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
                    flexShrink: 0,
                    transition: (theme) =>
                        theme.transitions.create("width", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    "& .MuiDrawer-paper": {
                        width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
                        overflowX: "hidden",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: SIDEBAR_BG,
                        color: "rgba(255,255,255,0.87)",
                        transition: (theme) =>
                            theme.transitions.create("width", {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        "& .MuiListItemIcon-root": {
                            color: "rgba(255,255,255,0.6)"
                        },
                        "& .Mui-selected, & .Mui-selected:hover": {
                            bgcolor: "transparent !important",
                        },
                        "& .Mui-selected .MuiListItemIcon-root": {
                            color: SIDEBAR_SELECTED_ICON,
                        },
                    },
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 2, whiteSpace: "nowrap" }}>
                    <Box
                        component="img"
                        src="/logoVairesMedical.png"
                        alt="Logo NutriStock"
                        sx={{ width: 32, height: 32, flexShrink: 0 }}
                    />
                    <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            NutriStock
                        </Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>
                            Gestión &amp; Facturación
                        </Typography>
                    </Box>
                </Box>

                <List sx={{ flexGrow: 1 }}>
                    {menuItems.map((item) => (
                        <ListItemButton
                            key={item.to}
                            component={NavLink}
                            to={item.to}
                            selected={pathname === item.to}
                            onClick={(e) => e.currentTarget.blur()}
                            sx={{
                                whiteSpace: "nowrap",
                                borderRadius: 3
                            }}
                        >

                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    ))}
                </List>

                <List>
                    <ListItemButton
                        onClick={(e) => {
                            e.currentTarget.blur();
                            handleLogout();
                        }}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar sesión" />
                    </ListItemButton>
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
}

export default AppLayout;
