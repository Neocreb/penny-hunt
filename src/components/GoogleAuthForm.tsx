
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { googleAuthorizeWithPopup, storeGoogleCreds } from "@/lib/google-oauth";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSuccess: () => void;
};

const GoogleAuthForm: React.FC<Props> = ({ open, setOpen, onSuccess }) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState(window.location.origin);
  const [scopes, setScopes] = useState(
    "https://www.googleapis.com/auth/dfp.report.readonly https://www.googleapis.com/auth/admanager.readonly"
  );
  const [loading, setLoading] = useState(false);

  // Help message for users
  const helpMsg = (
    <ul className="text-xs text-muted-foreground list-disc pl-5 mb-2">
      <li>Create a Google Cloud Project at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
      <li>Enable "Ad Manager API"</li>
      <li>
        Create OAuth2 Client ID/Secret credentials<br/>
        Set redirect URI to <code>{redirectUri}</code>
      </li>
    </ul>
  );

  async function handleStartAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!clientId || !clientSecret || !redirectUri) {
        toast({ title: "Missing Info", description: "Client ID, Secret, and Redirect URI required", variant: "destructive" });
        setLoading(false);
        return;
      }
      // Save to localStorage for demo
      storeGoogleCreds({ clientId, clientSecret, redirectUri, scopes });

      // Run OAuth flow in popup (let user finish login)
      await googleAuthorizeWithPopup({ clientId, redirectUri, scopes });
      toast({ title: "OAuth Success", description: "Login succeeded. Ready to fetch data!" });
      setLoading(false);
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      setLoading(false);
      toast({ title: "Auth failed", description: error?.message || String(error), variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="mb-2">Connect Your Google Ad Manager Account</DialogTitle>
        </DialogHeader>
        <div className="mb-2">{helpMsg}</div>
        <form className="space-y-3" onSubmit={handleStartAuth}>
          <Input
            label="Google OAuth2 Client ID"
            placeholder="Enter your Client ID"
            value={clientId}
            autoFocus
            onChange={e => setClientId(e.target.value)}
            required
          />
          <Input
            label="Client Secret"
            placeholder="Enter your Client Secret"
            value={clientSecret}
            onChange={e => setClientSecret(e.target.value)}
            required
            type="password"
          />
          <Input
            label="Redirect URI"
            placeholder="Your app redirect URI"
            value={redirectUri}
            onChange={e => setRedirectUri(e.target.value)}
            required
          />
          <Input
            label="Scopes"
            placeholder="Google API scopes"
            value={scopes}
            onChange={e => setScopes(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleAuthForm;
