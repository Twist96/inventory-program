use crate::state::{AssetInfo, Inventory, InventoryAccount};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

pub fn close_inventory(ctx: Context<CloseInventory>) -> Result<()> {
    ctx.accounts.inventory.remove_asset(&ctx.accounts.mint)?;
    Ok(())
}

#[derive(Accounts)]
pub struct CloseInventory<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
    mut,
    seeds = [Inventory::SEED_PREFIX.as_bytes()],
    bump,
    )]
    pub inventory: Account<'info, Inventory>,

    #[account(
    mut,
    seeds = [AssetInfo::SEED_PREFIX.as_bytes(), mint.key().as_ref()],
    bump,
    close = payer
    )]
    pub asset_info: Account<'info, AssetInfo>,
    pub mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}
