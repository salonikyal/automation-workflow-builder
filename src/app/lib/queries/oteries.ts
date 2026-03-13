// Automation queries = Oteries :)

import { pool } from "@/app/lib/db";

export async function createWorkflow(name: string, description: string) {
    if (!name) throw new Error("Workflow name is required");

    try {
        const result = await pool.query(
            `INSERT INTO workflows (name, description)
            VALUES ($1, $2)
            RETURNING *`,
            [name, description]
        );

        if (!result.rows.length) {
            throw new Error("Workflow creation failed");
        }

        return result.rows[0];
    } catch (err) {
        console.error("Create workflow error:", err);
        throw err;
    }
}

export async function getAllWorkflows() {
  try {
    const result = await pool.query(`SELECT * FROM workflows ORDER BY created_at DESC`);
    return result.rows;
  } catch (err) {
    console.error("Get all workflows error:", err);
    throw err;
  }
}

export async function getWorkflow(workflowId: string) {
    if (!workflowId) throw new Error("Workflow ID required");

    try {
        const workflow = await pool.query(
            `SELECT * FROM workflows WHERE id=$1`,
            [workflowId]
        );

        if (!workflow.rows.length) {
            throw new Error("Workflow not found");
        }

        const nodes = await pool.query(
            `SELECT * FROM nodes WHERE workflow_id=$1`,
            [workflowId]
        );

        const edges = await pool.query(
            `SELECT * FROM edges WHERE workflow_id=$1`,
            [workflowId]
        );

        return {
            workflow: workflow.rows[0],
            nodes: nodes.rows,
            edges: edges.rows,
        };
    } catch (err) {
        console.error("Get workflow error:", err);
        throw err;
    }
}

export async function updateWorkflow(
  workflowId: string,
  nodes: any[],
  edges: any[],
  meta: { name?: string; description?: string } = {}
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (meta.name || meta.description) {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (meta.name) { fields.push(`name=$${idx++}`); values.push(meta.name); }
      if (meta.description) { fields.push(`description=$${idx++}`); values.push(meta.description); }

      if (fields.length > 0) {
        values.push(workflowId);
        await client.query(
          `UPDATE workflows SET ${fields.join(", ")}, updated_at=NOW() WHERE id=$${idx}`,
          values
        );
      }
    }


    await client.query(`DELETE FROM nodes WHERE workflow_id=$1`, [workflowId]);
    await client.query(`DELETE FROM edges WHERE workflow_id=$1`, [workflowId]);

    // insert new nodes
    for (const node of nodes) {
      await client.query(
        `INSERT INTO nodes (id, workflow_id, type, position_x, position_y, data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [node.id, workflowId, node.type, node.position.x, node.position.y, node.data]
      );
    }

    // insert new edges
    for (const edge of edges) {
      await client.query(
        `INSERT INTO edges (id, workflow_id, source, target, type, meta)
         VALUES ($1,$2,$3,$4,COALESCE($5,'default'), COALESCE($6,'{}'::jsonb))`,
        [edge.id, workflowId, edge.source, edge.target, edge.type, edge.meta]
      );
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Update workflow error:", err);
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteWorkflow(workflowId: string) {
    if (!workflowId) throw new Error("Workflow ID required");

    try {
        const result = await pool.query(
            `DELETE FROM workflows WHERE id=$1 RETURNING *`,
            [workflowId]
        );

        if (!result.rows.length) {
            throw new Error("Workflow not found");
        }

        return { success: true };
    } catch (err) {
        console.error("Delete workflow error:", err);
        throw err;
    }
}
