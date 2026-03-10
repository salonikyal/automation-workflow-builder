"use client";

import { useState } from "react";

export default function NodeModal({ node, onSave, onClose }) {
    const [label, setLabel] = useState(node.data.label);
    const handleSave = () => {
        onSave(label);
        onClose();
    };
    return (
        <div className="modal-overlay">
            <div className="modal">

                <h2>Edit Node</h2>

                <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                />

                <div className="modal-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    );
}