import { createWorkflow, getWorkflow, updateWorkflow, deleteWorkflow } from "@/app/lib/queries/oteries";
import { pool } from "@/app/lib/db";

const mockedQuery = pool.query as jest.Mock;
const mockedConnect = pool.connect as jest.Mock;
const mockClient = mockedConnect();

jest.mock("@/app/lib/db", () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  return {
    pool: {
      query: jest.fn(),
      connect: jest.fn(() => mockClient),
    },
  };
});

describe("Workflow Service - Server", () => {
  it("should create a workflow", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: "1", name: "Test Workflow", description: "desc" }]
    })
    const result = await createWorkflow("Test Workflow", "desc")
    expect(mockedQuery).toHaveBeenCalled()
    expect(result.id).toBe("1")
  })

  it("should fetch workflow by ID", async () => {
    const client = await pool.connect();
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: "1", name: "Test" }] });
    //Nodes
    mockedQuery.mockResolvedValueOnce({ rows: [] }); 
    //Edges
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    const result = await getWorkflow("1");
    expect(mockedQuery).toHaveBeenCalled();
    expect(result.workflow.id).toBe("1");
  });

  it("should update workflow nodes", async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({}),
      release: jest.fn(),
    };
    mockedConnect.mockResolvedValue(mockClient);
    const result = await updateWorkflow("1", [], [], { name: "Updated" });
    expect(mockClient.query).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  it("should delete workflow", async () => {
    const client = await pool.connect();
    expect(mockedQuery).toHaveBeenCalled();
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: "1" }] });
    await expect(deleteWorkflow("1")).resolves.toEqual({ success: true });
  });
});