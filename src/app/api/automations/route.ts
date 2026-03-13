import { NextRequest, NextResponse } from "next/server";
import { createWorkflow, updateWorkflow, getAllWorkflows } from "@/app/lib/queries/oteries";

export async function GET(req: NextRequest) {
  try {
    const workflows = await getAllWorkflows();
    return NextResponse.json(workflows);
  } catch (err: any) {
    console.error("GET /api/automations error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch workflows" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, nodes, edges } = await req.json();

    if (!nodes || !edges) {
      return NextResponse.json({ error: "Nodes and edges are required" }, { status: 400 });
    }

    // 1. Create workflow row
    const workflow = await createWorkflow(name || "New Workflow", description || "");

    // 2. Save nodes and edges
    await updateWorkflow(workflow.id, nodes, edges, { name, description });

    return NextResponse.json({ id: workflow.id, success: true });
  } catch (err: any) {
    console.error("POST /api/automations error:", err);
    return NextResponse.json({ error: err.message || "Failed to save workflow" }, { status: 500 });
  }
}