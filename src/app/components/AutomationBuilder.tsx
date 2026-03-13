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
import WorkflowModal from "./WorkflowModal"
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
import { Workflow, saveWorkflow, exportWorkflow, getWorkflow, deleteWorkflow, updateWorkflow } from "@/app/services/workflowService"
import { deleteNodes } from "@/app/services/nodeService";

import { defaultWorkflow } from "@/app/static/templates/defaultWorkflow";
import { emailWorkflow } from "@/app/static/templates/emailWorkflow";

import "@xyflow/react/dist/style.css";
import "./styles.css";

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

  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [workflowMeta, setWorkflowMeta] = useState({
    name: "",
    description: ""
  });

  // Load all the workflows
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

  // Load the template or selected workflow
  useEffect(() => {
    try {
      if (!selectedWorkflow || !selectedWorkflow.nodes) {
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

  // open modal on node click
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

  //persist changes in worflow state -> save node properties
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

  const openWorkflowModal = () => setWorkflowModalOpen(true);

  const handleExportWorkflow = useCallback(() => {
    const workflow: Workflow = { nodes, edges, name: "Autoflow" };
    exportWorkflow(workflow);
  }, [nodes, edges]);

  const handleSelectTemplate = (type: "blank" | "email") => {
    if (type === "blank") setSelectedWorkflow(defaultWorkflow);
    if (type === "email") setSelectedWorkflow(emailWorkflow);

    setCurrentWorkflowId(null);
    setWorkflowMeta({ name: "", description: "" });
  };

  // On selecting existing workflow from db
  const handleSelectWorkflow = async (id: string) => {
    try {
      const data = await getWorkflow(id);
  
      // Map nodes from DB to React Flow format
      const mappedNodes = (data.nodes || []).map((n) => ({
        id: n.id,
        type: n.type,
        position: { x: n.position_x ?? 0, y: n.position_y ?? 0 },
        data: n.data ?? {},
      }));
  
      setNodes(mappedNodes);
  
      setEdges(data.edges || []);
  
      setCurrentWorkflowId(id);
      setWorkflowMeta({
        name: data.workflow?.name || "",
        description: data.workflow?.description || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkflowSubmit = async (name: string, description: string) => {
    try {

      if (currentWorkflowId) {
        // UPDATE existing workflow
        await updateWorkflow(
          currentWorkflowId,
          name,
          description,
          nodes,
          edges
        );
        alert("Workflow updated!");

      } else {
        // CREATE new workflow
        const workflow: Workflow = {
          name,
          description,
          nodes,
          edges,
        };
        await saveWorkflow(workflow);
        alert("Workflow created!");
      }
      setWorkflowModalOpen(false);

    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this workflow?");
      if (!confirmed) return;
  
      // Delete from DB
      await deleteWorkflow(id);
  
      // Remove from local state
      setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
  
      // reset canvas
      if (currentWorkflowId === id) {
        setCurrentWorkflowId(null);
        setNodes([]);
        setEdges([]);
        setWorkflowMeta({ name: "", description: "" });
      }
  
      alert("Workflow deleted!");
    } catch (err: any) {
      console.error("Failed to delete workflow:", err);
      alert(err.message || "Error deleting workflow");
    }
  };



  return (
    <div className="automation-builder">
      <Sidebar />
      <div className="workflow-actions">
        <button data-testid="open-workflow-modal-btn" onClick={openWorkflowModal}>Save</button>
        <button data-testid="export-workflow-btn" onClick={handleExportWorkflow}>Export</button>
      </div>
      <div className="reactflow-wrapper" ref={reactFlowWrapper} data-testid="reactflow-wrapper-test">
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
        onSelectWorkflow={handleSelectWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
      />
      {workflowModalOpen && <WorkflowModal
        isOpen={workflowModalOpen}
        initialName={workflowMeta.name}
        initialDescription={workflowMeta.description}
        onClose={() => setWorkflowModalOpen(false)}
        onSave={handleWorkflowSubmit}
      />}
    </div>
  );
};

export default AutomationBuilder;
