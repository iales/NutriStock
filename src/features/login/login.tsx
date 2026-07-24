import { useState, useRef } from 'react';
import { Box, 
  TextField,
  InputAdornment,
  Divider,
  Typography,
  Button,
  Alert
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock'; 
import PersonIcon  from '@mui/icons-material/Person';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

function Login() {
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!username || !password){
            alert("por favor, completar todos los campos");
            return; 
        }
        const datosFormulario = {
            username: username,
            password: password
        };

        try {
            const respuesta: any = await invoke('login_command', {request: datosFormulario});
            console.log("Enviando credenciales...", { username, password });
            console.log("tauri respuesta: ", respuesta);

            if (respuesta.exito) {
                console.log("¡Logueado con éxito!", respuesta.message);
                const mainWindow = await WebviewWindow.getByLabel("main");
                await mainWindow?.show();
                await getCurrentWindow().hide();
            } else {
                setErrorMessage(respuesta.message)

            }
        } catch (error) {
          console.error("Error fatal en el puente IPC:", error);
        }
    };

  return (
    <>
      <form onSubmit={handleSubmit} style={{width: '100%'}}>
        <Box sx= {{
            display: 'flex',
            minHeight: '100vh',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            pb: 15
        }}>
        <Box
            component="img"
            src="/logoVairesMedical.png"
            alt="Logo de Vaires Medical"
            sx={{ maxWidth: 120, height: 'auto', display: 'block', mb: 2}}
        />
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <TextField
        error={!!errorMessage}
        size='small'
        sx={{minWidth: '300px',minHeight: '50px'}}
        label= "Nombre de usuario"
        variant="outlined"
        onKeyDown ={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();  
                passwordInputRef.current?.focus(); 
            }
        }}
        onChange={(e) => setUsername(e.target.value)}
        slotProps={{
            input: {
            startAdornment: (
                <InputAdornment position="start">
                <PersonIcon />
                <Typography sx={{ml:1,mr:1}}> | </Typography>
                </InputAdornment>
            ),
            },
        }}
        />
            
                
        <Divider sx={{margin: 0.5}}/>  
            
        <TextField
            error={!!errorMessage}
            inputRef={passwordInputRef}
            size='small'
            sx={{minWidth: '300px', minHeight: '50px'}}
            label= 'Contraseña'
            type='password'
            variant='outlined'
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
                input: {
                    startAdornment:(
                    <InputAdornment position='start'>
                        <LockIcon/> 
                        <Typography sx={{ml:1,mr:1}}> | </Typography>
                    </InputAdornment>
                    )
                }
            }}
            />
            <Button 
                type="submit" 
                variant="contained" 
                size='small'
                sx = {{mt: 1}}

                >
                Iniciar Sesión
            </Button>
      </Box>
    </form>
    </>
  );
}

export default Login;