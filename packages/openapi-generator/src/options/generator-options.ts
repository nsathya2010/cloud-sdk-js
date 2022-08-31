import { promises } from 'fs';
import { resolve } from 'path';
import yargs from 'yargs';
import { ErrorWithCause, createLogger } from '@sap-cloud-sdk/util';
import { generatorOptions } from './options';

const { readFile, lstat } = promises;
const logger = createLogger('openapi-generator');

/**
 * Options that can be used to configure the generation when using the generator programmatically.
 * The options match the CLI options.
 */
export interface GeneratorOptions {
  /**
   * Specify the path to the directory or file containing the OpenAPI service definition(s) to generate clients for.
   * Accepts Swagger and OpenAPI definitions as YAML and JSON files.
   * Throws an error if the path does not exist.
   */
  input: string;
  /**
   * Specify the path to the directory to generate the client(s) in.
   * Each client is generated into a subdirectory within the given output directory.
   * Creates the directory if it does not exist.
   * Customize subdirectory naming through `optionsPerService`.
   */
  outputDir: string;
  /**
   * Transpile the generated TypeScript code.
   * When enabled, a default `tsconfig.json` will be generated and used.
   * It emits `.js`, `.js.map`, `.d.ts` and `.d.ts.map` files.
   * To configure transpilation set `tsconfig`.
   */
  transpile?: boolean;
  /**
   * Include files matching the given glob into the root of each generated client directory.
   */
  include?: string;
  /**
   * Allow overwriting files that already exist.
   * This is useful when running the generation regularly.
   */
  overwrite?: boolean;
  /**
   * Remove all files in the output directory before generation.
   * Be cautious when using this option, as it really removes EVERYTHING in the output directory.
   */
  clearOutputDir?: boolean;
  /**
   * By default, the generation fails when there are duplicate or invalid names for operations and/or path parameters after transforming them to camel case.
   * Set this to true to enable unique and valid name generation.
   * The names will then be generated by appending numbers and prepending prefixes.
   */
  skipValidation?: boolean;
  /**
   * Replace the default `tsconfig.json` by passing a path to a custom configuration.
   * By default, a `tsconfig.json` is only generated when transpilation is enabled (`transpile`).
   * If a directory is passed, a `tsconfig.json` file is read from this directory.
   */
  tsConfig?: string;
  /**
   * When enabled, a `package.json` containing dependencies and scripts for transpilation and documentation generation, is generated.
   */
  packageJson?: boolean;
  /**
   * License name to be used on the generated `package.json`. Only considered if 'packageJson' is enabled.
   */
  licenseInPackageJson?: string;
  /**
   * Turn on verbose logging.
   */
  verbose?: boolean;
  /**
   * Set the path to a file containing the options per service.
   * The configuration allows to set a `directoryName` and `packageName` for every service, identified by the path to the original file.
   * It also makes sure that names do not change between generator runs.
   * If a directory is passed, a `options-per-service.json` file is read/created in this directory.
   */
  optionsPerService?: string;
  // TODO remove packageVersion in version 3.0
  /**
   * Internal option used to adjust the version in the generated package.json. Will not be used in the future.
   */
  packageVersion?: string;
  /**
   * Generate default `README.md` files in the client directories.
   */
  readme?: boolean;
  /**
   * Hidden option only for internal usage - generate metadata for API hub integration.
   */
  metadata?: boolean;
  /**
   * Set the path to the file containing the options for generation.
   * If other flags are used, they overwrite the options set in the configuration file.
   * If a directory is passed, a `config.json` file is read from this directory.
   */
  config?: string;
}

/**
 * Parsed options with default values.
 * @internal
 */
export interface ParsedGeneratorOptions {
  /**
   * @internal
   */
  input: string;
  /**
   * @internal
   */
  outputDir: string;
  /**
   * @internal
   */
  transpile: boolean;
  /**
   * @internal
   */
  include?: string[];
  /**
   * @internal
   */
  overwrite: boolean;
  /**
   * @internal
   */
  clearOutputDir: boolean;
  /**
   * @internal
   */
  skipValidation: boolean;
  /**
   * @internal
   */
  tsConfig?: string;
  /**
   * @internal
   */
  packageJson: boolean;
  /**
   * @internal
   */
  licenseInPackageJson?: string;
  /**
   * @internal
   */
  verbose: boolean;
  /**
   * @internal
   */
  optionsPerService?: string;
  /**
   * @internal
   */
  packageVersion: string;
  /**
   * @internal
   */
  readme: boolean;
  /**
   * @internal
   */
  metadata: boolean;
  /**
   * @internal
   */
  config?: string;
}

/**
 * Parse the given generator options for programmatic use.
 * This function is only used when invoking the generator programmatically.
 * It parses the options that were passed to {@link generate} and sets default values where necessary.
 * The parsing is done through the `parse` function and `default` value on the `OpenApiGenerator` command's flags.
 * @param options - Options that match the CLI options.
 * @returns Parsed options with default values.
 * @internal
 */
export function parseGeneratorOptions(
  options: GeneratorOptions
): ParsedGeneratorOptions {
  return Object.entries(generatorOptions).reduce(
    (parsedOptions, [name, flag]: [string, yargs.Options]) => {
      const value = options[name];
      if (typeof value !== 'undefined') {
        parsedOptions[name] = flag.coerce ? flag.coerce(value) : value;
      } else if (typeof flag.default !== 'undefined') {
        parsedOptions[name] = flag.default;
      }
      return parsedOptions;
    },
    {} as ParsedGeneratorOptions
  );
}

/**
 * Parses a given path to a config file or directory and returns its content
 * @param configPath - path to a config file or a directory containing a config.json
 * @returns Options to configure generation
 * @internal
 */
export async function parseOptionsFromConfig(
  configPath: string
): Promise<ParsedGeneratorOptions> {
  try {
    if ((await lstat(configPath)).isDirectory()) {
      configPath = resolve(configPath, 'config.json');
    }
    const generatorOpts = JSON.parse(await readFile(configPath, 'utf8'));
    Object.keys(generatorOpts).forEach(key => {
      if (!Object.keys(generatorOptions).includes(key)) {
        logger.warn(
          `"${key}" is not part of the configuration and will be ignored.`
        );
      }
    });
    return parseGeneratorOptions(generatorOpts);
  } catch (err) {
    throw new ErrorWithCause(
      `Could not read configuration file at ${configPath}.`,
      err
    );
  }
}

/**
 * Returns only values that were specified
 * @param options - parsed generator options
 * @param rawInputFlags - the raw input keys
 * @returns generator options that were used in the raw input
 * @internal
 */
export function getSpecifiedFlags(
  options: ParsedGeneratorOptions,
  rawInputFlags: string[]
): ParsedGeneratorOptions {
  return rawInputFlags.reduce((reducedOptions, name) => {
    const value = options[name];
    if (value !== undefined) {
      reducedOptions[name] = value;
    }
    return reducedOptions;
  }, {} as ParsedGeneratorOptions);
}
