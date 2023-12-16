use bolt_lang::*;

declare_id!("3XbWhap1xiE9zmUu2nqtv3NUVX1RVeXnvaMvUVaw3Lg5");

#[component(Player)]
#[program]
pub mod player {
    use super::*;
}

#[account]
#[bolt_account(component_id = "player")]
pub struct Player {
    pub x: i64,
    pub y: i64,
    pub player_id: Pubkey,
}
