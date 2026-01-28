// app/settings/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchExpenseSettings, updateExpenseSettings, createExpenseSettings, deleteExpenseSettings } from '@/redux/slices/expenseSettingsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // not used here but good to have
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { HelpCircle } from "lucide-react";

type PaymentTerms =
  | "net_15"
  | "net_30"
  | "net_45"
  | "net_60"
  | "due_on_receipt";

type Greeting = "Dear" | "Hi" | "Hello";

type NameFormat =
  | "[first][last]"
  | "[Title][first]"
  | "[First]"
  | "[full name]"
  | "[Company name]"
  | "[Display name]";

interface ExpenseFormData {
  show_items_table: boolean;
  show_tags_field: boolean;
  track_by_customer: boolean;
  make_billable: boolean;
  markup_enabled: boolean;
  markup_rate: number;
  track_as_income: boolean;
  income_account_type: "single" | "multiple";
  charge_sales_tax: boolean;
  default_bill_payment_terms: PaymentTerms;
  use_purchase_orders: boolean;
  custom_transaction_numbers: boolean;
  default_po_message: string;

  // Email settings for PO
  po_email_use_greeting: boolean;
  po_email_greeting: Greeting;
  po_email_name_format: NameFormat;
  po_email_subject: string;
  po_email_message: string;
  po_email_copy_me: boolean;
  po_email_cc: string;
  po_email_bcc: string;
}

const defaultFormData: ExpenseFormData = {
  show_items_table: false,
  show_tags_field: false,
  track_by_customer: false,
  make_billable: false,
  markup_enabled: false,
  markup_rate: 0,
  track_as_income: false,
  income_account_type: "single",
  charge_sales_tax: false,
  default_bill_payment_terms: "net_30",
  use_purchase_orders: false,
  custom_transaction_numbers: false,
  default_po_message: "",

  po_email_use_greeting: false,
  po_email_greeting: "Dear",
  po_email_name_format: "[First]",
  po_email_subject: "",
  po_email_message: "",
  po_email_copy_me: false,
  po_email_cc: "",
  po_email_bcc: "",
};

export default function ExpensesSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error } = useSelector((state: RootState) => state.expenseSettings);
  
  const [activeSection] = useState<"expenses" | string>("expenses");
  const [editingExpenseSection, setEditingExpenseSection] = useState<
    "bills_expenses" | null
  >(null);

  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>(defaultFormData);

  useEffect(() => {
    dispatch(fetchExpenseSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setExpenseFormData({
        show_items_table: settings.show_items_table ?? defaultFormData.show_items_table,
        show_tags_field: settings.show_tags_field ?? defaultFormData.show_tags_field,
        track_by_customer: settings.track_by_customer ?? defaultFormData.track_by_customer,
        make_billable: settings.make_billable ?? defaultFormData.make_billable,
        markup_enabled: settings.markup_enabled ?? defaultFormData.markup_enabled,
        markup_rate: settings.markup_rate ?? defaultFormData.markup_rate,
        track_as_income: settings.track_as_income ?? defaultFormData.track_as_income,
        income_account_type: settings.income_account_type ?? defaultFormData.income_account_type,
        charge_sales_tax: settings.charge_sales_tax ?? defaultFormData.charge_sales_tax,
        default_bill_payment_terms: settings.default_bill_payment_terms ?? defaultFormData.default_bill_payment_terms,
        use_purchase_orders: settings.use_purchase_orders ?? defaultFormData.use_purchase_orders,
        custom_transaction_numbers: settings.custom_transaction_numbers ?? defaultFormData.custom_transaction_numbers,
        default_po_message: settings.default_po_message ?? defaultFormData.default_po_message,
        po_email_use_greeting: settings.po_email_use_greeting ?? defaultFormData.po_email_use_greeting,
        po_email_greeting: settings.po_email_greeting ?? defaultFormData.po_email_greeting,
        po_email_name_format: settings.po_email_name_format ?? defaultFormData.po_email_name_format,
        po_email_subject: settings.po_email_subject ?? defaultFormData.po_email_subject,
        po_email_message: settings.po_email_message ?? defaultFormData.po_email_message,
        po_email_copy_me: settings.po_email_copy_me ?? defaultFormData.po_email_copy_me,
        po_email_cc: settings.po_email_cc ?? defaultFormData.po_email_cc,
        po_email_bcc: settings.po_email_bcc ?? defaultFormData.po_email_bcc,
      });
    } else {
      setExpenseFormData(defaultFormData);
    }
  }, [settings]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await dispatch(createExpenseSettings(expenseFormData)).unwrap();
      setEditingExpenseSection(null);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSettings = async () => {
    if (!settings?._id || isSaving) return;
    
    setIsSaving(true);
    try {
      await dispatch(deleteExpenseSettings(settings._id)).unwrap();
    } catch (error) {
      console.error('Failed to delete settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPaymentTermsLabel = (value: PaymentTerms) => {
    switch (value) {
      case "net_15":
        return "Net 15";
      case "net_30":
        return "Net 30";
      case "net_45":
        return "Net 45";
      case "net_60":
        return "Net 60";
      default:
        return "Due on receipt";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && !settings && (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 text-lg">Loading settings...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        {activeSection === "expenses" && !loading && (
          <div className="space-y-6">
            {/* Expenses Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="font-semibold text-lg text-slate-900">
                  Expenses
                </h3>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setEditingExpenseSection("bills_expenses")}
                >
                  Edit
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Bills and expenses */}
                <div className="pb-6 border-b border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-4">
                    Bills and expenses
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Show items table on expense and purchase forms
                      </span>
                      <span className="font-medium text-slate-900">
                        {expenseFormData.show_items_table ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Show "tags" field on expense and purchase forms
                      </span>
                      <span className="font-medium text-slate-900">
                        {expenseFormData.show_tags_field ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Track expenses and items by customer
                      </span>
                      <span className="font-medium text-slate-900">
                        {expenseFormData.track_by_customer ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Make expenses and items billable
                      </span>
                      <span className="font-medium text-slate-900">
                        {expenseFormData.make_billable ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Default bill payment terms
                      </span>
                      <span className="font-medium text-slate-900">
                        {getPaymentTermsLabel(
                          expenseFormData.default_bill_payment_terms,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Orders */}
                <div className="pb-6 border-b border-slate-100">
                  <h4 className="font-medium text-slate-900 mb-4">
                    Purchase orders
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Use purchase orders</span>
                    <span className="font-medium text-slate-900">
                      {expenseFormData.use_purchase_orders ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Messages</h4>
                  <div className="text-sm text-slate-600">
                    Default email message sent with purchase orders
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Pay Promo */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">
                Bill Pay
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                <h4 className="font-semibold text-slate-900 mb-2">
                  Automate your accounts payable and simplify bill payments with
                  Bill Pay
                </h4>
                <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
                  Easily upload bills, schedule payments, and manage user
                  approvals all in one place.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 px-8">
                  See plans
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeSection !== "expenses" && (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 text-lg">
              This section is coming soon
            </p>
          </div>
        )}

        {/* Floating Done Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button className="h-12 px-10 bg-green-600 hover:bg-green-700 shadow-lg text-white font-medium">
            Done
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingExpenseSection === "bills_expenses"}
        onOpenChange={(open) => !open && setEditingExpenseSection(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Expenses</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">

            <div className="space-y-10">
              {/* Bills and expenses section */}
              <div className="space-y-6 pb-8 border-b">
                <h3 className="font-semibold text-md text-slate-900">
                  Bills and expenses
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-slate-700 font-medium">
                        Show items table on expense and purchase forms
                      </Label>
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <Switch
                      checked={expenseFormData.show_items_table}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          show_items_table: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-slate-700 font-medium">
                        Show "tags" field on expense and purchase forms
                      </Label>
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <Switch
                      checked={expenseFormData.show_tags_field}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          show_tags_field: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-slate-700 font-medium">
                        Track expenses and items by customer
                      </Label>
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <Switch
                      checked={expenseFormData.track_by_customer}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          track_by_customer: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-slate-700 font-medium">
                        Make expenses and items billable
                      </Label>
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <Switch
                      checked={expenseFormData.make_billable}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          make_billable: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex  gap-3  items-center">
                    <Checkbox
                      checked={expenseFormData.markup_enabled}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          markup_enabled: !!v,
                        }))
                      }
                      id="markup"
                    />
                    <div className="flex gap-4 leading-none items-center  ">
                      <Label
                        htmlFor="markup"
                        className="text-slate-700 font-medium"
                      >
                        Markup with a default rate of
                      </Label>
                      <div className="flex items-center gap-2 ">
                        <Input
                          type="number"
                          value={expenseFormData.markup_rate}
                          onChange={(e) =>
                            setExpenseFormData((prev) => ({
                              ...prev,
                              markup_rate: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-24"
                          disabled={!expenseFormData.markup_enabled}
                        />
                        <span className="text-slate-600">%</span>
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                
                    <div className="pl-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={expenseFormData.track_as_income}
                          onCheckedChange={(v) =>
                            setExpenseFormData((prev) => ({
                              ...prev,
                              track_as_income: !!v,
                            }))
                          }
                          id="track-income"
                        />
                        <Label
                          htmlFor="track-income"
                          className="text-slate-700 font-medium"
                        >
                          Track billable expenses and items as income
                        </Label>
                        <HelpCircle className="h-4 w-4 text-slate-400" />
                      </div>

                      {expenseFormData.track_as_income && (
                        <div className="pl-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              id="single"
                              checked={
                                expenseFormData.income_account_type === "single"
                              }
                              onChange={() =>
                                setExpenseFormData((prev) => ({
                                  ...prev,
                                  income_account_type: "single",
                                }))
                              }
                              className="h-4 w-4"
                            />
                            <Label htmlFor="single" className="cursor-pointer">
                              In a single account
                            </Label>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              id="multiple"
                              checked={
                                expenseFormData.income_account_type ===
                                "multiple"
                              }
                              onChange={() =>
                                setExpenseFormData((prev) => ({
                                  ...prev,
                                  income_account_type: "multiple",
                                }))
                              }
                              className="h-4 w-4"
                            />
                            <Label
                              htmlFor="multiple"
                              className="cursor-pointer"
                            >
                              In multiple accounts
                            </Label>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <Checkbox
                              checked={expenseFormData.charge_sales_tax}
                              onCheckedChange={(v) =>
                                setExpenseFormData((prev) => ({
                                  ...prev,
                                  charge_sales_tax: !!v,
                                }))
                              }
                              id="sales-tax"
                            />
                            <Label
                              htmlFor="sales-tax"
                              className="text-slate-700"
                            >
                              Charge sales tax
                            </Label>
                            <HelpCircle className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  

                  <div className="pt-4">
                    <Label className="text-slate-700 font-medium mb-2 block">
                      Default bill payment terms
                    </Label>
                    <Select
                      value={expenseFormData.default_bill_payment_terms}
                      onValueChange={(v: PaymentTerms) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          default_bill_payment_terms: v,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full ">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due_on_receipt">
                          Due on receipt
                        </SelectItem>
                        <SelectItem value="net_15">Net 15</SelectItem>
                        <SelectItem value="net_30">Net 30</SelectItem>
                        <SelectItem value="net_45">Net 45</SelectItem>
                        <SelectItem value="net_60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Purchase Orders */}
              <div className="space-y-6 pb-8 border-b">
                <h3 className="font-semibold text-xl text-slate-900">
                  Purchase orders
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-medium">
                      Use purchase orders
                    </Label>
                    <Switch
                      checked={expenseFormData.use_purchase_orders}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          use_purchase_orders: v,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Label className="text-slate-700 font-medium">
                        Custom transaction numbers
                      </Label>
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <Switch
                      checked={expenseFormData.custom_transaction_numbers}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          custom_transaction_numbers: v,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Default message on purchase orders
                    </Label>
                    <Textarea
                      rows={4}
                      value={expenseFormData.default_po_message}
                      onChange={(e) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          default_po_message: e.target.value,
                        }))
                      }
                      placeholder="Enter Default message"
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-6">
                <h3 className="font-semibold text-xl text-slate-900">
                  Messages
                </h3>

                <div className="space-y-5">
                  <div className="text-sm text-slate-600 mb-3">
                    Default email message sent with purchase orders
                  </div>

                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Checkbox
                        checked={expenseFormData.po_email_use_greeting}
                        onCheckedChange={(v) =>
                          setExpenseFormData((prev) => ({
                            ...prev,
                            po_email_use_greeting: !!v,
                          }))
                        }
                        id="use-greeting"
                      />
                      <Label htmlFor="use-greeting" className="font-medium">
                        Use greeting
                      </Label>

                      <Select
                        value={expenseFormData.po_email_greeting}
                        onValueChange={(v: Greeting) =>
                          setExpenseFormData((prev) => ({
                            ...prev,
                            po_email_greeting: v,
                          }))
                        }
                        disabled={!expenseFormData.po_email_use_greeting}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dear">Dear</SelectItem>
                          <SelectItem value="Hi">Hi</SelectItem>
                          <SelectItem value="Hello">Hello</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={expenseFormData.po_email_name_format}
                        onValueChange={(v: NameFormat) =>
                          setExpenseFormData((prev) => ({
                            ...prev,
                            po_email_name_format: v,
                          }))
                        }
                        disabled={!expenseFormData.po_email_use_greeting}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="[First]">[First]</SelectItem>
                          <SelectItem value="[full name]">
                            [full name]
                          </SelectItem>
                          <SelectItem value="[Company name]">
                            [Company name]
                          </SelectItem>
                          <SelectItem value="[Display name]">
                            [Display name]
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Use standard message
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Email subject line
                    </Label>
                    <Input
                      value={expenseFormData.po_email_subject}
                      onChange={(e) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          po_email_subject: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Email message
                    </Label>
                    <Textarea
                      rows={6}
                      value={expenseFormData.po_email_message}
                      onChange={(e) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          po_email_message: e.target.value,
                        }))
                      }
                      placeholder="Please find our purchase order attached..."
                      className="resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={expenseFormData.po_email_copy_me}
                      onCheckedChange={(v) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          po_email_copy_me: !!v,
                        }))
                      }
                      id="copy-me"
                    />
                    <Label htmlFor="copy-me" className="text-slate-700">
                      Email me a copy
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Cc email addresses (separated by commas)
                    </Label>
                    <Input
                      value={expenseFormData.po_email_cc}
                      onChange={(e) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          po_email_cc: e.target.value,
                        }))
                      }
                    
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">
                      Bcc email addresses (separated by commas)
                    </Label>
                    <Input
                      value={expenseFormData.po_email_bcc}
                      onChange={(e) =>
                        setExpenseFormData((prev) => ({
                          ...prev,
                          po_email_bcc: e.target.value,
                        }))
                      }

                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setEditingExpenseSection(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 px-8"
                onClick={handleSaveSettings}
                disabled={loading || isSaving}
              >
                {loading || isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
