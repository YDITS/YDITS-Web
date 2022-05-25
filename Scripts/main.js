// 
// main.js / YDITS for Web  Ver β / Yone
// 

// ----- init ----- //
const title   = "YDITS for Web";
const version = "β";

// --- settings --- //
document.getElementById('area_settings').onclick = function() {
  window_settings = document.getElementById('settings_window');
  window_settings.classList.add('active');
}

document.getElementById('settings_icon_close').onclick = function() {
  window_settings = document.getElementById('settings_window');
  window_settings.classList.remove('active');
}

const bar_cnt = document.getElementById('settings_bar_cnt');
let p2p_time = bar_cnt.value;
document.getElementById("settings_put_cnt").textContent = p2p_time;

bar_cnt.oninput = function(){
  p2p_time = bar_cnt.value;
  document.getElementById("settings_put_cnt").textContent = p2p_time;
}

const bar_cnt_NIED = document.getElementById('settings_bar_cnt_NIED');
let NIED_time = bar_cnt_NIED.value;
document.getElementById("settings_put_cnt_NIED").textContent = NIED_time;

bar_cnt_NIED.oninput = function(){
  NIED_time = bar_cnt_NIED.value;
  document.getElementById("settings_put_cnt_NIED").textContent = NIED_time;
}

// --- init let --- //
let scene = 0;
let p2p_id_last;
let NIED_repNum_last;

let loopCnt_info = -1;
let loopCnt_clock = -1;
let loopCnt_eew = -1;

// ----- Mainloop ----- //
function mainloop(){
  let DT = new Date();
  let timeYear = setTime(DT.getFullYear());
  let timeMonth = setTime(DT.getMonth() + 1);
  let timeDay = setTime(DT.getDate());
  let timeHour = setTime(DT.getHours());
  let timeMinute = setTime(DT.getMinutes());
  let timeSecond = setTime(DT.getSeconds());
  let content = timeHour + ':' + timeMinute + ":" + timeSecond;

  switch(scene){
    case 0:
      // NIED EEW
      if (DT - loopCnt_eew >= 1000 * NIED_time){
        loopCnt_eew = DT;
        eew();
      }

      // P2P EQ info
      if (DT - loopCnt_info >= 1000 * p2p_time){
        loopCnt_info = DT;
        information();
      }

      // Clock
      if (DT - loopCnt_clock >= 1000 * 1){
        loopCnt_clock = DT;
        clock(content);
      }
  }
}

// ----- Main ----- //
setInterval('mainloop()', 1000 / 30);

// ----- functions ----- //
// --- EEW --- //
async function eew(){
  let DT = new Date();
  let timeYear = setTime(DT.getFullYear());
  let timeMonth = setTime(DT.getMonth() + 1);
  let timeDay = setTime(DT.getDate());
  let timeHour = setTime(DT.getHours());
  let timeMinute = setTime(DT.getMinutes());
  let timeSecond = setTime(DT.getSeconds());

  let NIED_repNum;

  const NIED_DT = String(timeYear) + String((timeMonth)) + String(timeDay) + String(timeHour) + String(timeMinute) + String(timeSecond)
  const url_NIED = `https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/${NIED_DT}.json`
  // const url_NIED = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json"

  const Response = await fetch(url_NIED)
  .then(Response => {
    if (!Response.ok) {
      throw new Error(`${Response.status} ${Response.statusText}`);
    }
    return Response.json()
  })
  .then(result => {
    let NIED_data = result;

    NIED_repNum = NIED_data['report_num'];
    if (NIED_repNum != NIED_repNum_last){
      NIED_repNum_last = NIED_repNum;

      // --- Final report --- //
      NIED_isFinal = NIED_data['is_final'];

      if (NIED_isFinal){
        NIED_repNum = '最終報';
      }

      // --- Origin time --- //
      NIED_origin_time = NIED_data['origin_time'];
      // datetime
      NIED_timeYear   = NIED_origin_time.substring(0 , 4);
      NIED_timeMonth  = NIED_origin_time.substring(4 , 6);
      NIED_timeDay    = NIED_origin_time.substring(6 , 8);
      NIED_timeHour   = NIED_origin_time.substring(8 , 10);
      NIED_timeMinute = NIED_origin_time.substring(10, 12);
      NIED_timeSecond = NIED_origin_time.substring(12, 14);

      // --- Region name --- //
      NIED_Region_name = NIED_data['region_name'];

      if (!NIED_Region_name){
        NIED_Region_name = '不明';
      }

      // --- Calcintensity --- //
      NIED_calcintensity = NIED_data['calcintensity'];

      if (!NIED_calcintensity){
        NIED_calcintensity = '不明';
      }

      // --- Magnitude --- //
      NIED_Magnitude = NIED_data['magunitude'];

      if (NIED_Magnitude){
        NIED_Magnitude = 'M' + NIED_Magnitude;
      } else {
        NIED_Magnitude = '不明';
      }

      // --- Depth --- //
      NIED_depth = NIED_data['depth'];

      if (NIED_depth){
        NIED_depth = '約' + NIED_depth;
      } else {
        NIED_depth = '不明';
      }

      // --- alert flag --- //
      if (NIED_repNum){
        NIED_alertFlg = NIED_data['alertflg'];

        if (!NIED_alertFlg){
          NIED_alertFlg = '{Null}';
        }
      }

      // --- Is cansel --- //
      NIED_isCansel = NIED_data['is_cancel'];

      if (NIED_isCansel){
        NIED_alertFlg = '取消報';
      }
    }
  })
  .catch((reason) => {
    console.log(reason);
  });

  // ----- put ----- //
  if (NIED_repNum){
    document.getElementById("area_eew_Title").textContent = "緊急地震速報 " + NIED_alertFlg + " (第" + NIED_repNum + "報)";
    document.getElementById("area_eew_calcintensity_para").textContent = NIED_calcintensity;
    document.getElementById("area_eew_region").textContent = NIED_Region_name;
    document.getElementById("area_eew_origin_time").textContent = NIED_timeYear + '/' + NIED_timeMonth + '/' + NIED_timeDay + ' ' + NIED_timeHour + ':' + NIED_timeMinute;
    document.getElementById("area_eew_magnitude").textContent = "規模：" + NIED_Magnitude;
    document.getElementById("area_eew_depth").textContent = "深さ：" + NIED_depth;
  } else {
    document.getElementById("area_eew_Title").textContent = "緊急地震速報は発表されていません";
  }
}

// --- information --- //
function information(){
  const url_p2p = "https://api.p2pquake.net/v2/history?codes=551&limit=1";

  const Response = fetch(url_p2p)
    .then(Response => Response.json())
    .then(data => {
      p2p_data = data;

      p2p_id = p2p_data[0]['id'];
      if (p2p_id != p2p_id_last){
        p2p_id_last = p2p_id;

        // --- time --- //
        p2p_latest_time = p2p_data[0]['earthquake']['time'];
        // datetime
        p2p_latest_timeYear   = p2p_latest_time.substring(0 , 4);
        p2p_latest_timeMonth  = p2p_latest_time.substring(5 , 7);
        p2p_latest_timeDay    = p2p_latest_time.substring(8 , 10);
        p2p_latest_timeHour   = p2p_latest_time.substring(11, 13);
        p2p_latest_timeMinute = p2p_latest_time.substring(14, 16);
        p2p_latest_timeSecond = p2p_latest_time.substring(17, 19);

        // --- type --- //
        p2p_type = p2p_data[0]['issue']['type'];

        p2p_types = {
          'ScalePrompt': '震度速報',
          'Destination': '震源情報',
          'ScaleAndDestination': '震源・震度情報',
          'DetailScale': '地震情報',
          'Other': '地震情報'
        };

        p2p_type = p2p_types[p2p_type];

        // --- hypocenter --- //
        p2p_hypocenter = p2p_data[0]['earthquake']['hypocenter']['name'];

        if (p2p_hypocenter == ''){
          p2p_hypocenter = '調査中';
        }

        // --- maxScale --- //
        p2p_maxScale = p2p_data[0]['earthquake']['maxScale'];

        switch (p2p_maxScale){
          case -1: p2p_maxScale = '調査中'; break;
          case 10: p2p_maxScale = '1'; break;
          case 20: p2p_maxScale = '2'; break;
          case 30: p2p_maxScale = '3'; break;
          case 40: p2p_maxScale = '4'; break;
          case 45: p2p_maxScale = '5弱'; break;
          case 50: p2p_maxScale = '5強'; break;
          case 55: p2p_maxScale = '6弱'; break;
          case 60: p2p_maxScale = '6強'; break;
          case 70: p2p_maxScale = '7'; break;
        }

        // --- Magnitude --- //
        p2p_magnitude = p2p_data[0]['earthquake']['hypocenter']['magnitude'];

        if(p2p_magnitude == -1){
          p2p_magnitude = '調査中';
        } else {
          p2p_magnitude = 'M' + String(p2p_magnitude);
        }

        // --- Depth --- //
        p2p_depth = p2p_data[0]['earthquake']['hypocenter']['depth'];

        if (p2p_depth == -1){
          p2p_depth = '調査中';
        } else if (p2p_depth == 0){
          p2p_depth = 'ごく浅い';
        } else {
          p2p_depth = '約' + String(p2p_depth) + 'km';
        }

        // --- Tsunami --- //
        p2p_tsunami = p2p_data[0]['earthquake']['domesticTsunami'];

        tsunamiLevels = {
          'None': 'この地震による津波の心配はありません。',
          'Unknown': '津波の影響は不明です。',
          'Checking': '津波の影響を現在調査中です。',
          'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
          'Watch': 'この地震で津波注意報が発表されています。',
          'Warning': 'この地震で津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
        };

        p2p_tsunami = tsunamiLevels[p2p_tsunami];

        // ----- put ----- //
        document.getElementById("area_info_Title").textContent      = p2p_type
        document.getElementById("area_info_time").textContent       = "" + p2p_latest_time
        document.getElementById("area_info_hypocenter").textContent = "" + p2p_hypocenter
        document.getElementById("area_info_maxScale_para").textContent   = p2p_maxScale
        document.getElementById("area_info_magnitude").textContent  = "規模：" + p2p_magnitude
        document.getElementById("area_info_depth").textContent      = "深さ：" + p2p_depth

        document.getElementById("area_history_Title").textContent = "(開発中) 地震履歴 直近２０件"

      }
    });
}

// --- Clock --- //
function clock(content){
  document.getElementById("area_clock_para").textContent = content
}

// 二桁に修正
function setTime(num) {
  let ret;
  if ( num < 10 ){
    ret = "0" + num;
  } else {
    ret = num;
  }
  return ret;
}
