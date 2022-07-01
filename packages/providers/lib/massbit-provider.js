"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MassbitProvider = exports.MassbitWebSocketProvider = void 0;
var properties_1 = require("@ethersproject/properties");
var websocket_provider_1 = require("./websocket-provider");
var formatter_1 = require("./formatter");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
var defaultProjectId = "e6944c6e-e83f-4b0f-9353-e18e6d630bed";
var MassbitWebSocketProvider = /** @class */ (function (_super) {
    __extends(MassbitWebSocketProvider, _super);
    function MassbitWebSocketProvider(network, apiKey) {
        var _this = this;
        var provider = new MassbitProvider(network, apiKey);
        var connection = provider.connection;
        if (connection.password) {
            logger.throwError("INFURA WebSocket project secrets unsupported", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }
        var url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        _this = _super.call(this, url, network) || this;
        (0, properties_1.defineReadOnly)(_this, "apiKey", provider.projectId);
        (0, properties_1.defineReadOnly)(_this, "projectId", provider.projectId);
        (0, properties_1.defineReadOnly)(_this, "projectSecret", provider.projectSecret);
        return _this;
    }
    MassbitWebSocketProvider.prototype.isCommunityResource = function () {
        return (this.projectId === defaultProjectId);
    };
    return MassbitWebSocketProvider;
}(websocket_provider_1.WebSocketProvider));
exports.MassbitWebSocketProvider = MassbitWebSocketProvider;
var MassbitProvider = /** @class */ (function (_super) {
    __extends(MassbitProvider, _super);
    function MassbitProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MassbitProvider.getWebSocketProvider = function (network, apiKey) {
        return new MassbitWebSocketProvider(network, apiKey);
    };
    MassbitProvider.getApiKey = function (apiKey) {
        var apiKeyObj = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        if (typeof (apiKey) === "string") {
            apiKeyObj.projectId = apiKey;
        }
        else if (apiKey.projectSecret != null) {
            logger.assertArgument((typeof (apiKey.projectId) === "string"), "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger.assertArgument((typeof (apiKey.projectSecret) === "string"), "invalid projectSecret", "projectSecret", "[REDACTED]");
            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;
        }
        else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }
        apiKeyObj.apiKey = apiKeyObj.projectId;
        return apiKeyObj;
    };
    MassbitProvider.getUrl = function (network, apiKey) {
        var host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            case "matic":
                host = "polygon-mainnet.infura.io";
                break;
            case "maticmum":
                host = "polygon-mumbai.infura.io";
                break;
            case "optimism":
                host = "optimism-mainnet.infura.io";
                break;
            case "optimism-kovan":
                host = "optimism-kovan.infura.io";
                break;
            case "arbitrum":
                host = "arbitrum-mainnet.infura.io";
                break;
            case "arbitrum-rinkeby":
                host = "arbitrum-rinkeby.infura.io";
                break;
            default:
                logger.throwError("unsupported network", logger_1.Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        var connection = {
            allowGzip: true,
            url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId),
            throttleCallback: function (attempt, url) {
                if (apiKey.projectId === defaultProjectId) {
                    (0, formatter_1.showThrottleMessage)();
                }
                return Promise.resolve(true);
            }
        };
        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret;
        }
        return connection;
    };
    MassbitProvider.prototype.isCommunityResource = function () {
        return (this.projectId === defaultProjectId);
    };
    return MassbitProvider;
}(url_json_rpc_provider_1.UrlJsonRpcProvider));
exports.MassbitProvider = MassbitProvider;
//# sourceMappingURL=massbit-provider.js.map