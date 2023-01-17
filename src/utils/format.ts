import { Time } from "../types/dash/Time";

export function addZero(num: number): string {
  return num > 9 ? "" + num : "0" + num;
}
export function formatTime(seconds: number): string {
  seconds = Math.floor(seconds);
  let minute = Math.floor(seconds / 60);
  let second = seconds % 60;

  return addZero(minute) + ":" + addZero(second);
}

export function switchToSeconds(time: Time): number {
  let sum = 0;
  if(time.hours) sum += time.hours * 3600;
  if(time.minutes) sum += time.minutes * 60;
  if(time.seconds) sum += time.seconds;

  return sum;
}

// 解析MPD文件的时间字符串
export function parseDuration(pt: string): Time {
  // Parse time from format "PT#H#M##.##S"
  let hours, minutes, seconds;
  for (let i = pt.length - 1; i >= 0; i--) {
    if (pt[i] === "S") {
      let j = i;
      while (pt[i] !== "M" && pt[i] !== "H" && pt[i] !== "T") {
        i--;
      }
      i += 1;
      seconds = parseInt(pt.slice(i, j));
    } else if (pt[i] === "M") {
      let j = i;
      while (pt[i] !== "H" && pt[i] !== "T") {
        i--;
      }
      i += 1;
      minutes = parseInt(pt.slice(i, j));
    } else if (pt[i] === "H") {
      let j = i;
      while (pt[i] !== "T") {
        i--;
      }
      i += 1;
      hours = parseInt(pt.slice(i, j));
    }
  }
  return {
    hours,
    minutes,
    seconds,
  };
}
