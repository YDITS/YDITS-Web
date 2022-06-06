//
// main.js / YDITS for Web  Ver 1.0.0 / Yone
//

const name_project = "YDITS for Web";
const ver_project = 0x010000;

let scene = 0;

let programCnt = -1;

let loopCnt_fps = -1;
let fps         = -1;

let loopCnt_info     = -1;
let p2p_time         = -1;
let p2p_id_last      = -1;
let loopCnt_eew      = -1;
let EEW_time        = -1;
let EEW_repNum_last = -1;
let loopCnt_clock    = -1;

window.onload = function(){
  page_init();

  win('window_info', "お知らせ");

  $(document).on('click', '#window_info .navBar .close', function(){
    $(`#window_info`).remove();
  })

  $('#window_info .content').html(`
    <p>
      ご利用前に必ず
      <a href='https://yone1130.github.io/site/YDITS/terms/' target='_brank'>
        YDITS利用規約
      </a>
      をご確認ください。
    </p>
    <p>
      また、現在 緊急地震速報と地震履歴の機能はご利用いただけませんのでご注意ください。
    </p>
    <button class="button_ok">OK</button>
  `)

  $('#window_info .content .button_ok').css({
    'position': 'absolute',
    'bottom': '2em',
    'right': '2em',
    'width': '10em',
    'height': '1.8em'
  })

  $(document).on('click', '#window_info .content .button_ok', function(){
    $(`#window_info`).remove()
  })

  $('#window_info .content').css({
    'padding': '1em'
  })

  $('#window_info .content p').css({
    'margin-bottom': '.5em'
  })
}

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
      // EEW EEW
      if (DT - loopCnt_eew >= 1000 * EEW_time){
        loopCnt_eew = DT;
        eew();
        // $('#eew .info').text("緊急地震速報は発表されていません");
        // $('#eew .origin_time').text("この機能は現在ご利用いただけません");
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

  switch (scene) {
    case 0:
      
      break;
  
    default:
      break;
  }

  requestAnimationFrame(mainloop);
}

mainloop();

// ----- Page ----- //
function page_init(){
  $('header .title').text(name_project)

  settings_init();

  select_init();
}

// --- Window --- //
function win(winId, winTitle){
  
  let newHTML = `
  <dialog class="window" id=${winId}>
    <div class="navBar">
      <p class="title"></p>
      <span class="close material-symbols-outlined">close</span>
    </div>
  
    <div class="content">
    </div>
  </dialog>
  `

  document.body.innerHTML += newHTML

  $(`#${winId} .navBar .title`).text(winTitle);

  $(document).on('click', `#${winId} .navBar .close`, function(){
    $(`#${winId}`).remove()
  })

  $(document).on('mousedown', `#${winId} .navBar`, function(event){
    let win = $(`#${winId}`)[0]
  
    $(`#${winId}`)
      .data("clickPointX" , event.pageX - $(`#${winId}`).offset().left)
      .data("clickPointY" , event.pageY - $(`#${winId}`).offset().top);
  
    $(document).mousemove(`#${winId}`, function(event){
      win.style.left = event.pageX - $(`#${winId}`).data("clickPointX") + 'px';
      win.style.top = event.pageY - $(`#${winId}`).data("clickPointY") + 'px';
      win.style.right = 'auto';
      win.style.bottom = 'auto';
    })
  }).on('mouseup', `#${winId} .navBar`, function(){
    $(document).unbind("mousemove")
  });
};

// --- Settings --- //
function settings_init(){
  $(document).on('click', '#btn_settings', function(){
    window_settings = $('#settings_window');
    window_settings.toggleClass('active');
  });

  $(document).on('click', '#settings_window .close', function(){
    window_settings = $('#settings_window');
    window_settings.removeClass('active');
  });

  p2p_time = $('#settings_bar_cnt').val();
  $('#settings_put_cnt').text(p2p_time);

  $(document).on('input', '#settings_bar_cnt', function(){
    p2p_time = $('#settings_bar_cnt').val();
    $('#settings_put_cnt').text(p2p_time);
  });

  EEW_time = $('#settings_bar_cnt_NIED').val();
  $('#settings_put_cnt_NIED').text(EEW_time);

  $(document).on('input', '#settings_bar_cnt_NIED', function(){
    EEW_time = $('#settings_bar_cnt_NIED').val();
    $('#settings_put_cnt_NIED').text(EEW_time);
  });

  $(document).on('click', '#btn_earthquake_info_chk_sound', function(){
    // const p2p_sound = new Audio("file:///C:/Git/repos/YDITS-Web/Sounds/gotNewInfo.wav");
    const p2p_sound = new Audio("https://yone1130.github.io/YDITS-Web/Sounds/gotNewInfo.wav");
    p2p_sound.play();
  });
};

// ----- select ----- //
function select_init(){
  $('#eew').addClass('active');

  $(document).on('click', '#btn_eew', function(){
    reset_show();
    $('#eew').addClass('active');
    console.log('A')
  })
  $(document).on('click', '#btn_info', function(){
    reset_show();
    $('#earthquake_info').addClass('active');
  })
  $(document).on('click', '#btn_history', function(){
    reset_show();
    $('#earthquake_history').addClass('active');
  })
}

function reset_show(){
  $('main>.content').removeClass('active');
}

// ----- EEW ----- //
function eew(){
  let DT = new Date();
  let timeYear = setTime(DT.getFullYear());
  let timeMonth = setTime(DT.getMonth() + 1);
  let timeDay = setTime(DT.getDate());
  let timeHour = setTime(DT.getHours());
  let timeMinute = setTime(DT.getMinutes());
  let timeSecond = setTime(DT.getSeconds());

  let EEW_repNum;

  const EEW_Date = String(timeYear) + String((timeMonth)) + String(timeDay);
  const EEW_DT = String(timeYear) + String((timeMonth)) + String(timeDay) + String(timeHour) + String(timeMinute) + String(timeSecond);
  // const url_EEW = `https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/${EEW_Date}/${EEW_DT}.json`;
  const url_EEW = "https://weather-kyoshin.east.edge.storage-yahoo.jp/RealTimeData/20220529/20220529155631.json";
  // const url_NIED = "https://www.lmoni.bosai.go.jp/monitor/webservice/hypo/eew/20220330001911.json";

  console.log(url_EEW);

  response = fetch(url_EEW)
  .then(Response => {
    if (!Response.ok) {
      throw new Error(`${Response.status} ${Response.statusText}`);
    }
    return Response.json()
    console.log('Got EEW data')
  })
  .then(result => {

    
    let EEW_data = result;
    
    EEW_repNum = EEW_data["hypoInfo"]["items"][0]["reportNum"];
    console.log(EEW_repNum)
    if (EEW_repNum != EEW_repNum_last){
      EEW_repNum_last = EEW_repNum;

      // --- Final report --- //
      EEW_isFinal = EEW_data["hypoInfo"]["items"][0]["isFinal"];
      
      if (EEW_isFinal){
        EEW_repNum = '最終報';
      }
      
      // --- Origin time --- //
      EEW_origin_time = new Date(Date.parse(EEW_data["hypoInfo"]["items"][0]["originTime"]));
      // datetime
      EEW_timeYear   = EEW_origin_time.substring(0 , 4);
      EEW_timeMonth  = EEW_origin_time.substring(4 , 6);
      EEW_timeDay    = EEW_origin_time.substring(6 , 8);
      EEW_timeHour   = EEW_origin_time.substring(8 , 10);
      EEW_timeMinute = EEW_origin_time.substring(10, 12);
      EEW_timeSecond = EEW_origin_time.substring(12, 14);
      
      // --- Region name --- //
      EEW_Region_name = EEW_dataJson["hypoInfo"]["items"][0]["regionName"];
      
      if (!EEW_Region_name){
        EEW_Region_name = '不明';
      }
      
      // --- Calcintensity --- //
      EEW_calcintensity = EEW_data["hypoInfo"]["items"][0]["calcintensity"];
      
      switch (EEW_calcintensity) {
        case '01': EEW_calcintensity = "1"; break;
        case '02': EEW_calcintensity = "2"; break;
        case '03': EEW_calcintensity = "3"; break;
        case '04': EEW_calcintensity = "4"; break;
        case '5-': EEW_calcintensity = "5-"; break;
        case '5+': EEW_calcintensity = "5+"; break;
        case '6-': EEW_calcintensity = "6-"; break;
        case '6+': EEW_calcintensity = "6+"; break;
        case '07': EEW_calcintensity = "7"; break;

        default:
          break;
      }

      if (!EEW_calcintensity){
        EEW_calcintensity = '不明';
      }

      // --- Magnitude --- //
      EEW_Magnitude = EEW_data["hypoInfo"]["items"][0]["magnitude"];

      if (EEW_Magnitude){
        EEW_Magnitude = 'M' + EEW_Magnitude;
      } else {
        EEW_Magnitude = '不明';
      }
      
      // --- Depth --- //
      EEW_depth = EEW_data["hypoInfo"]["items"][0]["depth"];
      
      if (EEW_depth){
        EEW_depth = '約' + EEW_depth;
      } else {
        EEW_depth = '不明';
      }
      
      // --- alert flag --- //
      // if (EEW_repNum){
      //   EEW_alertFlg = EEW_data['alertflg'];
        
      //   if (!EEW_alertFlg){
      //     EEW_alertFlg = '{Null}';
      //   }
      // }

      let EEW_alertFlg = '{Null}';

      // --- Is cansel --- //
      EEW_isCansel = EEW_data["hypoInfo"]["items"][0]['isCancel'];
      
      if (EEW_isCansel){
        EEW_alertFlg = '取消報';
      }
    }

    // ----- put ----- //
    if (EEW_repNum != ""){
      $('#eew .info').text("緊急地震速報 " + EEW_alertFlg + " (第" + EEW_repNum + "報)");
      $('#eew .calcintensity_para').text(EEW_calcintensity);
      $('#eew .region').text(EEW_Region_name);
      $('#eew .origin_time').text(EEW_timeYear + '/' + EEW_timeMonth + '/' + EEW_timeDay + ' ' + EEW_timeHour + ':' + EEW_timeMinute);
      $('#eew .magnitude').text("規模：" + EEW_Magnitude);
      $('#eew .depth').text("深さ：" + EEW_depth);
    } else {
      $('#eew .info').text("緊急地震速報は発表されていません");
    }
  })
  .catch((reason) => {
    console.log('A');
    // console.log(reason);
  });
};

// ----- information ----- //
function information(){
  const url_p2p = "https://api.p2pquake.net/v2/history?codes=551&limit=1";

  const Response = fetch(url_p2p)
    .then(Response => Response.json())
    .then(data => {
      p2p_data = data;

      p2p_id = p2p_data[0]['id'];
      if (p2p_id != p2p_id_last){
        p2p_id_last = p2p_id;

        // const p2p_sound = new Audio("file:///C:/Git/repos/YDITS-Web/Sounds/gotNewInfo.wav");
        const p2p_sound = new Audio("https://yone1130.github.io/YDITS-Web/Sounds/gotNewInfo.wav");
        p2p_sound.play();

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
          'DetailScale': '各地の震度情報',
          'Foreign': '遠地地震情報',
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
          'None': '津波の心配はありません。',
          'Unknown': '津波の影響は不明です。',
          'Checking': '津波の影響を現在調査中です。',
          'NonEffective': '若干の海面変動が予想されますが、被害の心配はありません。',
          'Watch': '津波注意報が発表されています。',
          'Warning': '津波警報等（大津波警報・津波警報あるいは津波注意報）が発表されています。'
        };

        p2p_tsunami = tsunamiLevels[p2p_tsunami];

        // ----- put ----- //
        $('#earthquake_info .info').text(p2p_type);
        $('#earthquake_info .time').text(p2p_latest_time);
        $('#earthquake_info .hypocenter').text(p2p_hypocenter);
        $('#earthquake_info .maxScale .para').text(p2p_maxScale);
        $('#earthquake_info .magnitude').text("規模：" + p2p_magnitude);
        $('#earthquake_info .depth').text("深さ：" + p2p_depth);
        $('#earthquake_info .tsunami').text(p2p_tsunami);

        $('#earthquake_history .info').text("この機能は現在ご利用いただけません");

      }
    });
};

// --- Clock --- //
function clock(content){
  $('#area_clock .para').text(content);
};

// 二桁に修正
function setTime(num) {
  let ret;
  if ( num < 10 ){
    ret = "0" + num;
  } else {
    ret = num;
  }
  return ret;
};
