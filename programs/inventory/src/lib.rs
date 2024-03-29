mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("8oRGerutEMGTumnzzgxbsCEfLLkghC3cdT6EadZaPh3Q");

#[program]
pub mod inventory {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize(ctx)
    }

    pub fn create_inventory(ctx: Context<CreateInventory>, price: u64) -> Result<()> {
        instructions::create_inventory(ctx, price)
    }

    pub fn close_inventory(ctx: Context<CloseInventory>) -> Result<()> {
        instructions::close_inventory(ctx)
    }

    pub fn add_asset(ctx: Context<AddAsset>, amount: u64) -> Result<()> {
        instructions::add_asset(ctx, amount)
    }

    pub fn withdraw_asset(ctx: Context<WithdrawAsset>) -> Result<()> {
        instructions::withdraw_asset(ctx)
    }

    pub fn update_asset_info(
        ctx: Context<UpdateAssetInfo>,
        new_price: u64,
        new_usdc_account: Pubkey,
    ) -> Result<()> {
        instructions::update_asset_info(ctx, new_price, new_usdc_account)
    }

    pub fn buy_asset(ctx: Context<BuyAsset>, amount: u64) -> Result<()> {
        instructions::buy_asset(ctx, amount)
    }
}
