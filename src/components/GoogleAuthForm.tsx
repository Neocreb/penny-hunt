
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      storeGoogleCreds({ clientId, clientSecret, redirectUri, scopes });
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
          <div>
            <Label htmlFor="clientId">Google OAuth2 Client ID</Label>
            <Input
              id="clientId"
              placeholder="Enter your Client ID"
              value={clientId}
              autoFocus
              onChange={e => setClientId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input
              id="clientSecret"
              placeholder="Enter your Client Secret"
              value={clientSecret}
              onChange={e => setClientSecret(e.target.value)}
              required
              type="password"
            />
          </div>
          <div>
            <Label htmlFor="redirectUri">Redirect URI</Label>
            <Input
              id="redirectUri"
              placeholder="Your app redirect URI"
              value={redirectUri}
              onChange={e => setRedirectUri(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="scopes">Scopes</Label>
            <Input
              id="scopes"
              placeholder="Google API scopes"
              value={scopes}
              onChange={e => setScopes(e.target.value)}
            />
          </div>
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
