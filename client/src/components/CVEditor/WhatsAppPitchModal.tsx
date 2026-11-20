import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  FileText,
  MailCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { FullCVData } from "@/types/cv";
import { toast } from "sonner";

interface WhatsAppPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: FullCVData;
}

export default function WhatsAppPitchModal({
  isOpen,
  onClose,
  cvData,
}: WhatsAppPitchModalProps) {
  const { t } = useI18n();
  const p = cvData.personalInfo;
  const fullName = p?.fullName || "Saya";
  const defaultRole = cvData.cv?.targetRole || "posisi yang dibuka";

  const [company, setCompany] = useState("");
  const [hrdName, setHrdName] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Generate 3 specialized HR WhatsApp pitches
  const pitches = useMemo(() => {
    const greeting = hrdName.trim()
      ? `Yth. Bapak/Ibu ${hrdName.trim()}`
      : "Yth. Tim Rekrutmen & HRD";
    const targetComp = company.trim() ? company.trim() : "perusahaan Bapak/Ibu";
    const targetRole = role.trim() ? role.trim() : "posisi yang tersedia";
    const contactPhone = p?.phone ? ` | No. HP/WA: ${p.phone}` : "";
    const portfolioLink = cvData.cv?.isPublic
      ? `\n📄 Portofolio Live: https://resumecraft-ai.josapratama.com/cv/public/${cvData.cv.shareSlug || cvData.cv.id}`
      : "";

    // 1. Direct Application via WhatsApp
    const directApply = `Selamat pagi/siang, ${greeting} ${targetComp}.

Perkenalkan, saya *${fullName}*. Sehubungan dengan informasi lowongan kerja untuk posisi *${targetRole}* di ${targetComp}, melalui pesan ini saya bermaksud mengajukan lamaran kerja.

Saya memiliki latar belakang di bidang ${targetRole} dengan keahlian utama dalam ${cvData.skills.slice(0, 3).map(s => s.skillName).join(", ")}. Bersama pesan ini, saya lampirkan berkas Curriculum Vitae (CV) terbaru saya untuk bahan pertimbangan.${portfolioLink}

Besar harapan saya untuk dapat berdiskusi lebih lanjut mengenai kontribusi yang dapat saya berikan. Terima kasih banyak atas waktu dan perhatian Bapak/Ibu.

Salam hormat,
*${fullName}*${contactPhone}`;

    // 2. Email Confirmation via WhatsApp
    const emailConfirm = `Selamat pagi/siang, ${greeting} ${targetComp}.

Perkenalkan, saya *${fullName}*. Melalui pesan ini, saya ingin mengonfirmasikan bahwa saya telah mengirimkan berkas lamaran kerja dan Curriculum Vitae (CV) untuk posisi *${targetRole}* melalui email${p?.email ? ` (${p.email})` : ""}.

Subjek Email: *Lamaran Pekerjaan - ${targetRole} - ${fullName}*

Saya sangat antusias untuk dapat berkontribusi di ${targetComp}. Apabila Bapak/Ibu memerlukan dokumen pelengkap tambahan, saya siap mengirimkannya sewaktu-waktu. Terima kasih banyak.

Salam hormat,
*${fullName}*`;

    // 3. Polite Post-Interview Follow-Up
    const interviewFollowUp = `Selamat pagi/siang, ${greeting} ${targetComp}.

Semoga Bapak/Ibu senantiasa dalam keadaan sehat. Perkenalkan kembali, saya *${fullName}* yang sebelumnya telah mengikuti sesi wawancara kerja untuk posisi *${targetRole}* di ${targetComp}.

Saya ingin mengucapkan terima kasih atas kesempatan diskusi yang sangat berharga kemarin. Melalui pesan ini, saya bermaksud menanyakan dengan santun mengenai perkembangan terkini atau tahapan selanjutnya dari proses rekrutmen tersebut.

Apabila ada informasi atau dokumen tambahan yang dibutuhkan dari saya, silakan beri tahu saya. Terima kasih banyak atas waktu dan bantuan Bapak/Ibu.

Salam hangat,
*${fullName}*`;

    return { directApply, emailConfirm, interviewFollowUp };
  }, [fullName, company, hrdName, role, cvData, p]);

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    toast.success(t("wa_pitch.copied_toast", "Format pesan WhatsApp berhasil disalin!"));
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSendWA = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-neutral-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                {t("wa_pitch.modal_title", "AI WhatsApp HRD Pitch & Konfirmasi Lamaran")}
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                {t("wa_pitch.modal_desc", "Susun pesan WhatsApp profesional, santun, dan siap kirim ke recruiter dalam 1 klik")}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/60">
          {/* Quick Input Parameters Card */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  {t("wa_pitch.company_label", "Nama Perusahaan")}
                </Label>
                <Input
                  placeholder="cth. PT GoTo, Telkom"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="mt-1 h-8 text-xs rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  {t("wa_pitch.hrd_label", "Nama Recruiter (Opsional)")}
                </Label>
                <Input
                  placeholder="cth. Budi / Sarah"
                  value={hrdName}
                  onChange={e => setHrdName(e.target.value)}
                  className="mt-1 h-8 text-xs rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  {t("wa_pitch.role_label", "Posisi Dilamar")}
                </Label>
                <Input
                  placeholder="cth. Frontend Developer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="mt-1 h-8 text-xs rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Tabs for 3 Pitch Styles */}
          <Tabs defaultValue="direct" className="space-y-3">
            <TabsList className="grid grid-cols-3 bg-neutral-200/70 p-1 rounded-xl h-auto">
              <TabsTrigger value="direct" className="text-xs py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-600 hidden xs:inline" />
                <span>{t("wa_pitch.tab_apply", "Kirim CV")}</span>
              </TabsTrigger>
              <TabsTrigger value="confirm" className="text-xs py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                <MailCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600 hidden xs:inline" />
                <span>{t("wa_pitch.tab_confirm", "Konfirmasi Email")}</span>
              </TabsTrigger>
              <TabsTrigger value="followup" className="text-xs py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-2xs">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-purple-600 hidden xs:inline" />
                <span>{t("wa_pitch.tab_followup", "Follow-Up")}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DIRECT APPLY */}
            <TabsContent value="direct" className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {t("wa_pitch.badge_apply", "Template Kirim CV Langsung")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(pitches.directApply, "direct")}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1"
                    >
                      {copiedTab === "direct" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTab === "direct" ? t("common.copied", "Tersalin") : t("common.copy", "Salin")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendWA(pitches.directApply)}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t("wa_pitch.btn_open_wa", "Buka di WA")}</span>
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {pitches.directApply}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: EMAIL CONFIRMATION */}
            <TabsContent value="confirm" className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {t("wa_pitch.badge_confirm", "Template Notifikasi Email")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(pitches.emailConfirm, "confirm")}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1"
                    >
                      {copiedTab === "confirm" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTab === "confirm" ? t("common.copied", "Tersalin") : t("common.copy", "Salin")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendWA(pitches.emailConfirm)}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t("wa_pitch.btn_open_wa", "Buka di WA")}</span>
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {pitches.emailConfirm}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: FOLLOW UP */}
            <TabsContent value="followup" className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {t("wa_pitch.badge_followup", "Template Follow-Up Santun")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(pitches.interviewFollowUp, "followup")}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1"
                    >
                      {copiedTab === "followup" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTab === "followup" ? t("common.copied", "Tersalin") : t("common.copy", "Salin")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSendWA(pitches.interviewFollowUp)}
                      className="h-7 text-xs px-2.5 rounded-lg gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t("wa_pitch.btn_open_wa", "Buka di WA")}</span>
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 font-mono text-xs text-neutral-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                  {pitches.interviewFollowUp}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-100 flex justify-end shrink-0">
          <Button
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl h-9 px-5"
          >
            {t("common.close", "Tutup")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
