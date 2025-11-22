import React from "react";
import { clsx } from "clsx";

interface TableProps {
  headers: string[];
  rows: (React.ReactNode[])[];
  dense?: boolean;
}

export function Table({ headers, rows, dense = false }: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="overflow-x-auto">
        <table className={clsx("min-w-full divide-y divide-gray-200", dense ? "text-sm" : "text-base")}> 
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((cells, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {cells.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-6 py-4 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
