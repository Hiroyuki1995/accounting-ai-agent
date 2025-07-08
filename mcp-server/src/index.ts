import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import FormData from 'form-data';
import fs from "fs";
import { z } from "zod";

const API_BASE = "http://localhost:3000/api";
const USER_AGENT = "accounting-ai-agent/1.0";

// Create server instance
const server = new McpServer({
  name: "accounting-ai-agent",
  version: "1.0.0",
  capabilities: {
    // resources: {},
    tools: {},
  },
});

// Helper function for making NWS API requests
async function makeNWSRequest<T>(url: string, method: string = "GET", body: any = null): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
    "x-api-key": process.env.API_KEY || "",
  };

  try {
    const response = await fetch(url, { headers, method, body });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

interface BanksResponse {
  banks: Bank[];
}

interface Bank {
  code: string;
  name: string;
  halfWidthKana: string;
  fullWidthKana: string;
  hiragana: string;
  businessTypeCode: string;
  businessType: string;
}

interface Branch {
  code: string;
  name: string;
  halfWidthKana: string;
  fullWidthKana: string;
  hiragana: string;
}

interface BranchesResponse {
  bank: Bank;
  branches: Branch[];
}

type fileStatus = "処理中" | "要確認" | "確定済み";

interface UploadResponse {
  message: string;
  files: {
    name: string;
    id: number;
  }[];
}

interface FileDetailsResponse {
  id: number;
  file_name: string;
  uploaded_at: string;
  status: fileStatus;
  object_key: string;
  issuer_name: string;
  invoice_date: string;
  registration_number: string;
  tax_8_base: string | null;
  tax_8_amount: string | null;
  tax_8_total: string | null;
  tax_10_base: string;
  tax_10_amount: string;
  tax_10_total: string;
  total_amount: string;
}

server.tool(
  "get-all-banks",
  "Get all banks",
  {}, // 引数なし
  async ({}) => {
    const getBanksUrl = `${API_BASE}/banks`;
    const banksData = await makeNWSRequest<BanksResponse>(getBanksUrl);

    if (!banksData || banksData.banks.length === 0 ) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve banks data",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(banksData.banks, null, 2),
          // resource: {
          //   uri: "",
          //   text: JSON.stringify(banksData.banks, null, 2),
          //   mimeType: "application/json",
          // },
        },
      ],
    };
  },
);

server.tool(
  "get-all-branches",
  "get all branches in a designated bank",
  {
    bankCode: z.string().describe("Bank code"),
  },
  async ({ bankCode }) => {
    // Get branches data
    const branchesUrl = `${API_BASE}/banks/${bankCode}/branches`;
    const branchesData = await makeNWSRequest<BranchesResponse>(branchesUrl);

    if (!branchesData || branchesData.branches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve branches data for bank: ${bankCode}.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(branchesData.branches, null, 2),
          // resource: {
          //   uri: "",
          //   text: JSON.stringify(branchesData.branches, null, 2),
          //   mimeType: "application/json",
          // },
        },
      ],
    };
  },
);

server.tool(
  "upload-files",
  "upload files to the server",
  {
    filePaths: z.array(z.string()).describe("The file paths to upload"),
  },
  async ({ filePaths }) => {
    // Upload file to the server
    const formData = new FormData();
    filePaths.forEach((filePath) => {
      // const fileBuffer = fs.readFileSync(filePath);
      // formData.append("file", new Blob([fileBuffer]), filePath);
      formData.append('file', fs.createReadStream(filePath), {
        filename: filePath,
        contentType: 'application/pdf' // 明示的に application/pdf を指定
      });
    });
    const headers = {
      ...formData.getHeaders(),
      'x-api-key': process.env.API_KEY
    };

    try {
      // const response = await axios.post(`${API_BASE}/upload`, formData,{headers});
      const response = await axios.post(`${API_BASE}/files`, formData,{headers});
      
      // const response = await makeNWSRequest<UploadResponse>(`${API_BASE}/upload`, "POST", formData);
      if (!response) {
        throw new Error(`Failed to upload file`);
      }
      // const fileIds = response.files.map((file) => file.id);
      return {
        content: [
          {
            type: "text",
            // text: "File uploaded successfully"
            text: JSON.stringify(response.data, null, 2),
            // text: "File uploaded successfully. file ids: " + fileIds.join(", "),
          },
        ],
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        content: [
          {
            type: "text",
            text: "Failed to upload file",
          },
        ],
      };
    }
  },
);

server.tool(
  "get-file-details",
  "get the details of a file",
  {
    fileId: z.string().describe("The ID of the file"),
  },
  async ({ fileId }) => {
    // Get file details
    const fileDetailsUrl = `${API_BASE}/files/${fileId}`;
    const fileDetailsData = await makeNWSRequest<FileDetailsResponse>(fileDetailsUrl);

    if (!fileDetailsData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve file details",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(fileDetailsData, null, 2),
          // resource: {
          //   uri: "",
          //   text: JSON.stringify(fileDetailsData, null, 2),
          //   mimeType: "application/json",
          // },
        },
      ],
    };
  },
);
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});