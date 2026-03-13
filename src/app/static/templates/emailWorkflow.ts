import { Node, Edge } from "@xyflow/react";
import { createNodeInstance } from "@/app/services/nodeService";
import { getId } from "@/app/utils/flowUtils";

const triggerNode = createNodeInstance("start", { x: 250, y: 0 });
const webhookNode = createNodeInstance("webhook", { x: 250, y: 80 });
const emailNode = createNodeInstance("email", { x: 250, y: 160 });
const endNode = createNodeInstance("end", { x: 250, y: 240 });

const nodes: Node[] = [triggerNode, webhookNode, emailNode, endNode].filter(Boolean) as Node[];

const edges: Edge[] = [
  { id: getId(), source: triggerNode!.id, target: webhookNode!.id },
  { id: getId(), source: webhookNode!.id, target: emailNode!.id },
  { id: getId(), source: emailNode!.id, target: endNode!.id },
];

export const emailWorkflow = {
  nodes,
  edges,
};