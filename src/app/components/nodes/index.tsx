import BaseNode from "./BaseNode";

export const TriggerNode = (props) => (
  <BaseNode {...props} />
);

export const EndNode = (props) => (
  <BaseNode {...props} />
);

// Trigger
export const WebhookNode = (props) => (
  <BaseNode {...props} />
);

// Logic
export const ConditionNode = ({ data, type }) => (
  <BaseNode
    data={{
      ...data,
      conditions: data.conditions || [{ field: "", operator: "", value: "" }], 
    }}
    type={type}
  />
);

// Logic
export const DelayNode = ({ data, type }) => (
  <BaseNode
    data={{
      ...data,
      delayTime: data.delayTime || 5, 
    }}
    type={type}
  />
);

// Action
export const EmailNode = ({ data, type }) => (
  <BaseNode
    data={{
      ...data,
      recipient: data.recipient || "",
      subject: data.subject || "",
      body: data.body || "",
    }}
    type={type}
  />
);

// Action
export const TransformNode = ({ data, type }) => (
  <BaseNode
    data={{
      ...data,
      transformScript: data.transformScript || "",
    }}
    type={type}
  />
);