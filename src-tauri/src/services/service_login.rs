use crate::models::entities::auth::{LoginRequest, LoginResponse};

pub trait ServiceLogin{fn login(request: LoginRequest ) -> LoginResponse;}