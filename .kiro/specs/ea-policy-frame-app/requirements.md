# Requirements Document

## Introduction

The EA PolicyFrame App is a sophisticated web application that combines Effective Altruism principles with George Lakoff's cognitive framing methodology to generate strategically framed AI policy content. The app targets policymakers, advocates, researchers, and the general public, providing them with tools to create compelling content that advances AI safety, alignment, and policy advocacy through scientifically-backed persuasion techniques.

The application integrates multiple marketing philosophies (Seth Godin's permission marketing, Gary Vaynerchuk's authentic content creation, and Kieran Flanagan's user acquisition strategies) with Lakoff's behavioral and cognitive framing psychology to produce four distinct content types: daily blog posts, in-depth policy articles, comprehensive marketing playbooks, and social media calendars.

## Requirements

### Requirement 1: Core Content Generation System

**User Story:** As a policy advocate, I want to generate strategically framed AI policy content using proven cognitive framing techniques, so that I can create more persuasive and effective advocacy materials.

#### Acceptance Criteria

1. WHEN a user enters a topic or topic with URL THEN the system SHALL validate the input and prepare it for content generation
2. WHEN a user selects a geographic region (USA, Europe, Australia, Morocco) THEN the system SHALL apply region-specific policy context and cultural adaptation
3. WHEN a user chooses a content type THEN the system SHALL generate content optimized for that specific format using appropriate framing techniques
4. IF the user provides a URL THEN the system SHALL extract and analyze the content to inform the generation process

### Requirement 2: Lakoff Framing Integration

**User Story:** As a content creator, I want my generated content to use George Lakoff's "Don't Think of an Elephant" framing principles, so that my messaging avoids reinforcing opposition frames and uses positive, value-based language.

#### Acceptance Criteria

1. WHEN generating any content THEN the system SHALL analyze topics for conceptual metaphors and reframe using positive language
2. WHEN processing user input THEN the system SHALL identify and avoid negative frames that reinforce opposition messaging
3. WHEN creating content THEN the system SHALL incorporate value-based language that aligns with the target audience's moral framework
4. WHEN referencing stored documents THEN the system SHALL extract relevant framing examples and metaphors to enhance content quality

### Requirement 3: Multi-Model AI Integration

**User Story:** As a user, I want to choose from different AI models based on my content needs and budget constraints, so that I can optimize for either quality, speed, or cost-effectiveness.

#### Acceptance Criteria

1. WHEN accessing model selection THEN the system SHALL display only gemini-2.5-pro, gemini-2.5-flash, and gemma-3-12b-it options
2. WHEN a user selects a model THEN the system SHALL display capabilities, speed, and cost information in glassmorphic cards
3. WHEN generating content THEN the system SHALL use model-specific prompt optimization for best results
4. IF a model fails THEN the system SHALL provide fallback options and clear error messaging

### Requirement 4: Secure API Management

**User Story:** As a user, I want my API keys to be stored securely and my usage monitored, so that I can use the service safely without exposing sensitive credentials.

#### Acceptance Criteria

1. WHEN a user enters an API key THEN the system SHALL encrypt it before storage and mask it in the UI
2. WHEN storing API keys THEN the system SHALL never store them in plain text and clear them on logout
3. WHEN using the API THEN the system SHALL monitor usage quotas and provide alerts before limits are reached
4. WHEN API errors occur THEN the system SHALL provide user-friendly error messages and suggested solutions

### Requirement 5: Content Type Specialization

**User Story:** As a content strategist, I want to generate four distinct types of content with specific formatting and optimization, so that I can address different communication needs and platforms.

#### Acceptance Criteria

1. WHEN generating a "Short Daily Blog Post" THEN the system SHALL create 500-800 word content with Lakoff framing, CTA, and SEO optimization
2. WHEN generating an "AI Policy Article" THEN the system SHALL create 1200-1500 word content with storytelling, citations, and comprehensive Lakoff framing
3. WHEN generating a "Marketing Playbook" THEN the system SHALL create comprehensive strategy content including brand story and A/B testing frameworks
4. WHEN generating a "Social Media Calendar" THEN the system SHALL create platform-specific content with hashtags for one-month planning

### Requirement 6: Geographic and Cultural Adaptation

**User Story:** As a global policy advocate, I want content that is adapted to specific regional contexts and policy environments, so that my messaging is relevant and effective in different jurisdictions.

#### Acceptance Criteria

1. WHEN USA is selected THEN the system SHALL incorporate federal and state AI initiatives and regulatory context
2. WHEN Europe is selected THEN the system SHALL reference GDPR, AI Act, and European policy frameworks
3. WHEN Australia is selected THEN the system SHALL include Australian AI governance and policy context
4. WHEN Morocco is selected THEN the system SHALL incorporate digital transformation and AI strategy context specific to Morocco

### Requirement 7: File Reference and Knowledge Integration

**User Story:** As a researcher, I want the system to reference stored documents and extract relevant examples, so that my generated content is informed by existing knowledge and properly cited.

#### Acceptance Criteria

1. WHEN generating content THEN the system SHALL search both local SQLite database and cloud storage for relevant documents
2. WHEN relevant documents are found THEN the system SHALL extract quotes, examples, and framing techniques to enhance content
3. WHEN using document content THEN the system SHALL provide proper citations and source attribution
4. WHEN performing searches THEN the system SHALL use both keyword and semantic search across document content

### Requirement 8: User Management and Content Organization

**User Story:** As a regular user, I want to manage my account, save my generated content, and track my usage, so that I can organize my work and monitor my service consumption.

#### Acceptance Criteria

1. WHEN registering THEN the system SHALL provide secure registration with profile customization options
2. WHEN generating content THEN the system SHALL save it to the user's content library with version control
3. WHEN accessing content history THEN the system SHALL provide search, archive, and export functionality (PDF, Word, HTML)
4. WHEN collaborating THEN the system SHALL support content sharing and team collaboration features

### Requirement 9: Glassmorphic Design System

**User Story:** As a user, I want a modern, professional interface that follows Apple's design guidelines, so that I have an intuitive and visually appealing experience across all devices.

#### Acceptance Criteria

1. WHEN viewing any interface element THEN the system SHALL use backdrop-filter blur(20px) with subtle transparency
2. WHEN interacting with cards and buttons THEN the system SHALL use 16px radius for cards and 12px for buttons
3. WHEN viewing the interface THEN the system SHALL display a professional blue-to-light-blue gradient palette
4. WHEN using touch interfaces THEN the system SHALL ensure all interactive elements meet 44px minimum target size

### Requirement 10: Performance and Reliability

**User Story:** As a user, I want fast, reliable content generation with real-time feedback, so that I can work efficiently without interruptions.

#### Acceptance Criteria

1. WHEN content is being generated THEN the system SHALL provide streaming responses with progress indicators
2. WHEN API calls are made THEN the system SHALL implement rate limiting and robust error handling
3. WHEN switching models THEN the system SHALL allow dynamic switching without application restart
4. WHEN system errors occur THEN the system SHALL provide clear error messages and recovery options