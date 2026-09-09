/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - FERIA TECNOLÓGICA UFIDET 2026
 * I.E.S. N° 6036 - Salta, Argentina
 * ============================================================================
 * 
 * Este script se vincula a tu hoja de cálculo:
 * https://docs.google.com/spreadsheets/d/1_3lhS2Dih1qiTZa8vEPcBmGLVFbiyiUhDWEZKdDUSKI/edit
 * 
 * Funcionalidades:
 * 1. Crea y formatea automáticamente las 3 pestañas:
 *    - "Expositores" (con columnas para proyectos ABP, prototipos y requerimientos).
 *    - "Jurados" (con columnas para cátedra de evaluación y procedencia).
 *    - "Visitantes" (con columnas para interés técnico y turno de asistencia).
 * 2. Recibe las inscripciones desde la web en tiempo real (doPost y doGet).
 * 3. Ordena y guarda automáticamente cada fila en la pestaña que corresponde.
 */

// ID de tu Hoja de Cálculo
const SPREADSHEET_ID = "1_3lhS2Dih1qiTZa8vEPcBmGLVFbiyiUhDWEZKdDUSKI";

/**
 * FUNCIÓN INICIAL: Ejecuta esta función UNA VEZ en Apps Script
 * para crear y diseñar las 3 pestañas con sus encabezados oficiales.
 */
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Pestaña Expositores
  setupTab(ss, "Expositores", "#1e3a8a", [
    "Fecha y Hora",
    "Código Acreditación",
    "Nombre y Apellido",
    "DNI / Legajo",
    "Correo Electrónico",
    "Teléfono / WhatsApp",
    "Cátedra / Especialidad",
    "Título del Proyecto ABP",
    "Área Tecnológica",
    "Turno Previsto",
    "Requerimientos Técnicos / Observaciones"
  ]);

  // 2. Pestaña Jurados
  setupTab(ss, "Jurados", "#581c87", [
    "Fecha y Hora",
    "Código Acreditación",
    "Nombre y Apellido",
    "DNI / Legajo",
    "Correo Electrónico",
    "Teléfono / WhatsApp",
    "Institución / Empresa Evaluadora",
    "Área Tecnológica a Evaluar",
    "Franja Horaria",
    "Observaciones"
  ]);

  // 3. Pestaña Visitantes
  setupTab(ss, "Visitantes", "#064e3b", [
    "Fecha y Hora",
    "Código Acreditación",
    "Nombre y Apellido",
    "DNI / Legajo",
    "Correo Electrónico",
    "Teléfono / WhatsApp",
    "Institución o Empresa de Procedencia",
    "Área de Interés",
    "Franja Horaria",
    "Observaciones"
  ]);

  // Eliminar la "Hoja 1" predeterminada si está vacía
  const defaultSheet = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      Logger.log("No se pudo eliminar la hoja por defecto: " + e);
    }
  }

  Logger.log("¡Configuración de pestañas completada con éxito!");
}

/**
 * Función auxiliar para crear y estilizar cada pestaña
 */
function setupTab(ss, tabName, headerColorHex, headers) {
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  // Establecer encabezados en la primera fila
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Formato visual profesional del encabezado
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setFontColor("#ffffff");
  headerRange.setBackground(headerColorHex);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // Inmovilizar la primera fila
  sheet.setFrozenRows(1);

  // Ajustar anchos automáticos
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
    // Establecer un ancho mínimo legible
    if (sheet.getColumnWidth(i) < 140) {
      sheet.setColumnWidth(i, 160);
    }
  }
}

/**
 * MANEJADOR POST: Recibe los datos enviados desde index.html / app.js
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    const result = saveRegistration(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * MANEJADOR GET: Permite pruebas directas o envío por parámetros de URL
 */
function doGet(e) {
  if (!e.parameter || Object.keys(e.parameter).length === 0) {
    return ContentService.createTextOutput("Servicio de Registro Feria UFIDeT activo y funcionando.");
  }
  const result = saveRegistration(e.parameter);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * LÓGICA DE CLASIFICACIÓN Y GUARDADO POR PESTAÑA
 */
function saveRegistration(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Normalizar datos recibidos
  const role = (data.role || "visitante").toLowerCase();
  const timestamp = data.timestamp || new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Salta" });
  const code = data.code || "UFIDET-2026-" + Math.floor(1000 + Math.random() * 9000);
  const name = data.name || "";
  const dni = data.dni || "";
  const email = data.email || "";
  const phone = data.phone || "";
  const institution = data.institution || "";
  const project = data.project || "";
  const field = data.field || "";
  const shift = data.shift || "";
  const notes = data.notes || "";

  let targetTabName = "Visitantes";
  let rowData = [];

  if (role === "expositor") {
    targetTabName = "Expositores";
    rowData = [
      timestamp,
      code,
      name,
      dni,
      email,
      phone,
      institution,
      project,
      field,
      shift,
      notes
    ];
  } else if (role === "jurado") {
    targetTabName = "Jurados";
    rowData = [
      timestamp,
      code,
      name,
      dni,
      email,
      phone,
      institution,
      field,
      shift,
      notes
    ];
  } else {
    targetTabName = "Visitantes";
    rowData = [
      timestamp,
      code,
      name,
      dni,
      email,
      phone,
      institution,
      field,
      shift,
      notes
    ];
  }

  // Verificar que la pestaña exista, si no existe la inicializa
  let sheet = ss.getSheetByName(targetTabName);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(targetTabName);
  }

  // Insertar la fila al final de la pestaña correspondiente
  sheet.appendRow(rowData);

  // Formato para la fila recién insertada
  const lastRow = sheet.getLastRow();
  const rowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  rowRange.setVerticalAlignment("middle");
  rowRange.setFontSize(10);
  sheet.setRowHeight(lastRow, 28);

  return {
    status: "success",
    code: code,
    tab: targetTabName,
    row: lastRow
  };
}
