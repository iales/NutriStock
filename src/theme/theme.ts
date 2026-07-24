import { createTheme, Theme } from "@mui/material/styles";

const theme: Theme = createTheme({
    cssVariables: true,
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    main: '#76B285'
                },
                secondary: {
                    main: '#537893'
                },
                background: {
                    default: '#F4F7F5',
                    paper: '#FFFFFF'
                }
            }
        },
        dark: {
            palette: {
                primary: {
                    main: '#8FCC9E'
                },
                secondary: {
                    main: '#759FBD'
                },
                background: {
                    paper: '#1E1E1E'
                }
            }
        }
    }
});


export default theme; 