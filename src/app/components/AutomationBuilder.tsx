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
import EmailNode from "./nodes/EmailNode";
import { useDnD } from "../contexts/DnDContext";

import "@xyflow/react/dist/style.css";
import "./styles.css";

let id = 0;
const getId = () => `dndnode_${id++}`;

// list of possible node types
const nodeTypes: NodeTypes = {
  email: EmailNode,
};

const AutomationBuilder = () => {
  const reactFlowWrapper = useRef(null);

  const { screenToFlowPosition } = useReactFlow();
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

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      try {
        event.preventDefault();
  
        if (!type) {
          throw new Error("Invalid node type dropped");
        }
  
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
  
        const newNode: Node = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };
  
        setNodes((nds) => [...nds, newNode]);
  
        setSelectedNode(newNode);
        setIsModalOpen(true);
  
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

  return (
    <div className="automation-builder">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          //onNodeDoubleClick={onNodeClick}
          fitView
          className="overview"
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          {/* <MiniMap zoomable pannable /> */}
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
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
