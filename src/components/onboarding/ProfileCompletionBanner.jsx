import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import Link from "next/link";


export default function ProfileCompletionBanner({ customer, onDismiss }) {
  const calculateCompletion = (customer) => {
    // Use the stored percentage if available, otherwise calculate
    if (customer.profile_completion_percentage !== undefined && customer.profile_completion_percentage !== null) {
      return customer.profile_completion_percentage;
    }
    
    const fields = [
      customer.legal_company_name,
      customer.email,
      customer.phone,
      customer.billing_street_1,
      customer.billing_city,
      customer.billing_state,
      customer.billing_zip,
      customer.customer_role,
      customer.primary_product_type
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getMissingFields = (customer) => {
    const missing = [];
    if (!customer.legal_company_name) missing.push('Company Name');
    if (!customer.phone) missing.push('Phone Number');
    if (!customer.billing_street_1 || !customer.billing_city || !customer.billing_state) missing.push('Address');
    if (!customer.customer_role) missing.push('Business Role');
    if (!customer.primary_product_type) missing.push('Product Type');
    return missing;
  };

  const completion = calculateCompletion(customer);
  const missingFields = getMissingFields(customer);

  if (completion === 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-slate-700 text-sm mb-4">
                Add your company details to speed up service requests and ensure accurate billing.
              </p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Profile Completion
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {completion}%
                  </span>
                </div>
                <Progress value={completion} className="h-3" />
              </div>

              {missingFields.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Missing information:</p>
                  <div className="flex flex-wrap gap-2">
                    {missingFields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white border border-amber-200 rounded-full text-xs text-slate-700"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link href={'/'}>
                <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
                  Complete Profile
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}