use bolt_lang::*;
use player::Player;

declare_id!("DNbUAbXqL2C43xpBYhTZVv7GncoUb83CqWVhsj9BqWsJ");

#[system]
#[program]
pub mod system_movement {
    use player::Facing;
    use super::*;

    pub fn execute(ctx: Context<Component>, args_p: Vec<u8>) -> Result<Position> {
        let args = parse_args::<Args>(&args_p);

        //let clock = Clock::get()?;
        let delta = 3;//1 + (clock.unix_timestamp.unsigned_abs() % 6) as i64;

        let (dx, dy) = match args.direction {
            Direction::Left => (-delta, 0),
            Direction::Right => (delta, 0),
            Direction::Up => (0, delta),
            Direction::Down => (0, -delta),
        };

        match args.direction {
            Direction::Down => {
               ctx.accounts.position.facing = Facing::Down;
            },
            Direction::Up => {
                ctx.accounts.position.facing = Facing::Up;
            },
            Direction::Right => {
                ctx.accounts.position.facing = Facing::Right;
            },
            Direction::Left => {
                ctx.accounts.position.facing = Facing::Left;
            },
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

