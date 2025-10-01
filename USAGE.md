# Split Bill - Usage Guide

## Getting Started

The application is now running at **http://localhost:5173**

## Quick Start Tutorial

### 1. Create Your First Parche
1. Click **"Create Parche"** on the home screen
2. Enter a name like "Weekend Trip" or "Dinner Party"
3. Click **Create**

### 2. Add Groups and People
1. Open your parche
2. In the **"People & Groups"** tab:
   - Click **"Add Group"** to create groups (e.g., "Friends", "Family")
   - Choose a color for each group
   - Click the **"Add Person"** button within a group
   - Add people's names (must be unique within the parche)

### 3. Manage People
- **Toggle Active/Inactive**: Click the green/gray circle next to a person's name
- **Edit**: Click the edit icon to rename a person
- **Move**: Click the move icon to transfer someone to another group
- **Delete**: Click the trash icon to remove a person

### 4. Create a Bill

#### Equal Split (Simple)
1. Go to the **"Bills"** tab
2. Click **"New Bill"**
3. Select **"Equal Split"**
4. Click **"Add Product"** and enter:
   - Product name (e.g., "Pizza")
   - Quantity
   - Price
5. Optionally, exonerate people who shouldn't pay
6. Review the split preview
7. Click **"Create Bill"**

#### Distributed Split (Itemized)
1. Follow steps 1-2 above
2. Select **"Distributed"**
3. Add products as above
4. For each product, click on people's names to assign who consumed it
5. Products can be shared (multiple people assigned)
6. Unassigned products are split equally among all active people
7. Click **"Create Bill"**

### 5. View Summary
1. Go to the **"Summary"** tab
2. See total expenses per person
3. Click **"Share as Text"** to:
   - Share via WhatsApp (mobile)
   - Copy to clipboard (desktop)

### 6. Manage Your Data

#### Export Data
- Click the **download icon** in the header
- A JSON file will be downloaded with all your data

#### Import Data
- Click the **upload icon** in the header
- Select a previously exported JSON file
- All data will be restored

#### Duplicate a Parche
1. On the home screen, click the **three dots** on a parche card
2. Select **"Duplicate"**
3. Enter a new name
4. Groups and people are copied, but bills are not

## Features Overview

### Dark/Light Mode
- Click the **sun/moon icon** in the header
- Automatically detects your system preference
- Preference is saved locally

### Offline Support
- Works completely offline
- All data stored in your browser's localStorage
- No internet connection required

### Mobile Optimized
- Touch-friendly interface
- Responsive design
- Works on any device

## Tips & Tricks

1. **Unique Names**: Person names must be unique within a parche to avoid confusion
2. **Active/Inactive**: Mark people as inactive instead of deleting them to preserve bill history
3. **Exoneration**: Use exoneration for people who were present but didn't consume anything
4. **Distributed Bills**: Great for restaurants where people ordered different items
5. **Equal Bills**: Perfect for shared expenses like Uber rides or group purchases
6. **Regular Backups**: Export your data regularly to avoid losing information
7. **Group Colors**: Use different colors to visually organize large groups

## Keyboard Shortcuts

- **Esc**: Close modals
- **Enter**: Submit forms
- **Tab**: Navigate between form fields

## Troubleshooting

### Data Not Saving
- Check if localStorage is enabled in your browser
- Clear browser cache and try again

### Import Failed
- Ensure the JSON file is a valid export from this app
- Check file is not corrupted

### Bill Calculations Wrong
- Verify all people are marked as active/inactive correctly
- Check exoneration settings
- For distributed bills, ensure products are assigned correctly

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with localStorage support

## Privacy

- All data stays on your device
- No data is sent to any server
- No tracking or analytics
- No account required
