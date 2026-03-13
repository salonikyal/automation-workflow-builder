let nodeCounter = 0;

export const getId = (): string => {
    const shortTimestamp = Date.now(); 
    nodeCounter += 1;
    return `dnd${nodeCounter}_${shortTimestamp}`;
  };

export const screenToFlowPosition = (event: React.MouseEvent, reactFlowInstance: any) =>
    reactFlowInstance.project({ x: event.clientX, y: event.clientY });