use bolt_lang::*;
use tile::{Tile, Cell};

declare_id!("3KMhZ84vAdMkodRDeHXCLhkKdy4eMgAYYr8eumv7WhTV");

#[system]
#[program]
pub mod update_tile {
    use super::*;

    pub fn execute(ctx: Context<Component>, args_p: Vec<u8>) -> Result<Tile> {
        let args = parse_args::<Args>(&args_p);
        ctx.accounts.tile.grid.cells[args.x as usize][args.y as usize] = args.cell;
        Ok(ctx.accounts.tile)
    }
}

#[derive(Accounts)]
pub struct Component<'info> {
    #[account()]
    pub tile: Account<'info, Tile>,
}


#[derive(BoltSerialize, BoltDeserialize)]
struct Args {
    x: i64,
    y: i64,
    cell: Cell,
}