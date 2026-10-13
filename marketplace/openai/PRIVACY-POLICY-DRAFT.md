# Hypertaks privacy policy corrections

Owner-review draft. Not published. Do not publish this document until the unresolved practices below are confirmed and incorporated.

## Scope and service

Hypertaks is a Founder Operating System for AI agents maintained by Crimson Rift Studio. This policy covers the Hypertaks website, its optional hosted read-only MCP adapter, and Hypertaks-managed local persistence. Your AI host, model provider, MCP client, synced storage, and any service you separately connect process data under their own policies.

## Information processed by the remote adapter

An MCP connection sends protocol information such as request IDs, method names, protocol versions, and initialization client metadata. The routing tool receives the task text supplied by your client, an optional preferred skill, and an optional diagnostics setting. The skill-reading tool receives a canonical skill name. Task text may include personal, business, or code information if you or your client includes it. There is no file-upload, account-registration, database-writing, or shell-execution tool in this adapter.

These inputs are used to negotiate the connection, select a public skill entry point, return public skill instructions, disclose product capabilities and limits, or check integrity of the hosted server's public skill files. A server integrity check does not inspect your device or private repository.

Responses may include public skill instructions, routing explanations, product and version information, relative public-file paths, and file hashes. They are returned to your requesting client. When you use ChatGPT, the request and response are also processed by ChatGPT/OpenAI as part of that interaction.

## Hosting and application storage

The website and adapter use Vercel hosting. Website requests to the MCP paths are proxied to the Vercel-hosted adapter. Vercel necessarily processes the network traffic needed to serve those requests.

The inspected adapter implementation handles tool requests in memory and contains no application database or request-content persistence/logger. This statement concerns that implementation. It does not promise that hosting infrastructure, the client, or separately connected services retain no information.

## Local operation and optional services

With a capable local agent host and approved write permissions, Hypertaks can retain project context, memory, pointers, checkpoints, and evidence in the approved project storage or an approved local external brain/vault. You control those files and their storage or sync. Optional Graphify, MCP memory, and other authorized connectors may process data you permit them to receive. These integrations are optional; they must not be installed or used silently.

Your AI host and model provider may process conversation or repository context independently of Hypertaks-managed persistence. Local storage therefore does not establish that every component of an AI workflow operates offline.

## User controls supported by the implementation

You can choose which task text to send, stop using the remote endpoint, or disconnect the integration through your client. Manage client conversation history using that client's controls. Disconnecting the integration does not establish deletion of infrastructure logs or conversation history.

You can withhold authorization for local persistence or optional external services. Manage existing local records through your own storage and approved host controls; no remote Hypertaks deletion tool is exposed. User-enabled backups and sync can retain copies independently.

The currently published support page identifies `abrur_nic@yahoo.com` as the maintainer contact. The owner's privacy-request process and response commitments must be confirmed before publication.

## Unresolved owner practices

The complete published policy still needs the account-specific infrastructure log fields, purposes, recipients, retention periods and exceptions, deletion/request process, support-data practices, processing regions, and any additional uses or processors listed in `PRIVACY-GAPS.md`. Business-policy claims about sales, sharing, training, or secondary uses must come from the owner. Do not fill these sections with assumed defaults or publish this draft as a completed compliance fix.
