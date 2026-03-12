// services/nodeService.ts
import { Node } from "@xyflow/react";
import { nodeConfigs } from "@/app/static/nodeConfigs";
import { getId } from "@/app/utils/flowUtils";

export const createNodeInstance = (type: string, 
    position: { x: number; y: number }): Node | null => {
    const nodeInfo = nodeConfigs[type];
    if (!nodeInfo) return null;

    const newNode: Node = {
        id: getId(),
        type: nodeInfo.type,
        position,
        data: { ...nodeInfo },
      };

    return newNode;
};

export const deleteNodes = (nodes: Node[], edges: any[], nodeIds: string[]) => {
  const remainingNodes = nodes.filter((n) => !nodeIds.includes(n.id));
  const remainingEdges = edges.filter(
    (e) => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)
  );
  return { remainingNodes, remainingEdges };
};