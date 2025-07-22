import React from "react";
import fs from "fs";
import path from "path";

export default function DataDeletionPage() {
  const deletion = fs.readFileSync(path.join(process.cwd(), "app/data-deletion.md"), "utf-8");
  return (
    <div className="prose mx-auto p-8">
      <div dangerouslySetInnerHTML={{ __html: deletion.replace(/\n/g, '<br/>') }} />
    </div>
  );
} 