import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { advancedTemplateToolDefinitions } from '../types/toolDefinitionsAdvancedTemplates.js';
import { AdvancedTemplateHandlers } from '../handlers/advancedTemplateHandlers.js';
import { formatErrorResponse } from '../utils/stringUtils.js';

const TOOL_MAP = {
    list_template_blueprints: AdvancedTemplateHandlers.listTemplateBlueprints,
    inspect_template_blueprint: AdvancedTemplateHandlers.inspectTemplate,
    create_page_with_template: AdvancedTemplateHandlers.createPageWithTemplate,
    get_page_information: AdvancedTemplateHandlers.getPageInformation,
    populate_template_slots: AdvancedTemplateHandlers.fillTemplateFromSlots,
};

class AdvancedTemplateServer {
    constructor() {
        this.server = new Server(
            {
                name: 'indesign-template-orchestrator',
                version: '0.1.0'
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: advancedTemplateToolDefinitions.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema
            }))
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const handler = TOOL_MAP[name];
            if (!handler) {
                return formatErrorResponse(`Tool not found: ${name}`, 'Advanced Template Tool Call');
            }
            try {
                const result = await handler(args || {});
                return result;
            } catch (error) {
                return formatErrorResponse(error.message, `Advanced Template Tool '${name}'`);
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}

async function main() {
    const server = new AdvancedTemplateServer();
    await server.run();
}

main().catch((error) => {
    console.error('Failed to start advanced template server:', error);
    process.exit(1);
});
