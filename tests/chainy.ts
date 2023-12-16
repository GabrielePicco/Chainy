import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Chainy} from "../target/types/chainy";
import {Tile} from "../target/types/tile";
import {Player} from "../target/types/player";
import {SystemMovement} from "../target/types/system_movement";
import {UpdatePlayer} from "../target/types/update_player";
import {
    createAddEntityInstruction, createApplyInstruction, createInitializeComponentInstruction,
    createInitializeNewWorldInstruction,
    createInitializeRegistryInstruction, FindComponentPda, FindEntityPda, FindWorldPda, FindWorldRegistryPda, PROGRAM_ID
} from "bolt-sdk"
import {PublicKey} from "@solana/web3.js";
import BN from "bn.js";
import {expect} from "chai";

enum Direction {
    Left = "Left",
    Right = "Right",
    Up = "Up",
    Down = "Down",
}
function serializeArgs(args: any = {}) {
    const jsonString = JSON.stringify(args);
    const encoder = new TextEncoder();
    const binaryData = encoder.encode(jsonString);
    return Buffer.from(
        binaryData.buffer,
        binaryData.byteOffset,
        binaryData.byteLength
    );
}


describe("chainy", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Chainy as Program<Chainy>;
    const tileComponent = anchor.workspace.Tile as Program<Tile>;
    const playerComponent = anchor.workspace.Player as Program<Player>;
    const systemMovement = anchor.workspace.SystemMovement as Program<SystemMovement>;
    const updatePlayer = anchor.workspace.UpdatePlayer as Program<UpdatePlayer>;

    // Constants used to test the program.
    const registryPda = FindWorldRegistryPda();
    const worldPda = FindWorldPda(new BN(0));

    let entityTile: PublicKey;
    let entityPlayer: PublicKey;
    let playerDataPda: PublicKey;

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

        const seed = "0,0";
        entityTile = FindEntityPda(new BN(0), new BN(0), seed);

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entityTile,
        }, {extraSeed: seed});

        const tx = new anchor.web3.Transaction().add(createEntityIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

    it("Create a second Tile entity", async () => {

        const seed = "0,1";
        entityTile = FindEntityPda(new BN(0), new BN(0), seed);

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entityTile,
        }, {extraSeed: seed});

        const tx = new anchor.web3.Transaction().add(createEntityIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

    it("Attach a tile component to the tile entity", async () => {

        let tileDataPda = FindComponentPda(tileComponent.programId, entityTile, "tile");

        let initComponentIx = createInitializeComponentInstruction({
            payer: provider.wallet.publicKey,
            entity: entityTile,
            data: tileDataPda,
            componentProgram: tileComponent.programId,
        });

        const tx = new anchor.web3.Transaction().add(initComponentIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

    it("Create a new entity for a Player", async () => {

        entityPlayer = FindEntityPda(new BN(0), new BN(2));

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entityPlayer,
        });

        const tx = new anchor.web3.Transaction().add(createEntityIx);
        await provider.sendAndConfirm(tx);
    });

    it("Attach a position component to the player entity", async () => {

        playerDataPda = FindComponentPda(playerComponent.programId, entityPlayer, "player");

        let initComponentIx = createInitializeComponentInstruction({
            payer: provider.wallet.publicKey,
            entity: entityPlayer,
            data: playerDataPda,
            componentProgram: playerComponent.programId,
        });

        const tx = new anchor.web3.Transaction().add(initComponentIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

    it("Execute the system movement on player1", async () => {

        const args = {
            direction: Direction.Up,
        };

        let applySystemIx = createApplyInstruction({
            componentProgram: playerComponent.programId,
            boltSystem: systemMovement.programId,
            boltComponent: playerDataPda,
        }, { args: serializeArgs(args) });

        const tx = new anchor.web3.Transaction().add(applySystemIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});

        const playerData =
            await playerComponent.account.player.fetch(
                playerDataPda
            );

        expect(playerData.x.toNumber()).to.equal(0);
        expect(playerData.y.toNumber()).to.gt(0);
    });

    it("Update the player account", async () => {

        const args = {
            publickey: provider.wallet.publicKey.toBase58(),
        };

        let applySystemIx = createApplyInstruction({
            componentProgram: playerComponent.programId,
            boltSystem: updatePlayer.programId,
            boltComponent: playerDataPda,
        }, { args: serializeArgs(args) });

        const tx = new anchor.web3.Transaction().add(applySystemIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});

        const playerData =
            await playerComponent.account.player.fetch(
                playerDataPda
            );

        expect(playerData.x.toNumber()).to.equal(0);
        expect(playerData.y.toNumber()).to.gt(0);
    });

});

