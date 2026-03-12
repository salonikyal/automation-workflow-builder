let id = 0;

export const getId = () => `dndnode_${id++}`;

export const screenToFlowPosition = (event: React.MouseEvent, reactFlowInstance: any) =>
    reactFlowInstance.project({ x: event.clientX, y: event.clientY });