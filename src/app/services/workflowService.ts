import { Node, Edge } from "@xyflow/react";

const API_BASE = "/api/automations";

export interface Workflow {
  id?: string;
  name?: string;
  nodes: Node[];
  edges: Edge[];
  metadata?: Record<string, any>;
}

export const saveWorkflow = async (workflow: Workflow) => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflow),
    });

    if (!res.ok) throw new Error("Failed to save workflow");

    return await res.json();
  } catch (err: any) {
    console.error("Workflow save error:", err);
    throw err;
  }
};

export const exportWorkflow = (workflow: Workflow) => {
  const workflowData = JSON.stringify(workflow, null, 2);
  const blob = new Blob([workflowData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = workflow.name ? `${workflow.name}.json` : "workflow.json";
  link.click();
  URL.revokeObjectURL(url);
};