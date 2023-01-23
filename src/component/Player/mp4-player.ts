import { Player } from "../../page/player";

export class Mp4Player {
  // private player: Player;
  // constructor(player: Player) {
  //   this.player = player;
  //   this.player.video.src = this.player.playerOptions.url;
  //   this.initEvent();
  // }

  // initEvent() {
  //   this.player.toolbar.emit("mounted");
  //   this.player.emit("mounted", this);

  //   this.player.container.onclick = (e: Event) => {
  //     if (e.target == this.player.video) {
  //       if (this.player.video.paused) {
  //         this.player.video.play();
  //       } else if (this.player.video.played) {
  //         this.player.video.pause();
  //       }
  //     }
  //   };

  //   this.player.container.addEventListener("mouseenter", (e: MouseEvent) => {
  //     this.player.toolbar.emit("showtoolbar", e);
  //   });

  //   this.player.container.addEventListener("mousemove", (e: MouseEvent) => {
  //     this.player.toolbar.emit("showtoolbar", e);
  //   });

  //   this.player.container.addEventListener("mouseleave", (e: MouseEvent) => {
  //     this.player.toolbar.emit("hidetoolbar");
  //   });

  //   this.player.video.addEventListener("loadedmetadata", (e: Event) => {
  //     this.player.playerOptions.autoplay && this.player.video.play();
  //     this.player.toolbar.emit("loadedmetadata", this.player.video.duration);
  //   });

  //   this.player.video.addEventListener("timeupdate", (e: Event) => {
  //     this.player.toolbar.emit("timeupdate", this.player.video.currentTime);
  //   });

  //   // 当视频可以再次播放的时候就移除loading和error的mask，通常是为了应对在播放的过程中出现需要缓冲或者播放错误这种情况从而需要展示对应的mask
  //   this.player.video.addEventListener("play", (e: Event) => {
  //     this.player.loadingMask.removeLoadingMask();
  //     this.player.errorMask.removeErrorMask();
  //     this.player.toolbar.emit("play");
  //   });

  //   this.player.video.addEventListener("pause", (e: Event) => {
  //     this.player.toolbar.emit("pause");
  //   });

  //   this.player.video.addEventListener("waiting", (e: Event) => {
  //     this.player.loadingMask.removeLoadingMask();
  //     this.player.errorMask.removeErrorMask();
  //     this.player.loadingMask.addLoadingMask();
  //   });

  //   //当浏览器请求视频发生错误的时候
  //   this.player.video.addEventListener("stalled", (e) => {
  //     console.log("视频加载发生错误");
  //     this.player.loadingMask.removeLoadingMask();
  //     this.player.errorMask.removeErrorMask();
  //     this.player.errorMask.addErrorMask();
  //   });

  //   this.player.video.addEventListener("error", (e) => {
  //     this.player.loadingMask.removeLoadingMask();
  //     this.player.errorMask.removeErrorMask();
  //     this.player.errorMask.addErrorMask();
  //   });

  //   this.player.video.addEventListener("abort", (e: Event) => {
  //     this.player.loadingMask.removeLoadingMask();
  //     this.player.errorMask.removeErrorMask();
  //     this.player.errorMask.addErrorMask();
  //   });
  // }
}
