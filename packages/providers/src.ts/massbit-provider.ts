"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly } from "@ethersproject/properties";
import { ConnectionInfo } from "@ethersproject/web";

import { WebSocketProvider } from "./websocket-provider";
import { CommunityResourcable, showThrottleMessage } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

// https://e6944c6e-e83f-4b0f-9353-e18e6d630bed.eth-mainnet.massbitroute.net/rph2lZHHRHEYQfhrbQIMbg
// wss://e6944c6e-e83f-4b0f-9353-e18e6d630bed-ws.eth-mainnet.massbitroute.net/rph2lZHHRHEYQfhrbQIMbg

const defaultProjectId = "e6944c6e-e83f-4b0f-9353-e18e6d630bed"
const defaultApiKey = "rph2lZHHRHEYQfhrbQIMbg"

export class MassbitWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly apiKey: string;
    readonly projectId: string;
    readonly projectSecret: string;

    constructor(network?: Networkish, apiKey?: any) {
        const provider = new MassbitProvider(network, apiKey);
        const connection = provider.connection;
        if (connection.password) {
            logger.throwError("Massbit WebSocket project secrets unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "MassbitProvider.getWebSocketProvider()"
            });
        }

        const url = connection.url
          .replace(/^http/i, "wss")
          .replace(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gm,
            "$1-ws"
          );
        super(url, network);

        defineReadOnly(this, "apiKey", provider.projectId);
        defineReadOnly(this, "projectId", provider.projectId);
        defineReadOnly(this, "projectSecret", provider.projectSecret);
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }
}

export class MassbitProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;

    static getWebSocketProvider(network?: Networkish, apiKey?: any): MassbitWebSocketProvider {
        return new MassbitWebSocketProvider(network, apiKey);
    }

    static getApiKey(apiKey: any): any {
        const apiKeyObj: { apiKey: string, projectId: string, projectSecret: string } = {
            apiKey: defaultApiKey,
            projectId: defaultProjectId,
            projectSecret: null
        };

        if (apiKey == null) { return apiKeyObj; }

        if (typeof(apiKey) === "string") {
            apiKeyObj.projectId = apiKey;

        } else if (apiKey.projectSecret != null) {
            logger.assertArgument((typeof(apiKey.projectId) === "string"),
                "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger.assertArgument((typeof(apiKey.projectSecret) === "string"),
                "invalid projectSecret", "projectSecret", "[REDACTED]");

            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;

        } else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }

        apiKeyObj.apiKey = apiKeyObj.projectId;

        return apiKeyObj;
    }

    static getUrl(network: Network, apiKey: any): ConnectionInfo {
        let host: string = null;
        switch(network ? network.name: "unknown") {
            case "homestead":
                host = "eth-mainnet.massbitroute.net";
                break;
            case "rinkeby":
                host = "eth-rinkeby.massbitroute.net";
                break;
            case "polygon":
                host = "polygon-mainnet.massbitroute.net";
                break;
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        const connection: ConnectionInfo = {
            allowGzip: true,
            url: (`https://${apiKey.projectId}.${host}/${apiKey.projectSecret}`),
            throttleCallback: (attempt: number, url: string) => {
                if (apiKey.projectId === defaultProjectId) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };

        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret
        }

        return connection;
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }
}
