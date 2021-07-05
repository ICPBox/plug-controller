![](https://storageapi.fleek.co/fleek-team-bucket/plug.png)


# Plug Controller - Controller functions for the Plug Extension
[![Fleek](https://img.shields.io/badge/Made%20by-Fleek-blue)](https://fleek.co/)
[![Discord](https://img.shields.io/badge/Discord-Channel-blue)](https://discord.gg/yVEcEzmrgm)

## Introduction

The Plug Controller is a package that provides utility & logic to the Plug browser wallet extension, as well as the account creation and management. It handles the interactions between the extension and the Internet Computer as users interact with accounts, balances, canisters, and the network.

## Requirements

Authenticate to Github registry by:

```
npm login --registry=https://npm.pkg.github.com --scope=@Psychedelic
```

This because the packages under the organisation scope [@Psychedelic](https://github.com/Psychedelic) are published under the [Psychedelic packages](https://github.com/orgs/Psychedelic/packages), as you can see in the `.npmrc`:

```
@psychedelic:registry=https://npm.pkg.github.com
```

Choose the github username that you use as a member of @Psychedelic and for the password, a [personal access token](https://github.com/settings/tokens), with the  `read:packages` scope (permission) and `write:packages`, to publish it.

## Installation

`npm install @psychedelic/plug-controller`

## Plug KeyRing
A Plug Keyring is a class that manages the user's accounts and allow you to create/import a mnemonic and its keypair. 
```
import { PlugKeyRing } from '@psychedelic/plug-controller';

const keyRing = new PlugKeyRing();

// Initialize keyring and load state from extension storage
await keyRing.load();
```

### Keyring Creation
```
// Creates the keyring and returns the default wallet
const wallet: PlugWallet = keyRing.create(password);
```

### Mnemonic Import
```
// Creates the keyring using the provided mnemonic and returns the default wallet
const wallet: PlugWallet = keyRing.importFromMnemonic(mnemonic, password);
```