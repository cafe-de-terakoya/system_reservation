/**
 * 予約状況表の日付を更新し、予約フォーム内の選択肢（予約可能日時）を更新する。
 * 
 * ※週に複数開催する場合は、updateDateOnWenForTriger() のように、開催数分の関数とINTERVALを用意
 */
function updateDateForTrigger()
{
  (new Promise((resolve, reject) => {
    updateDate(INTERVAL);  // 日付を INTERVAL分 だけずらす
    resolve('updateDate() が正常に実行されました');
  })).then(
    response => {
      Logger.log(response);
      changeFormItem();
      Logger.log('changeFormItem() が updateDate() に続き実行されました');
    }
  );
}


/**
 * 予約状況表の日付を更新する。
 * 
 * ※トリガーにこの関数を設置してもデフォルト引数が適用されないため、トリガー用に updateDateForTrigger() を作成
 * 
 * @param {number} days 予約状況表の最後の日付から進める日数
 */
function updateDate(days = 7) {
  let new_table_values = [TABLE_VALUES[0]];  // ヘッダー行の代入

  let i=2;
  for (let r=ROW_TABLE_FIRST+2; r<=ROW_TABLE_LAST; r++) {
    new_table_values.push(TABLE_VALUES[i]);  // 古い日付の行は要らないので、TABLE_VALUES[2]から
    i++;
  }
  i--;

  const last_date = dayjs.dayjs(TABLE_VALUES[i][0]).add(days, 'day').toDate();

  let value = [last_date];
  for (let c=COL_TABLE_FIRST+1; c<=COL_TABLE_LAST; c++) {
    value.push(NUM_SEAT);
  }
  new_table_values.push(value);

  SS.getRange(ROW_TABLE_FIRST, COL_TABLE_FIRST, ROW_TABLE_LAST, COL_TABLE_LAST).setValues(new_table_values);
}
