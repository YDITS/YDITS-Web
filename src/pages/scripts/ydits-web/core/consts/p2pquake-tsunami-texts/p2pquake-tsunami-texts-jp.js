/*!
 *
 * YDITS for Web
 *
 * Copyright (C) よね/Yone
 * Licensed under the Apache License 2.0.
 *
 * https://github.com/YDITS/YDITS-Web
 *
 */

/**
 * P2P地震情報 津波種別 から 日本語津波文字列(語尾省略) へ変換する object  
 * "None", "Unknown", "Checking", "NonEffective" は、先頭に "津波: " や "津波の" を付与すること。
 */
export const P2PQUAKE_TSUNAMI_TEXTS_JP_SHORT = {
    "None": "心配なし",
    "Unknown": "影響は不明",
    "Checking": "影響を現在調査中",
    "NonEffective": "若干の海面変動、被害の心配なし",
    "Watch": "津波注意報が発表中",
    "Warning": "大津波警報または津波警報が発表中",
}

/**
 * P2P地震情報 津波種別 から 日本語津波文字列(語尾有り) へ変換する object  
 * "None", "Unknown", "Checking", "NonEffective" は、先頭に "津波: " や "津波の" を付与すること。
 */
export const P2PQUAKE_TSUNAMI_TEXTS_JP_FULL = {
    "None": "心配はありません",
    "Unknown": "影響は不明です",
    "Checking": "影響を現在調査中です",
    "NonEffective": "若干の海面変動が予想されますが、被害の心配はありません",
    "Watch": "津波注意報が発表中です",
    "Warning": "大津波警報または津波警報が発表中です",
}
