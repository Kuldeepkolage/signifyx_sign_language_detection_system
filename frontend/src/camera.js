
import React, { useRef, useState, useEffect } from "react";

function Camera({ user }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [detectedSign, setDetectedSign] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState("live");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [showVoice, setShowVoice] = useState(true);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      })
      .catch((err) => {
        console.log("Error accessing camera:", err);
        alert("Could not access camera. Please check permissions.");
      });
  };

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
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg');

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/detect-image", {
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
      }
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
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
      };
      reader.readAsDataURL(file);
    }
  };

  const detectUploadedImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/detect-image", {
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
      }
    } catch (error) {
      console.error("Detection error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResults = () => {
    setDetectedSign(null);
    setConfidence(null);
    setUploadedImage(null);
    setDetectionHistory([]);
  };

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

      <div style={styles.mainContent}>
        <div style={styles.videoSection}>
          {mode === "live" ? (
            <>
              <div style={styles.videoContainer}>
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={styles.video}
                  />
                ) : (
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
                <button onClick={toggleCamera} style={styles.controlButton}>
                  {isCameraOn ? "⏹️ Stop" : "▶️ Start"}
                </button>
                {isCameraOn && (
                  <button 
                    onClick={captureAndDetect} 
                    disabled={isProcessing}
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
    </div>
  );
}

const styles = {
  container: { padding: "20px" },
  modeToggle: { display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" },
  modeButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease" },
  modeButtonActive: { backgroundColor: "#1e3a5f", borderColor: "#1e3a5f", color: "white" },
  voiceToggle: { textAlign: "center", marginBottom: "20px" },
  voiceLabel: { display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#64748b", cursor: "pointer" },
  voiceCheckbox: { width: "18px", height: "18px" },
  mainContent: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px" },
  videoSection: { display: "flex", flexDirection: "column", gap: "15px" },
  videoContainer: { width: "100%", aspectRatio: "4/3", backgroundColor: "#1a1a2e", borderRadius: "16px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  videoPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", color: "white" },
  placeholderIcon: { fontSize: "64px" },
  startButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: "#1e3a5f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  controls: { display: "flex", gap: "10px", justifyContent: "center" },
  controlButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer" },
  detectButton: { padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: "#1e3a5f", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" },
  uploadContainer: { width: "100%", aspectRatio: "4/3" },
  uploadArea: { width: "100%", height: "100%", backgroundColor: "#f8fafc", border: "3px dashed #e2e8f0", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease" },
  fileInput: { display: "none" },
  uploadIcon: { fontSize: "64px", marginBottom: "15px" },
  uploadHint: { fontSize: "12px", color: "#94a3b8", marginTop: "5px" },
  imagePreview: { position: "relative", width: "100%", height: "100%" },
  uploadedImage: { width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px" },
  clearButton: { position: "absolute", top: "10px", right: "10px", width: "30px", height: "30px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "14px" },
  resultsSection: { backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px" },
  resultsTitle: { fontSize: "18px", fontWeight: "600", color: "#1e293b", marginBottom: "20px" },
  resultCard: { textAlign: "center" },
  signDisplay: { marginBottom: "20px" },
  signEmoji: { fontSize: "64px", display: "block", marginBottom: "10px" },
  signLetter: { fontSize: "48px", fontWeight: "700", color: "#1e3a5f" },
  confidenceBar: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  confidenceLabel: { fontSize: "14px", color: "#64748b" },
  confidenceTrack: { flex: 1, height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" },
  confidenceFill: { height: "100%", backgroundColor: "#059669", borderRadius: "4px" },
  confidenceValue: { fontSize: "14px", fontWeight: "600", color: "#059669", minWidth: "45px" },
  speakButton: { width: "100%", padding: "12px", fontSize: "14px", fontWeight: "600", backgroundColor: "#1e3a5f", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "10px" },
  clearResultsButton: { padding: "8px 16px", fontSize: "12px", backgroundColor: "transparent", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" },
  noResult: { textAlign: "center", padding: "40px 20px", color: "#64748b" },
  noResultIcon: { fontSize: "48px", display: "block", marginBottom: "15px" },
  noResultHint: { fontSize: "12px", color: "#94a3b8" },
  historySection: { marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" },
  historyTitle: { fontSize: "14px", fontWeight: "600", color: "#1e293b", marginBottom: "12px" },
  historyItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "white", borderRadius: "8px", marginBottom: "8px" },
  historySign: { fontSize: "14px", fontWeight: "600", color: "#1e3a5f" },
  historyConfidence: { fontSize: "12px", color: "#059669" }
};

export default Camera;

