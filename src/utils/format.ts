export function addZero(num: number): string {
  return num > 9 ? "" + num : "0" + num;
}
export function formatTime(seconds: number): string {
  seconds = Math.floor(seconds);
  let minute = Math.floor(seconds / 60);
  let second = seconds % 60;

  return addZero(minute) + ":" + addZero(second);
}

// 解析MPD文件的时间字符串
export function parseDuration(pt: string) {
  // Parse time from format "PT#H#M##.##S"
  var ptTemp: any = pt.split("T")[1];
  ptTemp = ptTemp.split("H");
  var hours = ptTemp[0];
  var minutes = ptTemp[1].split("M")[0];
  var seconds = ptTemp[1].split("M")[1].split("S")[0];
  var hundredths = seconds.split(".");
  //  Display the length of video (taken from .mpd file, since video duration is infinate)
  return { hours, minutes, seconds: hundredths[0] };
}
