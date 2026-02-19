import type React from "react";

interface Material {
  id: string;
  name: string;
  thumbnail: string;
  type: "color" | "texture";
  category: "floor" | "wall" | "furniture";
}

export interface DesignHistoryItem {
  id: string;
  name?: string | null;
  sourceImage: string;
  sourcePath?: string | null;
  renderedImage?: string | null;
  renderedPath?: string | null;
  publicPath?: string | null;
  timestamp: number;
  ownerId?: string | null;
  sharedBy?: string | null;
  sharedAt?: string | null;
  isPublic?: boolean;
}

export interface DesignConfig {
  floor: string;
  walls: string;
  style: string;
}

export enum AppStatus {
  IDLE = "IDLE",
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  READY = "READY",
}

export type RenderCompletePayload = {
  renderedImage: string;
  renderedPath?: string;
};

export type VisualizerLocationState = {
  initialImage?: string;
  initialRender?: string | null;
  ownerId?: string | null;
  name?: string | null;
  sharedBy?: string | null;
};

export interface VisualizerProps {
  onBack: () => void;
  initialImage: string | null;
  onShare?: (image: string) => Promise<void> | void;
  onUnshare?: (image: string) => Promise<void> | void;
  projectName?: string;
  initialRender?: string | null;
  isPublic?: boolean;
  sharedBy?: string | null;
  canUnshare?: boolean;
  isRendering?: boolean;
  needsPuterSignIn?: boolean;
  onPuterSignIn?: () => Promise<void> | void;
}

export interface UploadProps {
  onComplete: (base64File: string) => Promise<boolean | void> | boolean | void;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export type AuthContext = {
  isSignedIn: boolean;
  userName: string | null;
  userId: string | null;
  refreshAuth: () => Promise<boolean>;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

export type AuthRequiredModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

export type SignInModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export type ConfirmModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
};

type ShareAction = "share" | "unshare";
type ShareStatus = "idle" | "saving" | "done";
