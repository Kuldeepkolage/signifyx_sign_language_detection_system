import React, { useRef, useState, useEffect, useCallback } from "react";
import { cameraStyles } from "./styles.js";

function Camera({ user }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedSign, setDetectedSign] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState("live");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showVoice, setShowVoice] = useState(true);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  setError('Camera requires HTTPS. Please use https:// or localhost for development.');
  setIsLoading(false);
  return;
}

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCameraOn(true); // ✅ MOVED UP: set state before assigning srcObject

      // ✅ FIX: setTimeout gives React time to render the <video> tag first
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(playErr => {
            console.error('Video play failed:', playErr);
            setError('Video playback failed. Please refresh and grant camera permission.');
          });
        }
      }, 50);

    } catch (err) {
      console.error("Camera error:", err);

      let errorMsg = "Camera access failed. ";

      switch (err.name) {
        case 'NotAllowedError':
          errorMsg += "Please grant camera permission in browser settings and refresh.";
          break;
        case 'NotFoundError':
          errorMsg += "No camera found. Please connect a camera device.";
          break;
        case 'NotReadableError':
          errorMsg += "Camera is being used by another application. Please close other apps.";
          break;
        case 'OverconstrainedError':
          errorMsg += "Camera constraints not supported. Trying default settings...";
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(fallbackStream);
            setIsCameraOn(true);
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
                videoRef.current.play();
              }
            }, 50);
            setIsLoading(false);
            return;
          } catch (fallbackErr) {
            errorMsg += " Fallback failed too.";
          }
          break;
        case 'NotSupportedError':
          errorMsg += "getUserMedia not supported in this browser.";
          break;
        default:
          errorMsg += err.message;
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      startCamera();
    }
  }, [startCamera]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const speakResult = (text) => {
    if ('speechSynthesis' in window && showVoice) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return;

    setIsProcessing(true);
     setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/detect-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          image: imageData,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok && data.detectedSign) {
        setDetectedSign(data.detectedSign);
        setConfidence(data.predictions?.[0]?.confidence || 0.95);

        setDetectionHistory(prev => [{
          sign: data.detectedSign,
          confidence: data.predictions?.[0]?.confidence || 0.95,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);

        speakResult(`The sign is ${data.detectedSign}`);
      } else {
        setError("Detection failed. Please try again.");
      }
    } catch (error) {
  console.error("Detection error:", error);
  setError("Backend not reachable at localhost:3001. Is the server running?");
  }finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setMode("image");
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectUploadedImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/detect-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          image: uploadedImage,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok && data.detectedSign) {
        setDetectedSign(data.detectedSign);
        setConfidence(data.predictions?.[0]?.confidence || 0.95);

        setDetectionHistory(prev => [{
          sign: data.detectedSign,
          confidence: data.predictions?.[0]?.confidence || 0.95,
          time: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);

        speakResult(`The sign in the image is ${data.detectedSign}`);
      } else {
        setError("Detection failed on uploaded image.");
      }
    } catch (error) {
      console.error("Detection error:", error);
      setError("Detection service unavailable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    setDetectedSign(null);
    setConfidence(null);
    setUploadedImage(null);
    setDetectionHistory([]);
    setError(null);
  };

  const styles = cameraStyles;

  return (
    <div style={styles.container}>
      <div style={styles.modeToggle}>
        <button
          onClick={() => { setMode("live"); setUploadedImage(null); }}
          style={mode === "live" ? {...styles.modeButton, ...styles.modeButtonActive} : styles.modeButton}
        >
          📹 Live Detection
        </button>
        <button
          onClick={() => setMode("image")}
          style={mode === "image" ? {...styles.modeButton, ...styles.modeButtonActive} : styles.modeButton}
        >
          🖼️ Upload Image
        </button>
      </div>

      <div style={styles.voiceToggle}>
        <label style={styles.voiceLabel}>
          <input
            type="checkbox"
            checked={showVoice}
            onChange={(e) => setShowVoice(e.target.checked)}
            style={styles.voiceCheckbox}
          />
          🔊 Voice Output
        </label>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <strong>❌ Camera Error:</strong> {error}
          <br />
          <button onClick={startCamera} style={styles.retryButton}>
            🔄 Retry Camera
          </button>
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={styles.videoSection}>
          {mode === "live" ? (
            <>
              <div style={styles.videoContainer}>
                {isLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
                    <div style={styles.loadingSpinner}></div>
                    <p>Starting camera...</p>
                  </div>
                )}

                {/* ✅ FIX: Always render <video>, never conditionally mount/unmount it */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    ...styles.video,
                    display: isCameraOn ? 'block' : 'none' // ✅ hide/show only, never unmount
                  }}
                />

                {/* ✅ FIX: Placeholder shown separately, not replacing the video tag */}
                {!isLoading && !isCameraOn && (
                  <div style={styles.videoPlaceholder}>
                    <span style={styles.placeholderIcon}>📹</span>
                    <p>Camera is off</p>
                    <button onClick={startCamera} style={styles.startButton}>
                      Turn On Camera
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div style={styles.controls}>
                <button onClick={toggleCamera} style={styles.controlButton} disabled={isLoading}>
                  {isCameraOn ? "⏹️ Stop" : "▶️ Start"}
                </button>
                {isCameraOn && (
                  <button
                    onClick={captureAndDetect}
                    disabled={isProcessing || isLoading}
                    style={styles.detectButton}
                  >
                    {isProcessing ? "⏳ Processing..." : "🔍 Detect Sign"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={styles.uploadContainer}>
                {uploadedImage ? (
                  <div style={styles.imagePreview}>
                    <img src={uploadedImage} alt="Uploaded" style={styles.uploadedImage} />
                    <button
                      onClick={() => setUploadedImage(null)}
                      style={styles.clearButton}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label style={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={styles.fileInput}
                    />
                    <span style={styles.uploadIcon}>🖼️</span>
                    <p>Click to upload an image</p>
                    <span style={styles.uploadHint}>Supports: JPG, PNG</span>
                  </label>
                )}
              </div>

              {uploadedImage && (
                <button
                  onClick={detectUploadedImage}
                  disabled={isProcessing}
                  style={styles.detectButton}
                >
                  {isProcessing ? "⏳ Processing..." : "🔍 Detect Sign"}
                </button>
              )}
            </>
          )}
        </div>

        <div style={styles.resultsSection}>
          <h3 style={styles.resultsTitle}>🎯 Detection Result</h3>

          {detectedSign ? (
            <div style={styles.resultCard}>
              <div style={styles.signDisplay}>
                <span style={styles.signEmoji}>🤟</span>
                <span style={styles.signLetter}>{detectedSign}</span>
              </div>
              <div style={styles.confidenceBar}>
                <span style={styles.confidenceLabel}>Confidence:</span>
                <div style={styles.confidenceTrack}>
                  <div
                    style={{
                      ...styles.confidenceFill,
                      width: `${(confidence * 100).toFixed(0)}%`
                    }}
                  />
                </div>
                <span style={styles.confidenceValue}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
              <button
                onClick={() => speakResult(`The sign is ${detectedSign}`)}
                style={styles.speakButton}
              >
                🔊 Speak Result
              </button>
              <button onClick={clearResults} style={styles.clearResultsButton}>
                Clear
              </button>
            </div>
          ) : (
            <div style={styles.noResult}>
              <span style={styles.noResultIcon}>🔍</span>
              <p>No detection yet</p>
              <span style={styles.noResultHint}>
                {mode === "live"
                  ? "Start camera and click 'Detect Sign'"
                  : "Upload an image and click 'Detect Sign'"
                }
              </span>
            </div>
          )}

          {detectionHistory.length > 0 && (
            <div style={styles.historySection}>
              <h4 style={styles.historyTitle}>Recent Detections</h4>
              {detectionHistory.map((item, index) => (
                <div key={index} style={styles.historyItem}>
                  <span style={styles.historySign}>🤟 {item.sign}</span>
                  <span style={styles.historyConfidence}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Camera;