import { useEffect, useRef, useState } from "react";
import { Box, Download, Share2, X } from "lucide-react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { useOutletContext } from "react-router";

import type {
  AuthContext,
  ShareAction,
  ShareStatus,
  VisualizerProps,
} from "../type";

import { Button } from "./ui/Button";
import AuthRequiredModal from "./AuthRequiredModal";

const Visualizer = ({
  onBack,
  initialImage,
  onShare,
  onUnshare,
  projectName,
  initialRender,
  isPublic = false,
  sharedBy = null,
  canUnshare = false,
  isRendering = false,
}: VisualizerProps) => {
  const { isSignedIn, signIn } = useOutletContext<AuthContext>();
  const [authRequired, setAuthRequired] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [shareAction, setShareAction] = useState<ShareAction | null>(null);

  const hasInitialGenerated = useRef(false);

  const handleExport = () => {
    if (!currentImage) return;

    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `homeasset-render-${Date.now()}.png`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const handleShareToggle = async () => {
    if (!currentImage) return;
    if (!isSignedIn) {
      setAuthRequired(true);
      return;
    }

    const nextAction: ShareAction = isPublic ? "unshare" : "share";
    if (nextAction === "share" && !onShare) return;
    if (nextAction === "unshare" && (!onUnshare || !canUnshare)) return;

    setShareAction(nextAction);
    setShareStatus("saving");

    try {
      if (nextAction === "share") {
        await onShare(currentImage);
      } else {
        await onUnshare(currentImage);
      }

      setShareStatus("done");
      window.setTimeout(() => {
        setShareStatus("idle");
        setShareAction(null);
      }, 1500);
    } catch (error) {
      console.error(`${nextAction} failed:`, error);
      setShareStatus("idle");
      setShareAction(null);
    }
  };

  const isReadOnlyShared = isPublic && !canUnshare;

  const getShareLabel = () => {
    if (isReadOnlyShared) return "Shared";

    switch (shareStatus) {
      case "saving":
        return shareAction === "unshare" ? "Unsharing…" : "Sharing…";
      case "done":
        return shareAction === "unshare" ? "Unshared" : "Shared";
      case "idle":
      default:
        return isPublic ? "Unshare" : "Share";
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;
    if (initialRender) {
      setCurrentImage(initialRender);
    }
    hasInitialGenerated.current = true;
  }, [initialImage, initialRender]);

  useEffect(() => {
    if (!initialRender) return;
    if (initialRender === currentImage) return;
    setCurrentImage(initialRender);
  }, [currentImage, initialRender]);

  return (
    <div className="visualizer">
      <AuthRequiredModal
        isOpen={authRequired}
        onConfirm={async () => {
          try {
            const signedIn = await signIn();
            if (!signedIn) return;
            setAuthRequired(false);
          } catch (error) {
            console.error("Sign-in failed:", error);
          }
        }}
        onCancel={() => {
          setAuthRequired(false);
        }}
        description="Sign in to share visualizations."
      />

      <nav className="topbar">
        <div className="brand" onClick={onBack}>
          <Box className="logo" />
          <span className="name">HomeAsset</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button variant="ghost" size="sm" onClick={onBack} className="exit">
            <X className="icon" /> Exit Editor
          </Button>
        </div>
      </nav>

      <div className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{projectName || "Untitled Project"}</h2>
              <p className="note">
                {isPublic
                  ? `Shared by ${sharedBy || "Unknown"}`
                  : "Created by You"}
              </p>
            </div>
            <div className="panel-actions">
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                size="sm"
                onClick={handleShareToggle}
                className="share"
                disabled={
                  !currentImage ||
                  shareStatus === "saving" ||
                  (isPublic ? !onUnshare || !canUnshare : !onShare)
                }
              >
                <Share2 className="w-4 h-4 mr-2" />
                {getShareLabel()}
              </Button>
            </div>
          </div>

          <div className="render-area">
            {currentImage ? (
              <div className="relative-container">
                <img src={currentImage} alt="Render" className="render-img" />
                {isRendering && (
                  <div className="render-overlay">
                    <div className="rendering-status">
                      <div className="pulse-loader"></div>
                      <span>Rendering 3D Model...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <div className="relative-container">
                    <img
                      src={initialImage}
                      alt="Original"
                      className="render-fallback"
                    />
                    {isRendering && (
                      <div className="render-overlay">
                        <div className="rendering-status">
                          <div className="pulse-loader"></div>
                          <span>Analyzing Floor Plan...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before vs After</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {initialImage && currentImage && !isRendering ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={initialImage}
                    alt="Before"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={currentImage}
                    alt="After"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {initialImage && (
                  <div className="relative-container">
                    <img
                      src={initialImage}
                      alt="Before"
                      className="compare-img"
                    />
                    {isRendering && (
                      <div className="render-overlay">
                        <div className="rendering-status">
                          <div className="pulse-loader"></div>
                          <span>Generating Comparison...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
