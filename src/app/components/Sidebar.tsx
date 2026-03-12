import { useState, useEffect } from "react";
import { useDnD } from "../contexts/DnDContext";
import { FiArrowLeft, FiArrowRight} from "react-icons/fi";
import { nodesList } from "../data/nodesList";
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

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h2>Actions</h2>}
        <button onClick={toggleSidebar} className="toggle-btn">
          {collapsed ? <FiArrowRight /> : <FiArrowLeft />}
        </button>
      </div>

      <div className="node-list">
        {nodesList.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="dndnode"
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <Icon style={{ color: node.color }} className="node-icon" />
              {!collapsed && <span className="node-label">{node.label}</span>}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;