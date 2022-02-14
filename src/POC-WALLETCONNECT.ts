import { BinaryBlob, blobFromBuffer, blobFromUint8Array } from "@dfinity/candid";
import WalletConnect from "@walletconnect/client";

import PlugKeyRing from "./PlugKeyRing"
import mockStorage from './utils/storage/mock'

const SEED = 'YOUR-SEED';

const PASSWORD = '1122334455667788';

function bufferToBase64(buf: Uint8Array): string {
    return Buffer.from(buf.buffer).toString('base64')
}

function base64ToBuffer(base64: string) {
    return Buffer.from(base64, 'base64')
}

const createKeyring = async (seed = SEED, password = PASSWORD) => {
    const keyring = new PlugKeyRing(mockStorage);
    await keyring.importMnemonic({mnemonic: seed, password});
    await keyring.unlock(PASSWORD);
    return keyring;
}

const connectWalletConnect = async () => {
    const keyring = await createKeyring();

    // Create connector
    const connector = new WalletConnect(
    {
        // Required
        uri: "PASTE-WALLET-CONNECT-URI",
        // Required
        clientMeta: {
        description: "WalletConnect Developer App",
        url: "https://walletconnect.org",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "WalletConnect",
        },
    });


    // Subscribe to session requests
connector.on("session_request", (error, payload) => {
    if (error) {
      throw error;
    }

    console.log("on_session_request", payload);
    // Handle Session Request
  
    /* payload:
    {
      id: 1,
      jsonrpc: '2.0'.
      method: 'session_request',
      params: [{
        peerId: '15d8b6a3-15bd-493e-9358-111e3a4e6ee4',
        peerMeta: {
          name: "WalletConnect Example",
          description: "Try out WalletConnect v1.0",
          icons: ["https://example.walletconnect.org/favicon.ico"],
          url: "https://example.walletconnect.org"
        }
      }]
    }
    */
   console.log(keyring.currentWallet.publicKey.toDer().buffer);
    const derKey = bufferToBase64(keyring.currentWallet.publicKey.toDer())
    console.log(derKey)
    connector.approveSession({
        accounts: [derKey],
        chainId: 1                  // required
      });
  });
  
  // Subscribe to call requests
  connector.on("call_request", (error, payload) => {
    if (error) {
      throw error;
    }

    console.log("on_call_request", payload);
    // Handle Call Request

    /* payload:
    {
      id: 1,
      jsonrpc: '2.0'.
      method: 'eth_sign',
      params: [
        "0xbc28ea04101f03ea7a94c1379bc3ab32e65e62d3",
        "My email is john@doe.com - 1537836206101"
      ]
    }
    */
    if(payload.method === "get_balances") {
        keyring.getBalances().then(balances => 
            connector.approveRequest({
                id: payload.id,
                result: balances
            })
        ).catch(e => 
            connector.rejectRequest({
                id: payload.id,                                  // required
                error: {
                    message: e.message     // optional
                }
            })
          )
    } else if (payload.method === "sign") {

        const data = base64ToBuffer(payload.params[0]);

        keyring.sign(blobFromUint8Array(new Uint8Array(data))).then(signature => {
            console.log('SIGNATURE', new Uint8Array(signature));
            const encoded = signature.toString('base64')
            connector.approveRequest({
                id: payload.id,
                result: encoded
            })
        }).catch(e => {
            connector.rejectRequest({
                id: payload.id,                                  // required
                error: {
                    message: e.message     // optional
                }
            })
        });
    } else {
        connector.rejectRequest({
            id: payload.id,                                  // required
            error: {
                message: "OPERATION NOT ALLOWED"    // optional
            }
        })
    }
  });
  
  connector.on("disconnect", (error, _payload) => {
    if (error) {
      throw error;
    }
  
    // Delete connector
  });
}

connectWalletConnect();