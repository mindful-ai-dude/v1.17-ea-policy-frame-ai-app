import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeographicContextService } from '../GeographicContextService';
import { Region } from '../../types';

describe('GeographicContextService', () => {
  let service: GeographicContextService;

  beforeEach(() => {
    service = new GeographicContextService();
  });

  describe('getPolicyFramework', () => {
    it('should return USA policy framework', () => {
      const framework = service.getPolicyFramework('usa');
      expect(framework.name).toBe('U.S. AI Policy Framework');
      expect(framework.keyPrinciples).toContain('Innovation-first approach');
      expect(framework.relevantLegislation).toContain('Executive Order 14110 on Safe, Secure, and Trustworthy AI (2023)');
    });

    it('should return European policy framework', () => {
      const framework = service.getPolicyFramework('europe');
      expect(framework.name).toBe('European AI Governance Framework');
      expect(framework.keyPrinciples).toContain('Human-centric approach');
      expect(framework.relevantLegislation).toContain('EU AI Act (2023)');
    });

    it('should return Australian policy framework', () => {
      const framework = service.getPolicyFramework('australia');
      expect(framework.name).toBe('Australian AI Ethics Framework');
      expect(framework.keyPrinciples).toContain('Human-centered values');
      expect(framework.relevantLegislation).toContain('Australia\'s AI Ethics Framework');
    });

    it('should return Moroccan policy framework', () => {
      const framework = service.getPolicyFramework('morocco');
      expect(framework.name).toBe('Moroccan Digital Development Framework');
      expect(framework.keyPrinciples).toContain('Digital transformation acceleration');
      expect(framework.relevantLegislation).toContain('Digital Morocco 2025 Strategy');
    });
  });

  describe('getRegionalContext', () => {
    it('should return complete regional context for USA', async () => {
      const context = await service.getRegionalContext('usa', 'AI ethics');
      expect(context.region).toBe('usa');
      expect(context.policyFramework).toBeDefined();
      expect(context.culturalNotes).toBeDefined();
      expect(context.culturalNotes.length).toBeGreaterThan(0);
      expect(context.recentDevelopments).toBeDefined();
      expect(context.recentDevelopments.length).toBeGreaterThan(0);
    });

    it('should return complete regional context for Europe', async () => {
      const context = await service.getRegionalContext('europe', 'AI regulation');
      expect(context.region).toBe('europe');
      expect(context.policyFramework).toBeDefined();
      expect(context.culturalNotes).toBeDefined();
      expect(context.culturalNotes.length).toBeGreaterThan(0);
      expect(context.recentDevelopments).toBeDefined();
      expect(context.recentDevelopments.length).toBeGreaterThan(0);
    });
  });

  describe('adaptCulturalReferences', () => {
    it('should replace generic terms with USA-specific terms', () => {
      const content = 'The government agency is responsible for enforcing data protection laws. The parliament will debate this issue.';
      const adapted = service.adaptCulturalReferences(content, 'usa');
      
      expect(adapted).toContain('federal agency');
      expect(adapted).toContain('Congress');
      expect(adapted).not.toContain('government agency');
      expect(adapted).not.toContain('parliament');
    });

    it('should replace generic terms with Europe-specific terms', () => {
      const content = 'The government agency is responsible for enforcing data protection laws. The parliament will debate this issue.';
      const adapted = service.adaptCulturalReferences(content, 'europe');
      
      expect(adapted).toContain('EU authority');
      expect(adapted).toContain('European Parliament');
      expect(adapted).not.toContain('government agency');
    });
  });

  describe('optimizeRegionalContent', () => {
    it('should add regional context paragraph for USA', async () => {
      const context = await service.getRegionalContext('usa', 'AI ethics');
      const content = 'AI ethics is an important consideration for policy makers.';
      const optimized = service.optimizeRegionalContent(content, 'usa', context);
      
      expect(optimized).toContain(content);
      expect(optimized).toContain('In the United States context');
      expect(optimized).toContain('innovation and regulation');
    });

    it('should add legislation references if not present', async () => {
      const context = await service.getRegionalContext('europe', 'AI regulation');
      const content = 'AI regulation should be carefully considered.';
      const optimized = service.optimizeRegionalContent(content, 'europe', context);
      
      expect(optimized).toContain(content);
      expect(optimized).toContain('European legislation');
      expect(optimized).toContain('EU AI Act');
    });

    it('should not add legislation references if already present', async () => {
      const context = await service.getRegionalContext('europe', 'AI regulation');
      const content = 'AI regulation should follow the EU AI Act (2023) guidelines.';
      const optimized = service.optimizeRegionalContent(content, 'europe', context);
      
      const legislationMentionCount = (optimized.match(/EU AI Act/g) || []).length;
      expect(legislationMentionCount).toBe(1); // Should not add another reference
    });
  });

  describe('getRecentDevelopments', () => {
    it('should return recent developments for each region', async () => {
      const usaDevelopments = await service.getRecentDevelopments('usa', 'AI');
      expect(usaDevelopments.length).toBeGreaterThan(0);
      expect(usaDevelopments[0].title).toBeDefined();
      expect(usaDevelopments[0].date).toBeInstanceOf(Date);

      const europeDevelopments = await service.getRecentDevelopments('europe', 'AI');
      expect(europeDevelopments.length).toBeGreaterThan(0);
      expect(europeDevelopments[0].title).toBeDefined();
      
      const australiaDevelopments = await service.getRecentDevelopments('australia', 'AI');
      expect(australiaDevelopments.length).toBeGreaterThan(0);
      expect(australiaDevelopments[0].title).toBeDefined();
      
      const moroccoDevelopments = await service.getRecentDevelopments('morocco', 'AI');
      expect(moroccoDevelopments.length).toBeGreaterThan(0);
      expect(moroccoDevelopments[0].title).toBeDefined();
    });
  });
});