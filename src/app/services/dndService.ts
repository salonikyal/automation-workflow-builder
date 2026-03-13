import { Node } from "@xyflow/react";
import { createNodeInstance } from "./nodeService";

export const handleNodeDrop = (
    type: string,
    event: React.DragEvent,
    nodes: Node[],
    setNodes: (nodes: Node[]) => void,
    screenToFlowPosition: (e: any) => { x: number; y: number },
    setSelectedNode: (node: Node) => void,
    setIsModalOpen: (val: boolean) => void
) => {
    event.preventDefault();

    const lastNode = nodes[nodes.length - 1];
    // to stack nodes vertically
    const position = lastNode
        ? { x: lastNode.position.x, y: lastNode.position.y + 80 }
        : screenToFlowPosition(event);

    const newNode = createNodeInstance(type, position);
    if (!newNode) return;

    setSelectedNode(newNode);
    setIsModalOpen(true);
    setNodes([...nodes, newNode]);

    // scroll down on node drop
    const wrapper = (event.currentTarget as HTMLElement).closest(".reactflow-wrapper");
    if (wrapper)
        wrapper.scrollBy({
            top: 150,
            behavior: "smooth",
        });
};

export const fitViewOnEvent = (fitView) => {
    setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 0);
}