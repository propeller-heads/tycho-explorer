use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Internal server error")]
    InternalError,

    #[error("Simulation error: {0}")]
    SimulationError(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::InternalError => {
                HttpResponse::InternalServerError().json(format!("{}", self))
            }
            ApiError::SimulationError(msg) => HttpResponse::InternalServerError().json(msg),
            ApiError::NotFound(msg) => HttpResponse::NotFound().json(msg),
            ApiError::BadRequest(msg) => HttpResponse::BadRequest().json(msg),
        }
    }
}
