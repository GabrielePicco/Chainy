import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Chainy} from "../target/types/chainy";
import {Tile} from "../target/types/tile";
import {Player} from "../target/types/player";
import {SystemMovement} from "../target/types/system_movement";
import {UpdatePlayer} from "../target/types/update_player";
import {UpdateTile} from "../target/types/update_tile";
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

enum Cell {
    Empty = "Empty",
    Tree = "Tree",
    Trap = "Trap",
    Egg = "Egg",
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
    const updateTile = anchor.workspace.UpdateTile as Program<UpdateTile>;

    // Constants used to test the program.
    const registryPda = FindWorldRegistryPda();
    const worldPda = FindWorldPda(new BN(0));

    let entityTile: PublicKey;
    let entityTile2: PublicKey;
    let entityPlayer: PublicKey;
    let entityPlayer2: PublicKey;
    let playerDataPda: PublicKey;
    let playerDataPda2: PublicKey;

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
        entityTile2 = FindEntityPda(new BN(0), new BN(0), seed);

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entityTile2,
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

    it("Create a second entity for a Player", async () => {

        entityPlayer2 = FindEntityPda(new BN(0), new BN(3));

        let createEntityIx = createAddEntityInstruction({
            world: worldPda,
            payer: provider.wallet.publicKey,
            entity: entityPlayer2,
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

    it("Attach a position component to player 2 entity", async () => {

        playerDataPda2 = FindComponentPda(playerComponent.programId, entityPlayer2, "player");

        let initComponentIx = createInitializeComponentInstruction({
            payer: provider.wallet.publicKey,
            entity: entityPlayer2,
            data: playerDataPda2,
            componentProgram: playerComponent.programId,
        });

        const tx = new anchor.web3.Transaction().add(initComponentIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    });

    it("Execute the system movement on player1", async () => {

        const args = {
            direction: Direction.Left,
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

        expect(playerData.x.toNumber()).to.lt(0);
        expect(playerData.y.toNumber()).to.equal(0);
    });

    it("Execute the system movement on player2", async () => {

        const args = {
            direction: Direction.Right,
        };

        let applySystem1Ix = createApplyInstruction({
            componentProgram: playerComponent.programId,
            boltSystem: systemMovement.programId,
            boltComponent: playerDataPda2,
        }, { args: serializeArgs(args) });

        const args2 = {
            direction: Direction.Up,
        };

        let applySystem2Ix = createApplyInstruction({
            componentProgram: playerComponent.programId,
            boltSystem: systemMovement.programId,
            boltComponent: playerDataPda2,
        }, { args: serializeArgs(args2) });

        const tx = new anchor.web3.Transaction()
            .add(applySystem1Ix)
            .add(applySystem2Ix);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});

        const playerData =
            await playerComponent.account.player.fetch(
                playerDataPda2
            );

        expect(playerData.x.toNumber()).to.gt(0);
        expect(playerData.y.toNumber()).to.gt(0);
    });

    it("Update the player account", async () => {

        const args = {
            publickey: provider.wallet.publicKey.toBase58(),
            alive: true,
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

        expect(playerData.playerId.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    });

    it("Update the player account to alive = false", async () => {

        const args = {
            publickey: provider.wallet.publicKey.toBase58(),
            alive: false,
        };

        let applySystemIx = createApplyInstruction({
            componentProgram: playerComponent.programId,
            boltSystem: updatePlayer.programId,
            boltComponent: playerDataPda,
        }, { args: serializeArgs(args) });

        const tx = new anchor.web3.Transaction().add(applySystemIx);
        await provider.sendAndConfirm(tx);

        const playerData =
            await playerComponent.account.player.fetch(
                playerDataPda
            );

        expect(playerData.alive).to.equal(false);
    });

    it("Plant a tree in 0,1 on Tile 0, 0", async () => {

        const args = {
            cell: Cell.Tree,
            x: 0,
            y: 1,
        };

        let tileDataPda = FindComponentPda(tileComponent.programId, entityTile, "tile");

        let updateTileIx = createApplyInstruction({
            componentProgram: tileComponent.programId,
            boltSystem: updateTile.programId,
            boltComponent: tileDataPda,
        }, { args: serializeArgs(args) });

        const tx = new anchor.web3.Transaction().add(updateTileIx);
        await provider.sendAndConfirm(tx, [], {skipPreflight: true});

        const tileData =
            await tileComponent.account.tile.fetch(
                tileDataPda
            );

        expect(tileData.grid.cells[0][1]['tree']).to.not.equal(undefined);
        expect(tileData.grid.cells[0][1]['empty']).to.equal(undefined);

        expect(tileData.grid.cells[0][0]['tree']).to.equal(undefined);
        expect(tileData.grid.cells[0][0]['empty']).to.not.equal(undefined);
    });
    //
    // it("Create a new entity for a Tile", async () => {
    //
    //     const seed = "0,-4";
    //     entityTile = FindEntityPda(new BN(0), new BN(0), seed);
    //
    //     let createEntityIx = createAddEntityInstruction({
    //         world: worldPda,
    //         payer: provider.wallet.publicKey,
    //         entity: entityTile,
    //     }, {extraSeed: seed});
    //
    //     const tx = new anchor.web3.Transaction().add(createEntityIx);
    //     const txSig = await provider.sendAndConfirm(tx, [], {skipPreflight: true});
    //     console.log(txSig);
    // });

});

