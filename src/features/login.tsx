import { useState, useEffect } from 'react';
import { Box, 
  CssBaseline,
  TextField,
  Container,
  //FormControlLabel,
  //Checkbox,
  InputAdornment,
  Divider,
  //Avatar,
  Typography,
  Button
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock'; 
//import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 
import PersonIcon  from '@mui/icons-material/Person';
//import VisibilityIcon from '@mui/icons-material/Visibility'; 
import "./login.css";
import { invoke } from '@tauri-apps/api/core';

function Login() {
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');

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
            } else {
                console.log("Error de credenciales:", respuesta.message);
                alert(respuesta.message); // O un feedback visual en la pantalla
            }
        } catch (error) {
          console.error("Error fatal en el puente IPC:", error);
        }
    };

  return (
    <>
      <CssBaseline />
      
      <form onSubmit={handleSubmit} style={{width: '100%'}}>
        <Box sx= {{
            minHeight: '100vh',
            alignContent: 'center',
            flexDirection: 'column',
            padding: 15
        }}>
            <Container>
                <TextField
                size='small'
                sx={{minWidth: '300px',minHeight: '50px'}}
                label= "Nombre de usuario"
                variant="outlined"
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
            </Container>
                
            <Divider sx={{margin: 0.5}}/>
                
            <Container>
                <TextField
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
            </Container>
            <Button 
                type="submit" 
                variant="contained" 
                size='small'
                >
                Iniciar Sesión
            </Button>
      </Box>
    </form>
    </>
  );
}

export default Login;