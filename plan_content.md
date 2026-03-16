**PERSONA**

Windows 10 / 11 Roleplay Chat Application

*Comprehensive Development Plan • v1.0*

─────────────────────────────────

*A real-person roleplay platform where users create personas,*

*discover others online, and chat in character.*

**1. Project Overview**

Persona is a Windows-native desktop chat application that allows users
to create one or more custom personas (characters), browse other users
who are currently online, and engage in real-time roleplay
conversations. It draws inspiration from platforms like JanitorAI and
FlowGPT, but replaces AI bots entirely with real human users roleplaying
as their chosen characters.

  -----------------------------------------------------------------------
  **Core Idea:** Every character you see online is a real person behind a
  persona --- not a bot.

  -----------------------------------------------------------------------

**1.1 Key Differentiators**

-   No AI --- every persona is a real human being

-   Users can create and switch between multiple personas

-   Discovery feed only shows personas that are currently online

-   Full chat history preserved per persona pair

-   Native Windows 10/11 feel with a dark, modern UI

**1.2 High-Level User Flow**

-   User signs up / logs in with their account

-   They create one or more personas (name, avatar, bio, tags, scenario)

-   They set a persona as \'active\' and go online

-   Others see their persona in the discovery feed

-   Any user can click a persona card and start a chat

-   Both sides chat in character --- full real-time messaging

-   Chat history is saved and accessible from the sidebar

**2. Recommended Tech Stack**

The following stack is recommended for a Windows 10/11 desktop app that
feels native, performs well, and is developer-friendly for a small team.

  ---------------------- ------------------------------------------------
  **Layer**              **Choice & Rationale**

  **Framework**          Electron + React (TypeScript) --- web technology
                         packaged as a native Windows app. Familiar to
                         most JS/TS developers, rich ecosystem, easy UI
                         theming.

  **UI Library**         Tailwind CSS + shadcn/ui --- utility-first
                         styling with pre-built accessible components.
                         Gives full design control with minimal
                         boilerplate.

  **State Mgmt**         Zustand --- lightweight, simple global state
                         management for things like active persona, chat
                         sessions, online status, and notifications.

  **Backend**            Supabase --- open-source Firebase alternative.
                         Provides PostgreSQL database, Auth, real-time
                         subscriptions, and file storage (for avatars)
                         out of the box.

  **Real-Time**          Supabase Realtime (built on Phoenix Channels /
                         WebSockets) --- handles live message delivery,
                         online presence detection, and typing
                         indicators.

  **Auth**               Supabase Auth --- supports email/password and
                         optionally OAuth (Google, Discord) with session
                         management built in.

  **File Storage**       Supabase Storage --- for persona avatar image
                         uploads with CDN delivery.

  **Packaging**          Electron Builder --- packages the app as a
                         Windows .exe installer (NSIS) with auto-update
                         support via electron-updater.

  **Language**           TypeScript throughout --- frontend (React) and
                         any backend functions. Reduces runtime errors
                         and improves team productivity.
  ---------------------- ------------------------------------------------

**3. Screens & Features**

**3.1 Authentication Screen**

-   Email + password sign-up and login

-   \'Remember me\' checkbox for persistent sessions

-   Password reset via email

-   Optional: Sign in with Discord (popular in roleplay communities)

**3.2 Home / Discovery Screen**

This is the main screen users land on after login. It is split into two
sections:

**My Chats Row (Top)**

-   Horizontally scrollable row of recent conversations

-   Each card shows: persona avatar, persona name, last message preview,
    time since last message, unread badge

-   Clicking a card opens that chat in the chat view

-   Cards appear for all past conversations regardless of online status

**Discover Section (Below)**

-   Grid of persona cards for all users currently online

-   Each card shows: avatar image, persona name, creator username, short
    bio snippet, tags (e.g. fantasy, romance, thriller), online
    indicator (green dot)

-   Clicking a card opens a Persona Profile modal before starting a chat

-   Filter tabs: Following, New, Trending, Explore All

-   Search bar at top to find personas by name or tag

-   Personas go offline instantly when the user closes the app or
    switches persona

**3.3 Persona Profile Modal**

-   Full persona avatar (large)

-   Persona name + creator username

-   Full bio / scenario description

-   Tags list

-   \'Start Chat\' button --- initiates a new conversation

-   \'Follow\' button --- adds to your Following tab

**3.4 Chat Screen**

-   Left sidebar: list of all active conversations (search, sorted by
    recent)

-   Main area: message thread between two personas

-   Messages display: persona avatar, persona name, timestamp, message
    body

-   Typing indicator (animated dots) when the other person is typing

-   Real-time delivery --- no refresh needed

-   Support for markdown-style formatting (bold, italic) for roleplay
    emotes e.g. \*she smiles\*

-   Option to send out-of-character (OOC) messages --- visually
    distinguished (e.g. bracketed, grey)

-   Image sharing support (for scene-setting images, not profile pics)

-   Chat is stored indefinitely --- full scroll history available

**3.5 My Personas Screen**

-   List of all personas the user has created

-   \'Active\' badge on whichever persona is currently set online

-   \'Switch Active Persona\' --- instantly changes which persona is
    visible to others

-   \'Create New Persona\' button

-   Edit / Delete existing personas

**3.6 Persona Creation / Edit Screen**

-   Persona name (display name in chats)

-   Avatar image upload (cropped to square, stored in Supabase Storage)

-   Short tagline (shown on cards in discovery --- max 100 chars)

-   Full bio / scenario (rich text, shown in profile modal --- max 2000
    chars)

-   Tags (multi-select from a preset list + custom tags)

-   Age rating toggle: SFW / NSFW (determines visibility in filtered
    feed)

-   Publish / Unpublish toggle --- hides persona from discovery without
    deleting

**3.7 Notifications Panel**

-   New message notifications

-   New follower notifications

-   \'Someone started a chat with you\' notifications

-   Windows 10/11 native toast notifications when app is minimised

**3.8 Settings Screen**

-   Account settings (email, password, delete account)

-   Notification preferences

-   Appearance: Dark / Light mode toggle

-   Privacy: Block list management, report user flow

-   App info and version

**4. Database Schema**

Hosted on Supabase (PostgreSQL). The following core tables are needed:

  ---------------------- ------------------------------------------------
  **Table**              **Key Columns & Purpose**

  **users**              id, email, username, avatar_url, created_at ---
                         core account record managed by Supabase Auth

  **personas**           id, user_id (FK), name, avatar_url, tagline,
                         bio, tags\[\], age_rating, is_published,
                         is_active, created_at, updated_at

  **conversations**      id, persona_a_id (FK), persona_b_id (FK),
                         created_at, last_message_at --- one row per chat
                         pair

  **messages**           id, conversation_id (FK), sender_persona_id
                         (FK), body, is_ooc (bool), created_at --- all
                         messages

  **follows**            follower_persona_id, followed_persona_id,
                         created_at --- who follows whom

  **blocks**             blocker_user_id, blocked_user_id, created_at ---
                         account-level blocks

  **presence**           persona_id (PK), online_at --- updated via
                         Supabase Realtime Presence channel
  ---------------------- ------------------------------------------------

**5. Real-Time Architecture**

**5.1 Presence (Online Status)**

Supabase Realtime Presence channels let each client broadcast its own
state (which persona is active) and subscribe to others\'. When a user
opens the app and activates a persona, they join a shared presence
channel. When they close the app or switch persona, they leave or update
the channel. The discovery feed subscribes to this channel and updates
the grid instantly.

**5.2 Messaging**

Messages are written to the messages table in Supabase. Both clients in
a conversation subscribe to a Realtime channel scoped to their
conversation_id. When a message is inserted, Supabase broadcasts the
change to all subscribers in real time --- no polling required. This
gives sub-second message delivery.

**5.3 Typing Indicators**

Handled via Presence channels at the conversation level. When a user
starts typing, their client broadcasts a \'typing: true\' state on the
conversation presence channel. The other client receives this and shows
the animated typing indicator. After 3 seconds of inactivity, \'typing:
false\' is broadcast.

**6. Project Folder Structure**

  -----------------------------------------------------------------------
  **Root:** persona-app/

  -----------------------------------------------------------------------

  ------------------------------ ------------------------------------------------
  **Folder**                     **Contents**

  **/electron**                  Main process files --- app entry point, window
                                 management, tray icon, native notifications,
                                 auto-updater

  **/src/renderer**              React app --- all UI screens and components

  **/src/renderer/screens**      One folder per screen: Home, Chat, Personas,
                                 Settings, Auth

  **/src/renderer/components**   Shared UI components: PersonaCard,
                                 MessageBubble, Sidebar, Modal, Avatar

  **/src/renderer/stores**       Zustand stores: useAuthStore, usePersonaStore,
                                 useChatStore, usePresenceStore

  **/src/renderer/hooks**        Custom React hooks: useRealtime, usePresence,
                                 useMessages

  **/src/renderer/lib**          Supabase client setup, utility functions, type
                                 definitions

  **/src/shared**                Types and constants shared between main and
                                 renderer processes

  **/assets**                    App icons, splash screen, tray icon (Windows ICO
                                 format)

  **/build**                     Electron Builder config and packaging scripts
  ------------------------------ ------------------------------------------------

**7. Security & Privacy**

**7.1 Authentication & Data Access**

-   All Supabase tables protected with Row Level Security (RLS) policies

-   Users can only read their own account data, only write their own
    messages

-   Persona discovery feed only returns published, active personas ---
    enforced server-side

-   Block list enforced at the RLS level --- blocked users cannot read
    each other\'s data

**7.2 Content Safety**

-   Age rating system (SFW / NSFW) on personas with a feed filter in
    Settings

-   Report user flow --- flagged accounts reviewed manually or via
    moderation queue

-   Block system --- mutual blocking removes the user from discovery and
    prevents messaging

-   Username / persona name profanity filter on creation

**7.3 Data & Privacy**

-   User emails never exposed to other users --- only usernames are
    public

-   Persona avatars served via Supabase CDN with no direct database
    access

-   GDPR-friendly: account deletion removes all user data and personas

**8. Development Phases**

  ----------- ------------------ -------------- ---------------------------------
  **Phase**   **Name**           **Duration**   **Key Deliverables**

  **Phase 1** Project Setup &    1--2 weeks     Electron + React scaffold,
              Auth                              Supabase project, Auth screens
                                                (login, sign-up, password reset),
                                                Zustand auth store, basic routing

  **Phase 2** Persona System     2--3 weeks     Persona creation / edit / delete
                                                screen, avatar upload to Supabase
                                                Storage, My Personas screen,
                                                active persona switching logic

  **Phase 3** Presence &         2 weeks        Supabase Realtime Presence
              Discovery                         integration, online status
                                                broadcast, Home screen discovery
                                                grid, persona cards, online-only
                                                filter, real-time grid updates

  **Phase 4** Messaging          3--4 weeks     Conversation creation, real-time
                                                message delivery, chat screen UI,
                                                typing indicators, OOC message
                                                mode, image sharing, full chat
                                                history

  **Phase 5** Social Features    1--2 weeks     Follow system, Following tab in
                                                discovery, Notifications panel,
                                                Windows toast notifications

  **Phase 6** Polish & Settings  2 weeks        Settings screen, block/report
                                                system, Dark/Light mode, search
                                                and filter, accessibility pass,
                                                performance optimisation

  **Phase 7** Packaging &        1--2 weeks     Electron Builder config, Windows
              Release                           installer (NSIS), auto-updater,
                                                app signing, Microsoft Store
                                                submission or direct distribution
  ----------- ------------------ -------------- ---------------------------------

  -----------------------------------------------------------------------
  **Estimated Total:** 12--18 weeks for a full-featured v1.0, depending
  on team size. A 3-person team (1 frontend, 1 fullstack, 1 designer) can
  comfortably hit this timeline.

  -----------------------------------------------------------------------

**9. Suggested Team Structure**

  ---------------------- ------------------------------------------------
  **Role**               **Responsibilities**

  **Frontend Dev**       React + Electron UI, all screens and components,
                         real-time hooks, Zustand stores

  **Fullstack Dev**      Supabase schema design, RLS policies, Realtime
                         setup, Electron main process, packaging and
                         auto-updater

  **UI/UX Designer**     App design system, persona card designs, dark
                         theme, icon set, onboarding flow

  **(Optional) QA**      Testing across Windows 10 and 11, edge case
                         discovery, performance profiling
  ---------------------- ------------------------------------------------

**10. Key Dependencies**

  ---------------------------- ------------------------------------------------
  **Package**                  **Purpose**

  **electron**                 Core desktop wrapper --- windowing, native
                               menus, tray, notifications

  **electron-builder**         Packaging to .exe installer with auto-update
                               support

  **react + react-router-dom** UI rendering and client-side screen routing

  **typescript**               Type safety throughout the codebase

  **\@supabase/supabase-js**   Official Supabase client --- auth, database,
                               storage, realtime

  **zustand**                  Lightweight global state management

  **tailwindcss**              Utility-first CSS framework

  **shadcn/ui**                Pre-built accessible React components (dialogs,
                               inputs, etc.)

  **react-query (TanStack)**   Data fetching, caching, and synchronisation for
                               non-realtime queries

  **react-dropzone**           Drag-and-drop avatar image upload UI

  **date-fns**                 Date formatting for message timestamps

  **lucide-react**             Icon library consistent with shadcn/ui
  ---------------------------- ------------------------------------------------

**11. Future Features (Post v1.0)**

-   Group chats / shared roleplay rooms with multiple personas

-   Persona \'profile pages\' with public URL for sharing outside the
    app

-   Mobile companion app (React Native + same Supabase backend)

-   Persona templates / starter scenarios for new users

-   Premium subscription --- custom avatar frames, persona spotlight in
    discovery, extra storage

-   Moderation dashboard for admins

-   Voice chat integration (WebRTC) for optional in-character voice
    roleplay

-   Scenario marketplace --- users can share and browse pre-written
    roleplay scenarios

*--- End of Document ---*
