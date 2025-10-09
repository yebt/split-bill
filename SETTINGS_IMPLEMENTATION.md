# Settings Implementation Summary

## Overview
Added a comprehensive settings system with a slide-in drawer panel and reusable navbar component to centralize all application configuration options including import/export, dark mode, currency settings, and Gemini API token management.

## Architecture Update (v2)
The settings implementation was refactored from a dedicated view to a slide-in drawer accessible from all pages via a global navbar component.

## Changes Made

### 1. Settings Store (`src/stores/settingsStore.ts`)
- **New file** created to manage application settings
- Stores configuration in localStorage using the repository pattern
- Manages:
  - Currency selection (default: USD)
  - Gemini API token for future OCR features
- Provides reactive getters and actions for settings management

### 2. Settings Drawer (`src/components/SettingsDrawer.vue`)
- **New component** with slide-in animation from the right
- Comprehensive settings interface organized into sections:
  - **Appearance**: Dark mode toggle with visual switch
  - **Currency**: Dropdown with 10 major currencies (USD, EUR, GBP, JPY, CNY, MXN, COP, ARS, BRL, CLP)
  - **Gemini API**: Secure token input with show/hide functionality
  - **Data Management**: Import/Export functionality
  - **Advanced**: Reset settings to defaults
- Includes app version and credits footer
- Smooth slide-in/out transitions with backdrop
- Accessible from any page via navbar settings button

### 3. App Navbar (`src/components/AppNavbar.vue`)
- **New reusable component** for consistent navigation across all views
- Features:
  - Dynamic title configuration
  - Optional back button
  - Settings button (always visible)
  - Slot-based customization for left side and actions
- Integrated into AppMain for global availability

### 4. AppMain Updates (`src/components/AppMain.vue`)
- Integrated AppNavbar and SettingsDrawer
- Provides navbar configuration via Vue's provide/inject API
- Type-safe NavbarConfig interface
- Settings drawer state management

### 5. All Views Updated
- **SquadListView**: Removed header, uses navbar config
- **SquadDetailView**: Removed header, configures navbar with squad name and back button
- **BillCreateView**: Removed header, configures navbar with "New Bill" title
- **BillDetailView**: Removed header, moved bill info to content area
- All views use inject to configure navbar dynamically

### 6. Currency Utility Updates (`src/utils/currency.ts`)
- Updated `formatCurrency()` to use settings store
- Currency parameter now optional - uses user's selected currency by default
- Maintains backward compatibility for explicit currency overrides

### 7. Router Updates (`src/router/index.ts`)
- Removed `/settings` route (no longer needed as standalone page)
- Settings now accessible via drawer from all pages

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
- **Export**: Download all squads and bills as JSON
- **Import**: Load data from JSON file
- Moved from header to settings for better organization

### Dark Mode
- Visual toggle switch
- Integrated with existing theme store
- Persists across sessions

## User Experience Improvements
1. **Always Accessible**: Settings drawer available from any page via navbar button
2. **Smooth Animations**: Slide-in drawer with backdrop for modern UX
3. **Centralized Configuration**: All settings in one place
4. **Better Organization**: Grouped by category with icons
5. **Consistent Navigation**: Unified navbar across all views
6. **Dynamic Titles**: Navbar adapts to current context (squad name, bill details, etc.)
7. **Security**: Password-style input for API token with visibility toggle
8. **Helpful Links**: Direct link to Google AI Studio for token generation
9. **Safety**: Reset confirmation dialog to prevent accidental data loss
10. **Cleaner Views**: Removed redundant headers, more content space

## Technical Details
- Uses Pinia stores for state management
- Follows repository pattern for storage abstraction
- Reactive updates across the application
- Type-safe with TypeScript (NavbarConfig interface)
- Provide/Inject pattern for navbar configuration
- Component-based architecture with reusable navbar
- Smooth CSS transitions for drawer animations
- Consistent with existing UI/UX patterns

## Future Enhancements
- OCR bill scanning using Gemini API (token already configurable)
- Additional currency options
- Locale settings for number formatting
- Export format options (PDF, CSV)
