import { FieldDataType } from "./types/index.types";
import { callAgentApi, AgentApiRequest } from "./agentApi";

export interface AIProcessRequest {
    fieldType: FieldDataType;
    currentValue: string;
    prompt: string;
}

export interface AIProcessResponse {
    type: "enhance" | "score";
    value: string;
    msg: string;
    enhancedValue?: string; // For backward compatibility
}

/**
 * Processes AI request by calling the agent API
 * @param request - The AI process request
 * @returns Promise resolving to the AI process response
 */
export async function processAIRequest(
    request: AIProcessRequest
): Promise<AIProcessResponse> {
    const { fieldType, currentValue, prompt } = request;

    // Determine type based on field type
    let type: string;
    switch (fieldType) {
        case FieldDataType.SINGLELINE:
        case FieldDataType.MULTILINE:
            type = "text";
            break;
        case FieldDataType.FILE:
            type = "image";
            break;
        default:
            throw new Error(
                `Unsupported field type for AI processing: ${fieldType}`
            );
    }

    // Prepare agent API request
    const agentRequest: AgentApiRequest = {
        type,
        value: currentValue,
        prompt,
    };

    const agentResponse = await callAgentApi(agentRequest);

    if (!agentResponse.success || !agentResponse.data) {
        throw new Error(agentResponse.error || "Agent API call failed");
    }

    // Parse the response - the API returns JSON with type, value, and msg
    let responseData: { type: string; value: string; msg: string };

    // Handle different response formats
    if (typeof agentResponse.data === "string") {
        try {
            responseData = JSON.parse(agentResponse.data);
        } catch {
            throw new Error("Failed to parse agent response as JSON string");
        }
    } else if (
        agentResponse.data &&
        typeof agentResponse.data === "object" &&
        agentResponse.data.type &&
        agentResponse.data.value !== undefined
    ) {
        // Direct object format
        responseData = agentResponse.data as {
            type: string;
            value: string;
            msg: string;
        };
    } else if (
        agentResponse.data &&
        typeof agentResponse.data === "object" &&
        (agentResponse.data as any).message
    ) {
        // Try to extract from nested structure with message property
        const dataObj = agentResponse.data as any;
        const messageContent = dataObj.message?.content || dataObj.content;
        if (messageContent) {
            try {
                responseData =
                    typeof messageContent === "string"
                        ? JSON.parse(messageContent)
                        : messageContent;
            } catch {
                throw new Error(
                    "Failed to parse message content from agent response"
                );
            }
        } else {
            throw new Error("Invalid response format from agent API");
        }
    } else {
        throw new Error("Invalid response format from agent API");
    }

    // Validate response structure
    if (
        !responseData.type ||
        responseData.value === undefined ||
        !responseData.msg
    ) {
        throw new Error("Invalid response structure from agent API");
    }

    return {
        type: responseData.type as "enhance" | "score",
        value: responseData.value,
        msg: responseData.msg,
        enhancedValue: responseData.value, // For backward compatibility
    };
}
