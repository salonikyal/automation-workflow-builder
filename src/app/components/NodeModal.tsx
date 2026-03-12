"use client";

import { useEffect, useState } from "react";
import { Node } from "@xyflow/react";

type NodeModalProps = {
    node: Node;
    onSave: (data: any) => void;
    onClose: () => void;
};

export default function NodeModal({ node, onSave, onClose }: NodeModalProps) {
    const [label, setLabel] = useState(node.data.label || "");
    const config = node.data || { fields: [] };
    const [formData, setFormData] = useState<Record<string, any>>({ ...node.data });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData({ ...node.data });
        setError(null);
    }, [node]);

    const updateField = (fieldName: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
        if (error) setError(null);
    };

    const handleSubmit = () => {
        // label validation
        if (!formData.label || !formData.label.trim()) {
            setError("Node label cannot be empty");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <span>Node Properties</span>

                <label>Label</label>
                <input
                    type="text"
                    value={formData.label || ""}
                    onChange={(e) => updateField("label", e.target.value)}
                     autoFocus
                />

                {/* Render dynamic fields */}
                {config.fields.map((field) => {
                if (field.name === "label") return null; // already rendered
                return (
                    <div key={field.name} style={{ marginTop: "8px" }}>
                    <label>{field.label}</label>
                    {field.type === "textarea" ? (
                        <textarea
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        />
                    ) : (
                        <input
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateField(field.name, e.target.value)}
                        />
                    )}
                    </div>
                );
                })}
                {/* Inline warning */}
                {error && <p className="modal-error">{error}</p>}

                <div className="modal-buttons">
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.label || !formData.label.trim()}
                    >
                        Save
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}