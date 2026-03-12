"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  OnConnect,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import Sidebar from "./Sidebar";
import NodeModal from "./NodeModal";
import {
  TriggerNode,
  WebhookNode,
  ConditionNode,
  DelayNode,
  EmailNode,
  TransformNode,
  EndNode
} from "./nodes";
import { useDnD } from "@/app/contexts/DnDContext";
import { nodeConfigs } from "@/app/static/nodeConfigs";

import "@xyflow/react/dist/style.css";
import "./styles.css";

let id = 0;
const getId = () => `dndnode_${id++}`;

// list of possible node types
const nodeTypes: NodeTypes = {
  start: TriggerNode,
  webhook: WebhookNode,
  condition: ConditionNode,
  delay: DelayNode,
  email: EmailNode,
  transform: TransformNode,
  end: EndNode,
};

const AutomationBuilder = () => {
  const reactFlowWrapper = useRef(null);

  const { screenToFlowPosition, fitView } = useReactFlow();
  const { type } = useDnD();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // we load the data from the server on mount
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("/api/automation");
        if (!res.ok) throw new Error("Failed to fetch automation workflow");

        const automation = await res.json();
        setNodes(automation.nodes || []);
        setEdges(automation.edges || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to load workflow");
      }
    };
    getData();
  }, [setNodes, setEdges]);

  // various callbacks
  const onConnect: OnConnect = useCallback(
    (params) => {
      try {
        setEdges((eds) => addEdge(params, eds));
      } catch (err) {
        console.error(err);
        setError("Failed to connect nodes");
      }
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onNodeDragStop = useCallback(() => {
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 });
    }, 0);
  }, [fitView]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      try {
        event.preventDefault();
  
        if (!type) {
          throw new Error("Invalid node type dropped");
        }
  
        const nodeInfo = nodeConfigs[type];
        if (!nodeInfo) return;
  
        setNodes((nds) => {
          const lastNode = nds[nds.length - 1];
  
          // to stack nodes vertically
          const position = lastNode
            ? {
                x: lastNode.position.x,
                y: lastNode.position.y + 80,
              }
            : screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
              });
  
          const newNode: Node = {
            id: getId(),
            type: nodeInfo.type,
            position,
            data: { ...nodeInfo },
          };
          const updatedNodes = [...nds, newNode];
  
          setSelectedNode(newNode);
          setIsModalOpen(true);
  
          // scroll down on node drop
          if (reactFlowWrapper.current) {
            reactFlowWrapper.current.scrollBy({
              top: 150,
              behavior: "smooth",
            });
          }
  
          return updatedNodes;
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to create node");
      }
    },
    [screenToFlowPosition, type, setNodes]
  );

  // open modal on click
  const onNodeClick = (_, node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  //persist changes in worflow state
  const handleSave = useCallback(
    (label: string) => {
      if (!selectedNode) return;

      try {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, label } }
              : node
          )
        );

        setIsModalOpen(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to save node changes");
      }
    },
    [selectedNode, setNodes]
  );

  const onNodesDelete = useCallback(
    (deleted) => {
      const deletableNodes = deleted.filter((node) => node.type !== "start");
      setNodes((nds) =>
        nds.filter((n) => !deletableNodes.some((d) => d.id === n.id))
      );
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !deletableNodes.some((d) => d.id === e.source || d.id === e.target)
        )
      );
    },
    [setNodes, setEdges]
  );

  return (
    <div className="automation-builder">
      <Sidebar />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onNodeClick={onNodeClick}
          // onNodeDoubleClick={onNodeClick}
          // fitView
          defaultViewport={{ x: 0, y: 0, zoom: 2 }}
          className="overview"
          onDrop={onDrop}
          onNodeDragStop={onNodeDragStop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          {/* <MiniMap zoomable pannable /> */}
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {isModalOpen && selectedNode && (
        <NodeModal
          key={selectedNode.id}
          node={selectedNode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AutomationBuilder;
