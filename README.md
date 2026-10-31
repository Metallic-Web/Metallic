<p align="center">
  <kbd>
    <img width="100px" src="https://raw.githubusercontent.com/cognetwork-dev/Metallic/refs/heads/main/static/assets/logo-180.png">
  </kbd>
</p>

<h1 align="center">
  Metallic
</h1>

<p align="center">
  A powerful web proxy built for speed and customization.
</p>

Access the web with this stylish web proxy made in Svelte supporting many sites. Metallic was originally created for [TitaniumNetwork](https://titaniumnetwork.org/)'s 2022 proxathon where it won 2nd place!

## Features

- Modern and clean design
- Customizable preset apps
- Quick settings
- Advanced search suggestions
- Support for many popular websites with Scramjet
- Large selection of games thanks to [Obsidian!](https://playobsidian.com/)

## Community

Metallic is still maintained by me (Nebelung) but does not have an active community. If you want to find more similar services join the [TitaniumNetwork Discord](https://discord.gg/unblock).

## Setup

### Development

> [!TIP]
> Run `pnpm install` to install the required dependencies.

Run `pnpm dev` to run Metallic in development mode

### Building

Run `pnpm build` to build Metallic to the `/build/` folder. If you are going to have an external wisp server and host Metallic statically use `pnpm run build-static` to bundle sw, controller, and Scramjet files.

### Service

Run `pnpm start` to run Metallic on `localhost:8000`

## Developers

[Nebelung](https://github.com/Nebelung-Dev) - Creator and developer

## License

Metallic uses the AGPL-3.0 license.
