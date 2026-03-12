import { Node, Edge } from "@xyflow/react";
import { createNodeInstance } from "@/app/services/nodeService";

const triggerNode = createNodeInstance("start", { x: 250, y: 0 });
const webhookNode = createNodeInstance("webhook", { x: 250, y: 80 });
const emailNode = createNodeInstance("email", { x: 250, y: 160 });
const endNode = createNodeInstance("end", { x: 250, y: 240 });

const nodes: Node[] = [triggerNode, webhookNode, emailNode, endNode].filter(Boolean) as Node[];

const edges: Edge[] = [
  { id: "e1", source: triggerNode!.id, target: webhookNode!.id },
  { id: "e2", source: webhookNode!.id, target: emailNode!.id },
  { id: "e3", source: emailNode!.id, target: endNode!.id },
];

export const emailWorkflow = {
  nodes,
  edges,
};