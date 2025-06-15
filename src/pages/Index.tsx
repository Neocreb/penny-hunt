
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import GoogleAuthForm from "@/components/GoogleAuthForm";
import GoogleConnectionStatus from "@/components/GoogleConnectionStatus";
import GoogleAdManagerTable from "@/components/GoogleAdManagerTable";
import { fetchAdManagerReport } from "@/lib/google-admanager";
import { disconnectGoogle, getGoogleStatus, getStoredGoogleCreds } from "@/lib/google-oauth";

const APP_TITLE = "Google Ad Manager Analytics Fetcher";

// UI states
type ConnState = "not_connected" | "connecting" | "connected" | "fetching" | "error";

const Index: React.FC = () => {
  const [connState, setConnState] = useState<ConnState>("not_connected");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [data, setData] = useState<any>(null); // report data (raw)
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Check localstorage creds for "connected" state
  React.useEffect(() => {
    if (getGoogleStatus() === "connected") setConnState("connected");
    else setConnState("not_connected");
  }, []);

  // Connect action
  const handleConnect = () => setShowAuthModal(true);

  // Disconnect
  const handleDisconnect = () => {
    disconnectGoogle();
    setConnState("not_connected");
    setData(null);
    setError(null);
    toast({ title: "Disconnected", description: "Google connection reset." });
  };

  // Callback after successful OAuth/token exchange
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setConnState("connected");
    toast({
      title: "Connected!",
      description: "Google Ad Manager access granted.",
    });
  };

  // Fetch data from Ad Manager after connection
  async function handleFetch() {
    setConnState("fetching");
    setError(null);
    setData(null);

    try {
      const creds = getStoredGoogleCreds();
      if (!creds) {
        setConnState("error");
        setError("No Google credentials found.");
        toast({ title: "Error", description: "Missing credentials." });
        return;
      }
      // Run API fetch
      const report = await fetchAdManagerReport(creds);
      if (report && report.rows?.length) {
        setData(report);
        setConnState("connected");
        setShowRaw(false);
        toast({ title: "Success", description: "Ad Manager data fetched." });
      } else {
        setData(report);
        setConnState("connected");
        setError("No data returned (possible MCM inactive, or account empty).");
        toast({
          title: "Connected (no data)",
          description: "No analytics data found — check Ad Manager setup or MCM status.",
        });
      }
    } catch (err: any) {
      setConnState("error");
      setError(err?.message || "Failed to fetch Ad Manager data");
      setData(null);
      toast({ title: "Error", description: err?.message || "API call error." });
    }
  }

  // UI layout
  return (
    <div className="flex flex-col items-center min-h-screen bg-background px-0 md:px-10 py-8 w-full">
      <header className="w-full max-w-4xl mb-6 flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{APP_TITLE}</h1>
          <GoogleConnectionStatus state={connState} error={error} />
        </div>
        <div className="flex items-center gap-2">
          {connState !== "connected" && (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleConnect}>
              <ArrowRight className="w-5 h-5 mr-2" />
              Connect to Google Ad Manager
            </Button>
          )}
          {connState === "connected" && (
            <Button size="sm" variant="secondary" className="border" onClick={handleDisconnect}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          )}
        </div>
      </header>

      <main className="w-full max-w-4xl">
        {/* Data Section */}
        {connState === "connected" && (
          <>
            <div className="flex items-center mb-4 gap-2">
              <Button onClick={handleFetch} size="sm" disabled={connState === "fetching"}>
                {connState === "fetching" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  ""
                )}
                Fetch Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRaw((prev) => !prev)}
                disabled={!data}
              >
                {showRaw ? "Show Table" : "Show Raw JSON"}
              </Button>
            </div>
            <div className="w-full border rounded-lg bg-card shadow p-4 transition">
              {!data && !error && (
                <div className="text-muted-foreground">No data. Click 'Fetch Data'.</div>
              )}
              {data && !showRaw && (
                <GoogleAdManagerTable report={data} />
              )}
              {data && showRaw && (
                <pre className="max-h-80 overflow-auto text-xs bg-muted rounded p-2">{JSON.stringify(data, null, 2)}</pre>
              )}
              {error && (
                <div className="text-destructive font-medium">{error}</div>
              )}
            </div>
          </>
        )}
        {connState === "fetching" && (
          <div className="flex flex-col items-center gap-4 mt-16">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <div className="text-lg font-semibold">Fetching data from Google Ad Manager...</div>
          </div>
        )}
        {connState === "not_connected" && (
          <div className="border rounded-lg bg-card shadow px-8 py-6 max-w-xl mx-auto">
            <div className="text-muted-foreground font-medium mb-2">
              Not connected to Google Ad Manager.
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={handleConnect}>
              <ArrowRight className="w-5 h-5 mr-2" />
              Connect to Google Ad Manager
            </Button>
            <ul className="mt-6 text-xs text-muted-foreground list-disc list-inside">
              <li>Your credentials are only held in memory/localStorage (for demo — not for production use!)</li>
              <li>
                You must set up a Google Cloud Project with OAuth2 credentials:<br />
                <a
                  className="underline text-blue-700"
                  href="https://console.cloud.google.com"
                  target="_blank" rel="noopener noreferrer"
                >Google Cloud Console &rarr;</a>
              </li>
              <li>
                Enable "Ad Manager API" and create OAuth2 credentials (Client ID/Secret).
              </li>
              <li>
                Set <strong>Redirect URI</strong> to <code>http://localhost:8080</code> (or your deployed app URL)
              </li>
            </ul>
          </div>
        )}
      </main>

      <GoogleAuthForm
        open={showAuthModal}
        setOpen={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;

