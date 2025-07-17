import { describe, it, expect } from 'vitest';
import { lakoffFramingEngine, COMMON_FRAMES, NEGATIVE_FRAMES, COMMON_METAPHORS } from '../LakoffFramingEngine';
import { Frame, FramingAnalysis, Metaphor } from '../../types';

describe('LakoffFramingEngine', () => {
  describe('analyzeFraming', () => {
    it('should detect frames based on keywords', () => {
      const content = 'We need to protect our community and provide care for those affected by AI automation.';
      const analysis = lakoffFramingEngine.analyzeFraming(content);
      
      expect(analysis.detectedFrames.length).toBeGreaterThan(0);
      expect(analysis.detectedFrames.some(frame => frame.name === 'Nurturant Parent')).toBe(true);
    });
    
    it('should suggest complementary frames', () => {
      const content = 'We must ensure freedom and choice in how AI is developed and deployed.';
      const analysis = lakoffFramingEngine.analyzeFraming(content);
      
      expect(analysis.suggestedFrames.length).toBeGreaterThan(0);
      // Freedom is detected, so Fairness or Security might be suggested
      const suggestedFrameNames = analysis.suggestedFrames.map(frame => frame.name);
      expect(
        suggestedFrameNames.includes('Fairness') || 
        suggestedFrameNames.includes('Security')
      ).toBe(true);
    });
    
    it('should calculate effectiveness score', () => {
      const positiveContent = 'We should advance AI with care for our community, ensuring fairness and equal opportunity for all. This progress must be sustainable and protect our shared values.';
      const negativeContent = 'AI poses an existential threat that must be controlled before it takes jobs and creates unpredictable risks.';
      
      const positiveAnalysis = lakoffFramingEngine.analyzeFraming(positiveContent);
      const negativeAnalysis = lakoffFramingEngine.analyzeFraming(negativeContent);
      
      expect(positiveAnalysis.effectiveness).toBeGreaterThan(negativeAnalysis.effectiveness);
      expect(positiveAnalysis.effectiveness).toBeGreaterThan(50);
      expect(negativeAnalysis.effectiveness).toBeLessThan(50);
    });

    it('should detect multiple frames in the same content', () => {
      const content = 'We need to balance freedom of innovation with the security of proper safeguards. Progress must be made while ensuring sustainability.';
      const analysis = lakoffFramingEngine.analyzeFraming(content);
      
      const detectedFrameNames = analysis.detectedFrames.map(frame => frame.name);
      expect(detectedFrameNames).toContain('Freedom');
      expect(detectedFrameNames).toContain('Security');
      expect(detectedFrameNames).toContain('Progress');
      expect(detectedFrameNames).toContain('Sustainability');
    });

    it('should suggest default frames when no frames are detected', () => {
      const content = 'This text contains no specific framing keywords.';
      const analysis = lakoffFramingEngine.analyzeFraming(content);
      
      expect(analysis.detectedFrames.length).toBe(0);
      expect(analysis.suggestedFrames.length).toBeGreaterThan(0);
      expect(analysis.suggestedFrames[0].name).toBe('Progress');
      expect(analysis.suggestedFrames[1].name).toBe('Fairness');
    });
  });
  
  describe('extractMetaphors', () => {
    it('should identify common metaphors in text', () => {
      const content = 'AI thinks differently than humans. We are in an AI race with other nations. We need AI assistants that serve human needs.';
      const metaphors = lakoffFramingEngine.extractMetaphors(content);
      
      expect(metaphors.length).toBeGreaterThan(0);
      expect(metaphors.some(m => m.text.toLowerCase().includes('ai thinks'))).toBe(true);
      expect(metaphors.some(m => m.text.toLowerCase().includes('ai race'))).toBe(true);
      expect(metaphors.some(m => m.text.toLowerCase().includes('ai assistant'))).toBe(true);
    });
    
    it('should include context with extracted metaphors', () => {
      const content = 'The development of AI systems that think and reason is accelerating rapidly.';
      const metaphors = lakoffFramingEngine.extractMetaphors(content);
      
      expect(metaphors.length).toBeGreaterThan(0);
      expect(metaphors[0].context).toContain('AI systems that think');
      expect(metaphors[0].context.length).toBeGreaterThan(metaphors[0].text.length);
    });

    it('should categorize metaphors by type', () => {
      const content = 'AI thinks like a human. We are in an AI race. AI can be weaponized. AI serves as an assistant.';
      const metaphors = lakoffFramingEngine.extractMetaphors(content);
      
      const metaphorTypes = metaphors.map(m => m.type);
      expect(metaphorTypes).toContain('aiAsActor');
      expect(metaphorTypes).toContain('aiAsRace');
      expect(metaphorTypes).toContain('aiAsServant');
    });
  });
  
  describe('avoidNegativeFrames', () => {
    it('should replace negative frames with positive alternatives', () => {
      const content = 'AI poses an existential risk that must be controlled before it takes jobs.';
      const reframed = lakoffFramingEngine.avoidNegativeFrames(content);
      
      expect(reframed).not.toContain('existential risk');
      expect(reframed).not.toContain('controlled');
      expect(reframed).not.toContain('takes jobs');
      
      // Check that replacements were made
      expect(reframed).not.toBe(content);
    });
    
    it('should handle multiple negative frames', () => {
      const content = 'Uncontrollable AI surveillance poses a threat to privacy and could lead to AI taking jobs.';
      const reframed = lakoffFramingEngine.avoidNegativeFrames(content);
      
      // Check that all negative frames were replaced
      Object.values(NEGATIVE_FRAMES).flat().forEach(term => {
        if (content.toLowerCase().includes(term.toLowerCase())) {
          expect(reframed.toLowerCase()).not.toContain(term.toLowerCase());
        }
      });
    });

    it('should preserve the overall meaning while replacing negative frames', () => {
      const content = 'AI risks must be controlled through regulation.';
      const reframed = lakoffFramingEngine.avoidNegativeFrames(content);
      
      expect(reframed).not.toContain('risks');
      expect(reframed).not.toContain('controlled');
      expect(reframed).toContain('AI');
      expect(reframed).toContain('regulation');
      expect(reframed.length).toBeGreaterThanOrEqual(content.length * 0.7); // Ensure most content is preserved
    });

    it('should return original content if no negative frames are found', () => {
      const content = 'AI can enhance human capabilities and create new opportunities.';
      const reframed = lakoffFramingEngine.avoidNegativeFrames(content);
      
      expect(reframed).toBe(content);
    });

    it('should handle case-insensitive replacements', () => {
      const content = 'AI THREAT and ai risk need to be Controlled.';
      const reframed = lakoffFramingEngine.avoidNegativeFrames(content);
      
      expect(reframed.toLowerCase()).not.toContain('threat');
      expect(reframed.toLowerCase()).not.toContain('risk');
      expect(reframed.toLowerCase()).not.toContain('controlled');
    });
  });
  
  describe('reinforcePositiveFrames', () => {
    it('should add value-based language for specified frames', () => {
      const content = 'AI systems should be designed with appropriate safeguards.';
      const frame = COMMON_FRAMES.nurturantParent;
      const reinforced = lakoffFramingEngine.reinforcePositiveFrames(content, [frame]);
      
      // Content should be longer after reinforcement
      expect(reinforced.length).toBeGreaterThan(content.length);
      
      // Should contain at least one value term from the frame
      const hasValueTerm = frame.values.some(value => 
        reinforced.toLowerCase().includes(value.toLowerCase())
      );
      expect(hasValueTerm).toBe(true);
    });
    
    it('should add metaphors when appropriate', () => {
      const content = 'AI systems should follow ethical guidelines and respect human autonomy.';
      const frame = COMMON_FRAMES.freedom;
      const reinforced = lakoffFramingEngine.reinforcePositiveFrames(content, [frame]);
      
      // Content should be longer after reinforcement
      expect(reinforced.length).toBeGreaterThan(content.length);
      
      // Should contain at least one metaphor from the frame or a sentence about metaphors
      const hasMetaphorReference = frame.metaphors.some(metaphor => 
        reinforced.toLowerCase().includes(metaphor.toLowerCase())
      );
      expect(hasMetaphorReference).toBe(true);
    });

    it('should use default frames when none are provided', () => {
      const content = 'AI systems should be beneficial.';
      const reinforced = lakoffFramingEngine.reinforcePositiveFrames(content);
      
      // Should be longer after reinforcement
      expect(reinforced.length).toBeGreaterThan(content.length);
      
      // Should contain value terms from default frames (Progress and Fairness)
      const progressValues = COMMON_FRAMES.progress.values;
      const fairnessValues = COMMON_FRAMES.fairness.values;
      
      const hasProgressValue = progressValues.some(value => 
        reinforced.toLowerCase().includes(value.toLowerCase())
      );
      
      const hasFairnessValue = fairnessValues.some(value => 
        reinforced.toLowerCase().includes(value.toLowerCase())
      );
      
      expect(hasProgressValue || hasFairnessValue).toBe(true);
    });

    it('should use detected frames when no frames are provided', () => {
      // Content with clear "Security" frame
      const content = 'AI systems must be secure, safe, and protect users from harm.';
      const reinforced = lakoffFramingEngine.reinforcePositiveFrames(content);
      
      // Should contain security frame values
      const securityValues = COMMON_FRAMES.security.values;
      const hasSecurityValue = securityValues.some(value => 
        reinforced.toLowerCase().includes(value.toLowerCase())
      );
      
      expect(hasSecurityValue).toBe(true);
    });
  });
  
  describe('reframeContent', () => {
    it('should reframe content according to target frame', () => {
      const content = 'AI systems pose risks that must be controlled through strict regulation.';
      const targetFrame = COMMON_FRAMES.nurturantParent;
      const reframed = lakoffFramingEngine.reframeContent(content, targetFrame);
      
      // Should add framing language
      expect(reframed.length).toBeGreaterThan(content.length);
      
      // Should contain value terms from the target frame
      const hasValueTerm = targetFrame.values.some(value => 
        reframed.toLowerCase().includes(value.toLowerCase())
      );
      expect(hasValueTerm).toBe(true);
      
      // Should replace negative frames
      expect(reframed).not.toContain('risks that must be controlled');
      expect(reframed).not.toContain('strict regulation');
    });
    
    it('should make minimal changes if target frame is already dominant', () => {
      // Content already using nurturant parent frame
      const content = 'We must care for our community by developing AI that protects and supports human flourishing.';
      const targetFrame = COMMON_FRAMES.nurturantParent;
      const reframed = lakoffFramingEngine.reframeContent(content, targetFrame);
      
      // Core message should be preserved
      expect(reframed).toContain('care for our community');
      expect(reframed).toContain('protects and supports');
    });

    it('should add frame-specific introduction and conclusion', () => {
      const content = 'AI development should be regulated.';
      const targetFrame = COMMON_FRAMES.fairness;
      const reframed = lakoffFramingEngine.reframeContent(content, targetFrame);
      
      // Should have introduction with frame values
      expect(reframed.split('\n\n')[0]).toContain('equitable');
      expect(reframed.split('\n\n')[0]).toContain('justice');
      
      // Original content should be in the middle
      expect(reframed).toContain(content);
      
      // Should have conclusion with frame values
      const lastParagraph = reframed.split('\n\n').pop() || '';
      expect(lastParagraph).toContain('justice');
      expect(lastParagraph).toContain('equality');
    });

    it('should replace conflicting metaphors with frame-aligned ones', () => {
      const content = 'We are in an AI arms race that requires strict control of AI development.';
      const targetFrame = COMMON_FRAMES.nurturantParent;
      const reframed = lakoffFramingEngine.reframeContent(content, targetFrame);
      
      // Should replace negative metaphors
      expect(reframed).not.toContain('AI arms race');
      expect(reframed).not.toContain('strict control');
      
      // Should use nurturant parent aligned metaphors
      expect(reframed).toContain('collaborative AI advancement');
      expect(reframed).toContain('guide AI development');
    });
  });

  describe('Frame and Metaphor Constants', () => {
    it('should have all required common frames', () => {
      expect(Object.keys(COMMON_FRAMES)).toContain('nurturantParent');
      expect(Object.keys(COMMON_FRAMES)).toContain('strictFather');
      expect(Object.keys(COMMON_FRAMES)).toContain('fairness');
      expect(Object.keys(COMMON_FRAMES)).toContain('freedom');
      expect(Object.keys(COMMON_FRAMES)).toContain('progress');
      expect(Object.keys(COMMON_FRAMES)).toContain('security');
      expect(Object.keys(COMMON_FRAMES)).toContain('sustainability');
    });

    it('should have properly structured frames', () => {
      Object.values(COMMON_FRAMES).forEach(frame => {
        expect(frame).toHaveProperty('name');
        expect(frame).toHaveProperty('values');
        expect(frame).toHaveProperty('metaphors');
        expect(frame).toHaveProperty('keywords');
        expect(frame.values.length).toBeGreaterThan(0);
        expect(frame.metaphors.length).toBeGreaterThan(0);
        expect(frame.keywords.length).toBeGreaterThan(0);
      });
    });

    it('should have all required metaphor categories', () => {
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsActor');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsRace');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsWeapon');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsServant');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsEvolution');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsJourney');
      expect(Object.keys(COMMON_METAPHORS)).toContain('aiAsContainer');
    });

    it('should have all required negative frame categories', () => {
      expect(Object.keys(NEGATIVE_FRAMES)).toContain('aiThreat');
      expect(Object.keys(NEGATIVE_FRAMES)).toContain('aiControl');
      expect(Object.keys(NEGATIVE_FRAMES)).toContain('aiReplacement');
      expect(Object.keys(NEGATIVE_FRAMES)).toContain('aiSurveillance');
      expect(Object.keys(NEGATIVE_FRAMES)).toContain('aiUnpredictability');
    });
  });
});