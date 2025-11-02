"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload, Download } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  paperColor: string;
  signature: string | null;
  invoiceNumber: string;
  date: string;
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  items: InvoiceItem[];
  note: string;
}

const STORAGE_KEY = "invoice-creator-data";

const PAPER_COLORS = [
  { name: "Cream", value: "oklch(0.96 0.01 85)" },
  { name: "White", value: "oklch(0.99 0 0)" },
  { name: "Mint", value: "oklch(0.96 0.02 160)" },
  { name: "Peach", value: "oklch(0.96 0.02 40)" },
  { name: "Blue", value: "oklch(0.96 0.02 240)" },
];

export default function InvoiceCreator() {
  // Helper functions for localStorage
  const saveToLocalStorage = (data: InvoiceData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  };

  const loadFromLocalStorage = (): InvoiceData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  };

  // Default values
  const defaultData: InvoiceData = {
    paperColor: PAPER_COLORS[0].value,
    signature: null,
    invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
    fromName: "",
    fromAddress: "",
    toName: "",
    toAddress: "",
    items: [{ id: "1", description: "", quantity: 1, price: 0 }],
    note: "",
  };

  // Initialize state with localStorage data or defaults
  const [paperColor, setPaperColor] = useState(defaultData.paperColor);
  const [signature, setSignature] = useState<string | null>(
    defaultData.signature
  );
  const [invoiceNumber, setInvoiceNumber] = useState(defaultData.invoiceNumber);
  const [date, setDate] = useState(defaultData.date);
  const [fromName, setFromName] = useState(defaultData.fromName);
  const [fromAddress, setFromAddress] = useState(defaultData.fromAddress);
  const [toName, setToName] = useState(defaultData.toName);
  const [toAddress, setToAddress] = useState(defaultData.toAddress);
  const [items, setItems] = useState<InvoiceItem[]>(defaultData.items);
  const [note, setNote] = useState(defaultData.note);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setPaperColor(savedData.paperColor);
      setSignature(savedData.signature);
      setInvoiceNumber(savedData.invoiceNumber);
      setDate(savedData.date);
      setFromName(savedData.fromName);
      setFromAddress(savedData.fromAddress);
      setToName(savedData.toName);
      setToAddress(savedData.toAddress);
      setItems(savedData.items);
      setNote(savedData.note || "");
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const currentData: InvoiceData = {
      paperColor,
      signature,
      invoiceNumber,
      date,
      fromName,
      fromAddress,
      toName,
      toAddress,
      items,
      note,
    };
    saveToLocalStorage(currentData);
  }, [
    paperColor,
    signature,
    invoiceNumber,
    date,
    fromName,
    fromAddress,
    toName,
    toAddress,
    items,
    note,
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Controls */}
      <Card className="p-6 no-print space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Invoice Creator</h1>

        <div className="space-y-2">
          <Label className="text-foreground">Paper Color</Label>
          <div className="flex gap-2 flex-wrap">
            {PAPER_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => setPaperColor(color.value)}
                className="px-4 py-2 rounded border-2 transition-all text-sm font-mono"
                style={{
                  backgroundColor: color.value,
                  borderColor:
                    paperColor === color.value
                      ? "oklch(0.25 0 0)"
                      : "oklch(0.85 0.01 85)",
                  color: "oklch(0.25 0 0)",
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handlePrint} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Print / Save as PDF
        </Button>
      </Card>

      {/* Invoice */}
      <div
        className="paper-texture shadow-2xl"
        style={{
          backgroundColor: paperColor,
          color: "oklch(0.2 0 0)",
        }}
      >
        <div className="p-12 space-y-8">
          {/* Header */}
          <div className="receipt-text space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-sm font-bold mb-2 uppercase tracking-wider">
                  From
                </h2>
                <Input
                  placeholder="Your Name / Business"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="mb-2 font-mono text-sm bg-transparent border-dashed"
                  style={{ color: "oklch(0.2 0 0)" }}
                />
                <Textarea
                  placeholder="Your Address"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="font-mono text-sm bg-transparent border-dashed resize-none"
                  rows={3}
                  style={{ color: "oklch(0.2 0 0)" }}
                />
              </div>

              <div className="flex-1 text-right">
                <h1 className="text-4xl font-bold mb-4 tracking-tight">
                  INVOICE
                </h1>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-end gap-2">
                    <span className="opacity-60">NO:</span>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-32 text-right font-mono text-sm bg-transparent border-dashed"
                      style={{ color: "oklch(0.2 0 0)" }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="opacity-60">DATE:</span>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="max-w-[140px] text-right font-mono text-sm bg-transparent border-dashed"
                      style={{ color: "oklch(0.2 0 0)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="receipt-divider my-6" />

            {/* Bill To */}
            <div>
              <h2 className="text-sm font-bold mb-2 uppercase tracking-wider">
                Bill To
              </h2>
              <Input
                placeholder="Client Name"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                className="mb-2 font-mono text-sm bg-transparent border-dashed"
                style={{ color: "oklch(0.2 0 0)" }}
              />
              <Textarea
                placeholder="Client Address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="font-mono text-sm bg-transparent border-dashed resize-none"
                rows={3}
                style={{ color: "oklch(0.2 0 0)" }}
              />
            </div>
          </div>

          <div className="receipt-divider my-6" />

          {/* Items */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider opacity-60 receipt-text">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-start group"
              >
                <div className="col-span-6">
                  <Textarea
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    className="font-mono text-sm bg-transparent border-dashed min-h-8 resize-none"
                    style={{ color: "oklch(0.2 0 0)" }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        Number.parseInt(e.target.value) || 1
                      )
                    }
                    className="font-mono text-sm text-center bg-transparent border-dashed"
                    style={{ color: "oklch(0.2 0 0)" }}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "price",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    className="font-mono text-sm text-right bg-transparent border-dashed"
                    style={{ color: "oklch(0.2 0 0)" }}
                  />
                </div>
                <div className="col-span-1 text-right font-mono text-sm font-bold">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="no-print opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="no-print mt-2 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="receipt-divider my-6" />

          {/* Total */}
          <div className="flex justify-end">
            <div className="space-y-2 min-w-[200px]">
              <div className="flex justify-between receipt-text text-sm">
                <span className="opacity-60">SUBTOTAL:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-divider my-2" />
              <div className="flex justify-between receipt-text text-lg">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Note Section */}
          {note && (
            <div className="mt-8 pt-6">
              <div className="receipt-divider mb-4" />
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
                  Note
                </h3>
                <div className="text-xs leading-relaxed opacity-80 whitespace-pre-wrap">
                  {note}
                </div>
              </div>
            </div>
          )}

          {/* Note Input (No Print) */}
          <div className="no-print mt-6">
            <Label
              htmlFor="note-input"
              className="text-xs font-medium opacity-60"
            >
              Add Note (Optional)
            </Label>
            <Textarea
              id="note-input"
              placeholder="Add any additional notes or terms here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 font-mono text-xs bg-transparent border-dashed min-h-20 resize-none"
              style={{ color: "oklch(0.2 0 0)" }}
            />
          </div>

          {/* Signature */}
          <div className="mt-12 pt-8">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                {signature ? (
                  <div className="space-y-2">
                    <img
                      src={signature || "/placeholder.svg"}
                      alt="Signature"
                      className="h-16 object-contain object-left"
                    />
                    <div className="border-t border-dashed w-48 pt-1">
                      <p className="text-xs receipt-text opacity-60">
                        Authorized Signature
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSignature(null)}
                      className="no-print text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="no-print">
                    <Label
                      htmlFor="signature-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded hover:bg-muted transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload Signature</span>
                    </Label>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
