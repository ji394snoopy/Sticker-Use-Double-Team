module.exports.MSG = {
  ERR: {
    CREATE: '新增檔案錯誤！',
    EMPTY_DATA: '查無資料',
    SYSTEM: 'Sorry ! \n發生系統錯誤... \n請聯絡管理人: @ji394snoopy',
    ZIP_OVER_SIZE: '此檔案超出15Mb，請減少至15Mb以內！',
    ZIP_MIME: '檔案類型非.zip檔，請轉成可識別格式！',
    MKDIR: '新增資料夾錯誤！',
    IS_BUSY: '伺服器忙碌中...',
    HREF: hrefs => {
      let hrefStr = '';
      if (typeof hrefs === 'object' && hrefs.length > 0)
        hrefStr = hrefs.join(', ');
      else if (typeof hrefs === 'string') hrefStr = hrefStr;
      else return;
      return `[${hrefStr}]不是正確連結，請嘗試其他！`;
    }
  },
  INFO: {
    ZIP_SIZE: '請上傳.zip檔，檔案大小不得超過15Mb!',
    DONE: '完成！請由此連結加入貼圖：'
  }
};

module.exports.getLink = id => `https://t.me/addstickers/SUDT_${id}_by_SUDT_bot`;
