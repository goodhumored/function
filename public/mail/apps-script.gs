// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const ADMIN_EMAIL = "hello@functiondesign.studio";
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1GuRrFHPFUngYobSI2ebtSBzG9eZyli94fDjOISPyqHU/edit#gid=0";
const BASE_URL = "https://functiondesign.studio"; // базовый URL для email рассылок

// ============================================
// MAIN HANDLER
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Honeypot check
    if (!checkHoneypot(data)) {
      return createResponse(false, "Invalid submission");
    }

    // 2. Submission timing check
    if (!checkSubmissionTiming(data)) {
      return createResponse(false, "Form submitted too quickly");
    }

    // 3. Duplicate submission prevention
    if (!checkDuplicateSubmission(data)) {
      return createResponse(false, "Duplicate submission detected");
    }

    // 4. Server-side validation
    if (!validateData(data)) {
      return createResponse(false, "Invalid data provided");
    }

    saveLead(data);

    try {
      sendAdminEmail(data);
    } catch (e) {
      console.error("Admin email error", e);
    }

    try {
      sendAutoReplyEmail(data.email);
    } catch (e) {
      console.error("Auto reply error", e);
    }

    return createResponse(true, "Lead saved successfully");

  } catch (error) {
    console.error("Error in doPost:", error);
    return createResponse(false, error.toString());
  }
}

// ============================================
// 1. HONEYPOT CHECK
// ============================================
function checkHoneypot(data) {
  return !data.honeypot || data.honeypot === "";
}

// ============================================
// 2. SUBMISSION TIMING CHECK
// ============================================
function checkSubmissionTiming(data) {
  if (!data.formLoadedAt) return false;

  const loadedAt = parseInt(data.formLoadedAt, 10);
  const now = Date.now();
  const diff = now - loadedAt;

  return diff >= 2000;
}

// ============================================
// 3. DUPLICATE SUBMISSION PREVENTION
// ============================================
function checkDuplicateSubmission(data) {
  const cache = CacheService.getScriptCache();
  const email = data.email ? data.email.toLowerCase().trim() : "";
  if (!email) return true;

  const cachedKey = `submitted_${email}`;
  const lastSubmission = cache.get(cachedKey);

  if (lastSubmission) {
    return false;
  }

  cache.put(cachedKey, "1", 300);
  return true;
}

// ============================================
// 4. SERVER-SIDE VALIDATION
// ============================================
function validateData(data) {
  // Name: не пустой, только буквы и пробелы
  const name = data.name ? data.name.trim() : "";
  if (!name || !/^[a-zA-Zа-яА-ЯёЁ\s'-]{2,100}$/.test(name)) {
    return false;
  }

  // Phone: проверка формата
  const phone = data.phone ? data.phone.replace(/\s/g, "") : "";
  if (!phone || !/^\+?[0-9]{10,15}$/.test(phone)) {
    return false;
  }

  // Email: валидация формата
  const email = data.email ? data.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }

  return true;
}

// ============================================
// SAVE LEAD TO GOOGLE SHEETS
// ============================================
function saveLead(data) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Лист1");

  sheet.appendRow([
    new Date(),
    data.source || "",
    data.name || "",
    data.phone || "",
    data.email || "",
    data.brandingType || "",
    data.services || "",
    data.page || "",
    "Новая",
    "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || "",
    data.utm_term || "",
    data.utm_content || ""
  ]);
}

// ============================================
// 5. SEND ADMIN EMAIL
// ============================================
function sendAdminEmail(data) {
  const name = data.name || "—";
  const subject = name === "—" ? "New Inquiry" : `New Inquiry — ${name}`;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatValue = (val) => val || "—";

  const body = [
    `Date: ${formatDate(new Date())}`,
    `Form Source: ${formatValue(data.source)}`,
    `Name: ${formatValue(data.name)}`,
    `Phone: ${formatValue(data.phone)}`,
    `Email: ${formatValue(data.email)}`,
    `Brand Type: ${formatValue(data.brandingType)}`,
    `Service: ${formatValue(data.services)}`,
    `Page: ${formatValue(data.page)}`,
    "",
    `Open Lead Database`,
    `→ ${SPREADSHEET_URL}`
  ].join("\n");

  GmailApp.sendEmail(ADMIN_EMAIL, subject, body, {
    name: "Function Design Studio"
  });
}

// ============================================
// 6. AUTO REPLY EMAIL
// ============================================
function getImageBlobFromUrl(url, name) {
  try {
    const response = UrlFetchApp.fetch(url);
    return response.getBlob().setName(name);
  } catch (error) {
    console.error("Error fetching image:", url, error);
    return null;
  }
}

function sendAutoReplyEmail(recipientEmail) {
  if (!recipientEmail) return;

  const htmlBody = HtmlService.createHtmlOutputFromFile('email-template-final')
    .getContent();

  GmailApp.sendEmail(recipientEmail, "We've received your inquiry", "", {
    htmlBody: html,
    name: "Function Design Studio"
  });
}

// ============================================
// UTILITIES
// ============================================
function createResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: success,
      message: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
