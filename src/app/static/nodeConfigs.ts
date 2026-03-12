import {
    FiPlay,
    FiZap,
    FiGitBranch,
    FiClock,
    FiMail,
    FiRefreshCcw,
    FiCheckCircle,
  } from "react-icons/fi";
  
  export const nodeConfigs = {
    trigger: {
      type: "trigger",
      label: "Trigger",
      icon: FiPlay,
      color: "#228be6",
      fields: [],
    },
  
    webhook: {
      type: "webhook",
      label: "Webhook",
      icon: FiZap,
      color: "#845ef7",
      fields: [
        { name: "url", label: "Webhook URL", type: "text" },
        { name: "method", label: "Method", type: "text" },
      ],
    },
  
    condition: {
      type: "condition",
      label: "Condition",
      icon: FiGitBranch,
      color: "#fab005",
      fields: [
        { name: "field", label: "Field", type: "text" },
        { name: "operator", label: "Operator", type: "text" },
        { name: "value", label: "Value", type: "text" },
      ],
    },
  
    delay: {
      type: "delay",
      label: "Delay",
      icon: FiClock,
      color: "#fd7e14",
      fields: [
        { name: "delayTime", label: "Delay Time (seconds)", type: "number" },
      ],
    },
  
    email: {
      type: "email",
      label: "Send Email",
      icon: FiMail,
      color: "#e03131",
      fields: [
        { name: "recipient", label: "Recipient", type: "text" },
        { name: "subject", label: "Subject", type: "text" },
        { name: "body", label: "Body", type: "textarea" },
      ],
    },
  
    transform: {
      type: "transform",
      label: "Transform",
      icon: FiRefreshCcw,
      color: "#0ca678",
      fields: [
        { name: "transformScript", label: "Script", type: "textarea" },
      ],
    },
  
    end: {
      type: "end",
      label: "End",
      icon: FiCheckCircle,
      color: "#868e96",
      fields: [],
    },
  };
  
  export const nodeList = Object.values(nodeConfigs);