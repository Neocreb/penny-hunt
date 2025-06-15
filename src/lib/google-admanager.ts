
import { getValidAccessToken } from "./google-oauth";

/**
 * Fetch a basic Ad Manager report using Google Ad Manager API
 * Returns table: Ad units, Impressions, Clicks, Earnings (where possible)
 */
export async function fetchAdManagerReport(creds: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
}) {
  const access_token = await getValidAccessToken();

  // Use v202405 (latest) Google Ad Manager API for reports
  // Use a sample report query with dimensions and metrics
  // Ad Manager API endpoint: https://admanager.googleapis.com/v202405/networks/{networkCode}/...
  // But we must first get the user's networkCode by calling NetworkService.getAllNetworks
  const networkResp = await fetch(
    "https://admanager.googleapis.com/v202405/networks",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  if (!networkResp.ok) {
    throw new Error("Failed to fetch networks: " + networkResp.statusText);
  }
  const networkJson = await networkResp.json();
  const networkCode = networkJson["networks"]?.[0]?.networkCode;
  if (!networkCode) {
    throw new Error("No network found in account.");
  }

  // Build reportQuery (example): dimensions: AdUnitName, metrics: Impressions, Clicks, Revenue
  const reportBody = {
    reportQuery: {
      dimensions: ["AD_UNIT_NAME"],
      columns: [
        "AD_SERVER_IMPRESSIONS",
        "AD_SERVER_CLICKS",
        "TOTAL_INVENTORY_LEVEL_REVENUE",
      ],
      dateRangeType: "LAST_MONTH",
    }
  };

  // Start report
  const reportResp = await fetch(
    `https://admanager.googleapis.com/v202405/networks/${networkCode}/reports:run`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportBody),
    }
  );

  if (!reportResp.ok) {
    const errText = await reportResp.text();
    throw new Error("Failed to run report: " + errText);
  }
  const reportJson = await reportResp.json();

  // Fetch the report results (poll until ready)
  let reportId = reportJson["report"]["id"];
  let done = false, attempts = 0, maxAttempts = 15;
  let rows = [], columnHeaders = [];
  while (!done && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts += 1;

    const statusResp = await fetch(
      `https://admanager.googleapis.com/v202405/networks/${networkCode}/reports/${reportId}`,
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );
    if (!statusResp.ok) {
      throw new Error("Failed polling report status");
    }
    const statusJson = await statusResp.json();
    done = statusJson["report"]?.["isReady"];
    if (done) {
      // Download the report (JSON format)
      const downloadResp = await fetch(
        `https://admanager.googleapis.com/v202405/networks/${networkCode}/reports/${reportId}:download?format=JSON`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (!downloadResp.ok) {
        throw new Error("Failed downloading report");
      }
      const final = await downloadResp.json();
      // Return simplified data
      columnHeaders = final?.["columnHeaders"] || [];
      rows = final?.["rows"] || [];
      return { columnHeaders, rows };
    }
  }
  throw new Error("Report not ready after polling. Try again later.");
}
