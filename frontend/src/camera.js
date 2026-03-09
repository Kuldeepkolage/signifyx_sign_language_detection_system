import React, { useRef, useEffect } from "react";

function Camera() {

  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.log("Error accessing camera:", err);
      });
  }, []);

  return (
    <div style={{textAlign:"center"}}>
      <video
        ref={videoRef}
        autoPlay
        width="500"
        height="400"
        style={{border:"2px solid black"}}
      />
    </div>
  );
}

export default Camera;