'use client';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Shield, 
  Download, 
  Search 
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { fetchServiceRequests } from '@/redux/slices/customerRequestsSlice';
import { RootState, AppDispatch } from '@/redux/store';

type DocumentType = 'all' | 'certificate' | 'photo' | 'video' | 'document';

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  date?: string;
  jobReference?: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Customer {
  id: string;
  legal_company_name?: string;
  display_name?: string;
  email?: string;
}

const mockCustomers: Customer[] = [
  { id: "cust-1", legal_company_name: "TechSecure Solutions Pvt Ltd", display_name: "TechSecure" },
  { id: "cust-2", legal_company_name: "GreenWave Recycling", display_name: "GreenWave" },
  { id: "cust-3", legal_company_name: "DataWipe Services", display_name: "DataWipe" },
];

export default function CustomerDocuments() {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading } = useSelector((state: RootState) => state.customerRequests);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>("cust-1");
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DocumentType>('all');

  const isAdmin = true;

  useEffect(() => {
    dispatch(fetchServiceRequests());
  }, [dispatch]);

  // Convert service requests to documents
  const documents: Document[] = requests.flatMap((request: any) => {
    if (!request.attachments || request.attachments.length === 0) return [];
    
    return request.attachments.map((attachment: string, index: number) => {
      const fileName = attachment.split('/').pop() || `attachment-${index + 1}`;
      const fileExt = fileName.split('.').pop()?.toLowerCase();
      
      let type: DocumentType = 'document';
      let icon = FileText;
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
        type = 'photo';
        icon = ImageIcon;
      } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExt || '')) {
        type = 'video';
        icon = Video;
      } else if (request.certificateRequired) {
        type = 'certificate';
        icon = Shield;
      }
      
      return {
        id: `${request._id || request.id}-${index}`,
        type,
        name: fileName.replace(/^\d+_/, ''),
        date: request.createdAt,
        jobReference: request.requestNumber,
        url: attachment,
        icon
      };
    });
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const documentCounts = {
    all: documents.length,
    certificate: documents.filter(d => d.type === 'certificate').length,
    photo: documents.filter(d => d.type === 'photo').length,
    video: documents.filter(d => d.type === 'video').length,
    document: documents.filter(d => d.type === 'document').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-amber-900">Admin Preview Mode</p>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                Preview only
              </Badge>
            </div>
            <Select 
              value={selectedCustomerId || ''} 
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger className="w-full md:w-80 bg-white shadow-sm">
                <SelectValue placeholder="Select customer to preview" />
              </SelectTrigger>
              <SelectContent>
                {mockCustomers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.legal_company_name || customer.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-600 mt-1.5 text-lg">
            Certificates, job photos, videos & uploaded documents
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-8">
          {[
            { label: "All Documents", count: documentCounts.all, color: "" },
            { label: "Certificates",   count: documentCounts.certificate, color: "text-green-600" },
            { label: "Photos",         count: documentCounts.photo,       color: "text-blue-600" },
            { label: "Videos",         count: documentCounts.video,       color: "text-purple-600" },
            { label: "Documents",      count: documentCounts.document,    color: "text-amber-600" },
          ].map((item) => (
            <Card 
              key={item.label}
              className={`transition-all hover:shadow-md cursor-pointer border-2 ${
                filterType === (item.label === "All Documents" ? "all" : item.label.toLowerCase().replace("s", ""))
                  ? "border-blue-500 bg-blue-50/40"
                  : "border-transparent"
              }`}
              onClick={() => setFilterType(
                item.label === "All Documents" ? "all" 
                : item.label.toLowerCase().replace("s", "") as DocumentType
              )}
            >
              <CardContent className="p-5 text-center">
                <div className="text-sm text-slate-600 font-medium">{item.label}</div>
                <div className={`text-3xl font-bold mt-1.5 ${item.color}`}>
                  {item.count}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8 shadow-sm">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search certificates, photos, videos..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">Loading documents...</div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mt-2">
                {searchTerm ? "No matching documents" : "No documents yet"}
              </h3>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? "Try adjusting your search or filter" 
                  : "Certificates and media will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => {
              const Icon = doc.icon;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border border-slate-200 overflow-hidden">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate text-base leading-tight">
                            {doc.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1.5">
                            {doc.date ? format(new Date(doc.date), 'MMM d, yyyy') : 'Date not available'}
                          </p>
                          {doc.jobReference && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Job: {doc.jobReference}
                            </p>
                          )}
                          <Badge 
                            variant="secondary" 
                            className="mt-3 capitalize text-xs"
                          >
                            {doc.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100">
                        {doc.type === 'certificate' ? (
                          <div className="flex gap-4 text-sm">
                            <button className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium">
                              <Download className="h-3.5 w-3.5" />
                              Certificate
                            </button>
                            <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                              <Download className="h-3.5 w-3.5" />
                              Affidavit
                            </button>
                          </div>
                        ) : doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}