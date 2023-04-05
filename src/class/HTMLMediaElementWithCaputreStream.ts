export interface HTMLMediaElementWithCaputreStream extends HTMLMediaElement {
  captureStream(fps?: number): MediaStream;
}
