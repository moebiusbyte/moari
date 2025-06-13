var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definida');
}
// Criar pool de conexões
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // necessário para Neon DB
    },
    max: 5, // máximo de conexões no pool
    idleTimeoutMillis: 30000 // tempo máximo que uma conexão pode ficar ociosa
});
// Evento para logs de erro
pool.on('error', function (err) {
    console.error('Erro inesperado no pool de conexões:', err);
});
export function setupDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var client, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 21, , 22]);
                    console.log("Iniciando setup do banco de dados...");
                    return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 19, 20]);
                    console.log("Conexão estabelecida com sucesso!");
                    // Criar schema
                    return [4 /*yield*/, client.query('CREATE SCHEMA IF NOT EXISTS moari')];
                case 3:
                    // Criar schema
                    _a.sent();
                    console.log("Schema verificado/criado com sucesso");
                    // Criar tabela users
                    return [4 /*yield*/, client.query("\n        CREATE TABLE IF NOT EXISTS moari.users (\n          id SERIAL PRIMARY KEY,\n          name VARCHAR(255) NOT NULL,\n          email VARCHAR(255) UNIQUE NOT NULL,\n          password VARCHAR(255) NOT NULL,\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n        )")];
                case 4:
                    // Criar tabela users
                    _a.sent();
                    console.log("Tabela users verificada/criada com sucesso");
                    // Criar tabela products
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS moari.products (\n        id SERIAL PRIMARY KEY,\n        code VARCHAR(50) UNIQUE NOT NULL,\n        name VARCHAR(255) NOT NULL,\n        category VARCHAR(100) NOT NULL,\n        format VARCHAR(100),\n        quality VARCHAR(50),\n        material_type VARCHAR(100),\n        usage_mode VARCHAR(255),\n        size VARCHAR(50),\n        origin VARCHAR(100),\n        warranty VARCHAR(255),\n        base_price DECIMAL(10,2) NOT NULL,\n        profit_margin DECIMAL(5,2),\n        description TEXT,\n        status VARCHAR(50) DEFAULT 'active',\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n      )")];
                case 5:
                    // Criar tabela products
                    _a.sent();
                    console.log("Tabela products verificada/criada com sucesso");
                    // Criar tabela product_materials
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS moari.product_materials (\n        id SERIAL PRIMARY KEY,\n        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,\n        material_name VARCHAR(100) NOT NULL,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n      )")];
                case 6:
                    // Criar tabela product_materials
                    _a.sent();
                    console.log("Tabela product_materials verificada/criada com sucesso");
                    // Criar tabela product_images
                    return [4 /*yield*/, client.query("\n      CREATE TABLE IF NOT EXISTS moari.product_images (\n        id SERIAL PRIMARY KEY,\n        product_id INTEGER REFERENCES moari.products(id) ON DELETE CASCADE,\n        image_url VARCHAR(500) NOT NULL,\n        order_index INTEGER NOT NULL,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n      )")];
                case 7:
                    // Criar tabela product_images
                    _a.sent();
                    console.log("Tabela product_images verificada/criada com sucesso");
                    // Criar índices
                    return [4 /*yield*/, client.query("CREATE INDEX IF NOT EXISTS idx_products_code ON moari.products(code)")];
                case 8:
                    // Criar índices
                    _a.sent();
                    return [4 /*yield*/, client.query("CREATE INDEX IF NOT EXISTS idx_products_category ON moari.products(category)")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, client.query("CREATE INDEX IF NOT EXISTS idx_products_status ON moari.products(status)")];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, client.query("CREATE INDEX IF NOT EXISTS idx_product_materials_product_id ON moari.product_materials(product_id)")];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, client.query("CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON moari.product_images(product_id)")];
                case 12:
                    _a.sent();
                    console.log("Índices verificados/criados com sucesso");
                    // Criar função para atualizar updated_at
                    return [4 /*yield*/, client.query("\n      CREATE OR REPLACE FUNCTION update_updated_at_column()\n      RETURNS TRIGGER AS $$\n      BEGIN\n          NEW.updated_at = CURRENT_TIMESTAMP;\n          RETURN NEW;\n      END;\n      $$ language 'plpgsql'")];
                case 13:
                    // Criar função para atualizar updated_at
                    _a.sent();
                    // Criar trigger para updated_at
                    return [4 /*yield*/, client.query("DROP TRIGGER IF EXISTS update_products_updated_at ON moari.products")];
                case 14:
                    // Criar trigger para updated_at
                    _a.sent();
                    return [4 /*yield*/, client.query("\n      CREATE TRIGGER update_products_updated_at\n          BEFORE UPDATE ON moari.products\n          FOR EACH ROW\n          EXECUTE FUNCTION update_updated_at_column()")];
                case 15:
                    _a.sent();
                    console.log("Função e trigger para updated_at criados com sucesso");
                    // Criar função para validação de preço
                    return [4 /*yield*/, client.query("\n      CREATE OR REPLACE FUNCTION validate_product_price()\n      RETURNS TRIGGER AS $$\n      BEGIN\n          IF NEW.base_price <= 0 THEN\n              RAISE EXCEPTION 'O pre\u00E7o base deve ser maior que zero';\n          END IF;\n          \n          IF NEW.profit_margin < 0 THEN\n              RAISE EXCEPTION 'A margem de lucro n\u00E3o pode ser negativa';\n          END IF;\n          \n          RETURN NEW;\n      END;\n      $$ language 'plpgsql'")];
                case 16:
                    // Criar função para validação de preço
                    _a.sent();
                    // Criar trigger para validação de preço
                    return [4 /*yield*/, client.query("DROP TRIGGER IF EXISTS validate_product_price_trigger ON moari.products")];
                case 17:
                    // Criar trigger para validação de preço
                    _a.sent();
                    return [4 /*yield*/, client.query("\n      CREATE TRIGGER validate_product_price_trigger\n          BEFORE INSERT OR UPDATE ON moari.products\n          FOR EACH ROW\n          EXECUTE FUNCTION validate_product_price()")];
                case 18:
                    _a.sent();
                    console.log("Função e trigger para validação de preços criados com sucesso");
                    return [3 /*break*/, 20];
                case 19:
                    client.release();
                    return [7 /*endfinally*/];
                case 20:
                    console.log("Setup do banco de dados concluído com sucesso!");
                    return [3 /*break*/, 22];
                case 21:
                    error_1 = _a.sent();
                    console.error("Erro durante o setup do banco de dados:", error_1);
                    throw error_1;
                case 22: return [2 /*return*/];
            }
        });
    });
}
// Função auxiliar para queries com retry
export function query(text, params) {
    return __awaiter(this, void 0, void 0, function () {
        var start, attempts, maxAttempts, client, res, duration, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    attempts = 0;
                    maxAttempts = 3;
                    _a.label = 1;
                case 1:
                    if (!(attempts < maxAttempts)) return [3 /*break*/, 9];
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, 7, 8]);
                    return [4 /*yield*/, client.query(text, params)];
                case 4:
                    res = _a.sent();
                    duration = Date.now() - start;
                    console.log('Query executada:', { text: text, duration: duration, rows: res.rowCount });
                    return [2 /*return*/, res.rows];
                case 5:
                    error_2 = _a.sent();
                    attempts++;
                    console.error("Tentativa ".concat(attempts, " falhou:"), error_2);
                    if (attempts === maxAttempts) {
                        console.error('Erro na execução da query após todas as tentativas:', error_2);
                        throw error_2;
                    }
                    // Espera um pouco antes de tentar novamente
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 * attempts); })];
                case 6:
                    // Espera um pouco antes de tentar novamente
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    client.release();
                    return [7 /*endfinally*/];
                case 8: return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
export { pool };
