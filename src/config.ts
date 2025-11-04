/**
 * Configuration management for inFakt MCP Server
 *
 * Handles environment variable loading and validation,
 * providing type-safe configuration access.
 */

import type { ServerConfig, EnvironmentVariables } from "./types.js";

/**
 * Default API endpoints
 */
export const API_ENDPOINTS = {
  PRODUCTION: "https://api.infakt.pl/api/v3",
  SANDBOX: "https://api.sandbox-infakt.pl/api/v3",
} as const;

/**
 * Configuration errors
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Validates that a required environment variable is set
 */
function requireEnvVar(name: keyof EnvironmentVariables): string {
  const value = process.env[name];
  if (!value) {
    throw new ConfigurationError(
      `Missing required environment variable: ${name}`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * Currently unused but kept for potential future use
 */
/* function getEnvVar(
  name: keyof EnvironmentVariables,
  defaultValue: string
): string {
  return process.env[name] ?? defaultValue;
} */

/**
 * Parses a boolean environment variable
 */
function parseBooleanEnvVar(
  name: keyof EnvironmentVariables,
  defaultValue: boolean = false
): boolean {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true" || value === "1";
}

/**
 * Validates API key format
 */
function validateApiKey(apiKey: string): void {
  if (apiKey.length < 10) {
    throw new ConfigurationError(
      "Invalid API key format: key appears to be too short"
    );
  }
}

/**
 * Validates URL format
 */
function validateUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new ConfigurationError(`Invalid URL format: ${url}`);
  }
}

/**
 * Loads and validates server configuration from environment variables
 *
 * @throws {ConfigurationError} If required variables are missing or invalid
 * @returns Validated server configuration
 */
export function loadConfig(): ServerConfig {
  // Load and validate API key
  const apiKey = requireEnvVar("INFAKT_API_KEY");
  validateApiKey(apiKey);

  // Determine if using sandbox
  const useSandbox = parseBooleanEnvVar("INFAKT_USE_SANDBOX", false);

  // Determine base URL
  const customBaseUrl = process.env.INFAKT_BASE_URL;
  const baseUrl = useSandbox
    ? API_ENDPOINTS.SANDBOX
    : (customBaseUrl ?? API_ENDPOINTS.PRODUCTION);

  validateUrl(baseUrl);

  return {
    apiKey,
    baseUrl,
    useSandbox,
  };
}

/**
 * Configuration singleton
 * Loaded once at module initialization
 */
let configInstance: ServerConfig | null = null;

/**
 * Gets the current configuration, loading it if necessary
 *
 * @returns Server configuration
 */
export function getConfig(): ServerConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Resets the configuration (primarily for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

/**
 * Gets a display-safe version of the configuration (API key masked)
 */
export function getDisplayConfig(): {
  baseUrl: string;
  useSandbox: boolean;
  apiKeyMasked: string;
} {
  const config = getConfig();
  return {
    baseUrl: config.baseUrl,
    useSandbox: config.useSandbox,
    apiKeyMasked: `${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`,
  };
}
