import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Globe,
  FileText,
  ExternalLink,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export default function ImportResumeModal({
  isOpen,
  onClose,
  initialUrl,
}: ImportResumeModalProps) {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"file" | "url" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [targetUrl, setTargetUrl] = useState(
    initialUrl || "https://irma-iryani.josapratama.com/"
  );
  const [rawText, setRawText] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  // Auto-detect ?import= in URL query params on modal open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const importParam = params.get("import");
      if (importParam) {
        setTargetUrl(importParam);
        setActiveTab("url");
      }
    }
  }, [isOpen]);

  const parseDocMutation = trpc.cvAI.parseResumeDocument.useMutation({
    onSuccess: data => {
      setParsedResult(data);
      setCvTitle(data.suggestedTitle || t("import_modal.doc_cv_title", "CV dari Dokumen"));
      toast.success(t("import_modal.doc_parsed_toast", "Dokumen PDF berhasil di-parse oleh AI!"));
    },
    onError: err => {
      toast.error(`${t("import_modal.doc_error_toast", "Gagal memproses dokumen:")} ${err.message}`);
    },
  });

  const parseTextMutation = trpc.cvAI.parseResumeText.useMutation({
    onSuccess: data => {
      setParsedResult(data);
      setCvTitle(data.suggestedTitle || t("import_modal.pro_cv_title", "CV Profesional"));
      toast.success(t("import_modal.text_parsed_toast", "Resume berhasil di-parse oleh AI!"));
    },
    onError: err => {
      toast.error(`${t("import_modal.text_error_toast", "Gagal memproses resume:")} ${err.message}`);
    },
  });

  const parseUrlMutation = trpc.cvAI.parseFromUrl.useMutation({
    onSuccess: data => {
      setParsedResult(data);
      setCvTitle(data.suggestedTitle || t("import_modal.url_cv_title", "CV dari Portfolio Web"));
      toast.success(t("import_modal.url_parsed_toast", "Data dari portfolio / link berhasil diambil!"));
    },
    onError: err => {
      toast.error(`${t("import_modal.url_error_toast", "Gagal memuat URL:")} ${err.message}`);
    },
  });

  const createMutation = trpc.cvAI.createFromParsed.useMutation({
    onSuccess: newCV => {
      utils.cv.list.invalidate();
      toast.success(t("import_modal.cv_created_toast", "CV baru berhasil dibuat!"));
      onClose();
      // Clean query params if any
      if (typeof window !== "undefined" && window.location.search.includes("import=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      navigate(`/cv/${newCV.id}`);
    },
    onError: err => {
      toast.error(`${t("import_modal.create_error_toast", "Gagal membuat CV:")} ${err.message}`);
    },
  });

  const isParsing =
    parseUrlMutation.isPending ||
    parseTextMutation.isPending ||
    parseDocMutation.isPending;

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // If file is .json, check if standard JSON Resume or ResumeCraft backup
    if (file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed.basics || parsed.work || parsed.skills) {
            // Convert standard JSON Resume schema
            const converted = {
              personalInfo: {
                fullName: parsed.basics?.name || "",
                email: parsed.basics?.email || "",
                phone: parsed.basics?.phone || "",
                location: parsed.basics?.location?.address || parsed.basics?.location?.city || "",
                professionalSummary: parsed.basics?.summary || "",
                photoUrl: parsed.basics?.image || "",
              },
              targetRole: parsed.basics?.label || "",
              portfolioUrl: parsed.basics?.url || "",
              workExperiences: (parsed.work || []).map((w: any) => ({
                jobTitle: w.position || "",
                company: w.name || "",
                startDate: w.startDate || "",
                endDate: w.endDate === "Present" ? "" : (w.endDate || ""),
                isCurrent: w.endDate === "Present",
                description: w.summary || (w.highlights || []).join("\n"),
              })),
              educations: (parsed.education || []).map((e: any) => ({
                school: e.institution || "",
                degree: e.studyType || "",
                field: e.area || "",
                graduationDate: e.endDate || "",
                gpa: e.score || "",
              })),
              skills: (parsed.skills || []).flatMap((s: any) => {
                if (s.keywords && s.keywords.length > 0) {
                  return s.keywords.map((kw: string) => ({
                    skillName: kw,
                    category: s.name || "Technical & Core Skills",
                    proficiency: "intermediate",
                  }));
                }
                return [{ skillName: s.name, category: "Technical & Core Skills", proficiency: "intermediate" }];
              }),
              projects: (parsed.projects || []).map((pr: any) => ({
                projectName: pr.name || "",
                description: pr.description || "",
                link: pr.url || "",
                technologies: (pr.keywords || []).join(", "),
              })),
              certifications: (parsed.certificates || []).map((c: any) => ({
                name: c.name || "",
                issuer: c.issuer || "",
                issueDate: c.date || "",
                credentialUrl: c.url || "",
              })),
              languages: (parsed.languages || []).map((l: any) => ({
                language: l.language || "",
                proficiency: l.fluency || "intermediate",
              })),
              customSections: (parsed.awards || []).map((aw: any) => ({
                title: aw.title || "",
                subtitle: aw.awarder || "",
                date: aw.date || "",
                description: aw.summary || "",
                category: "Awards & Honors",
              })),
            };
            setParsedResult(converted);
            setCvTitle(converted.personalInfo.fullName ? `CV ${converted.personalInfo.fullName}` : "CV dari JSON Resume");
            toast.success("Standar JSON Resume berhasil dibaca dan siap disimpan!");
            return;
          } else if (parsed.cv && parsed.personalInfo) {
            // ResumeCraft backup format
            setParsedResult(parsed);
            setCvTitle(parsed.cv?.title || "CV dari Backup");
            toast.success("File cadangan resume berhasil dibaca!");
            return;
          }
        } catch (e) {
          // not json, continue
        }
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleParseDoc = () => {
    if (!fileBase64 || !selectedFile) {
      toast.error("Silakan pilih berkas PDF resume terlebih dahulu.");
      return;
    }
    parseDocMutation.mutate({
      fileBase64,
      fileName: selectedFile.name,
    });
  };

  const handleParseUrl = () => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      toast.error("Silakan masukkan URL portfolio atau profil web.");
      return;
    }
    parseUrlMutation.mutate({ url: trimmed });
  };

  const handleParseText = () => {
    if (!rawText.trim() || rawText.trim().length < 30) {
      toast.error("Silakan tempel teks resume yang cukup (minimal 30 karakter).");
      return;
    }
    parseTextMutation.mutate({ rawText: rawText.trim() });
  };

  const handleSave = () => {
    if (!parsedResult) return;
    createMutation.mutate({
      title: cvTitle.trim() || "CV Baru",
      template: "modern",
      parsedData: parsedResult,
    });
  };

  const handleModalClose = () => {
    setParsedResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleModalClose()}>
      <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t("import_modal.modal_title", "AI Resume / CV Importer Otomatis")}
          </DialogTitle>
        </DialogHeader>

        {!parsedResult ? (
          <div className="space-y-4 pt-1">
            <Tabs
              value={activeTab}
              onValueChange={v => setActiveTab(v as "file" | "url" | "text")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full mb-3">
                <TabsTrigger value="file" className="flex items-center gap-1.5 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  {t("import_modal.tab_pdf", "Unggah PDF / Dokumen")}
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  {t("import_modal.tab_url", "Link Portfolio Web")}
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  {t("import_modal.tab_text", "Tempel Teks")}
                </TabsTrigger>
              </TabsList>

              {/* TAB 0: UNGGAH DOKUMEN PDF */}
              <TabsContent value="file" className="space-y-4">
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-blue-950">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    {t("import_modal.pdf_box_title", "Punya CV Lama dalam Format PDF?")}
                  </p>
                  <p className="text-gray-600">
                    {t("import_modal.pdf_box_desc", "Unggah dokumen resume PDF Anda. AI otomatis mengekstrak informasi biodata, pengalaman kerja, pendidikan, dan keahlian tanpa perlu salin-tempel manual.")}
                  </p>
                </div>

                <div className="border-2 border-dashed border-neutral-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-neutral-50/60 hover:bg-indigo-50/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.json"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                    <Upload className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {t("import_modal.replace_file_hint", "Klik untuk mengganti berkas")}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">
                        {t("import_modal.dropzone_text", "Klik atau seret file PDF / JSON Resume ke area ini")}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {t("import_modal.dropzone_formats", "Mendukung PDF, DOCX, TXT, atau JSON Resume (maks 10 MB)")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleParseDoc}
                    disabled={isParsing || !selectedFile}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-xs"
                  >
                    {parseDocMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 text-white" />
                        <span>{t("import_modal.extracting_doc", "Mengekstrak Dokumen dengan AI...")}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t("import_modal.extract_btn", "Ekstrak Data Resume")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 1: IMPORT DARI LINK */}
              <TabsContent value="url" className="space-y-4">
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-indigo-950">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    {t("import_modal.url_box_title", "Cukup Masukkan Link, CV Langsung Jadi")}
                  </p>
                  <p className="text-gray-600">
                    {t("import_modal.url_box_desc", "Masukkan URL portfolio atau profil web. Sistem akan otomatis membaca profil, pendidikan, pengalaman kerja, keahlian, dan sertifikasi.")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="font-semibold text-gray-800">
                    {t("import_modal.url_label", "URL Portfolio / Website Profil")}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://irma-iryani.josapratama.com/"
                        value={targetUrl}
                        onChange={e => setTargetUrl(e.target.value)}
                        className="pl-9 font-mono text-sm"
                        disabled={isParsing}
                      />
                    </div>
                  </div>

                  {/* Preset quick chip */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs text-gray-500 font-medium">{t("import_modal.quick_example", "Contoh cepat:")}</span>
                    <button
                      type="button"
                      onClick={() => setTargetUrl("https://irma-iryani.josapratama.com/")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      ⚡ Portfolio Irma Iryani
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={handleModalClose} disabled={isParsing}>
                    {t("actions.cancel", "Batal")}
                  </Button>
                  <Button
                    onClick={handleParseUrl}
                    disabled={isParsing}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    {parseUrlMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4" /> {t("import_modal.fetching_data", "Mengambil & Membaca Data...")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> {t("import_modal.fetch_btn", "Ambil Data & Buat CV")}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: TEMPEL TEKS MANUAL */}
              <TabsContent value="text" className="space-y-4">
                <p className="text-xs text-gray-600">
                  {t("import_modal.text_box_desc", "Tempelkan draf teks CV, ringkasan LinkedIn, atau salinan isi PDF resume Anda. AI akan mengorganisasi ke dalam form bidang terstruktur.")}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="rawResume" className="font-semibold text-gray-800">
                    {t("import_modal.raw_text_label", "Teks Resume / CV")}
                  </Label>
                  <Textarea
                    id="rawResume"
                    placeholder={t("import_modal.raw_text_ph", "Salin dan tempel isi teks resume, pengalaman kerja, pendidikan, dsb...")}
                    rows={10}
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="font-mono text-xs"
                    disabled={isParsing}
                  />
                  <div className="text-[11px] text-gray-400 text-right">
                    {rawText.length} {t("import_modal.chars_min", "karakter (minimal 30)")}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={handleModalClose} disabled={isParsing}>
                    {t("actions.cancel", "Batal")}
                  </Button>
                  <Button
                    onClick={handleParseText}
                    disabled={isParsing}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {parseTextMutation.isPending ? (
                      <>
                        <Spinner className="w-4 h-4" /> {t("import_modal.processing_ai", "Memproses dengan AI...")}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> {t("import_modal.parse_text_btn", "Parse & Ekstrak CV")}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* RESULT PREVIEW & CONFIRMATION */
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="cvTitle" className="font-semibold text-gray-900">
                {t("import_modal.new_title_label", "Judul CV Baru")}
              </Label>
              <Input
                id="cvTitle"
                value={cvTitle}
                onChange={e => setCvTitle(e.target.value)}
                placeholder={t("import_modal.new_title_ph", "Contoh: CV Irma Iryani - S1 Pendidikan Kimia")}
              />
            </div>

            <div className="p-4 border rounded-xl bg-slate-50/80 space-y-3.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> {t("import_modal.success_banner", "Data Berhasil Diekstrak & Siap Digunakan")}
              </div>

              {parsedResult.personalInfo && (
                <div className="p-3 bg-white border rounded-lg space-y-1 shadow-sm">
                  <p className="font-bold text-gray-900 text-sm">
                    {parsedResult.personalInfo.fullName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600 text-xs">
                    {parsedResult.personalInfo.email && (
                      <span>✉️ {parsedResult.personalInfo.email}</span>
                    )}
                    {parsedResult.personalInfo.phone && (
                      <span>📞 {parsedResult.personalInfo.phone}</span>
                    )}
                    {parsedResult.personalInfo.location && (
                      <span>📍 {parsedResult.personalInfo.location}</span>
                    )}
                  </div>
                  {parsedResult.personalInfo.professionalSummary && (
                    <p className="text-gray-700 italic pt-1 border-t mt-2 text-xs leading-relaxed line-clamp-3">
                      &ldquo;{parsedResult.personalInfo.professionalSummary}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Experiences */}
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    {t("tabs.experience", "Pengalaman")} ({parsedResult.workExperiences?.length ?? 0})
                  </div>
                  {parsedResult.workExperiences?.length > 0 ? (
                    <ul className="space-y-1.5 text-gray-600">
                      {parsedResult.workExperiences.slice(0, 3).map((e: any, i: number) => (
                        <li key={i} className="truncate">
                          <span className="font-medium text-gray-900">{e.jobTitle}</span>
                          <span className="text-gray-500"> • {e.company}</span>
                        </li>
                      ))}
                      {parsedResult.workExperiences.length > 3 && (
                        <li className="text-gray-400 italic">
                          +{parsedResult.workExperiences.length - 3} {t("common.others", "lainnya")}
                        </li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">{t("common.none", "Tidak ada")}</span>
                  )}
                </div>

                {/* Educations */}
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    {t("tabs.education", "Pendidikan")} ({parsedResult.educations?.length ?? 0})
                  </div>
                  {parsedResult.educations?.length > 0 ? (
                    <ul className="space-y-1.5 text-gray-600">
                      {parsedResult.educations.slice(0, 2).map((edu: any, i: number) => (
                        <li key={i} className="truncate">
                          <span className="font-medium text-gray-900">{edu.degree}</span>
                          <span className="text-gray-500"> • {edu.school}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">{t("common.none", "Tidak ada")}</span>
                  )}
                </div>
              </div>

              {/* Projects */}
              {parsedResult.projects && parsedResult.projects.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
                    {t("tabs.projects", "Proyek & Portofolio")} ({parsedResult.projects.length})
                  </div>
                  <div className="space-y-1.5">
                    {parsedResult.projects.map((p: any, i: number) => (
                      <div key={i} className="text-xs bg-blue-50/50 p-2 rounded border border-blue-100/60">
                        <div className="font-medium text-gray-900">{p.projectName}</div>
                        {p.technologies && (
                          <div className="text-[11px] text-blue-700/80 mt-0.5">{p.technologies}</div>
                        )}
                        {p.description && (
                          <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">{p.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {parsedResult.skills && parsedResult.skills.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    {t("tabs.skills", "Keahlian")} ({parsedResult.skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parsedResult.skills.slice(0, 16).map((s: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 border rounded text-[11px]"
                      >
                        {s.skillName}
                      </span>
                    ))}
                    {parsedResult.skills.length > 16 && (
                      <span className="text-[11px] text-gray-400 self-center pl-1">
                        +{parsedResult.skills.length - 16} {t("common.others", "lainnya")}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {parsedResult.certifications && parsedResult.certifications.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    {t("tabs.certs", "Sertifikasi")} ({parsedResult.certifications.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.certifications.slice(0, 4).map((c: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] truncate max-w-[280px]"
                        title={c.certificationName}
                      >
                        {c.certificationName}
                      </span>
                    ))}
                    {parsedResult.certifications.length > 4 && (
                      <span className="text-[11px] text-gray-500 self-center">
                        +{parsedResult.certifications.length - 4} {t("import_modal.more_certs", "sertifikat lainnya")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParsedResult(null)}
                disabled={createMutation.isPending}
              >
                ← {t("import_modal.reinput_btn", "Ubah Sumber / Input Ulang")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> {t("import_modal.saving_cv", "Menyimpan & Menyiapkan CV...")}
                  </>
                ) : (
                  <>
                    {t("import_modal.create_and_edit_btn", "Buat & Edit CV di Editor")} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
