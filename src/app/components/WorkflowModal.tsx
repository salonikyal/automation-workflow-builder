import { useState } from "react";

interface WorkflowModalProps {
  workflowId: string;
  isOpen: boolean;
  initialName?: string;
  initialDescription?: string;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

export default function WorkflowModal({
  workflowId,
  isOpen,
  initialName,
  initialDescription,
  onClose,
  onSave
}: WorkflowModalProps) {
  const [name, setName] = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");

  const handleSubmit = () => {
    onSave(
      name,
      description
    );
  };

  if (!isOpen) return null;


  return (
    <div className="modal-overlay">
      <div className="modal">
        <span>Save Workflow</span>
        <input type="text" placeholder="Workflow Name" value={name} onChange={e => setName(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="modal-buttons">
          <button data-testid="save-workflow-btn" onClick={handleSubmit} disabled={!name || !name.trim()}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
    </div >
  );
}