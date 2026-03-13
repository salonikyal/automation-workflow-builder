import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AutomationBuilder from "@/app/components/AutomationBuilder";
import * as workflowService from "@/app/services/workflowService";
import * as dndService from "@/app/services/dndService";

//Hooks
jest.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: any) => <div data-testid="reactflow">{children}</div>,
  useNodesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useEdgesState: (initial: any) => [initial, jest.fn(), jest.fn()],
  useReactFlow: () => ({
    fitView: jest.fn(),
    setViewport: jest.fn(),
    project: jest.fn(),
  }),
  addEdge: jest.fn(),
  Background: () => <div>Background</div>,
  Controls: () => <div>Controls</div>,
  MiniMap: () => <div>MiniMap</div>,
}));

jest.mock("@/app/contexts/DnDContext", () => ({
  useDnD: () => ({ type: "webhook" }),
}))

jest.mock("@/app/services/workflowService");
jest.mock("@/app/services/dndService");
jest.spyOn(dndService, 'handleNodeDrop');

describe("AutomationBuilder Component", () => {
  const mockedGetWorkflow = workflowService.getWorkflow as jest.Mock;
  const mockedSaveWorkflow = workflowService.saveWorkflow as jest.Mock;
  const mockedUpdateWorkflow = workflowService.updateWorkflow as jest.Mock;
  const mockedDeleteWorkflow = workflowService.deleteWorkflow as jest.Mock;
  const mockedHandleNodeDrop = dndService.handleNodeDrop as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetWorkflow.mockResolvedValue([
      { id: "1", name: "Workflow One", nodes: [], edges: [] },
      { id: "2", name: "Workflow Two", nodes: [], edges: [] },
    ]);
    mockedSaveWorkflow.mockResolvedValue({ id: "3" });
    mockedUpdateWorkflow.mockResolvedValue({ success: true });
    mockedDeleteWorkflow.mockResolvedValue({ success: true });
    mockedHandleNodeDrop.mockImplementation((type, event, nodes, setNodes) => {
      setNodes([...nodes, { id: "node_1", type, position: { x: 0, y: 0 }, data: {} }]);
    });
  });

  it("renders ReactFlow and workflow buttons", async () => {
    render(<AutomationBuilder />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
  });

  it("loads templates correctly", async () => {
    render(<AutomationBuilder />);
    const startBtn = screen.getByText("Start Blank");
    fireEvent.click(startBtn);
    expect(screen.getByText("Start Blank")).toBeInTheDocument();

    const emailBtn = screen.getByText("Email Template");
    fireEvent.click(emailBtn);
    expect(screen.getByText("Email Template")).toBeInTheDocument();
  });

  it("opens workflow modal on save", async () => {
    render(<AutomationBuilder />);
    fireEvent.click(screen.getByText("Save"));
    expect(await screen.findByPlaceholderText("Workflow Name")).toBeInTheDocument();
  });

  it("saves new workflow", async () => {
    render(<AutomationBuilder />);
    fireEvent.click(screen.getByTestId("open-workflow-modal-btn"))

    fireEvent.change(screen.getByPlaceholderText("Workflow Name"), { target: { value: "New Workflow" } });
    fireEvent.change(screen.getByPlaceholderText("Description"), { target: { value: "Test Description" } });

    fireEvent.click(screen.getByTestId("save-workflow-btn"))

    await waitFor(() => {
      expect(mockedSaveWorkflow).toHaveBeenCalledWith(expect.objectContaining({
        name: "New Workflow",
        description: "Test Description",
      }));
    });
  });

});