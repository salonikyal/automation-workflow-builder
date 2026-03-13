import { render, screen, fireEvent } from "@testing-library/react";
import RightPanel from "@/app/components/RightPanel";

const workflows = [
  { id: "1", name: "Testflow" },
  { id: "2", name: "Autoflow" },
];

describe("RightPanel Component", () => {
  it("renders workflows and templates", () => {
    render(<RightPanel workflows={workflows} onSelectTemplate={jest.fn()} onSelectWorkflow={jest.fn()} onDeleteWorkflow={jest.fn()} />);
    expect(screen.getByText("Start Blank")).toBeInTheDocument();
    expect(screen.getByText("Email Template")).toBeInTheDocument();
    expect(screen.getByText("Testflow")).toBeInTheDocument();
  });

  it("calls onSelectWorkflow on edit", () => {
    const onSelectWorkflow = jest.fn();
    render(<RightPanel workflows={workflows} onSelectTemplate={jest.fn()} onSelectWorkflow={onSelectWorkflow} onDeleteWorkflow={jest.fn()} />);
    fireEvent.click(screen.getAllByTitle("Edit workflow")[0]);
    expect(onSelectWorkflow).toHaveBeenCalledWith("1");
  });

  it("calls onDeleteWorkflow on delete", () => {
    const onDeleteWorkflow = jest.fn();
    render(<RightPanel workflows={workflows} onSelectTemplate={jest.fn()} onSelectWorkflow={jest.fn()} onDeleteWorkflow={onDeleteWorkflow} />);
    fireEvent.click(screen.getAllByTitle("Delete workflow")[0]);
    expect(onDeleteWorkflow).toHaveBeenCalledWith("1");
  });
});