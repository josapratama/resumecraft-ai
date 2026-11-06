import React, { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { FullCVData } from "@/types/cv";
import {
  CoverLetterData,
  CoverLetterTemplateId,
  COVER_LETTER_TEMPLATES,
} from "./types";
import { COVER_LETTER_TEMPLATE_COMPONENTS } from "./templates";
import { exportCoverLetterToPDF } from "./exportCoverLetterPDF";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  Printer,
  X,
  Palette,
  Layout,
  Edit3,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface CoverLetterWorkspaceProps {
  cvId: number;
  cvData?: FullCVData;
  defaultRole?: string;
  onClose: () => void;
}

const ACCENT_COLORS = [
  { name: "Navy Blue", value: "#1e3a8a" },
  { name: "Royal Blue", value: "#2563eb" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Emerald Green", value: "#059669" },
  { name: "Rose Crimson", value: "#e11d48" },
  { name: "Purple Creative", value: "#7c3aed" },
  { name: "Amber Orange", value: "#d97706" },
  { name: "Slate Charcoal", value: "#0f172a" },
];

export default function CoverLetterWorkspace({
  cvId,
  cvData,
  defaultRole = "",
  onClose,
}: CoverLetterWorkspaceProps) {
  // Prevent background window / body scrollbars from leaking through
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.paddingRight = origPaddingRight;
    };
  }, []);

  // Active Tab: 'templates' | 'ai' | 'edit' | 'style'
  const [activeTab, setActiveTab] = useState<"templates" | "ai" | "edit" | "style">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateId>("formal-bumn");
  const [templateCategory, setTemplateCategory] = useState<string>("Semua");
  const [templateSearch, setTemplateSearch] = useState<string>("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [copied, setCopied] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);

  // AI input states
  const [companyName, setCompanyName] = useState("PT Telkom Indonesia (Persero) Tbk");
  const [targetJob, setTargetJob] = useState(defaultRole || cvData?.cv.targetRole || "Full-Stack Software Engineer");
  const [recipientName, setRecipientName] = useState("Pimpinan / Tim Rekrutmen");
  const [recipientTitle, setRecipientTitle] = useState("HRD Manager");
  const [companyAddress, setCompanyAddress] = useState("Jl. Japati No. 1, Bandung, Jawa Barat");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "confident" | "enthusiastic" | "concise">("professional");

  // Cover Letter Data State
  const initialName = cvData?.personalInfo?.fullName || "Josa Pratama";
  const initialEmail = cvData?.personalInfo?.email || "pratamajosa1234@gmail.com";
  const initialPhone = cvData?.personalInfo?.phone || "+6281291561139";
  const initialLocation = cvData?.personalInfo?.location || "Kota Prabumulih, Sumatera Selatan";
  const initialPortfolio = cvData?.projects?.[0]?.link || "https://josapratama.com";

  const [letterData, setLetterData] = useState<CoverLetterData>({
    fullName: initialName,
    email: initialEmail,
    phone: initialPhone,
    location: initialLocation,
    photoUrl: cvData?.personalInfo?.photoUrl || null,
    targetRole: targetJob,
    portfolioUrl: initialPortfolio,

    recipientName: "Pimpinan / Tim Rekrutmen",
    recipientTitle: "HRD Manager",
    companyName: "PT Telkom Indonesia (Persero) Tbk",
    companyAddress: "Jl. Japati No. 1, Bandung, Jawa Barat",
    jobTitle: targetJob,
    jobSource: "LinkedIn",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    city: "Prabumulih",

    subject: `Lamaran Pekerjaan – ${targetJob}`,
    referenceNumber: "LP/2026/XI/01",
    salutation: "Dengan hormat,",
    opening: `Berdasarkan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${targetJob} di PT Telkom Indonesia (Persero) Tbk, melalui surat ini saya bermaksud mengajukan permohonan diri untuk dapat bergabung dan berkontribusi sebagai tenaga profesional pada instansi/perusahaan yang Bapak/Ibu pimpin.`,
    body: `Saya memiliki dedikasi tinggi, kemampuan analisis pemecahan masalah yang baik, serta pengalaman relevan dalam perancangan arsitektur backend, modern web development, dan implementasi otomasi server. Saya terbiasa bekerja secara mandiri maupun berkolaborasi dalam tim dengan kedisiplinan kerja yang tinggi sesuai dengan nilai-nilai profesionalisme.`,
    skillsHighlight: [
      "Pengembangan aplikasi web modern responsif dengan TypeScript & modern frameworks",
      "Perancangan arsitektur backend andal, optimasi database, dan deployment cloud",
      "Kemampuan problem-solving terstruktur dan adaptasi cepat pada ekosistem baru",
    ],
    attachments: [
      "Curriculum Vitae (CV) Terbaru",
      "Salinan Portofolio dan Bukti Hasil Karya",
      "Salinan Ijazah dan Transkrip Nilai Terlegalisir",
      "Salinan Sertifikat Keahlian / Kompetensi",
      "Pas Foto Berwarna Terbaru",
    ],
    closing: `Demikian surat lamaran pekerjaan ini saya sampaikan. Besar harapan saya untuk diberikan kesempatan menghadiri tahapan wawancara agar dapat menjelaskan lebih mendalam mengenai kompetensi dan komitmen kerja yang saya miliki. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.`,
    signOff: "Hormat saya,",

    educationDegree: cvData?.educations?.[0]?.degree || "S1 Informatika",
    educationSchool: cvData?.educations?.[0]?.school || "Universitas Prabumulih",

    accentColor: cvData?.cv.accentColor || "#1e3a8a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    includeSignature: true,
  });

  // Load saved draft if exists in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cover_letter_draft_${cvId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.letterData) setLetterData(prev => ({ ...prev, ...parsed.letterData }));
      }
    } catch {
      // ignore
    }
  }, [cvId]);

  // Auto-save draft
  useEffect(() => {
    try {
      localStorage.setItem(
        `cover_letter_draft_${cvId}`,
        JSON.stringify({ selectedTemplate, letterData })
      );
    } catch {
      // ignore
    }
  }, [cvId, selectedTemplate, letterData]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return COVER_LETTER_TEMPLATES.filter(tpl => {
      const matchesCategory =
        templateCategory === "Semua" || tpl.category === templateCategory;
      const matchesSearch =
        templateSearch === "" ||
        tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.badge.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.recommendedFor.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templateCategory, templateSearch]);

  // AI Generation Mutation
  const generateMutation = trpc.cvAI.generateCoverLetter.useMutation({
    onSuccess: data => {
      setLetterData(prev => ({
        ...prev,
        companyName: companyName.trim(),
        jobTitle: targetJob.trim(),
        recipientName: recipientName.trim(),
        recipientTitle: recipientTitle.trim(),
        companyAddress: companyAddress.trim(),
        subject: data.subject || prev.subject,
        salutation: data.salutation || prev.salutation,
        opening: data.opening || prev.opening,
        body: data.body || prev.body,
        skillsHighlight:
          data.skillsHighlight && data.skillsHighlight.length > 0
            ? data.skillsHighlight
            : prev.skillsHighlight,
        attachments:
          data.attachments && data.attachments.length > 0
            ? data.attachments
            : prev.attachments,
        closing: data.closing || prev.closing,
        signOff: data.signOff || prev.signOff,
        fullLetterText:
          typeof data.coverLetter === "string" ? data.coverLetter : prev.fullLetterText,
      }));
      toast.success("Surat lamaran kerja berhasil dibuat dengan AI!");
      setActiveTab("edit");
    },
    onError: err => {
      toast.error(`Gagal membuat surat: ${err.message}`);
    },
  });

  const handleGenerateAI = () => {
    if (!companyName.trim() || !targetJob.trim()) {
      toast.error("Mohon isi Nama Perusahaan dan Posisi yang Dilamar.");
      return;
    }
    generateMutation.mutate({
      cvId,
      companyName: companyName.trim(),
      jobTitle: targetJob.trim(),
      recipientName: recipientName.trim() || undefined,
      recipientTitle: recipientTitle.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
      tone,
      language,
      templateStyle: selectedTemplate,
    });
  };

  const handleCopyText = () => {
    const text =
      letterData.fullLetterText ||
      `Perihal: ${letterData.subject}
Kepada Yth. ${letterData.recipientTitle || "HRD"} ${letterData.companyName}

${letterData.salutation}

${letterData.opening}

${letterData.body}

${letterData.closing}

${letterData.signOff}
${letterData.fullName}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Teks surat lamaran berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(letterData.subject);
    setCopiedSubject(true);
    toast.success("Subjek email disalin!");
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleExportPDF = async () => {
    try {
      await exportCoverLetterToPDF(
        "cover-letter-preview-root",
        `Surat_Lamaran_${letterData.fullName.replace(/\s+/g, "_")}_${letterData.companyName.replace(/\s+/g, "_")}.pdf`
      );
      toast.info("Jendela cetak dibuka. Pilih 'Save as PDF' untuk menyimpan file PDF.");
    } catch (err: any) {
      toast.error(err.message || "Gagal mencetak dokumen");
    }
  };

  // Render the selected template component
  const ActiveTemplateComponent =
    COVER_LETTER_TEMPLATE_COMPONENTS[selectedTemplate] ||
    COVER_LETTER_TEMPLATE_COMPONENTS["formal-bumn"];

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-slate-900/80 backdrop-blur-sm flex flex-col select-none animate-in fade-in duration-200">
      <style>{`
        .custom-cl-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-cl-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-cl-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-cl-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Surat Lamaran Kerja & Cover Letter</span>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                25 Format Standar
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {COVER_LETTER_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setLanguage("id")}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                language === "id"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              ID (Baku)
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded-md font-semibold transition-all ${
                language === "en"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              EN (Global)
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="text-xs gap-1.5 h-8 border-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? "Tersalin!" : "Salin Teks"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportPDF}
            className="text-xs gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Unduh PDF A4</span>
          </Button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 ml-1 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout - strictly 100% height without leaking scrollbars */}
      <div className="flex-1 min-h-0 w-full flex flex-col md:flex-row overflow-hidden bg-slate-100">
        {/* Left Control Panel */}
        <aside className="w-full md:w-[420px] lg:w-[460px] h-full flex flex-col shrink-0 min-h-0 bg-white border-r border-slate-200 overflow-hidden shadow-sm">
          {/* Workspace Tabs */}
          <div className="flex border-b border-slate-200 px-3 pt-2 bg-slate-50/60 shrink-0 gap-1 text-xs">
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
                activeTab === "templates"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Format (25)</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
                activeTab === "ai"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Generator</span>
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
                activeTab === "edit"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sunting Isi</span>
            </button>

            <button
              onClick={() => setActiveTab("style")}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-semibold transition-all ${
                activeTab === "style"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Desain</span>
            </button>
          </div>

          {/* Panel Content (Scrollable with isolated scrollbar) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800 text-xs custom-cl-scrollbar">
            {/* TAB 1: 25 TEMPLATES SELECTOR WITH CATEGORIES & SEARCH */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Pilih Format Surat Lamaran</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tersedia 25 format baku profesional sesuai industri, instansi, dan tingkat pengalaman Anda.
                  </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Cari format (BUMN, Medis, Tech, Legal, dll)..."
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      className="pl-8 text-xs border-slate-200 h-8 rounded-lg"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {["Semua", "Resmi / Nasional", "Tech & Startup", "Industri Spesifik", "Internasional"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setTemplateCategory(cat)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          templateCategory === cat
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template List */}
                <div className="space-y-2 pt-1">
                  {filteredTemplates.map(tpl => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600/30"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-xs">
                            {tpl.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                          {tpl.description}
                        </p>
                        <p className="text-[10px] text-blue-700 font-medium mt-1.5">
                          Cocok untuk: {tpl.recommendedFor}
                        </p>
                      </div>
                    );
                  })}
                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      Tidak ditemukan template yang cocok dengan pencarian.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: AI GENERATOR */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Career Matchmaker</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 mt-1 leading-relaxed">
                    AI akan membaca pengalaman & keahlian dari CV Anda untuk menulis surat lamaran yang sangat persuasif dan relevan dengan lowongan target.
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Perusahaan yang Dituju *</Label>
                  <Input
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Bank Central Asia, Tokopedia, Google"
                    className="mt-1 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Posisi / Role yang Dilamar *</Label>
                  <Input
                    value={targetJob}
                    onChange={e => setTargetJob(e.target.value)}
                    placeholder="Contoh: Full-Stack Developer, Data Analyst"
                    className="mt-1 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Nama Penerima</Label>
                    <Input
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="Bapak/Ibu HRD"
                      className="mt-1 border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Jabatan Penerima</Label>
                    <Input
                      value={recipientTitle}
                      onChange={e => setRecipientTitle(e.target.value)}
                      placeholder="HR Manager / Lead"
                      className="mt-1 border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Alamat Perusahaan (Opsional)</Label>
                  <Input
                    value={companyAddress}
                    onChange={e => setCompanyAddress(e.target.value)}
                    placeholder="Gedung / Kota Perusahaan"
                    className="mt-1 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Nada Bahasa (Tone of Voice)</Label>
                  <Select value={tone} onValueChange={(val: any) => setTone(val)}>
                    <SelectTrigger className="mt-1 border-slate-200 rounded-lg text-xs">
                      <SelectValue placeholder="Pilih nada" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="professional" className="text-xs">Formal & Profesional (Standar HRD)</SelectItem>
                      <SelectItem value="confident" className="text-xs">Percaya Diri & Berorientasi Metrik</SelectItem>
                      <SelectItem value="enthusiastic" className="text-xs">Antusias & Berenergi Tinggi</SelectItem>
                      <SelectItem value="concise" className="text-xs">Ringkas & To the Point (&lt; 200 kata)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">
                    Syarat Lowongan / Job Description (Opsional)
                  </Label>
                  <Textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Tempelkan persyaratan pekerjaan dari LinkedIn / Jobstreet agar surat lebih spesifik..."
                    rows={4}
                    className="mt-1 border-slate-200 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <Button
                  onClick={handleGenerateAI}
                  disabled={generateMutation.isPending}
                  className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Spinner className="w-4 h-4" />
                      <span>Meracik Surat Lamaran...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Surat dengan AI</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* TAB 3: DIRECT EDIT */}
            {activeTab === "edit" && (
              <div className="space-y-3.5">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Sunting Teks Surat</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ubah langsung kalimat surat atau sesuaikan detail penerima.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-xs font-semibold text-slate-700">Subjek Surat / Email</Label>
                    <button
                      onClick={handleCopySubject}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      {copiedSubject ? "Tersalin!" : "Salin Subjek"}
                    </button>
                  </div>
                  <Input
                    value={letterData.subject}
                    onChange={e => setLetterData({ ...letterData, subject: e.target.value })}
                    className="border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Perusahaan Tujuan</Label>
                    <Input
                      value={letterData.companyName}
                      onChange={e => setLetterData({ ...letterData, companyName: e.target.value })}
                      className="mt-1 border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Kota Surat</Label>
                    <Input
                      value={letterData.city}
                      onChange={e => setLetterData({ ...letterData, city: e.target.value })}
                      className="mt-1 border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Salam Pembuka</Label>
                  <Input
                    value={letterData.salutation}
                    onChange={e => setLetterData({ ...letterData, salutation: e.target.value })}
                    className="mt-1 border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Paragraf Pembuka</Label>
                  <Textarea
                    value={letterData.opening}
                    onChange={e => setLetterData({ ...letterData, opening: e.target.value })}
                    rows={3}
                    className="mt-1 border-slate-200 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Paragraf Inti / Kualifikasi</Label>
                  <Textarea
                    value={letterData.body}
                    onChange={e => setLetterData({ ...letterData, body: e.target.value })}
                    rows={4}
                    className="mt-1 border-slate-200 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Paragraf Penutup</Label>
                  <Textarea
                    value={letterData.closing}
                    onChange={e => setLetterData({ ...letterData, closing: e.target.value })}
                    rows={3}
                    className="mt-1 border-slate-200 rounded-lg text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Salam Penutup</Label>
                  <Input
                    value={letterData.signOff}
                    onChange={e => setLetterData({ ...letterData, signOff: e.target.value })}
                    className="mt-1 border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: STYLE & DESIGN */}
            {activeTab === "style" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Kustomisasi Desain</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Sesuaikan warna aksen, tipografi font, dan tanda tangan dokumen.
                  </p>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-2 block">Warna Aksen</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {ACCENT_COLORS.map(c => {
                      const isSelected = letterData.accentColor === c.value;
                      return (
                        <button
                          key={c.value}
                          onClick={() => setLetterData({ ...letterData, accentColor: c.value })}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-xs"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">Keluarga Font (Tipografi)</Label>
                  <Select
                    value={letterData.fontFamily}
                    onValueChange={val => setLetterData({ ...letterData, fontFamily: val })}
                  >
                    <SelectTrigger className="border-slate-200 rounded-lg text-xs">
                      <SelectValue placeholder="Pilih font" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" className="text-xs">
                        Modern Sans (Inter / Segoe UI / Roboto)
                      </SelectItem>
                      <SelectItem value="Georgia, Cambria, serif" className="text-xs">
                        Classic Serif (Georgia / Cambria)
                      </SelectItem>
                      <SelectItem value="'Times New Roman', Times, serif" className="text-xs">
                        Formal Times New Roman (Standar Internasional)
                      </SelectItem>
                      <SelectItem value="'Palatino Linotype', Palatino, serif" className="text-xs">
                        Executive Palatino (Elegan)
                      </SelectItem>
                      <SelectItem value="Consolas, 'Roboto Mono', Monaco, monospace" className="text-xs">
                        Code Monospace (Terminal Developer)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">Tanda Tangan Digital</p>
                    <p className="text-[11px] text-slate-500">Tampilkan tulisan tanda tangan di atas nama</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={letterData.includeSignature}
                    onChange={e => setLetterData({ ...letterData, includeSignature: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Live Preview Workspace - single clean scrollbar only */}
        <main className="flex-1 min-h-0 h-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center custom-cl-scrollbar">
          {/* Zoom & Scaling Controls */}
          <div className="w-full max-w-[820px] mb-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pratinjau Kertas A4 (Live Preview)</span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-semibold text-[11px] text-slate-700 min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(110, zoomLevel + 10))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(85)}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 ml-0.5"
                title="Reset Ukuran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled A4 Sheet Container */}
          <div
            className="transition-all duration-200 ease-out origin-top flex justify-center w-full pb-16"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              marginBottom: `${(zoomLevel - 100) * 8}px`,
            }}
          >
            <div
              id="cover-letter-preview-root"
              className="w-full max-w-[794px] min-h-[1123px] bg-white rounded-md shadow-xl border border-slate-200/80 overflow-hidden relative"
            >
              <ActiveTemplateComponent data={letterData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
