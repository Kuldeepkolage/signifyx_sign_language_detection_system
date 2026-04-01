
import React, { useState, useEffect } from "react";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/history", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTopSigns = () => {
    if (!analytics?.signDistribution) return [];
    return Object.entries(analytics.signDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getAccuracyLevel = () => {
    if (!analytics?.avgConfidence) return { label: "No Data", color: "#94a3b8" };
    const confidence = parseFloat(analytics.avgConfidence);
    if (confidence >= 90) return { label: "Excellent", color: "#059669" };
    if (confidence >= 70) return { label: "Good", color: "#f59e0b" };
    return { label: "Needs Practice", color: "#dc2626" };
  };

  const accuracy = getAccuracyLevel();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Analytics Dashboard</h2>
        <p style={styles.subtitle}>Track your sign language detection progress</p>
      </div>

      {/* Overview Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{analytics?.totalDetections || 0}</div>
          <div style={styles.statLabel}>Total Detections</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statValue}>{analytics?.avgConfidence || "0%"}</div>
          <div style={styles.statLabel}>Average Accuracy</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📹</div>
          <div style={styles.statValue}>{analytics?.detectionsByType?.realtime || 0}</div>
          <div style={styles.statLabel}>Live Sessions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🖼️</div>
          <div style={styles.statValue}>{analytics?.detectionsByType?.image || 0}</div>
          <div style={styles.statLabel}>Images Analyzed</div>
        </div>
      </div>

      {/* Performance Overview */}
      <div style={styles.performanceSection}>
        <h3 style={styles.sectionTitle}>🚀 Performance Overview</h3>
        
        <div style={styles.performanceCard}>
          <div style={styles.performanceHeader}>
            <span style={styles.performanceLabel}>Detection Accuracy</span>
            <span style={{...styles.performanceBadge, backgroundColor: accuracy.color + "20", color: accuracy.color}}>
              {accuracy.label}
            </span>
          </div>
          
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: analytics?.avgConfidence || "0%",
              backgroundColor: accuracy.color
            }} />
          </div>
          
          <div style={styles.progressStats}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Top Signs */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🏆 Top Detected Signs</h3>
        
        {getTopSigns().length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📊</span>
            <p>Start detecting signs to see your top signs here!</p>
          </div>
        ) : (
          <div style={styles.topSignsGrid}>
            {getTopSigns().map(([sign, count], index) => (
              <div key={sign} style={{
                ...styles.topSignCard,
                animationDelay: `${index * 0.1}s`
              }}>
                <div style={styles.rankBadge}>#{index + 1}</div>
                <div style={styles.topSignEmoji}>🤟</div>
                <div style={styles.topSignLetter}>{sign}</div>
                <div style={styles.topSignCount}>{count} times</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detection Methods */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📱 Detection Methods</h3>
        
        <div style={styles.methodsGrid}>
          <div style={styles.methodCard}>
            <div style={styles.methodIcon}>📹</div>
            <div style={styles.methodTitle}>Live Detection</div>
            <div style={styles.methodValue}>{analytics?.detectionsByType?.realtime || 0}</div>
            <div style={styles.methodPercentage}>
              {analytics?.totalDetections > 0 
                ? ((analytics?.detectionsByType?.realtime / analytics?.totalDetections) * 100).toFixed(0)
                : 0}%
            </div>
            <div style={styles.methodBar}>
              <div style={{
                ...styles.methodFill,
                width: `${analytics?.totalDetections > 0 
                  ? ((analytics?.detectionsByType?.realtime / analytics?.totalDetections) * 100)
                  : 0}%`
              }} />
            </div>
          </div>
          
          <div style={styles.methodCard}>
            <div style={styles.methodIcon}>🖼️</div>
            <div style={styles.methodTitle}>Image Upload</div>
            <div style={styles.methodValue}>{analytics?.detectionsByType?.image || 0}</div>
            <div style={styles.methodPercentage}>
              {analytics?.totalDetections > 0 
                ? ((analytics?.detectionsByType?.image / analytics?.totalDetections) * 100).toFixed(0)
                : 0}%
            </div>
            <div style={styles.methodBar}>
              <div style={{
                ...styles.methodFill,
                width: `${analytics?.totalDetections > 0 
                  ? ((analytics?.detectionsByType?.image / analytics?.totalDetections) * 100)
                  : 0}%`
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div style={styles.tipsSection}>
        <h3 style={styles.sectionTitle}>💡 Tips to Improve</h3>
        <div style={styles.tipsGrid}>
          <div style={styles.tipCard}>
            <span style={styles.tipIcon}>💡</span>
            <p>Ensure good lighting for better detection accuracy</p>
          </div>
          <div style={styles.tipCard}>
            <span style={styles.tipIcon}>🎯</span>
            <p>Position your hand clearly in the camera frame</p>
          </div>
          <div style={styles.tipCard}>
            <span style={styles.tipIcon}>📚</span>
            <p>Practice regularly using the Practice Mode</p>
          </div>
          <div style={styles.tipCard}>
            <span style={styles.tipIcon}>🔄</span>
            <p>Try both live and image detection methods</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
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
    animation: "pulse 1.5s ease-in-out infinite",
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "30px",
  },
  statCard: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    color: "white",
  },
  statIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "12px",
    opacity: 0.8,
  },
  performanceSection: {
    marginBottom: "30px",
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
  performanceCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "25px",
    border: "1px solid #e2e8f0",
  },
  performanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  performanceLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  performanceBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  progressBar: {
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "10px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.5s ease",
  },
  progressStats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#94a3b8",
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
  topSignsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "15px",
  },
  topSignCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    position: "relative",
    animation: "fadeIn 0.5s ease forwards",
    opacity: 0,
  },
  rankBadge: {
    position: "absolute",
    top: "-8px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#1e3a5f",
    color: "white",
    padding: "2px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "700",
  },
  topSignEmoji: {
    fontSize: "32px",
    marginBottom: "8px",
  },
  topSignLetter: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "5px",
  },
  topSignCount: {
    fontSize: "12px",
    color: "#64748b",
  },
  methodsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  methodCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  methodIcon: {
    fontSize: "32px",
    marginBottom: "10px",
  },
  methodTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "10px",
  },
  methodValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e3a5f",
    marginBottom: "5px",
  },
  methodPercentage: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "15px",
  },
  methodBar: {
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  methodFill: {
    height: "100%",
    backgroundColor: "#1e3a5f",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  tipsSection: {
    marginBottom: "20px",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px",
  },
  tipCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    backgroundColor: "#ecfdf5",
    borderRadius: "10px",
    border: "1px solid #a7f3d0",
  },
  tipIcon: {
    fontSize: "20px",
  },
  tipCard: {
    fontSize: "13px",
    color: "#059669",
    margin: 0,
  },
};

export default Analytics;

