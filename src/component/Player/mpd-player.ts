import MediaPlayer from "../../dash/MediaPlayer";
import { Player } from "./player";
export class MpdPlayer {
  constructor(player:Player) {
    let mediaPlayer = MediaPlayer().create();
    mediaPlayer.attachSource(player.playerOptions.url);
    mediaPlayer.attachVideo(player.video);
    player.video.controls = true;
  }
}