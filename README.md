# Channel Notes

A Discord-inspired, channel-based quick note-taking application built with Next.js, React, and TypeScript. Perfect for organizing thoughts, ideas, and notes across different topics or projects.

## 🚀 Features

- **Discord-style UI** with dark sidebar and clean message interface
- **Multiple channels** for organizing different topics
- **Real-time messaging** with auto-scroll to latest messages
- **Persistent storage** using localStorage (survives browser refreshes)
- **Keyboard shortcuts** for quick navigation and message sending
- **Responsive design** that works on desktop and mobile
- **Auto-resizing input** that expands as you type
- **Message timestamps** with smart relative time formatting
- **Delete your own messages** with hover actions

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [channelId]/       # Dynamic channel pages
│   │   └── page.tsx       # Channel view with chat interface
│   ├── debug/             # Debug page for development
│   │   └── page.tsx       # State inspector and testing tools
│   ├── globals.css        # Global styles and Discord-like theming
│   ├── layout.tsx         # Root layout with AppStateProvider
│   └── page.tsx           # Home page (redirects to /general)
├── components/            # Reusable UI components
│   ├── ChannelSidebar.tsx # Left sidebar with channel navigation
│   ├── ChatMessages.tsx   # Message display with threading
│   └── MessageInput.tsx   # Message compose area with auto-resize
├── contexts/              # React Context for state management
│   └── AppStateContext.tsx # Global app state and CRUD operations
├── hooks/                 # Custom React hooks
│   └── useHotkeys.ts      # Keyboard shortcut system
├── lib/                   # Utility functions
│   └── storage.ts         # localStorage persistence layer
└── types.ts               # TypeScript type definitions
```

## 🏗️ Architecture Deep Dive

### Data Models

The app uses three main data types defined in `src/types.ts`:

```typescript
// Represents a chat channel/topic
type Channel = {
  id: string;           // Unique identifier
  name: string;         // Display name (e.g., "general", "ideas")
  description?: string; // Optional channel description
  createdAt: number;    // Unix timestamp
  updatedAt: number;    // Unix timestamp
};

// Represents a message/note in a channel
type Message = {
  id: string;       // Unique identifier
  channelId: string; // Which channel this belongs to
  content: string;   // The message text
  author: string;    // Who wrote it (currently always "You")
  createdAt: number; // Unix timestamp for sorting/display
};

// Global application state
type AppState = {
  channels: Channel[];          // All available channels
  messages: Message[];          // All messages across channels
  activeChannelId: string | null; // Currently selected channel
  currentUser: string;         // Current user name ("You")
};
```

### State Management

The app uses React Context (`AppStateContext`) for global state management:

**Key Functions:**
- `createChannel(name, description?)` - Adds a new channel
- `deleteChannel(id)` - Removes channel and all its messages
- `selectChannel(id)` - Sets the active channel
- `sendMessage(channelId, content)` - Adds a new message
- `deleteMessage(id)` - Removes a specific message

**State Persistence:**
All state changes automatically persist to localStorage via `writeState()` in a `useEffect`. On app load, `readState()` restores the previous state or provides sensible defaults.

### Component Architecture

#### 1. ChannelSidebar (`src/components/ChannelSidebar.tsx`)
- **Purpose**: Navigation between channels
- **Features**:
  - Lists all channels with active state highlighting
  - Create new channel form (inline)
  - Delete channels (with confirmation)
  - Shows message/channel count in footer
- **State**: Uses `useAppState()` to read channels and handle CRUD
- **Routing**: Uses Next.js `useRouter` to navigate between `/[channelId]` pages

#### 2. ChatMessages (`src/components/ChatMessages.tsx`)
- **Purpose**: Display messages for the current channel
- **Features**:
  - Message threading (groups messages by author/time)
  - Auto-scroll to bottom on new messages
  - Relative timestamps (e.g., "5m ago", "yesterday")
  - Delete buttons for own messages
  - Empty state with helpful messaging
- **State**: Filters `state.messages` by `channelId`
- **Performance**: Uses `useRef` for scroll management

#### 3. MessageInput (`src/components/MessageInput.tsx`)
- **Purpose**: Compose and send new messages
- **Features**:
  - Auto-resizing textarea (grows with content)
  - Enter to send, Shift+Enter for new lines
  - Auto-focus when switching channels
  - Keyboard shortcut (`/`) to focus input
- **State**: Local state for draft message, calls `sendMessage()` on submit
- **UX**: Resets height and clears content after sending

### Routing System

The app uses Next.js App Router with dynamic routes:

- `/` - Home page, redirects to `/general`
- `/[channelId]` - Channel page showing messages for that channel
- `/debug` - Development tool for inspecting state

**Route Handling:**
```typescript
// In src/app/[channelId]/page.tsx
const channelId = params.channelId as string;
const channel = state.channels.find(c => c.id === channelId);

// If channel doesn't exist, redirect to first available
if (!channel && state.channels.length > 0) {
  router.replace(`/${state.channels[0].id}`);
}
```

### Storage Layer

**File**: `src/lib/storage.ts`

The storage layer handles persistence to localStorage:

```typescript
const STORAGE_KEY = 'channel-chat-app-state';

// Read state on app initialization
export const readState = (): AppState => {
  // Returns default state with "general" and "random" channels
  // Includes welcome messages to get users started
};

// Write state after every change
export const writeState = (state: AppState): void => {
  // Saves entire state tree to localStorage
  // Includes error handling for storage quota issues
};
```

**Default Data:**
- Two starter channels: "general" and "random"
- Welcome messages in the general channel
- Current user set to "You"

### Keyboard Shortcuts

**File**: `src/hooks/useHotkeys.ts`

Custom hook for keyboard shortcuts:

```typescript
useHotkeys([
  { key: 'n', callback: createNewNote },           // New note
  { key: 'j', callback: selectNextNote },          // Navigate down
  { key: 'k', callback: selectPrevNote },          // Navigate up
  { key: '/', callback: focusMessageInput },       // Focus input
  { key: 'Enter', callback: openSelectedNote },    // Open note
], [dependencies]);
```

**Features**:
- Ignores shortcuts when typing in inputs/textareas
- Supports modifier keys (ctrl, cmd, shift, alt)
- Configurable preventDefault behavior
- Uses `useCallback` for performance

### Styling System

**Global Styles**: `src/app/globals.css`
- Discord-inspired color palette (`#5865f2` primary blue)
- Custom scrollbar styling
- Line-clamp utilities for text truncation
- Focus states with blue outline
- Message content styling for proper word wrapping

**Component Styles**:
- Tailwind CSS for utility-first styling
- Responsive design with mobile-first approach
- Hover states and transitions for interactive elements
- Dark sidebar with light content area (Discord-style)

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🧪 Development Tools

### Debug Page
Visit `/debug` to inspect the current application state:
- View all channels and messages
- Test message sending functionality
- Inspect localStorage contents
- Trigger state changes manually

### Console Logging
The app includes strategic console logging for debugging:
- State initialization and migrations
- Route changes and redirects
- Message sending and state updates
- Error handling

## 🔧 Adding New Features

### Adding a New Component
1. Create file in `src/components/`
2. Import and use `useAppState()` for global state
3. Add to the appropriate page in `src/app/`
4. Update this README

### Adding State Fields
1. Update types in `src/types.ts`
2. Update default state in `src/lib/storage.ts`
3. Add migration logic in `readState()` if needed
4. Add CRUD operations to `AppStateContext.tsx`

### Adding New Routes
1. Create folder in `src/app/` following Next.js conventions
2. Add page.tsx with your component
3. Update navigation in `ChannelSidebar.tsx` if needed

## 🚀 Deployment

The app is a static Next.js application that can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `out/` folder after `npm run build`
- **GitHub Pages**: Use the built-in GitHub Actions workflow

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes** following the existing patterns
4. **Test thoroughly** using the debug page
5. **Update this README** if you add new components or patterns
6. **Submit a pull request**

### Code Style
- Use TypeScript for all new code
- Follow the existing component patterns
- Use `useCallback` for event handlers to prevent re-renders
- Add proper TypeScript types for new functions
- Use Tailwind classes for styling (avoid custom CSS when possible)

### Testing Your Changes
1. Visit `/debug` to verify state changes
2. Test keyboard shortcuts work correctly
3. Verify localStorage persistence across browser refreshes
4. Test responsive design on mobile
5. Check that new features work across all existing channels

## 🎯 Future Enhancements

Some ideas for contributors:

- **Rich Text Editor**: Replace textarea with a proper markdown editor
- **Search Functionality**: Add global search across all messages
- **Export Features**: Allow exporting messages as markdown/JSON
- **Themes**: Add light/dark mode toggle
- **Tags/Categories**: Add tagging system for better organization
- **Drag & Drop**: Reorder channels or messages
- **Collaboration**: Add real-time sync with other users
- **Attachments**: Support for images and file uploads
- **Wiki-style Linking**: `[[note-title]]` syntax for linking between messages

---

Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS.
