import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function CustomSelectInput({ 
  value, 
  onValueChange, 
  options, 
  placeholder, 
  label,
  className,
  required 
}) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [allOptions, setAllOptions] = useState(options);

  const handleSelectChange = (val) => {
    if (val === '__custom__') {
      setShowCustomDialog(true);
    } else {
      onValueChange(val);
    }
  };

  const handleAddCustom = () => {
    if (customValue.trim()) {
      const newOption = { value: customValue.trim(), label: customValue.trim() };
      setAllOptions([...allOptions, newOption]);
      onValueChange(customValue.trim());
      setShowCustomDialog(false);
      setCustomValue('');
    }
  };

  return (
    <>
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="__custom__" className="text-blue-600 font-medium">
            <div className="flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Add new {label}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name{required && <span className="text-red-500">*</span>}</Label>
              <Input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={`Enter ${label} name`}
                className="h-11 text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustom} className="bg-green-600 hover:bg-green-700">
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}