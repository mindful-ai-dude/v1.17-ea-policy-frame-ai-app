import { Region, RegionalContext, PolicyFramework, PolicyUpdate } from '../types';

/**
 * GeographicContextService provides region-specific policy context and cultural adaptation
 * for content generation across different geographic regions.
 */
export class GeographicContextService {
  /**
   * Get regional context for a specific region and topic
   * @param region The geographic region
   * @param topic The topic to get context for
   * @returns Promise resolving to regional context information
   */
  async getRegionalContext(region: Region, topic: string): Promise<RegionalContext> {
    // Get the policy framework for the region
    const policyFramework = this.getPolicyFramework(region);
    
    // Get cultural notes for the region
    const culturalNotes = this.getCulturalNotes(region);
    
    // Get recent policy developments for the region and topic
    const recentDevelopments = await this.getRecentDevelopments(region, topic);
    
    return {
      region,
      policyFramework,
      culturalNotes,
      recentDevelopments
    };
  }

  /**
   * Adapt content with cultural references appropriate for the region
   * @param content The content to adapt
   * @param region The target region
   * @returns Culturally adapted content
   */
  adaptCulturalReferences(content: string, region: Region): string {
    // Get region-specific cultural references
    const culturalReferences = this.getCulturalReferences(region);
    
    // Replace generic references with region-specific ones
    let adaptedContent = content;
    
    Object.entries(culturalReferences).forEach(([generic, specific]) => {
      const regex = new RegExp(`\\b${generic}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, specific);
    });
    
    return adaptedContent;
  }

  /**
   * Get the policy framework for a specific region
   * @param region The geographic region
   * @returns Policy framework for the region
   */
  getPolicyFramework(region: Region): PolicyFramework {
    switch (region) {
      case 'usa':
        return {
          name: 'U.S. AI Policy Framework',
          description: 'A market-driven approach balanced with targeted regulation focusing on innovation, national security, and ethical guidelines.',
          keyPrinciples: [
            'Innovation-first approach',
            'Public-private partnerships',
            'Risk-based regulatory framework',
            'National security considerations',
            'Sector-specific guidelines'
          ],
          relevantLegislation: [
            'Executive Order 14110 on Safe, Secure, and Trustworthy AI (2023)',
            'National AI Initiative Act (2020)',
            'NIST AI Risk Management Framework',
            'Blueprint for an AI Bill of Rights',
            'State-level regulations (e.g., California Consumer Privacy Act)'
          ]
        };
      
      case 'europe':
        return {
          name: 'European AI Governance Framework',
          description: 'A comprehensive regulatory approach focusing on human-centric, trustworthy AI with strong data protection and risk management.',
          keyPrinciples: [
            'Human-centric approach',
            'Precautionary principle',
            'Strong data protection',
            'Risk-based classification system',
            'Algorithmic transparency'
          ],
          relevantLegislation: [
            'EU AI Act (2023)',
            'General Data Protection Regulation (GDPR)',
            'Digital Services Act',
            'Digital Markets Act',
            'European Declaration on Digital Rights and Principles'
          ]
        };
      
      case 'australia':
        return {
          name: 'Australian AI Ethics Framework',
          description: 'A balanced approach focusing on voluntary ethics principles, industry standards, and targeted regulation where necessary.',
          keyPrinciples: [
            'Human, social, and environmental wellbeing',
            'Human-centered values',
            'Fairness',
            'Privacy protection and security',
            'Reliability and safety',
            'Transparency and explainability',
            'Contestability',
            'Accountability'
          ],
          relevantLegislation: [
            'Australia\'s AI Ethics Framework',
            'Privacy Act 1988',
            'Consumer Data Right',
            'Online Safety Act 2021',
            'Critical Infrastructure Risk Management Program'
          ]
        };
      
      case 'morocco':
        return {
          name: 'Moroccan Digital Development Framework',
          description: 'An emerging framework focusing on digital transformation, AI adoption, and integration with international standards.',
          keyPrinciples: [
            'Digital transformation acceleration',
            'Public service modernization',
            'Digital skills development',
            'International cooperation',
            'Innovation ecosystem development'
          ],
          relevantLegislation: [
            'Digital Morocco 2025 Strategy',
            'Law 09-08 on Protection of Individuals with Regard to Personal Data',
            'National Cybersecurity Strategy',
            'Morocco-EU Digital Partnership',
            'National Commission for the Control of Personal Data Protection (CNDP) guidelines'
          ]
        };
    }
  }

  /**
   * Get cultural notes for a specific region
   * @param region The geographic region
   * @returns Array of cultural notes
   */
  private getCulturalNotes(region: Region): string[] {
    switch (region) {
      case 'usa':
        return [
          'Strong emphasis on individual rights and freedoms',
          'Market-driven approach to technology regulation',
          'Significant variation in state-level policies and attitudes',
          'Focus on national security implications of AI',
          'Tension between innovation and regulation',
          'Strong tech industry influence on policy development'
        ];
      
      case 'europe':
        return [
          'Emphasis on collective rights and social welfare',
          'Precautionary principle guides technology regulation',
          'Strong data protection and privacy culture',
          'Harmonization across member states with national variations',
          'Focus on ethical AI and human oversight',
          'Digital sovereignty as a key policy driver'
        ];
      
      case 'australia':
        return [
          'Balanced approach between innovation and regulation',
          'Strong focus on practical implementation of ethical principles',
          'Geographic considerations for rural and remote communities',
          'Indigenous perspectives and cultural considerations',
          'Regional cooperation within Asia-Pacific',
          'Emphasis on responsible innovation'
        ];
      
      case 'morocco':
        return [
          'Emerging digital economy with rapid growth',
          'Balance of traditional values with technological advancement',
          'Strategic position between Africa, Middle East, and Europe',
          'Focus on digital skills development and education',
          'Multilingual context (Arabic, French, Berber languages)',
          'Emphasis on international partnerships and standards alignment'
        ];
    }
  }

  /**
   * Get recent policy developments for a region and topic
   * @param region The geographic region
   * @param topic The topic to get developments for
   * @returns Promise resolving to an array of policy updates
   */
  async getRecentDevelopments(region: Region, topic: string): Promise<PolicyUpdate[]> {
    // In a real implementation, this would fetch from an API or database
    // For now, we'll return static recent developments by region
    
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    
    switch (region) {
      case 'usa':
        return [
          {
            title: 'Executive Order on Safe, Secure, and Trustworthy AI',
            description: 'Comprehensive executive order establishing new standards for AI safety and security, requiring testing and risk management for advanced AI systems.',
            date: threeMonthsAgo,
            source: 'The White House',
            url: 'https://www.whitehouse.gov/briefing-room/presidential-actions/2023/10/30/executive-order-on-the-safe-secure-and-trustworthy-development-and-use-of-artificial-intelligence/'
          },
          {
            title: 'NIST AI Risk Management Framework 1.0',
            description: 'Framework to better manage risks to individuals, organizations, and society associated with artificial intelligence.',
            date: sixMonthsAgo,
            source: 'National Institute of Standards and Technology',
            url: 'https://www.nist.gov/itl/ai-risk-management-framework'
          },
          {
            title: 'State-Level AI Regulation Initiatives',
            description: 'Multiple states including California, Colorado, and New York have introduced AI-specific legislation addressing algorithmic transparency and bias.',
            date: oneMonthAgo,
            source: 'National Conference of State Legislatures',
            url: 'https://www.ncsl.org'
          }
        ];
      
      case 'europe':
        return [
          {
            title: 'EU AI Act Final Approval',
            description: 'The world\'s first comprehensive AI law establishing a risk-based approach to regulating artificial intelligence systems.',
            date: oneMonthAgo,
            source: 'European Commission',
            url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai'
          },
          {
            title: 'AI Liability Directive Proposal',
            description: 'New rules on liability for damage caused by AI systems, making it easier for victims to seek compensation.',
            date: threeMonthsAgo,
            source: 'European Commission',
            url: 'https://ec.europa.eu/commission/presscorner/detail/en/ip_22_5807'
          },
          {
            title: 'European AI Alliance Developments',
            description: 'Expansion of the European AI Alliance to include more stakeholders and focus areas for responsible AI development.',
            date: sixMonthsAgo,
            source: 'European AI Alliance',
            url: 'https://digital-strategy.ec.europa.eu/en/policies/european-ai-alliance'
          }
        ];
      
      case 'australia':
        return [
          {
            title: 'National AI Action Plan',
            description: 'Australia\'s strategy to maximize the economic potential of AI while ensuring inclusive and human-centered implementation.',
            date: threeMonthsAgo,
            source: 'Department of Industry, Science and Resources',
            url: 'https://www.industry.gov.au/data-and-publications/australias-artificial-intelligence-action-plan'
          },
          {
            title: 'AI Ethics Principles Implementation',
            description: 'Practical guidance for businesses and government agencies on implementing Australia\'s AI Ethics Framework.',
            date: sixMonthsAgo,
            source: 'Department of Industry, Science and Resources',
            url: 'https://www.industry.gov.au/publications/australias-artificial-intelligence-ethics-framework'
          },
          {
            title: 'Critical Infrastructure Protection for AI Systems',
            description: 'New regulations classifying certain AI systems as critical infrastructure requiring enhanced security measures.',
            date: oneMonthAgo,
            source: 'Department of Home Affairs',
            url: 'https://www.homeaffairs.gov.au/about-us/our-portfolios/national-security/security-coordination/security-of-critical-infrastructure-act-2018'
          }
        ];
      
      case 'morocco':
        return [
          {
            title: 'Morocco-EU Digital Partnership',
            description: 'Strategic partnership focusing on digital transformation, AI development, and alignment with EU digital standards.',
            date: threeMonthsAgo,
            source: 'Ministry of Digital Transition and Administrative Reform',
            url: 'https://www.mtpdigital.gov.ma'
          },
          {
            title: 'National AI Strategy Development',
            description: 'Ongoing development of Morocco\'s first comprehensive national AI strategy focusing on economic development and public sector modernization.',
            date: sixMonthsAgo,
            source: 'Ministry of Industry and Trade',
            url: 'https://www.mcinet.gov.ma'
          },
          {
            title: 'Digital Development Agency AI Initiatives',
            description: 'Launch of new programs to accelerate AI adoption in key sectors including agriculture, healthcare, and education.',
            date: oneMonthAgo,
            source: 'Digital Development Agency',
            url: 'https://www.add.gov.ma'
          }
        ];
    }
  }

  /**
   * Get cultural references for a specific region
   * @param region The geographic region
   * @returns Record of generic terms to region-specific terms
   * @private
   */
  private getCulturalReferences(region: Region): Record<string, string> {
    switch (region) {
      case 'usa':
        return {
          'government agency': 'federal agency',
          'data protection authority': 'Federal Trade Commission',
          'regulatory framework': 'federal and state regulations',
          'legislative process': 'congressional process',
          'ministry': 'department',
          'parliament': 'Congress',
          'public sector': 'federal government',
          'digital rights': 'online civil liberties'
        };
      
      case 'europe':
        return {
          'government agency': 'EU authority',
          'data protection authority': 'data protection authority (DPA)',
          'regulatory framework': 'EU regulatory framework',
          'legislative process': 'EU legislative procedure',
          'ministry': 'ministry',
          'parliament': 'European Parliament',
          'public sector': 'public administration',
          'digital rights': 'digital rights and freedoms'
        };
      
      case 'australia':
        return {
          'government agency': 'Australian government agency',
          'data protection authority': 'Office of the Australian Information Commissioner',
          'regulatory framework': 'Australian regulatory framework',
          'legislative process': 'parliamentary process',
          'ministry': 'department',
          'parliament': 'Australian Parliament',
          'public sector': 'Australian Public Service',
          'digital rights': 'digital rights'
        };
      
      case 'morocco':
        return {
          'government agency': 'Moroccan government agency',
          'data protection authority': 'National Commission for the Control of Personal Data Protection (CNDP)',
          'regulatory framework': 'Moroccan regulatory framework',
          'legislative process': 'legislative process',
          'ministry': 'ministry',
          'parliament': 'Moroccan Parliament',
          'public sector': 'public administration',
          'digital rights': 'digital rights'
        };
    }
  }

  /**
   * Optimize content for a specific region
   * @param content The content to optimize
   * @param region The target region
   * @param regionalContext The regional context information
   * @returns Region-optimized content
   */
  optimizeRegionalContent(content: string, region: Region, regionalContext: RegionalContext): string {
    // Adapt cultural references
    let optimizedContent = this.adaptCulturalReferences(content, region);
    
    // Add region-specific context paragraph
    const contextParagraph = this.generateRegionalContextParagraph(region, regionalContext);
    optimizedContent = `${optimizedContent}\n\n${contextParagraph}`;
    
    // Add relevant legislation references if not already present
    const legislationParagraph = this.generateLegislationReferences(region, regionalContext, content);
    if (legislationParagraph) {
      optimizedContent = `${optimizedContent}\n\n${legislationParagraph}`;
    }
    
    return optimizedContent;
  }

  /**
   * Generate a paragraph with regional context
   * @param region The geographic region
   * @param regionalContext The regional context information
   * @returns A paragraph with regional context
   */
  generateRegionalContextParagraph(region: Region, regionalContext: RegionalContext): string {
    switch (region) {
      case 'usa':
        return `In the United States context, AI policy is shaped by a balance between innovation and regulation, with significant emphasis on public-private partnerships and sector-specific guidelines. The U.S. approach prioritizes ${regionalContext.policyFramework.keyPrinciples.slice(0, 3).join(', ')}, while addressing concerns about national security and ethical implementation.`;
      
      case 'europe':
        return `Within the European context, AI governance is characterized by a comprehensive regulatory approach that emphasizes human-centric values and strong data protection. The European framework is built on ${regionalContext.policyFramework.keyPrinciples.slice(0, 3).join(', ')}, reflecting the EU's commitment to ethical and trustworthy AI development.`;
      
      case 'australia':
        return `Australia's approach to AI policy balances innovation with ethical considerations, focusing on practical implementation of principles including ${regionalContext.policyFramework.keyPrinciples.slice(0, 3).join(', ')}. The Australian framework acknowledges unique geographic considerations and indigenous perspectives while promoting responsible innovation.`;
      
      case 'morocco':
        return `Morocco's emerging AI policy landscape is characterized by rapid digital transformation and international cooperation. The Moroccan approach emphasizes ${regionalContext.policyFramework.keyPrinciples.slice(0, 3).join(', ')}, reflecting the country's strategic position between Africa, Europe, and the Middle East and its commitment to technological advancement.`;
    }
  }

  /**
   * Generate references to relevant legislation if not already in content
   * @param region The geographic region
   * @param regionalContext The regional context information
   * @param content The existing content
   * @returns A paragraph with legislation references or undefined if already present
   * @private
   */
  private generateLegislationReferences(region: Region, regionalContext: RegionalContext, content: string): string | undefined {
    // Check if content already contains references to key legislation
    const hasLegislationReferences = regionalContext.policyFramework.relevantLegislation.some(
      legislation => content.includes(legislation)
    );
    
    if (hasLegislationReferences) {
      return undefined;
    }
    
    // Generate legislation references paragraph
    const keyLegislation = regionalContext.policyFramework.relevantLegislation.slice(0, 3);
    
    switch (region) {
      case 'usa':
        return `Key U.S. policy instruments relevant to this discussion include ${keyLegislation.join(', ')}, which collectively establish the framework for responsible AI development and deployment in the United States.`;
      
      case 'europe':
        return `This approach is formalized through key European legislation including ${keyLegislation.join(', ')}, which together create a comprehensive framework for ethical and human-centric AI governance.`;
      
      case 'australia':
        return `Australia's approach is implemented through key frameworks including ${keyLegislation.join(', ')}, which establish guidelines for responsible AI innovation while protecting individual rights.`;
      
      case 'morocco':
        return `Morocco's digital transformation is guided by key initiatives including ${keyLegislation.join(', ')}, which form the foundation for the country's emerging AI governance framework.`;
    }
  }
}

// Export singleton instance
export const geographicContextService = new GeographicContextService();