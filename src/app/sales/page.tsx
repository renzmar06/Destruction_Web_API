// app/settings/sales/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchSalesSettings, saveSalesSettings } from '@/redux/slices/salesSettingsSlice';
import {CheckCircle} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SalesSettings = {
  preferred_invoice_terms: string;
  preferred_delivery_method: string;
  shipping_enabled: boolean;
  custom_fields_enabled: boolean;
  custom_transaction_numbers: boolean;
  service_date_enabled: boolean;
  discount_enabled: boolean;
  deposit_enabled: boolean;
  accept_tips_enabled: boolean;
  tags_enabled: boolean;
  turn_on_price_rules: boolean;
  accept_credit_cards: boolean;
  accept_ach: boolean;
  accept_paypal: boolean;
  customer_pays_fee: boolean;
  payment_instructions: string;
  customer_financing_enabled: boolean;
  show_product_service_column: boolean;
  show_sku_column: boolean;
  track_quantity_price: boolean;
  track_inventory: boolean;
  inventory_valuation_method: 'fifo' | 'lifo' | 'average_cost';
  track_inventory_sales_channels: boolean;
  late_fees_enabled: boolean;
  progress_invoicing_enabled: boolean;
  default_email_message: string;
  default_invoice_reminder_message: string;
  automatic_invoice_reminders: boolean;
  ask_work_request: boolean;
  ask_review_feedback: boolean;
  ask_referral: boolean;
  feedback_frequency_days: number;
  online_delivery_enabled: boolean;
  show_aging_table: boolean;
};

export default function SalesSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { salesSettings, loading } = useSelector((state: RootState) => state.salesSettings);

  const [settings, setSettings] = useState<SalesSettings>({
    preferred_invoice_terms: 'due_on_receipt',
    preferred_delivery_method: 'none',
    shipping_enabled: false,
    custom_fields_enabled: false,
    custom_transaction_numbers: false,
    service_date_enabled: false,
    discount_enabled: false,
    deposit_enabled: false,
    accept_tips_enabled: false,
    tags_enabled: false,
    turn_on_price_rules: false,
    accept_credit_cards: false,
    accept_ach: false,
    accept_paypal: false,
    customer_pays_fee: false,
    payment_instructions: '',
    customer_financing_enabled: false,
    show_product_service_column: false,
    show_sku_column: false,
    track_quantity_price: false,
    track_inventory: false,
    inventory_valuation_method: 'fifo',
    track_inventory_sales_channels: false,
    late_fees_enabled: false,
    progress_invoicing_enabled: false,
    default_email_message: '',
    default_invoice_reminder_message: '',
    automatic_invoice_reminders: false,
    ask_work_request: false,
    ask_review_feedback: false,
    ask_referral: false,
    feedback_frequency_days: 0,
    online_delivery_enabled: false,
    show_aging_table: false,
  });

  const [tempSettings, setTempSettings] = useState<Partial<SalesSettings>>({});
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchSalesSettings());
  }, [dispatch]);

  useEffect(() => {
    if (salesSettings) {
      setSettings(salesSettings);
      setTempSettings({});
    }
  }, [salesSettings]);

  const updateSwitchSetting = async <K extends keyof SalesSettings>(
    key: K,
    value: SalesSettings[K],
  ) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    try {
      await dispatch(saveSalesSettings(updatedSettings)).unwrap();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1800);
    } catch (error) {
      console.error('Error saving setting:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const updateTempSetting = <K extends keyof SalesSettings>(
    key: K,
    value: SalesSettings[K],
  ) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleDone = async () => {
    const finalSettings = { ...settings, ...tempSettings };
    try {
      await dispatch(saveSalesSettings(finalSettings)).unwrap();
      setSettings(finalSettings);
      setTempSettings({});
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 1800);
    } catch (error) {
      console.error('Error saving sales settings:', error);
    }
  };

  const getValue = <K extends keyof SalesSettings>(key: K): SalesSettings[K] => {
    return (tempSettings[key] ?? settings[key]) as SalesSettings[K];
  };

  if (loading && !salesSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading sales settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Main Content */}
        <div className="space-y-8">
          {/* ────────────────────────────────────────────── */}
          {/* Sales Form Content */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
               
                Sales Form Content
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Preferred invoice terms</Label>
                  <p className="text-sm text-slate-500">Default terms for new invoices</p>
                </div>
                <Select
                  value={getValue('preferred_invoice_terms')}
                  onValueChange={(v) => updateTempSetting('preferred_invoice_terms', v)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due_on_receipt">Due on receipt</SelectItem>
                    <SelectItem value="net_15">Net 15</SelectItem>
                    <SelectItem value="net_30">Net 30</SelectItem>
                    <SelectItem value="net_45">Net 45</SelectItem>
                    <SelectItem value="net_60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Preferred delivery method</Label>
                </div>
                <Select
                  value={getValue('preferred_delivery_method')}
                  onValueChange={(v) => updateTempSetting('preferred_delivery_method', v)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="mail">Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Shipping</Label>
                  <p className="text-sm text-slate-500">Enable shipping fields on sales forms</p>
                </div>
                <Switch
                  checked={settings.shipping_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('shipping_enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Customer fields</Label>
                </div>
                <Switch
                  checked={settings.custom_fields_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('custom_fields_enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Custom transaction numbers</Label>
                </div>
                <Switch
                  checked={settings.custom_transaction_numbers}
                  onCheckedChange={(v) => updateSwitchSetting('custom_transaction_numbers', v)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Service date</Label>
                </div>
                <Switch
                  checked={settings.service_date_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('service_date_enabled', v)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Discount</Label>
                </div>
                <Switch
                  checked={settings.discount_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('discount_enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Deposits</Label>
                </div>
                <Switch
                  checked={settings.deposit_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('deposit_enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Accept tips</Label>
                </div>
                <Switch
                  checked={settings.accept_tips_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('accept_tips_enabled', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Tags</Label>
                </div>
                <Switch
                  checked={settings.tags_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('tags_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Invoice Payments */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Invoice Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Accept Credit Cards</Label>
                </div>
                <Switch
                  checked={settings.accept_credit_cards}
                  onCheckedChange={(v) => updateSwitchSetting('accept_credit_cards', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Accept ACH</Label>
                </div>
                <Switch
                  checked={settings.accept_ach}
                  onCheckedChange={(v) => updateSwitchSetting('accept_ach', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Accept PayPal</Label>
                </div>
                <Switch
                  checked={settings.accept_paypal}
                  onCheckedChange={(v) => updateSwitchSetting('accept_paypal', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Your customer pays a fee</Label>
                </div>
                <Switch
                  checked={settings.customer_pays_fee}
                  onCheckedChange={(v) => updateSwitchSetting('customer_pays_fee', v)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">Payment instructions</Label>
                <Textarea
                  value={getValue('payment_instructions')}
                  onChange={(e) => updateTempSetting('payment_instructions', e.target.value)}
                  placeholder="Instructions for customers on how to pay..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Financing */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
              
                Financing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base flex items-center gap-2">
                    Customer financing
                    <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-semibold rounded">NEW</span>
                  </Label>
                </div>
                <Switch
                  checked={settings.customer_financing_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('customer_financing_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Products and Services */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Products and services
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Show Product/Service column on sales forms</Label>
                </div>
                <Switch
                  checked={settings.show_product_service_column}
                  onCheckedChange={(v) => updateSwitchSetting('show_product_service_column', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Show SKU column</Label>
                </div>
                <Switch
                  checked={settings.show_sku_column}
                  onCheckedChange={(v) => updateSwitchSetting('show_sku_column', v)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Turn on price rules</Label>
                </div>
                <Switch
                  checked={settings.turn_on_price_rules}
                  onCheckedChange={(v) => updateSwitchSetting('turn_on_price_rules', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Track quantity and price/rate</Label>
                </div>
                <Switch
                  checked={settings.track_quantity_price}
                  onCheckedChange={(v) => updateSwitchSetting('track_quantity_price', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Track inventory quantity on hand</Label>
                </div>
                <Switch
                  checked={settings.track_inventory}
                  onCheckedChange={(v) => updateSwitchSetting('track_inventory', v)}
                />
              </div>

                <div className="flex items-center justify-between py-2 ">
                  <div>
                    <Label className="text-base">Inventory valuation method</Label>
                  </div>
                  <Select
                    value={getValue('inventory_valuation_method')}
                    onValueChange={(v) =>
                      updateTempSetting('inventory_valuation_method', v as any)
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO</SelectItem>
                      <SelectItem value="lifo">LIFO</SelectItem>
                      <SelectItem value="average_cost">Average Cost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Track inventory for sales channels</Label>
                </div>
                <Switch
                  checked={settings.track_inventory_sales_channels}
                  onCheckedChange={(v) => updateSwitchSetting('track_inventory_sales_channels', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Late Fees */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
              
                Late Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Default charge applied to overdue invoices</Label>
                  <p className="text-sm text-slate-500 mt-1">
                   Appears as a line under Product/Service on the invoice, and applies to all customers.
                  </p>
                </div>
                <Switch
                  checked={settings.late_fees_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('late_fees_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Progress Invoicing */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Progress Invoicing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Create multiple partial invoices from a single estimate</Label>
                </div>
                <Switch
                  checked={settings.progress_invoicing_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('progress_invoicing_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-slate-700 mb-2">Default email message sent with sales forms</div>
              <Textarea
                value={getValue('default_email_message')}
                onChange={(e) => updateTempSetting('default_email_message', e.target.value)}
                rows={4}
                placeholder="Enter default message..."
              />
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="text-slate-700 mb-2">Default email message for invoice reminders</div>
              <Textarea
                value={getValue('default_invoice_reminder_message')}
                onChange={(e) => updateTempSetting('default_invoice_reminder_message', e.target.value)}
                rows={4}
                placeholder="Enter reminder message..."
              />

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Automatic invoice reminders</Label>
                </div>
                <Switch
                  checked={settings.automatic_invoice_reminders}
                  onCheckedChange={(v) => updateSwitchSetting('automatic_invoice_reminders', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Post Invoice / Feedback Survey */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Post invoice / Feedback survey
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Ask for a work request</Label>
                </div>
                <Switch
                  checked={settings.ask_work_request}
                  onCheckedChange={(v) => updateSwitchSetting('ask_work_request', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Ask for a review, feedback or testimonials</Label>
                </div>
                <Switch
                  checked={settings.ask_review_feedback}
                  onCheckedChange={(v) => updateSwitchSetting('ask_review_feedback', v)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Ask for a referral</Label>
                </div>
                <Switch
                  checked={settings.ask_referral}
                  onCheckedChange={(v) => updateSwitchSetting('ask_referral', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Frequency</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={getValue('feedback_frequency_days')}
                    onChange={(e) =>
                      updateTempSetting('feedback_frequency_days', Number(e.target.value))
                    }
                    className="w-20"
                  />
                  <span className="text-slate-600">days</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Online Delivery */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Online Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-slate-700 mb-2">Email options for all sales forms</div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-base">Enable online delivery</Label>
                </div>
                <Switch
                  checked={settings.online_delivery_enabled}
                  onCheckedChange={(v) => updateSwitchSetting('online_delivery_enabled', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* ────────────────────────────────────────────── */}
          {/* Statements */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                Statements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Show aging table at bottom of statement</Label>
                </div>
                <Switch
                  checked={settings.show_aging_table}
                  onCheckedChange={(v) => updateSwitchSetting('show_aging_table', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Done Button */}
      <Button 
        onClick={handleDone}
        disabled={loading}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg z-40"
      >
        {loading ? 'Saving...' : 'Done'}
      </Button>

      {/* Success Toast */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium text-base">Settings saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}