mod instructions;
mod state;
mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("8QW6oBt7NvXN68Cy7yjKUGa6rFPi5EtMmXrp8hoUmwpw");

#[program]
pub mod inventory {
    use super::*;

    pub fn create_inventory(ctx: Context<CreateInventory>) -> Result<()> {
        instructions::create_inventory(ctx)
    }

    pub fn add_asset(ctx: Context<AddAsset>) -> Result<()> {
        instructions::add_asset(ctx)
    }
}
