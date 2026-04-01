import React, { useState } from "react";

function Gesture() {

  const [gesture, setGesture] = useState("");

  const detectGesture = async () => {
    const res = await fetch("http://localhost:3001/gesture");
    const data = await res.json();

    setGesture(data.gesture);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>SignifyX Gesture Detection</h1>

      <button onClick={detectGesture}>
        Detect Gesture
      </button>

      <h2>Gesture: {gesture}</h2>
    </div>
  );
}

export default Gesture;