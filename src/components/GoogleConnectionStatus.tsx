
import React from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Props = {
  state: "not_connected" | "connecting" | "connected" | "fetching" | "error";
  error?: string | null;
};

const statusMap = {
  not_connected: { icon: XCircle, text: "Not Connected", color: "text-destructive" },
  connecting: { icon: Loader2, text: "Connecting...", color: "text-muted-foreground animate-spin" },
  connected: { icon: CheckCircle2, text: "Connected", color: "text-green-600" },
  fetching: { icon: Loader2, text: "Fetching...", color: "text-blue-600 animate-spin" },
  error: { icon: XCircle, text: "Connection Error", color: "text-destructive" },
};

const GoogleConnectionStatus: React.FC<Props> = ({ state, error }) => {
  const { icon: Icon, text, color } = statusMap[state];
  return (
    <div className="flex items-center gap-1 mb-2 mt-2 ml-1">
      <Icon size={19} className={color} aria-hidden />
      <span className={`${color} font-medium mr-2`}>{text}</span>
      {state === "error" && error && (
        <span className="text-xs text-destructive ml-1">({error})</span>
      )}
    </div>
  );
};

export default GoogleConnectionStatus;
