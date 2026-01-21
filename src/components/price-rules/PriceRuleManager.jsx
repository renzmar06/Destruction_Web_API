import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import PriceRuleDialog from "./PriceRuleDialog";

export default function PriceRuleManager({ customerId = null }) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const rules = [];
  const customers = [];
  const services = [];

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setShowDialog(true);
  };

  const handleDelete = (rule) => {
    if (confirm(`Delete price rule "${rule.rule_name}"?`)) {
      alert('Rule deleted');
    }
  };

  const handleSave = (data) => {
    alert(editingRule ? 'Rule updated' : 'Rule created');
    setShowDialog(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Price Rules</h3>
        <Button onClick={() => { setEditingRule(null); setShowDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          New Rule
        </Button>
      </div>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-lg">
            No price rules configured
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900">{rule.rule_name}</h4>
                    <Badge className={rule.rule_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {rule.rule_status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Priority: {rule.priority}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Customers:</span>{' '}
                      <span className="text-slate-900">
                        {rule.applies_to_customers === 'all_customers' ? 'All Customers' :
                         rule.applies_to_customers === 'customer_type' ? `Type: ${rule.customer_type}` :
                         `${rule.selected_customer_ids?.split(',').length || 0} selected`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Services:</span>{' '}
                      <span className="text-slate-900">
                        {rule.applies_to_services === 'all_products_services' ? 'All Products & Services' :
                         rule.applies_to_services === 'service_category' ? `Category: ${rule.service_category}` :
                         `${rule.selected_service_ids?.split(',').length || 0} selected`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Adjustment:</span>{' '}
                      <span className="text-slate-900 font-medium">
                        {rule.adjustment_method === 'percentage' 
                          ? `${rule.adjustment_direction === 'increase' ? '+' : '-'}${rule.adjustment_value}%`
                          : rule.adjustment_method === 'fixed_amount'
                          ? `${rule.adjustment_direction === 'increase' ? '+' : '-'}$${rule.adjustment_value}`
                          : `$${rule.adjustment_value}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Valid:</span>{' '}
                      <span className="text-slate-900">
                        {rule.start_date || rule.end_date 
                          ? `${rule.start_date || 'Always'} - ${rule.end_date || 'Forever'}`
                          : 'Always'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(rule)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PriceRuleDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditingRule(null); }}
        onSave={handleSave}
        rule={editingRule}
        customers={customers}
        services={services}
      />
    </div>
  );
}