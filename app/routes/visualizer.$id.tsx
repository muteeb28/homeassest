import { useEffect, useState } from "react";
import type {
  AuthContext,
  DesignHistoryItem,
  VisualizerLocationState,
} from "../../type";
import {
  Navigate,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";

import {
  getProjectById,
  renderProject,
  saveProject,
  shareProject,
  unshareProject,
} from "@/lib/storage";

import Visualizer from "@/components/Visualizer";

export default function VisualizerRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedItem, setResolvedItem] = useState<DesignHistoryItem | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedInitialRender, setSelectedInitialRender] = useState<
    string | null
  >(null);
  const [isRendering, setIsRendering] = useState(false);
  const isRenderingRef = useRef(false);
  const {
    userId: currentUserId,
    isSignedIn,
    signIn,
  } = useOutletContext<AuthContext>();

  const search = new URLSearchParams(location.search);
  const sourceParam = search.get("source");
  const queryScope: "private" | "public" =
    sourceParam === "public"
      ? "public"
      : sourceParam === "private" || sourceParam === "user"
        ? "private"
        : "public";
  const queryOwnerId = search.get("ownerId");
  const isPublicProject = queryScope === "public";

  const fetchProjectById = async (
    projectId: string,
    scope: "private" | "public",
    ownerId?: string | null,
  ) => {
    /*
    if (scope === "private" && !isSignedIn) {
      const signedIn = await signIn();
      if (!signedIn) return null;
    }
    */

    return await getProjectById({ id: projectId, scope, ownerId });
  };

  const handleShareCurrent = async (
    image: string,
    opts?: { visibility?: "private" | "public" },
  ) => {
    if (!id) return;
    const visibility = opts?.visibility || "public";
    const updatedItem = {
      id,
      name: resolvedItem?.name || `Residence ${id}`,
      sourceImage: uploadedImage || "",
      renderedImage: image,
      renderedPath: resolvedItem?.renderedPath,
      timestamp: Date.now(),
      ownerId:
        visibility === "public"
          ? resolvedItem?.ownerId || currentUserId || null
          : resolvedItem?.ownerId || null,
      isPublic: visibility === "public",
    };
    setResolvedItem(updatedItem);
    if (visibility === "public") {
      const saved = await shareProject(updatedItem);
      if (saved) {
        setResolvedItem(saved);
        if (saved.sourceImage) setUploadedImage(saved.sourceImage);
        if (saved.renderedImage) setSelectedInitialRender(saved.renderedImage);
      }
    } else {
      const saved = await unshareProject(updatedItem);
      if (saved) {
        setResolvedItem(saved);
        if (saved.sourceImage) setUploadedImage(saved.sourceImage);
        if (saved.renderedImage) setSelectedInitialRender(saved.renderedImage);
      }
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const state = (location.state || {}) as VisualizerLocationState;

    if (state.initialImage) {
      const item: DesignHistoryItem = {
        id,
        name: state.name || null,
        sourceImage: state.initialImage,
        renderedImage: state.initialRender || undefined,
        timestamp: Date.now(),
        ownerId: state.ownerId || queryOwnerId || null,
        isPublic: isPublicProject,
        sharedBy: state.sharedBy || null,
      };
      setResolvedItem(item);
      setUploadedImage(state.initialImage);
      setSelectedInitialRender(state.initialRender || null);
      if (state.initialRender) return;
    }

    const resolve = async () => {
      setIsResolving(true);
      const fetched = await fetchProjectById(id, queryScope, queryOwnerId);
      if (cancelled) return;

      if (fetched) {
        setResolvedItem(fetched);
        setUploadedImage(fetched.sourceImage || null);
        setSelectedInitialRender(fetched.renderedImage || null);

        // Trigger rendering if there's no rendered image and it's a private project
        if (!fetched.renderedImage && queryScope === "private" && fetched.sourceImage && !isRenderingRef.current) {
          isRenderingRef.current = true;
          setIsRendering(true);
          const rendered = await renderProject(fetched.id, fetched.sourceImage, fetched.name || undefined);
          if (!cancelled && rendered) {
            setSelectedInitialRender(rendered);
            setResolvedItem(prev => prev ? ({ ...prev, renderedImage: rendered }) : null);
          }
          setIsRendering(false);
          isRenderingRef.current = false;
        }
      }
      setIsResolving(false);
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [id, location.state, queryScope, queryOwnerId, isPublicProject]);

  if (!id) return <Navigate to="/" replace />;

  const effectiveInitialImage = resolvedItem?.sourceImage || uploadedImage;
  const effectiveInitialRender =
    selectedInitialRender ?? resolvedItem?.renderedImage ?? null;

  if (!effectiveInitialImage && isResolving) {
    return (
      <div className="visualizer-route loading">
        Loading project…
      </div>
    );
  }

  const resolvedName =
    resolvedItem?.name || (id ? `Residence ${id}` : "Untitled Project");
  const resolvedIsPublic = resolvedItem?.isPublic ?? isPublicProject;
  const canUnshare =
    resolvedIsPublic &&
    !!currentUserId &&
    resolvedItem?.ownerId === currentUserId;

  return (
    <Visualizer
      onBack={() => navigate("/")}
      initialImage={effectiveInitialImage}
      onShare={(image) => handleShareCurrent(image, { visibility: "public" })}
      onUnshare={(image) =>
        handleShareCurrent(image, { visibility: "private" })
      }
      projectName={resolvedName}
      initialRender={effectiveInitialRender}
      isPublic={resolvedIsPublic}
      sharedBy={resolvedItem?.sharedBy || null}
      canUnshare={canUnshare}
      isRendering={isRendering}
    />
  );
}
