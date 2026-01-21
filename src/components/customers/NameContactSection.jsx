import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

export default function NameContactSection({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2">
        <User className="w-5 h-5 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Name and Contact</h3>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="title" className="text-xs font-semibold text-slate-700">Title</Label>
          <Input
            id="title"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Mr."
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="col-span-3 space-y-2">
          <Label htmlFor="first_name" className="text-xs font-semibold text-slate-700">First name</Label>
          <Input
            id="first_name"
            value={data.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="middle_name" className="text-xs font-semibold text-slate-700">Middle name</Label>
          <Input
            id="middle_name"
            value={data.middle_name || ''}
            onChange={(e) => handleChange('middle_name', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="col-span-3 space-y-2">
          <Label htmlFor="last_name" className="text-xs font-semibold text-slate-700">Last name</Label>
          <Input
            id="last_name"
            value={data.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="suffix" className="text-xs font-semibold text-slate-700">Suffix</Label>
          <Input
            id="suffix"
            value={data.suffix || ''}
            onChange={(e) => handleChange('suffix', e.target.value)}
            placeholder="Jr."
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200"></div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="legal_company_name" className="text-xs font-semibold text-slate-700">Company name</Label>
          <Input
            id="legal_company_name"
            value={data.legal_company_name || ''}
            onChange={(e) => handleChange('legal_company_name', e.target.value)}
            placeholder="Type to search"
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name" className="text-xs font-semibold text-slate-700">
            Customer display name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="display_name"
            value={data.display_name || ''}
            onChange={(e) => handleChange('display_name', e.target.value)}
            className={`h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.display_name ? 'border-red-400' : ''}`}
          />
          {errors.display_name && <p className="text-xs text-red-500">{errors.display_name}</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200"></div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={data.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Enter password for customer login"
            className={`h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${errors.password ? 'border-red-400' : ''}`}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone number</Label>
          <Input
            id="phone"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cc_email" className="text-xs font-semibold text-slate-700">Cc</Label>
          <Input
            id="cc_email"
            type="email"
            value={data.cc_email || ''}
            onChange={(e) => handleChange('cc_email', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bcc_email" className="text-xs font-semibold text-slate-700">Bcc</Label>
          <Input
            id="bcc_email"
            type="email"
            value={data.bcc_email || ''}
            onChange={(e) => handleChange('bcc_email', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-xs font-semibold text-slate-700">Mobile number</Label>
          <Input
            id="mobile"
            value={data.mobile || ''}
            onChange={(e) => handleChange('mobile', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fax" className="text-xs font-semibold text-slate-700">Fax</Label>
          <Input
            id="fax"
            value={data.fax || ''}
            onChange={(e) => handleChange('fax', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="other_contact" className="text-xs font-semibold text-slate-700">Other</Label>
          <Input
            id="other_contact"
            value={data.other_contact || ''}
            onChange={(e) => handleChange('other_contact', e.target.value)}
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-xs font-semibold text-slate-700">Website</Label>
          <Input
            id="website"
            value={data.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://"
            className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200"></div>

      <div className="space-y-2">
        <Label htmlFor="print_on_check_name" className="text-xs font-semibold text-slate-700">Name to print on checks</Label>
        <Input
          id="print_on_check_name"
          value={data.print_on_check_name || ''}
          onChange={(e) => handleChange('print_on_check_name', e.target.value)}
          className="max-w-md h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          id="is_sub_customer"
          checked={data.is_sub_customer || false}
          onCheckedChange={(checked) => handleChange('is_sub_customer', checked)}
        />
        <Label htmlFor="is_sub_customer" className="text-sm font-medium cursor-pointer text-slate-700">
          Is a sub-customer
        </Label>
      </div>

      <div className="pt-4 border-t border-slate-200"></div>

      <div className="space-y-2">
        <Label htmlFor="customer_role" className="text-xs font-semibold text-slate-700">Customer Type</Label>
        <Select value={data.customer_role || ''} onValueChange={(value) => handleChange('customer_role', value)}>
          <SelectTrigger className="h-10 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
            <SelectValue placeholder="Select customer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brand_owner">Brand Owner</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
            <SelectItem value="co_packer">Co-Packer</SelectItem>
            <SelectItem value="retailer">Retailer</SelectItem>
            <SelectItem value="3pl_warehouse">3PL Warehouse</SelectItem>
            <SelectItem value="broker">Broker</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}