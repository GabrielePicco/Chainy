use bolt_lang::*;
use player::Player;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use std::str::FromStr;

declare_id!("Apno4oogfdGYF7U6qdrcXtj8E9rfoUCCcYjoXy3dKHHf");

#[system]
#[program]
pub mod update_player {
    use super::*;

    pub fn execute(ctx: Context<Component>, args_p: Vec<u8>) -> Result<Player, ProgramError> {
        let args = parse_args::<Args>(&args_p);

        let pk = Pubkey::from_str(args.publickey.as_str())
            .map_err(|err| {
                ProgramError::Custom(err as u32)
            })?;

        ctx.accounts.player.player_id = pk;
        ctx.accounts.player.alive = args.alive;

        Ok(ctx.accounts.player)
    }

}

#[derive(Accounts)]
pub struct Component<'info> {
    #[account()]
    pub player: Account<'info, Player>,
}

#[derive(BoltSerialize, BoltDeserialize)]
struct Args {
    publickey: String,
    alive: bool,
}