import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { CameraMode, IButtons, Defaults } from "./types";
import useCountDown from "react-countdown-hook";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function App() {
  const initialTime = 60 * 1000; // initial time in milliseconds, defaults to 60000
  const interval = 1000; // interval to change remaining time amount, defaults to 1000

  const mode: CameraMode = CameraMode.User;

  let canvas: HTMLCanvasElement;
  let video: HTMLVideoElement;

  const [timeLeft, { start, pause, resume, reset }] = useCountDown(
    initialTime,
    interval
  );

  useEffect(() => {
    const get_media = (): Promise<MediaStream> => {
      let constraints = { audio: false, video: { facingMode: mode } };
      return navigator.mediaDevices.getUserMedia(constraints);
    };

    const on_get_media = (stream: MediaStream) => {
      canvas = document.createElement("canvas");

      const video = document.querySelector("video");
      if (video !== null) {
        video.onloadedmetadata = () => {
          video && video.play();
        };
        video.oncanplay = () => {
          on_video_ready();
        };
        video.srcObject = stream;
      }
    };

    const init_camera = async (mediaDevices: MediaDeviceInfo[]): Promise<void> => {
      console.log(mediaDevices);
      try {
        const stream = await get_media();
        return on_get_media(stream);
      } catch (reason) {
        return on_error(reason);
      }
    };

    navigator.mediaDevices.enumerateDevices().then(init_camera).catch(on_error);
    start();
  }, [start]);

  const on_video_ready = () => {
    // canvas.width = Defaults.width;
    // canvas.height = video.videoHeight / (video.videoWidth / Defaults.width);
    // canvas.width = 1500;
    // video.setAttribute('height', canvas.height.toString())
    // video.setAttribute('width', canvas.width.toString())
    // video.setAttribute('width', '500')
  };

  const on_error = (reason: any) => {
    console.log(reason);
  };

  const restart = React.useCallback(() => {
    start();
  }, [start]);

  return (
    <>
      <audio
        id="audio"
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
      ></audio>

      <Container>
        <Row>
          <Col>
          <main>
            <video className="video"></video>
            </main>
          </Col>
          <Col sm={4}>
            <span className="time-left" id="time-left">
              {timeLeft / 1000}
            </span>
            <button onClick={restart}>Restart</button>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
