import { Node, Edge } from "@xyflow/react";
import { createNodeInstance } from "@/app/services/nodeService";

const triggerNode = createNodeInstance("start", { x: 250, y: 0 });

const nodes: Node[] = [triggerNode]
const edges: Edge[] = [];

export const defaultWorkflow = {
  nodes,
  edges,
};