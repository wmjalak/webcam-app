import React, {
  ChangeEventHandler,
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
} from "react";
import logo from "./logo.svg";
import "./App.css";
import { CameraMode, IButtons, Defaults } from "./types";
import useCountDown from "react-countdown-hook";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";



type Camera = {
  name: string;
  id: string;
};

function App() {
  const initialTime = 60 * 1000; // initial time in milliseconds, defaults to 60000
  const interval = 1000; // interval to change remaining time amount, defaults to 1000
  let currentStream: MediaStream;
  let testValue: string = 'a';
  const mode: CameraMode = CameraMode.User;

  let canvas: HTMLCanvasElement;
  let video: HTMLVideoElement;


  const [cameras, setCameras] = useState<Camera[]>([]);
  const [countDownSeconds, setCountDownSeconds] = useState<string>("60");
  const [facingMode, setFacingMode] = useState<CameraMode>(
    CameraMode.Environment
  );
  const [deviceId, setDeviceId] = useState<string>();

  const [timeLeft, { start, pause, resume, reset }] = useCountDown(
    Number(countDownSeconds) * 1000,
    interval
  );

  // const [videoConstrains, setVideoConstrains] = useState<MediaStreamConstraints | undefined>();

  const get_media = (): Promise<MediaStream> => {
    if (typeof currentStream !== "undefined") {
      stopMediaTracks(currentStream);
    }

    let constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        // deviceId: deviceId,
        facingMode: facingMode,
      },
    };
    if (deviceId) {
      constraints = {
        ...constraints,
        video: {
          deviceId,
        },
      };
    }
    // let constraints = { audio: false, video: { facingMode: mode} };
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

  const startVideo = async () => {
    try {
      const stream = await get_media();
      currentStream = stream;
      return on_get_media(stream);
    } catch (reason) {
      return on_error(reason);
    }
  };

  const init_camera = useCallback(
    async (mediaDevices: MediaDeviceInfo[]): Promise<void> => {

      let count = 1;
      let cams: Camera[] = [];
      mediaDevices.forEach((mediaDevice) => {
        // if (mediaDevice.kind === "videoinput") {
          cams.push({
            id: mediaDevice.deviceId,
            name: mediaDevice.label || `Camera ${count++}`,
          });
        // }
      });
      setCameras(cams);

      startVideo();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(init_camera).catch(on_error);
    // start();
  }, [init_camera, start]);

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

  const onCameraChange = (id: string) => {
    setDeviceId(id);
    startVideo();
  };

  const stopMediaTracks = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  };

  const restart = () => {
    start(Number(countDownSeconds) * 1000);
  };
  
  const handleCountDownSecondsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCountDownSeconds(e.target.value);
  }

  const handleCameraChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onCameraChange(e.target.value);
  }


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
            <>
              <input
                name="countDownSeconds"
                id="countDownSeconds"
                value={countDownSeconds}
                onChange={handleCountDownSecondsChange}
              />

              <span className="time-left" id="time-left">
                {timeLeft / 1000}
              </span>
              <button id="restart" className="restart-button" onClick={restart}>Restart</button>

              <select
                name="cameras"
                id="cameras"
                onChange={handleCameraChange}
              >
                {cameras.map((camera, i) => (
                  <>
                    <option key={i} value={camera.id}>
                      {camera.name}
                    </option>
                  </>
                ))}
              </select>
            </>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
