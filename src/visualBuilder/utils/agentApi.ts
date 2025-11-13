export interface AgentApiRequest {
    type: string;
    value: string;
    prompt: string;
}

export interface AgentApiResponse {
    success?: boolean;
    data?: any;
    error?: string;
}

/**
 * Hardcoded cookies for the agent API
 * Update this value as needed
 */
const HARDCODED_COOKIES =
    "_cs_c=0; _hp2_props.2569651028=%7B%22region%22%3A%22NA%22%2C%22email%22%3A%22mohammed.ahmed%40contentstack.com%22%2C%22plan_id%22%3A%22copy_of_copy_of_org_admin_dev_Dev11_testing%22%2C%22organization_uid%22%3A%22blt307083dad4104f10%22%2C%22organization_name%22%3A%22Orch%20agent%20demo%22%2C%22organization_tag%22%3A%22employee%22%2C%22org_expiry%22%3A%2204-30-2030%22%2C%22has_trial_stack%22%3Afalse%2C%22isOwner%22%3A%22%22%2C%22is_org_expired%22%3Afalse%2C%22origin%22%3A%22%22%2C%22hasLivePreviewFeature%22%3Atrue%2C%22isLivePreviewEnabled%22%3Atrue%2C%22hasAssetExtensionFeature%22%3Afalse%2C%22hasRTEComment%22%3Afalse%2C%22hasBranchPlan%22%3Atrue%2C%22hasBranchFeature%22%3Atrue%2C%22hasReleasesFeature%22%3Atrue%2C%22hasNewRefAndPartialSearch%22%3Atrue%2C%22hasVariants%22%3Atrue%2C%22hasreleasesV2%22%3Atrue%2C%22hasNestedGlobalFields%22%3Atrue%2C%22hasfieldLevelLocalizationBlockAndGroupMultiple%22%3Atrue%2C%22hasAppSwitcherAccess%22%3Atrue%2C%22hasAskAi%22%3Afalse%2C%22stack_id%22%3A%22blt439559ed2855f747%22%2C%22isDeveloper%22%3Atrue%2C%22isContentManager%22%3Afalse%2C%22isAdmin%22%3Afalse%2C%22currentUserIsOwner%22%3Atrue%7D; _hp2_id.2569651028=%7B%22userId%22%3A%227238051295322878%22%2C%22pageviewId%22%3A%221775727052548159%22%2C%22sessionId%22%3A%224254860309439566%22%2C%22identity%22%3A%22blte26110c4ea641ed9%22%2C%22trackerVersion%22%3A%224.0%22%2C%22identityField%22%3Anull%2C%22isIdentified%22%3A1%2C%22oldIdentity%22%3Anull%7D; _cs_id=0c2d1849-ff44-a55d-e399-8e09bf308746.1755078864.1.1755079567.1755078864.1753192359.1789242864919.1.x; i18next=en; languages=%5B%7B%22code%22%3A%22es%22%2C%22name%22%3A%22Spanish%22%2C%22fallback_locale%22%3A%22en%22%7D%2C%7B%22code%22%3A%22de%22%2C%22name%22%3A%22German%22%2C%22fallback_locale%22%3A%22en%22%7D%2C%7B%22code%22%3A%22fr%22%2C%22name%22%3A%22French%22%2C%22fallback_locale%22%3A%22en%22%7D%2C%7B%22code%22%3A%22en%22%2C%22name%22%3A%22English%22%2C%22fallback_locale%22%3Anull%7D%5D; cookie_consent=optIn; __next_hmr_refresh_hash__=e1676f71582db2a1cc6d8f84208cea5ce09a5d32f20c3f92; ph_phc_SBLpZVAB6jmHOct9CABq3PF0Yn5FU3G2FgT4xUr2XrT_posthog=%7B%22distinct_id%22%3A%22019a7644-3171-7592-8872-c8a1288c926f%22%2C%22%24sesid%22%3A%5B1762952799731%2C%22019a782c-e5fb-7048-b112-3bd763971b3f%22%2C1762952799731%5D%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22http%3A%2F%2Flocalhost%3A3000%2Fagents%22%7D%7D; client_reqId=589af95f-b901-4e48-a06a-0b29b0850631; authtoken=WfLaGaNi0RbsIlIFIIxO7YS/SKYCRN5xnFXPXwd2SDU=; __cs_user=bltb47682336d5cf29d; _dd_s='";

/**
 * Agent API base URL - can be configured via environment or config
 */
const getAgentBaseUrl = (): string => {
    // Default to localhost, but can be overridden via environment variable or config
    if (typeof window !== "undefined") {
        const envUrl = (window as any).__AGENT_API_BASE_URL__;
        if (envUrl) return envUrl;
    }
    return "http://localhost:3002";
};

/**
 * Agent ID - can be configured via environment or config
 */
const getAgentId = (): string => {
    // Default agent ID, but can be overridden via environment variable or config
    if (typeof window !== "undefined") {
        const envAgentId = (window as any).__AGENT_ID__;
        if (envAgentId) return envAgentId;
    }
    return "4db687181f48438ca6e6bf8062bf1eb7";
};

/**
 * Sends a request to the agent API with type, value, and prompt
 * @param request - The agent API request containing type, value, and prompt
 * @returns Promise resolving to the agent API response
 */
export const callAgentApi = async (
    request: AgentApiRequest
): Promise<AgentApiResponse> => {
    const { type, value, prompt } = request;

    const baseUrl = getAgentBaseUrl();
    const agentId = getAgentId();
    const url = `${baseUrl}/run/agents/${agentId}`;

    // Prepare headers with hardcoded cookies
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Cookie: HARDCODED_COOKIES,
    };

    // Prepare the request body with messages array format
    const requestBody = {
        messages: [
            {
                role: "user",
                content: JSON.stringify({
                    type,
                    value,
                    prompt,
                }),
            },
        ],
        stream: false,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Agent API call failed: ${response.status} ${response.statusText}. ${errorText}`
            );
        }

        const data = await response.json();

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        console.error("Error calling agent API:", error);
        return {
            success: false,
            error: error.message || "Unknown error occurred",
        };
    }
};
