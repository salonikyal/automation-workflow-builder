import { useState, useEffect } from "react";
import { useDnD } from "../contexts/DnDContext";
import { FiArrowLeft, FiArrowRight, FiCircle, FiSquare, FiTarget } from "react-icons/fi";
import "./styles.css";

const Sidebar = () => {
  const { setType } = useDnD();
  
  // Responsive collapse state
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  const nodes = [
    { type: "input", label: "Input Node", icon: <FiCircle /> },
    { type: "default", label: "Default Node", icon: <FiSquare /> },
    { type: "output", label: "Output Node", icon: <FiTarget /> },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <span>Actions</span>}
        <button onClick={toggleSidebar} className="toggle-btn">
          {collapsed ? <FiArrowRight /> : <FiArrowLeft />}
        </button>
      </div>

      <div className="node-list">
        {nodes.map((node) => (
          <div
            key={node.type}
            className={`dndnode ${node.type}`}
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            <span className="node-icon">{node.icon}</span>
            {!collapsed && <span className="node-label">{node.label}</span>}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;