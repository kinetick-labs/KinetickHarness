# KinetickHarness

KinetickHarness (`kh`) is a local-first fork of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), maintained by [kinetick-labs](https://github.com/kinetick-labs). The upstream project is MIT licensed. This repository keeps that license and the DeepSeek copyright in [LICENSE](LICENSE).

Sessions, credentials, and settings stay on this computer under `~/.kh` (`KH_HOME` overrides that directory; `DSH_HOME` is still read when `KH_HOME` is unset). This fork does not process or store your sessions on your behalf and does not operate a hosted data service. Model traffic goes to the provider you configure. Optional tools and package installs use the network only when you enable them.

It is built on an **everything-is-a-plugin** architecture and powered by [Cordis](https://github.com/cordiverse/cordis), whose design is described in [_A Programming Paradigm for Spatiotemporal Composability_](https://arxiv.org/abs/2608.25512).

Documentation: [https://kinetick-harness.github.io/kinetick-harness/](https://kinetick-harness.github.io/kinetick-harness/)

## Developer preview

KinetickHarness is in _developer preview_ and iterating rapidly. **THERE WILL BE COMPATIBILITY-BREAKING CHANGES.**

Review the [safety notice](SAFETY.md) before running the project.

## Run

### Run from `npm`

Install `Node.js`, then run:

```sh
npx @kinetick-labs/kh web
```

The command starts the Web UI at `http://127.0.0.1:3080` by default and opens it in the default browser for a local launch. An SSH launch only prints the host URL because the SSH client or editor owns the local forwarded address. Pass `--no-open` to run the server without opening a browser. See [Web UI guide](docs/user/guide/index.md).

### Run from source

To run from a repository checkout:

```sh
git clone https://github.com/kinetick-labs/KinetickHarness.git
cd KinetickHarness
pnpm install
pnpm run build
pnpm kh web
```

`pnpm run build` prepares the repository artifacts. `pnpm kh web` uses those built artifacts without rebuilding.

## Community and support

- Open issues and pull requests on [kinetick-labs/KinetickHarness](https://github.com/kinetick-labs/KinetickHarness).
- The upstream project is [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness).
- Add the [`kh-plugin`](https://github.com/topics/kh-plugin) topic to your plugin repository for discoverability.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

Start with the [development guide](docs/development.md) and [architecture documentation](docs/architecture.md).

`pnpm run dev:web` builds, serves, and rebuilds client bundles on source edits in one terminal, and `make help` lists the matching Make targets for Web and Desktop; the guide's application commands section owns the full table.

For agents, follow [AGENTS.md](AGENTS.md).

## Citation

Cite the upstream work. KinetickHarness is a fork of that project.

```bibtex
@misc{kinetick-harness2026,
  title={KinetickHarness: Everything is a Plugin},
  author={DeepSeek-AI},
  year={2026},
  publisher={GitHub},
  howpublished={\url{https://github.com/kinetick-labs/KinetickHarness}},
}
```

## License

[MIT](LICENSE)

Third-party dependencies and their licenses are disclosed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
