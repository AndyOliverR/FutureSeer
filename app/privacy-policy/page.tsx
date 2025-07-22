import React from "react";
import fs from "fs";
import path from "path";

export default function PrivacyPolicyPage() {
  const policy = fs.readFileSync(path.join(process.cwd(), "app/privacy-policy.md"), "utf-8");
  return (
    <div className="prose mx-auto p-8">
      <div dangerouslySetInnerHTML={{ __html: policy.replace(/\n/g, '<br/>') }} />
    </div>
  );
} 