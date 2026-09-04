import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import type { Project, User } from '../types';

interface PdfInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  client?: User | null;
  invoiceData?: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    items: Array<{ description: string; qty: number; rate: number; amount: number }>;
    taxRate: number;
    discount: number;
    status: 'PAID' | 'PENDING' | 'PARTIAL';
    notes?: string;
  };
}

export const PdfInvoiceModal: React.FC<PdfInvoiceModalProps> = ({
  isOpen,
  onClose,
  project,
  client,
  invoiceData
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const defaultInvoiceNumber = invoiceData?.invoiceNumber || `INV-ZNT-${Math.floor(100000 + Math.random() * 900000)}`;
  const defaultDate = invoiceData?.date || new Date().toISOString().split('T')[0];
  const defaultDueDate = invoiceData?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const clientName = client?.name || project?.clientName || 'Valued Enterprise Partner';
  const clientEmail = client?.email || project?.clientEmail || 'client@enterprise.com';
  const clientCompany = client?.companyName || 'Corporate Client Inc.';

  const items = invoiceData?.items || [
    {
      description: project ? `${project.title} - Full Stack Architecture & AI Integration` : 'Enterprise AI Web Platform & Client Portal Development',
      qty: 1,
      rate: project?.budget || 150000,
      amount: project?.budget || 150000
    },
    {
      description: '24/7 Support Agent & Telegram Notification Engine Integration',
      qty: 1,
      rate: 25000,
      amount: 25000
    },
    {
      description: 'Dynamic SEO Engine Setup (Sitemap, Robots.txt, Google Schema)',
      qty: 1,
      rate: 15000,
      amount: 15000
    }
  ];

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const taxRate = invoiceData?.taxRate ?? 18; // 18% GST
  const taxAmount = (subtotal * taxRate) / 100;
  const discount = invoiceData?.discount || 0;
  const grandTotal = subtotal + taxAmount - discount;
  const status = invoiceData?.status || (project?.status === 'completed' || project?.status === 'delivered' ? 'PAID' : 'PENDING');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 my-8 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 print:p-6">
        
        {/* Modal Actions (Hidden when printing) */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Official Zentrio AI Tax Invoice & Proposal</h3>
              <p className="text-xs text-slate-500">Enterprise Verified Billing Document</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div ref={printRef} className="pt-6 space-y-8 print:pt-0">
          
          {/* Document Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <img src="/LOGOO.png" alt="Zentrio Logo" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">ZENTRIO AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Next-Gen Enterprise AI Platforms & Custom Software Architecture<br />
                Coimbatore / Chennai, Tamil Nadu, India<br />
                Email: billing@zentrio.ai | Web: https://zentrio.ai
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">TAX INVOICE</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{defaultInvoiceNumber}</div>
              <div className="text-xs text-slate-500">Issued Date: <strong>{defaultDate}</strong></div>
              <div className="text-xs text-slate-500">Due Date: <strong>{defaultDueDate}</strong></div>
              <div className="pt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                  status === 'PAID'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Billing Info Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Billed To</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{clientName}</div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{clientCompany}</div>
              <div className="text-xs text-slate-500">{clientEmail}</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Provider Details</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">Zentrio AI Technologies</div>
              <div className="text-xs text-slate-500">GSTIN: 33AAAAA0000A1Z5 (Registered Tech Agency)</div>
              <div className="text-xs text-slate-500">Payment Terms: Net 14 Days</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-2">Service Description</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-2 text-right">Rate</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                    <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-500">{item.qty}</td>
                    <td className="py-3.5 px-2 text-right text-slate-500">₹{item.rate.toLocaleString()}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                      ₹{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-500">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>GST ({taxRate}%):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{taxAmount.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Loyalty Discount:</span>
                  <span className="font-bold">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-slate-900 dark:border-white text-base font-black text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Digital Verification Seal & Terms */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Verified by Zentrio AI Finance Engine</span>
              </div>
              <p className="text-[10px] text-slate-400">This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              Thank you for trusting Zentrio AI Platforms!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
