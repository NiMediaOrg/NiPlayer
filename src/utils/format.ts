function addZero(num: number): string {
  return num > 9 ? "" + num : "0" + num;
}
export function formatTime(seconds: number): string {
  seconds = Math.floor(seconds);
  let minute = Math.floor(seconds / 60);
  let second = seconds % 60;

  return addZero(minute) + ":" + addZero(second);
}
