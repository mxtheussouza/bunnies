# Bunnies

Aplicação exclusivamente desktop para administração do RabbitMQ em Windows, Linux e
macOS. O projeto está em modernização incremental. Já permite organizar perfis
locais, usar temas e consultar a Ajuda offline; ainda não se conecta a brokers.

## Para usar o aplicativo

Leia o **[Guia do usuário](docs/10-user-guide/README.md)**: primeiros passos,
explicação de cada campo, cadastro/edição/remoção de perfis, senhas em memória,
temas, menus, teclado e solução de problemas. O mesmo guia está na aba **Ajuda**,
na barra lateral do aplicativo, e funciona offline.

Esta é uma versão em desenvolvimento, sem instaladores publicados ou atualização
automática. Testes locais foram feitos em macOS arm64; demais alvos ainda precisam
de homologação. Salvar ou selecionar um perfil não inicia conexão. Recursos de
broker e persistência protegida de senhas continuam indisponíveis.

## Estado e histórico

[PROJECTS_STATUS.md](PROJECTS_STATUS.md) registra tarefas concluídas, pendências,
decisões, aprovações e testes. Deve ser lido e atualizado em toda Task, conforme
[AGENTS.md](AGENTS.md).

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
node tools/testing/profiles.cjs
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

Resultados locais e limitações: [Etapa 2B](docs/07-testing/desktop-boundary-2b.md),
[perfis 4A.1](docs/07-testing/profiles-4a1.md) e
[guia/Ajuda DOC.1](docs/07-testing/help-doc1.md).

## Manutenção do guia

A fonte única é [guide.json](docs/10-user-guide/guide.json), incluída na Ajuda local.
Ao mudar uma funcionalidade ou formulário, atualize o conteúdo e execute:

```bash
npm run docs:generate
npm run docs:check
```

O Markdown do guia é gerado; `npm run check` também verifica sincronização. Registre
a alteração e as verificações em [PROJECTS_STATUS.md](PROJECTS_STATUS.md).
