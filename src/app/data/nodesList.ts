import { FiPlay, FiZap, FiGitBranch, FiClock, FiMail, FiRefreshCcw, FiCheckCircle } from "react-icons/fi";

export const nodesList = [
  { type: "trigger", label: "Trigger", icon: FiPlay, color: "#228be6", category: "trigger" },
  { type: "webhook", label: "Webhook", icon: FiZap, color: "#845ef7", category: "trigger" },
  { type: "condition", label: "Condition", icon: FiGitBranch, color: "#fcc419", category: "logic" },
  { type: "delay", label: "Delay", icon: FiClock, color: "#fcc419", category: "logic" },
  { type: "email", label: "Send Email", icon: FiMail, color: "#51cf66", category: "action" },
  { type: "transform", label: "Transform Data", icon: FiRefreshCcw, color: "#51cf66", category: "action" },
  { type: "end", label: "End", icon: FiCheckCircle, color: "#228be6", category: "output" },
];