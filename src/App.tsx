import { useState } from "react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Landing } from "./components/Landing";
import { GenerationDashboard } from "./components/GenerationDashboard";
import { OutputDisplay } from "./components/OutputDisplay";
import { ContentLibrary } from "./components/ContentLibrary";
import { Settings } from "./components/Settings";
import { Navigation } from "./components/Navigation";
import { ContentViewer } from "./components/ContentViewer";
import { Toaster } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";

type AppScreen = 'landing' | 'generation' | 'output' | 'library' | 'settings' | 'viewContent';

interface GenerationRequest {
  topic: string;
  url?: string;
  region: 'USA' | 'Europe' | 'Australia' | 'Morocco';
  contentType: 'blog' | 'article' | 'playbook' | 'social';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  
  // Debug: Check authentication state
  const user = useQuery(api.auth.loggedInUser);
  console.log("Current user:", user);

  const handleGenerate = (data: GenerationRequest) => {
    setGenerationRequest(data);
    setCurrentScreen('generation');
  };

  const handleGenerationComplete = (content: string, model: string) => {
    setGeneratedContent(content);
    setSelectedModel(model);
    setCurrentScreen('output');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
    setGenerationRequest(null);
    setGeneratedContent('');
    setSelectedContentId('');
  };

  const handleNavigate = (screen: 'landing' | 'library' | 'settings') => {
    setCurrentScreen(screen);
    setGenerationRequest(null);
    setGeneratedContent('');
    setSelectedContentId('');
  };

  const handleViewContent = (contentId: string) => {
    setSelectedContentId(contentId);
    setCurrentScreen('viewContent');
  };

  const renderAuthenticatedContent = () => {
    console.log('Current screen:', currentScreen);
    console.log('Rendering authenticated content...');
    
    switch (currentScreen) {
      case 'landing':
        console.log('Rendering Landing component');
        return <Landing onGenerate={handleGenerate} />;
      case 'generation':
        return generationRequest ? (
          <GenerationDashboard
            request={generationRequest}
            onBack={handleBackToLanding}
            onComplete={handleGenerationComplete}
          />
        ) : null;
      case 'output':
        return generationRequest ? (
          <OutputDisplay
            content={generatedContent}
            request={generationRequest}
            model={selectedModel}
            onBack={() => setCurrentScreen('generation')}
            onNewContent={handleBackToLanding}
          />
        ) : null;
      case 'library':
        return (
          <ContentLibrary
            onViewContent={handleViewContent}
            onNewContent={handleBackToLanding}
          />
        );
      case 'settings':
        return <Settings onBack={() => setCurrentScreen('landing')} />;
      case 'viewContent':
        return selectedContentId ? (
          <ContentViewer
            contentId={selectedContentId}
            onBack={() => setCurrentScreen('library')}
            onEdit={(content, request, model) => {
              setGeneratedContent(content);
              setGenerationRequest(request);
              setSelectedModel(model);
              setCurrentScreen('output');
            }}
          />
        ) : null;
      default:
        return <Landing onGenerate={handleGenerate} />;
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Authenticated>
        {(currentScreen === 'landing' || currentScreen === 'library' || currentScreen === 'settings') && (
          <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
        )}
      </Authenticated>
      
      <main>
        <Authenticated>
          {renderAuthenticatedContent()}
        </Authenticated>
        <Unauthenticated>
          <div className="flex flex-col gap-8 items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to PolicyFrame
              </h1>
              <p className="text-lg md:text-xl">
                Sign in to start generating AI policy content.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <div className="glass-card p-8">
                <SignInForm />
              </div>
            </div>
          </div>
        </Unauthenticated>
      </main>
      <Toaster />
    </div>
  );
}

