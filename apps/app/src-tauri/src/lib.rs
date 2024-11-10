use reqwest::{Client, RequestBuilder};
use rocket::{
    fairing::AdHoc, fs::FileServer, get, http::Header, post, routes, serde::json::Json, Config
};
use url::Url;
use serde_json::{json, Value};
use std::{env, path::PathBuf};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::TrayIconBuilder,
    App, Manager,
};
use webbrowser;

fn get_url(url: PathBuf) -> String {
    let combined_url = url.to_string_lossy();

    Url::parse(&format!("https://{}", combined_url))
        .map_err(|_| "invalid_url")
        .unwrap()
        .to_string()
}
async fn send_request(builder: RequestBuilder) -> Result<Json<Value>, Json<Value>> {
    match builder.send().await {
        Ok(resp) => {
            let status = resp.status();
            match resp.json().await {
                Ok(json) => Ok(Json(json)),
                Err(_) => Err(Json(json!({
                    "error": "parse_error",
                    "status": status.as_u16()
                }))),
            }
        }
        Err(e) => Err(Json(json!({
            "error": "request_error",
            "details": e.to_string()
        }))),
    }
}
#[get("/<url..>")]
async fn proxy_get(url: PathBuf) -> Result<Json<Value>, Json<Value>> {
    let client = Client::new();

    send_request(client.get(get_url(url))).await
}
#[post("/<url..>", data = "<data>")]
async fn proxy_post(url: PathBuf, data: Json<Value>) -> Result<Json<Value>, Json<Value>> {
    let client = Client::new();

    send_request(client.post(get_url(url)).json(&data.into_inner())).await
}

fn hide_dock_if_macos(app: &mut App) {
    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);
}
fn create_tray_menu(app: &mut App) {
    let _ = TrayIconBuilder::new()
        .icon(tauri::include_image!("./icons/icon.png"))
        .icon_as_template(true)
        .menu(
            &MenuBuilder::new(app)
                .items(&[
                    &MenuItemBuilder::with_id("open", "Open").build(app).unwrap(),
                    &PredefinedMenuItem::separator(app).unwrap(),
                    &MenuItemBuilder::with_id("quit", "Quit").build(app).unwrap(),
                ])
                .build()
                .unwrap(),
        )
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "open" => webbrowser::open("http://localhost:3000").unwrap(),
            "quit" => app.exit(0),
            _ => (),
        })
        .build(app)
        .unwrap();
}
fn start_server(app: &mut App) {
    let cors_fairing = AdHoc::on_response("Add Custom Headers", |_, response| {
        Box::pin(async move {
            response.set_header(Header::new("Cross-Origin-Opener-Policy", "same-origin"));
            response.set_header(Header::new("Cross-Origin-Embedder-Policy", "require-corp"));
        })
    });

    tauri::async_runtime::spawn(
        rocket::custom(Config {
            port: 10101,
            ..Config::default()
        })
        .mount("/", FileServer::from(app.path().resource_dir().unwrap().join("static")))
        .mount("/proxy", routes![proxy_get, proxy_post])
        .attach(cors_fairing)
        .launch(),
    );
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            hide_dock_if_macos(app);
            start_server(app);
            create_tray_menu(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .unwrap();
}
