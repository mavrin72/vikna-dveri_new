// Вебхук заявок сайту vikna-dveri.store → Telegram (+ Google Таблиця, якщо задана).
// Копія коду з Google Apps Script. Токен бота тут НЕ зберігається —
// у самому Apps Script лишіть свій рядок з TELEGRAM_TOKEN.

const TELEGRAM_TOKEN = 'ВСТАВТЕ_СВІЙ_ТОКЕН';
const CHAT_ID = '-5232443924';

// ID таблиці для журналу заявок (частина посилання між /d/ та /edit).
// Порожньо — заявки в таблицю не пишуться, лише в Telegram.
const SHEET_ID = '';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Блокуємо порожні та спам-запити
    if (!data.name || !data.phone ||
        data.name === 'Не вказано' || data.phone === 'Не вказано' ||
        data.name.trim() === '' || data.phone.trim() === '') {
      return ContentService.createTextOutput('blocked');
    }

    const name    = data.name.trim();
    const phone   = data.phone.trim();
    const city    = data.city || 'Не вказано';
    const product = data.product || 'Не обрано';
    const comment = data.comment || 'Немає';

    const message =
      '🔔 <b>Нова заявка з сайту Вікна @ двері!</b>\n\n' +
      '👤 <b>Ім\'я:</b> ' + esc(name) + '\n' +
      '📞 <b>Телефон:</b> ' + esc(phone) + '\n' +
      '🪟 <b>Продукт:</b> ' + esc(product) + '\n' +
      '🌆 <b>Населений пункт:</b> ' + esc(city) + '\n' +
      '💬 <b>Коментар:</b> ' + esc(comment);

    // 1. Спершу Telegram — це головне
    const tg = sendToTelegram(message);

    // 2. Потім таблиця — її збій не повинен губити заявку
    try {
      if (SHEET_ID) {
        SpreadsheetApp.openById(SHEET_ID).getSheets()[0]
          .appendRow([new Date(), name, "'" + phone, city, product, comment]);
      }
    } catch (sheetErr) {
      console.error('Таблиця:', sheetErr.message);
    }

    if (!tg.ok) {
      return ContentService.createTextOutput('error: telegram ' + tg.description);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Помилка в doPost:', error.message);
    return ContentService.createTextOutput('error: ' + error.message);
  }
}

function sendToTelegram(text) {
  const props = PropertiesService.getScriptProperties();
  const chatId = props.getProperty('CHAT_ID') || CHAT_ID;

  let res = postToTelegram(chatId, text);

  // Групу перетворили на супергрупу — Telegram повідомляє новий ID чату.
  // Запам'ятовуємо його і повторюємо відправку.
  const newId = res.parameters && res.parameters.migrate_to_chat_id;
  if (!res.ok && newId) {
    props.setProperty('CHAT_ID', String(newId));
    res = postToTelegram(String(newId), text);
  }
  if (!res.ok) console.error('Telegram:', res.description);
  return res;
}

function postToTelegram(chatId, text) {
  const response = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
      muteHttpExceptions: true
    });
  try {
    return JSON.parse(response.getContentText());
  } catch (e) {
    return { ok: false, description: 'HTTP ' + response.getResponseCode() };
  }
}

// Дані з форми можуть містити < > & — у HTML-режимі Telegram це ламає повідомлення
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Перевірка вручну: у редакторі оберіть testTelegram і натисніть «Виконати»
function testTelegram() {
  const res = sendToTelegram('✅ Тест вебхука сайту Вікна @ двері');
  console.log(JSON.stringify(res));
}

function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
