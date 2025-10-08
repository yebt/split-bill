# Settings Implementation Summary

## Overview
Added a comprehensive settings page to centralize all application configuration options including import/export, dark mode, currency settings, and Gemini API token management.

## Changes Made

### 1. Settings Store (`src/stores/settingsStore.ts`)
- **New file** created to manage application settings
- Stores configuration in localStorage using the repository pattern
- Manages:
  - Currency selection (default: USD)
  - Gemini API token for future OCR features
- Provides reactive getters and actions for settings management

### 2. Settings View (`src/views/SettingsView.vue`)
- **New view** with comprehensive settings interface
- Organized into sections:
  - **Appearance**: Dark mode toggle
  - **Currency**: Dropdown with 10 major currencies (USD, EUR, GBP, JPY, CNY, MXN, COP, ARS, BRL, CLP)
  - **Gemini API**: Secure token input with show/hide functionality
  - **Data Management**: Import/Export functionality moved from header
  - **Advanced**: Reset settings to defaults
- Includes app version and credits footer

### 3. Router Updates (`src/router/index.ts`)
- Added `/settings` route
- Route accessible from main navigation

### 4. ParcheListView Updates (`src/views/ParcheListView.vue`)
- Replaced individual action buttons (import, export, theme toggle) with single settings button
- Cleaner header design
- Removed duplicate import/export code (now in settings)

### 5. Currency Utility Updates (`src/utils/currency.ts`)
- Updated `formatCurrency()` to use settings store
- Currency parameter now optional - uses user's selected currency by default
- Maintains backward compatibility for explicit currency overrides

## Features

### Currency Support
The following currencies are available:
- 🇺🇸 USD - US Dollar ($)
- 🇪🇺 EUR - Euro (€)
- 🇬🇧 GBP - British Pound (£)
- 🇯🇵 JPY - Japanese Yen (¥)
- 🇨🇳 CNY - Chinese Yuan (¥)
- 🇲🇽 MXN - Mexican Peso ($)
- 🇨🇴 COP - Colombian Peso ($)
- 🇦🇷 ARS - Argentine Peso ($)
- 🇧🇷 BRL - Brazilian Real (R$)
- 🇨🇱 CLP - Chilean Peso ($)

### Gemini API Token
- Secure password-style input with toggle visibility
- Stored locally in browser storage
- Ready for future OCR bill scanning implementation
- Link to Google AI Studio for token generation
- Security notice about local storage

### Data Management
- **Export**: Download all parches and bills as JSON
- **Import**: Load data from JSON file
- Moved from header to settings for better organization

### Dark Mode
- Visual toggle switch
- Integrated with existing theme store
- Persists across sessions

## User Experience Improvements
1. **Centralized Configuration**: All settings in one place
2. **Better Organization**: Grouped by category with icons
3. **Cleaner Header**: Single settings button instead of multiple action buttons
4. **Security**: Password-style input for API token with visibility toggle
5. **Helpful Links**: Direct link to Google AI Studio for token generation
6. **Safety**: Reset confirmation dialog to prevent accidental data loss

## Technical Details
- Uses Pinia stores for state management
- Follows repository pattern for storage abstraction
- Reactive updates across the application
- Type-safe with TypeScript
- Consistent with existing UI/UX patterns

## Future Enhancements
- OCR bill scanning using Gemini API (token already configurable)
- Additional currency options
- Locale settings for number formatting
- Export format options (PDF, CSV)
