use anchor_lang::prelude::*;

declare_id!("34CUrzPkzNS4hV3u8CXMsM73pXnv3FFPHCk1WkVBcRwY");

#[program]
pub mod chainy {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
