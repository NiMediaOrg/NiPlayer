export function addZero(num: number): string {
  return num > 9 ? "" + num : "0" + num;
}
export function formatTime(seconds: number): string {
  seconds = Math.floor(seconds);
  let minute = Math.floor(seconds / 60);
  let second = seconds % 60;

  return addZero(minute) + ":" + addZero(second);
}

export function computeAngle(dx:number,dy:number): number {
  if(dx === 0) return 90;
  if(dy === 0) return 0;
  return Math.round(Math.atan(Math.abs(dy)/Math.abs(dx)) * 180 / Math.PI);
}

