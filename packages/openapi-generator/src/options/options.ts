import { resolve, extname, posix, sep } from 'path';
import { existsSync, lstatSync } from 'fs';
import { GlobSync } from 'glob';
import yargs from 'yargs';
// eslint-disable-next-line import/no-internal-modules
import { hideBin } from 'yargs/helpers';

/**
 * @internal
 */
// eslint-disable-next-line
export function cli(argv: string[]) {
  return (
    yargs(hideBin(argv))
      .usage(
        'Usage: openapi-generator --input <input> --outputDir <outputDirectory>'
      )
      .options(generatorOptions)
      // This needs to be specified separately due to following bug: https://github.com/yargs/yargs/issues/1928
      .demandOption('input')
      .demandOption('outputDir')
      .strict()
  );
}

/**
 * @internal
 */
export const generatorOptions = {
  input: {
    string: true,
    alias: 'i',
    description:
      'Specify the path to the directory or file containing the OpenAPI service definition(s) to generate clients for. Accepts Swagger and OpenAPI definitions as YAML and JSON files. Throws an error if the path does not exist.',
    coerce: (input: string): string =>
      typeof input !== 'undefined'
        ? resolve(input).split(sep).join(posix.sep)
        : ''
  },
  outputDir: {
    string: true,
    alias: 'o',
    description:
      'Specify the path to the directory to generate the client(s) in. Each client is generated into a subdirectory within the given output directory. Creates the directory if it does not exist. Customize subdirectory naming through `--optionsPerService`.',
    coerce: (input: string): string =>
      typeof input !== 'undefined' ? resolve(input) : ''
  },
  prettierConfig: {
    string: true,
    alias: 'p',
    description:
      'Specify the path to the prettier config. If not given a default config will be used for the generated sources.',
    coerce: (input: string): string =>
      typeof input !== 'undefined' ? resolve(input) : ''
  },
  transpile: {
    boolean: true,
    alias: 't',
    description:
      'Transpile the generated TypeScript code. When enabled a default `tsconfig.json` will be generated and used. It emits `.js`, `.js.map`, `.d.ts` and `.d.ts.map` files. To configure transpilation set `--tsconfig`.',
    default: false
  },
  include: {
    string: true,
    coerce: (input?: string): string[] | undefined =>
      typeof input !== 'undefined'
        ? new GlobSync(input.split(sep).join(posix.sep)).found
        : undefined,
    description:
      'Include files matching the given glob into the root of each generated client directory.'
  },
  overwrite: {
    boolean: true,
    description:
      'Allow to overwrite files, that already exist. This is useful, when running the generation regularly.',
    default: false
  },
  clearOutputDir: {
    boolean: true,
    description:
      'Remove all files in the output directory before generation. Be cautious when using this option, as it really removes EVERYTHING in the output directory.',
    default: false
  },
  skipValidation: {
    boolean: true,
    description:
      'By default, the generation fails, when there are duplicate or invalid names for operations and/or path parameters after transforming them to camel case. Set this to true to enable unique and valid name generation. The names will then be generated by appending numbers and prepending prefixes.',
    default: false
  },
  tsconfig: {
    string: true,
    description:
      'Replace the default `tsconfig.json` by passing a path to a custom config. By default, a `tsconfig.json` is only generated, when transpilation is enabled (`--transpile`). If a directory is passed, a `tsconfig.json` file is read from this directory.',
    coerce: (input?: string): string | undefined =>
      typeof input !== 'undefined' ? resolve(input) : undefined
  },
  packageJson: {
    boolean: true,
    description:
      'When enabled, a `package.json`, that specifies dependencies and scripts for transpilation and documentation generation is generated.',
    default: false
  },
  verbose: {
    boolean: true,
    alias: 'v',
    description: 'Turn on verbose logging.',
    default: false
  },
  optionsPerService: {
    string: true,
    description:
      'Set the path to a file containing the options per service. The configuration allows to set a `directoryName` and `packageName` for every service, identified by the path to the original file. It also makes sure that names do not change between generator runs. If a directory is passed, a `options-per-service.json` file is read/created in this directory.',
    coerce: (input?: string): string | undefined => {
      if (typeof input !== 'undefined') {
        const isFilePath =
          (existsSync(input) && lstatSync(input).isFile()) || !!extname(input);
        return isFilePath
          ? resolve(input)
          : resolve(input, 'options-per-service.json');
      }
    }
  },
  packageVersion: {
    string: true,
    description: 'Set the version in the generated package.json.',
    default: '1.0.0',
    hidden: true
  },
  readme: {
    boolean: true,
    description:
      'Generate default `README.md` files in the client directories.',
    default: false,
    hidden: true
  },
  metadata: {
    boolean: true,
    description: 'When enabled, metadata for the API hub is generated.',
    default: false,
    hidden: true
  },
  config: {
    string: true,
    alias: 'c',
    // config: true, // Disabled to maintain backwards compatibility with the oclif behavior
    coerce: (input?: string): string | undefined =>
      typeof input !== 'undefined' ? resolve(input) : undefined,
    description:
      'Set the path to a file containing the options for generation instead of setting the options on the command line. When combining the `config` option with other options on the command line, the command line options take precedence. If a directory is passed, a `config.json` file is read from this directory.'
  }
};
