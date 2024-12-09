import React, { useContext, useRef } from "react";
import { MineContext } from "../../MineContext/MineContext";

const SupportFileRenderer = ({ data }) => {
  const { videoRefs, audioRefs, handleVideoPlay, handleAudioPlay } =
    useContext(MineContext);

  // const videoRefs = useRef({});
  // const audioRefs = useRef({});

  // const handleVideoPlay = (path) => {
  //   Object.keys(videoRefs.current).forEach((key) => {
  //     if (videoRefs.current[key] && key !== path) {
  //       videoRefs.current[key].pause();
  //     }
  //   });
  // };

  // const handleAudioPlay = (path) => {
  //   Object.keys(audioRefs.current).forEach((key) => {
  //     if (audioRefs.current[key] && key !== path) {
  //       audioRefs.current[key].pause();
  //     }
  //   });
  // };

  return (
    <div>
      {data &&
        data.length &&
        data.map((file) => {
          if (file.mimetype.startsWith("video")) {
            return (
              <div key={file.path}>
                <p>Video:</p>
                <video
                  style={{ width: "100%" }}
                  controls
                  ref={(el) => (videoRefs.current[file.path] = el)}
                  onPlay={() => handleVideoPlay(file.path)}
                >
                  <source src={file.path} type={file.mimetype} />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          } else if (file.mimetype.startsWith("image")) {
            return (
              <div key={file.path}>
                <p>Image:</p>
                <img
                  style={{ width: "100%" }}
                  src={file.path}
                  alt={file.fileName}
                />
              </div>
            );
          } else if (file.mimetype === "application/pdf") {
            return (
              <div key={file.path}>
                <p>PDF:</p>
                <a href={file.path} target="_blank" rel="noopener noreferrer">
                  {file.fileName}
                </a>{" "}
                |{" "}
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    file.path
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Online
                </a>
              </div>
            );
          } else if (
            file.mimetype.startsWith(
              "application/vnd.openxmlformats-officedocument"
            ) ||
            file.mimetype === "application/msword"
          ) {
            return (
              <div key={file.path}>
                <p>Office Document:</p>
                <a href={file.path} download={file.fileName}>
                  {file.fileName}
                </a>{" "}
                |{" "}
                <a
                  href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
                    file.path
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Online
                </a>
              </div>
            );
          } else if (file.mimetype.startsWith("audio")) {
            return (
              <div key={file.path}>
                <p>Audio:</p>
                <audio
                  style={{ width: "100%" }}
                  controls
                  ref={(el) => (audioRefs.current[file.path] = el)}
                  onPlay={() => handleAudioPlay(file.path)}
                >
                  <source src={file.path} type={file.mimetype} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            );
          } else {
            return (
              <div key={file.path}>
                <p>Download:</p>
                <a href={file.path} download={file.fileName}>
                  {file.fileName}
                </a>
              </div>
            );
          }
        })}
    </div>
  );
};

export default SupportFileRenderer;
