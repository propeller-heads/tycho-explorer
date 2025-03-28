use actix_web::{HttpResponse, Responder, get, web};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

#[get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "UP".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(health_check);
}
