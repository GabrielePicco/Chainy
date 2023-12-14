import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Chainy} from "../target/types/chainy";
import {Tile} from "../target/types/tile";
import {
    createAddEntityInstruction, createInitializeComponentInstruction,
    createInitializeNewWorldInstruction,
    createInitializeRegistryInstruction, FindComponentPda, FindEntityPda, FindWorldPda, FindWorldRegistryPda
} from "bolt-sdk"
import {PublicKey} from "@solana/web3.js";
import BN from "bn.js";

describe("chainy", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Chainy as Program<Chainy>;
    const tileComponent = anchor.workspace.Tile as Program<Tile>;

    // Constants used to test the program.
    const registryPda = FindWorldRegistryPda();
    const worldPda = FindWorldPda(new BN(0));

    let entity1: PublicKey;

    it("InitializeWorldsRegistry", async () => {
        const registryPda = FindWorldRegistryPda();

        const initializeRegistryIx = createInitializeRegistryInstruction({
            registry: registryPda,
            payer: provider.wallet.publicKey,
        });
        const tx = new anchor.web3.Transaction().add(initializeRegistryIx);
        await provider.sendAndConfirm(tx);
    });

    it("InitializeNewWorld", async () => {

        const initializeWorldIx = createInitializeNewWorldInstruction(
            {
                world: worldPda,
                registry: registryPda,
                payer: provider.wallet.publicKey,
            });

        const tx = new anchor.web3.Transaction().add(initializeWorldIx);
        await provider.sendAndConfirm(tx);
    });

    it("Create a new entity for a Tile", async () => {

        entity1 = FindEntityPda(new BN(0), new BN(0));

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entity1,
        });

        const tx = new anchor.web3.Transaction().add(createEntityIx);
        await provider.sendAndConfirm(tx);
    });

    it("Attach a tile component to the entity 1", async () => {

        let tileDataPda = FindComponentPda(tileComponent.programId, entity1, "tile");

        let initComponentIx = createInitializeComponentInstruction({
            payer: provider.wallet.publicKey,
            entity: entity1,
            data: tileDataPda,
            componentProgram: tileComponent.programId,
        });

        const tx = new anchor.web3.Transaction().add(initComponentIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

});

