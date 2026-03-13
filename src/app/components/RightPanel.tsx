import { useState, useEffect } from "react";
import "./styles.css";
import { FiArrowLeft, FiArrowRight, FiEdit, FiTrash2, FiFile } from "react-icons/fi";

interface RightPanelProps {
  workflows: any[];
  onSelectTemplate: (templateName: "blank" | "email") => void;
  onSelectWorkflow: (workflowId: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
}

export default function RightPanel({
  workflows,
  onSelectWorkflow,
  onSelectTemplate,
  onDeleteWorkflow
}: RightPanelProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);
  return (
    <div className={`rightpanel ${collapsed ? "collapsed" : ""}`}>
      <div className="rightpanel-header">
        <button onClick={toggleSidebar} className="toggle-btn">
          {collapsed ? <FiArrowLeft /> : <FiArrowRight />}
        </button>
        {!collapsed && <h2 className="panel-label">Workflows</h2>}

      </div>
      {!collapsed && (
        <div className="workflows">
          {/* Templates */}
          <div className="workflowItem template">
            <FiFile className="workflowIcon" />
            <span className="workflowName">Start Blank</span>
            <div className="workflowActions">
              <button
                title="Use template"
                onClick={() => onSelectTemplate("blank")}
                className="iconBtn"
              >
                <FiEdit />
              </button>
              <button title="Cannot delete template" className="iconBtn disabled" disabled>
                <FiTrash2 />
              </button>
            </div>
          </div>

          <div className="workflowItem template">
            <FiFile className="workflowIcon" />
            <span className="workflowName">Email Template</span>
            <div className="workflowActions">
              <button
                title="Use template"
                onClick={() => onSelectTemplate("email")}
                className="iconBtn"
              >
                <FiEdit />
              </button>
              <button title="Cannot delete template" className="iconBtn disabled" disabled>
                <FiTrash2 />
              </button>
            </div>
          </div>

          {/* DB workflows */}
          {workflows.map((wf) => (
            <div key={wf.id} className="workflowItem">
              <FiFile className="workflowIcon" />
              <span className="workflowName">{wf.name}</span>
              <div className="workflowActions">
                <button
                  title="Edit workflow"
                  onClick={() => onSelectWorkflow(wf.id)}
                  className="iconBtn"
                >
                  <FiEdit />
                </button>
                <button
                  title="Delete workflow"
                  onClick={() => onDeleteWorkflow(wf.id)}
                  className="iconBtn"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}