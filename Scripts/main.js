// 
// main.js / YDITS for Web  Ver β / Yone
// 

// ----- init ----- //
// --- title --- //
const title   = "YDITS for Web";
const version = "β";

const element_title = document.getElementById("title");
element_title.textContent = title + "  Ver " + version;

// --- settings --- //
const btn = document.getElementById('area_settings');

btn.onclick = function() {
  window_settings = document.getElementById('settings_window');
  window_settings.classList.add('active');
}

const btn_c = document.getElementById('settings_icon_close');

btn_c.onclick = function() {
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

// --- init let --- //
let scene = 0;
let p2p_id_last;

let loopCnt_info = -1;
let loopCnt_clock = -1;
// ----- Mainloop ----- //

function mainloop(){
  let DT = new Date();
  let timeHour = setTime(DT.getHours());
  let timeMinute = setTime(DT.getMinutes());
  let timeSecond = setTime(DT.getSeconds());
  let content = timeHour + ':' + timeMinute + ":" + timeSecond;

  switch(scene){
    case 0:
      if (DT - loopCnt_info >= 1000 * p2p_time){
        loopCnt_info = DT;
        information();
      }
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


// --- information --- //
function information(){
  const url_p2p = "https://api.p2pquake.net/v2/history?codes=551&limit=1";

  const Response = fetch(url_p2p)
    .then(Response => Response.json())
    .then(data => {
      p2p_data = data;

      p2p_id = p2p_data[0]['id'];
      if (p2p_id != p2p_id_last){
        let p2p_id_last = p2p_id;

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
        // --- Area EEW --- //
        document.getElementById("area_eew_Title").textContent = "(開発中) 緊急地震速報"

        // --- Area information --- //
        document.getElementById("area_info_Title").textContent      = p2p_type
        document.getElementById("area_info_time").textContent       = "発生日時：" + p2p_latest_time
        document.getElementById("area_info_hypocenter").textContent = "　震源　：" + p2p_hypocenter
        document.getElementById("area_info_maxScale").textContent   = p2p_maxScale
        document.getElementById("area_info_magnitude").textContent  = "　規模　：" + p2p_magnitude
        document.getElementById("area_info_depth").textContent      = "　深さ　：" + p2p_depth

        // --- Area history --- //8
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
