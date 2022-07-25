/**
 * 前提：
 * ・予約状況表の1行目が、ヘッダー（時間帯）を表す
 * ・予約状況表の1列目が、ヘッダー（日付）を表す
 * ・予約状況表の1行目と1列目以外が、残り席数を表す
 * 
 * ・予約フォーム質問が「希望日時」「参加者名」「連絡先 (メールアドレス)」の順番
 * ・「希望日時」の回答が、「MM月DD日(曜日) 17-18時」のように、日付と時間帯が半角スペース1つで区切られている
 * 
 * ・Day.js ライブラリを追加している
 * 　バージョン：1
 * 　ID：1ShsRhHc8tgPy5wGOzUvgEhOedJUQD53m-gd8lG2MOgs-dXC_aCZn9lFB
 */


// 基本情報
const NAME = '寺子屋〇〇';
const MAIL = 'info@cafe-de-terakoya.or.jp';
const INTERVAL = 7;  // 週1回開催
/*// 週2回開催の場合
const INTERVAL1 = 3;
const INTERVAL2 = 4;
*/

// 予約フォームを掲載しているHPのURL
const HP_URL = 'https://www.cafe-de-terakoya.or.jp/〇〇002';

// Googleフォーム
const FORM = FormApp.openById('〇〇');  // 編集用のID
const FORM_Q_DATE  = '希望日時';
const FORM_Q_NAME  = '参加者名';
const FORM_Q_EMAIL = 'メールアドレス';
const FORM_Q_TEL   = '電話番号 (初めて参加される場合のみ)';
const FORM_NUM_Q_DATE = 1;  // 予約フォームの質問「希望日時」の位置

// Googleスプレッドシート
const SS_NAME = '予約状況';
const SS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SS_NAME);
const SS_URL = '〇〇';  // 制限付きURL (編集可)

// 予約の最大席数 (スプレッドシート上)
const ROW_NUM_SEAT = 13;
const COL_NUM_SEAT = 2;
const NUM_SEAT = SS.getRange(ROW_NUM_SEAT, COL_NUM_SEAT).getValue();

// 予約状況表 (スプレッドシート上)
const ROW_TABLE_FIRST = 1;
const ROW_TABLE_LAST  = 9;
const COL_TABLE_FIRST = 1;
const COL_TABLE_LAST  = 2;
const TABLE_VALUES = SS.getRange(ROW_TABLE_FIRST, COL_TABLE_FIRST, ROW_TABLE_LAST, COL_TABLE_LAST).getValues();
