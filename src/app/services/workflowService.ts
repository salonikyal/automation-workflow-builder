import { Node, Edge } from "@xyflow/react";

const API_BASE = "/api/automations";

export interface Workflow {
  id?: string;
  name?: string;
  description?: string;
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

export const getWorkflow = async (id?: string): Promise<Workflow | Workflow[]> => {
  try {
    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch workflow(s)");
    return await res.json();
  } catch (err: any) {
    console.error("Workflow fetch error:", err);
    throw err;
  }
};

export const deleteWorkflow = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete workflow");
    return await res.json();
  } catch (err: any) {
    console.error("Workflow delete error:", err);
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

export const updateWorkflow = async (id: string, name: string, description: string, nodes: Node[], edges: Edge[]) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({name, description, nodes, edges}),
    });

    if (!res.ok) throw new Error("Failed to update workflow");

    return await res.json();
  } catch (err: any) {
    console.error("Workflow update error:", err);
    throw err;
  }
};
