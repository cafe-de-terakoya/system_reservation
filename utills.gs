/**
 * 2次元配列のコピーを作成する。
 * 
 * @param {Object[]} base コピー元の2次元配列
 * @return {Object[]} コピーした2次元配列
 */
function copyMatrix(base) {
  let copy = [];
  for (let row of base) { 
    copy.push([...row]);
  }
  return copy;
}


/**
 * Dateオブジェクトを「MM月DD日(曜日)」に整形する。
 * 
 * @param {Object} target 変換したいDate型オブジェクト
 * @return {string} 整形後のtarget (Date型オブジェクト)
 */
function getFormatedDate(target) {
  const day_obj = dayjs.dayjs(target);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const num_day = day_obj.format('d');
  const day = days[num_day];

  return day_obj.format('MM/DD(' + day + ')');
}


/**
 * 予約状況表をもとに、予約フォームの質問「希望日時」の選択肢を更新する。
 */
function changeFormItem() {
  let question_about_date = FORM.getItems()[FORM_NUM_Q_DATE-1];
  let choices_date = [];  // 予約フォームの質問「希望日時」の選択肢

  // updateDate() 後の値が欲しいので、global_variable.gs の TABLE_VALUE は使わず、新たに取得
  const table_values = SS.getRange(ROW_TABLE_FIRST, COL_TABLE_FIRST, ROW_TABLE_LAST, COL_TABLE_LAST).getValues();

  // 予約状況表の最初の行,列はヘッダーなので、r,cは1からスタート
  for (let r=1; r <= (ROW_TABLE_LAST-ROW_TABLE_FIRST); r++) {
    for (let c=1; c <= (COL_TABLE_LAST-COL_TABLE_FIRST); c++) {
      // 予約状況表の 残り席=0 以外のセルに該当する日付と時間帯を、半角スペースを挟んで結合し、質問の選択肢に加える
      if (table_values[r][c] > 0) {
        const value = getFormatedDate(table_values[r][COL_TABLE_FIRST-1]) + ' ' + table_values[ROW_TABLE_FIRST-1][c];
        choices_date.push(value);
      } else {
        // NOTHING
      }
    }
  }

  if (choices_date.length === 0) {
    choices_date.push('現在開催予定分は予約が埋まっています');
    choices_date.push('次回の開催予定の更新までお待ちください');
  }

  question_about_date.asListItem().setChoiceValues(choices_date);
}


/**
 * 予約時に予約者に送るメールの件名を返す。
 * 
 * @param {number} remaining_seat 予約後の残り席数
 * @return {string} 予約者に送るメールの件名
 */
function getSubjectForUser(remaining_seat) {
  let subject = '';
  if (remaining_seat < 0) {
    subject = '申し訳ございませんが、ご予約を完了できませんでした (' + NAME + ')';
  } else {
    subject = 'ご予約を承りました (' + NAME + ')';
  }
  return subject;
}


/**
 * 予約時に管理者に送るメールの件名を返す。
 * 
 * @param {number} remaining_seat 予約後の残り席数
 * @return {string} 管理者に送るメールの件名
 */
function getSubjectForAdmin(remaining_seat) {
  let subject = '';
  if (remaining_seat < 0) {
    subject = '予約に競合が発生しました (' + NAME + ')';
  } else {
    subject = '予約通知 (' + NAME + ')';
  }
  return subject;
}


/**
 * 予約時に予約者に送るメールの本文を返す。
 * 
 * @param {number} remaining_seat 予約後の残り席数
 * @param {string} date 予約希望の日付
 * @param {string} time 予約希望の時間帯
 * @param {string} name 参加予定者
 * @param {string} tel 予約者の電話番号
 * @return {string} 予約者に送るメールの本文
 */
function getMessageForUser(remaining_seat, date, time, name, tel) {
  let message = ``;

  if (remaining_seat < 0) {
    message = `申し訳ございませんが、以下の日時で予約を完了できませんでした。
希望日時：${date} ${time}

ご覧になった予約表が更新されていなかった可能性がございます。
お手数ですが、以下のURLから再度お試しいただきますようお願いいたします。
${HP_URL}

何かご不明な点がございましたら、以下のメールアドレスまでご連絡ください。
${MAIL}

※こちらは自動送信メールです。`;

  } else {
    message = `ご予約ありがとうございます。

以下の内容で予約を承りました。
希望日時：${date} ${time}
参加者：${name}
電話番号：${tel}

予約をキャンセルする場合は、お手数ですが以下のメールアドレスまでご連絡ください。
${MAIL}
  
それでは当日、お待ちしております！

※こちらは自動送信メールです。`;
  }

  return message;
}


/**
 * 予約時に管理者に送るメールの本文を返す。
 * 
 * @param {number} remaining_seat 予約後の残り席数
 * @param {string} date 予約希望の日付
 * @param {string} time 予約希望の時間帯
 * @param {string} name 参加予定者
 * @param {string} mail 予約者のメールアドレス
 * @param {string} tel 予約者の電話番号
 * @return {string} 管理者に送るメールの本文
 */
function getMessageForAdmin(remaining_seat, date, time, name, mail, tel) {
  let message = ``;

  if (remaining_seat < 0) {
    message = `以下の日時で予約がありましたが、他の予約と競合したため、キャンセルしました。
希望日時：${date} ${time}
参加者：${name}
メールアドレス：${mail}
電話番号：${tel}

更新されていない予約表から予約を行った可能性があります。
予約者には、再度お試しいただくよう案内済みです。

予約状況の詳細は、以下のスプレッドシートからご確認ください。
URL：${SS_URL}
※このURLは、Googleアカウント (${MAIL}) にログインしている場合のみ確認できます。

必要な措置は特にありませんが、予約者から連絡があった場合は対応をお願いいたします。

※こちらは自動送信メールです。`;

  } else {
    message = `以下の内容で予約がありました。
希望日時：${date} ${time}
参加者：${name}
メールアドレス：${mail}
電話番号：${tel}

${date} ${time} の席数は残り ${remaining_seat} 席 です。

予約をキャンセルする場合は、予約者からメールで連絡するよう案内済みです。

予約状況の詳細は、以下のスプレッドシートからご確認ください。
URL：${SS_URL}
※このURLは、Googleアカウント (${MAIL}) にログインしている場合のみ確認できます。

※こちらは自動送信メールです。`;
  }

  return message;
}
