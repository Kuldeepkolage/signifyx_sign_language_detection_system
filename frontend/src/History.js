
import React, { useState, useEffect } from "react";

function History() {
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
        setAnalytics(data.analytics || null);
      } else {
        setError(data.message || "Failed to load history");
      }
    } catch (error) {
      console.error("Fetch history error:", error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory(history.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error("Delete history error:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return "#059669";
    if (confidence >= 0.7) return "#f59e0b";
    return "#dc2626";
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Detection History</h2>
        <p style={styles.subtitle}>View your past sign language detections</p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div style={styles.analyticsGrid}>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsIcon}>🎯</div>
            <div style={styles.analyticsValue}>{analytics.totalDetections}</div>
            <div style={styles.analyticsLabel}>Total Detections</div>
          </div>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsIcon}>📈</div>
            <div style={styles.analyticsValue}>{analytics.avgConfidence}</div>
            <div style={styles.analyticsLabel}>Avg. Confidence</div>
          </div>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsIcon}>📹</div>
            <div style={styles.analyticsValue}>{analytics.detectionsByType?.realtime || 0}</div>
            <div style={styles.analyticsLabel}>Live Detections</div>
          </div>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsIcon}>🖼️</div>
            <div style={styles.analyticsValue}>{analytics.detectionsByType?.image || 0}</div>
            <div style={styles.analyticsLabel}>Image Uploads</div>
          </div>
        </div>
      )}

      {/* Sign Distribution */}
      {analytics && analytics.signDistribution && Object.keys(analytics.signDistribution).length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📈 Sign Distribution</h3>
          <div style={styles.distributionGrid}>
            {Object.entries(analytics.signDistribution).map(([sign, count]) => (
              <div key={sign} style={styles.distributionItem}>
                <span style={styles.signLetter}>{sign}</span>
                <div style={styles.distributionBar}>
                  <div 
                    style={{
                      ...styles.distributionFill,
                      width: `${(count / analytics.totalDetections) * 100}%`
                    }} 
                  />
                </div>
                <span style={styles.countLabel}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History List */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🕒 Recent Detections</h3>
        
        {history.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <p>No detections yet. Start detecting signs using the camera!</p>
          </div>
        ) : (
          <div style={styles.historyList}>
            {history.map((item) => (
              <div key={item.id} style={styles.historyItem}>
                <div style={styles.signDisplay}>
                  <span style={styles.signEmoji}>🤟</span>
                  <span style={styles.signLetterLarge}>{item.detectedSign}</span>
                </div>
                <div style={styles.historyDetails}>
                  <div style={styles.historyType}>
                    {item.type === "realtime" ? "📹 Live Detection" : "🖼️ Image Upload"}
                  </div>
                  <div style={styles.historyDate}>{formatDate(item.timestamp)}</div>
                </div>
                <div style={styles.confidenceSection}>
                  <span style={styles.confidenceLabel}>Confidence:</span>
                  <span style={{
                    ...styles.confidenceValue,
                    color: getConfidenceColor(item.confidence)
                  }}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "30px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    color: "#64748b",
  },
  spinner: {
    fontSize: "40px",
    animation: "spin 1s linear infinite",
  },
  header: {
    marginBottom: "30px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "30px",
  },
  analyticsCard: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    color: "white",
  },
  analyticsIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  analyticsValue: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px",
  },
  analyticsLabel: {
    fontSize: "12px",
    opacity: 0.8,
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "20px",
  },
  distributionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
  },
  distributionItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
  },
  signLetter: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e3a5f",
    width: "30px",
  },
  distributionBar: {
    flex: 1,
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  distributionFill: {
    height: "100%",
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    borderRadius: "4px",
  },
  countLabel: {
    fontSize: "12px",
    color: "#64748b",
    width: "25px",
    textAlign: "right",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "15px",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  historyItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "18px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  signDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "80px",
  },
  signEmoji: {
    fontSize: "28px",
  },
  signLetterLarge: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e3a5f",
  },
  historyDetails: {
    flex: 1,
  },
  historyType: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "4px",
  },
  historyDate: {
    fontSize: "12px",
    color: "#64748b",
  },
  confidenceSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "80px",
  },
  confidenceLabel: {
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "2px",
  },
  confidenceValue: {
    fontSize: "16px",
    fontWeight: "700",
  },
  deleteButton: {
    padding: "8px 12px",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s ease",
  },
};

export default History;

