#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, writeFile, appendFile } from "fs/promises";
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

/**
 * Update an existing memory by replacing matching entries
 */
async function updateMemory({ repo, searchTags = [], searchText = null, updates }) {
  const logFile = join(LOGS_DIR, `${repo}.jsonl`);
  
  if (!existsSync(logFile)) {
    return { success: false, error: "Log file not found" };
  }

  const content = await readFile(logFile, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  
  let updatedCount = 0;
  const updatedLines = lines.map((line) => {
    try {
      const memory = JSON.parse(line);
      
      // Check if this memory matches search criteria
      let matches = false;
      
      if (searchTags.length > 0) {
        matches = searchTags.some(tag => (memory.tags || []).includes(tag));
      }
      
      if (searchText) {
        const searchableText = [
          memory.context,
          memory.lesson,
          memory.command,
        ].filter(Boolean).join(" ").toLowerCase();
        matches = matches || searchableText.includes(searchText.toLowerCase());
      }
      
      if (matches) {
        updatedCount++;
        return JSON.stringify({ ...memory, ...updates, updated_at: new Date().toISOString() });
      }
      
      return line;
    } catch (e) {
      return line;
    }
  });

  await writeFile(logFile, updatedLines.join("\n") + "\n", "utf-8");
  
  return { success: true, updatedCount };
}

/**
 * Remove memories matching criteria
 */
async function removeMemory({ repo, searchTags = [], searchText = null }) {
  const logFile = join(LOGS_DIR, `${repo}.jsonl`);
  
  if (!existsSync(logFile)) {
    return { success: false, error: "Log file not found" };
  }

  const content = await readFile(logFile, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());
  
  let removedCount = 0;
  const filteredLines = lines.filter((line) => {
    try {
      const memory = JSON.parse(line);
      
      let matches = false;
      
      if (searchTags.length > 0) {
        matches = searchTags.some(tag => (memory.tags || []).includes(tag));
      }
      
      if (searchText) {
        const searchableText = [
          memory.context,
          memory.lesson,
          memory.command,
        ].filter(Boolean).join(" ").toLowerCase();
        matches = matches || searchableText.includes(searchText.toLowerCase());
      }
      
      if (matches) {
        removedCount++;
        return false; // Exclude this line
      }
      
      return true; // Keep this line
    } catch (e) {
      return true; // Keep malformed lines
    }
  });

  await writeFile(logFile, filteredLines.join("\n") + "\n", "utf-8");
  
  return { success: true, removedCount };
}

/**
 * Add a new memory entry
 */
async function addMemory({ repo, context, lesson, tags = [], metadata = {}, eventType = "pattern", confidence = 10 }) {
  const logFile = join(LOGS_DIR, `${repo}.jsonl`);
  
  const memory = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    repo,
    context,
    lesson,
    confidence,
    tags,
    metadata
  };
  
  await appendFile(logFile, JSON.stringify(memory) + "\n", "utf-8");
  
  return { success: true, memory };
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
      {
        name: "add_memory",
        description:
          "Add a new memory entry to the agent knowledge base. Use this to document patterns, solutions, or important context.",
        inputSchema: {
          type: "object",
          properties: {
            repo: {
              type: "string",
              description: "Repository name (gptcoach2, ixcoach-api, etc.)",
            },
            context: {
              type: "string",
              description: "When to use this memory (context/trigger)",
            },
            lesson: {
              type: "string",
              description: "What to do (the actual lesson/solution)",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags for categorization",
              default: [],
            },
            event_type: {
              type: "string",
              enum: ["error", "success", "pattern", "intent"],
              description: "Type of memory entry",
              default: "pattern",
            },
            confidence: {
              type: "number",
              description: "Confidence level (1-10)",
              default: 10,
            },
            metadata: {
              type: "object",
              description: "Additional structured data",
              default: {},
            },
          },
          required: ["repo", "context", "lesson"],
        },
      },
      {
        name: "update_memory",
        description:
          "Update existing memory entries matching search criteria. Use to correct or deprecate outdated information.",
        inputSchema: {
          type: "object",
          properties: {
            repo: {
              type: "string",
              description: "Repository name",
            },
            search_tags: {
              type: "array",
              items: { type: "string" },
              description: "Find memories with these tags",
              default: [],
            },
            search_text: {
              type: "string",
              description: "Find memories containing this text in context/lesson",
            },
            updates: {
              type: "object",
              description: "Fields to update (e.g., {deprecated: true, lesson: 'New lesson'})",
            },
          },
          required: ["repo", "updates"],
        },
      },
      {
        name: "remove_memory",
        description:
          "Remove memory entries matching search criteria. Use to delete obsolete or incorrect information.",
        inputSchema: {
          type: "object",
          properties: {
            repo: {
              type: "string",
              description: "Repository name",
            },
            search_tags: {
              type: "array",
              items: { type: "string" },
              description: "Remove memories with these tags",
              default: [],
            },
            search_text: {
              type: "string",
              description: "Remove memories containing this text",
            },
          },
          required: ["repo"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "retrieve_memories") {
    const { query, repo, limit = 5, event_type } = args;

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

  if (name === "add_memory") {
    const { repo, context, lesson, tags, event_type, confidence, metadata } = args;
    
    const result = await addMemory({
      repo,
      context,
      lesson,
      tags,
      eventType: event_type,
      confidence,
      metadata,
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ Memory added to ${repo}\n\nContext: ${context}\nLesson: ${lesson}`,
        },
      ],
    };
  }

  if (name === "update_memory") {
    const { repo, search_tags, search_text, updates } = args;
    
    const result = await updateMemory({
      repo,
      searchTags: search_tags,
      searchText: search_text,
      updates,
    });

    return {
      content: [
        {
          type: "text",
          text: result.success
            ? `✅ Updated ${result.updatedCount} memor${result.updatedCount === 1 ? 'y' : 'ies'} in ${repo}`
            : `❌ Failed: ${result.error}`,
        },
      ],
    };
  }

  if (name === "remove_memory") {
    const { repo, search_tags, search_text } = args;
    
    const result = await removeMemory({
      repo,
      searchTags: search_tags,
      searchText: search_text,
    });

    return {
      content: [
        {
          type: "text",
          text: result.success
            ? `✅ Removed ${result.removedCount} memor${result.removedCount === 1 ? 'y' : 'ies'} from ${repo}`
            : `❌ Failed: ${result.error}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
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
