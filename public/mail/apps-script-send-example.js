/**
 * Пример отправки auto-reply письма из Google Apps Script
 * с картинками, встроенными через CID (а не через ссылки на внешний хостинг
 * и не через data URI — так надёжнее всего работает в Outlook).
 *
 * Как использовать:
 * 1. Загрузите email-template-final.html, logo@2x.png, whatsapp@2x.png,
 *    telegram@2x.png в файлы проекта Apps Script (или в Google Drive
 *    и получите их как Blob через DriveApp).
 * 2. Вставьте этот код в ваш существующий Apps Script проект
 *    (там же, где сейчас обрабатывается запись в Google Sheets).
 */

function sendAutoReplyEmail(recipientEmail) {
  // HTML-шаблон письма (тот же файл, что и email-template-final.html)
  var htmlBody = HtmlService.createHtmlOutputFromFile('email-template-final')
    .getContent();

  // Картинки нужно один раз загрузить как файлы в проект Apps Script
  // (Files -> вкладка HTML, добавить как отдельные файлы),
  // либо хранить в Google Drive и получать через DriveApp.getFileById(...).getBlob()
  var logoBlob = DriveApp.getFileById('YOUR_LOGO_FILE_ID').getBlob().setName('logo');
  var whatsappBlob = DriveApp.getFileById('YOUR_WHATSAPP_FILE_ID').getBlob().setName('whatsapp');
  var telegramBlob = DriveApp.getFileById('YOUR_TELEGRAM_FILE_ID').getBlob().setName('telegram');

  GmailApp.sendEmail(recipientEmail, "We've received your inquiry", '', {
    htmlBody: htmlBody,
    inlineImages: {
      logo: logoBlob,
      whatsapp: whatsappBlob,
      telegram: telegramBlob
    },
    name: 'Function Design Studio'
  });
}
