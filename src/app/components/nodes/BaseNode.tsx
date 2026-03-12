"use client";
import { Handle, Position, useReactFlow } from "@xyflow/react";

type BaseNodeProps = {
  id: string;
  data: {
    label: string;
    icon?: any;
    color?: string;
    [key: string]: any;
  };
  type: string;
  selected?: boolean;
};

export default function BaseNode({ id, data, type }: BaseNodeProps) {
  const Icon = data.icon;
  const { setNodes, setEdges } = useReactFlow()

  return (
    <>
      {Icon && (
        <span className="node-icon-wrapper">
          <Icon className="node-icon" style={{ color: data.color || "#228be6" }} />
        </span>
      )}
      <span className="node-label">{data.label}</span>

      {/* Start node has no input */}
      {type !== "start" && <Handle type="target" position={Position.Top} />}
      {/* Condition node has 2 bottom handles */}
      {type === "condition" && 
        <><Handle id="true" type="source" position={Position.Bottom} style={{ left: "30%" }}/>
        <Handle id="false" type="source" position={Position.Bottom} style={{ left: "70%" }}/></>
      }
      {/* End node has no output */}
      {type !== "end" && type !== "condition" && <Handle type="source" position={Position.Bottom} />}
    </>
  );
}