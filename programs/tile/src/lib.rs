use bolt_lang::*;

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
    pub x: u64,
    pub y: u64,
}
