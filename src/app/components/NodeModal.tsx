"use client";

import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";

type NodeModalProps = {
    node: Node;
    onSave: (label: string) => void;
    onClose: () => void;
};

export default function NodeModal({ node, onSave, onClose }: NodeModalProps) {
    const [label, setLabel] = useState(node.data.label || "");
    const [error, setError] = useState<string | null>(null);

    // Reset label and error when switching nodes
    useEffect(() => {
        setLabel(node.data.label || "");
        setError(null);
    }, [node]);

    const handleSubmit = () => {
        if (!label.trim()) {
            setError("Node label cannot be empty");
            return; // prevents saving
        }

        setError(null);
        onSave(label.trim());
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Node</h2>

                <label>Node Label</label>
                <input
                    value={label}
                    onChange={(e) => {
                        setLabel(e.target.value);
                        if (error) setError(null); // clear warning on typing
                    }}
                    autoFocus
                />

                {/* Inline warning */}
                {error && <p className="modal-error">{error}</p>}

                <div className="modal-buttons">
                    <button
                        onClick={handleSubmit}
                        disabled={!label.trim()} // disables save if empty
                    >
                        Save
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}