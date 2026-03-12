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
import { handleNodeDrop } from "@/app/services/dndService";
import {saveWorkflow, exportWorkflow} from "@/app/services/workflowService"

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

        handleNodeDrop(
          type,
          event,
          nodes,
          setNodes,
          (e) => screenToFlowPosition(e, reactFlowWrapper.current),
          setSelectedNode,
          setIsModalOpen
        );

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to create node");
      }
    },
    [screenToFlowPosition, type, nodes, setNodes]
  );

  // open modal on click
  const onNodeClick = (_, node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  //persist changes in worflow state
  const handleSaveNode = useCallback(
    (formData: Record<string, any>) => {
      if (!selectedNode) return;
      try {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, ...formData } }
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
    (deletedNodes: Node[]) => {
      const deletableNodes = deletedNodes.filter((n) => n.type !== "start");
      const { remainingNodes, remainingEdges } = deleteNodes(
        nodes,
        edges,
        deletableNodes.map((n) => n.id)
      );
      setNodes(remainingNodes);
      setEdges(remainingEdges);
    },
    [nodes, edges, setNodes, setEdges]
  );

  const handleSaveWorkflow = useCallback(async () => {
    const workflow: Workflow = { nodes, edges, name: "Autoflow" };
  
    try {
      await saveWorkflow(workflow);
      alert("Workflow saved successfully!");
    } catch (err: any) {
      alert(err.message || "Error saving workflow");
    }
  }, [nodes, edges]);

  const handleExportWorkflow = useCallback(() => {
    const workflow: Workflow = { nodes, edges, name: "Autoflow" };
    exportWorkflow(workflow);
  }, [nodes, edges]);
  


  return (
    <div className="automation-builder">
      <Sidebar />
      <div className="workflow-actions">
        <button onClick={handleSaveWorkflow}>Save</button>
        <button onClick={handleExportWorkflow}>Export</button>
      </div>
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
          onSave={handleSaveNode}
        />
      )}
    </div>
  );
};

export default AutomationBuilder;
