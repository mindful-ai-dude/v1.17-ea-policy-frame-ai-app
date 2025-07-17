import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ContentGenerationEngine } from '../../services/ContentGenerationEngine';
import { FileReferenceService } from '../../services/FileReferenceService';
import { geminiService } from '../../services/GeminiService';
import { api } from '../../utils/api';

// Import components that would be part of the workflow
// Note: These imports are placeholders and should be replaced with actual components
import GenerationDashboard from '../../pages/GenerationDashboard';
import OutputDisplay from '../../pages/OutputDisplay';
import Library from '../../pages/Library';

// Import the integration test setup
import '../integration-setup';

// Helper function to wrap components with router
const withRouter = (component) => (
  <BrowserRouter>{component}</BrowserRouter>
);

describe('End-to-End User Workflows', () => {
  // Mock the necessary services and APIs
  beforeEach(() => {
    // Mock GeminiService
    vi.spyOn(geminiService, 'hasApiKey').mockReturnValue(true);
    vi.spyOn(geminiService, 'generateContent').mockResolvedValue(
      'Generated content for E2E test'
    );
    
    // Mock ContentGenerationEngine
    vi.spyOn(ContentGenerationEngine.prototype, 'generateContent').mockResolvedValue({
      content: 'Generated content for E2E test',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'blog',
        topic: 'E2E Testing',
        generationTime: 1.5,
        wordCount: 5
      }
    });
    
    // Mock FileReferenceService
    vi.spyOn(FileReferenceService.prototype, 'getUserDocuments').mockResolvedValue([
      {
        id: 'doc1',
        title: 'Test Document',
        content: 'This is a test document for E2E testing.',
        metadata: {
          author: 'Test Author',
          fileType: 'text/plain'
        }
      }
    ]);
    
    // Mock Convex API
    (api.query.auth.getUser as any).mockResolvedValue({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com'
    });
  });
  
  describe('Content Generation Workflow', () => {
    it('should generate content and display output', async () => {
      // Render the GenerationDashboard component
      render(withRouter(<GenerationDashboard />));
      
      // Fill in the form
      fireEvent.change(screen.getByLabelText(/topic/i), {
        target: { value: 'E2E Testing' }
      });
      
      fireEvent.change(screen.getByLabelText(/region/i), {
        target: { value: 'usa' }
      });
      
      fireEvent.click(screen.getByLabelText(/blog post/i));
      
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /generate/i }));
      
      // Wait for content generation to complete
      await waitFor(() => {
        expect(ContentGenerationEngine.prototype.generateContent).toHaveBeenCalled();
      });
      
      // Check that the output is displayed
      expect(screen.getByText(/generated content for e2e test/i)).toBeInTheDocument();
    });
  });
  
  describe('Content Library Workflow', () => {
    it('should display user documents in library', async () => {
      // Render the Library component
      render(withRouter(<Library />));
      
      // Wait for documents to load
      await waitFor(() => {
        expect(FileReferenceService.prototype.getUserDocuments).toHaveBeenCalled();
      });
      
      // Check that documents are displayed
      expect(screen.getByText(/test document/i)).toBeInTheDocument();
    });
    
    it('should allow document deletion', async () => {
      // Mock deleteDocument
      vi.spyOn(FileReferenceService.prototype, 'deleteDocument').mockResolvedValue(true);
      
      // Render the Library component
      render(withRouter(<Library />));
      
      // Wait for documents to load
      await waitFor(() => {
        expect(FileReferenceService.prototype.getUserDocuments).toHaveBeenCalled();
      });
      
      // Click delete button
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      
      // Confirm deletion
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
      
      // Wait for deletion to complete
      await waitFor(() => {
        expect(FileReferenceService.prototype.deleteDocument).toHaveBeenCalled();
      });
    });
  });
  
  describe('Output Display Workflow', () => {
    it('should display generated content with export options', async () => {
      // Mock content for OutputDisplay
      const mockContent = {
        content: 'Generated content for E2E test',
        metadata: {
          model: 'gemini-2.5-pro',
          region: 'usa',
          contentType: 'blog',
          topic: 'E2E Testing',
          generationTime: 1.5,
          wordCount: 5
        }
      };
      
      // Render the OutputDisplay component with mock content
      render(withRouter(<OutputDisplay content={mockContent} />));
      
      // Check that content is displayed
      expect(screen.getByText(/generated content for e2e test/i)).toBeInTheDocument();
      
      // Check that export options are available
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      
      // Click export button
      fireEvent.click(screen.getByRole('button', { name: /export/i }));
      
      // Check that export options are displayed
      expect(screen.getByRole('menuitem', { name: /pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /word/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /html/i })).toBeInTheDocument();
    });
  });
});