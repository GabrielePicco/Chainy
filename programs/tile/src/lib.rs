use bolt_lang::*;
use bolt_lang::serde::Deserialize;
use serde::Serialize;

declare_id!("DfMmQL1ozAyHTkNMEDBXWi7CV8AutqXUcrGJR4BvwmUS");

#[component(Tile)]
#[program]
pub mod tile {
    use super::*;
}

#[account]
#[bolt_account(component_id = "tile")]
#[derive(Copy)]
pub struct Tile {
    pub x: i64,
    pub y: i64,
    pub owner: Pubkey,
    pub grid: Grid,
}

#[derive(InitSpace, Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct Grid {
    pub cells: [[Cell; 10]; 10],
}

impl Default for Grid {
    fn default() -> Self {
        let grid = Grid {
            cells: [[Cell::Empty; 10]; 10],
        };
        grid
    }
}

#[derive(InitSpace, Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize, PartialEq, Serialize, Deserialize)]
pub enum Cell {
    Empty,
    Tree,
    Trap,
    Egg,
}

impl Default for Cell {
    fn default() -> Self {
        Cell::Empty
    }
}
