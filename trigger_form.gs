/**
 * 予約フォームに回答があったら、予約状況表を更新し、予約者と管理者それぞれにメールで通知する。
 * 
 * @param {Object[]} e 予約フォームの回答結果
 */
function responsedForm(e) {
  if (e.namedValues[FORM_Q_DATE] == '現在開催予定分は予約が埋まっています' 
  || e.namedValues[FORM_Q_DATE] == '次回の開催予定の更新までお待ちください') {
    Logger.log('残り席数がない状態で予約希望がありました。特に更新は行いません');
    
  } else {
    const first_question = String(e.namedValues[FORM_Q_DATE]).split(' ');
    const date = first_question[0];  // 回答された希望日時のうち、日付部分
    const time = first_question[1];  // 回答された希望日時のうち、時間帯部分
    const name = e.namedValues[FORM_Q_NAME];
    const mail = e.namedValues[FORM_Q_EMAIL];

    var tel = e.namedValues[FORM_Q_TEL];
    if (tel == false) {
      tel = '未記入';
    } else {
      // NOTHING
    }

    // 回答内容をもとに予約状況表を更新
    const remaining_seat = updateSeat(date, time, name);

    // 予約者にメールを送信
    const subject_user = getSubjectForUser(remaining_seat);
    const message_user = getMessageForUser(remaining_seat, date, time, name, tel);
    GmailApp.sendEmail(mail, subject_user, message_user, {from: MAIL, name: NAME});

    // 管理者にメールを送信
    const subject_admin = getSubjectForAdmin(remaining_seat);
    const message_admin = getMessageForAdmin(remaining_seat, date, time, name, mail, tel);
    GmailApp.sendEmail(MAIL, subject_admin, message_admin);
  }
}


/**
 * 予約状況表の残り席数を更新し、残り席数を返す。
 * 
 * @param {string} date 更新対象の日付
 * @param {string} time 更新対象の時間帯
 * @return {number} 更新対象の残り席数
 */
function updateSeat(date, time, name) {
  // 更新対象のセルの行,列を特定
  // 予約状況表の最初の行,列はヘッダーである点を考慮
  const row = 1 + TABLE_VALUES.findIndex(
    function(element){
      return getFormatedDate(element[0]) == date;
    });
  const col = 1 + TABLE_VALUES[0].indexOf(time);

  // 更新対象のセルの残り席数を1つ減らす
  const remaining_seat = TABLE_VALUES[row-1][col-1] - 1;

  if (remaining_seat < 0) {
    Logger.log('予約が競合し、最大席数を超えた予約がされため、' + name + '様の予約は自動的にキャンセルされました');
  } else {
    TABLE_VALUES[row-1][col-1] = remaining_seat;
    SS.getRange(row, col).setValue(remaining_seat);
    changeFormItem();
  }

  return remaining_seat;
}
