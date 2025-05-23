import Vapi from "@vapi-ai/web";

const vapiClient = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);

export const vapi = vapiClient;
