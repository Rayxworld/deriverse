use anchor_lang::prelude::*;

declare_id!("Journal111111111111111111111111111111111111");

#[program]
pub mod deriverse_journal {
    use super::*;

    pub fn initialize_journal(ctx: Context<InitializeJournal>, trade_id: String, note: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = *ctx.accounts.user.key;
        journal_entry.trade_id = trade_id;
        journal_entry.note = note;
        journal_entry.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(trade_id: String)]
pub struct InitializeJournal<'info> {
    #[account(
        init, 
        payer = user, 
        space = 8 + 32 + 64 + 256 + 8, // disc + pubkey + trade_id + note + timestamp
        seeds = [b"journal", user.key().as_ref(), trade_id.as_bytes()],
        bump
    )]
    pub journal_entry: Account<'info, JournalEntry>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct JournalEntry {
    pub owner: Pubkey,
    pub trade_id: String,
    pub note: String,
    pub timestamp: i64,
}
