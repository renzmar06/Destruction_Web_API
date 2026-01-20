import { base44 } from "@/api/base44Client";
import { calculatePrice } from "../price-rules/priceRuleEngine";

export async function applyPriceRulesToService(serviceId, customerId, basePrice) {
  if (!customerId || !serviceId) return basePrice;
  
  try {
    const priceRules = await base44.entities.PriceRule.list();
    const service = await base44.entities.Service.filter({ id: serviceId });
    
    if (!service[0]) return basePrice;
    
    return calculatePrice(
      basePrice,
      priceRules,
      customerId,
      serviceId,
      service[0]
    );
  } catch (error) {
    console.error('Price rule application failed:', error);
    return basePrice;
  }
}

export async function applyPriceRulesToLineItems(lineItems, customerId) {
  if (!customerId || !lineItems || lineItems.length === 0) return lineItems;
  
  try {
    const priceRules = await base44.entities.PriceRule.list();
    const serviceIds = [...new Set(lineItems.map(item => item.service_id).filter(Boolean))];
    const services = await Promise.all(
      serviceIds.map(id => base44.entities.Service.filter({ id }))
    );
    
    const servicesMap = {};
    services.forEach(svcArray => {
      if (svcArray[0]) servicesMap[svcArray[0].id] = svcArray[0];
    });
    
    return lineItems.map(item => {
      if (!item.service_id) return item;
      
      const service = servicesMap[item.service_id];
      if (!service) return item;
      
      const adjustedPrice = calculatePrice(
        service.default_rate,
        priceRules,
        customerId,
        item.service_id,
        service
      );
      
      return {
        ...item,
        unit_price: adjustedPrice,
        line_total: (item.quantity || 0) * adjustedPrice
      };
    });
  } catch (error) {
    console.error('Batch price rule application failed:', error);
    return lineItems;
  }
}