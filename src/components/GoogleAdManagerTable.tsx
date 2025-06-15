
import React from "react";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

type Props = { report: any };

// Try to parse rows, otherwise show fallback
function parseRows(raw: any) {
  // Google AdManager returns { rows: [], columnHeaders: [] }
  if (!raw || !Array.isArray(raw.rows) || !Array.isArray(raw.columnHeaders)) return null;
  return {
    columns: raw.columnHeaders.map((h: any) => h.name || h),
    rows: raw.rows,
  };
}

const GoogleAdManagerTable: React.FC<Props> = ({ report }) => {
  const parsed = parseRows(report);

  if (!parsed || !parsed.rows.length) {
    return (
      <div className="text-muted-foreground">
        No tabular analytics data (see raw JSON above if available).
      </div>
    );
  }
  // Assume the first object represents columns/keys
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {parsed.columns.map((col: string, i: number) => (
              <TableCell key={col + i} className="font-bold bg-muted">{col}</TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parsed.rows.map((row: any, i: number) => (
            <TableRow key={i}>
              {parsed.columns.map((col: string, j: number) => (
                <TableCell key={j}>{row[col] ?? "-"}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GoogleAdManagerTable;
