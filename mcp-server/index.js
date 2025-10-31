#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, "..", "logs");

/**
 * Load all memories from a specific repo's JSONL file
 */
async function loadMemories(repo) {
  const logFile = join(LOGS_DIR, `${repo}.jsonl`);
  
  if (!existsSync(logFile)) {
    return [];
  }

  const content = await readFile(logFile, "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error(`Failed to parse line: ${line}`);
        return null;
      }
    })
    .filter((entry) => entry !== null);
}

/**
 * Score memory relevance based on keyword matching
 * Simple implementation - can be upgraded to embeddings later
 */
function scoreMemory(memory, query) {
  const queryLower = query.toLowerCase();
  const searchableText = [
    memory.context,
    memory.lesson,
    memory.command,
    ...(memory.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Count keyword matches
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);
  let score = 0;

  queryWords.forEach((word) => {
    if (searchableText.includes(word)) {
      score += 1;
    }
  });

  // Boost recent memories
  const daysOld = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1 - daysOld / 30); // Linear decay over 30 days
  score += recencyBoost;

  // Boost high success rate
  if (memory.success_rate) {
    const [successes, attempts] = memory.success_rate.split("/").map(Number);
    if (attempts > 0) {
      score += (successes / attempts) * 0.5;
    }
  }

  return score;
}

/**
 * Retrieve top N relevant memories
 */
async function retrieveMemories({ query, repo = null, limit = 5, eventType = null }) {
  let allMemories = [];

  // Load from specific repo or all repos
  if (repo) {
    allMemories = await loadMemories(repo);
  } else {
    // Load from all repo logs
    const repos = ["gptcoach2", "ixcoach-api", "ixcoach-landing", "ixcoach-react-native", "shared-tools"];
    const memoriesPerRepo = await Promise.all(repos.map((r) => loadMemories(r)));
    allMemories = memoriesPerRepo.flat();
  }

  // Filter by event type if specified
  if (eventType) {
    allMemories = allMemories.filter((m) => m.event_type === eventType);
  }

  // Score and sort
  const scored = allMemories.map((memory) => ({
    memory,
    score: scoreMemory(memory, query),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Return top N
  return scored.slice(0, limit).map((item) => item.memory);
}

/**
 * Format memories for context-efficient display
 */
function formatMemories(memories) {
  if (memories.length === 0) {
    return "No relevant memories found.";
  }

  let output = `**Relevant Memories (${memories.length}):**\n\n`;

  memories.forEach((m, idx) => {
    const date = new Date(m.timestamp).toISOString().split("T")[0];
    const successRate = m.success_rate ? ` (${m.success_rate} success)` : "";
    const command = m.command ? `\n   Command: \`${m.command}\`` : "";
    
    output += `${idx + 1}. [${date}] ${m.context}\n`;
    output += `   Lesson: ${m.lesson}${successRate}${command}\n`;
    if (m.tags && m.tags.length > 0) {
      output += `   Tags: ${m.tags.join(", ")}\n`;
    }
    output += "\n";
  });

  return output;
}

// Create MCP server
const server = new Server(
  {
    name: "ix-agent-knowledge",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "retrieve_memories",
        description:
          "Search agent knowledge base for relevant memories (errors, solutions, patterns). Returns context-optimized summaries.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (e.g., 'npm install permission error')",
            },
            repo: {
              type: "string",
              description: "Optional: filter by specific repo name (gptcoach2, ixcoach-api, etc.)",
            },
            limit: {
              type: "number",
              description: "Max number of memories to return (default: 5)",
              default: 5,
            },
            event_type: {
              type: "string",
              enum: ["error", "success", "pattern"],
              description: "Optional: filter by event type",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "retrieve_memories") {
    const { query, repo, limit = 5, event_type } = request.params.arguments;

    const memories = await retrieveMemories({
      query,
      repo,
      limit,
      eventType: event_type,
    });

    return {
      content: [
        {
          type: "text",
          text: formatMemories(memories),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("IX Agent Knowledge MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
