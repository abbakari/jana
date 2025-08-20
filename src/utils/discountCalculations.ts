export interface DiscountRule {
  id: string;
  category: string;
  brand: string;
  discountPercentage: number; // as decimal (e.g., 0.2277 for 22.77%)
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

// Default discount rules based on company formula
const DEFAULT_DISCOUNT_RULES: DiscountRule[] = [
  // P4X4 Category
  { id: 'p4x4_bf', category: 'P4X4', brand: 'BF GOODRICH', discountPercentage: 0.2277, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'p4x4_giti', category: 'P4X4', brand: 'GITI', discountPercentage: 0.0933, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'p4x4_michelin', category: 'P4X4', brand: 'MICHELIN', discountPercentage: 0.1829, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // TBR Category
  { id: 'tbr_aeolus', category: 'TBR', brand: 'AEOLUS', discountPercentage: 0.0004, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_bf', category: 'TBR', brand: 'BF GOODRICH', discountPercentage: 0.1761, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_michelin', category: 'TBR', brand: 'MICHELIN', discountPercentage: 0.1126, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_giti', category: 'TBR', brand: 'GITI', discountPercentage: 0.0076, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_advance', category: 'TBR', brand: 'ADVANCE', discountPercentage: 0.0013, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_tigar', category: 'TBR', brand: 'TIGAR', discountPercentage: 0.1429, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'tbr_bridgestone', category: 'TBR', brand: 'BRIDGESTONE', discountPercentage: 0.302, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // AGR Category
  { id: 'agr_petlas', category: 'AGR', brand: 'PETLAS', discountPercentage: 0.0308, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'agr_michelin', category: 'AGR', brand: 'MICHELIN', discountPercentage: 0.0755, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'agr_bkt', category: 'AGR', brand: 'BKT', discountPercentage: 0.1000, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // SPR Category
  { id: 'spr_bpw', category: 'SPR', brand: 'BPW', discountPercentage: 0.0360, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_wabco', category: 'SPR', brand: 'WABCO', discountPercentage: 0.0416, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_3m', category: 'SPR', brand: '3M', discountPercentage: 0.0263, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_textar', category: 'SPR', brand: 'TEXTAR', discountPercentage: 0.0394, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_contitech', category: 'SPR', brand: 'CONTITECH', discountPercentage: 0.0426, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_don', category: 'SPR', brand: 'DON', discountPercentage: 0.0409, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_donaldson', category: 'SPR', brand: 'DONALDSON', discountPercentage: 0.0300, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_varta', category: 'SPR', brand: 'VARTA', discountPercentage: 0.0429, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_vbg', category: 'SPR', brand: 'VBG', discountPercentage: 0.0235, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_jost', category: 'SPR', brand: 'JOST', discountPercentage: 0.0608, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_mann', category: 'SPR', brand: 'MANN FILTER', discountPercentage: 0.0356, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_nisshinbo', category: 'SPR', brand: 'NISSHINBO', discountPercentage: 0.0625, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_hella', category: 'SPR', brand: 'HELLA', discountPercentage: 0.0381, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_sach', category: 'SPR', brand: 'SACH', discountPercentage: 0.0497, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_waikar', category: 'SPR', brand: 'WAIKAR', discountPercentage: 0.0302, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_myers', category: 'SPR', brand: 'MYERS', discountPercentage: 0.0300, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_tank', category: 'SPR', brand: 'TANK FITTINGS', discountPercentage: 0.0391, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_tyre_acc', category: 'SPR', brand: 'Tyre accessories and Spares', discountPercentage: 0.0227, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_corghi', category: 'SPR', brand: 'CORGHI', discountPercentage: 0.0189, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_fronius', category: 'SPR', brand: 'FRONIUS', discountPercentage: 0.0500, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_kahveci', category: 'SPR', brand: 'KAHVECI OTOMOTIV', discountPercentage: 0.0481, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_zeca', category: 'SPR', brand: 'ZECA', discountPercentage: 0.0037, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_fini', category: 'SPR', brand: 'FINI', discountPercentage: 0.0240, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'spr_jmc', category: 'SPR', brand: 'JMC', discountPercentage: 0.0500, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // IND Category
  { id: 'ind_advance', category: 'IND', brand: 'ADVANCE', discountPercentage: 0.0169, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'ind_camso', category: 'IND', brand: 'CAMSO', discountPercentage: 0.0179, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'ind_michelin', category: 'IND', brand: 'MICHELIN', discountPercentage: 0.0476, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'ind_petlas', category: 'IND', brand: 'PETLAS', discountPercentage: 0.2000, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // OTR Category
  { id: 'otr_advance', category: 'OTR', brand: 'ADVANCE', discountPercentage: 0.0030, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'otr_michelin', category: 'OTR', brand: 'MICHELIN', discountPercentage: 0.0329, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'otr_techking', category: 'OTR', brand: 'TECHKING', discountPercentage: 0.0037, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // Service Categories
  { id: 'services', category: 'Services', brand: '', discountPercentage: 0.0021, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'trl_ser', category: 'TRL-SER', brand: '', discountPercentage: 0.002, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // HDE Services Category
  { id: 'hde_ser_heli', category: 'HDE Services', brand: 'HELI', discountPercentage: 0.0048, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'hde_ser_jmc', category: 'HDE Services', brand: 'JMC', discountPercentage: 0.0072, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'hde_ser_gb', category: 'HDE Services', brand: 'GB POWER', discountPercentage: 0.0026, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'hde_ser_gaither', category: 'HDE Services', brand: 'GAITHER TOOL', discountPercentage: 0.0254, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // HDE Category
  { id: 'hde_gb', category: 'HDE', brand: 'GB POWER', discountPercentage: 0.0056, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'hde_heli', category: 'HDE', brand: 'HELI', discountPercentage: 0.0006, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  
  // GEP Category
  { id: 'gep_corghi', category: 'GEP', brand: 'Corghi', discountPercentage: 0.0098, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'gep_heli', category: 'GEP', brand: 'HELI', discountPercentage: 0.0046, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'gep_fini', category: 'GEP', brand: 'FINI', discountPercentage: 0.0090, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'gep_combijet', category: 'GEP', brand: 'COMBIJET', discountPercentage: 0.0500, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() },
  { id: 'gep_gb', category: 'GEP', brand: 'GB POWER', discountPercentage: 0.0104, isActive: true, createdBy: 'system', createdAt: new Date().toISOString(), lastModified: new Date().toISOString() }
];

export class DiscountCalculator {
  private static STORAGE_KEY = 'admin_discount_rules';

  // Get all discount rules (admin-configurable)
  static getDiscountRules(): DiscountRule[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      } else {
        // Initialize with default rules on first load
        this.saveDiscountRules(DEFAULT_DISCOUNT_RULES);
        return DEFAULT_DISCOUNT_RULES;
      }
    } catch (error) {
      console.error('Error loading discount rules:', error);
      return DEFAULT_DISCOUNT_RULES;
    }
  }

  // Save discount rules (admin only)
  static saveDiscountRules(rules: DiscountRule[], adminUser?: string): boolean {
    try {
      const updatedRules = rules.map(rule => ({
        ...rule,
        lastModified: new Date().toISOString(),
        ...(adminUser && { createdBy: adminUser })
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRules));
      console.log('Discount rules saved by admin:', adminUser || 'system');
      return true;
    } catch (error) {
      console.error('Error saving discount rules:', error);
      return false;
    }
  }

  // Calculate discount for a specific category/brand combination
  static getCategoryDiscount(category: string, brand: string): number {
    const rules = this.getDiscountRules();
    
    // Normalize inputs for case-insensitive comparison
    const normalizedCategory = category.toUpperCase().trim();
    const normalizedBrand = brand.toUpperCase().trim();

    // Find matching rule
    const matchingRule = rules.find(rule => 
      rule.isActive && 
      rule.category.toUpperCase() === normalizedCategory &&
      (rule.brand === '' || rule.brand.toUpperCase() === normalizedBrand)
    );

    if (matchingRule) {
      // Return discount multiplier (1 - discount percentage)
      const discountMultiplier = 1 - matchingRule.discountPercentage;
      console.log(`Discount applied: ${category}/${brand} = ${(matchingRule.discountPercentage * 100).toFixed(2)}% (multiplier: ${discountMultiplier.toFixed(4)})`);
      return discountMultiplier;
    }

    // No matching rule found, return 1 (no discount)
    console.log(`No discount rule found for: ${category}/${brand}`);
    return 1;
  }

  // Calculate discount amount in currency
  static calculateDiscountAmount(baseValue: number, category: string, brand: string): number {
    const discountMultiplier = this.getCategoryDiscount(category, brand);
    const discountAmount = baseValue * (1 - discountMultiplier);
    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  // Calculate final value after discount
  static calculateDiscountedValue(baseValue: number, category: string, brand: string): number {
    const discountMultiplier = this.getCategoryDiscount(category, brand);
    const finalValue = baseValue * discountMultiplier;
    return Math.round(finalValue * 100) / 100; // Round to 2 decimal places
  }

  // Get discount percentage for display
  static getDiscountPercentage(category: string, brand: string): number {
    const rules = this.getDiscountRules();
    const normalizedCategory = category.toUpperCase().trim();
    const normalizedBrand = brand.toUpperCase().trim();

    const matchingRule = rules.find(rule => 
      rule.isActive && 
      rule.category.toUpperCase() === normalizedCategory &&
      (rule.brand === '' || rule.brand.toUpperCase() === normalizedBrand)
    );

    return matchingRule ? matchingRule.discountPercentage * 100 : 0;
  }

  // Add new discount rule (admin only)
  static addDiscountRule(category: string, brand: string, discountPercentage: number, adminUser: string): boolean {
    const rules = this.getDiscountRules();
    
    const newRule: DiscountRule = {
      id: `${category.toLowerCase()}_${brand.toLowerCase()}_${Date.now()}`,
      category: category.toUpperCase(),
      brand: brand.toUpperCase(),
      discountPercentage: discountPercentage / 100, // Convert percentage to decimal
      isActive: true,
      createdBy: adminUser,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    rules.push(newRule);
    return this.saveDiscountRules(rules, adminUser);
  }

  // Update discount rule (admin only)
  static updateDiscountRule(ruleId: string, updates: Partial<DiscountRule>, adminUser: string): boolean {
    const rules = this.getDiscountRules();
    const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
    
    if (ruleIndex >= 0) {
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      return this.saveDiscountRules(rules, adminUser);
    }
    
    return false;
  }

  // Delete discount rule (admin only)
  static deleteDiscountRule(ruleId: string, adminUser: string): boolean {
    const rules = this.getDiscountRules();
    const filteredRules = rules.filter(rule => rule.id !== ruleId);
    
    if (filteredRules.length < rules.length) {
      return this.saveDiscountRules(filteredRules, adminUser);
    }
    
    return false;
  }

  // Reset to default rules (admin only)
  static resetToDefaultRules(adminUser: string): boolean {
    return this.saveDiscountRules(DEFAULT_DISCOUNT_RULES, adminUser);
  }
}

// Export for backward compatibility
export const getCategoryDiscount = DiscountCalculator.getCategoryDiscount;
export const calculateDiscountAmount = DiscountCalculator.calculateDiscountAmount;
export const calculateDiscountedValue = DiscountCalculator.calculateDiscountedValue;
