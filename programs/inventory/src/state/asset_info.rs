use anchor_lang::prelude::*;

#[account]
pub struct AssetInfo {
    pub asset_key: Pubkey,
    pub price: u64,
    pub amount: u64,
    pub usdc_remit_account: Pubkey,
}

impl AssetInfo {
    pub fn new(asset_key: Pubkey, price: u64, usdc_remit_account: Pubkey) -> Self {
        Self {
            asset_key,
            price,
            amount: 0,
            usdc_remit_account,
        }
    }
}

impl AssetInfo {
    pub const SPACE: usize = std::mem::size_of::<AssetInfo>();
    pub const SEED_PREFIX: &'static str = "asset_info";
}
