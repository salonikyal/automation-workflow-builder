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
import RightPanel from "./RightPanel";
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
import { handleNodeDrop, fitViewOnEvent } from "@/app/services/dndService";
import {Workflow, saveWorkflow, exportWorkflow, getWorkflow} from "@/app/services/workflowService"
import { deleteNodes } from "@/app/services/nodeService";

import { defaultWorkflow } from "@/app/static/templates/defaultWorkflow";
import { emailWorkflow } from "@/app/static/templates/emailWorkflow";

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

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(defaultWorkflow);
  const [workflowType, setWorkflowType] = useState<"blank" | "email" | "existing">("blank");

  const workflowTemplates: Record<"blank" | "email", typeof defaultWorkflow> = {
    blank: defaultWorkflow,
    email: emailWorkflow,
  };

  useEffect(() => {
    const fetchAllWorkflows = async () => {
      try {
        const data = await getWorkflow();
        setWorkflows(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchAllWorkflows();
  }, []);

  // Load the template workflow
  useEffect(() => {
    try {
      if (!selectedWorkflow || !selectedWorkflow.nodes ) {
        throw new Error("Workflow template is invalid or missing nodes/edges");
      }
      const validNodes = selectedWorkflow.nodes.filter(Boolean);
  
      setNodes([...validNodes]);
      setEdges([...selectedWorkflow.edges]);
    } catch (err: any) {
      console.error("Failed to load workflow template:", err);
      setNodes([]);
      setEdges([]);
    }
  }, [selectedWorkflow, setNodes, setEdges]);

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
        fitViewOnEvent(fitView);

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

  const handleSaveWorkflow = useCallback(async () => {
    try {
      if (!nodes.length || !edges.length) {
        throw new Error("Cannot save workflow: nodes or edges are empty");
      }
  
      const workflow: Workflow = {
        name: "Autoflow",
        nodes,
        edges,
      };
  
      const saved = await saveWorkflow(workflow);
  
      alert(`Workflow saved successfully! ID: ${saved.id}`);
    } catch (err: any) {
      console.error("Save workflow failed:", err);
      alert(err.message || "Error saving workflow");
    }
  }, [nodes, edges]);

  const handleExportWorkflow = useCallback(() => {
    const workflow: Workflow = { nodes, edges, name: "Autoflow" };
    exportWorkflow(workflow);
  }, [nodes, edges]);

  const handleSelectTemplate = (template) => {
    const selected = workflowTemplates[template];
    if (!selected) {
      console.error("Template not found:", template);
      return;
    }
    setSelectedWorkflow(selected);
    setWorkflowType(template);
    fitViewOnEvent(fitView);
  }
  


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
          //onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeClick}
          fitView
          //defaultViewport={{ x: 0, y: 0, zoom: 2 }}
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
      <RightPanel
        workflows={workflows}
        onSelectTemplate={handleSelectTemplate}
        // onSelectWorkflow={handleSelectWorkflow}
      />
    </div>
  );
};

export default AutomationBuilder;
