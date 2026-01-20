// Price Rule Engine - Handles all price rule evaluation logic

// Simplified wrapper for backward compatibility
export function calculatePrice(basePrice, allRules, customerId, serviceId, service, customer) {
  return calculatePriceWithRules(basePrice, customerId, serviceId, allRules, customer, service).finalPrice;
}

export function calculatePriceWithRules(basePrice, customerId, serviceId, allRules, customer, service) {
  const today = new Date().toISOString().split('T')[0];
  
  // Filter applicable and active rules
  const applicableRules = allRules.filter(rule => {
    // Check status
    if (rule.rule_status !== 'active') return false;
    
    // Check validity period
    if (rule.start_date && rule.start_date > today) return false;
    if (rule.end_date && rule.end_date < today) return false;
    
    // Check customer scope
    const customerMatch = matchesCustomerScope(rule, customerId, customer);
    if (!customerMatch) return false;
    
    // Check service scope
    const serviceMatch = matchesServiceScope(rule, serviceId, service);
    if (!serviceMatch) return false;
    
    return true;
  });
  
  if (applicableRules.length === 0) {
    return { finalPrice: basePrice, ruleApplied: null };
  }
  
  // Sort by priority (highest first) - most specific rules have higher priority
  applicableRules.sort((a, b) => b.priority - a.priority);
  
  // Apply the highest priority rule
  const rule = applicableRules[0];
  let adjustedPrice = basePrice;
  
  switch (rule.adjustment_method) {
    case 'percentage':
      const percentChange = (basePrice * rule.adjustment_value) / 100;
      adjustedPrice = rule.adjustment_direction === 'increase'
        ? basePrice + percentChange
        : basePrice - percentChange;
      break;
      
    case 'fixed_amount':
      adjustedPrice = rule.adjustment_direction === 'increase'
        ? basePrice + rule.adjustment_value
        : basePrice - rule.adjustment_value;
      break;
      
    case 'custom_price':
      adjustedPrice = rule.adjustment_value;
      break;
  }
  
  // Apply rounding
  adjustedPrice = applyRounding(adjustedPrice, rule);
  
  return {
    finalPrice: Math.max(0, adjustedPrice), // Never negative
    ruleApplied: {
      id: rule.id,
      name: rule.rule_name,
      adjustment_method: rule.adjustment_method,
      adjustment_direction: rule.adjustment_direction,
      adjustment_value: rule.adjustment_value
    }
  };
}

function matchesCustomerScope(rule, customerId, customer) {
  switch (rule.applies_to_customers) {
    case 'all_customers':
      return true;
      
    case 'customer_type':
      return customer?.customer_role === rule.customer_type;
      
    case 'selected_customers':
      const selectedIds = rule.selected_customer_ids?.split(',') || [];
      return selectedIds.includes(customerId);
      
    default:
      return false;
  }
}

function matchesServiceScope(rule, serviceId, service) {
  switch (rule.applies_to_services) {
    case 'all_products_services':
      return true;
      
    case 'all_services_only':
      return service?.item_type === 'service';
      
    case 'service_category':
      return service?.service_category === rule.service_category;
      
    case 'selected_services':
      const selectedIds = rule.selected_service_ids?.split(',') || [];
      return selectedIds.includes(serviceId);
      
    default:
      return false;
  }
}

function applyRounding(price, rule) {
  if (rule.rounding_method === 'no_rounding') {
    return price;
  }
  
  if (rule.rounding_method === 'nearest_increment') {
    const increment = rule.rounding_value;
    return Math.round(price / increment) * increment;
  }
  
  if (rule.rounding_method === 'price_ending') {
    const dollars = Math.floor(price);
    const ending = rule.rounding_value;
    return dollars + ending;
  }
  
  return price;
}

export function getApplicableRulesForCustomer(customerId, customer, allRules) {
  const today = new Date().toISOString().split('T')[0];
  
  return allRules.filter(rule => {
    if (rule.rule_status !== 'active') return false;
    if (rule.start_date && rule.start_date > today) return false;
    if (rule.end_date && rule.end_date < today) return false;
    return matchesCustomerScope(rule, customerId, customer);
  });
}