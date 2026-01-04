/**
 * Completion Command
 *
 * Generates shell completion scripts for bash, zsh, and fish.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { logger } from '../utils/logger.js';

/**
 * Generate bash completion script
 */
function generateBashCompletion(): string {
  return `# Bash completion for opennextjs-cli
_opennextjs_cli_completion() {
  local cur prev words cword
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  words=("init" "add" "config" "status" "validate" "deploy" "preview" "update" "env" "cloudflare" "doctor" "migrate" "mcp" "setup")
  
  case "\${prev}" in
    --template)
      COMPREPLY=($(compgen -W "basic minimal starter with-auth with-database with-analytics fullstack-api fullstack-db" -- "\${cur}"))
      return 0
      ;;
    --caching-strategy)
      COMPREPLY=($(compgen -W "static-assets r2 r2-do-queue r2-do-queue-tag-cache" -- "\${cur}"))
      return 0
      ;;
    --from)
      COMPREPLY=($(compgen -W "vercel netlify" -- "\${cur}"))
      return 0
      ;;
  esac
  
  if [[ "\${cur}" == -* ]]; then
    COMPREPLY=($(compgen -W "--help --version --verbose --debug --yes --dry-run" -- "\${cur}"))
  else
    COMPREPLY=($(compgen -W "\${words[*]}" -- "\${cur}"))
  fi
}

complete -F _opennextjs_cli_completion opennextjs-cli
`;
}

/**
 * Generate zsh completion script
 */
function generateZshCompletion(): string {
  return `#compdef opennextjs-cli

_opennextjs_cli() {
  local -a commands
  commands=(
    'init:Initialize a new Next.js project'
    'add:Add OpenNext.js to existing project'
    'config:Update configuration'
    'status:Show project status'
    'validate:Validate configuration'
    'deploy:Deploy to Cloudflare'
    'preview:Preview locally'
    'update:Update dependencies'
    'env:Manage environment variables'
    'cloudflare:Cloudflare account management'
    'doctor:Health check'
    'migrate:Migrate from other platforms'
    'mcp:Setup MCP server'
    'setup:Configure CLI settings'
  )
  
  _arguments \\
    '--help[Show help]' \\
    '--version[Show version]' \\
    '--verbose[Enable verbose logging]' \\
    '--debug[Enable debug logging]' \\
    '--yes[Skip prompts]' \\
    '--dry-run[Preview without changes]' \\
    '1: :->command' \\
    '*:: :->args'
  
  case $state in
    command)
      _describe 'command' commands
      ;;
    args)
      case $words[1] in
        init)
          _arguments \\
            '--template[Template to use]:template:(basic minimal starter with-auth with-database with-analytics fullstack-api fullstack-db)' \\
            '--worker-name[Worker name]:name' \\
            '--caching-strategy[Caching strategy]:strategy:(static-assets r2 r2-do-queue r2-do-queue-tag-cache)'
          ;;
        migrate)
          _arguments '--from[Source platform]:platform:(vercel netlify)'
          ;;
      esac
      ;;
  esac
}

_opennextjs_cli "$@"
`;
}

/**
 * Generate fish completion script
 */
function generateFishCompletion(): string {
  return `# Fish completion for opennextjs-cli

function __opennextjs_cli_commands
  echo init\t"Initialize a new Next.js project"
  echo add\t"Add OpenNext.js to existing project"
  echo config\t"Update configuration"
  echo status\t"Show project status"
  echo validate\t"Validate configuration"
  echo deploy\t"Deploy to Cloudflare"
  echo preview\t"Preview locally"
  echo update\t"Update dependencies"
  echo env\t"Manage environment variables"
  echo cloudflare\t"Cloudflare account management"
  echo doctor\t"Health check"
  echo migrate\t"Migrate from other platforms"
  echo mcp\t"Setup MCP server"
  echo setup\t"Configure CLI settings"
end

complete -c opennextjs-cli -f -n "__fish_use_subcommand" -a "(__opennextjs_cli_commands)"

complete -c opennextjs-cli -s h -l help -d "Show help"
complete -c opennextjs-cli -s v -l version -d "Show version"
complete -c opennextjs-cli -s V -l verbose -d "Enable verbose logging"
complete -c opennextjs-cli -s D -l debug -d "Enable debug logging"
complete -c opennextjs-cli -s y -l yes -d "Skip prompts"
complete -c opennextjs-cli -l dry-run -d "Preview without changes"

complete -c opennextjs-cli -n "__fish_seen_subcommand_from init" -l template -d "Template to use" -a "basic minimal starter with-auth with-database with-analytics fullstack-api fullstack-db"
complete -c opennextjs-cli -n "__fish_seen_subcommand_from init" -l worker-name -d "Worker name"
complete -c opennextjs-cli -n "__fish_seen_subcommand_from init" -l caching-strategy -d "Caching strategy" -a "static-assets r2 r2-do-queue r2-do-queue-tag-cache"

complete -c opennextjs-cli -n "__fish_seen_subcommand_from migrate" -l from -d "Source platform" -a "vercel netlify"
`;
}

/**
 * Creates the `completion` command for shell completion
 *
 * @description
 * Generates shell completion scripts for bash, zsh, and fish.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli completion bash
 * opennextjs-cli completion zsh
 * opennextjs-cli completion fish
 * ```
 */
export function completionCommand(): Command {
  const command = new Command('completion');

  command
    .description('Generate shell completion scripts')
    .summary('Generate shell completion for bash, zsh, or fish')
    .argument(
      '<shell>',
      'Shell type: bash, zsh, or fish'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli completion bash    Generate bash completion
  opennextjs-cli completion zsh     Generate zsh completion
  opennextjs-cli completion fish    Generate fish completion

Installation:

Bash:
  opennextjs-cli completion bash > ~/.bash_completion.d/opennextjs-cli
  source ~/.bash_completion.d/opennextjs-cli

Zsh:
  opennextjs-cli completion zsh > ~/.zsh/completions/_opennextjs-cli
  # Add to ~/.zshrc:
  fpath=(~/.zsh/completions $fpath)
  autoload -U compinit && compinit

Fish:
  opennextjs-cli completion fish > ~/.config/fish/completions/opennextjs-cli.fish
  # Restart fish shell
`
    )
    .action(async (shell: string) => {
      try {
        p.intro('🔧 OpenNext.js CLI Completion');
        logger.section('Shell Completion Generation');

        let completion: string;
        let shellName: string;

        switch (shell.toLowerCase()) {
          case 'bash':
            completion = generateBashCompletion();
            shellName = 'Bash';
            break;
          case 'zsh':
            completion = generateZshCompletion();
            shellName = 'Zsh';
            break;
          case 'fish':
            completion = generateFishCompletion();
            shellName = 'Fish';
            break;
          default:
            logger.error(`Unsupported shell: ${shell}. Supported: bash, zsh, fish`);
            process.exit(1);
        }

        // Output completion script
        console.log(completion);

        logger.success(`${shellName} completion script generated!`);
        p.note(
          `To install:\n\n` +
          (shell.toLowerCase() === 'bash'
            ? `  opennextjs-cli completion ${shell} > ~/.bash_completion.d/opennextjs-cli\n  source ~/.bash_completion.d/opennextjs-cli`
            : shell.toLowerCase() === 'zsh'
            ? `  opennextjs-cli completion ${shell} > ~/.zsh/completions/_opennextjs-cli\n  # Add to ~/.zshrc: fpath=(~/.zsh/completions $fpath)`
            : `  opennextjs-cli completion ${shell} > ~/.config/fish/completions/opennextjs-cli.fish\n  # Restart fish shell`),
          '📝 Installation Instructions'
        );
      } catch (error) {
        logger.error('Failed to generate completion script', error);
        process.exit(1);
      }
    });

  return command;
}
