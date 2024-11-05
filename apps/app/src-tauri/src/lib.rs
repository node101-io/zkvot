use tauri::{
  menu::{
    MenuBuilder,
    MenuItemBuilder,
    PredefinedMenuItem
  },
  tray::TrayIconBuilder,
};
use webbrowser;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      app.set_activation_policy(tauri::ActivationPolicy::Accessory);

      let menu = MenuBuilder::new(app).items(&[
        &MenuItemBuilder::with_id("open", "Open").build(app)?,
        &PredefinedMenuItem::separator(app)?,
        &MenuItemBuilder::with_id("quit", "Quit").build(app)?
      ]).build()?;

      let _tray = TrayIconBuilder::new()
        .icon(tauri::include_image!("./icons/icon.png"))
        .icon_as_template(true)
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id().as_ref() {
          "open" => webbrowser::open("http://localhost:3000").unwrap(),
          "quit" => app.exit(0),
          _ => (),
        })
        .build(app)?;

      let sidecar_command = app.shell().sidecar("zkvot-desktop").expect("failed to create sidecar");
      let (mut rx, mut _child) = sidecar_command.spawn().expect("failed to spawn sidecar");

      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          match event {
            CommandEvent::Stdout(line_bytes) => {
              let line = String::from_utf8_lossy(&line_bytes);
              println!("stdout: {}", line);
            }
            CommandEvent::Stderr(line_bytes) => {
              let line = String::from_utf8_lossy(&line_bytes);
              println!("stderr: {}", line);
            }
            CommandEvent::Error(exit_status) => {
              println!("exit: {}", exit_status);
              break;
            }
            CommandEvent::Terminated(payload) => {
              println!("terminated: {:?}", payload.code);
              break;
            }
            _ => {}
          }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
