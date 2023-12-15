use bolt_lang::*;
use player::Player;

declare_id!("DNbUAbXqL2C43xpBYhTZVv7GncoUb83CqWVhsj9BqWsJ");

#[system]
#[program]
pub mod system_movement {
    use super::*;

    pub fn execute(ctx: Context<Component>, args_p: Vec<u8>) -> Result<Position> {
        let args = parse_args::<Args>(&args_p);

        let (dx, dy) = match args.direction {
            Direction::Left => (-1, 0),
            Direction::Right => (1, 0),
            Direction::Up => (0, 1),
            Direction::Down => (0, -1),
        };

        ctx.accounts.position.x += dx;
        ctx.accounts.position.y += dy;

        Ok(ctx.accounts.position)
    }
}

#[derive(Accounts)]
pub struct Component<'info> {
    #[account()]
    pub position: Account<'info, Player>,
}

#[derive(BoltSerialize, BoltDeserialize)]
struct Args {
    direction: Direction,
}

#[derive(BoltSerialize, BoltDeserialize)]
pub enum Direction {
    Left,
    Right,
    Up,
    Down,
}

