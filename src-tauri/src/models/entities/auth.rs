#[derive(serde::Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String
}

#[derive(serde::Serialize)]
pub struct LoginResponse{
    exito: bool,
    message: String
}

impl LoginResponse{
    pub fn new(exito: bool) -> Self{
        if exito {
            Self{
                exito: true,
                message: "¡Bienvenido! Inicio de sesión correcto.".to_string(),
            }
        } else {
            Self {
                exito: false,
                message: "Usuario o contraseña incorrectos. Intentalo de nuevo.".to_string(),
            }
        }
    }
}


pub struct User{
    pub username: String,
    pub password: String,
}

impl User{
    pub fn new(username: String, password: String) -> Self{
        Self {username,password}
    } 
}