// -*- coding: utf-8 -*-
// English translations for the game
const EN_TRANSLATIONS = {
    // ============= UI ELEMENTS =============
    // Main menu
    'ui_play': 'Play',
    'ui_level': 'Lvl',
    'ui_shop': 'Shop',
    'ui_inventory': 'Inventory',
    'ui_market': 'Market',
    'ui_map': 'Locations',
    'ui_profile': 'Profile',
    'ui_collection': 'Encyclopedia',
    'ui_rating': 'Rating',
    'ui_trophies': 'Trophies',
    'ui_quests': 'Quests',
    'ui_rewards': 'Rewards',
    'ui_settings': 'Settings',
    
    // Main menu (without ui_ prefix for HomeScreen)
    'play': 'Play',
    'map': 'Locations',
    'shop': 'Shop',
    'inventory': 'Inventory',
    'market': 'Market',
    'profile': 'Profile',
    'collection': 'Encyclopedia',
    'rating': 'Rating',
    'trophies': 'Trophies',
    'quests': 'Quests',
    'rewards': 'Rewards',
    
    // Common buttons
    'ui_close': 'Close',
    'ui_buy': 'Buy',
    'ui_sell': 'Sell',
    'ui_sell_all': 'Sell All',
    'ui_equip': 'Equip',
    'ui_unequip': 'Unequip',
    'ui_repair': 'Repair',
    'ui_upgrade': 'Upgrade',
    'ui_back': 'Back',
    'ui_confirm': 'Confirm',
    'ui_cancel': 'Cancel',
    'ui_ok': 'OK',
    'ui_yes': 'Yes',
    'ui_no': 'No',
    
    // Shop tabs
    'ui_baits': 'Baits',
    'ui_hooks': 'Hooks',
    'ui_floats': 'Floats',
    'ui_lines': 'Lines',
    'ui_reels': 'Reels',
    'ui_rods': 'Rods',
    'ui_premium': 'Premium',
    'ui_purchases': 'Purchases',
    
    // Inventory tabs
    'ui_keepnet': 'Keepnet',
    
    // Common labels
    'ui_price': 'Price',
    'ui_quantity': 'Quantity',
    'ui_durability': 'Durability',
    'ui_weight': 'Weight',
    'ui_capacity': 'Capacity',
    'ui_equipped': 'Equipped',
    'ui_level_short': 'Lvl',
    'ui_coins': 'Coins',
    'ui_gems': 'Gems',
    
    // Fishing UI
    'ui_cast': 'Cast',
    'ui_reel': 'Reel',
    'ui_hook': 'Hook!',
    'ui_bite': 'Bite!',
    'ui_catch': 'Catch',
    'ui_escaped': 'Escaped',
    'ui_line_tension': 'Line Tension',
    'ui_fish_power': 'Fish Power',
    
    // Profile
    'ui_profile_title': 'PLAYER PROFILE',
    'ui_level': 'Level',
    'ui_total_fish_caught': 'Total Fish Caught',
    'ui_total_monsters_caught': 'Total Monsters Caught',
    'ui_total_items_caught': 'Total Items Caught',
    'ui_heaviest_fish': 'Heaviest Fish',
    'ui_quests_completed': 'Quests Completed',
    'ui_locations_unlocked': 'Locations Unlocked',
    'ui_mastery': 'Mastery',
    'ui_total_earned': 'Total Earned',
    'ui_play_time': 'Play Time',
    'ui_mastery_info': 'ℹ️ Mastery',
    'ui_mastery_desc': 'Ratio of caught fish to escaped',
    'ui_mastery_ratio': 'Ratio of caught fish to escaped: {caught} / {escaped}',
    'ui_none_yet': 'None yet',
    'ui_kg': 'kg',
    
    // Market
    'ui_market_title': 'MARKET',
    'ui_price_update': 'Price update in',
    'ui_keepnet_empty': 'Keepnet is empty',
    'ui_no_trophies': 'No trophies',
    'ui_fish_sold': 'fish sold!',
    
    // Quests
    'ui_daily_quests': 'Daily Quests',
    'ui_weekly_quests': 'Weekly Quests',
    'ui_quest_catch': 'Catch',
    'ui_quest_progress': 'Progress',
    'ui_quest_reward': 'Reward',
    'ui_quest_claim': 'Claim',
    'ui_quest_claimed': 'Claimed',
    'ui_quest_skip_day': 'Skip Day',
    'ui_quest_skip_week': 'Skip Week',
    'ui_quest_reset_in': 'Reset in',
    
    // Daily Rewards
    'ui_daily_rewards': 'Daily Rewards',
    'ui_day': 'Day',
    'ui_claim_reward': 'Claim Reward',
    'ui_already_claimed': 'Already claimed today',
    'ui_come_back_tomorrow': 'Come back tomorrow',
    
    // Collection
    'ui_collection_title': 'ENCYCLOPEDIA',
    'ui_fish_tab': 'Fish',
    'ui_monsters_tab': 'Monsters',
    'ui_items_tab': 'Items',
    'ui_caught': 'Caught',
    'ui_not_caught': 'Not caught',
    'ui_unknown': 'Unknown',
    
    // Trophies
    'ui_trophies_title': 'TROPHIES',
    'ui_create_trophy': 'Create Trophy',
    'ui_install': 'Install',
    'ui_uninstall': 'Remove',
    'ui_unlock_slot': 'Unlock Slot',
    'ui_slot_locked': 'Slot Locked',
    
    // Messages
    'msg_not_enough_coins': 'Not enough coins',
    'msg_not_enough_gems': 'Not enough gems',
    'msg_purchase_success': 'Purchase successful!',
    'msg_repair_success': 'Repair successful!',
    'msg_upgrade_success': 'Upgrade successful!',
    'msg_quest_completed': 'Quest completed!',
    'msg_reward_claimed': 'Reward claimed!',
    'msg_level_up': 'Level Up!',
    'msg_new_location': 'New location unlocked!',
    'msg_keepnet_full': 'Keepnet is full!',
    'msg_line_broken': 'Line broken!',
    'msg_fish_escaped': 'Fish escaped!',
    
    // Time of day
    'time_morning': 'Morning',
    'time_day': 'Day',
    'time_evening': 'Evening',
    'time_night': 'Night',
    'time_morning_evening': 'Morning/Evening',
    'time_evening_night': 'Evening/Night',
    'time_midnight': 'Midnight',
    'time_fog': 'Fog',
    'time_any': 'Any time',
    
    // Bite styles (fish)
    'bite_tap_tap': 'Tap-tap (small touches)',
    'bite_smooth_sinking': 'Smooth sinking',
    'bite_false_start': 'False start (took/dropped)',
    'bite_series_hits': 'Series of hits (burst)',
    'bite_trophy_jerk': 'Trophy jerk',
    'bite_bottom_weight': 'Bottom weight (like snag)',
    'bite_sharp_side': 'Sharp side escape',
    'bite_lightning_attack': 'Lightning attack',
    
    // Bite styles (monsters)
    'bite_furious_jerk': 'Furious jerk',
    'bite_drag_bottom': 'Dragging to bottom',
    'bite_electric_shock': 'Electric shock',
    'bite_bottom_heavy': 'Bottom heaviness',
    'bite_mad_attack': 'Mad attack',
    'bite_apocalypse': 'Apocalypse',
    
    // Fish roles
    'role_peace': 'Peaceful',
    'role_pred': 'Predator',
    'role_bottom': 'Bottom',
    
    // Fish rarity
    'rarity_common': 'Common',
    'rarity_uncommon': 'Uncommon',
    'rarity_rare': 'Rare',
    'rarity_epic': 'Epic',
    'rarity_legendary': 'Legendary',
    
    // Bite styles
    'bite_tap': 'Tap-tap (small touches)',
    'bite_sink': 'Smooth sinking',
    'bite_false': 'False start (took/dropped)',
    'bite_series': 'Series of hits',
    'bite_side': 'Sharp side escape',
    'bite_lightning': 'Lightning attack',
    'bite_bottom': 'Bottom weight (like snag)',
    'bite_trophy': 'Trophy jerk',
    
    // Russian bite style translations
    'bite_РўС‹Рє-С‚С‹Рє (РјРµР»РєРёРµ РєР°СЃР°РЅРёСЏ)': 'Tap-tap (small touches)',
    'bite_РџР»Р°РІРЅРѕРµ РїСЂРёС‚Р°РїР»РёРІР°РЅРёРµ': 'Smooth sinking',
    'bite_Р¤Р°Р»СЊСЃС‚Р°СЂС‚ (РІР·СЏР»/Р±СЂРѕСЃРёР»)': 'False start (took/dropped)',
    'bite_РЎРµСЂРёСЏ СѓРґР°СЂРѕРІ (РґСЂРѕР±СЊ)': 'Series of hits',
    'bite_Р РµР·РєРёР№ СѓС…РѕРґ РІ СЃС‚РѕСЂРѕРЅСѓ': 'Sharp side escape',
    'bite_РњРѕР»РЅРёРµРЅРѕСЃРЅР°СЏ Р°С‚Р°РєР°': 'Lightning attack',
    'bite_Р”РѕРЅРЅР°СЏ С‚СЏР¶РµСЃС‚СЊ (РєР°Рє Р·Р°С†РµРї)': 'Bottom weight (like snag)',
    'bite_РўСЂРѕС„РµР№РЅС‹Р№ СЂС‹РІРѕРє': 'Trophy jerk',
    
    // Russian time of day translations
    'time_РЈС‚СЂРѕ': 'Morning',
    'time_Р”РµРЅСЊ': 'Day',
    'time_Р’РµС‡РµСЂ': 'Evening',
    'time_РќРѕС‡СЊ': 'Night',
    'time_РЈС‚СЂРѕ/Р’РµС‡РµСЂ': 'Morning/Evening',
    'time_Р’РµС‡РµСЂ/РќРѕС‡СЊ': 'Evening/Night',
    'time_Р›СЋР±РѕРµ': 'Any time',
    
    // Gear types
    'gear_rod': 'Rod',
    'gear_line': 'Line',
    'gear_float': 'Float',
    'gear_hook': 'Hook',
    'gear_reel': 'Reel',
    'gear_bait': 'Bait',
    
    // Bait types (technical names - DO NOT TRANSLATE)
    // These are used in code and should remain in English
    
    // ============= TUTORIAL =============
    'tutorial_cast': 'Click on the water to cast',
    'tutorial_hook': 'Click to hook the fish!',
    'tutorial_reel': 'Hold the reel! Watch the tension!',
    'tutorial_ui_gear': 'Gear panel - manage your equipment',
    'tutorial_ui_bonuses': 'Bonuses - use power-ups',
    'tutorial_ui_keepnet': 'Keepnet - store fish and sell them at the market',
    'tutorial_ui_back': 'Exit - return to main menu',
    'tutorial_complete': 'Tutorial complete! Good luck fishing!',
    
    // ============= ZONES =============
};

// ============= ADDITIONAL MISSING TRANSLATIONS =============
// Level abbreviation (РЈСЂ. -> Lv.)
EN_TRANSLATIONS['ui_level_abbr'] = 'Lv.';

// Fishing Tips UI
EN_TRANSLATIONS['ui_for_ad'] = 'For Ad';
EN_TRANSLATIONS['ui_for_marks'] = 'For Marks';
EN_TRANSLATIONS['ui_special_offer'] = 'Special Offer';
EN_TRANSLATIONS['ui_continue'] = 'Continue';
EN_TRANSLATIONS['ui_watched'] = 'Watched';
EN_TRANSLATIONS['ui_watch'] = 'Watch';
EN_TRANSLATIONS['ui_buy_for'] = 'Buy for';
EN_TRANSLATIONS['ui_bought'] = 'Bought';

// Fishing Tips (without ui_ prefix - used in FishingTipsSystem)
EN_TRANSLATIONS['for_ad'] = 'For Ad';
EN_TRANSLATIONS['for_marks'] = 'For Marks';
EN_TRANSLATIONS['special_offer'] = 'Special Offer';
EN_TRANSLATIONS['buy_for'] = 'Buy for';
EN_TRANSLATIONS['buy'] = 'Buy';

// Fishing Tips rewards
EN_TRANSLATIONS['reward_price_boost_5'] = '+5% to fish sale';
EN_TRANSLATIONS['reward_price_boost_10'] = '+10% to sale';
EN_TRANSLATIONS['reward_xp_boost_5'] = '+5% to XP';
EN_TRANSLATIONS['reward_xp_boost_10'] = '+10% to XP';
EN_TRANSLATIONS['reward_rare_fish_boost'] = '+3% to rare fish';
EN_TRANSLATIONS['reward_duration_until_exit'] = 'Until exit';
EN_TRANSLATIONS['reward_duration_once'] = 'One-time';

// Gear stats labels
EN_TRANSLATIONS['gear_level'] = 'Level';
EN_TRANSLATIONS['gear_durability'] = 'Durability';
EN_TRANSLATIONS['durability_excellent'] = 'Excellent';
EN_TRANSLATIONS['durability_good'] = 'Good';
EN_TRANSLATIONS['durability_worn'] = 'Worn';
EN_TRANSLATIONS['durability_critical'] = 'Critical';
EN_TRANSLATIONS['durability_unknown'] = 'Unknown';
EN_TRANSLATIONS['gear_power'] = 'Power';
EN_TRANSLATIONS['gear_accuracy'] = 'Accuracy';
EN_TRANSLATIONS['gear_hook_bonus'] = 'Hook Bonus';
EN_TRANSLATIONS['gear_cast_bonus'] = 'Cast Bonus';
EN_TRANSLATIONS['gear_test_kg'] = 'Test (kg)';
EN_TRANSLATIONS['gear_resistance'] = 'Resistance';
EN_TRANSLATIONS['gear_type'] = 'Type';
EN_TRANSLATIONS['gear_sensitivity'] = 'Sensitivity';
EN_TRANSLATIONS['gear_stability'] = 'Stability';
EN_TRANSLATIONS['gear_hold'] = 'Hold';
EN_TRANSLATIONS['gear_penetration'] = 'Penetration';
EN_TRANSLATIONS['gear_size'] = 'Size';
EN_TRANSLATIONS['gear_drag_kg'] = 'Drag (kg)';
EN_TRANSLATIONS['gear_speed'] = 'Speed';
EN_TRANSLATIONS['gear_smoothness'] = 'Smoothness';
EN_TRANSLATIONS['gear_price'] = 'Price';
EN_TRANSLATIONS['gear_quantity'] = 'Quantity';
EN_TRANSLATIONS['gear_target'] = 'Target';
EN_TRANSLATIONS['gear_unlock'] = 'Unlock';
EN_TRANSLATIONS['gear_equipped'] = '✔ Equipped';
EN_TRANSLATIONS['equipped'] = 'equipped!';

// Gear types
EN_TRANSLATIONS['gear_type_mono'] = 'Mono';
EN_TRANSLATIONS['gear_type_fluoro_mono'] = 'Fluoro/Mono';
EN_TRANSLATIONS['gear_type_braid'] = 'Braid';
EN_TRANSLATIONS['gear_type_universal'] = 'Universal';
EN_TRANSLATIONS['gear_target_various'] = 'Various fish';

// Inventory tabs
EN_TRANSLATIONS['ui_rods_tab'] = 'Rods';
EN_TRANSLATIONS['ui_lines_tab'] = 'Lines';
EN_TRANSLATIONS['ui_floats_tab'] = 'Floats';
EN_TRANSLATIONS['ui_hooks_tab'] = 'Hooks';
EN_TRANSLATIONS['ui_reels_tab'] = 'Reels';
EN_TRANSLATIONS['ui_baits_tab'] = 'Baits';
EN_TRANSLATIONS['ui_keepnet_tab'] = 'Keepnet';

// Inventory tabs (without ui_ prefix)
EN_TRANSLATIONS['rods_tab'] = 'Rods';
EN_TRANSLATIONS['lines_tab'] = 'Lines';
EN_TRANSLATIONS['floats_tab'] = 'Floats';
EN_TRANSLATIONS['hooks_tab'] = 'Hooks';
EN_TRANSLATIONS['reels_tab'] = 'Reels';
EN_TRANSLATIONS['baits_tab'] = 'Baits';
EN_TRANSLATIONS['keepnet_tab'] = 'Keepnet';

// Keepnet
EN_TRANSLATIONS['ui_keepnet_name'] = 'Keepnet';
EN_TRANSLATIONS['ui_keepnet_desc'] = 'Keepnet for storing caught fish. Upgrade capacity for money.';
EN_TRANSLATIONS['ui_current_capacity'] = 'Current Capacity';
EN_TRANSLATIONS['ui_keepnet_empty_text'] = 'Keepnet is empty';
EN_TRANSLATIONS['ui_keepnet_icon'] = 'Keepnet';

// Keepnet (without ui_ prefix)
EN_TRANSLATIONS['keepnet_name'] = 'Keepnet';
EN_TRANSLATIONS['keepnet_desc'] = 'Keepnet for storing caught fish. Upgrade capacity for money.';
EN_TRANSLATIONS['keepnet_icon'] = 'Keepnet';
EN_TRANSLATIONS['select_item'] = 'Select item';
EN_TRANSLATIONS['not_required'] = 'Not required';
EN_TRANSLATIONS['fish_types'] = 'Fish Types';
EN_TRANSLATIONS['no_description'] = 'No description';
EN_TRANSLATIONS['price'] = 'Price';
EN_TRANSLATIONS['experience'] = 'Experience';
EN_TRANSLATIONS['time'] = 'Time';
EN_TRANSLATIONS['and_more'] = 'and more';
EN_TRANSLATIONS['pcs'] = 'pcs';
EN_TRANSLATIONS['release_all'] = 'Release All';

// Market
EN_TRANSLATIONS['ui_keepnet_button'] = 'Keepnet';
EN_TRANSLATIONS['ui_trophies_button'] = 'Trophies';
EN_TRANSLATIONS['ui_no_trophies_text'] = 'No trophies';

// Market - additional translations
EN_TRANSLATIONS['keepnet_button'] = 'Keepnet';
EN_TRANSLATIONS['trophies_button'] = 'Trophies';
EN_TRANSLATIONS['keepnet_empty_text'] = 'Keepnet is empty';
EN_TRANSLATIONS['no_trophies_text'] = 'No trophies';
EN_TRANSLATIONS['market_select_fish'] = 'Select fish to sell';
EN_TRANSLATIONS['market_base_price'] = 'Base price:';
EN_TRANSLATIONS['market_current_price'] = 'Current price:';
EN_TRANSLATIONS['market_total'] = 'Total:';
EN_TRANSLATIONS['sell_all'] = 'Sell All';
EN_TRANSLATIONS['weight'] = 'Weight';
EN_TRANSLATIONS['kg'] = 'kg';
EN_TRANSLATIONS['price_update_in'] = 'Price update in';
EN_TRANSLATIONS['fish_sold'] = 'fish sold!';
EN_TRANSLATIONS['trophies_sold'] = 'trophies sold!';

// Rating UI
EN_TRANSLATIONS['ui_rating_title'] = 'Player Rating';
EN_TRANSLATIONS['ui_rating_levels'] = '📊 Levels';
EN_TRANSLATIONS['ui_rating_weight'] = '⚖️ Fish Weight';
EN_TRANSLATIONS['ui_rating_total_fish'] = 'Total\nCaught';
EN_TRANSLATIONS['ui_rating_businessman'] = '💰 Businessman';

// Trophy UI
EN_TRANSLATIONS['trophy_drag_hint'] = 'Hold to drag';
EN_TRANSLATIONS['trophy_craft_button'] = 'Craft Trophy';
EN_TRANSLATIONS['trophy_sell_button'] = 'Sell';
EN_TRANSLATIONS['trophy_close_button'] = 'Close';

// Quest descriptions
EN_TRANSLATIONS['quest_catch_fish'] = 'Catch:';
EN_TRANSLATIONS['quest_find_rare_item'] = 'Find rare items:';
EN_TRANSLATIONS['quest_catch_monster'] = 'Catch monsters:';
EN_TRANSLATIONS['quest_unknown'] = 'Unknown quest';
EN_TRANSLATIONS['quest_pieces_short'] = 'pcs.';

// Quest messages
EN_TRANSLATIONS['quest_not_found'] = 'Quest not found';
EN_TRANSLATIONS['quest_reward_claimed'] = 'Reward already claimed';
EN_TRANSLATIONS['quest_not_completed'] = 'Quest not completed';
EN_TRANSLATIONS['quest_not_enough_gems'] = 'Not enough gems';
EN_TRANSLATIONS['quest_daily_updated'] = 'Daily quests updated!';
EN_TRANSLATIONS['quest_weekly_updated'] = 'Weekly quests updated!';

// Fish rarity translations
EN_TRANSLATIONS['rarity_Common'] = 'Common';
EN_TRANSLATIONS['rarity_Uncommon'] = 'Uncommon';
EN_TRANSLATIONS['rarity_Rare'] = 'Rare';
EN_TRANSLATIONS['rarity_Epic'] = 'Epic';
EN_TRANSLATIONS['rarity_Legendary'] = 'Legendary';
EN_TRANSLATIONS['rarity_label'] = 'Rarity:';

// Russian rarity values (for backward compatibility)
EN_TRANSLATIONS['rarity_РћР±С‹С‡РЅР°СЏ'] = 'Common';
EN_TRANSLATIONS['rarity_РќРµРѕР±С‹С‡РЅР°СЏ'] = 'Uncommon';
EN_TRANSLATIONS['rarity_Р РµРґРєР°СЏ'] = 'Rare';
EN_TRANSLATIONS['rarity_Р­РїРёС‡РµСЃРєР°СЏ'] = 'Epic';
EN_TRANSLATIONS['rarity_Р›РµРіРµРЅРґР°СЂРЅР°СЏ'] = 'Legendary';

// Shop UI
EN_TRANSLATIONS['shop_fish_types'] = 'Fish Types';
EN_TRANSLATIONS['shop_select_item'] = 'Select item';
EN_TRANSLATIONS['shop_price'] = 'Price:';
EN_TRANSLATIONS['shop_regular_price'] = 'Regular price:';
EN_TRANSLATIONS['insufficient'] = 'Insufficient';
EN_TRANSLATIONS['ui_rating_antirating'] = '💔 Anti-rating';
EN_TRANSLATIONS['ui_loading'] = 'Loading...';
EN_TRANSLATIONS['ui_loading_rating'] = 'Loading rating...';
EN_TRANSLATIONS['ui_your_position'] = 'Your position:';
EN_TRANSLATIONS['ui_top_by_level'] = 'Top players by level';
EN_TRANSLATIONS['ui_top_by_weight'] = 'Top by heaviest fish weight';
EN_TRANSLATIONS['ui_top_by_total_fish'] = 'Top by number of caught fish';
EN_TRANSLATIONS['ui_top_by_coins'] = 'Top by earned coins';
EN_TRANSLATIONS['ui_top_by_fails'] = 'Top by number of fish escapes';
EN_TRANSLATIONS['ui_record'] = 'Record';
EN_TRANSLATIONS['ui_caught'] = 'Caught';
EN_TRANSLATIONS['ui_earned'] = 'Earned';
EN_TRANSLATIONS['ui_escapes'] = 'Escapes';
EN_TRANSLATIONS['ui_fish_plural'] = 'fish';
EN_TRANSLATIONS['ui_close'] = 'Close';

// Rating translations (without ui_ prefix - used in RatingUI.js and RatingSystem.js)
EN_TRANSLATIONS['rating_title'] = 'Player Rating';
EN_TRANSLATIONS['rating_levels'] = 'Levels';
EN_TRANSLATIONS['rating_weight'] = 'Fish Weight';
EN_TRANSLATIONS['rating_total_fish'] = 'Total\nCaught';
EN_TRANSLATIONS['rating_businessman'] = 'Businessman';
EN_TRANSLATIONS['rating_antirating'] = 'Anti-rating';
EN_TRANSLATIONS['loading'] = 'Loading...';
EN_TRANSLATIONS['loading_rating'] = 'Loading rating...';
EN_TRANSLATIONS['you'] = 'You';
EN_TRANSLATIONS['player'] = 'Player';
EN_TRANSLATIONS['not_authorized'] = 'Not authorized';
EN_TRANSLATIONS['your_position'] = 'Your position:';
EN_TRANSLATIONS['top_by_level'] = 'Top players by level';
EN_TRANSLATIONS['top_by_weight'] = 'Top by heaviest fish weight';
EN_TRANSLATIONS['top_by_total_fish'] = 'Top by number of caught fish';
EN_TRANSLATIONS['top_by_coins'] = 'Top by earned coins';
EN_TRANSLATIONS['top_by_fails'] = 'Top by number of fish escapes';
EN_TRANSLATIONS['record'] = 'Record';
EN_TRANSLATIONS['caught'] = 'Caught';
EN_TRANSLATIONS['earned'] = 'Earned';
EN_TRANSLATIONS['escapes'] = 'Escapes';
EN_TRANSLATIONS['fish_plural'] = 'fish';
EN_TRANSLATIONS['close'] = 'Close';
EN_TRANSLATIONS['level'] = 'Level';
EN_TRANSLATIONS['level_abbr'] = 'Lv.';
EN_TRANSLATIONS['leaderboard_auth_required'] = 'Log in to view the rating';
EN_TRANSLATIONS['leaderboard_auth_hint'] = 'Rating is only available to authorized players';
EN_TRANSLATIONS['leaderboard_empty'] = 'Rating is empty';
EN_TRANSLATIONS['leaderboard_empty_hint'] = 'Play and become the first on the list!';

// Gear bundles (IAP)
EN_TRANSLATIONS['bundle_starter_name'] = 'Starter Bundle';
EN_TRANSLATIONS['bundle_starter_desc'] = 'Level 4 Gear';
EN_TRANSLATIONS['bundle_advanced_name'] = 'Advanced Bundle';
EN_TRANSLATIONS['bundle_advanced_desc'] = 'Level 9 Gear';
EN_TRANSLATIONS['bundle_master_name'] = 'Master Bundle';
EN_TRANSLATIONS['bundle_master_desc'] = 'Level 14 Gear';

// Fishing UI panels
EN_TRANSLATIONS['ui_gear_panel'] = 'Gear';
EN_TRANSLATIONS['ui_bonuses_panel'] = 'Bonuses';
EN_TRANSLATIONS['ui_sonar'] = 'Sonar';
EN_TRANSLATIONS['ui_back_to_menu'] = 'Back';
EN_TRANSLATIONS['ui_retract_rod'] = 'Retract';

// Inventory and Shop translations
EN_TRANSLATIONS['rods'] = 'Rods';
EN_TRANSLATIONS['lines'] = 'Lines';
EN_TRANSLATIONS['floats'] = 'Floats';
EN_TRANSLATIONS['hooks'] = 'Hooks';
EN_TRANSLATIONS['reels'] = 'Reels';
EN_TRANSLATIONS['baits'] = 'Baits';
EN_TRANSLATIONS['keepnet'] = 'Keepnet';
EN_TRANSLATIONS['premium'] = 'Premium';
EN_TRANSLATIONS['purchases'] = 'Purchases';
EN_TRANSLATIONS['shop'] = 'SHOP';
EN_TRANSLATIONS['inventory'] = 'INVENTORY';
EN_TRANSLATIONS['type'] = 'Type';
EN_TRANSLATIONS['quantity'] = 'Quantity';
EN_TRANSLATIONS['capacity'] = 'Capacity';
EN_TRANSLATIONS['current_capacity'] = 'Current Capacity';
EN_TRANSLATIONS['next_level'] = 'Next Level';
EN_TRANSLATIONS['upgrade_price'] = 'Upgrade Price';
EN_TRANSLATIONS['unlock_level'] = 'Unlock Level';
EN_TRANSLATIONS['role'] = 'Role';
EN_TRANSLATIONS['targets'] = 'Targets';
EN_TRANSLATIONS['equip'] = 'Equip';
EN_TRANSLATIONS['unequip'] = 'Unequip';
EN_TRANSLATIONS['repair'] = 'Repair';
EN_TRANSLATIONS['sell'] = 'Sell';
EN_TRANSLATIONS['upgrade'] = 'Upgrade';
EN_TRANSLATIONS['shop_level'] = 'Level';
EN_TRANSLATIONS['shop_durability'] = 'Durability';
EN_TRANSLATIONS['shop_type'] = 'Type';
EN_TRANSLATIONS['shop_breaking_load'] = 'Breaking Load';
EN_TRANSLATIONS['hook_size'] = 'Size';

// Bait types and targets
EN_TRANSLATIONS['bait_type_plant'] = 'Plant';
EN_TRANSLATIONS['bait_type_animal'] = 'Animal';
EN_TRANSLATIONS['bait_type_sea'] = 'Sea';
EN_TRANSLATIONS['bait_type_universal'] = 'Universal';

// Bait roles
EN_TRANSLATIONS['bait_role_начальная'] = 'Starter';
EN_TRANSLATIONS['bait_role_универсал'] = 'Universal';
EN_TRANSLATIONS['bait_role_карповые'] = 'Carp';
EN_TRANSLATIONS['bait_role_карповые+'] = 'Carp+';
EN_TRANSLATIONS['bait_role_белая_рыба'] = 'White Fish';
EN_TRANSLATIONS['bait_role_горная_рыба'] = 'Mountain Fish';
EN_TRANSLATIONS['bait_role_хищник'] = 'Predator';
EN_TRANSLATIONS['bait_role_болота'] = 'Swamp';
EN_TRANSLATIONS['bait_role_берег'] = 'Shore';
EN_TRANSLATIONS['bait_role_море/риф'] = 'Sea/Reef';
EN_TRANSLATIONS['bait_role_крупный_хищник'] = 'Large Predator';
EN_TRANSLATIONS['bait_role_дно/глубина'] = 'Bottom/Deep';
EN_TRANSLATIONS['bait_role_троллинговая'] = 'Trolling';
EN_TRANSLATIONS['bait_role_трофейная'] = 'Trophy';
EN_TRANSLATIONS['bait_role_мелкая_рыба'] = 'Small Fish';
EN_TRANSLATIONS['bait_role_мирная_рыба'] = 'Peaceful Fish';
EN_TRANSLATIONS['bait_role_поверхностная'] = 'Surface';
EN_TRANSLATIONS['bait_role_крупная_поверхностная'] = 'Large Surface';

EN_TRANSLATIONS['bait_target_peaceful_small'] = 'peaceful small fish';
EN_TRANSLATIONS['bait_target_perch_tench_trout'] = 'perch/tench/trout';
EN_TRANSLATIONS['bait_target_bream_carp'] = 'bream/carp';
EN_TRANSLATIONS['bait_target_carp_grass_carp'] = 'carp/grass carp';
EN_TRANSLATIONS['bait_target_ide_undermouth_bleak'] = 'ide/undermouth/bleak';
EN_TRANSLATIONS['bait_target_grayling_trout'] = 'grayling/trout';
EN_TRANSLATIONS['bait_target_pike_zander'] = 'pike/zander';
EN_TRANSLATIONS['bait_target_snakehead_gar'] = 'snakehead/gar';
EN_TRANSLATIONS['bait_target_seabass_snapper'] = 'seabass/snapper';
EN_TRANSLATIONS['bait_target_amberjack_reef'] = 'amberjack/reef fish';
EN_TRANSLATIONS['bait_target_catfish_sharks'] = 'catfish/sharks';
EN_TRANSLATIONS['bait_target_halibut_cod'] = 'halibut/cod';
EN_TRANSLATIONS['bait_target_tuna_wahoo'] = 'tuna/wahoo';
EN_TRANSLATIONS['bait_target_sharks_swordfish'] = 'sharks/swordfish';
EN_TRANSLATIONS['bait_target_roach_crucian_bleak'] = 'roach/crucian/bleak';
EN_TRANSLATIONS['bait_target_crucian_bream_carp'] = 'crucian/bream/carp';
EN_TRANSLATIONS['bait_target_roach_bleak_undermouth'] = 'roach/bleak/undermouth';
EN_TRANSLATIONS['bait_target_carp_wild_carp_grass_carp'] = 'carp/wild carp/grass carp';
EN_TRANSLATIONS['bait_target_bream_ide_roach'] = 'bream/ide/roach';
EN_TRANSLATIONS['bait_target_chub_ide_asp'] = 'chub/ide/asp';
EN_TRANSLATIONS['bait_target_asp_chub_trout'] = 'asp/chub/trout';

// Bait translations (21 baits)
// Bait 1 - Bread
EN_TRANSLATIONS['bait_1_name'] = 'Bread';
EN_TRANSLATIONS['bait_1_type'] = 'Plant';
EN_TRANSLATIONS['bait_1_targets'] = 'peaceful small fish';

// Bait 2 - Worm
EN_TRANSLATIONS['bait_2_name'] = 'Worm';
EN_TRANSLATIONS['bait_2_type'] = 'Animal';
EN_TRANSLATIONS['bait_2_targets'] = 'perch/tench/trout';

// Bait 3 - Dough/Porridge
EN_TRANSLATIONS['bait_3_name'] = 'Dough/Porridge';
EN_TRANSLATIONS['bait_3_type'] = 'Plant';
EN_TRANSLATIONS['bait_3_targets'] = 'bream/carp';

// Bait 4 - Corn
EN_TRANSLATIONS['bait_4_name'] = 'Corn';
EN_TRANSLATIONS['bait_4_type'] = 'Plant';
EN_TRANSLATIONS['bait_4_targets'] = 'carp/grass carp';

// Bait 5 - Maggot
EN_TRANSLATIONS['bait_5_name'] = 'Maggot';
EN_TRANSLATIONS['bait_5_type'] = 'Animal';
EN_TRANSLATIONS['bait_5_targets'] = 'ide/undermouth/bleak';

// Bait 6 - Insect (Fly)
EN_TRANSLATIONS['bait_6_name'] = 'Insect (Fly)';
EN_TRANSLATIONS['bait_6_type'] = 'Animal';
EN_TRANSLATIONS['bait_6_targets'] = 'grayling/trout';

// Bait 7 - Live Bait (small fish)
EN_TRANSLATIONS['bait_7_name'] = 'Live Bait (small fish)';
EN_TRANSLATIONS['bait_7_type'] = 'Animal';
EN_TRANSLATIONS['bait_7_targets'] = 'pike/zander';

// Bait 8 - Frog
EN_TRANSLATIONS['bait_8_name'] = 'Frog';
EN_TRANSLATIONS['bait_8_type'] = 'Animal';
EN_TRANSLATIONS['bait_8_targets'] = 'snakehead/gar';

// Bait 9 - Shrimp
EN_TRANSLATIONS['bait_9_name'] = 'Shrimp';
EN_TRANSLATIONS['bait_9_type'] = 'Sea';
EN_TRANSLATIONS['bait_9_targets'] = 'seabass/snapper';

// Bait 10 - Squid
EN_TRANSLATIONS['bait_10_name'] = 'Squid';
EN_TRANSLATIONS['bait_10_type'] = 'Sea';
EN_TRANSLATIONS['bait_10_targets'] = 'amberjack/reef fish';

// Bait 11 - Fish Fillet
EN_TRANSLATIONS['bait_11_name'] = 'Fish Fillet';
EN_TRANSLATIONS['bait_11_type'] = 'Animal/Sea';
EN_TRANSLATIONS['bait_11_targets'] = 'catfish/sharks';

// Bait 12 - Crab Meat
EN_TRANSLATIONS['bait_12_name'] = 'Crab Meat';
EN_TRANSLATIONS['bait_12_type'] = 'Sea';
EN_TRANSLATIONS['bait_12_targets'] = 'halibut/cod';

// Bait 13 - Bonito Strip
EN_TRANSLATIONS['bait_13_name'] = 'Bonito Strip';
EN_TRANSLATIONS['bait_13_type'] = 'Sea';
EN_TRANSLATIONS['bait_13_targets'] = 'tuna/wahoo';

// Bait 14 - Octopus Pieces
EN_TRANSLATIONS['bait_14_name'] = 'Octopus Pieces';
EN_TRANSLATIONS['bait_14_type'] = 'Sea';
EN_TRANSLATIONS['bait_14_targets'] = 'sharks/swordfish';

// Bait 15 - Bloodworm
EN_TRANSLATIONS['bait_15_name'] = 'Bloodworm';
EN_TRANSLATIONS['bait_15_type'] = 'Animal';
EN_TRANSLATIONS['bait_15_targets'] = 'roach/crucian/bleak';

// Bait 16 - Pearl Barley
EN_TRANSLATIONS['bait_16_name'] = 'Pearl Barley';
EN_TRANSLATIONS['bait_16_type'] = 'Plant';
EN_TRANSLATIONS['bait_16_targets'] = 'crucian/bream/carp';

// Bait 17 - Semolina
EN_TRANSLATIONS['bait_17_name'] = 'Semolina';
EN_TRANSLATIONS['bait_17_type'] = 'Plant';
EN_TRANSLATIONS['bait_17_targets'] = 'roach/bleak/undermouth';

// Bait 18 - Peas
EN_TRANSLATIONS['bait_18_name'] = 'Peas';
EN_TRANSLATIONS['bait_18_type'] = 'Plant';
EN_TRANSLATIONS['bait_18_targets'] = 'carp/wild carp/grass carp';

// Bait 19 - Wheat
EN_TRANSLATIONS['bait_19_name'] = 'Wheat';
EN_TRANSLATIONS['bait_19_type'] = 'Plant';
EN_TRANSLATIONS['bait_19_targets'] = 'bream/ide/roach';

// Bait 20 - Grasshopper
EN_TRANSLATIONS['bait_20_name'] = 'Grasshopper';
EN_TRANSLATIONS['bait_20_type'] = 'Animal';
EN_TRANSLATIONS['bait_20_targets'] = 'chub/ide/asp';

// Bait 21 - Locust
EN_TRANSLATIONS['bait_21_name'] = 'Locust';
EN_TRANSLATIONS['bait_21_type'] = 'Animal';
EN_TRANSLATIONS['bait_21_targets'] = 'asp/chub/trout';

// Export for use in LocalizationSystem
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EN_TRANSLATIONS };
}

// ============= FISH TRANSLATIONS (120 fish) =============
// Fish names and descriptions
// Zone 1 - Village Pond
EN_TRANSLATIONS['fish_1_name'] = 'Roach';
EN_TRANSLATIONS['fish_1_desc'] = 'Cautious peaceful fish preferring still water. Bites with small touches, especially active during daytime.';
EN_TRANSLATIONS['fish_2_name'] = 'Crucian Carp';
EN_TRANSLATIONS['fish_2_desc'] = 'Bottom peaceful fish inhabiting ponds and lakes. Bites smoothly, sinking the float, most active in evening hours.';
EN_TRANSLATIONS['fish_3_name'] = 'Rudd';
EN_TRANSLATIONS['fish_3_desc'] = 'Schooling fish with cautious behavior. Often takes and drops the bait, requires patience when hooking.';
EN_TRANSLATIONS['fish_4_name'] = 'Perch';
EN_TRANSLATIONS['fish_4_desc'] = 'Active predator attacking bait with series of short strikes. Inhabits coastal zones, hunts during daytime.';
EN_TRANSLATIONS['fish_5_name'] = 'White Bream';
EN_TRANSLATIONS['fish_5_desc'] = 'Peaceful schooling fish preferring quiet backwaters. Bites smoothly, especially active in evening time.';
EN_TRANSLATIONS['fish_6_name'] = 'Trophy Crucian';
EN_TRANSLATIONS['fish_6_desc'] = 'Large trophy crucian coming out to feed at night. Resists with powerful jerks when fighting.';

// Zone 2 - Carp Lake
EN_TRANSLATIONS['fish_7_name'] = 'Tench';
EN_TRANSLATIONS['fish_7_desc'] = 'Bottom peaceful fish inhabiting overgrown waters. Bites smoothly, most active in morning and evening.';
EN_TRANSLATIONS['fish_8_name'] = 'Bream';
EN_TRANSLATIONS['fish_8_desc'] = 'Large bottom fish, bites like a snag. Prefers evening time, resists with the weight of its body.';
EN_TRANSLATIONS['fish_9_name'] = 'Silver Crucian';
EN_TRANSLATIONS['fish_9_desc'] = 'Cautious peaceful fish with silver scales. Often tests the bait before swallowing, active in evening.';
EN_TRANSLATIONS['fish_10_name'] = 'Pike (small)';
EN_TRANSLATIONS['fish_10_desc'] = 'Young pike, aggressive predator. Attacks with sharp side escape, hunts in daylight.';
EN_TRANSLATIONS['fish_11_name'] = 'Large Roach';
EN_TRANSLATIONS['fish_11_desc'] = 'Large roach inhabiting rivers and lakes. Bites with small touches, active during daytime.';
EN_TRANSLATIONS['fish_12_name'] = 'Eel';
EN_TRANSLATIONS['fish_12_desc'] = 'Bottom predator leading nocturnal lifestyle. Bites like a snag, resists with wriggling movements.';

// Zone 3 - Mountain River
EN_TRANSLATIONS['fish_13_name'] = 'Chub';
EN_TRANSLATIONS['fish_13_desc'] = 'River peaceful fish inhabiting currents. Cautiously tests the bait, active during daytime.';
EN_TRANSLATIONS['fish_14_name'] = 'Ide';
EN_TRANSLATIONS['fish_14_desc'] = 'Large peaceful fish preferring rivers with moderate current. Bites smoothly, active during day.';
EN_TRANSLATIONS['fish_15_name'] = 'Undermouth';
EN_TRANSLATIONS['fish_15_desc'] = 'River fish staying near bottom on current. Bites with small touches, active in daylight.';
EN_TRANSLATIONS['fish_16_name'] = 'Asp';
EN_TRANSLATIONS['fish_16_desc'] = 'Fast river predator attacking prey with sharp jerks. Hunts during daytime on current.';
EN_TRANSLATIONS['fish_17_name'] = 'Zander (young)';
EN_TRANSLATIONS['fish_17_desc'] = 'Young zander, nocturnal predator. Attacks lightning-fast, resists with sharp jerks when fighting.';
EN_TRANSLATIONS['fish_18_name'] = 'Catfish';
EN_TRANSLATIONS['fish_18_desc'] = 'Bottom predator inhabiting deep holes. Bites like a snag, active at night, resists powerfully.';

// Zone 4 - Cold Stream
EN_TRANSLATIONS['fish_19_name'] = 'Brook Trout';
EN_TRANSLATIONS['fish_19_desc'] = 'Predatory fish of mountain rivers, attacking bait with series of strikes. Prefers clean cold water, active during day.';
EN_TRANSLATIONS['fish_20_name'] = 'Grayling';
EN_TRANSLATIONS['fish_20_desc'] = 'Fish of fast mountain rivers, bites with cautious touches. Inhabits cold water, active during daytime.';
EN_TRANSLATIONS['fish_21_name'] = 'Char';
EN_TRANSLATIONS['fish_21_desc'] = 'Predator of cold rivers, attacking prey with series of strikes. Prefers clean water, hunts during day.';
EN_TRANSLATIONS['fish_22_name'] = 'Rainbow Trout';
EN_TRANSLATIONS['fish_22_desc'] = 'Trophy trout resisting with powerful jerks. Most active in morning and evening in cold water.';
EN_TRANSLATIONS['fish_23_name'] = 'Taimen (young)';
EN_TRANSLATIONS['fish_23_desc'] = 'Young taimen, large predator of Siberian rivers. Attacks with powerful jerk, active in evening time.';
EN_TRANSLATIONS['fish_24_name'] = 'Lenok';
EN_TRANSLATIONS['fish_24_desc'] = 'Predator of cold rivers, attacking bait with series of strikes. Inhabits fast water, hunts during day.';

// Continue with more zones...
// Zone 5 - Carp Pond
EN_TRANSLATIONS['fish_25_name'] = 'Mirror Carp';
EN_TRANSLATIONS['fish_25_desc'] = 'Large peaceful fish inhabiting ponds and lakes. Bites smoothly, most active in morning and evening.';
EN_TRANSLATIONS['fish_26_name'] = 'Wild Carp';
EN_TRANSLATIONS['fish_26_desc'] = 'Wild carp resisting with powerful jerks. Cautious fish, active in evening time.';
EN_TRANSLATIONS['fish_27_name'] = 'Grass Carp';
EN_TRANSLATIONS['fish_27_desc'] = 'Large herbivorous fish cautiously testing the bait. Resists powerfully, active during daytime.';
EN_TRANSLATIONS['fish_28_name'] = 'Pike';
EN_TRANSLATIONS['fish_28_desc'] = 'Large river predator attacking with sharp side jerks. Hunts in daylight.';
EN_TRANSLATIONS['fish_29_name'] = 'Trophy Bream';
EN_TRANSLATIONS['fish_29_desc'] = 'Trophy bream biting like bottom snag. Prefers evening time, resists with body weight.';
EN_TRANSLATIONS['fish_30_name'] = 'Catfish';
EN_TRANSLATIONS['fish_30_desc'] = 'Giant bottom predator biting like a snag. Nocturnal hunter, resists with enormous strength.';

// Zone 6 - Lake Baikal
EN_TRANSLATIONS['fish_31_name'] = 'Burbot';
EN_TRANSLATIONS['fish_31_desc'] = 'Only representative of cod family in Baikal. Bottom predator active in cold water at night.';
EN_TRANSLATIONS['fish_32_name'] = 'Whitefish';
EN_TRANSLATIONS['fish_32_desc'] = 'Baikal whitefish - endemic of the lake. Valuable commercial fish, bites with cautious touches in water column.';
EN_TRANSLATIONS['fish_33_name'] = 'Brown Trout';
EN_TRANSLATIONS['fish_33_desc'] = 'Baikal trout, predator of clean waters. Attacks prey with series of strikes, prefers coastal zones.';
EN_TRANSLATIONS['fish_34_name'] = 'Salmon';
EN_TRANSLATIONS['fish_34_desc'] = 'Anadromous salmon in Baikal tributaries. Powerful predator entering lake for feeding, active in morning.';
EN_TRANSLATIONS['fish_35_name'] = 'Taimen';
EN_TRANSLATIONS['fish_35_desc'] = 'Baikal taimen - king of Siberian rivers. Giant predator entering lake from tributaries.';
EN_TRANSLATIONS['fish_36_name'] = 'Large Grayling';
EN_TRANSLATIONS['fish_36_desc'] = 'Baikal grayling - most beautiful fish of the lake. Inhabits cleanest waters, attacks with series of strikes.';

// Zone 7 - Northern Delta
EN_TRANSLATIONS['fish_37_name'] = 'Mullet';
EN_TRANSLATIONS['fish_37_desc'] = 'Coastal fish inhabiting estuaries and deltas. Schooling fish, active during daytime.';
EN_TRANSLATIONS['fish_38_name'] = 'Zander';
EN_TRANSLATIONS['fish_38_desc'] = 'Large nocturnal predator. Attacks lightning-fast, resists with sharp jerks.';
EN_TRANSLATIONS['fish_39_name'] = 'Sterlet';
EN_TRANSLATIONS['fish_39_desc'] = 'Small sturgeon species. Bottom fish, bites like a snag, active at night.';
EN_TRANSLATIONS['fish_40_name'] = 'River Catfish';
EN_TRANSLATIONS['fish_40_desc'] = 'Large river predator. Bites like a snag, active at night, resists powerfully.';
EN_TRANSLATIONS['fish_41_name'] = 'Flathead Mullet';
EN_TRANSLATIONS['fish_41_desc'] = 'Large mullet species. Schooling fish, active during daytime in estuaries.';
EN_TRANSLATIONS['fish_42_name'] = 'Beluga (young)';
EN_TRANSLATIONS['fish_42_desc'] = 'Young beluga sturgeon. Giant bottom predator, bites like a snag.';

// Zone 8 - Tropical Coast
EN_TRANSLATIONS['fish_43_name'] = 'Red Snapper';
EN_TRANSLATIONS['fish_43_desc'] = 'Tropical reef fish. Predator attacking with series of strikes, active during day.';
EN_TRANSLATIONS['fish_44_name'] = 'Barracuda';
EN_TRANSLATIONS['fish_44_desc'] = 'Fast tropical predator. Attacks lightning-fast, hunts in coastal waters.';
EN_TRANSLATIONS['fish_45_name'] = 'Tarpon';
EN_TRANSLATIONS['fish_45_desc'] = 'Large tropical fish. Powerful predator, resists with acrobatic jumps.';
EN_TRANSLATIONS['fish_46_name'] = 'Grouper';
EN_TRANSLATIONS['fish_46_desc'] = 'Large reef predator. Inhabits coral reefs, attacks with powerful jerk.';
EN_TRANSLATIONS['fish_47_name'] = 'Stingray';
EN_TRANSLATIONS['fish_47_desc'] = 'Bottom ray species. Bites like a snag, active at night.';
EN_TRANSLATIONS['fish_48_name'] = 'Jack Crevalle';
EN_TRANSLATIONS['fish_48_desc'] = 'Fast tropical predator. Attacks with series of strikes, hunts in schools.';

// Zone 9 - Coral Reef
EN_TRANSLATIONS['fish_49_name'] = 'Parrotfish';
EN_TRANSLATIONS['fish_49_desc'] = 'Colorful reef fish. Peaceful species, active during daytime.';
EN_TRANSLATIONS['fish_50_name'] = 'Triggerfish';
EN_TRANSLATIONS['fish_50_desc'] = 'Aggressive reef fish. Territorial predator, active during day.';
EN_TRANSLATIONS['fish_51_name'] = 'Angelfish';
EN_TRANSLATIONS['fish_51_desc'] = 'Beautiful reef fish. Peaceful species, inhabits coral reefs.';
EN_TRANSLATIONS['fish_52_name'] = 'Moray Eel';
EN_TRANSLATIONS['fish_52_desc'] = 'Reef predator. Inhabits coral crevices, attacks lightning-fast.';
EN_TRANSLATIONS['fish_53_name'] = 'Lionfish';
EN_TRANSLATIONS['fish_53_desc'] = 'Venomous reef predator. Hunts at night, attacks with series of strikes.';
EN_TRANSLATIONS['fish_54_name'] = 'Giant Grouper';
EN_TRANSLATIONS['fish_54_desc'] = 'Massive reef predator. Inhabits deep coral reefs, incredibly strong.';

// Zone 10 - Mediterranean Coast
EN_TRANSLATIONS['fish_55_name'] = 'Sea Bass';
EN_TRANSLATIONS['fish_55_desc'] = 'Mediterranean predator. Attacks with series of strikes, hunts in coastal waters.';
EN_TRANSLATIONS['fish_56_name'] = 'Dorado';
EN_TRANSLATIONS['fish_56_desc'] = 'Mediterranean fish. Predator attacking with sharp jerks, active during day.';
EN_TRANSLATIONS['fish_57_name'] = 'Dentex';
EN_TRANSLATIONS['fish_57_desc'] = 'Large Mediterranean predator. Powerful fish, resists with strong jerks.';
EN_TRANSLATIONS['fish_58_name'] = 'Amberjack';
EN_TRANSLATIONS['fish_58_desc'] = 'Fast Mediterranean predator. Attacks lightning-fast, incredibly strong.';
EN_TRANSLATIONS['fish_59_name'] = 'Bluefin Tuna (small)';
EN_TRANSLATIONS['fish_59_desc'] = 'Young bluefin tuna. Fast predator, resists powerfully.';
EN_TRANSLATIONS['fish_60_name'] = 'Swordfish';
EN_TRANSLATIONS['fish_60_desc'] = 'Giant Mediterranean predator. Attacks with powerful jerk, legendary strength.';

// Zone 11 - Pelagic Zone
EN_TRANSLATIONS['fish_61_name'] = 'Skipjack Tuna';
EN_TRANSLATIONS['fish_61_desc'] = 'Small tuna species. Fast predator, hunts in schools.';
EN_TRANSLATIONS['fish_62_name'] = 'Yellowfin Tuna';
EN_TRANSLATIONS['fish_62_desc'] = 'Large tuna species. Powerful predator, resists with incredible strength.';
EN_TRANSLATIONS['fish_63_name'] = 'Wahoo';
EN_TRANSLATIONS['fish_63_desc'] = 'Fastest ocean predator. Attacks lightning-fast, hunts in open water.';
EN_TRANSLATIONS['fish_64_name'] = 'Mahi-Mahi';
EN_TRANSLATIONS['fish_64_desc'] = 'Colorful ocean predator. Fast fish, resists with acrobatic jumps.';
EN_TRANSLATIONS['fish_65_name'] = 'Sailfish';
EN_TRANSLATIONS['fish_65_desc'] = 'Ocean speedster. Attacks with powerful jerk, fastest fish in the ocean.';
EN_TRANSLATIONS['fish_66_name'] = 'Blue Shark';
EN_TRANSLATIONS['fish_66_desc'] = 'Ocean predator. Powerful shark, resists with incredible strength.';

// Zone 12 - Swamp
EN_TRANSLATIONS['fish_67_name'] = 'Channel Catfish';
EN_TRANSLATIONS['fish_67_desc'] = 'Swamp bottom predator. Bites like a snag, active at night.';
EN_TRANSLATIONS['fish_68_name'] = 'Snakehead';
EN_TRANSLATIONS['fish_68_desc'] = 'Aggressive swamp predator. Attacks lightning-fast, can breathe air.';
EN_TRANSLATIONS['fish_69_name'] = 'Peacock Bass';
EN_TRANSLATIONS['fish_69_desc'] = 'Tropical predator. Attacks with powerful jerk, incredibly aggressive.';
EN_TRANSLATIONS['fish_70_name'] = 'Alligator Gar';
EN_TRANSLATIONS['fish_70_desc'] = 'Ancient swamp predator. Attacks with powerful jerk, has alligator teeth.';
EN_TRANSLATIONS['fish_71_name'] = 'Flathead Catfish';
EN_TRANSLATIONS['fish_71_desc'] = 'Large swamp catfish. Bottom predator, bites like a snag.';
EN_TRANSLATIONS['fish_72_name'] = 'Giant Snakehead';
EN_TRANSLATIONS['fish_72_desc'] = 'Massive swamp predator. Incredibly aggressive, attacks lightning-fast.';

// Zone 13 - Amazon
EN_TRANSLATIONS['fish_73_name'] = 'Piranha';
EN_TRANSLATIONS['fish_73_desc'] = 'Aggressive Amazon predator. Attacks with series of strikes, hunts in schools.';
EN_TRANSLATIONS['fish_74_name'] = 'Pacu';
EN_TRANSLATIONS['fish_74_desc'] = 'Large Amazon fish. Peaceful species, related to piranha.';
EN_TRANSLATIONS['fish_75_name'] = 'Arapaima';
EN_TRANSLATIONS['fish_75_desc'] = 'Giant Amazon predator. Ancient fish, can breathe air, incredibly strong.';
EN_TRANSLATIONS['fish_76_name'] = 'Piraiba Catfish';
EN_TRANSLATIONS['fish_76_desc'] = 'Massive Amazon catfish. Bottom predator, bites like a snag.';
EN_TRANSLATIONS['fish_77_name'] = 'Payara';
EN_TRANSLATIONS['fish_77_desc'] = 'Amazon vampire fish. Predator with large fangs, attacks lightning-fast.';
EN_TRANSLATIONS['fish_78_name'] = 'Electric Eel';
EN_TRANSLATIONS['fish_78_desc'] = 'Amazon electric fish. Can generate powerful electric shocks.';

// Zone 14 - African Lake
EN_TRANSLATIONS['fish_79_name'] = 'Tigerfish';
EN_TRANSLATIONS['fish_79_desc'] = 'African predator. Aggressive fish with large teeth, attacks lightning-fast.';
EN_TRANSLATIONS['fish_80_name'] = 'African Catfish';
EN_TRANSLATIONS['fish_80_desc'] = 'Large African catfish. Bottom predator, bites like a snag.';
EN_TRANSLATIONS['fish_81_name'] = 'Tilapia';
EN_TRANSLATIONS['fish_81_desc'] = 'African lake fish. Peaceful species, active during daytime.';
EN_TRANSLATIONS['fish_82_name'] = 'Nile Perch';
EN_TRANSLATIONS['fish_82_desc'] = 'Giant African predator. Massive fish, resists with incredible strength.';
EN_TRANSLATIONS['fish_83_name'] = 'Lungfish';
EN_TRANSLATIONS['fish_83_desc'] = 'Ancient African fish. Can breathe air, survives in drought.';
EN_TRANSLATIONS['fish_84_name'] = 'Trophy Catfish';
EN_TRANSLATIONS['fish_84_desc'] = 'Massive African catfish. Giant bottom predator, legendary strength.';

// Zone 15 - Congo River
EN_TRANSLATIONS['fish_85_name'] = 'Goliath Tigerfish';
EN_TRANSLATIONS['fish_85_desc'] = 'Legendary Congo predator. Most dangerous freshwater fish, massive teeth.';
EN_TRANSLATIONS['fish_86_name'] = 'African Barbel';
EN_TRANSLATIONS['fish_86_desc'] = 'Congo catfish species. Bottom predator, active at night.';
EN_TRANSLATIONS['fish_87_name'] = 'Mormyrid';
EN_TRANSLATIONS['fish_87_desc'] = 'Electric Congo fish. Can generate weak electric fields.';
EN_TRANSLATIONS['fish_88_name'] = 'Butterflyfish';
EN_TRANSLATIONS['fish_88_desc'] = 'Surface Congo fish. Can jump out of water to catch insects.';
EN_TRANSLATIONS['fish_89_name'] = 'Vundu Catfish';
EN_TRANSLATIONS['fish_89_desc'] = 'Large Congo catfish. Bottom predator, bites like a snag.';
EN_TRANSLATIONS['fish_90_name'] = 'Giant Tigerfish';
EN_TRANSLATIONS['fish_90_desc'] = 'Massive Congo predator. Legendary fish, incredibly dangerous.';

// Zone 16 - Japanese Coast
EN_TRANSLATIONS['fish_91_name'] = 'Japanese Amberjack';
EN_TRANSLATIONS['fish_91_desc'] = 'Japanese coastal predator. Fast fish, resists powerfully.';
EN_TRANSLATIONS['fish_92_name'] = 'Red Seabream';
EN_TRANSLATIONS['fish_92_desc'] = 'Prized Japanese fish. Predator attacking with series of strikes.';
EN_TRANSLATIONS['fish_93_name'] = 'Japanese Sea Bass';
EN_TRANSLATIONS['fish_93_desc'] = 'Japanese coastal predator. Attacks with sharp jerks, hunts at night.';
EN_TRANSLATIONS['fish_94_name'] = 'Yellowtail';
EN_TRANSLATIONS['fish_94_desc'] = 'Fast Japanese predator. Powerful fish, resists with incredible strength.';
EN_TRANSLATIONS['fish_95_name'] = 'Bluefin Tuna (medium)';
EN_TRANSLATIONS['fish_95_desc'] = 'Medium bluefin tuna. Powerful predator, legendary strength.';
EN_TRANSLATIONS['fish_96_name'] = 'Giant Trevally';
EN_TRANSLATIONS['fish_96_desc'] = 'Massive Japanese predator. Incredibly strong, attacks with powerful jerk.';

// Zone 17 - Northern Seas
EN_TRANSLATIONS['fish_97_name'] = 'Cod';
EN_TRANSLATIONS['fish_97_desc'] = 'Northern bottom fish. Bites like a snag, active in cold water.';
EN_TRANSLATIONS['fish_98_name'] = 'Haddock';
EN_TRANSLATIONS['fish_98_desc'] = 'Northern bottom fish. Related to cod, active in cold water.';
EN_TRANSLATIONS['fish_99_name'] = 'Pollock';
EN_TRANSLATIONS['fish_99_desc'] = 'Northern schooling fish. Active predator, hunts in cold water.';
EN_TRANSLATIONS['fish_100_name'] = 'Halibut';
EN_TRANSLATIONS['fish_100_desc'] = 'Giant northern flatfish. Bottom predator, incredibly strong.';
EN_TRANSLATIONS['fish_101_name'] = 'Wolffish';
EN_TRANSLATIONS['fish_101_desc'] = 'Northern bottom predator. Powerful jaws, bites like a snag.';
EN_TRANSLATIONS['fish_102_name'] = 'Atlantic Salmon';
EN_TRANSLATIONS['fish_102_desc'] = 'Northern anadromous fish. Powerful predator, resists with incredible strength.';

// Zone 18 - Open Ocean
EN_TRANSLATIONS['fish_103_name'] = 'Albacore Tuna';
EN_TRANSLATIONS['fish_103_desc'] = 'Ocean tuna species. Fast predator, hunts in open water.';
EN_TRANSLATIONS['fish_104_name'] = 'Blue Marlin';
EN_TRANSLATIONS['fish_104_desc'] = 'Legendary marlin attacking with powerful jerk. Hunts in open ocean during day, resists with legendary strength.';
EN_TRANSLATIONS['fish_105_name'] = 'Black Marlin';
EN_TRANSLATIONS['fish_105_desc'] = 'Massive ocean predator. Legendary fish, incredible strength.';
EN_TRANSLATIONS['fish_106_name'] = 'Striped Marlin';
EN_TRANSLATIONS['fish_106_desc'] = 'Fast ocean predator. Attacks with powerful jerk, acrobatic fighter.';
EN_TRANSLATIONS['fish_107_name'] = 'Spearfish';
EN_TRANSLATIONS['fish_107_desc'] = 'Ocean billfish species. Fast predator, resists powerfully.';
EN_TRANSLATIONS['fish_108_name'] = 'Giant Tuna';
EN_TRANSLATIONS['fish_108_desc'] = 'Massive tuna species. Incredibly strong, legendary fighter.';
EN_TRANSLATIONS['fish_109_name'] = 'Swordfish (giant)';
EN_TRANSLATIONS['fish_109_desc'] = 'Giant ocean predator. Legendary fish, incredible strength.';
EN_TRANSLATIONS['fish_110_name'] = 'Mako Shark';
EN_TRANSLATIONS['fish_110_desc'] = 'Fastest shark species. Attacks lightning-fast, incredibly dangerous.';
EN_TRANSLATIONS['fish_111_name'] = 'Bluefin Tuna';
EN_TRANSLATIONS['fish_111_desc'] = 'Legendary bluefin tuna attacking with powerful jerk. Hunts in open ocean during day, resists with legendary strength.';
EN_TRANSLATIONS['fish_112_name'] = 'Tiger Shark';
EN_TRANSLATIONS['fish_112_desc'] = 'Massive ocean predator. Dangerous shark, incredibly strong.';
EN_TRANSLATIONS['fish_113_name'] = 'Hammerhead Shark';
EN_TRANSLATIONS['fish_113_desc'] = 'Unique ocean predator. Powerful shark, resists with incredible strength.';
EN_TRANSLATIONS['fish_114_name'] = 'Bull Shark';
EN_TRANSLATIONS['fish_114_desc'] = 'Aggressive ocean predator. Dangerous shark, attacks lightning-fast.';
EN_TRANSLATIONS['fish_115_name'] = 'Thresher Shark';
EN_TRANSLATIONS['fish_115_desc'] = 'Ocean shark with long tail. Powerful predator, unique fighting style.';
EN_TRANSLATIONS['fish_116_name'] = 'Oceanic Whitetip Shark';
EN_TRANSLATIONS['fish_116_desc'] = 'Open ocean predator. Dangerous shark, incredibly aggressive.';
EN_TRANSLATIONS['fish_117_name'] = 'Blue Shark (giant)';
EN_TRANSLATIONS['fish_117_desc'] = 'Massive ocean predator. Giant shark, legendary strength.';
EN_TRANSLATIONS['fish_118_name'] = 'Shortfin Mako';
EN_TRANSLATIONS['fish_118_desc'] = 'Fastest ocean predator. Legendary shark, incredible speed.';
EN_TRANSLATIONS['fish_119_name'] = 'Whale Shark';
EN_TRANSLATIONS['fish_119_desc'] = 'Largest fish in the ocean. Gentle giant, filter feeder.';
EN_TRANSLATIONS['fish_120_name'] = 'Great White Shark';
EN_TRANSLATIONS['fish_120_desc'] = 'Legendary great white shark attacking with powerful jerk. Apex predator of the ocean, resists with legendary strength.';

// ============= GEAR TRANSLATIONS =============
// Rods - All 18 tiers
EN_TRANSLATIONS['gear_rod_1_name'] = 'Stick Rod';
EN_TRANSLATIONS['gear_rod_1_desc'] = 'Simple rod for beginner anglers. Suitable for catching small fish in calm waters. Level 1.';
EN_TRANSLATIONS['gear_rod_2_name'] = 'Reed Rod';
EN_TRANSLATIONS['gear_rod_2_desc'] = 'Lightweight reed rod for frequent casts. Provides basic control when fighting. Level 2.';
EN_TRANSLATIONS['gear_rod_3_name'] = 'Fiberglass Rod';
EN_TRANSLATIONS['gear_rod_3_desc'] = 'Fiberglass rod with improved sensitivity. Suitable for catching medium-sized fish. Level 3.';
EN_TRANSLATIONS['gear_rod_4_name'] = 'Match Rod';
EN_TRANSLATIONS['gear_rod_4_desc'] = 'Premium quality rod with superior power and accuracy. Excellent control for long casts and fighting large fish.';
EN_TRANSLATIONS['gear_rod_5_name'] = 'Carbon Rod';
EN_TRANSLATIONS['gear_rod_5_desc'] = 'Carbon rod with excellent sensitivity. Suitable for catching cautious fish at medium distances. Level 5.';
EN_TRANSLATIONS['gear_rod_6_name'] = 'Feeder Rod';
EN_TRANSLATIONS['gear_rod_6_desc'] = 'Feeder rod for bottom fishing. Powerful and reliable, suitable for large fish. Level 6.';
EN_TRANSLATIONS['gear_rod_7_name'] = 'Spinning Rod';
EN_TRANSLATIONS['gear_rod_7_desc'] = 'Spinning rod for active predator fishing. Provides accurate casts and good control. Level 7.';
EN_TRANSLATIONS['gear_rod_8_name'] = 'Heavy Spinning Rod';
EN_TRANSLATIONS['gear_rod_8_desc'] = 'Heavy spinning for catching large predators. Powerful construction withstands strong jerks. Level 8.';
EN_TRANSLATIONS['gear_rod_9_name'] = 'Carp Rod';
EN_TRANSLATIONS['gear_rod_9_desc'] = 'Premium quality rod with increased power. Specially designed for trophy fishing with maximum reliability when fighting.';
EN_TRANSLATIONS['gear_rod_10_name'] = 'Tropical Heavy Rod';
EN_TRANSLATIONS['gear_rod_10_desc'] = 'Heavy rod for tropical fishing. Withstands powerful jerks of large marine fish. Level 10.';
EN_TRANSLATIONS['gear_rod_11_name'] = 'Surf Rod';
EN_TRANSLATIONS['gear_rod_11_desc'] = 'Rod for surf fishing. Provides long casts and control of large fish. Level 11.';
EN_TRANSLATIONS['gear_rod_12_name'] = 'Boat Heavy Rod';
EN_TRANSLATIONS['gear_rod_12_desc'] = 'Heavy boat rod for sea fishing. Powerful construction for fighting large predators. Level 12.';
EN_TRANSLATIONS['gear_rod_13_name'] = 'Boat X-Heavy Rod';
EN_TRANSLATIONS['gear_rod_13_desc'] = 'Extra-heavy boat rod for large marine fish. Withstands extreme loads. Level 13.';
EN_TRANSLATIONS['gear_rod_14_name'] = 'Trolling Pro Rod';
EN_TRANSLATIONS['gear_rod_14_desc'] = 'Legendary premium quality rod. Unmatched power and accuracy for ocean fishing and largest predators.';
EN_TRANSLATIONS['gear_rod_15_name'] = 'Trolling X-Pro Rod';
EN_TRANSLATIONS['gear_rod_15_desc'] = 'Extra-professional trolling rod. Maximum power for trophy sea fishing. Level 15.';
EN_TRANSLATIONS['gear_rod_16_name'] = 'Ocean Pro Rod';
EN_TRANSLATIONS['gear_rod_16_desc'] = 'Professional ocean rod. Withstands prolonged fighting of largest marine predators. Level 16.';
EN_TRANSLATIONS['gear_rod_17_name'] = 'Ocean Titan Rod';
EN_TRANSLATIONS['gear_rod_17_desc'] = 'Legendary premium quality rod. Maximum power and unmatched accuracy for greatest ocean trophies.';
EN_TRANSLATIONS['gear_rod_18_name'] = 'Sharkmaster Rod';
EN_TRANSLATIONS['gear_rod_18_desc'] = 'Legendary rod for shark fishing. Unmatched power for greatest ocean trophies up to 220 kg. Level 18.';

// Lines - All 18 tiers
EN_TRANSLATIONS['gear_line_1_name'] = 'Mono Line 0.18';
EN_TRANSLATIONS['gear_line_1_desc'] = 'Basic monofilament line for beginners. Sufficient strength for small fish. Level 1.';
EN_TRANSLATIONS['gear_line_2_name'] = 'Mono Line 0.22';
EN_TRANSLATIONS['gear_line_2_desc'] = 'Improved monofilament line. Increased reliability for medium-sized fish. Level 2.';
EN_TRANSLATIONS['gear_line_3_name'] = 'Fluorocarbon Line 0.25';
EN_TRANSLATIONS['gear_line_3_desc'] = 'Fluorocarbon line with good abrasion resistance. Less visible in water. Level 3.';
EN_TRANSLATIONS['gear_line_4_name'] = 'Fluorocarbon Line 0.28';
EN_TRANSLATIONS['gear_line_4_desc'] = 'Premium quality line with superior strength. Excellent abrasion resistance and reliability when fighting large fish.';
EN_TRANSLATIONS['gear_line_5_name'] = 'Braided Line PE 1.0';
EN_TRANSLATIONS['gear_line_5_desc'] = 'Braided line with high strength. Minimal stretch for better control. Level 5.';
EN_TRANSLATIONS['gear_line_6_name'] = 'Braided Line PE 1.5';
EN_TRANSLATIONS['gear_line_6_desc'] = 'Quality braided line. Excellent resistance to jerks and abrasion. Level 6.';
EN_TRANSLATIONS['gear_line_7_name'] = 'Braided Line PE 2.0';
EN_TRANSLATIONS['gear_line_7_desc'] = 'Strong braided line for large fish. High reliability during prolonged fighting. Level 7.';
EN_TRANSLATIONS['gear_line_8_name'] = 'Braided Line PE 2.5';
EN_TRANSLATIONS['gear_line_8_desc'] = 'Reinforced braided line. Withstands powerful predator jerks. Level 8.';
EN_TRANSLATIONS['gear_line_9_name'] = 'Braided Line PE 3.0';
EN_TRANSLATIONS['gear_line_9_desc'] = 'Professional braided line. Maximum strength for trophy fishing. Level 9.';
EN_TRANSLATIONS['gear_line_10_name'] = 'Sea Line PE 4.0';
EN_TRANSLATIONS['gear_line_10_desc'] = 'Premium quality line with increased strength. Specially designed for sea fishing with maximum load resistance.';
EN_TRANSLATIONS['gear_line_11_name'] = 'Sea Line PE 5.0';
EN_TRANSLATIONS['gear_line_11_desc'] = 'Strong sea line. Reliable when catching large marine predators. Level 11.';
EN_TRANSLATIONS['gear_line_12_name'] = 'Sea Line PE 6.0';
EN_TRANSLATIONS['gear_line_12_desc'] = 'Reinforced sea line. Withstands extreme loads when fighting. Level 12.';
EN_TRANSLATIONS['gear_line_13_name'] = 'Sea Line PE 8.0';
EN_TRANSLATIONS['gear_line_13_desc'] = 'Extra-strong sea line. Maximum resistance to jerks and abrasion. Level 13.';
EN_TRANSLATIONS['gear_line_14_name'] = 'Ocean Line PE 10';
EN_TRANSLATIONS['gear_line_14_desc'] = 'Professional ocean line. Withstands prolonged battle with large fish. Level 14.';
EN_TRANSLATIONS['gear_line_15_name'] = 'Ocean Line PE 12';
EN_TRANSLATIONS['gear_line_15_desc'] = 'Legendary premium quality line. Unmatched strength and abrasion resistance for extreme ocean fishing.';
EN_TRANSLATIONS['gear_line_16_name'] = 'Titan Line PE 15';
EN_TRANSLATIONS['gear_line_16_desc'] = 'Titanium braided line. Unmatched strength for largest predators. Level 16.';
EN_TRANSLATIONS['gear_line_17_name'] = 'Titan Line PE 20';
EN_TRANSLATIONS['gear_line_17_desc'] = 'Legendary ocean line. Maximum reliability for extreme fishing. Level 17.';
EN_TRANSLATIONS['gear_line_18_name'] = 'Shark Line PE 30';
EN_TRANSLATIONS['gear_line_18_desc'] = 'Unmatched line for shark fishing. Withstands greatest loads up to 220 kg. Level 18.';

// Floats - All 18 tiers
EN_TRANSLATIONS['gear_float_1_name'] = 'Goose Quill Float';
EN_TRANSLATIONS['gear_float_1_desc'] = 'Simple float for calm water. Basic sensitivity to bites. Level 1.';
EN_TRANSLATIONS['gear_float_2_name'] = 'Balsa Float';
EN_TRANSLATIONS['gear_float_2_desc'] = 'Improved float with good sensitivity. Stable on light waves. Level 2.';
EN_TRANSLATIONS['gear_float_3_name'] = 'Spindle Float';
EN_TRANSLATIONS['gear_float_3_desc'] = 'Premium quality float with high sensitivity. Perfect for precise fishing of cautious fish.';
EN_TRANSLATIONS['gear_float_4_name'] = 'Pencil Float';
EN_TRANSLATIONS['gear_float_4_desc'] = 'Float with high sensitivity. Stable on moderate waves and current. Level 4.';
EN_TRANSLATIONS['gear_float_5_name'] = 'Waggler Float';
EN_TRANSLATIONS['gear_float_5_desc'] = 'Quality float for precise fishing. Excellent sensitivity to cautious bites. Level 5.';
EN_TRANSLATIONS['gear_float_6_name'] = 'Stick Float';
EN_TRANSLATIONS['gear_float_6_desc'] = 'Professional float with high sensitivity. Stable on waves and current. Level 6.';
EN_TRANSLATIONS['gear_float_7_name'] = 'Match Float';
EN_TRANSLATIONS['gear_float_7_desc'] = 'Premium quality float for professional fishing. Superior sensitivity and stability in difficult conditions.';
EN_TRANSLATIONS['gear_float_8_name'] = 'Bologna Float';
EN_TRANSLATIONS['gear_float_8_desc'] = 'Reinforced float with excellent sensitivity. Stable in difficult conditions. Level 8.';
EN_TRANSLATIONS['gear_float_9_name'] = 'Pole Pro Float';
EN_TRANSLATIONS['gear_float_9_desc'] = 'Professional float for trophy fishing. High sensitivity and stability. Level 9.';
EN_TRANSLATIONS['gear_float_10_name'] = 'Sea Drifter Float';
EN_TRANSLATIONS['gear_float_10_desc'] = 'Sea float with high stability. Sensitive even on waves. Level 10.';
EN_TRANSLATIONS['gear_float_11_name'] = 'Surf Float';
EN_TRANSLATIONS['gear_float_11_desc'] = 'Durable sea float. Stable in sea waves and current conditions. Level 11.';
EN_TRANSLATIONS['gear_float_12_name'] = 'Pilker Float';
EN_TRANSLATIONS['gear_float_12_desc'] = 'Reinforced sea float. Maximum sensitivity and stability on waves. Level 12.';
EN_TRANSLATIONS['gear_float_13_name'] = 'Slider Float';
EN_TRANSLATIONS['gear_float_13_desc'] = 'Professional sea float. Reliable in difficult sea conditions. Level 13.';
EN_TRANSLATIONS['gear_float_14_name'] = 'Ocean Drift Float';
EN_TRANSLATIONS['gear_float_14_desc'] = 'Ocean float with maximum sensitivity. Stable on strong waves. Level 14.';
EN_TRANSLATIONS['gear_float_15_name'] = 'Pelagic Float';
EN_TRANSLATIONS['gear_float_15_desc'] = 'Extra-sensitive ocean float. Reliable in extreme conditions. Level 15.';
EN_TRANSLATIONS['gear_float_16_name'] = 'Titan Float';
EN_TRANSLATIONS['gear_float_16_desc'] = 'Legendary premium quality float. Unmatched sensitivity and maximum stability for ocean fishing.';
EN_TRANSLATIONS['gear_float_17_name'] = 'Ocean Master Float';
EN_TRANSLATIONS['gear_float_17_desc'] = 'Legendary ocean float. Perfect sensitivity and stability. Level 17.';
EN_TRANSLATIONS['gear_float_18_name'] = 'Storm King Float';
EN_TRANSLATIONS['gear_float_18_desc'] = 'Unmatched float for extreme fishing. Maximum characteristics. Level 18.';

// Hooks - All 18 tiers
EN_TRANSLATIONS['gear_hook_1_name'] = 'Single Hook';
EN_TRANSLATIONS['gear_hook_1_desc'] = 'Simple hook for small fish. Basic reliability of hooking and holding. Size #14. Level 1.';
EN_TRANSLATIONS['gear_hook_2_name'] = 'Single Pro Hook';
EN_TRANSLATIONS['gear_hook_2_desc'] = 'Improved hook with good penetration. Reliably holds medium-sized fish. Size #13. Level 2.';
EN_TRANSLATIONS['gear_hook_3_name'] = 'Bream Hook';
EN_TRANSLATIONS['gear_hook_3_desc'] = 'Sharp hook for confident hooking. Holds cautious fish well. Size #13. Level 3.';
EN_TRANSLATIONS['gear_hook_4_name'] = 'Carp Hook';
EN_TRANSLATIONS['gear_hook_4_desc'] = 'Premium quality hook with superior penetration and reliability. Ideal for catching large fish. Size #11.';
EN_TRANSLATIONS['gear_hook_5_name'] = 'Feeder Hook';
EN_TRANSLATIONS['gear_hook_5_desc'] = 'Strong hook for trophy fishing. Confident hooking and reliable holding. Size #12. Level 5.';
EN_TRANSLATIONS['gear_hook_6_name'] = 'Offset Hook';
EN_TRANSLATIONS['gear_hook_6_desc'] = 'Professional hook with high strength. Holds large fish excellently. Size #11. Level 6.';
EN_TRANSLATIONS['gear_hook_7_name'] = 'Treble Hook';
EN_TRANSLATIONS['gear_hook_7_desc'] = 'Reinforced hook for powerful fish. Maximum penetration. Size #11. Level 7.';
EN_TRANSLATIONS['gear_hook_8_name'] = 'Predator Hook';
EN_TRANSLATIONS['gear_hook_8_desc'] = 'Premium quality hook with increased strength. Specially designed for sea fishing and large predators. Size #9.';
EN_TRANSLATIONS['gear_hook_9_name'] = 'Treble Pro Hook';
EN_TRANSLATIONS['gear_hook_9_desc'] = 'Professional hook for trophy fishing. Unmatched reliability. Size #10. Level 9.';
EN_TRANSLATIONS['gear_hook_10_name'] = 'Sea Hook';
EN_TRANSLATIONS['gear_hook_10_desc'] = 'Sea hook with high strength. Holds large marine fish excellently. Size #9. Level 10.';
EN_TRANSLATIONS['gear_hook_11_name'] = 'Surf Hook';
EN_TRANSLATIONS['gear_hook_11_desc'] = 'Reinforced sea hook. Reliable for powerful marine predators. Size #9. Level 11.';
EN_TRANSLATIONS['gear_hook_12_name'] = 'Jig Hook';
EN_TRANSLATIONS['gear_hook_12_desc'] = 'Strong sea hook. Confident hooking even of hard mouth. Size #8. Level 12.';
EN_TRANSLATIONS['gear_hook_13_name'] = 'Trolling Hook';
EN_TRANSLATIONS['gear_hook_13_desc'] = 'Extra-strong sea hook. Maximum reliability under extreme loads. Size #8. Level 13.';
EN_TRANSLATIONS['gear_hook_14_name'] = 'Ocean Hook';
EN_TRANSLATIONS['gear_hook_14_desc'] = 'Professional ocean hook. Withstands prolonged battle with large fish. Size #7. Level 14.';
EN_TRANSLATIONS['gear_hook_15_name'] = 'Marlin Hook';
EN_TRANSLATIONS['gear_hook_15_desc'] = 'Extra-strong ocean hook. Unmatched penetration. Size #7. Level 15.';
EN_TRANSLATIONS['gear_hook_16_name'] = 'Tuna Hook';
EN_TRANSLATIONS['gear_hook_16_desc'] = 'Titanium hook for largest predators. Maximum strength and reliability. Size #6. Level 16.';
EN_TRANSLATIONS['gear_hook_17_name'] = 'Swordfish Hook';
EN_TRANSLATIONS['gear_hook_17_desc'] = 'Legendary premium quality hook. Unmatched strength and penetration for trophy ocean fishing. Size #5.';
EN_TRANSLATIONS['gear_hook_18_name'] = 'Shark Hook';
EN_TRANSLATIONS['gear_hook_18_desc'] = 'Unmatched hook for shark fishing. Maximum strength and penetration. Size #5. Level 18.';

// Reels - All 18 tiers
EN_TRANSLATIONS['gear_reel_1_name'] = 'Basic Reel';
EN_TRANSLATIONS['gear_reel_1_desc'] = 'Simple reel for beginners. Basic smoothness and jerk control. Level 1.';
EN_TRANSLATIONS['gear_reel_2_name'] = 'Standard Reel';
EN_TRANSLATIONS['gear_reel_2_desc'] = 'Improved reel with good smoothness. Reliable for medium-sized fish. Level 2.';
EN_TRANSLATIONS['gear_reel_3_name'] = 'Comfort Reel';
EN_TRANSLATIONS['gear_reel_3_desc'] = 'Premium quality reel with superior smoothness. Excellent jerk control and reliability when fighting large fish.';
EN_TRANSLATIONS['gear_reel_4_name'] = 'Sport Reel';
EN_TRANSLATIONS['gear_reel_4_desc'] = 'Reel with excellent smoothness. Reliable jerk control of large fish. Level 4.';
EN_TRANSLATIONS['gear_reel_5_name'] = 'Pro Reel';
EN_TRANSLATIONS['gear_reel_5_desc'] = 'Professional reel with high smoothness. Suitable for prolonged fighting. Level 5.';
EN_TRANSLATIONS['gear_reel_6_name'] = 'Master Reel';
EN_TRANSLATIONS['gear_reel_6_desc'] = 'Reinforced reel with excellent control. Smooth operation during powerful jerks. Level 6.';
EN_TRANSLATIONS['gear_reel_7_name'] = 'Expert Reel';
EN_TRANSLATIONS['gear_reel_7_desc'] = 'Strong reel for trophy fishing. Maximum smoothness and control. Level 7.';
EN_TRANSLATIONS['gear_reel_8_name'] = 'Tournament Reel';
EN_TRANSLATIONS['gear_reel_8_desc'] = 'Premium quality reel with increased power. Specially designed for sea fishing with maximum control when fighting.';
EN_TRANSLATIONS['gear_reel_9_name'] = 'Champion Reel';
EN_TRANSLATIONS['gear_reel_9_desc'] = 'Professional reel for large fish. Unmatched smoothness. Level 9.';
EN_TRANSLATIONS['gear_reel_10_name'] = 'Sea Reel';
EN_TRANSLATIONS['gear_reel_10_desc'] = 'Sea reel with high power. Excellent control when fighting large fish. Level 10.';
EN_TRANSLATIONS['gear_reel_11_name'] = 'Sea Pro Reel';
EN_TRANSLATIONS['gear_reel_11_desc'] = 'Reinforced sea reel. Smooth operation under extreme loads. Level 11.';
EN_TRANSLATIONS['gear_reel_12_name'] = 'Sea Heavy Reel';
EN_TRANSLATIONS['gear_reel_12_desc'] = 'Strong sea reel. Maximum control of powerful jerks. Level 12.';
EN_TRANSLATIONS['gear_reel_13_name'] = 'Sea X-Heavy Reel';
EN_TRANSLATIONS['gear_reel_13_desc'] = 'Premium quality reel with ultra-high power. Unmatched smoothness and control for extreme ocean fishing.';
EN_TRANSLATIONS['gear_reel_14_name'] = 'Ocean Pro Reel';
EN_TRANSLATIONS['gear_reel_14_desc'] = 'Professional ocean reel. Perfect smoothness for trophy fishing. Level 14.';
EN_TRANSLATIONS['gear_reel_15_name'] = 'Ocean X-Pro Reel';
EN_TRANSLATIONS['gear_reel_15_desc'] = 'Extra-powerful ocean reel. Unmatched control of largest predators. Level 15.';
EN_TRANSLATIONS['gear_reel_16_name'] = 'Titan Reel';
EN_TRANSLATIONS['gear_reel_16_desc'] = 'Titanium reel for extreme fishing. Maximum smoothness and power. Level 16.';
EN_TRANSLATIONS['gear_reel_17_name'] = 'Legend Reel';
EN_TRANSLATIONS['gear_reel_17_desc'] = 'Legendary premium quality reel. Maximum power and perfect smoothness for trophy ocean fishing.';
EN_TRANSLATIONS['gear_reel_18_name'] = 'Shark Reel';
EN_TRANSLATIONS['gear_reel_18_desc'] = 'Unmatched reel for shark fishing. Maximum power and reliability. Level 18.';

// ============= IAP (IN-APP PURCHASES) TRANSLATIONS =============
// Premium bundle
EN_TRANSLATIONS['iap_premium_bundle_name'] = 'Premium Bundle';
EN_TRANSLATIONS['iap_premium_bundle_desc'] = 'Great bundle for real anglers! Includes fishing marks, regular coins, energy drinks, feed bonuses and ad removal.';

// Ad rewards
EN_TRANSLATIONS['iap_ad_reward_small_name'] = 'Watch Ads';
EN_TRANSLATIONS['iap_ad_reward_small_desc'] = 'Watch 3 ads and get 500 regular coins!';
EN_TRANSLATIONS['iap_ad_reward_medium_name'] = 'Watch Ads';
EN_TRANSLATIONS['iap_ad_reward_medium_desc'] = 'Watch 5 ads and get 700 regular coins!';
EN_TRANSLATIONS['iap_ad_reward_large_name'] = 'Watch Ads';
EN_TRANSLATIONS['iap_ad_reward_large_desc'] = 'Watch 7 ads and get 1000 regular coins!';
EN_TRANSLATIONS['cooldown'] = 'Available in';
EN_TRANSLATIONS['progress'] = 'Progress';

// Premium coins (Fishing Marks)
EN_TRANSLATIONS['iap_premium_coins_100_name'] = '100 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_100_desc'] = 'Small pack of fishing marks for special purchases.';
EN_TRANSLATIONS['iap_premium_coins_500_name'] = '500 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_500_desc'] = 'Medium pack of fishing marks. Great value!';
EN_TRANSLATIONS['iap_premium_coins_1000_name'] = '1000 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_1000_desc'] = 'Large pack of fishing marks for serious purchases.';
EN_TRANSLATIONS['iap_premium_coins_5000_name'] = '5000 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_5000_desc'] = 'Huge pack of fishing marks! Maximum value for professionals.';

// Regular coins
EN_TRANSLATIONS['iap_regular_coins_1500_name'] = '1500 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_1500_desc'] = 'Small pack of regular coins for everyday purchases.';
EN_TRANSLATIONS['iap_regular_coins_7000_name'] = '7000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_7000_desc'] = 'Medium pack of regular coins. Better value than exchange!';
EN_TRANSLATIONS['iap_regular_coins_14000_name'] = '14000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_14000_desc'] = 'Large pack of regular coins for serious purchases.';
EN_TRANSLATIONS['iap_regular_coins_70000_name'] = '70000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_70000_desc'] = 'Huge pack of regular coins! Maximum value for professionals.';

// Gear bundles
EN_TRANSLATIONS['iap_gear_bundle_starter_name'] = 'Starter Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_starter_desc'] = 'Complete set of premium gear for beginners! Includes rod, line, float, hook and reel.';
EN_TRANSLATIONS['iap_gear_bundle_advanced_name'] = 'Advanced Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_advanced_desc'] = 'Professional set of premium gear! Powerful equipment for trophy fishing.';
EN_TRANSLATIONS['iap_gear_bundle_master_name'] = 'Master Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_master_desc'] = 'Legendary set of top premium gear! Maximum power for ocean fishing.';

// Currency exchange
EN_TRANSLATIONS['iap_currency_exchange_name'] = 'Currency Exchange';
EN_TRANSLATIONS['iap_currency_exchange_desc'] = 'Exchange fishing marks for regular coins. Rate: 1 = 12';

// ============= BAIT TRANSLATIONS =============
EN_TRANSLATIONS['bait_1_name'] = 'Bread';
EN_TRANSLATIONS['bait_1_type'] = 'Plant';
EN_TRANSLATIONS['bait_1_targets'] = 'peaceful small fish';

EN_TRANSLATIONS['bait_2_name'] = 'Worm';
EN_TRANSLATIONS['bait_2_type'] = 'Animal';
EN_TRANSLATIONS['bait_2_targets'] = 'perch/tench/trout';

EN_TRANSLATIONS['bait_3_name'] = 'Dough/Porridge';
EN_TRANSLATIONS['bait_3_type'] = 'Plant';
EN_TRANSLATIONS['bait_3_targets'] = 'bream/carp';

EN_TRANSLATIONS['bait_4_name'] = 'Corn';
EN_TRANSLATIONS['bait_4_type'] = 'Plant';
EN_TRANSLATIONS['bait_4_targets'] = 'carp/grass carp';

EN_TRANSLATIONS['bait_5_name'] = 'Maggot';
EN_TRANSLATIONS['bait_5_type'] = 'Animal';
EN_TRANSLATIONS['bait_5_targets'] = 'ide/undermouth/white bream';

EN_TRANSLATIONS['bait_6_name'] = 'Insect (Fly)';
EN_TRANSLATIONS['bait_6_type'] = 'Animal';
EN_TRANSLATIONS['bait_6_targets'] = 'grayling/trout';

EN_TRANSLATIONS['bait_7_name'] = 'Live Bait (small fish)';
EN_TRANSLATIONS['bait_7_type'] = 'Animal';
EN_TRANSLATIONS['bait_7_targets'] = 'pike/zander';

EN_TRANSLATIONS['bait_8_name'] = 'Frog';
EN_TRANSLATIONS['bait_8_type'] = 'Animal';
EN_TRANSLATIONS['bait_8_targets'] = 'snakehead/gar';

EN_TRANSLATIONS['bait_9_name'] = 'Shrimp';
EN_TRANSLATIONS['bait_9_type'] = 'Marine';
EN_TRANSLATIONS['bait_9_targets'] = 'sea bass/snapper';

EN_TRANSLATIONS['bait_10_name'] = 'Squid';
EN_TRANSLATIONS['bait_10_type'] = 'Marine';
EN_TRANSLATIONS['bait_10_targets'] = 'amberjack/reef fish';

EN_TRANSLATIONS['bait_11_name'] = 'Fish Fillet';
EN_TRANSLATIONS['bait_11_type'] = 'Animal/Marine';
EN_TRANSLATIONS['bait_11_targets'] = 'catfish/sharks';

EN_TRANSLATIONS['bait_12_name'] = 'Crab Meat';
EN_TRANSLATIONS['bait_12_type'] = 'Marine';
EN_TRANSLATIONS['bait_12_targets'] = 'halibut/cod';

EN_TRANSLATIONS['bait_13_name'] = 'Bonito Strip';
EN_TRANSLATIONS['bait_13_type'] = 'Marine';
EN_TRANSLATIONS['bait_13_targets'] = 'tuna/wahoo';

EN_TRANSLATIONS['bait_14_name'] = 'Octopus Pieces';
EN_TRANSLATIONS['bait_14_type'] = 'Marine';
EN_TRANSLATIONS['bait_14_targets'] = 'sharks/swordfish';

EN_TRANSLATIONS['bait_15_name'] = 'Bloodworm';
EN_TRANSLATIONS['bait_15_type'] = 'Animal';
EN_TRANSLATIONS['bait_15_targets'] = 'roach/crucian/white bream';

EN_TRANSLATIONS['bait_16_name'] = 'Pearl Barley';
EN_TRANSLATIONS['bait_16_type'] = 'Plant';
EN_TRANSLATIONS['bait_16_targets'] = 'crucian/bream/carp';

EN_TRANSLATIONS['bait_17_name'] = 'Semolina';
EN_TRANSLATIONS['bait_17_type'] = 'Plant';
EN_TRANSLATIONS['bait_17_targets'] = 'roach/white bream/undermouth';

EN_TRANSLATIONS['bait_18_name'] = 'Peas';
EN_TRANSLATIONS['bait_18_type'] = 'Plant';
EN_TRANSLATIONS['bait_18_targets'] = 'carp/wild carp/grass carp';

EN_TRANSLATIONS['bait_19_name'] = 'Wheat';
EN_TRANSLATIONS['bait_19_type'] = 'Plant';
EN_TRANSLATIONS['bait_19_targets'] = 'bream/ide/roach';

EN_TRANSLATIONS['bait_20_name'] = 'Grasshopper';
EN_TRANSLATIONS['bait_20_type'] = 'Animal';
EN_TRANSLATIONS['bait_20_targets'] = 'chub/ide/asp';

EN_TRANSLATIONS['bait_21_name'] = 'Locust';
EN_TRANSLATIONS['bait_21_type'] = 'Animal';
EN_TRANSLATIONS['bait_21_targets'] = 'asp/chub/trout';

// Bait descriptions
EN_TRANSLATIONS['bait_1_desc'] = 'Basic plant bait for beginner anglers. Attracts small peaceful fish.';
EN_TRANSLATIONS['bait_2_desc'] = 'Universal animal bait. Effective for perch, tench, and trout.';
EN_TRANSLATIONS['bait_3_desc'] = 'Plant bait for carp species. Good for bream and carp.';
EN_TRANSLATIONS['bait_4_desc'] = 'Premium plant bait. Excellent for carp and grass carp.';
EN_TRANSLATIONS['bait_5_desc'] = 'Animal bait for white fish. Attracts ide, undermouth, and white bream.';
EN_TRANSLATIONS['bait_6_desc'] = 'Insect bait for mountain fish. Perfect for grayling and trout.';
EN_TRANSLATIONS['bait_7_desc'] = 'Live bait for predators. Attracts pike and zander.';
EN_TRANSLATIONS['bait_8_desc'] = 'Swamp bait. Effective for snakehead and gar.';
EN_TRANSLATIONS['bait_9_desc'] = 'Marine bait for coastal fishing. Attracts sea bass and snapper.';
EN_TRANSLATIONS['bait_10_desc'] = 'Marine bait for reef fishing. Good for amberjack and reef fish.';
EN_TRANSLATIONS['bait_11_desc'] = 'Universal predator bait. Attracts catfish and sharks.';
EN_TRANSLATIONS['bait_12_desc'] = 'Marine bottom bait. Effective for halibut and cod.';
EN_TRANSLATIONS['bait_13_desc'] = 'Premium marine bait. Attracts tuna and wahoo.';
EN_TRANSLATIONS['bait_14_desc'] = 'Trophy marine bait. Perfect for sharks and swordfish.';
EN_TRANSLATIONS['bait_15_desc'] = 'Small animal bait. Attracts roach, crucian, and white bream.';
EN_TRANSLATIONS['bait_16_desc'] = 'Grain bait. Good for crucian, bream, and carp.';
EN_TRANSLATIONS['bait_17_desc'] = 'Grain bait. Attracts roach, white bream, and undermouth.';
EN_TRANSLATIONS['bait_18_desc'] = 'Premium grain bait. Excellent for carp, wild carp, and grass carp.';
EN_TRANSLATIONS['bait_19_desc'] = 'Grain bait. Good for bream, ide, and roach.';
EN_TRANSLATIONS['bait_20_desc'] = 'Insect bait. Attracts chub, ide, and asp.';
EN_TRANSLATIONS['bait_21_desc'] = 'Premium insect bait. Effective for asp, chub, and trout.';

// ============= ZONE TRANSLATIONS =============
EN_TRANSLATIONS['zone_1_name'] = 'Village Pond';
EN_TRANSLATIONS['zone_1_desc'] = 'Quiet pond near the village. Perfect place for beginner anglers.';

EN_TRANSLATIONS['zone_2_name'] = 'Carp Lake';
EN_TRANSLATIONS['zone_2_desc'] = 'Lake with abundant carp population. Good place for catching large peaceful fish.';

EN_TRANSLATIONS['zone_3_name'] = 'Mountain River';
EN_TRANSLATIONS['zone_3_desc'] = 'Fast mountain river with cold water. Home to trout and grayling.';

EN_TRANSLATIONS['zone_4_name'] = 'Cold Stream';
EN_TRANSLATIONS['zone_4_desc'] = 'Cold mountain stream with crystal clear water. Habitat of noble fish species.';

EN_TRANSLATIONS['zone_5_name'] = 'Carp Pond';
EN_TRANSLATIONS['zone_5_desc'] = 'Large pond with trophy carp. Paradise for carp anglers.';

EN_TRANSLATIONS['zone_6_name'] = 'Lake Baikal';
EN_TRANSLATIONS['zone_6_desc'] = 'Deepest lake in the world. Home to unique endemic species.';

EN_TRANSLATIONS['zone_7_name'] = 'Northern River';
EN_TRANSLATIONS['zone_7_desc'] = 'Large northern river. Habitat of sturgeon and large catfish.';

EN_TRANSLATIONS['zone_8_name'] = 'Tropical Coast';
EN_TRANSLATIONS['zone_8_desc'] = 'Warm tropical coast. Home to exotic marine species.';

EN_TRANSLATIONS['zone_9_name'] = 'Coral Reef';
EN_TRANSLATIONS['zone_9_desc'] = 'Colorful coral reef. Habitat of bright tropical fish.';

EN_TRANSLATIONS['zone_10_name'] = 'Mediterranean Coast';
EN_TRANSLATIONS['zone_10_desc'] = 'Mediterranean coast. Home to sea bass and dorado.';

EN_TRANSLATIONS['zone_11_name'] = 'Pelagic Zone';
EN_TRANSLATIONS['zone_11_desc'] = 'Open ocean. Habitat of large pelagic predators.';

EN_TRANSLATIONS['zone_12_name'] = 'Swamp';
EN_TRANSLATIONS['zone_12_desc'] = 'Tropical swamp. Home to snakehead and gar.';

EN_TRANSLATIONS['zone_13_name'] = 'Amazon';
EN_TRANSLATIONS['zone_13_desc'] = 'Amazon River. Habitat of piranha and arapaima.';

EN_TRANSLATIONS['zone_14_name'] = 'African Lake';
EN_TRANSLATIONS['zone_14_desc'] = 'Large African lake. Home to Nile perch and tiger fish.';

EN_TRANSLATIONS['zone_15_name'] = 'Congo River';
EN_TRANSLATIONS['zone_15_desc'] = 'Congo River. Habitat of goliath tigerfish.';

EN_TRANSLATIONS['zone_16_name'] = 'Japanese Coast';
EN_TRANSLATIONS['zone_16_desc'] = 'Japanese coast. Home to yellowtail and tuna.';

EN_TRANSLATIONS['zone_17_name'] = 'Northern Seas';
EN_TRANSLATIONS['zone_17_desc'] = 'Cold northern seas. Habitat of cod and halibut.';

EN_TRANSLATIONS['zone_18_name'] = 'Open Ocean';
EN_TRANSLATIONS['zone_18_desc'] = 'Open ocean. Home to marlin and giant tuna.';

EN_TRANSLATIONS['zone_19_name'] = 'Deep Sea';
EN_TRANSLATIONS['zone_19_desc'] = 'Deep ocean waters. Habitat of giant grouper and legendary fish.';

EN_TRANSLATIONS['zone_20_name'] = 'Shark Waters';
EN_TRANSLATIONS['zone_20_desc'] = 'Dangerous waters. Home to great white sharks.';

// ============= MAP SCREEN TRANSLATIONS =============
EN_TRANSLATIONS['map_here'] = '✔ Here';
EN_TRANSLATIONS['map_level'] = 'Level';
EN_TRANSLATIONS['map_locked_level'] = 'Level';

// ============= LOCATION DETAIL MODAL TRANSLATIONS =============
EN_TRANSLATIONS['location_fish_list'] = 'Fish in location:';
EN_TRANSLATIONS['location_no_fish_data'] = 'No fish data';
EN_TRANSLATIONS['location_current'] = '📍 I\'m here';
EN_TRANSLATIONS['location_level_requirement'] = '⭐ Level:';
EN_TRANSLATIONS['location_you_have_coins'] = '(You have: {coins})';
EN_TRANSLATIONS['location_you_have_level'] = '(You have: {level})';
EN_TRANSLATIONS['location_region'] = 'Region:';
EN_TRANSLATIONS['location_biome'] = 'Biome:';
EN_TRANSLATIONS['location_cost'] = 'Cost:';
EN_TRANSLATIONS['location_unlock'] = 'Unlock';
EN_TRANSLATIONS['location_select'] = 'Select';
EN_TRANSLATIONS['location_go_fishing'] = 'Go Fishing';
EN_TRANSLATIONS['location_travel'] = 'Travel';
EN_TRANSLATIONS['location_buy_access'] = 'Buy Access';
EN_TRANSLATIONS['insufficient_level'] = 'Insufficient Level';

// Region translations
EN_TRANSLATIONS['region_europe'] = 'Europe';
EN_TRANSLATIONS['region_siberia'] = 'Siberia';
EN_TRANSLATIONS['region_europe_asia'] = 'Europe/Asia';
EN_TRANSLATIONS['region_tropics'] = 'Tropics';
EN_TRANSLATIONS['region_mediterranean'] = 'Mediterranean';
EN_TRANSLATIONS['region_caribbean'] = 'Caribbean';
EN_TRANSLATIONS['region_usa_south'] = 'USA/South';
EN_TRANSLATIONS['region_south_america'] = 'South America';
EN_TRANSLATIONS['region_africa'] = 'Africa';
EN_TRANSLATIONS['region_japan'] = 'Japan';
EN_TRANSLATIONS['region_north'] = 'North';
EN_TRANSLATIONS['region_ocean'] = 'Ocean';
EN_TRANSLATIONS['region_unknown'] = 'Unknown';

// Biome translations
EN_TRANSLATIONS['biome_pond'] = 'Pond';
EN_TRANSLATIONS['biome_lake'] = 'Lake';
EN_TRANSLATIONS['biome_river'] = 'River';
EN_TRANSLATIONS['biome_mountain_river'] = 'Mountain River';
EN_TRANSLATIONS['biome_delta'] = 'Delta';
EN_TRANSLATIONS['biome_lagoon'] = 'Lagoon';
EN_TRANSLATIONS['biome_reef'] = 'Reef';
EN_TRANSLATIONS['biome_sea'] = 'Sea';
EN_TRANSLATIONS['biome_swamp'] = 'Swamp';
EN_TRANSLATIONS['biome_fjord'] = 'Fjord';
EN_TRANSLATIONS['biome_ocean'] = 'Ocean';
EN_TRANSLATIONS['biome_ocean_deep'] = 'Ocean (Deep)';
EN_TRANSLATIONS['biome_ocean_trophy'] = 'Ocean (Trophy)';
EN_TRANSLATIONS['biome_unknown'] = 'Unknown';
EN_TRANSLATIONS['region_РЇРїРѕРЅРёСЏ'] = 'Japan';
EN_TRANSLATIONS['region_РЎРµРІРµСЂ'] = 'North';
EN_TRANSLATIONS['region_РћРєРµР°РЅ'] = 'Ocean';

// Biome translations
EN_TRANSLATIONS['biome_РџСЂСѓРґ'] = 'Pond';
EN_TRANSLATIONS['biome_РћР·РµСЂРѕ'] = 'Lake';
EN_TRANSLATIONS['biome_Р РµРєР°'] = 'River';
EN_TRANSLATIONS['biome_Р“РѕСЂРЅР°СЏ СЂРµРєР°'] = 'Mountain River';
EN_TRANSLATIONS['biome_Р”РµР»СЊС‚Р°'] = 'Delta';
EN_TRANSLATIONS['biome_Р›Р°РіСѓРЅР°'] = 'Lagoon';
EN_TRANSLATIONS['biome_Р РёС„'] = 'Reef';
EN_TRANSLATIONS['biome_РњРѕСЂРµ'] = 'Sea';
EN_TRANSLATIONS['biome_Р‘РѕР»РѕС‚Рѕ'] = 'Swamp';
EN_TRANSLATIONS['biome_Р¤СЊРѕСЂРґ'] = 'Fjord';
EN_TRANSLATIONS['biome_РћРєРµР°РЅ'] = 'Ocean';
EN_TRANSLATIONS['biome_РћРєРµР°РЅ (РіР»СѓР±СЊ)'] = 'Ocean (Deep)';
EN_TRANSLATIONS['biome_РћРєРµР°РЅ (С‚СЂРѕС„РµРё)'] = 'Ocean (Trophies)';



// ============= ADDITIONAL UI TRANSLATIONS =============
EN_TRANSLATIONS['ui_select_item'] = 'Select item';
EN_TRANSLATIONS['ui_no_items'] = 'No items';
EN_TRANSLATIONS['ui_installed'] = 'Installed';
EN_TRANSLATIONS['ui_not_installed'] = 'Not installed';
EN_TRANSLATIONS['ui_kg'] = 'kg';
EN_TRANSLATIONS['ui_pcs'] = 'pcs';
EN_TRANSLATIONS['ui_type'] = 'Type';
EN_TRANSLATIONS['ui_targets'] = 'Targets';
EN_TRANSLATIONS['ui_description'] = 'Description';
EN_TRANSLATIONS['ui_characteristics'] = 'Characteristics';
EN_TRANSLATIONS['ui_power_cap'] = 'Power Cap';
EN_TRANSLATIONS['ui_accuracy'] = 'Accuracy';
EN_TRANSLATIONS['ui_sensitivity'] = 'Sensitivity';
EN_TRANSLATIONS['ui_stability'] = 'Stability';
EN_TRANSLATIONS['ui_penetration'] = 'Penetration';
EN_TRANSLATIONS['ui_hold_bonus'] = 'Hold Bonus';
EN_TRANSLATIONS['ui_test_kg'] = 'Test';
EN_TRANSLATIONS['ui_abrasion_resist'] = 'Abrasion Resistance';
EN_TRANSLATIONS['ui_drag_kg'] = 'Drag';
EN_TRANSLATIONS['ui_retrieve_speed'] = 'Retrieve Speed';
EN_TRANSLATIONS['ui_smoothness'] = 'Smoothness';
EN_TRANSLATIONS['ui_max_weight'] = 'Max Weight';
EN_TRANSLATIONS['ui_hook_window'] = 'Hook Window';
EN_TRANSLATIONS['ui_cast_bonus'] = 'Cast Bonus';

// ============= SHOP & INVENTORY TRANSLATIONS =============
EN_TRANSLATIONS['shop_level'] = 'Level';
EN_TRANSLATIONS['shop_tier'] = 'T';
EN_TRANSLATIONS['shop_type'] = 'Type';
EN_TRANSLATIONS['shop_durability'] = 'Durability';
EN_TRANSLATIONS['shop_breaking_load'] = 'Breaking Load';
EN_TRANSLATIONS['shop_price'] = 'Price:';
EN_TRANSLATIONS['shop_unlock'] = 'Unlock:';
EN_TRANSLATIONS['shop_unlock_level'] = 'Unlock: Level';
EN_TRANSLATIONS['shop_type_bundle'] = 'Type: Bundle';
EN_TRANSLATIONS['shop_type_gear_bundle'] = 'Type: Gear Bundle';
EN_TRANSLATIONS['shop_type_ad_reward'] = 'Type: Ad Reward';
EN_TRANSLATIONS['shop_type_premium_coins'] = 'Type: Fishing Marks';
EN_TRANSLATIONS['shop_type_exchange'] = 'Type: Currency Exchange';
EN_TRANSLATIONS['shop_regular_coins'] = '{amount} regular coins';
EN_TRANSLATIONS['shop_fishing_marks_amount'] = '{amount} marks';
EN_TRANSLATIONS['shop_exchange'] = 'Exchange';
EN_TRANSLATIONS['shop_regular_price'] = 'Regular price:';
EN_TRANSLATIONS['buy'] = 'Buy';
EN_TRANSLATIONS['exchange'] = 'Exchange';
EN_TRANSLATIONS['insufficient'] = 'Insufficient';
EN_TRANSLATIONS['level'] = 'Level';
// Inventory - Keepnet translations
EN_TRANSLATIONS['keepnet_name'] = 'Keepnet';
EN_TRANSLATIONS['keepnet_desc'] = 'Keepnet for storing caught fish. Upgrade capacity for money.';
EN_TRANSLATIONS['not_required'] = 'Not required';
EN_TRANSLATIONS['select_item'] = 'Select item';
EN_TRANSLATIONS['fish_types'] = 'Fish Types';

// ============= FISHING TIPS TRANSLATIONS =============
// Basic mechanics
EN_TRANSLATIONS['tip_day_night_fishing'] = 'Different fish bite more eagerly at different times of day. Watch the day and night indicator!';
EN_TRANSLATIONS['tip_gear_durability'] = 'Gear durability decreases when fighting fish. Don\'t forget to repair them!';
EN_TRANSLATIONS['tip_fish_weight_xp'] = 'The heavier the fish, the more experience you get for catching it.';
EN_TRANSLATIONS['tip_use_bait'] = 'Use bait to attract specific types of fish.';
EN_TRANSLATIONS['tip_keepnet_capacity'] = 'The keepnet has limited capacity. Sell fish more profitably at the market!';
EN_TRANSLATIONS['tip_rare_fish_locations'] = 'Rare fish are worth more. Look for them in different locations!';
EN_TRANSLATIONS['tip_line_tension'] = 'Line tension shows the load. Don\'t let the line break!';
EN_TRANSLATIONS['tip_upgrade_gear'] = 'Upgrade your gear to catch larger and rarer fish.';
EN_TRANSLATIONS['tip_complete_quests'] = 'Complete quests to get rewards and experience.';
EN_TRANSLATIONS['tip_watch_float'] = 'Watch the float to hook the fish in time!';
EN_TRANSLATIONS['tip_premium_bonuses'] = 'Premium bonuses help increase income and fishing experience.';
EN_TRANSLATIONS['tip_sonar_info'] = 'The sonar shows information about fish at the casting spot.';
EN_TRANSLATIONS['tip_trophy_crafting'] = 'Fish trophies can be made from trophy specimens.';
EN_TRANSLATIONS['tip_unlock_locations'] = 'Unlock new locations to access unique fish species.';
EN_TRANSLATIONS['tip_reel_speed'] = 'The reel affects the line retrieval speed when fighting fish.';
EN_TRANSLATIONS['tip_hook_types'] = 'Different hook types are suitable for different fish species.';
EN_TRANSLATIONS['tip_float_visibility'] = 'The float helps notice bites. Keep an eye on it!';
EN_TRANSLATIONS['tip_monsters_rare'] = 'Monsters are rare but give huge experience and rewards.';
EN_TRANSLATIONS['tip_daily_rewards'] = 'Daily rewards help get free resources.';
EN_TRANSLATIONS['tip_rating_achievements'] = 'Rating shows your achievements among other anglers.';
EN_TRANSLATIONS['tip_bonuses_stack'] = 'Bonuses from ads and gems stack with each other!';
EN_TRANSLATIONS['tip_bait_consumption'] = 'Baits are consumed when casting. Buy them in the shop.';
EN_TRANSLATIONS['tip_gear_level_match'] = 'Gear level should match the location for effective fishing.';
EN_TRANSLATIONS['tip_sell_common_keep_rare'] = 'Sell common fish, but keep rare ones for collection.';
EN_TRANSLATIONS['tip_time_during_fishing'] = 'Time in game passes only during fishing. Plan your fishing!';

// Gear characteristics
EN_TRANSLATIONS['tip_rod_max_weight'] = 'Rod\'s maximum weight determines what fish you can catch.';
EN_TRANSLATIONS['tip_line_strength'] = 'Line strength affects whether it can handle large fish.';
EN_TRANSLATIONS['tip_float_sensitivity'] = 'Float sensitivity helps notice even weak bites.';
EN_TRANSLATIONS['tip_hook_sharpness'] = 'Hook sharpness increases the chance of successful hooking.';
EN_TRANSLATIONS['tip_reel_speed_effect'] = 'Reel speed affects how quickly you can pull in fish.';
EN_TRANSLATIONS['tip_float_capacity'] = 'Float capacity should match the bait weight.';
EN_TRANSLATIONS['tip_hook_size'] = 'Hook size affects what fish it can catch.';
EN_TRANSLATIONS['tip_line_material'] = 'Line material determines its invisibility to fish.';
EN_TRANSLATIONS['tip_float_type'] = 'Different float types have varying sensitivity to bites.';
EN_TRANSLATIONS['tip_reel_quality'] = 'Reel quality affects the smoothness of line retrieval.';
EN_TRANSLATIONS['tip_rod_level'] = 'Higher level rods allow catching heavier fish.';
EN_TRANSLATIONS['tip_rod_stiffness'] = 'Rod stiffness determines how it behaves when fighting fish.';
EN_TRANSLATIONS['tip_line_thickness'] = 'Thin line is less visible to fish but less durable.';
EN_TRANSLATIONS['tip_hook_size_match'] = 'Hook size should match the fish\'s mouth size.';
EN_TRANSLATIONS['tip_float_capacity_match'] = 'Floats with high capacity are suitable for heavy baits.';

// Dependencies and mechanics
EN_TRANSLATIONS['tip_heavy_bait_float'] = 'Heavy baits require floats with higher capacity.';
EN_TRANSLATIONS['tip_large_fish_gear'] = 'Large fish require strong line and sharp hooks.';
EN_TRANSLATIONS['tip_float_fish_preference'] = 'Different fish species prefer different float types.';
EN_TRANSLATIONS['tip_active_fish_bait'] = 'Active fish bite better on moving baits.';
EN_TRANSLATIONS['tip_predator_vs_peaceful'] = 'Predatory fish prefer live baits, peaceful ones prefer plant baits.';
EN_TRANSLATIONS['tip_quality_gear_success'] = 'Quality gear increases chances of successful fishing.';
EN_TRANSLATIONS['tip_current_heavy_float'] = 'Current requires heavier floats for stability.';
EN_TRANSLATIONS['tip_fish_hook_size'] = 'Fish size should match hook size.';
EN_TRANSLATIONS['tip_shy_fish_line'] = 'Shy fish require thin and invisible line.';
EN_TRANSLATIONS['tip_reaction_time'] = 'Reaction time to bites affects hooking success.';

// Main menu sections
EN_TRANSLATIONS['tip_map_locations'] = 'In the \'Map\' section, choose locations with suitable fish.';
EN_TRANSLATIONS['tip_shop_gear'] = 'In the \'Shop\', buy and upgrade gear for better fishing.';
EN_TRANSLATIONS['tip_inventory_management'] = 'The \'Inventory\' section helps manage caught fish and gear.';
EN_TRANSLATIONS['tip_quests_rewards'] = 'In \'Quests\', get objectives and rewards for completing them.';
EN_TRANSLATIONS['tip_collection_fish'] = 'The \'Collection\' section shows all caught fish and their characteristics.';
EN_TRANSLATIONS['tip_trophies_crafting'] = 'In \'Trophies\', create mounts from the largest specimens.';
EN_TRANSLATIONS['tip_rating_progress'] = 'The \'Rating\' section shows your achievements and rank among players.';
EN_TRANSLATIONS['tip_profile_stats'] = 'In \'Profile\', track statistics and game progress.';
EN_TRANSLATIONS['tip_settings_customize'] = 'The \'Settings\' section allows customizing the game to your preferences.';
EN_TRANSLATIONS['tip_daily_rewards_free'] = 'In \'Daily Rewards\', get free resources every day.';

// Trophy room
EN_TRANSLATIONS['ui_trophy_room'] = 'Trophy Room';
EN_TRANSLATIONS['ui_fish_list'] = 'Fish';
EN_TRANSLATIONS['ui_trophy_list'] = 'Trophies';
EN_TRANSLATIONS['ui_click_to_craft'] = 'Click - craft';
EN_TRANSLATIONS['ui_hold_to_drag'] = 'Hold to drag';
EN_TRANSLATIONS['ui_slot_locked'] = 'Slot Locked';
EN_TRANSLATIONS['ui_crafting_trophy'] = 'Crafting Trophy';
EN_TRANSLATIONS['ui_make_trophy'] = 'Make Trophy';
EN_TRANSLATIONS['ui_selling_trophy'] = 'Selling Trophy';
EN_TRANSLATIONS['ui_trophy'] = 'Trophy';
EN_TRANSLATIONS['ui_rarity'] = 'Rarity';
EN_TRANSLATIONS['ui_hide_lists'] = 'Hide Lists';
EN_TRANSLATIONS['ui_show_lists'] = 'Show Lists';

// Shop specific
EN_TRANSLATIONS['ui_fish_for_bait'] = 'Fish for this bait';
EN_TRANSLATIONS['ui_exchange'] = 'Exchange';
EN_TRANSLATIONS['ui_exchange_rate'] = 'Exchange Rate';
EN_TRANSLATIONS['exchange_rate'] = 'Rate';
EN_TRANSLATIONS['ui_you_get'] = 'You get';
EN_TRANSLATIONS['ui_you_pay'] = 'You pay';
EN_TRANSLATIONS['ui_watch_ad'] = 'Watch\nAd';
EN_TRANSLATIONS['ui_progress'] = 'Progress';

// Shop bundle contents
EN_TRANSLATIONS['shop_contents'] = 'Contents:';
EN_TRANSLATIONS['shop_includes'] = 'Includes:';
EN_TRANSLATIONS['shop_premium'] = 'premium';
EN_TRANSLATIONS['shop_regular'] = 'regular';
EN_TRANSLATIONS['shop_energy_drink'] = 'energy drink';
EN_TRANSLATIONS['shop_groundbait'] = 'groundbait';
EN_TRANSLATIONS['shop_no_ads'] = 'No ads';
EN_TRANSLATIONS['shop_discount'] = 'Discount:';

// Inventory specific
EN_TRANSLATIONS['ui_repair_cost'] = 'Repair Cost';
EN_TRANSLATIONS['ui_sell_price'] = 'Sell Price';
EN_TRANSLATIONS['ui_upgrade_cost'] = 'Upgrade Cost';
EN_TRANSLATIONS['ui_next_capacity'] = 'Next Capacity';

// Market specific
EN_TRANSLATIONS['ui_base_price'] = 'Base Price';
EN_TRANSLATIONS['ui_current_price'] = 'Current Price';
EN_TRANSLATIONS['ui_price_multiplier'] = 'Price Multiplier';

// Quest specific
EN_TRANSLATIONS['ui_catch_fish'] = 'Catch';
EN_TRANSLATIONS['ui_find_items'] = 'Find items';
EN_TRANSLATIONS['ui_catch_monsters'] = 'Catch monsters';
EN_TRANSLATIONS['ui_insufficient_gems'] = 'Insufficient gems';
EN_TRANSLATIONS['ui_quests_updated'] = 'Quests updated!';

// Daily rewards specific
EN_TRANSLATIONS['ui_reward'] = 'Reward';
EN_TRANSLATIONS['ui_claimed'] = 'Claimed';
EN_TRANSLATIONS['ui_feed_bonus'] = 'Feed bonus';
EN_TRANSLATIONS['ui_energy_drink'] = 'Energy drink';
EN_TRANSLATIONS['ui_repair_kit'] = 'Repair kit';
EN_TRANSLATIONS['ui_blood'] = 'Blood';

// Collection specific
EN_TRANSLATIONS['ui_species'] = 'Species';
EN_TRANSLATIONS['ui_total'] = 'Total';
EN_TRANSLATIONS['ui_discovered'] = 'Discovered';

// Profile specific
EN_TRANSLATIONS['ui_statistics'] = 'Statistics';
EN_TRANSLATIONS['ui_achievements'] = 'Achievements';
EN_TRANSLATIONS['ui_hours'] = 'hours';
EN_TRANSLATIONS['ui_minutes'] = 'minutes';
EN_TRANSLATIONS['ui_excellent'] = 'Excellent';
EN_TRANSLATIONS['ui_good'] = 'Good';
EN_TRANSLATIONS['ui_average'] = 'Average';
EN_TRANSLATIONS['ui_poor'] = 'Poor';
EN_TRANSLATIONS['ui_very_poor'] = 'Very Poor';

// Settings
EN_TRANSLATIONS['ui_settings_title'] = 'SETTINGS';
EN_TRANSLATIONS['ui_sound'] = 'Sound';
EN_TRANSLATIONS['ui_music'] = 'Music';
EN_TRANSLATIONS['ui_ambient'] = 'Ambient';
EN_TRANSLATIONS['ui_other_games'] = 'Other Games';
EN_TRANSLATIONS['ui_language'] = 'Language';
EN_TRANSLATIONS['ui_russian'] = 'Russian';
EN_TRANSLATIONS['ui_english'] = 'English';
EN_TRANSLATIONS['ui_reset_progress'] = 'Reset Progress';
EN_TRANSLATIONS['ui_confirm_reset'] = 'Are you sure you want to reset all progress?';
EN_TRANSLATIONS['ui_level'] = 'Level';
EN_TRANSLATIONS['ui_insufficient'] = 'Insufficient';
EN_TRANSLATIONS['ui_claim_reward'] = 'Claim Reward';
EN_TRANSLATIONS['watch_ad'] = 'Watch\nAd';
EN_TRANSLATIONS['claim_reward'] = 'Claim Reward';
EN_TRANSLATIONS['ui_insufficient_level'] = 'Insufficient Level';

// Messages
EN_TRANSLATIONS['msg_no_bait'] = 'No bait!';
EN_TRANSLATIONS['msg_fish_escaped'] = 'Fish escaped!';
EN_TRANSLATIONS['msg_line_broken'] = 'Line broken!';
EN_TRANSLATIONS['msg_keepnet_full'] = 'Keepnet is full!';
EN_TRANSLATIONS['msg_not_enough_coins'] = 'Not enough coins';
EN_TRANSLATIONS['msg_not_enough_gems'] = 'Not enough gems';
EN_TRANSLATIONS['msg_purchase_success'] = 'Purchase successful!';
EN_TRANSLATIONS['msg_level_up'] = 'Level Up!';

// Daily Rewards
EN_TRANSLATIONS['ui_reward_available'] = 'Reward available!';
EN_TRANSLATIONS['ui_come_back_tomorrow'] = 'Come back tomorrow!';
EN_TRANSLATIONS['ui_miss_day_warning'] = 'Miss one day - progress will reset!';

// Fishing Tips
EN_TRANSLATIONS['ui_tip'] = 'Tip';

// Tutorial messages
EN_TRANSLATIONS['tutorial_cast'] = 'Click on the water to cast';
EN_TRANSLATIONS['tutorial_hook'] = 'Click to hook the fish!';
EN_TRANSLATIONS['tutorial_reel'] = 'Hold the reel! Watch the tension!';
EN_TRANSLATIONS['msg_no_bait_no_bites'] = 'No bait! No bites will come';
EN_TRANSLATIONS['msg_waiting_for_bite'] = 'Waiting for a bite...';
EN_TRANSLATIONS['msg_no_fish_here'] = 'No fish here...';
EN_TRANSLATIONS['msg_wait_for_strong_dip'] = 'Wait for a strong dip!';
EN_TRANSLATIONS['msg_bite'] = 'Bite!';
EN_TRANSLATIONS['msg_now_hook'] = 'NOW! Hook it!';
EN_TRANSLATIONS['msg_bait_eaten'] = 'Bait eaten!';
EN_TRANSLATIONS['msg_miss'] = 'Miss!';
EN_TRANSLATIONS['msg_great_pull'] = 'Great! Pull!';
EN_TRANSLATIONS['msg_hold_reel'] = 'Hold the reel!';
EN_TRANSLATIONS['msg_all_fish_released'] = 'All fish released!';
EN_TRANSLATIONS['msg_all_fish_sold'] = 'All fish sold!';
EN_TRANSLATIONS['msg_equipped'] = 'equipped!';
EN_TRANSLATIONS['msg_keepnet_full'] = 'Keepnet is full! Free up space.';
EN_TRANSLATIONS['msg_fish_jerks'] = 'Fish jerks!';
EN_TRANSLATIONS['msg_retracting_rod'] = 'Retracting rod...';
EN_TRANSLATIONS['msg_broke'] = 'broke!';

// Fishing hints (without msg_ prefix for direct use)
EN_TRANSLATIONS['waiting_for_bite'] = 'Waiting for bite...';
EN_TRANSLATIONS['no_bait_no_bites'] = 'No bait! No bites will occur';
EN_TRANSLATIONS['no_fish_here'] = 'No fish here...';
EN_TRANSLATIONS['wait_for_strong_dip'] = 'Wait for strong dip!';
EN_TRANSLATIONS['bite'] = 'Bite!';
EN_TRANSLATIONS['fish_escaped'] = 'Fish escaped!';
EN_TRANSLATIONS['now_hook'] = 'NOW! Hook it!';
EN_TRANSLATIONS['bait_eaten'] = 'Bait eaten!';
EN_TRANSLATIONS['miss'] = 'Miss!';
EN_TRANSLATIONS['ui_miss'] = 'Miss!';
EN_TRANSLATIONS['no_bait'] = 'No bait!';
EN_TRANSLATIONS['great_pull'] = 'Great! Pull!';
EN_TRANSLATIONS['hold_reel'] = 'Hold the reel!';
EN_TRANSLATIONS['all_fish_released'] = 'All fish released!';
EN_TRANSLATIONS['all_fish_sold'] = 'All fish sold!';
EN_TRANSLATIONS['keepnet_full'] = 'Keepnet is full! Free up space.';
EN_TRANSLATIONS['fish_jerks'] = 'Fish jerks!';
EN_TRANSLATIONS['retracting_rod'] = 'Retracting rod...';
EN_TRANSLATIONS['line_broken'] = 'Line broken!';
EN_TRANSLATIONS['broke'] = 'broke!';

// Gear types
EN_TRANSLATIONS['gear_rod'] = 'Rod';
EN_TRANSLATIONS['gear_line'] = 'Line';
EN_TRANSLATIONS['gear_hook'] = 'Hook';
EN_TRANSLATIONS['gear_reel'] = 'Reel';
EN_TRANSLATIONS['gear_float'] = 'Float';

// Fishing UI
EN_TRANSLATIONS['ui_casting'] = 'Casting...';
EN_TRANSLATIONS['ui_waiting'] = 'Waiting for bite...';
EN_TRANSLATIONS['ui_fighting'] = 'Fighting!';
EN_TRANSLATIONS['ui_reeling'] = 'Reeling in...';
EN_TRANSLATIONS['ui_caught'] = 'Caught!';
EN_TRANSLATIONS['ui_line_broken'] = 'Line Broken!';
EN_TRANSLATIONS['ui_fish_escaped'] = 'Fish Escaped!';
EN_TRANSLATIONS['ui_keepnet_capacity'] = 'Keepnet Capacity';
EN_TRANSLATIONS['ui_change_gear'] = 'Change Gear';
EN_TRANSLATIONS['ui_bonuses'] = 'Bonuses';
EN_TRANSLATIONS['ui_no_bait'] = 'No Bait!';
EN_TRANSLATIONS['ui_select_bait'] = 'Select Bait';

// Button labels
EN_TRANSLATIONS['ui_play_button'] = 'Play';
EN_TRANSLATIONS['ui_locations'] = 'Locations';
EN_TRANSLATIONS['ui_encyclopedia'] = 'Encyclopedia';

// Time display
EN_TRANSLATIONS['ui_time_until_update'] = 'Update in';
EN_TRANSLATIONS['ui_time_until_reset'] = 'Reset in';
EN_TRANSLATIONS['ui_days'] = 'days';
EN_TRANSLATIONS['ui_day_short'] = 'd';
EN_TRANSLATIONS['ui_hours_short'] = 'h';
EN_TRANSLATIONS['ui_minutes_short'] = 'm';
EN_TRANSLATIONS['ui_seconds_short'] = 's';

// Messages and notifications
EN_TRANSLATIONS['msg_item_purchased'] = 'Item purchased!';
EN_TRANSLATIONS['msg_item_equipped'] = 'Item equipped!';
EN_TRANSLATIONS['msg_item_repaired'] = 'Item repaired!';
EN_TRANSLATIONS['msg_item_sold'] = 'Item sold!';
EN_TRANSLATIONS['msg_trophy_created'] = 'Trophy created!';
EN_TRANSLATIONS['msg_trophy_installed'] = 'Trophy installed!';
EN_TRANSLATIONS['msg_trophy_removed'] = 'Trophy removed!';
EN_TRANSLATIONS['msg_trophy_sold'] = 'Trophy sold!';
EN_TRANSLATIONS['msg_slot_unlocked'] = 'Slot unlocked!';
EN_TRANSLATIONS['msg_location_unlocked'] = 'Location unlocked!';
EN_TRANSLATIONS['msg_new_fish'] = 'New fish discovered!';
EN_TRANSLATIONS['msg_new_monster'] = 'New monster discovered!';
EN_TRANSLATIONS['msg_new_item'] = 'New item discovered!';
EN_TRANSLATIONS['msg_gear_broken'] = 'Gear broken!';
EN_TRANSLATIONS['msg_bait_depleted'] = 'Bait depleted!';

// Gear condition
EN_TRANSLATIONS['ui_condition_excellent'] = 'Excellent';
EN_TRANSLATIONS['ui_condition_good'] = 'Good';
EN_TRANSLATIONS['ui_condition_fair'] = 'Fair';
EN_TRANSLATIONS['ui_condition_poor'] = 'Poor';
EN_TRANSLATIONS['ui_condition_broken'] = 'Broken';

// Location status
EN_TRANSLATIONS['ui_locked'] = 'Locked';
EN_TRANSLATIONS['ui_unlocked'] = 'Unlocked';
EN_TRANSLATIONS['ui_unlock_cost'] = 'Unlock Cost';
EN_TRANSLATIONS['ui_required_level'] = 'Required Level';

// Rarity translations
EN_TRANSLATIONS['ui_rarity_common'] = 'Common';
EN_TRANSLATIONS['ui_rarity_uncommon'] = 'Uncommon';
EN_TRANSLATIONS['ui_rarity_rare'] = 'Rare';
EN_TRANSLATIONS['ui_rarity_epic'] = 'Epic';
EN_TRANSLATIONS['ui_rarity_legendary'] = 'Legendary';

// Rating prompt system
EN_TRANSLATIONS['rating_prompt_title'] = '⭐ Rate the Game! ⭐';
EN_TRANSLATIONS['rating_prompt_message'] = 'Do you like our game?\nPlease rate it!';
EN_TRANSLATIONS['rating_prompt_rate_button'] = 'Rate Game';
EN_TRANSLATIONS['rating_prompt_later_button'] = 'Later';

// ============= COLLECTION UI TRANSLATIONS =============
EN_TRANSLATIONS['collection_title'] = 'ENCYCLOPEDIA';
EN_TRANSLATIONS['fish_tab'] = 'Fish';
EN_TRANSLATIONS['monsters_tab'] = 'Monsters';
EN_TRANSLATIONS['items_tab'] = 'Items';
EN_TRANSLATIONS['collection_empty'] = 'Empty for now';
EN_TRANSLATIONS['collection_select_entry'] = 'Select an entry';
EN_TRANSLATIONS['collection_not_caught_fish'] = 'Not caught';
EN_TRANSLATIONS['collection_not_caught_monster'] = 'Not caught';
EN_TRANSLATIONS['collection_not_found_item'] = 'Not found';
EN_TRANSLATIONS['collection_not_found'] = 'Not found';
EN_TRANSLATIONS['collection_catch_fish_to_unlock'] = 'Catch this fish to';
EN_TRANSLATIONS['collection_unlock_info'] = 'unlock information';
EN_TRANSLATIONS['collection_find_item_to_unlock'] = 'Find this item to';
EN_TRANSLATIONS['collection_find_to_unlock'] = 'Find this to';
EN_TRANSLATIONS['collection_weight'] = 'Weight:';
EN_TRANSLATIONS['collection_power'] = 'Power:';
EN_TRANSLATIONS['collection_role'] = 'Role:';
EN_TRANSLATIONS['collection_time'] = 'Time:';
EN_TRANSLATIONS['collection_bite'] = 'Bite:';
EN_TRANSLATIONS['collection_reward'] = 'Reward:';
EN_TRANSLATIONS['collection_xp'] = 'XP:';
EN_TRANSLATIONS['collection_sell_price'] = 'Sell Price:';
EN_TRANSLATIONS['collection_zones'] = 'Zones:';
EN_TRANSLATIONS['collection_zones_unknown'] = 'Zones: unknown';
EN_TRANSLATIONS['collection_role_peace'] = 'Peaceful';
EN_TRANSLATIONS['collection_role_pred'] = 'Predator';
EN_TRANSLATIONS['collection_role_bottom'] = 'Bottom';

// ============= TROPHY UI TRANSLATIONS =============
EN_TRANSLATIONS['fish_list'] = 'Fish';
EN_TRANSLATIONS['trophy_list'] = 'Trophies';
EN_TRANSLATIONS['crafting_trophy'] = 'Crafting Trophy';
EN_TRANSLATIONS['selling_trophy'] = 'Selling Trophy';
EN_TRANSLATIONS['trophy_room'] = 'Trophy Room';
EN_TRANSLATIONS['trophy_click_to_craft'] = 'Click - craft';
EN_TRANSLATIONS['trophy_hold_to_drag'] = 'Hold to drag';
EN_TRANSLATIONS['trophy_weight'] = 'Weight:';
EN_TRANSLATIONS['trophy_cost'] = 'Cost:';

// ============= QUEST UI TRANSLATIONS =============
EN_TRANSLATIONS['quests'] = 'QUESTS';
EN_TRANSLATIONS['daily_quests'] = 'Daily';
EN_TRANSLATIONS['weekly_quests'] = 'Weekly';
EN_TRANSLATIONS['quest_progress'] = 'Progress:';
EN_TRANSLATIONS['quest_reward'] = 'Reward:';
EN_TRANSLATIONS['quest_select_to_view'] = 'Select a quest to view details';
EN_TRANSLATIONS['quest_until_update'] = 'Until update:';
EN_TRANSLATIONS['quest_skip_day'] = 'Skip day (';
EN_TRANSLATIONS['quest_skip_week'] = 'Skip week (';
EN_TRANSLATIONS['quest_claim_reward'] = 'Claim Reward';

// ============= DAILY REWARDS UI TRANSLATIONS =============
EN_TRANSLATIONS['daily_rewards'] = 'Daily Rewards';
EN_TRANSLATIONS['day'] = 'Day';
EN_TRANSLATIONS['reward_available'] = 'Reward available!';
EN_TRANSLATIONS['come_back_tomorrow'] = 'Come back tomorrow!';
EN_TRANSLATIONS['miss_day_warning'] = 'Miss one day - progress will reset!';
EN_TRANSLATIONS['daily_reward_repair_kit'] = 'Repair Kit';
EN_TRANSLATIONS['claim_reward'] = 'Claim!';

// Daily Rewards - gear names
EN_TRANSLATIONS['gear_hook_2_name'] = 'Hook #8';
EN_TRANSLATIONS['gear_hook_3_name'] = 'Hook #6';
EN_TRANSLATIONS['gear_line_2_name'] = 'Line 0.18';
EN_TRANSLATIONS['gear_line_3_name'] = 'Line 0.20';
EN_TRANSLATIONS['gear_rod_3_name'] = 'Glass Rod';
EN_TRANSLATIONS['gear_rod_5_name'] = 'Carbon Rod';
EN_TRANSLATIONS['gear_float_2_name'] = 'Float 3g';
EN_TRANSLATIONS['gear_float_3_name'] = 'Float 5g';

// ============= SETTINGS UI TRANSLATIONS =============
EN_TRANSLATIONS['settings'] = 'Settings';
EN_TRANSLATIONS['sound'] = 'Sound';
EN_TRANSLATIONS['music'] = 'Music';
EN_TRANSLATIONS['ambient'] = 'Ambient';
EN_TRANSLATIONS['other_games'] = 'Other Games';

// ============= PROFILE UI TRANSLATIONS (without ui_ prefix) =============
EN_TRANSLATIONS['profile_title'] = 'PLAYER PROFILE';
EN_TRANSLATIONS['level'] = 'Level';
EN_TRANSLATIONS['total_fish_caught'] = 'Total Fish Caught';
EN_TRANSLATIONS['total_monsters_caught'] = 'Total Monsters Caught';
EN_TRANSLATIONS['total_items_caught'] = 'Total Items Caught';
EN_TRANSLATIONS['heaviest_fish'] = 'Heaviest Fish';
EN_TRANSLATIONS['quests_completed'] = 'Quests Completed';
EN_TRANSLATIONS['locations_unlocked'] = 'Locations Unlocked';
EN_TRANSLATIONS['mastery'] = 'Mastery';
EN_TRANSLATIONS['total_earned'] = 'Total Earned';
EN_TRANSLATIONS['play_time'] = 'Play Time';
EN_TRANSLATIONS['mastery_info'] = 'Mastery';
EN_TRANSLATIONS['mastery_desc'] = 'Ratio of caught fish to escaped';
EN_TRANSLATIONS['mastery_ratio'] = 'Ratio of caught fish to escaped: {caught} / {escaped}';
EN_TRANSLATIONS['none_yet'] = 'None yet';
EN_TRANSLATIONS['kg'] = 'kg';

// ============= RATING UI TRANSLATIONS (without ui_ prefix) =============
EN_TRANSLATIONS['rating_title'] = 'Player Rating';
EN_TRANSLATIONS['rating_levels'] = '📊 Levels';
EN_TRANSLATIONS['rating_weight'] = '⚖️ Fish Weight';
EN_TRANSLATIONS['rating_total_fish'] = 'Total\nCaught';
EN_TRANSLATIONS['rating_businessman'] = '💰 Businessman';
EN_TRANSLATIONS['rating_antirating'] = '💔 Anti-rating';
EN_TRANSLATIONS['loading'] = 'Loading...';
EN_TRANSLATIONS['loading_rating'] = 'Loading rating...';
EN_TRANSLATIONS['your_position'] = 'Your position:';
EN_TRANSLATIONS['top_by_level'] = 'Top players by level';
EN_TRANSLATIONS['top_by_weight'] = 'Top by heaviest fish weight';
EN_TRANSLATIONS['top_by_total_fish'] = 'Top by number of caught fish';
EN_TRANSLATIONS['top_by_coins'] = 'Top by earned coins';
EN_TRANSLATIONS['top_by_fails'] = 'Top by number of fish escapes';
EN_TRANSLATIONS['record'] = 'Record';
EN_TRANSLATIONS['caught'] = 'Caught';
EN_TRANSLATIONS['earned'] = 'Earned';
EN_TRANSLATIONS['escapes'] = 'Escapes';
EN_TRANSLATIONS['fish_plural'] = 'fish';
EN_TRANSLATIONS['close'] = 'Close';
EN_TRANSLATIONS['level_abbr'] = 'Lv.';
EN_TRANSLATIONS['not_authorized'] = 'Not authorized';
EN_TRANSLATIONS['leaderboard_auth_required'] = 'Log in to view the leaderboard';
EN_TRANSLATIONS['leaderboard_auth_hint'] = 'Leaderboard is only available to authorized players';
EN_TRANSLATIONS['leaderboard_empty'] = 'Leaderboard is empty';
EN_TRANSLATIONS['leaderboard_empty_hint'] = 'Play and become the first on the list!';
EN_TRANSLATIONS['you'] = 'You';
EN_TRANSLATIONS['player'] = 'Player';

EN_TRANSLATIONS['hook_size'] = 'Size';

// ============= CATCH MODAL TRANSLATIONS =============
EN_TRANSLATIONS['catch_title'] = 'CATCH!';
EN_TRANSLATIONS['catch_weight'] = 'Weight';
EN_TRANSLATIONS['catch_coins'] = 'coins';
EN_TRANSLATIONS['catch_category'] = 'Category';
EN_TRANSLATIONS['catch_release'] = 'Release';
EN_TRANSLATIONS['catch_sell'] = 'Sell';
EN_TRANSLATIONS['catch_store'] = 'Keep';
EN_TRANSLATIONS['catch_release_xp'] = 'Release: +{xp} XP';
EN_TRANSLATIONS['catch_sell_xp'] = 'Sell: +{xp} XP';
EN_TRANSLATIONS['catch_junk_info'] = 'Items can only be sold';

// Collection UI translations
EN_TRANSLATIONS['collection_title'] = 'ENCYCLOPEDIA';
EN_TRANSLATIONS['collection_empty'] = 'Empty for now';
EN_TRANSLATIONS['collection_select_entry'] = 'Select an entry';
EN_TRANSLATIONS['collection_catch_fish_to_unlock'] = 'Catch this fish to';
EN_TRANSLATIONS['collection_find_item_to_unlock'] = 'Find this item to';
EN_TRANSLATIONS['collection_find_to_unlock'] = 'Find this to';
EN_TRANSLATIONS['collection_unlock_info'] = 'unlock information';
EN_TRANSLATIONS['collection_not_caught_fish'] = 'Not caught';
EN_TRANSLATIONS['collection_not_caught_monster'] = 'Not caught';
EN_TRANSLATIONS['collection_not_found_item'] = 'Not found';
EN_TRANSLATIONS['collection_not_found'] = 'Not found';
EN_TRANSLATIONS['collection_weight'] = 'Weight:';
EN_TRANSLATIONS['collection_power'] = 'Power:';
EN_TRANSLATIONS['collection_role'] = 'Role:';
EN_TRANSLATIONS['collection_role_peace'] = 'Peaceful';
EN_TRANSLATIONS['collection_role_pred'] = 'Predator';
EN_TRANSLATIONS['collection_role_bottom'] = 'Bottom';
EN_TRANSLATIONS['collection_time'] = 'Time:';
EN_TRANSLATIONS['collection_bite'] = 'Bite:';
EN_TRANSLATIONS['collection_reward'] = 'Reward:';
EN_TRANSLATIONS['collection_xp'] = 'XP:';
EN_TRANSLATIONS['collection_sell_price'] = 'Sell Price:';
EN_TRANSLATIONS['collection_zones'] = 'Zones:';
EN_TRANSLATIONS['collection_zones_unknown'] = 'Zones: unknown';

// Collection tabs
EN_TRANSLATIONS['fish_tab'] = 'Fish';
EN_TRANSLATIONS['monsters_tab'] = 'Monsters';
EN_TRANSLATIONS['items_tab'] = 'Items';

// ============= JUNK/ITEMS TRANSLATIONS =============
// Junk items (9 items)
EN_TRANSLATIONS['junk_1_name'] = 'Rusty Nut';
EN_TRANSLATIONS['junk_1_desc'] = 'Old metal nut covered in rust. Once part of some mechanism, but now lying at the bottom of the water.';
EN_TRANSLATIONS['junk_1_category'] = 'Trash';

EN_TRANSLATIONS['junk_2_name'] = 'Tin Can';
EN_TRANSLATIONS['junk_2_desc'] = 'Empty tin can without a label. Apparently, someone didn\'t care much about ecology and threw it right into the water.';
EN_TRANSLATIONS['junk_2_category'] = 'Trash';

EN_TRANSLATIONS['junk_3_name'] = 'Old Boot';
EN_TRANSLATIONS['junk_3_desc'] = 'Worn leather boot that lost its pair. Wonder how it got into the water? Maybe its owner slipped on the shore?';
EN_TRANSLATIONS['junk_3_category'] = 'Trash';

EN_TRANSLATIONS['junk_4_name'] = 'Rusty Lure';
EN_TRANSLATIONS['junk_4_desc'] = 'Old fishing lure that lost its shine. Apparently, one of the anglers got snagged on a snag and lost their bait.';
EN_TRANSLATIONS['junk_4_category'] = 'Trash';

EN_TRANSLATIONS['junk_5_name'] = 'Broken Phone';
EN_TRANSLATIONS['junk_5_desc'] = 'Old mobile phone with a cracked screen. Probably fell into the water during a selfie on the shore. Now it definitely won\'t turn on.';
EN_TRANSLATIONS['junk_5_category'] = 'Trash';

EN_TRANSLATIONS['junk_6_name'] = 'Lost Watch';
EN_TRANSLATIONS['junk_6_desc'] = 'Elegant wristwatch with leather strap. Although the mechanism is rusted, the case is still in decent condition. Someone was very upset to lose them.';
EN_TRANSLATIONS['junk_6_category'] = 'Rarity';

EN_TRANSLATIONS['junk_7_name'] = 'Ring/Jewelry';
EN_TRANSLATIONS['junk_7_desc'] = 'Beautiful gold ring with a small stone. Perhaps it was an engagement ring or a family heirloom. A real find for a collector!';
EN_TRANSLATIONS['junk_7_category'] = 'Treasure';

EN_TRANSLATIONS['junk_8_name'] = 'Ancient Coin';
EN_TRANSLATIONS['junk_8_desc'] = 'Ancient coin with barely distinguishable symbols. Perhaps it has been lying at the bottom of the water for several centuries. Antique dealers will pay good money for it.';
EN_TRANSLATIONS['junk_8_category'] = 'Treasure';

EN_TRANSLATIONS['junk_9_name'] = 'Engraved Pendant';
EN_TRANSLATIONS['junk_9_desc'] = 'Elegant silver pendant with engraved initials and date. This was clearly dear to the owner\'s heart. A real treasure with a story.';
EN_TRANSLATIONS['junk_9_category'] = 'Treasure';

// ============= MONSTER TRANSLATIONS =============
// Freshwater monsters (Zones 5-7: Europe/Siberia)
EN_TRANSLATIONS['monster_1_name'] = 'Mutant Carp';
EN_TRANSLATIONS['monster_1_desc'] = 'Mutated carp of enormous size. Aggressive and incredibly strong. Inhabits carp lakes of Europe.';

EN_TRANSLATIONS['monster_2_name'] = 'Man-Eater Catfish';
EN_TRANSLATIONS['monster_2_desc'] = 'Legendary catfish rumored to have devoured people. Inhabits deep holes of Baikal and delta.';

EN_TRANSLATIONS['monster_3_name'] = 'Ghost Pike';
EN_TRANSLATIONS['monster_3_desc'] = 'Ghostly pike appearing on foggy days. Attacks with incredible speed in river deltas.';

// Marine monsters (Zones 8-11: Tropics/Mediterranean/Caribbean)
EN_TRANSLATIONS['monster_4_name'] = 'Electric Eel';
EN_TRANSLATIONS['monster_4_desc'] = 'Giant sea eel capable of generating powerful electric discharges. Inhabits mangrove thickets.';

EN_TRANSLATIONS['monster_5_name'] = 'Titan Barracuda';
EN_TRANSLATIONS['monster_5_desc'] = 'Giant barracuda with incredible speed. Attacks lightning-fast in tropical waters.';

EN_TRANSLATIONS['monster_6_name'] = 'Giant Grouper';
EN_TRANSLATIONS['monster_6_desc'] = 'Giant reef grouper. Inhabits deep coral crevices, incredibly strong.';

EN_TRANSLATIONS['monster_7_name'] = 'Mutant Manta Ray';
EN_TRANSLATIONS['monster_7_desc'] = 'Giant manta ray with abnormal size. Inhabits Mediterranean Sea and Caribbean.';

// Freshwater monsters (Zones 12-15: Swamps/Amazon/Africa)
EN_TRANSLATIONS['monster_8_name'] = 'Alligator Gar';
EN_TRANSLATIONS['monster_8_desc'] = 'Ancient fish with alligator teeth. Inhabits swamps and oxbows, incredibly aggressive.';

EN_TRANSLATIONS['monster_9_name'] = 'Titan Arapaima';
EN_TRANSLATIONS['monster_9_desc'] = 'Ancient arapaima of incredible size. Living fossil of Amazon, can breathe air.';

EN_TRANSLATIONS['monster_10_name'] = 'Piranha Queen';
EN_TRANSLATIONS['monster_10_desc'] = 'Mother of Amazon piranha school. Aggressive and deadly dangerous, attacks lightning-fast.';

EN_TRANSLATIONS['monster_11_name'] = 'Nile Dragon';
EN_TRANSLATIONS['monster_11_desc'] = 'Giant Nile perch called dragon. Inhabits Lake Victoria, can swallow a human.';

EN_TRANSLATIONS['monster_12_name'] = 'Goliath Demon';
EN_TRANSLATIONS['monster_12_desc'] = 'Legendary goliath tiger with demon teeth. Most dangerous predator of Congo River.';

// Marine monsters (Zones 16-20: Ocean)
EN_TRANSLATIONS['monster_13_name'] = 'Berserker Tuna';
EN_TRANSLATIONS['monster_13_desc'] = 'Huge tuna with incredible strength. Can drag a boat for hours in open ocean.';

EN_TRANSLATIONS['monster_14_name'] = 'Ghost Marlin';
EN_TRANSLATIONS['monster_14_desc'] = 'Legendary white marlin that no one can catch. Ghost of the ocean.';

EN_TRANSLATIONS['monster_15_name'] = 'Titan Swordfish';
EN_TRANSLATIONS['monster_15_desc'] = 'Giant swordfish with blade as long as human height. Pierces boats.';

EN_TRANSLATIONS['monster_16_name'] = 'Man-Eater Shark';
EN_TRANSLATIONS['monster_16_desc'] = 'White man-eater shark. Most dangerous ocean predator with bloody reputation.';

EN_TRANSLATIONS['monster_17_name'] = 'Alpha Hammerhead';
EN_TRANSLATIONS['monster_17_desc'] = 'Alpha male hammerhead shark. Pack leader, incredibly aggressive.';

EN_TRANSLATIONS['monster_18_name'] = 'Ghost Megalodon';
EN_TRANSLATIONS['monster_18_desc'] = 'Ghost of extinct megalodon. Living legend that should not exist.';

EN_TRANSLATIONS['monster_19_name'] = 'Kraken Spawn';
EN_TRANSLATIONS['monster_19_desc'] = 'Young kraken. Even spawn of this monster can sink a ship.';

EN_TRANSLATIONS['monster_20_name'] = 'Lord of the Abyss';
EN_TRANSLATIONS['monster_20_desc'] = 'Absolute evil of the ocean. Ancient being ruling the abyss. Final boss.';

// ============= BONUS INVENTORY TRANSLATIONS =============
EN_TRANSLATIONS['bonus_title'] = 'Bonuses';
EN_TRANSLATIONS['bonus_select'] = 'Select bonus';
EN_TRANSLATIONS['bonus_active'] = 'Active';
EN_TRANSLATIONS['bonus_available'] = 'Available';
EN_TRANSLATIONS['bonus_permanent'] = 'Permanent effect';
EN_TRANSLATIONS['bonus_duration'] = 'Duration';
EN_TRANSLATIONS['bonus_minutes'] = 'minutes';
EN_TRANSLATIONS['bonus_use'] = 'Use';
EN_TRANSLATIONS['bonus_apply'] = 'Apply';
EN_TRANSLATIONS['bonus_install'] = 'Install';
EN_TRANSLATIONS['bonus_remove'] = 'Remove';
EN_TRANSLATIONS['bonus_not_available'] = 'Not available';

// Bonus items (Premium items)
EN_TRANSLATIONS['bonus_energizer_name'] = 'Energy Drink';
EN_TRANSLATIONS['bonus_energizer_desc'] = 'Gives +15% power boost for 10 minutes. Makes it easier to pull out fish.';

EN_TRANSLATIONS['bonus_bait_booster_name'] = 'Groundbait';
EN_TRANSLATIONS['bonus_bait_booster_desc'] = 'Fish bite more often for 10 minutes. Increases bite frequency.';

EN_TRANSLATIONS['bonus_lucky_coin_name'] = 'Lucky Coin';
EN_TRANSLATIONS['bonus_lucky_coin_desc'] = 'Gives luck and a small chance to catch treasures for 1 hour.';

EN_TRANSLATIONS['bonus_blood_name'] = 'Blood';
EN_TRANSLATIONS['bonus_blood_desc'] = 'Increases chance to catch monster fish for 10 minutes.';

EN_TRANSLATIONS['bonus_sonar_basic_name'] = 'Sonar';
EN_TRANSLATIONS['bonus_sonar_basic_desc'] = 'Shows possible weight and number of fish at casting spot. Always active when selected.';

EN_TRANSLATIONS['bonus_sonar_advanced_name'] = 'Sonar Lv.2';
EN_TRANSLATIONS['bonus_sonar_advanced_desc'] = 'Shows possible weight, number and species of fish at casting spot. Always active when selected.';

EN_TRANSLATIONS['bonus_compass_name'] = 'Compass';
EN_TRANSLATIONS['bonus_compass_desc'] = '"Fish" compass, shows number of fish at casting spot. Always active when selected.';

EN_TRANSLATIONS['bonus_coffee_thermos_name'] = 'Coffee Thermos';
EN_TRANSLATIONS['bonus_coffee_thermos_desc'] = 'Invigorates, perfect time to fish for night fish, lasts 10 minutes.';

EN_TRANSLATIONS['bonus_fish_scanner_name'] = 'Fish Scanner';
EN_TRANSLATIONS['bonus_fish_scanner_desc'] = 'Shows fish species during bite. Always active when selected.';

EN_TRANSLATIONS['bonus_travel_map_name'] = 'Map';
EN_TRANSLATIONS['bonus_travel_map_desc'] = 'Map of short routes to fishing spots. Permanent discount on location travel.';

EN_TRANSLATIONS['bonus_repair_kit_name'] = 'Repair Kit';
EN_TRANSLATIONS['bonus_repair_kit_desc'] = 'Repairs all gear currently equipped.';

EN_TRANSLATIONS['bonus_glue_name'] = 'Glue';
EN_TRANSLATIONS['bonus_glue_desc'] = 'Repairs the most worn gear currently equipped.';

EN_TRANSLATIONS['bonus_lucky_charm_name'] = 'Lucky Charm';
EN_TRANSLATIONS['bonus_lucky_charm_desc'] = 'Rare fish bite more often for 10 minutes. Increases bite frequency.';

EN_TRANSLATIONS['bonus_lucky_wallet_name'] = 'Lucky Wallet';
EN_TRANSLATIONS['bonus_lucky_wallet_desc'] = 'Selling fish while fishing is more profitable for 10 minutes. Increases fish price by +20% while fishing.';

EN_TRANSLATIONS['bonus_chan_chu_name'] = 'Chan Chu';
EN_TRANSLATIONS['bonus_chan_chu_desc'] = 'Selling fish while fishing is more profitable for 10 minutes. Increases fish price by +40% while fishing.';

EN_TRANSLATIONS['bonus_fishing_magazine_name'] = 'Fishing Magazine';
EN_TRANSLATIONS['bonus_fishing_magazine_desc'] = 'Releasing fish while fishing is more profitable for 10 minutes. Increases XP for fish by +20% while fishing.';

EN_TRANSLATIONS['bonus_fishing_book_name'] = 'Fishing Book';
EN_TRANSLATIONS['bonus_fishing_book_desc'] = 'Releasing fish while fishing is more profitable for 10 minutes. Increases XP for fish by +40% while fishing.';
EN_TRANSLATIONS['bonus_lucky_coin_desc'] = 'Gives luck and small chance to catch treasures for 1 hour.';

EN_TRANSLATIONS['bonus_blood_name'] = 'Blood';
EN_TRANSLATIONS['bonus_blood_desc'] = 'Increases chance to catch monster fish for 10 minutes.';

EN_TRANSLATIONS['bonus_sonar_basic_name'] = 'Sonar';
EN_TRANSLATIONS['bonus_sonar_basic_desc'] = 'Shows possible weight and number of fish at cast location. Always active when selected.';

EN_TRANSLATIONS['bonus_sonar_advanced_name'] = 'Sonar Lv.2';
EN_TRANSLATIONS['bonus_sonar_advanced_desc'] = 'Shows possible weight, number and species of fish at cast location. Always active when selected.';

EN_TRANSLATIONS['bonus_compass_name'] = 'Compass';
EN_TRANSLATIONS['bonus_compass_desc'] = 'Fish compass, shows number of fish at cast location. Always active when selected.';

EN_TRANSLATIONS['bonus_coffee_thermos_name'] = 'Coffee Thermos';
EN_TRANSLATIONS['bonus_coffee_thermos_desc'] = 'Invigorates, perfect time to fish for night fish, lasts 10 minutes.';

EN_TRANSLATIONS['bonus_fish_scanner_name'] = 'Fish Scanner';
EN_TRANSLATIONS['bonus_fish_scanner_desc'] = 'Shows fish species during bite. Always active when selected.';

EN_TRANSLATIONS['bonus_travel_map_name'] = 'Map';
EN_TRANSLATIONS['bonus_travel_map_desc'] = 'Map of short routes to fishing spots. Permanent discount on location travel.';

EN_TRANSLATIONS['bonus_repair_kit_name'] = 'Repair Kit';
EN_TRANSLATIONS['bonus_repair_kit_desc'] = 'Repairs all gear currently equipped.';

EN_TRANSLATIONS['bonus_glue_name'] = 'Glue';
EN_TRANSLATIONS['bonus_glue_desc'] = 'Repairs the most worn gear currently equipped.';

EN_TRANSLATIONS['bonus_lucky_charm_name'] = 'Lucky Charm';
EN_TRANSLATIONS['bonus_lucky_charm_desc'] = 'Rare fish bite more often for 10 minutes. Increases bite frequency.';

EN_TRANSLATIONS['bonus_lucky_wallet_name'] = 'Lucky Wallet';
EN_TRANSLATIONS['bonus_lucky_wallet_desc'] = 'Selling fish while fishing is more profitable for 10 minutes. Increases fish price +20% while fishing.';

EN_TRANSLATIONS['bonus_chan_chu_name'] = 'Chan Chu';
EN_TRANSLATIONS['bonus_chan_chu_desc'] = 'Selling fish while fishing is more profitable for 10 minutes. Increases fish price +40% while fishing.';

EN_TRANSLATIONS['bonus_fishing_magazine_name'] = 'Fishing Magazine';
EN_TRANSLATIONS['bonus_fishing_magazine_desc'] = 'Releasing fish while fishing is more profitable for 10 minutes. Increases XP for fish +20% while fishing.';

EN_TRANSLATIONS['bonus_fishing_book_name'] = 'Fishing Book';
EN_TRANSLATIONS['bonus_fishing_book_desc'] = 'Releasing fish while fishing is more profitable for 10 minutes. Increases XP for fish +40% while fishing.';

// ============= SONAR/COMPASS/SCANNER TRANSLATIONS =============
EN_TRANSLATIONS['sonar_title'] = 'SONAR';
EN_TRANSLATIONS['compass_title'] = 'COMPASS';
EN_TRANSLATIONS['scanner_title'] = 'SCANNER';
EN_TRANSLATIONS['sonar_no_fish'] = 'No fish!';
EN_TRANSLATIONS['sonar_try_another'] = 'Try another spot';
EN_TRANSLATIONS['sonar_fish_count'] = 'Fish';
EN_TRANSLATIONS['sonar_weight'] = 'Weight';
EN_TRANSLATIONS['sonar_depleted'] = 'Zone depleted';
EN_TRANSLATIONS['sonar_species'] = 'Species:';

// ============= GEAR INVENTORY UI TRANSLATIONS =============
EN_TRANSLATIONS['gear_modal_rods'] = 'Rods';
EN_TRANSLATIONS['gear_modal_lines'] = 'Lines';
EN_TRANSLATIONS['gear_modal_floats'] = 'Floats';
EN_TRANSLATIONS['gear_modal_hooks'] = 'Hooks';
EN_TRANSLATIONS['gear_modal_reels'] = 'Reels';
EN_TRANSLATIONS['gear_modal_baits'] = 'Baits';
EN_TRANSLATIONS['gear_modal_select'] = 'Select gear';
EN_TRANSLATIONS['gear_modal_equip'] = 'Equip';
EN_TRANSLATIONS['gear_modal_no_baits'] = 'No baits';
EN_TRANSLATIONS['gear_modal_broken'] = 'Broken';

// ============= PREMIUM EFFECTS TRANSLATIONS =============
// Duration
EN_TRANSLATIONS['premium_duration'] = 'Duration:';
EN_TRANSLATIONS['premium_duration_permanent'] = 'Permanent';
EN_TRANSLATIONS['premium_duration_hour'] = 'hour';
EN_TRANSLATIONS['premium_duration_hours'] = 'hours';
EN_TRANSLATIONS['premium_duration_minutes'] = 'minutes';

// Effect label
EN_TRANSLATIONS['premium_effect'] = 'Effect:';

// Effect types
EN_TRANSLATIONS['premium_effect_power_boost'] = '+{value}% to power';
EN_TRANSLATIONS['premium_effect_bite_frequency'] = '+{value}% to bites';
EN_TRANSLATIONS['premium_effect_treasure_luck'] = '+{value}% to treasures';
EN_TRANSLATIONS['premium_effect_monster_chance'] = '+{value}% to monsters';
EN_TRANSLATIONS['premium_effect_sonar_basic'] = 'Shows weight and number of fish';
EN_TRANSLATIONS['premium_effect_sonar_advanced'] = 'Shows weight, number and species';
EN_TRANSLATIONS['premium_effect_compass'] = 'Shows number of fish';
EN_TRANSLATIONS['premium_effect_time_slow'] = 'Slows time by 2x';
EN_TRANSLATIONS['premium_effect_fish_scanner'] = 'Shows fish species during bite';
EN_TRANSLATIONS['premium_effect_travel_discount'] = '-10% on travel';
EN_TRANSLATIONS['premium_effect_repair_all'] = 'Repairs all gear';
EN_TRANSLATIONS['premium_effect_repair_one'] = 'Repairs one gear';
EN_TRANSLATIONS['premium_effect_rare_fish_boost'] = '+{value}% to rare fish';
EN_TRANSLATIONS['premium_effect_price_boost'] = '+{value}% to fish price';
EN_TRANSLATIONS['premium_effect_xp_boost'] = '+{value}% to XP';

// Active status
EN_TRANSLATIONS['premium_active'] = '✓ Active';
EN_TRANSLATIONS['premium_active_time'] = '✓ Active: {time}';

// ============= CURRENCY EXCHANGE TRANSLATIONS =============
EN_TRANSLATIONS['exchange_fishing_marks'] = 'Exchange fishing marks';
EN_TRANSLATIONS['exchange_free_ad'] = 'Free (ad)';

// ============= IAP TRANSLATIONS =============
// Premium bundle
EN_TRANSLATIONS['iap_premium_bundle_name'] = 'Premium Bundle';
EN_TRANSLATIONS['iap_premium_bundle_desc'] = 'Great bundle for real anglers! Includes fishing marks, regular coins, energy drinks, groundbaits and no interstitial ads.';

// Ad rewards
EN_TRANSLATIONS['iap_ad_reward_small_name'] = 'Watch Ad';
EN_TRANSLATIONS['iap_ad_reward_small_desc'] = 'Watch 3 ads and get 500 regular coins!';
EN_TRANSLATIONS['iap_ad_reward_medium_name'] = 'Watch Ad';
EN_TRANSLATIONS['iap_ad_reward_medium_desc'] = 'Watch 5 ads and get 700 regular coins!';
EN_TRANSLATIONS['iap_ad_reward_large_name'] = 'Watch Ad';
EN_TRANSLATIONS['iap_ad_reward_large_desc'] = 'Watch 7 ads and get 1000 regular coins!';

// Premium coins (fishing marks)
EN_TRANSLATIONS['iap_premium_coins_100_name'] = '100 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_100_desc'] = 'Small pack of fishing marks for special purchases.';
EN_TRANSLATIONS['iap_premium_coins_500_name'] = '500 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_500_desc'] = 'Medium pack of fishing marks. Great price-to-quantity ratio!';
EN_TRANSLATIONS['iap_premium_coins_1000_name'] = '1000 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_1000_desc'] = 'Large pack of fishing marks for serious purchases.';
EN_TRANSLATIONS['iap_premium_coins_5000_name'] = '5000 Fishing Marks';
EN_TRANSLATIONS['iap_premium_coins_5000_desc'] = 'Huge pack of fishing marks! Maximum value for professionals.';

// Regular coins
EN_TRANSLATIONS['iap_regular_coins_1500_name'] = '1500 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_1500_desc'] = 'Small pack of regular coins for everyday purchases.';
EN_TRANSLATIONS['iap_regular_coins_7000_name'] = '7000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_7000_desc'] = 'Medium pack of regular coins. Better value than exchanging marks!';
EN_TRANSLATIONS['iap_regular_coins_14000_name'] = '14000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_14000_desc'] = 'Large pack of regular coins for serious purchases.';
EN_TRANSLATIONS['iap_regular_coins_70000_name'] = '70000 Regular Coins';
EN_TRANSLATIONS['iap_regular_coins_70000_desc'] = 'Huge pack of regular coins! Maximum value for professionals.';

// Gear bundles
EN_TRANSLATIONS['iap_gear_bundle_starter_name'] = 'Starter Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_starter_desc'] = 'Complete set of premium gear for beginners! Includes rod, line, float, hook and reel.';
EN_TRANSLATIONS['iap_gear_bundle_advanced_name'] = 'Advanced Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_advanced_desc'] = 'Professional set of premium gear! Powerful equipment for trophy fishing.';
EN_TRANSLATIONS['iap_gear_bundle_master_name'] = 'Master Angler Bundle';
EN_TRANSLATIONS['iap_gear_bundle_master_desc'] = 'Legendary set of top premium gear! Maximum power for ocean fishing.';

// Currency exchange
EN_TRANSLATIONS['iap_currency_exchange_name'] = 'Currency Exchange';
EN_TRANSLATIONS['iap_currency_exchange_desc'] = 'Exchange fishing marks for regular coins. Rate: 1 = 12';

