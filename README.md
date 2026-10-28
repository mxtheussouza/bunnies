# Bunnies

Aplicação exclusivamente desktop para administração do RabbitMQ em Windows, Linux e
macOS. O projeto está em modernização incremental; a interface atual ainda é a base
legada e não possui integração com brokers.

## Desenvolvimento

Usar Node **24.22.1** e npm **11.19.1**. Com nvm:

```bash
nvm install
nvm use
npm ci
npm start
```

```bash
npm run check
npm run package
npm run smoke:package
```

O pacote é gerado em `out/` para o SO/CPU local. O smoke abre esse executável com
um perfil temporário, sem conectar ao RabbitMQ. Inclui verificações da fronteira
Electron, CSP, IPC e recriação da janela. Ele não homologa os outros sistemas
ou a segurança de release. Não há publicação automática.

Consultar [comandos e convenções](docs/06-development/coding-standards.md),
[estado atual](docs/05-roadmap/current-stage.md),
[arquitetura](docs/03-architecture/architecture.md) e
[roadmap](docs/05-roadmap/roadmap.md). As instruções de continuidade e aprovação estão
em [AGENTS.md](AGENTS.md).

## Licença

[MIT](LICENSE).

Resultados locais e limitações: [Etapa 2B](docs/07-testing/desktop-boundary-2b.md).
