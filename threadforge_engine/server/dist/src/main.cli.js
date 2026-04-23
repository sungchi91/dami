"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const path = __importStar(require("path"));
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const bootstrap_command_1 = require("./cli/bootstrap.command");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: false,
    });
    const command = app.get(bootstrap_command_1.BootstrapCommand);
    try {
        await command.run();
    }
    catch (err) {
        console.error('\n[ThreadForge Error]', err.message);
        if (err.status === 429) {
            console.error('  → Rate limited. Wait a moment and try again.');
        }
        else if (err.status === 401) {
            console.error('  → Invalid API key. Please check your Gemini API key.');
        }
        process.exit(1);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=main.cli.js.map