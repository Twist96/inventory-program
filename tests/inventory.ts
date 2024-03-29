import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Inventory} from "../target/types/inventory";
import {PublicKey} from "@solana/web3.js";
import {assert} from "chai";
import {getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID} from "@solana/spl-token"

describe("inventory", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const payer = anchor.AnchorProvider.env().wallet as anchor.Wallet

  const program = anchor.workspace.Inventory as Program<Inventory>;
  const USDC_MINT = new anchor.web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const nft = new PublicKey("Fnd3WMEGywcTjp3hdBnAepfJjcMJ2N1RwPpGqoV8Qsmp");

  const [inventory_info_address] = PublicKey.findProgramAddressSync(
      [Buffer.from("inventory")],
      program.programId
  );
  const [asset_info] = PublicKey.findProgramAddressSync(
      [Buffer.from("asset_info"), nft.toBuffer()],
      program.programId
  );
    const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    );
  const usdc_ata = PublicKey.findProgramAddressSync(
      [payer.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      )[0]

    const [mintVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), nft.toBuffer(), payer.publicKey.toBuffer()],
        program.programId
    )

    async function get_mint_ata(keypair: anchor.web3.Keypair, mint: anchor.web3.PublicKey) {
        const provider = anchor.AnchorProvider.env()
        return await getOrCreateAssociatedTokenAccount(
            provider.connection,
            keypair,
            mint,
            payer.publicKey
        )
    }


    it("should initialize program", async () => {
        const tx = await program.methods.initialize()
            .accounts({
                payer: payer.publicKey,
                inventory: inventory_info_address
            })
            .rpc()
    } )

  it.only("should create inventory", async () => {
      let price = new anchor.BN(10 * 10 ** 6)
      const usdc_ata_ = (await get_mint_ata(payer.payer, USDC_MINT)).address
      const tx = await  program.methods.createInventory(price)
          .accounts({
              payer: payer.publicKey,
              inventory: inventory_info_address,
              assetInfo: asset_info,
              usdcAccount: usdc_ata_,
              mint: nft,
              usdcMint: USDC_MINT,
          })
          .rpc()
      console.log({tx})
  })

  it.only("should add asset", async () => {
      let amount = new anchor.BN(10)
      let userAssetAccount = (await get_mint_ata(payer.payer, nft)).address
    const tx = await program.methods.addAsset(amount)
        .accounts({
            payer: payer.publicKey,
            userAssetAccount,
            inventory: inventory_info_address,
            assetInfo: asset_info,
            mintVault,
            mint: nft
        })
        .rpc();

    const inventoryInfo = await program.account.inventory.fetch(inventory_info_address);
    console.log({tx});
    console.log({inventoryInfo})
  });

  it("should withdraw asset", async () => {
      const _ = await program.methods.withdrawAsset()
          .accounts({
              payer: payer.publicKey,
              inventory: inventory_info_address,
              mint: nft
          })
          .rpc()
      const inventoryInfo = await program.account.inventory.fetch(inventory_info_address);
      assert(!inventoryInfo.assets.some(x => x.toString() === nft.toString()), "Failed to remove asset")
  });

  it("should update asset", async () => {
      let amount_bn = new anchor.BN(60)
      let payer_usdc_pubkey = new PublicKey("DWDRomhCxYJhodb5vbYeYGZpLTSC9CFpoUEZ8W4CGaYd")
      const  _ = await program.methods.updateAssetInfo(amount_bn, payer_usdc_pubkey)
          .accounts({
              payer: payer.publicKey,
              assetInfo: asset_info,
              mint: nft
          })
          .rpc()

      const assetInfo = await program.account.assetInfo.fetch(asset_info)
      console.log({
          inventoryInfo: assetInfo.price.toNumber(),
          amount_bn: amount_bn.toNumber()
      })
      assert(assetInfo.amount.eq(new anchor.BN(assetInfo.amount.toNumber())), `Expected ${amount_bn.toNumber()} but found ${assetInfo.price.toNumber()}`)
  });

    it.only("should buy asset", async () => {
        const payerUsdcAccount = (await get_mint_ata(payer.payer, USDC_MINT)).address
        const payerMintAccount = (await get_mint_ata(payer.payer, nft)).address

        let amount = new anchor.BN(1)
        const tx = await program.methods.buyAsset(amount)
            .accounts({
                payer: payer.publicKey,
                payerUsdcAccount,
                payerMintAccount,
                devUsdcAccount: payerUsdcAccount,
                inventory: inventory_info_address,
                assetInfo: asset_info,
                mintVault,
                mint: nft,
                usdcMint: USDC_MINT,
            })
            .rpc()
        console.log(tx)
    })

    it.only("should print accounts", async () => {
        console.log({asset_info})
        const assetInfo = await program.account.assetInfo.fetch(asset_info)
        const inventory = await program.account.inventory.fetch(inventory_info_address)
        console.log({
            assetInfo,
            inventory
        })
    })

  it("close inventory", async () => {
      const _ = await program.methods.closeInventory()
          .accounts({
              payer: payer.publicKey,
              inventory: inventory_info_address,
              assetInfo: asset_info,
              mint: nft
          }).rpc()
      const inventory = await program.account.inventory.fetch(inventory_info_address)
      assert(!inventory.assets.some(x => x.toString() === nft.toString()), "Failed to remove asset")
  })

});
