import { FiPlay } from "react-icons/fi";

export const initialNodes = [
  {
    id: "start",
    type: "start",
    position: { x: 200, y:50 },
    selectable: false,
    deletable: false,
    data: { label: "Start", icon: FiPlay, color: "#228be6", fields: [] },
  },
];

export const initialEdges = [];